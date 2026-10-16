# Hướng dẫn đóng góp — AXQ Tech Holding Monorepo

Cảm ơn bạn đã quan tâm đóng góp cho **AXQ Tech Holding** — nền tảng FinTech Mobile PWA trên Solana & EVM cho thị trường Việt Nam.

---

## Nguyên tắc Clean-Room Engineering

Tuyệt đối không sao chép mã nguồn có bản quyền. Mọi đóng góp phải tuân thủ các chuẩn mực open-source (MIT / Apache-2.0 cho SDKs; BSL 1.1 cho core contracts).

---

## Yêu cầu GPG Signing

Mọi commit và pull request **bắt buộc** phải được ký bằng GPG key:

```bash
git config --global commit.gpgsign true
git config --global user.signingkey YOUR_KEY_ID
```

Commit không có chữ ký GPG lên nhánh `main`, `staging` hoặc `dev` sẽ bị từ chối tự động.

---

## Quy ước đặt tên nhánh

| Prefix | Mục đích |
|---|---|
| `feat/axvn-*` | Tính năng mới |
| `fix/axvn-*` | Sửa lỗi |
| `security/axvn-*` | Vá bảo mật — cần Security Auditor duyệt |
| `docs/axvn-*` | Cập nhật tài liệu |
| `chore/axvn-*` | Công việc bảo trì, refactor |

Luôn tạo nhánh từ `dev`:

```bash
git checkout dev && git pull upstream dev
git checkout -b feat/axvn-ten-tinh-nang
```

---

## Cài đặt môi trường phát triển

```bash
# Yêu cầu: Node ≥ 22, pnpm ≥ 9
pnpm install

# Chạy dev server (tất cả apps)
pnpm dev

# Chạy một app cụ thể
pnpm --filter app-web dev

# Build toàn monorepo
pnpm build

# Type check
pnpm --filter app-web exec tsc --noEmit

# Lint
pnpm lint
```

---

## Tiêu chuẩn phát triển

**TypeScript / Next.js (`@wikialisa/*` packages):**
```bash
pnpm typecheck
pnpm lint
pnpm test
```

**Solana / Anchor (programs):**
```bash
anchor build
anchor test
```

**Smart Contracts (EVM):**
```bash
pnpm --filter @wikialisa/contracts test
npx hardhat compile
```

---

## Quy trình Pull Request

1. Tất cả tests phải pass: `pnpm test`
2. GPG signature bắt buộc trên mọi commit
3. Tham chiếu issue liên quan trong mô tả PR
4. Tối thiểu **2 core maintainer** phê duyệt
5. Thay đổi bảo mật / blockchain yêu cầu thêm **Security Auditor** duyệt
6. Không thêm mock data, hardcoded credentials hoặc `Math.random()` giả lập lỗi
7. Tuân thủ checklist trong [AGENT.md](../AGENT.md)

---

## Báo cáo lỗi bảo mật

**KHÔNG mở public Issue cho lỗ hổng bảo mật.**
Xem [SECURITY.md](SECURITY.md) — dùng GitHub Private Security Advisories.

---

## Liên hệ

- **Email:** dev@axvn.vn
- **Issues:** [github.com/axvn-vn/axvn-monorepo/issues](https://github.com/axvn-vn/axvn-monorepo/issues)

---

*AXQ Tech Holding JSC — axvn.vn*
