# @wikialisa/swift-gateway

> WIKIALISA SWIFT Gateway — Bộ SDK đầy đủ cho tích hợp SWIFT Alliance: OAuth2, GPI Tracker, Pre-Validation, BIC Directory, PKI, Java Bridge, EVM/TRON escrow và Audit Compliance.

[![npm version](https://img.shields.io/npm/v/@wikialisa/swift-gateway.svg)](https://www.npmjs.com/package/@wikialisa/swift-gateway)
[![license](https://img.shields.io/badge/license-BSL--1.1-blue.svg)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](https://nodejs.org)

---

## Cài đặt

```bash
npm install @wikialisa/swift-gateway
# hoặc
pnpm add @wikialisa/swift-gateway
```

---

## Entry Points

Package xuất khẩu 6 entry points riêng biệt — import chính xác những gì cần:

| Entry | Mô tả |
|---|---|
| `@wikialisa/swift-gateway` | Barrel tổng hợp |
| `@wikialisa/swift-gateway/security` | OAuth2, LAU Signing, PKI |
| `@wikialisa/swift-gateway/clients` | GPI Tracker, Account Validation, BIC Directory |
| `@wikialisa/swift-gateway/bridge` | Java Bridge, Config Manager |
| `@wikialisa/swift-gateway/blockchain` | EVM / TRON provider |
| `@wikialisa/swift-gateway/audit` | Audit Compliance Explorer |

---

## Sử dụng

### Security — OAuth2 & LAU

```typescript
import { SwiftOAuthClient, LauHeaderSigner, PkiManager } from '@wikialisa/swift-gateway/security';

const oauth = new SwiftOAuthClient({
  clientId: process.env.SWIFT_CLIENT_ID!,
  clientSecret: process.env.SWIFT_CLIENT_SECRET!,
  tokenUrl: 'https://sandbox.swiftnet.sipn.swift.com/oauth2/v1/token',
});
const token = await oauth.getAccessToken();

const signer = new LauHeaderSigner({ secret: process.env.LAU_SECRET! });
const headers = signer.sign({ method: 'POST', path: '/v1/payments', body: '{}' });
```

### Clients — GPI Tracker & BIC Lookup

```typescript
import { GpiTrackerClient, BicDirectoryClient } from '@wikialisa/swift-gateway/clients';

const tracker = new GpiTrackerClient({ baseUrl: '...', accessToken: token.access_token });
const status = await tracker.getPaymentStatus('UETR-xxxx-xxxx-xxxx');

const bic = new BicDirectoryClient({ accessToken: token.access_token });
const record = await bic.lookup('DEUTDEDB');
```

### Bridge — Java JAR Utilities

```typescript
import { JavaBridge } from '@wikialisa/swift-gateway/bridge';

const bridge = new JavaBridge({ jarPath: './swift-validator.jar' });
const result = await bridge.execute('com.swift.Validator', ['--input', 'pacs.008.xml']);
```

### Blockchain — EVM Escrow

```typescript
import { EvmProvider } from '@wikialisa/swift-gateway/blockchain';

const provider = new EvmProvider({ rpcUrl: 'https://mainnet.infura.io/v3/...' });
```

### Audit — Compliance Explorer

```typescript
import { AuditComplianceExplorer } from '@wikialisa/swift-gateway/audit';

const explorer = new AuditComplianceExplorer();
const events = await explorer.query({ from: '2024-01-01', type: 'PAYMENT_SENT' });
```

---

## Biến môi trường

```env
SWIFT_CLIENT_ID=
SWIFT_CLIENT_SECRET=
SWIFT_TOKEN_URL=https://sandbox.swiftnet.sipn.swift.com/oauth2/v1/token
LAU_SECRET=
SWIFT_CERT_PATH=./certs/swift.crt
SWIFT_KEY_PATH=./certs/swift.key
```

---

## Yêu cầu

- **Node.js** >= 22
- **TypeScript** >= 5.0

---

## Giấy phép

[BSL-1.1](https://mariadb.com/bsl11/) — Copyright © 2024 AXQ Tech Holding JSC

## Liên kết

- 📦 [npm](https://www.npmjs.com/package/@wikialisa/swift-gateway)
- 🐛 [Issues](https://github.com/wikialisa/wikialisa/issues)
- 🏠 [Repository](https://github.com/wikialisa/wikialisa)
