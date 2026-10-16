# Wikialisa — Docker Build & Deploy Guide

Hướng dẫn build và deploy nội bộ cho toàn bộ monorepo.

---

## Kiến trúc đóng gói

```
wikialisa/                         ← monorepo root (Docker build context)
├── .dockerignore                  ← loại trừ node_modules, dist, .git, certs…
├── pnpm-workspace.yaml            ← khai báo workspace packages/*  apps/*  services/*
├── pnpm-lock.yaml                 ← lock file — mọi image đều COPY file này
├── turbo.json                     ← pipeline build chính xác cho từng package
├── tsconfig.base.json             ← base TypeScript config
│
├── packages/                      ← shared libs (types, config, db, swift-core…)
├── services/                      ← back-end microservices
│   ├── api-gateway/               ← REST + WebSocket + BullMQ  :5000/:5001
│   ├── fiat-connector-api/        ← Fiat webhook bridge          :4001
│   ├── otc-liquidity-engine/      ← OTC trading engine           :4002
│   ├── indexer-subgraph/          ← On-chain event indexer       :4003
│   ├── swift-gateway/             ← SWIFT Fastify proxy          :4004
│   ├── swift-chain-bridge/        ← SWIFT ↔ EVM relayer          :4005
│   ├── dune-alert-bots/           ← Telegram/Discord alerts      (worker)
│   ├── role-engine/               ← Leadership automation        (worker)
│   └── mock-mgw/                  ← Mock SWIFT MGW (dev only)    :9003
│
└── deploy/docker/
    ├── Dockerfile.<service>       ← per-service multi-stage Dockerfile
    ├── docker-compose.yml         ← production stack
    ├── docker-compose.dev.yml     ← dev overrides (hot-reload, mock)
    └── build-images.sh            ← script build/push images độc lập
```

---

## Multi-stage Build Pattern

Mỗi Dockerfile đều có **4 stages**:

| Stage     | Kế thừa   | Mục đích                                        |
|-----------|-----------|--------------------------------------------------|
| `base`    | node:22   | corepack + pnpm + workspace manifests + lockfile |
| `builder` | base      | cài deps, build dependency chain, compile TS     |
| `dev`     | builder   | hot-reload CMD, NODE_ENV=development             |
| `runner`  | node:22   | production image nhỏ gọn, chỉ copy artefacts     |

---

## Yêu cầu môi trường

```bash
docker >= 24
docker-compose >= 2.20  (hoặc docker compose plugin)
node  >= 22
pnpm  >= 9.15.9
```

---

## Quick Start — Local Dev

```bash
# 1. Copy .env
cp .env.example .env
# Điền JWT_SECRET, DATABASE_URL, REDIS_URL, SWIFT_*, ...

# 2. Khởi động toàn bộ stack (PostgreSQL + Redis + tất cả services)
pnpm dev:docker

# 3. Xem logs
docker compose -f deploy/docker/docker-compose.yml \
               -f deploy/docker/docker-compose.dev.yml logs -f

# 4. Dừng
pnpm stop:docker
```

---

## Build Images Thủ Công

### Build tất cả services

```bash
./deploy/docker/build-images.sh
```

### Build một service cụ thể

```bash
./deploy/docker/build-images.sh swift-gateway
```

### Build với tag và push lên GHCR

```bash
TAG=v1.2.0 \
REGISTRY=ghcr.io/axq-tech/wikialisa \
./deploy/docker/build-images.sh --push

# Hoặc dùng flags:
./deploy/docker/build-images.sh \
  --tag v1.2.0 \
  --registry ghcr.io/axq-tech/wikialisa \
  --push
```

### Build dev stage để test local

```bash
./deploy/docker/build-images.sh --target dev --tag dev-local api-gateway
```

---

## Production Stack — docker compose

```bash
# Khởi động production stack
docker compose -f deploy/docker/docker-compose.yml up -d

# Cụ thể chỉ một service (sau khi đã có image)
docker compose -f deploy/docker/docker-compose.yml up -d swift-gateway

# Scale (nếu stateless)
docker compose -f deploy/docker/docker-compose.yml up -d --scale fiat-connector-api=2

# Xem status
docker compose -f deploy/docker/docker-compose.yml ps
```

