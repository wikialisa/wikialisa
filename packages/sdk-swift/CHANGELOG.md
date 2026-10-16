# Changelog — @wikialisa/sdk-swift

Tất cả thay đổi đáng chú ý của package này được ghi lại tại đây.

Định dạng theo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning theo [Semantic Versioning](https://semver.org/lang/vi/).

---

## [1.0.2] — 2024-12-xx

### 🔧 Thay đổi cấu hình

- **publishConfig**: Chuyển registry từ `https://npm.pkg.github.com` (GitHub Packages, restricted) sang `https://registry.npmjs.org` (npmjs, public) — package giờ có thể cài bằng `npm install @wikialisa/sdk-swift` mà không cần xác thực GitHub.
- **repository.url**: Chuẩn hóa thành `git+https://github.com/wikialisa/wikialisa.git` theo chuẩn npm.
- **dependencies**: Loại bỏ `workspace:*` dependencies (`@wikialisa/config`, `@wikialisa/types`, `@wikialisa/swift-core`) khỏi `dependencies` vì tsup đã bundle chúng vào `dist/`. Thêm `ethers` và `fast-xml-parser` là runtime dependencies thực tế.
- **peerDependencies**: Chuyển `@wikialisa/*` internal packages sang `peerDependencies` (optional) để tránh lỗi khi install từ npmjs.

### 📄 Tài liệu

- Thêm `README.md` đầy đủ: mô tả package, hướng dẫn cài đặt, ví dụ sử dụng cho từng module (OAuth2, LAU Signing, ISO 20022, GPI Tracker, PKI, EVM Bridge), bảng API Reference, biến môi trường.
- Thêm `.npmignore`: loại trừ `src/`, `tests/`, `tsconfig.json`, `config/`, `.env`, IDE files khỏi tarball npm.

---

## [1.0.1] — 2024-12-xx

### 🐛 Sửa lỗi

- Sửa xung đột version khi publish (409 Conflict từ staged version trước đó).

---

## [1.0.0] — 2024-12-xx

### 🚀 Phát hành lần đầu

#### Tính năng

- **`SwiftOAuthClient`** — OAuth2 client cho SWIFT Alliance Gateway, hỗ trợ lấy và refresh access token.
- **`LauHeaderSigner`** — Ký tiêu đề LAU (Local Authentication) theo chuẩn SWIFT, hỗ trợ HMAC-SHA256.
- **`PkiCertificateService`** — Quản lý và load chứng chỉ PKI (TLS client certificate) cho mutual TLS với SWIFT.
- **`Iso20022Parser`** — Parse XML ISO 20022: hỗ trợ `pacs.008` (credit transfer) và `camt.053` (account statement).
- **`GpiTrackerClient`** — Theo dõi trạng thái thanh toán GPI theo UETR, truy vấn agent chain.
- **`AccountValidationClient`** — Xác thực tài khoản ngân hàng qua SWIFT Pre-Validation API.
- **`BicDirectoryClient`** — Tra cứu BIC/SWIFT code từ SWIFT BIC Directory.
- **`EvmProviderService`** — Kết nối EVM-compatible blockchain (Ethereum, Polygon, BSC) qua JSON-RPC.
- **`TronProviderService`** — Kết nối Tron blockchain.
- **`CrossBorderEscrowContract`** — Tương tác với smart contract escrow xuyên biên giới.
- **`UetrTxTrackerService`** — Tra cứu giao dịch theo UETR từ blockchain explorer.
- **`AuditComplianceExplorer`** — Kiểm toán và lọc sự kiện tuân thủ.
- **`JavaBridgeAdapter`** — Gọi SWIFT JAR utilities qua Node.js child_process.
- **`FileEncryptorAdapter`** — Mã hóa file AES-256-CBC với key derive từ password (scrypt).

#### Build

- TypeScript 5.x, tsup dual CJS/ESM output với declaration files.
- Node.js >= 22 required.
- Bundle sẵn toàn bộ internal packages — không cần cài `@wikialisa/swift-core` riêng.

---

## Quy ước versioning cho dự án này

| Loại thay đổi | Version bump | Ví dụ |
|---|---|---|
| Sửa bug, fix cấu hình, cập nhật docs | `patch` (x.x.**Z**) | 1.0.2 → 1.0.3 |
| Thêm tính năng mới, thêm export mới (backward compatible) | `minor` (x.**Y**.0) | 1.0.x → 1.1.0 |
| Breaking change: đổi API, xóa export, đổi kiểu | `major` (**X**.0.0) | 1.x.x → 2.0.0 |

### Cách tạo tag để kích hoạt CI/CD publish tự động

```bash
# Patch release
git tag sdk-swift/v1.0.3 && git push origin sdk-swift/v1.0.3

# Minor release
git tag sdk-swift/v1.1.0 && git push origin sdk-swift/v1.1.0
```
