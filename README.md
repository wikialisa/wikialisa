# Wikialisa — Enterprise Monorepo

**AXQ TECH HOLDING JSC** — `pnpm` + `Turborepo` + `Anchor/Solana/EVM`

---

## 🗺️ Ma trận Mapping: Pháp nhân → Tên miền → Module Kỹ thuật

| Pháp nhân thành viên | Thị trường | Tên miền vận hành | Module Kỹ thuật & Service |
|---|---|---|---|
| **AXQ TECH HOLDING JSC** | Việt Nam (Công ty Mẹ) | `holding.axvn.vn` | Quản trị IP Asset, Mint/Burn AXQ Core, Core SDK |
| **AXQ FinTech Services JSC** | Việt Nam (Nội địa) | `id.axvn.vn` · `pay.axvn.vn` · `dev-api.axvn.vn` · `app.axvn.vn` | P2P Escrow, Fiat Gateway, POS SDK, Main Wallet App |
| **AXQ Blockchain Network Ltd.** | Việt Nam (Hạ tầng) | `scan.axvn.vn` · `treasury-subgraph-api.axvn.vn` | App-Chain Explorer (Proof of Reserve), Indexing Layer |
| **AXQ Infra & Network Ltd.** | Việt Nam (Hạ tầng) | `mail.axvn.vn` | Stalwart Mail Server (SMTP/IMAP/JMAP) |
| **AXQ Digital Twin & AI Labs** | Việt Nam (R&D) | `lab.axvn.vn` | Digital Twin Simulation Engine, Dune Bots |
| **AXQ Global Ventures Pte. Ltd.** | Singapore | `swap.axvn.vn` | AMM DEX & Cross-chain Liquidity Router |
| **AXQ Capital & Foundation Ltd.** | Cayman / BVI | `dao.axvn.vn` | Treasury RBS, Governance DAO |
| **AXQ Labs MENA / FZE** | Dubai, UAE | `otc.axvn.vn` | Institutional OTC Engine, VARA Compliance |

---

## 🏗️ Cấu trúc Thư mục Monorepo

```text
/
├── apps/                                  # FRONTEND APPS & NODE SERVICES
│   ├── app-web/                           # [app.axvn.vn]      Main Wallet & Crypto App (Next.js :3010)
│   ├── id-fiat-gateway/                   # [id.axvn.vn]       P2P Escrow, Identity & Fiat On/Off Ramp (:3001)
│   ├── pay-portal/                        # [pay.axvn.vn]      Payment Gateway & Merchant Dashboard (:3002)
│   ├── explorer-vnkrscan/                 # [scan.axvn.vn]     App-Chain Block Explorer & Proof of Reserve (:3003)
│   ├── swap-dex/                          # [swap.axvn.vn]     AMM DEX & Cross-chain Liquidity Router (:3004)
│   ├── dao-portal/                        # [dao.axvn.vn]      Treasury Management & Governance Portal (:3005)
│   ├── holding-admin-portal/              # [holding.axvn.vn]  Internal Portal: IP Asset & Whitelist (:3006)
│   ├── digital-twin-engine/               # [lab.axvn.vn]      Digital Twin Simulation Engine (Node :3007)
│   ├── kyc-portal/                        # [kyc.axvn.vn]      eKYC Portal: VNeID, ZKP Attestation (:3013)
│   ├── merchant-portal/                   # [merchant.axvn.vn] Merchant Dashboard: API Keys, Orders (:3011)
│   └── sandbox-dashboard/                 # [sandbox.axvn.vn]  SupTech Sandbox & Circuit Breaker (:3012)
│
├── packages/                              # SHARED LIBRARIES & SDKs
│   ├── types/                             # @wikialisa/types      — Shared TypeScript types
│   ├── config/                            # @wikialisa/config     — Env constants, Program IDs, RPC endpoints
│   ├── ui-kit/                            # @wikialisa/ui-kit     — Design System (React components, tokens)
│   ├── core-sdk/                          # @wikialisa/core-sdk   — Solana/EVM Web3 wrapper, Anchor IDL
│   ├── web3-config/                       # @wikialisa/web3-config — Chain config, ABIs, Viem clients
│   ├── contracts/                         # @wikialisa/contracts  — EVM Smart Contract ABIs & addresses
│   ├── swift-core/                        # @wikialisa/swift-core — MT/MX builders, LAU signing, Redis bus
│   ├── swift-gateway/                     # @wikialisa/swift-gateway — OAuth2, GPI, PKI, Java Bridge
│   ├── sdk-swift/                         # @wikialisa/sdk-swift  — SWIFT Alliance Gateway SDK
│   ├── merchant-sdk/                      # @wikialisa/merchant-sdk — SDK tích hợp cổng thanh toán
│   └── db/                               # @wikialisa/db         — Shared PostgreSQL connection & helpers
│
├── programs/                              # SMART CONTRACTS (Solana Anchor / Rust + EVM Solidity)
│   ├── p2p-escrow/                        # P2P Escrow: make_offer, take_offer, cancel_offer
│   ├── mint-governance/                   # Mint/Burn token theo IP Escrow Deed & Whitelist
│   ├── amm-swap/                          # Pool Thanh khoản & Fee Sharing Router
│   ├── treasury-rbs/                      # Kho bạc DAO & Range Bound Stability
│   └── swift-bridge/                      # SWIFT ↔ On-chain Bridge
│       ├── evm/                            # Solidity: VNKRSwiftBridge.sol, VNKRSwiftBridgeV2.sol
│       └── solana/                         # Anchor/Rust: swift_bridge program
│
├── services/                              # BACKEND MICROSERVICES (Node.js / Fastify / Express)
│   ├── api-gateway/                       # [:5000] Central REST API — 17 service domains
│   ├── swift-gateway/                     # [:4002] SWIFT Messaging Gateway — MT103/MT202/pacs.008
│   ├── swift-chain-bridge/                # [:4003] SWIFT ↔ Blockchain Bi-directional Relayer
│   ├── fiat-connector-api/                # [:4001] Fiat Bank Matching & Webhook
│   ├── indexer-subgraph/                  # [:4004] Subgraph / Helius Indexer Service
│   ├── otc-liquidity-engine/              # [:4005] Institutional OTC Engine (VARA Compliance)
│   ├── dune-alert-bots/                   # [:4006] Telegram/Discord Bots & Dune Analytics
│   ├── mock-mgw/                          # [:4007] Mock SWIFT Microgateway (dev/test only)
│   └── role-engine/                       # Global Leadership Automation Worker
│
├── scripts/                               # SCRIPTS TIỆN ÍCH
│   ├── extract-swift-sdk.sh               # Giải nén & cài đặt SWIFT SDK vendor packages
│   ├── setup-mgw-keystore.sh              # Khởi tạo keystore JVM cho SWIFT Microgateway
│   └── test-swift-gateway.sh              # Kiểm thử luồng SWIFT gateway end-to-end
│
├── deploy/                                # HẠ TẦNG & DEPLOYMENT
│   ├── docker/                            # Dockerfiles + docker-compose.yml
│   ├── kubernetes/                        # K8s Helm Charts
│   ├── npm/                               # NPM publish scripts cho @wikialisa/* packages
│   └── terraform/                         # IaC: AWS ECS/ECR + Cloudflare DNS (WAF)
│
├── tsconfig.base.json                     # Shared TypeScript base config (ES2022, strict)
├── Anchor.toml                            # Solana Anchor workspace (devnet/mainnet program IDs)
├── Cargo.toml                             # Rust Cargo workspace
├── pnpm-workspace.yaml                    # pnpm workspace + catalog versions
├── turbo.json                             # Turborepo pipeline configuration
├── ecosystem.config.cjs                   # PM2 process manager config (all apps + services)
└── package.json                           # Root Monorepo configuration
```

