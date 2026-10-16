---
name: deploy-check
description: '# /deploy-check'
metadata:
  user-invocable: true
  disable-model-invocation: true
---

# /deploy-check

Chạy checklist đầy đủ trước khi deploy bất kỳ service nào trong hệ sinh thái Wikialisa/AXQ.

## Hướng dẫn thực thi

Khi lệnh này được gọi, hỏi user muốn deploy service/app nào, sau đó chạy checklist tương ứng. Nếu không chỉ định, chạy toàn bộ checklist.

---

### Bước 1 — Kiểm tra Smart Contract Program IDs

```
grep -rn "declare_id!\|ESCRw1111\|MINTg1111\|SWFTb1111" programs/ --include="*.rs"
```

**Cờ đỏ:** Nếu Program ID vẫn là placeholder (`111...`), smart contracts chưa được deploy thật. Không được deploy frontend/services phụ thuộc vào contracts này lên mainnet.

Kiểm tra `Anchor.toml` để xác nhận cluster target (devnet/mainnet-beta):

```
grep -n "cluster\|program" Anchor.toml
```

---

### Bước 2 — Kiểm tra Environment Variables

Đọc `.env.example` (nếu tồn tại) hoặc quét các env vars được reference trong code:

```
grep -rn "process\.env\." services/ packages/ --include="*.ts" | grep -v "node_modules" | sed 's/.*process\.env\.\([A-Z_]*\).*/\1/' | sort -u
```

**Checklist bắt buộc cho production:**

| Nhóm | Biến | Trạng thái |
|---|---|---|
| Solana | `SOLANA_RPC_MAINNET`, `ANCHOR_WALLET` | ✅/❌ |
| EVM | `APPCHAIN_RPC`, `APPCHAIN_CHAIN_ID` | ✅/❌ |
| SWIFT | `SWIFT_LAU_KEY`, `SWIFT_BIC_CODE`, `SWIFT_CONSUMER_KEY`, `SWIFT_CONSUMER_SECRET`, `SWIFT_MGW_URL` | ✅/❌ |
| FX Oracle | `SBV_API_KEY`, `SBV_FX_API_URL`, `VIETCOMBANK_FX_API` | ✅/❌ |
| Bridge | `BRIDGE_CONTRACT_ADDRESS`, `RELAYER_PRIVATE_KEY`, `AXVN_INTERNAL_WEBHOOK_SECRET` | ✅/❌ |
| Mail | `STALWART_HOSTNAME`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | ✅/❌ |
| Redis | `REDIS_URL` | ✅/❌ |
| Security | `BANK_WEBHOOK_SECRET` | ✅/❌ |

**Cờ đỏ:** Bất kỳ biến nào còn là placeholder như `your_key_here`, `changeme`, `localhost` trong production env.

---

### Bước 3 — Kiểm tra Docker Compose Stack

```
cat deploy/docker/docker-compose.yml 2>/dev/null || echo "FILE NOT FOUND"
```

Kiểm tra:
- Tất cả services có `healthcheck` không?
- Không có `ports` expose trực tiếp ra ngoài trừ những port cần thiết (SWIFT MGW `:9003` phải internal only)
- `mock-mgw` service phải bị tắt (hoặc không có trong production compose)
- Volume mounts cho keystores/certs có đúng path không?

---

### Bước 4 — Kiểm tra Subdomain Mapping (11 domains)

Xác nhận tất cả 11 subdomain đã được config:

| Domain | Service | Port | Status |
|---|---|---|---|
| `holding.axvn.vn` | `holding-admin-portal` | :3006 | ✅/❌ |
| `id.axvn.vn` | `id-fiat-gateway` | :3001 | ✅/❌ |
| `pay.axvn.vn` | `pay-portal` | :3002 | ✅/❌ |
| `scan.axvn.vn` | `explorer-vnkrscan` | :3003 | ✅/❌ |
| `swap.axvn.vn` | `swap-dex` | :3004 | ✅/❌ |
| `dao.axvn.vn` | `dao-portal` | :3005 | ✅/❌ |
| `dev-api.axvn.vn` | `fiat-connector-api` | :4001 | ✅/❌ |
| `otc.axvn.vn` | `otc-liquidity-engine` | :4002 | ✅/❌ |
| `treasury-subgraph-api.axvn.vn` | `indexer-subgraph` | :4003 | ✅/❌ |
| `mail.axvn.vn` | `mail-server (Stalwart)` | 25/465/587/993/8080 | ✅/❌ |

Kiểm tra Terraform config:

```
cat deploy/terraform/main.tf 2>/dev/null | grep -A2 "subdomain\|dns\|cloudflare" | head -60
```

---

### Bước 5 — Kiểm tra Security Blockers (từ AUDIT.md)

```
grep -c "ignoreBuildErrors: true\|ignoreDuringBuilds: true" apps/app-web/next.config.mjs
```

Nếu count > 0 → **DEPLOY BỊ CHẶN** cho `app-web`. TypeScript errors đang bị suppress.

```
grep -rn "MOCK_OTP\|CORRECT_PIN\|\"0000\"\|Demo.*PIN" apps/app-web/src/ --include="*.tsx"
```

Nếu tìm thấy → **DEPLOY BỊ CHẶN**. Hardcoded credentials không được phép lên production.

---

### Bước 6 — Kiểm tra SWIFT Keystore

```
ls -la services/swift-gateway/keystore/ 2>/dev/null || echo "KEYSTORE NOT INITIALIZED"
```

Nếu keystore chưa tồn tại, nhắc chạy:

```bash
bash scripts/setup-mgw-keystore.sh
```

---

### Bước 7 — Tổng hợp Deployment Readiness Report

Xuất bảng tổng hợp:

```
┌─────────────────────────────────────────────────────────────────┐
│  WIKIALISA DEPLOYMENT READINESS REPORT                          │
├─────────────────┬───────────────────────────────────────────────┤
│  Smart Contracts│  ✅ Deployed / ❌ Placeholder IDs             │
│  Env Vars       │  ✅ Complete / ⚠️ N missing                   │
│  Docker Stack   │  ✅ OK / ❌ Issues found                      │
│  Subdomains     │  ✅ 11/11 / ⚠️ N/11 configured               │
│  Security       │  ✅ Clean / ❌ Blockers found                 │
│  SWIFT Keystore │  ✅ Ready / ❌ Not initialized                │
└─────────────────┴───────────────────────────────────────────────┘
```

Nếu có bất kỳ ❌ → **KHÔNG DEPLOY** và liệt kê các action cần làm trước.

---

### Bước 8 — Hỏi muốn tiếp tục không

Nếu tất cả ✅ → hỏi có muốn trigger deploy không và service/app nào.
Nếu có ❌ → hỏi có muốn fix ngay những blocker nào.
