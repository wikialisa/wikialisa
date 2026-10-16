# @wikialisa/sdk-swift

> SWIFT Alliance Gateway SDK — OAuth2, GPI Tracker, PKI, ISO 20022, EVM bridge dành cho ngân hàng và tổ chức tài chính.

[![npm version](https://img.shields.io/npm/v/@wikialisa/sdk-swift.svg)](https://www.npmjs.com/package/@wikialisa/sdk-swift)
[![license](https://img.shields.io/badge/license-BSL--1.1-blue.svg)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](https://nodejs.org)

---

## Tính năng

- 🔐 **OAuth2 / PKI** — Xác thực SWIFT Alliance Gateway với OAuth2 và quản lý chứng chỉ PKI
- ✍️ **LAU Signing** — Ký tiêu đề LAU (Local Authentication) chuẩn SWIFT
- 📨 **ISO 20022** — Parse và tạo message chuẩn pacs.008, camt.053
- 🌐 **GPI Tracker** — Theo dõi thanh toán xuyên biên giới qua SWIFT gpi
- 🔗 **EVM / Tron Bridge** — Tích hợp blockchain cho escrow xuyên biên giới
- 🔍 **UETR Tracker & Audit** — Tra cứu giao dịch và kiểm toán tuân thủ

---

## Cài đặt

```bash
npm install @wikialisa/sdk-swift
# hoặc
pnpm add @wikialisa/sdk-swift
# hoặc
yarn add @wikialisa/sdk-swift
```

**Yêu cầu:** Node.js >= 22

---

## Sử dụng nhanh

### OAuth2 — Xác thực SWIFT

```typescript
import { SwiftOAuthClient } from '@wikialisa/sdk-swift';

const oauth = new SwiftOAuthClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  tokenUrl: 'https://sandbox.swiftnet.sipn.swift.com/oauth2/v1/token',
  scope: 'swift.preval swift.gpi.tracker.readonly',
});

const token = await oauth.getAccessToken();
console.log(token.access_token);
```

### LAU Header Signing — Ký yêu cầu API

```typescript
import { LauHeaderSigner } from '@wikialisa/sdk-swift';

const signer = new LauHeaderSigner({
  lauApplicationId: 'MY_APP',
  lauVersion: '1.0',
  secret: process.env.LAU_SECRET!,
});

const headers = signer.sign({
  method: 'POST',
  path: '/swift/v1/payments',
  body: '{"amount":1000}',
  timestamp: new Date().toISOString(),
});
```

### ISO 20022 Parser — Xử lý message

```typescript
import { Iso20022Parser } from '@wikialisa/sdk-swift';

const parser = new Iso20022Parser();
const message = await parser.parsePacs008(xmlString);

console.log(message.groupHeader.messageId);
console.log(message.creditTransferTransactions[0].amount);
```

### GPI Tracker — Theo dõi giao dịch

```typescript
import { GpiTrackerClient } from '@wikialisa/sdk-swift';

const tracker = new GpiTrackerClient({
  baseUrl: 'https://sandbox.swiftnet.sipn.swift.com',
  accessToken: token.access_token,
});

const status = await tracker.getPaymentStatus('UETR-XXXX-XXXX-XXXX');
console.log(status.transactionStatus); // ACSC, PDNG, RJCT...
```

### PKI Certificate — Quản lý chứng chỉ

```typescript
import { PkiCertificateService } from '@wikialisa/sdk-swift';

const pki = new PkiCertificateService();
const bundle = await pki.loadCertificate({
  certPath: './certs/swift.crt',
  keyPath: './certs/swift.key',
});
```

### EVM Bridge — Escrow xuyên biên giới

```typescript
import { CrossBorderEscrowContract, EvmProviderService } from '@wikialisa/sdk-swift';

const provider = new EvmProviderService({ rpcUrl: 'https://mainnet.infura.io/v3/...' });
const escrow = new CrossBorderEscrowContract(provider, '0xContractAddress');

await escrow.lockFunds({ amount: '1000', currency: 'USDT', recipient: '0x...' });
```

---

## API Reference

### Lớp xuất khẩu

| Lớp / Type | Mô tả |
|---|---|
| `SwiftOAuthClient` | OAuth2 client cho SWIFT Alliance Gateway |
| `LauHeaderSigner` | Ký tiêu đề LAU theo chuẩn SWIFT |
| `PkiCertificateService` | Quản lý chứng chỉ PKI |
| `Iso20022Parser` | Parse XML ISO 20022 (pacs.008, camt.053) |
| `GpiTrackerClient` | Theo dõi giao dịch GPI |
| `AccountValidationClient` | Xác thực tài khoản ngân hàng |
| `BicDirectoryClient` | Tra cứu BIC/SWIFT code |
| `EvmProviderService` | Kết nối EVM blockchain |
| `TronProviderService` | Kết nối Tron blockchain |
| `CrossBorderEscrowContract` | Hợp đồng escrow xuyên biên giới |
| `UetrTxTrackerService` | Theo dõi giao dịch theo UETR |
| `AuditComplianceExplorer` | Kiểm toán và tuân thủ |
| `JavaBridgeAdapter` | Gọi JAR utility của SWIFT qua child_process |
| `FileEncryptorAdapter` | Mã hóa file AES-256-CBC |

---

## Biến môi trường

```env
# SWIFT OAuth2
SWIFT_CLIENT_ID=
SWIFT_CLIENT_SECRET=
SWIFT_TOKEN_URL=https://sandbox.swiftnet.sipn.swift.com/oauth2/v1/token

# LAU
LAU_SECRET=

# PKI
SWIFT_CERT_PATH=./certs/swift.crt
SWIFT_KEY_PATH=./certs/swift.key

# Blockchain (tùy chọn)
EVM_RPC_URL=
TRON_FULL_NODE=
```

---

## Yêu cầu hệ thống

- **Node.js** >= 22
- **TypeScript** >= 5.0 (nếu dùng TypeScript)
- **Môi trường**: SWIFT Alliance Access hoặc SWIFT Alliance Lite2

---

## Giấy phép

[Business Source License 1.1 (BSL-1.1)](https://mariadb.com/bsl11/)

Copyright © 2024 AXQ Tech Holding JSC <dev@axvn.vn>

---

## Liên kết

- 📦 [npm](https://www.npmjs.com/package/@wikialisa/sdk-swift)
- 🐛 [Báo lỗi](https://github.com/wikialisa/wikialisa/issues)
- 🏠 [Trang chủ](https://github.com/wikialisa/wikialisa#readme)
- 🏢 [AXQ Tech Holding JSC](https://axvn.vn)
