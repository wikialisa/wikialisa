# Wikialisa Monorepo — Todo List

> Dựa trên kết quả phân tích cấu trúc monorepo.  
> Xem chi tiết: [Wikialisa Monorepo Audit](AUDIT.md)

---

## 🔴 P0 — CRITICAL ✅ Hoàn thành

- [x] **[P0-1]** Tạo `/tsconfig.base.json` ở root workspace
- [x] **[P0-2]** Đổi tên NPM package `services/swift-gateway` → `@wikialisa/svc-swift-gateway`
- [x] **[P0-3]** Hạ catalog `next` về `"^14.2.0"` để khớp tất cả 10 apps (`pnpm-workspace.yaml`)
- [x] **[P0-4]** Xóa `output: "export"`, `trailingSlash`, toàn bộ `@vnkr/*` webpack alias trong 10 `next.config.mjs`

---

## 🟠 P1 — HIGH ✅ Hoàn thành

- [x] **[P1-1]** Sửa `Anchor.toml` test script: `yarn` → `pnpm exec`
- [x] **[P1-2]** Thêm `programs/swift-bridge/solana` vào `Anchor.toml` `[workspace.members]` + `[programs.devnet/mainnet]`
- [x] **[P1-3]** Cập nhật `services/api-gateway` `redis` từ `"^4.6.14"` → `"^5.0.0"`
- [x] **[P1-4]** Tạo `.npmrc` ở root với GitHub Packages registry config cho `@wikialisa` scope

---

## 🟡 P2 — MEDIUM ✅ Hoàn thành

- [x] **[P2-1]** Xóa `packages/swift` — không ai import, trùng với `swift-core`
- [x] **[P2-2]** Xóa `@wikialisa/sdk-internal` khỏi `package.json` 10 apps — không có import thực tế trong source
- [x] **[P2-3]** Migrate `services/swift-chain-bridge` và `services/swift-gateway` từ `swift-adapter` → `swift-core`
- [x] **[P2-4]** Xóa `packages/swift-adapter` và `packages/sdk-internal` (đã migrate xong)
- [x] **[P2-5]** Không có import `@vnkr/*` thực tế trong source — webpack alias đã xóa ở P0-4
- [x] **[P2-6]** Xóa thư mục `temp-wikialisa-ui/`

---

## ⚪ P3 — LOW ✅ Hoàn thành

- [x] **[P3-1]** Đổi tên `ROABMAP.MD` → `ROADMAP.MD`
- [x] **[P3-2]** Xóa file thừa ở root: `axvn.vn.txt`, `axvn.zip`, `apps-tree.txt`
- [x] **[P3-3]** N/A — `packages/swift-adapter` đã bị xóa hoàn toàn ở P2-4
- [x] **[P3-4]** Xóa script one-time: `migrate-heroui.sh`, `clone-and-transform.sh`
- [x] **[P3-5]** Thêm `Dockerfile` cho `services/api-gateway`, `services/swift-chain-bridge`, `apps/digital-twin-engine`
- [x] **[P3-6]** Thêm `digital-twin-engine` + 5 services còn thiếu vào `ecosystem.config.cjs`

---

## Thống Kê

| Mức độ | Tổng | Hoàn thành | Còn lại |
|--------|------|------------|---------|
| 🔴 P0 Critical | 4 | ✅ 4 | 0 |
| 🟠 P1 High | 4 | ✅ 4 | 0 |
| 🟡 P2 Medium | 6 | ✅ 6 | 0 |
| ⚪ P3 Low | 6 | ✅ 6 | 0 |
| **Tổng** | **20** | **✅ 20** | **0** |
