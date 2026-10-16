# AXQ Tech Holding — Master Roadmap

> **Phiên bản:** v1.0 · Cập nhật: 2026  
> **Phạm vi:** Enterprise Monorepo — pnpm + Turborepo + Anchor/Solana/EVM  
> **Hệ sinh thái:** 8 pháp nhân · 11 apps · 9 services · 14 packages · 5 Solana programs

---

## Mục Lục

1. [Tổng Quan Hệ Sinh Thái](#1-tổng-quan-hệ-sinh-thái)
2. [Kiến Trúc Monorepo](#2-kiến-trúc-monorepo)
3. [Luồng Dữ Liệu Hệ Thống](#3-luồng-dữ-liệu-hệ-thống)
4. [Lộ Trình Kỹ Thuật](#4-lộ-trình-kỹ-thuật)
5. [Design System — AXQ UI/UX](#5-design-system--axq-uiux)
6. [Bảo Mật & Kiểm Toán](#6-bảo-mật--kiểm-toán)
7. [Hạ Tầng DevOps](#7-hạ-tầng-devops)

---

## 1. Tổng Quan Hệ Sinh Thái

AXQ Tech Holding là **hệ sinh thái FinTech + Blockchain** tích hợp:

- **SWIFT Interbank Network** — MT103/MT202/pacs.008 relay, LAU signing, MGW 2.0
- **Solana App-Chain** — Anchor programs, P2P Escrow, AMM, RBS Treasury
- **EVM App-Chain** — SWIFT Bridge contracts, VNKRSwiftBridgeV2.sol
- **Web3 Wallet** — Next.js PWA, Solana + EVM wallets, KYC/eKYC flow
- **Institutional OTC** — VARA Compliance, FX Oracle, Liquidity Engine

### 8 Pháp Nhân & Domain

| Pháp Nhân | Domain | Vai Trò |
|---|---|---|
| **AXQ TECH HOLDING JSC** | `holding.axvn.vn` | IP Asset, Mint/Burn AXQ, Core SDK |
| **AXQ FinTech Services JSC** | `app.axvn.vn` · `id.axvn.vn` · `pay.axvn.vn` | Wallet, P2P Escrow, Fiat Gateway |
| **AXQ Blockchain Network Ltd.** | `scan.axvn.vn` | App-Chain Explorer, Proof of Reserve |
| **AXQ Infra & Network Ltd.** | `mail.axvn.vn` | Stalwart Mail Server |
| **AXQ Digital Twin & AI Labs** | `lab.axvn.vn` | Digital Twin, Dune Bots |
| **AXQ Global Ventures Pte. Ltd.** | `swap.axvn.vn` | AMM DEX, Liquidity Router |
| **AXQ Capital & Foundation Ltd.** | `dao.axvn.vn` | Treasury RBS, Governance DAO |
| **AXQ Labs MENA / FZE** | `otc.axvn.vn` | Institutional OTC, VARA Compliance |

---

## 2. Kiến Trúc Monorepo

```

├── apps/                     # 11 Next.js apps + 1 Node app
│   ├── app-web/              # Ví & Crypto (app.axvn.vn :3010)
│   ├── id-fiat-gateway/      # P2P Escrow + KYC (id.axvn.vn :3001)
│   ├── pay-portal/           # Payment Gateway (pay.axvn.vn :3002)
│   ├── explorer-vnkrscan/    # Block Explorer (scan.axvn.vn :3003)
│   ├── swap-dex/             # AMM DEX (swap.axvn.vn :3004)
│   ├── dao-portal/           # Governance (dao.axvn.vn :3005)
│   ├── holding-admin-portal/ # IP Admin (holding.axvn.vn :3006)
│   ├── digital-twin-engine/  # R&D Node (lab.axvn.vn :3007)
│   ├── kyc-portal/           # eKYC (kyc.axvn.vn :3013)
│   ├── merchant-portal/      # Merchant (merchant.axvn.vn :3011)
│   └── sandbox-dashboard/    # SupTech (sandbox.axvn.vn :3012)
│
├── packages/                 # 14 shared libraries & SDKs
│   ├── types/                # @wikialisa/types — shared TS types
│   ├── config/               # @wikialisa/config — env, Program IDs, RPC
│   ├── ui-kit/               # @wikialisa/ui-kit — Design System
│   ├── core-sdk/             # @wikialisa/core-sdk — Solana/EVM Web3
│   ├── web3-config/          # @wikialisa/web3-config — ABIs, Viem clients
│   ├── contracts/            # @wikialisa/contracts — EVM ABIs & addresses
│   ├── swift-core/           # @wikialisa/swift-core — MT/MX, LAU, Redis bus
│   ├── swift-gateway/        # @wikialisa/swift-gateway — OAuth2, GPI, PKI
│   ├── sdk-swift/            # @wikialisa/sdk-swift — SWIFT Alliance SDK
│   ├── merchant-sdk/         # @wikialisa/merchant-sdk — Partner SDK
│   └── db/                   # @wikialisa/db — PostgreSQL helpers
│
├── programs/                 # 5 Solana Anchor / EVM contracts
│   ├── p2p-escrow/           # make_offer, take_offer, cancel_offer
│   ├── mint-governance/      # Mint/Burn, IP Escrow, Whitelist
│   ├── amm-swap/             # Liquidity Pool, Fee Sharing
│   ├── treasury-rbs/         # Range Bound Stability, DAO
│   └── swift-bridge/         # SWIFT ↔ Solana + EVM bridge
│
└── services/                 # 9 Node.js microservices
    ├── api-gateway/          # Central REST API (:5000)
    ├── swift-gateway/        # SWIFT Messaging (:4002)
    ├── swift-chain-bridge/   # SWIFT ↔ Blockchain Relayer (:4003)
    ├── fiat-connector-api/   # Bank Webhook (:4001)
    ├── indexer-subgraph/     # Subgraph Indexer (:4004)
    ├── otc-liquidity-engine/ # OTC Engine (:4005)
    ├── dune-alert-bots/      # Telegram/Discord Bots (:4006)
    ├── mock-mgw/             # Mock SWIFT MGW dev (:4007)
    └── role-engine/          # Leadership Automation Worker
```

### Dependency Graph Packages

```
@wikialisa/types ──────────────────────── (no deps)
@wikialisa/config ─────────────────────── (no deps)
          │
          ├── @wikialisa/db
          ├── @wikialisa/web3-config ← viem
          ├── @wikialisa/ui-kit ← react (peer)
          ├── @wikialisa/core-sdk ← anchor, solana, viem
          ├── @wikialisa/contracts ← openzeppelin
          ├── @wikialisa/swift-core ← ioredis, zod, uuid
          ├── @wikialisa/merchant-sdk ← axios
          │
          └── @wikialisa/sdk-swift ← axios, ethers, viem
              @wikialisa/swift-gateway ← axios, viem
                          │
                    apps/* & services/*
```

---

## 3. Luồng Dữ Liệu Hệ Thống

### 3.1 Luồng P2P Escrow & Fiat

```
User (app-web / id-fiat-gateway)
  → KYC: kyc-portal → eKYC VNeID + ZKP
  → Tạo lệnh: programs/p2p-escrow (Vault PDA, Solana)
  → Xác nhận Fiat: services/fiat-connector-api ← Bank webhook
  → Giải phóng AXQ: Smart Contract → transfer token
  → Email: mailer.ts → Stalwart SMTP (mail.axvn.vn)
```

### 3.2 Luồng SWIFT Liên Ngân Hàng

```
Outbound:
  otc-liquidity-engine / fiat-connector
  → XADD vnkr:swift:outbound (Redis Stream)
  → services/swift-gateway/src/bridge.ts XREADGROUP
  → buildMT103 / buildPacs008 (@wikialisa/swift-core)
  → LAUSigner.sign() → MGWClient.forwardMessage()
  → SWIFT Microgateway (JVM sidecar :9003)
  → SWIFT Network

Inbound (ACK):
  MGW webhook → swift-gateway/src/index.ts
  → XADD vnkr:swift:inbound
  → fiat-connector-api → credit VND balance
```

### 3.3 Luồng SWIFT ↔ On-Chain Bridge

```
swift-chain-bridge/src/listeners/swift-webhook.ts
  → Detect SwiftOutboundRequested event (EVM log)
  → swift-executor.ts → POST swift-gateway:4002/api/v1/swift/send-mt103
  → swift-gateway → SWIFT Network
  → chain-executor.ts → Mint / Release AXQ token
  → programs/swift-bridge/solana (Anchor) + /evm (Solidity)
```

### 3.4 Luồng DEX / Swap

```
apps/swap-dex (swap.axvn.vn)
  → @wikialisa/core-sdk (Solana wallet)
  → programs/amm-swap (Concentrated Liquidity)
  → apps/dao-portal → programs/treasury-rbs (RBS parameters)
```

---

## 4. Lộ Trình Kỹ Thuật

### Giai Đoạn 1 — Nền Tảng (DONE ✅)

- [x] Chuẩn hoá monorepo: pnpm workspace, Turborepo, catalog versions
- [x] `tsconfig.base.json` root, ESLint config thống nhất
- [x] Fix workspace package name conflict (`@wikialisa/swift-gateway`)
- [x] Đồng bộ Next.js `^14.2.0` toàn bộ 10 apps
- [x] Xóa `output: "export"` — cho phép SSR, API Routes, Server Actions
- [x] Migrate `swift-adapter` → `@wikialisa/swift-core` (deprecated packages xóa)
- [x] Xoá `packages/swift`, `packages/swift-adapter`, `packages/sdk-internal`
- [x] `programs/swift-bridge` đưa vào Anchor.toml workspace
- [x] `services/api-gateway` redis `^4` → `^5`
- [x] `.npmrc` GitHub Packages + WSL1 compatibility (`node-linker=hoisted`)
- [x] `.env` dev với giá trị localhost
- [x] `ecosystem.dev.cjs` — PM2 dev mode (ts-node-dev + next dev)
- [x] Test suite `@wikialisa/swift-core` — 115 tests, 7 files ✅
- [x] README.md cập nhật đầy đủ 19 subdomains, dependency graph

### Giai Đoạn 2 — Core Features (IN PROGRESS 🔄)

- [ ] `pnpm install` hoàn chỉnh toàn workspace (WSL1 rename issue)
- [ ] `pnpm dev` chạy được tất cả apps
- [ ] `@wikialisa/ui-kit` — component library đầy đủ: PINPad, CardVisual, QRDisplay, WalletCard
- [ ] `apps/app-web` — 24 màn hình Phase 1 & 2 hoàn chỉnh
- [ ] `apps/kyc-portal` — VNeID integration, ZKP attestation flow
- [ ] `services/api-gateway` — tất cả 17 REST endpoints
- [ ] `programs/p2p-escrow` — integration test trên Devnet
- [ ] `programs/swift-bridge` — deploy Devnet, cập nhật Anchor.toml addresses

### Giai Đoạn 3 — Integration & Compliance

- [ ] SWIFT MGW 2.0.17 keystore setup (`scripts/setup-mgw-keystore.sh`)
- [ ] SWIFT GPI Tracker tích hợp (`@wikialisa/sdk-swift`)
- [ ] eKYC VNeID API integration (`apps/kyc-portal`)
- [ ] VARA Compliance module (`services/otc-liquidity-engine`)
- [ ] Dune Analytics dashboard (`services/dune-alert-bots`)
- [ ] Proof of Reserve on-chain (`apps/explorer-vnkrscan`)
- [ ] `programs/treasury-rbs` — Range Bound Stability parameters

### Giai Đoạn 4 — Production Launch

- [ ] Mainnet deploy tất cả 5 Solana programs
- [ ] Cập nhật Anchor.toml program addresses (thay placeholder `111...`)
- [ ] Docker Compose production stack hoàn chỉnh
- [ ] Kubernetes Helm charts (`deploy/kubernetes/`)
- [ ] Terraform IaC — AWS ECS/ECR + Cloudflare WAF (`deploy/terraform/`)
- [ ] CI/CD GitHub Actions: ci-test, publish-npm-scopes, publish-docker
- [ ] Security audit tất cả smart contracts
- [ ] Bug bounty program

---

## 5. Design System — AXQ UI/UX

### Stack

```
Framework : Next.js 14 · React 18 · TypeScript
UI Kit    : @wikialisa/ui-kit (AXQ Design System v2.0)
Styling   : Tailwind CSS v3
Font      : Work Sans (Google Fonts)
Platform  : Mobile-first PWA (390×844) → Web
```

### Brand Colors

| Token | Hex | Vai Trò |
|---|---|---|
| `brand/teal` | `#49DBC8` | Accent chủ đạo — logo, highlight |
| `brand/green` | `#BEFF6C` | Success accent |
| `brand/orange` | `#FC7339` | Warning / CTA phụ |
| `brand/purple` | `#AF96FB` | Governance / DAO |
| `brand/yellow` | `#FFF172` | Reward / Yield indicator |
| `greyscale/900` | `#101426` | Primary text |
| `black` | `#000000` | Brand primary background |

### Typography (Work Sans)

| Style | Size | Weight |
|---|---|---|
| H1 | 96px | 400–700 |
| H2 | 60px | 400–700 |
| H3 | 48px | 400–700 |
| H4–H6 | 34–20px | 400–600 |
| Body | 16px | 400–500 |
| Body Small | 14px | 400–500 |
| Caption | 12px | 400 |

### App Screens — 8 Zones

| Zone | Tên | Screens |
|---|---|---|
| Zone 1 | Onboarding & Auth | 14 (Splash, OTP, PIN, Passkey) |
| Zone 2 | KYC & Compliance | 10 (eKYC, Doc Scan, Liveness, FATCA) |
| Zone 3 | Home & Dashboard | 7 (Balance, Cashback, Analytics) |
| Zone 4 | Card Management | 9 (Virtual/Physical, Top-up, CVV) |
| Zone 5 | Crypto & Web3 | 10 (Portfolio, Swap, Staking) |
| Zone 6 | Transfer & Payments | 9 (QR, Receipt, Tx Auth) |
| Zone 7 | Profile & Settings | 8 (Security, Banks, Notifications) |
| Zone 8 | System States | 8 (Offline, Error, Jailbreak) |

### Components To Build

```
PINPad         — 6-dot display + numpad (animated)
CardVisual     — 3D flip animation (Virtual/Physical)
QRDisplay      — generate + zoom + network picker
LivenessFrame  — camera overlay (active liveness KYC)
GasFeeSelector — slow / average / fast gas presets
WalletCard     — balance display + token list
SwapWidget     — token swap with slippage control
```

---

## 6. Bảo Mật & Kiểm Toán

### Các Lớp Bảo Mật

| Lớp | Cơ Chế | Trạng Thái |
|---|---|---|
| **SWIFT Auth** | LAU HMAC-SHA256, constant-time verify | ✅ Implemented (`@wikialisa/swift-core`) |
| **RMA Registry** | Sender/receiver authorisation, expiry check | ✅ Implemented + tested |
| **JWT Auth** | HS256, refresh token rotation | 🔄 `services/api-gateway` |
| **KYC/AML** | VNeID eKYC, ZKP attestation | ⏳ `apps/kyc-portal` |
| **Smart Contract** | Anchor constraints, CPI guards | ⏳ Audit pending |
| **CORS / Helmet** | Configured in api-gateway | 🔄 In progress |
| **Rate Limiting** | `express-rate-limit` api-gateway | 🔄 In progress |
| **Mobile Security** | Screenshot blocker, Jailbreak detect | ⏳ Phase 2 |

### Audit Status (AGENT.md)

| Severity | Count |
|---|---|
| CRITICAL | 4 |
| HIGH | 6 |
| MEDIUM | 12 |
| LOW | 18 |

---

## 7. Hạ Tầng DevOps

### Package Manager

```
packageManager : pnpm@9.15.9
node           : >=22.0.0
typescript     : ^5.7.2
```

### Build Pipeline (Turborepo)

```
@wikialisa/types → @wikialisa/config
  → @wikialisa/db, web3-config, ui-kit, core-sdk, contracts, swift-core, merchant-sdk
    → @wikialisa/sdk-swift, swift-gateway
      → apps/* & services/*
```

### Dev Commands

```bash
pnpm dev                   # Turborepo: tất cả apps + services (ts-node-dev)
pnpm dev:apps              # Chỉ apps/*
pnpm dev:services          # Chỉ services/*
pnpm dev:pm2               # PM2 ecosystem.dev.cjs (ts-node-dev + next dev)
pnpm test                  # Turborepo: tất cả tests
pnpm test:swift            # @wikialisa/swift-core — 115 tests
pnpm build                 # Production build
pnpm typecheck             # TypeScript check toàn workspace
pnpm lint                  # ESLint toàn workspace
```

### PM2 Dev Ports

| Service | Port | Mode |
|---|---|---|
| api-gateway | :5000 | ts-node-dev |
| ws-gateway | :5001 | ts-node-dev |
| fiat-connector | :4001 | ts-node-dev |
| swift-gateway | :4002 | ts-node-dev |
| swift-chain-bridge | :4003 | ts-node-dev |
| indexer-subgraph | :4004 | ts-node-dev |
| app-web | :3010 | next dev |
| pay-portal | :3002 | next dev |
| explorer | :3003 | next dev |
| swap-dex | :3004 | next dev |
| dao-portal | :3005 | next dev |
| ... (6 more) | ... | next dev |

### CI/CD Pipelines (Planned)

| Workflow | Trigger | Hành Động |
|---|---|---|
| `ci-test.yml` | Push / PR | Test + typecheck + lint toàn workspace |
| `publish-npm.yml` | Tag `v*` | Publish `@wikialisa/*` lên npmjs.com |
| `publish-docker.yml` | Tag `v*` | Build & push Docker images |
| `deploy-staging.yml` | Merge main | Deploy lên staging (axvn.vn) |

---

## Tài Liệu Liên Quan

| Tài Liệu | Đường Dẫn |
|---|---|
| README | `README.md` |
| Operations | `OPERATIONS.md` |
| Contributing | `CONTRIBUTING.md` |
| Security Audit | `AUDIT.md` |
| Agent Guide | `AGENT.md` |
| Deploy Guide | `deploy/npm/README.md` |
| Docker Stack | `deploy/docker/docker-compose.yml` |
| Helm Charts | `deploy/kubernetes/` |
| Terraform | `deploy/terraform/main.tf` |

---

*AXQ Tech Holding JSC — Master Roadmap v1.0 · Copyright © 2026*
