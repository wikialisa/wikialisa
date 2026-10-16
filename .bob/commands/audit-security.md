# /audit-security

Quét toàn bộ các critical security issues trong frontend apps của dự án Wikialisa.

## Hướng dẫn thực thi

Khi lệnh này được gọi, hãy thực hiện tuần tự các bước dưới đây. **Không bỏ qua bước nào.** Báo cáo kết quả từng bước trước khi chuyển sang bước tiếp theo.

---

### Bước 1 — Quét localStorage token storage (CRIT-03 / HIGH-01)

Tìm tất cả các vị trí lưu credentials/tokens vào `localStorage` hoặc `sessionStorage`:

```
localStorage.setItem
sessionStorage.setItem
localStorage.getItem
```

**Kiểm tra cụ thể:**
- JWT tokens (`accessToken`, `refreshToken`) → phải dùng `httpOnly` cookie thay thế
- PIN code (`pin`, `pin_temp`) → không được lưu plaintext, phải hash hoặc validate server-side
- Auth state (`auth_state`) → không được dùng làm auth guard duy nhất

Dùng `grep` để tìm toàn bộ occurrences trong `apps/`:

```
grep -r "localStorage.setItem\|sessionStorage.setItem" apps/ --include="*.tsx" --include="*.ts"
```

Liệt kê từng file:line và phân loại: 🔴 CRITICAL / 🟡 HIGH / 🟢 OK.

---

### Bước 2 — Quét hardcoded credentials (CRIT-01 / CRIT-02 / HIGH-04)

Tìm các giá trị nhạy cảm được hardcode trực tiếp trong code:

```
grep -rn "MOCK_OTP\|CORRECT_PIN\|\"0000\"\|\"123456\"\|Demo.*PIN\|demo.*pin" apps/ --include="*.tsx" --include="*.ts"
```

**Kiểm tra cụ thể:**
- OTP hardcode (`MOCK_OTP = "0000"`) → phải gọi `/api/v1/auth/otp/verify`
- PIN hardcode (`CORRECT_PIN = "123456"`) → phải gọi API server-side
- Demo text visible trong UI (`"Demo: PIN là 123456"`) → phải xóa hoặc gate bằng `process.env.NODE_ENV`

---

### Bước 3 — Kiểm tra ignoreBuildErrors (CC-01)

Đọc file `apps/app-web/next.config.mjs` và kiểm tra:

```
grep -n "ignoreBuildErrors\|ignoreDuringBuilds" apps/app-web/next.config.mjs
```

Nếu tồn tại `ignoreBuildErrors: true` hoặc `ignoreDuringBuilds: true` → báo cáo là 🔴 BLOCKER vì TypeScript/ESLint errors không fail CI.

---

### Bước 4 — Kiểm tra auth guard bypass (CRIT-04)

Tìm các layout files dùng localStorage làm auth guard duy nhất:

```
grep -rn "auth_state\|getItem.*auth" apps/ --include="*.tsx" --include="*.ts"
```

Kiểm tra xem có JWT validation thực sự (verify signature, check expiry) hay chỉ đọc string từ storage.

---

### Bước 5 — Kiểm tra admin routes không có auth (Admin-01)

Tìm `apps/app-web/src/app/admin/layout.tsx` và kiểm tra:
- Có `middleware.ts` với role check không?
- Có JWT claim validation (`role === "admin"`) không?
- Có redirect về login khi unauthorized không?

```
grep -rn "role\|admin\|auth" apps/app-web/src/app/admin/layout.tsx
```

---

### Bước 6 — Kiểm tra PIN digit-length inconsistency (HIGH-03)

```
grep -rn "PinPad\|length={4}\|length={6}" apps/ --include="*.tsx"
```

Liệt kê từng screen và độ dài PIN → phải đồng nhất (khuyến nghị 6 digits theo tiêu chuẩn ngân hàng VN).

---

### Bước 7 — Tổng hợp báo cáo

Xuất bảng tổng hợp theo format:

| Severity | Issue ID | File | Dòng | Mô tả | Action cần làm |
|---|---|---|---|---|---|
| 🔴 CRITICAL | ... | ... | ... | ... | ... |
| 🟡 HIGH | ... | ... | ... | ... | ... |
| 🟠 MEDIUM | ... | ... | ... | ... | ... |

Sau đó đề xuất thứ tự fix theo priority: **Phase 1 (trước public access) → Phase 2 (trước beta) → Phase 3 (production readiness)**.

---

### Bước 8 — Hỏi có muốn fix ngay không

Sau khi có báo cáo đầy đủ, hỏi user:
- Muốn fix tự động issue nào trước?
- Bắt đầu với CRITICAL issues không?
