---
name: wikialisa-swift-bridge
description: Use when the user wants to implement, extend, or debug any part of the SWIFT integration in Wikialisa — covers MT103/MT202/MT940 message handling, pacs.008/pacs.009/camt.053 ISO 20022, LAU HMAC signing, FX Oracle, bi-directional relayer logic, and the swift-gateway/swift-chain-bridge services.
---

# Wikialisa SWIFT Bridge — Implementation Guide

Khi skill này được kích hoạt, hãy tuân thủ toàn bộ kiến trúc và pattern sau khi viết hoặc review bất kỳ phần nào của SWIFT integration.

---

## 1. Kiến trúc Tổng quan — Luồng Bi-Directional

```
INBOUND  (Fiat SWIFT → Mint AXQ on-chain):
  SWIFT Net → MGW (JVM :9003) → swift-gateway (Node :4004)
    → POST /internal/swift/inbound-credit
    → swift-chain-bridge/listeners/swift-webhook.ts
    → SwiftChainBridgeRelayer.handleSwiftInbound()
    → AXVNBrokerFXOracle.getFullFXRate()        ← Lấy tỷ giá SBV/Vietcombank
    → ChainExecutor.settleInboundWithFX()       ← Gọi AXVNSwiftBridgeV2.sol
    → Mint AXQ cho beneficiary (net) + Treasury (fee)

OUTBOUND (Burn AXQ → SWIFT Fiat):
  User → AXVNSwiftBridgeV2.requestOutboundSwiftV2() → Burn AXQ
    → SwiftOutboundRequestedV2 event emitted
    → OnChainListener.startListening() bắt event
    → SwiftChainBridgeRelayer.handleChainOutbound()
    → SwiftExecutor.sendMT103()                 ← Gửi điện SWIFT qua MGW
    → ChainExecutor.confirmOutbound()           ← Confirm on-chain
    (Nếu SWIFT fail → ChainExecutor.refundOutbound())
```

**File chủ chốt cần đọc trước khi viết code mới:**
- `services/swift-chain-bridge/src/relayer.ts`
- `services/swift-chain-bridge/src/fx-oracle.ts`
- `programs/AXVN-swift-bridge/evm/VNKRSwiftBridgeV2.sol`
- `packages/swift-adapter/src/` (MT parsers, ISO 20022 builders, LAU signing)

---

## 2. SWIFT Message Types — Khi nào dùng loại nào

| Message | Dùng cho | Direction |
|---|---|---|
| **MT103** | Customer credit transfer (wire transfer quốc tế) | INBOUND + OUTBOUND |
| **MT202** | Bank-to-bank cover payment (institutional) | OUTBOUND institutional |
| **MT940** | Account statement / reconciliation | INBOUND (bank feed) |
| **pacs.008** | ISO 20022 thay thế MT103 | INBOUND (modern banks) |
| **pacs.009** | ISO 20022 thay thế MT202 | OUTBOUND institutional |
| **camt.053** | ISO 20022 thay thế MT940 | INBOUND (account statement) |

**Rule:** Khi nhận message inbound, kiểm tra `messageType` field để xác định format:

```typescript
if (payload.messageType === "pacs.008") {
  // ISO 20022 path
  const currency = (payload as Pacs008Payload).currency ?? "USD";
} else {
  // MT103 path — default USD
  const currency = "USD";
}
```

---

## 3. LAU HMAC Signing — Bắt buộc cho mọi request đến MGW

LAU (Local Authentication) là cơ chế xác thực request đến SWIFT Microgateway. **Mọi HTTP request đến MGW phải được ký LAU.**

```typescript
import { signLAU } from "@vnkr/swift-adapter"; // packages/swift-adapter/src/security/lau.ts

const lauSignature = signLAU({
  method: "POST",
  path: "/v1/payments/mt103",
  body: JSON.stringify(requestBody),
  key: process.env.SWIFT_LAU_KEY!,   // Lấy từ env — KHÔNG hardcode
  timestamp: new Date().toISOString(),
});

headers["X-LAU-Signature"] = lauSignature;
headers["X-LAU-Timestamp"] = timestamp;
```

**Không bao giờ:**
- Hardcode `SWIFT_LAU_KEY` trong code
- Skip LAU signing cho bất kỳ request nào (dù là dev/test)
- Dùng mock-mgw trong production

---

## 4. FX Oracle — Pattern sử dụng đúng

```typescript
import { AXVNBrokerFXOracle } from "./fx-oracle.js";

const oracle = new AXVNBrokerFXOracle(); // TTL cache 5 phút mặc định

// Lấy tỷ giá đầy đủ (kèm source để audit)
const fxResult = await oracle.getFullFXRate("USD");
// fxResult.rateToVnd = 25450
// fxResult.source = "SBV" | "VIETCOMBANK" | "FALLBACK"
// fxResult.timestamp = Unix ms

// Tính breakdown conversion
const breakdown = await oracle.computeConversion({
  originalAmount: 1000,     // 1000 USD
  currency: "USD",
  bridgeFeeBps: 10,         // 0.1% — lấy từ contract
  baseGasFeeAxvn: 10_000,   // 10,000 AXQ — lấy từ contract
});
// breakdown.grossAxvn, breakdown.netAxvn, breakdown.totalFeeAxvn
```

**Rule quan trọng:**
- Luôn log `fxResult.source` để audit trail
- Nếu source là `"FALLBACK"` → log warning, xem xét circuit breaker
- **Không** gọi SBV/Vietcombank API trực tiếp từ bất kỳ chỗ nào khác — chỉ qua `AXVNBrokerFXOracle`
- Nếu cần Chainlink feed production: set `CHAINLINK_FX_FEED_ADDRESS` trong env