---

## ⚡ Luồng Dữ liệu Vận hành

### 1. Luồng Giao dịch P2P & Nạp/Rút Fiat (`AXQ FinTech`)

- **KYC:** `kyc-portal` → eKYC VNeID + ZKP Attestation → lưu vết off-chain
- **Tạo lệnh On-chain:** Người bán khóa AXQ vào `programs/p2p-escrow` (Vault PDA)
- **Xác minh Fiat:** `services/fiat-connector-api` xử lý biến động VND qua `dev-api.axvn.vn`
- **Giải phóng Token:** Smart Contract giải phóng AXQ cho người mua, trích phí về Treasury
- **Thông báo:** `fiat-connector-api/src/mailer.ts` gửi OTP & xác nhận qua `mail.axvn.vn`

### 2. Luồng Minh bạch Hạ tầng & Dự trữ (`AXQ Infra`)

- `services/indexer-subgraph` đọc log từ RPC Node App-Chain Genesis (Chain ID: 1)
- `apps/explorer-vnkrscan` hiển thị Proof of Reserve & biến động ví Treasury real-time

### 3. Luồng Thanh khoản Quốc tế (`AXQ Global SG` & `AXQ Capital`)

- `apps/swap-dex` → kết nối `programs/amm-swap` (Liquidity Pool)
- `apps/dao-portal` → điều phối Mint/Burn & tỷ lệ dự trữ qua `programs/treasury-rbs`

### 4. Luồng Thanh toán SWIFT Liên ngân hàng

- **Outbound:** `services/swift-gateway` xác thực LAU HMAC → định tuyến MT103/pacs.008 qua SWIFT MGW (`:9003`)
- **Inbound:** Webhook MGW → `swift-gateway/src/bridge.ts` → Redis Stream → `swift-chain-bridge`
- **FX Oracle:** `swift-chain-bridge/src/fx-oracle.ts` tra cứu tỷ giá SBV + Vietcombank
- **Relayer:** `swift-chain-bridge/src/relayer.ts` → `programs/swift-bridge` (EVM + Solana)
- **SDK chung:** `@wikialisa/swift-core` — MT/ISO 20022 builders, LAU signing, Redis event bus

### 5. Luồng Email Transactional (`Stalwart Mail`)

- Stalwart Mail Server tại `mail.axvn.vn` — SMTP (25/465/587), IMAPS (993), JMAP (8080)
- `fiat-connector-api/src/mailer.ts` dùng `nodemailer` + `MAIL_CONFIG` từ `@wikialisa/config`