---

## Service Map — Ports

| Service               | Port(s)          | URL nội bộ (Docker network)          |
|-----------------------|------------------|---------------------------------------|
| `api-gateway`         | 5000, 5001       | `http://vnkr-api-gateway:5000`        |
| `fiat-connector-api`  | 4001             | `http://vnkr-fiat-connector-api:4001` |
| `otc-liquidity-engine`| 4002             | `http://vnkr-otc-liquidity-engine:4002` |
| `indexer-subgraph`    | 4003             | `http://vnkr-indexer-subgraph:4003`   |
| `swift-gateway`       | 4004             | `http://vnkr-swift-gateway:4004`      |
| `swift-chain-bridge`  | 4005             | `http://vnkr-swift-chain-bridge:4005` |
| `swift-mgw-daemon`    | 9003             | `http://vnkr-swift-mgw-daemon:9003`   |
| `postgres`            | 5432             | `postgres://vnkr-postgres:5432`       |
| `pgbouncer`           | 5433 → 5432      | `postgres://vnkr-pgbouncer:5432`      |
| `redis`               | 6379             | `redis://vnkr-redis:6379`             |
| `mail-server`         | 25,465,587,993,8080 | `http://vnkr-mail-server:8080`     |
| `dune-alert-bots`     | —                | worker, không expose port             |
| `role-engine`         | —                | worker, không expose port             |

---

## Dependency Graph (build order)

```
@wikialisa/types
  └── @wikialisa/config
        ├── @wikialisa/db
        │     ├── api-gateway
        │     ├── fiat-connector-api
        │     ├── otc-liquidity-engine (cũng cần core-sdk)
        │     └── indexer-subgraph
        ├── @wikialisa/core-sdk
        │     └── otc-liquidity-engine
        └── @wikialisa/swift-core
              ├── swift-gateway
              └── swift-chain-bridge
```

Turborepo tự động resolve thứ tự build theo `dependsOn` trong [`turbo.json`](../../turbo.json).

---

## GitHub Actions CI/CD

| Workflow                       | Trigger               | Hành động                                      |
|--------------------------------|-----------------------|------------------------------------------------|
| `ci.yml`                       | push main/develop, PR | lint + typecheck + test                        |
| `deploy-staging.yml`           | push main             | build → upload artefacts → SSH deploy → PM2   |
| `publish-docker.yml`           | push tag `v*`         | build + push 8 images lên GHCR                |
| `publish-npm.yml`              | push tag `v*`         | publish packages lên npmjs                     |
| `changeset-release.yml`        | push main             | Changesets version PR hoặc publish             |

---

## Biến môi trường bắt buộc

Xem [`/.env.example`](../../.env.example). Các biến tối thiểu để stack hoạt động:

```bash
POSTGRES_PASSWORD=...
JWT_SECRET=...
ENCRYPTION_KEY=...
SWIFT_LAU_KEY=...
SWIFT_MGW_APIKEY=...
BRIDGE_CONTRACT_ADDRESS=...
RELAYER_PRIVATE_KEY=...
```

---

## Troubleshooting

### `pnpm install --frozen-lockfile` thất bại trong container

Đảm bảo `pnpm-lock.yaml` được commit và đồng bộ với `package.json`. Chạy:

```bash
pnpm install        # cập nhật lock file
git add pnpm-lock.yaml && git commit -m "chore: sync lockfile"
```

### Service không start vì thiếu `.env`

File `.env` được loại trừ bởi `.dockerignore`. Truyền qua `env_file` hoặc `environment`
trong `docker-compose.yml`. Xem mỗi service block.

### `swift-mgw-daemon` không start

Service này cần `vendor/swift-mgw-2.0.17-1` (không commit vào git). Trong dev,
dùng `swift-mgw-mock` thay thế (đã có sẵn trong `docker-compose.dev.yml`).

### Build chậm do cache miss

```bash
# Bật BuildKit + GHA cache (CI tự động dùng)
DOCKER_BUILDKIT=1 docker build ...

# Local: dùng registry cache
docker buildx build --cache-from type=registry,ref=ghcr.io/... ...
```