---

## 5. UETR — Unique End-to-End Transaction Reference

UETR là UUID v4 duy nhất cho mỗi giao dịch SWIFT, dùng để:
- Idempotency (chống duplicate processing)
- SWIFT gpi tracking
- On-chain record lookup

```typescript
import { generateUETR } from "@vnkr/swift-adapter"; // packages/swift-adapter/src/utils/uetr.ts

// Tạo UETR mới cho outbound
const uetr = generateUETR(process.env.SWIFT_GPI_UETR_PREFIX);
// Format: "AXVN-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"

// Hash cho on-chain lookup (EVM)
const uetrHash = keccak256(encodePacked(["string"], [uetr]));

// Validate UETR inbound
import { isValidUETR } from "@vnkr/swift-adapter";
if (!isValidUETR(payload.uetr)) throw new Error("Invalid UETR format");
```

---

## 6. Relayer — Pattern viết handler mới

Khi thêm handler mới vào `SwiftChainBridgeRelayer`:

```typescript
// Pattern bắt buộc: log đầu vào, try/catch rõ ràng, log kết quả
async handleNewAction(
  payload: SomePayload,
  logger: { info: (msg: string) => void; error: (msg: string, ...a: unknown[]) => void }
): Promise<{ txHash: string; blockNumber: number }> {
  logger.info(`[relayer] ACTION  uetr=${payload.uetr}  amount=${payload.amount}`);

  try {
    const result = await this.chainExec.someMethod(payload);
    logger.info(`[relayer] ✅ ACTION completed  txHash=${result.txHash}`);
    return result;
  } catch (err) {
    logger.error("[relayer] ❌ ACTION failed", err);
    throw err;  // propagate — caller quyết định retry/refund
  }
}
```

**Nguyên tắc relayer:**
- Mọi inbound: FX Oracle → compute → settle on-chain
- Mọi outbound: SWIFT send → confirm on-chain; nếu SWIFT fail → refund on-chain
- Backfill: implement để replay events bị bỏ lỡ khi restart
- Không bao giờ silent-fail: mọi error phải được log và propagate

---

## 7. swift-gateway vs swift-chain-bridge — Phân biệt trách nhiệm

| Service | Trách nhiệm | Không được làm |
|---|---|---|
| `services/swift-gateway` | Xác thực LAU, định tuyến request đến MGW JVM, nhận webhook từ MGW | Mint/burn token, FX calculation |
| `services/swift-chain-bridge` | FX Oracle, relay SWIFT↔on-chain, mint/burn execution | Trực tiếp connect MGW (phải qua swift-gateway) |
| `packages/swift-adapter` | MT/ISO 20022 parsers, LAU signing, SWIFT API client | Business logic, database access |

---

## 8. Environment Variables Bắt buộc

Khi viết code liên quan SWIFT, kiểm tra các env vars này đều được đọc từ `process.env` — **không hardcode**:

```typescript
// swift-gateway
SWIFT_LAU_KEY          // LAU HMAC key — sensitive
SWIFT_BIC_CODE         // BIC11 của tổ chức
SWIFT_CONSUMER_KEY     // OAuth2 client key
SWIFT_CONSUMER_SECRET  // OAuth2 client secret
SWIFT_MGW_URL          // http://localhost:9003 (internal sidecar)
SWIFT_MGW_APIKEY       // MGW API key

// swift-chain-bridge
BRIDGE_CONTRACT_ADDRESS   // AXVNSwiftBridgeV2 address
RELAYER_PRIVATE_KEY       // Signing key cho on-chain tx — sensitive, dùng KMS production
AXVN_INTERNAL_WEBHOOK_SECRET // Verify webhook từ swift-gateway
SBV_API_KEY              // SBV FX API
SBV_FX_API_URL           // SBV endpoint
VIETCOMBANK_FX_API       // Vietcombank XML feed URL
BRIDGE_FEE_BPS           // Default 10 (0.1%)
DEFAULT_BASE_GAS_FEE_AXVN // Default 10000 AXQ
SWIFT_GPI_UETR_PREFIX    // "AXVN" prefix cho UETR generation
```

---

## 9. Test Pattern — Mock MGW

Khi viết tests cho SWIFT flow, dùng `services/mock-mgw` thay vì hit SWIFT network thật:

```typescript
// .env.test
SWIFT_MGW_URL=http://localhost:9003  // mock-mgw port
SWIFT_MGW_APIKEY=mock-key

// Khởi động mock-mgw trước khi chạy integration tests
// docker compose -f deploy/docker/docker-compose.yml up mock-mgw
```

**Không bao giờ** dùng production SWIFT credentials trong test environment.

---

## 10. Checklist trước khi submit code SWIFT

- [ ] LAU signing được apply cho mọi request đến MGW
- [ ] UETR được validate trước khi xử lý (isValidUETR)
- [ ] UETR idempotency check trước khi process (kiểm tra record tồn tại chưa)
- [ ] FX rate luôn đọc qua `AXVNBrokerFXOracle`, không gọi API trực tiếp
- [ ] FX source được log cho audit trail
- [ ] Mọi relayer handler có try/catch và log ✅/❌ rõ ràng
- [ ] Outbound failure path có refund on-chain
- [ ] Không có credentials hardcode — tất cả từ `process.env`
- [ ] Production key management plan: `RELAYER_PRIVATE_KEY` và `SWIFT_LAU_KEY` cần HSM/KMS