---

## 🌐 Bảng Subdomain & Services

| Domain | App / Service | Port | Chức năng |
|---|---|---|---|
| `app.axvn.vn` | `app-web` | :3010 | Main Wallet & Crypto App |
| `id.axvn.vn` | `id-fiat-gateway` | :3001 | KYC, P2P Escrow & Fiat On/Off Ramp |
| `pay.axvn.vn` | `pay-portal` | :3002 | Payment Portal & Merchant POS |
| `scan.axvn.vn` | `explorer-vnkrscan` | :3003 | App-Chain Block Explorer |
| `swap.axvn.vn` | `swap-dex` | :3004 | AMM DEX & Liquidity Router |
| `dao.axvn.vn` | `dao-portal` | :3005 | Governance & Treasury RBS |
| `holding.axvn.vn` | `holding-admin-portal` | :3006 | IP Asset & Whitelist Admin |
| `lab.axvn.vn` | `digital-twin-engine` | :3007 | Digital Twin & AI Lab |
| `merchant.axvn.vn` | `merchant-portal` | :3011 | Merchant Dashboard & API Keys |
| `sandbox.axvn.vn` | `sandbox-dashboard` | :3012 | SupTech Sandbox & Circuit Breaker |
| `kyc.axvn.vn` | `kyc-portal` | :3013 | eKYC Portal: VNeID + ZKP |
| `dev-api.axvn.vn` | `fiat-connector-api` | :4001 | Webhook Ngân hàng (WAF) |
| `otc.axvn.vn` | `swift-gateway` | :4002 | SWIFT Messaging Gateway |
| *(internal)* | `swift-chain-bridge` | :4003 | SWIFT ↔ Blockchain Relayer |
| `treasury-subgraph-api.axvn.vn` | `indexer-subgraph` | :4004 | App-Chain Indexer |
| *(internal)* | `otc-liquidity-engine` | :4005 | Institutional OTC (VARA) |
| *(internal)* | `dune-alert-bots` | :4006 | Telegram/Discord Bots |
| *(internal)* | `mock-mgw` | :4007 | Mock SWIFT MGW (dev only) |
| *(internal)* | `api-gateway` | :5000 | Central REST API |
| `mail.axvn.vn` | Stalwart Mail Server | 25/465/587/993/8080 | Transactional Mail |

---

## 🔑 Biến Môi trường (`.env.example`)

| Nhóm | Biến chính | Mô tả |
|---|---|---|
| **Solana** | `SOLANA_RPC_DEVNET`, `SOLANA_RPC_MAINNET`, `ANCHOR_WALLET` | RPC & Wallet Anchor/Solana |
| **App-Chain EVM** | `APPCHAIN_RPC`, `APPCHAIN_CHAIN_ID`, `AXVN_EVM_RPC` | RPC Node Genesis Chain |
| **TRON** | `TRON_FULL_HOST`, `TRON_PRIVATE_KEY` | TRON/TRC20 Integration |
| **Fiat API** | `DEFAULT_API_ENDPOINT`, `BANK_WEBHOOK_SECRET`, `FIAT_CONNECTOR_URL` | Bank Webhook |
| **Dune Bots** | `DUNE_API_KEY`, `TELEGRAM_BOT_TOKEN`, `DISCORD_BOT_TOKEN` | Alert Bots |
| **AWS / CF** | `AWS_REGION`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN` | Terraform IaC |
| **Mail** | `STALWART_HOSTNAME`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Mail Server |
| **Redis** | `REDIS_URL` | Internal Event Bus |
| **SWIFT** | `SWIFT_LAU_KEY`, `SWIFT_BIC_CODE`, `SWIFT_CONSUMER_KEY`, `SWIFT_MGW_URL` | SWIFT Network |
| **NPM** | `GITHUB_TOKEN` | GitHub Packages (`@wikialisa:registry`) |

---

## 📦 Dependency Graph Packages

```
@wikialisa/types  ←────────────────────── foundation (no deps)
@wikialisa/config ←────────────────────── foundation (no deps)
    ↑                   ↑
@wikialisa/db      @wikialisa/web3-config  @wikialisa/ui-kit
@wikialisa/core-sdk  @wikialisa/contracts
@wikialisa/swift-core  @wikialisa/merchant-sdk
    ↑
@wikialisa/sdk-swift  @wikialisa/swift-gateway
    ↑
apps/*  services/*
```

---

## 🔗 Tài liệu nội bộ

| Tài liệu | Đường dẫn |
|---|---|
| Operations Cheat Sheet | `OPERATIONS.md` |
| Contributing Guide | `CONTRIBUTING.md` |
| Security Audit | `AUDIT.md` |
| Roadmap | `ROADMAP.MD` |
| NPM Publish Guide | `deploy/npm/README.md` |
| Docker Compose Stack | `deploy/docker/docker-compose.yml` |
| Helm Values | `deploy/kubernetes/values.yaml` |
| Terraform IaC | `deploy/terraform/main.tf` |
| Shared Config | `packages/config/src/index.ts` |
