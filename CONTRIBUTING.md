# 🤝 HƯỚNG DẪN ĐÓNG GÓP CỘNG ĐỒNG WIKIALISA
### *Wikialisa Core OS & AXQ Silicon Architecture — Community Contributing Guidelines*
> **"Xây dựng Hạ tầng Số Chủ quyền Vĩnh cửu cùng Cộng đồng Mã Nguồn Mở Toàn Cầu"**  
> *Chào mừng bạn đến với dự án Wikialisa. Chúng tôi trân trọng mọi đóng góp từ cộng đồng — từ lập trình nhân Linux, thiết kế vi mạch bán dẫn RTL, giao thức blockchain AXQ, tối ưu hóa mạng bảo mật, đến phát triển giao diện Web/Desktop và biên soạn tài liệu.*

---

## 📑 MỤC LỤC

1. [Quy Tắc Vàng Khi Đóng Góp (The Golden Rules)](#1-quy-tắc-vàng-khi-đóng-góp)
2. [Các Lĩnh Vực Đóng Góp Tiêu Biểu (Contribution Areas)](#2-các-lĩnh-vực-đóng-góp-tiêu-biểu)
3. [Quy Trình Đóng Góp Từng Bước (Step-by-Step Workflow)](#3-quy-trình-đóng-góp-từng-bước)
4. [Chuẩn Mực Lập Trình & Kiểm Thử (Coding & Verification Standards)](#4-chuẩn-mực-lập-trình--kiểm-thử)
5. [Quy Chuẩn Commit Message & Cam Kết DCO](#5-quy-chuẩn-commit-message--cam-kết-dco)
6. [Mẫu Tạo Pull Request (Pull Request Template)](#6-mẫu-tạo-pull-request)
7. [Bộ Quy Tắc Ứng Xử (Code of Conduct)](#7-bộ-quy-tắc-ứng-xử)

---

## 1. QUY TẮC VÀNG KHI ĐÓNG GÓP

Trước khi bắt đầu, mọi cộng tác viên cần nắm vững các nguyên tắc bất biến đã được quy định trong Hiến pháp [`WIKIALISA_CORE_IDEA.md`](WIKIALISA_CORE_IDEA.md) và Quy chế Quản trị [`docs/00-overview/03-roles-skills-and-brand-governance.md`](docs/00-overview/03-roles-skills-and-brand-governance.md):

1. **Bảo toàn Tính Tối giản Hạt nhân Máy chủ:**
   - Nhân `Wikialisa Core OS` (`wikialisa/wikialisa`) là nhân máy chủ tối giản (CLI-first).
   - Kích thước nhị phân `bzImage` bắt buộc phải **< 8MB**.
   - Tuyệt đối **KHÔNG** đưa driver đồ họa X11, âm thanh, hay mã GUI trực tiếp vào nhân máy chủ.
2. **Tuân thủ Nghiêm ngặt Phân quyền Thương hiệu:**
   - **`Wikialisa`**: Dành cho nhân hệ điều hành, máy chủ dòng lệnh, và bản phát hành ISO.
   - **`AXQ` / `AXQ Chain`**: Dành cho giao thức mạng blockchain, token, ví và đồng thuận PoK.
   - **`AXIOLEDGER`**: Dành cho cổng định chế tài chính kết nối chuẩn ISO 20022.
   - **`AXQ Silicon`**: Dành cho thiết kế vi mạch bán dẫn RTL và tập lệnh RISC-V AXQ-V.
3. **Mã Nguồn Mở & Giấy Phép GPL-2.0:**
   - Toàn bộ đóng góp vào nhân và driver phải tuân thủ giấy phép **GPL-2.0** với thẻ `SPDX-License-Identifier: GPL-2.0`.
   - Tuyệt đối không chèn mã nguồn độc quyền, nhị phân đóng kín (binary blobs) hoặc mã vi phạm bằng sáng chế.
4. **Cam Kết Xuất Xứ Nhà Phát Triển (DCO):**
   - Mọi commit phải được ký xác nhận nguồn gốc hợp pháp (`git commit -s`).

---

## 2. CÁC LĨNH VỰC ĐÓNG GÓP TIÊU BIỂU

Bạn có thể đóng góp vào Wikialisa ở nhiều phương diện tùy theo chuyên môn:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CÁC PHÂN HỆ ĐÓNG GÓP                            │
├─────────────────────┬─────────────────────┬────────────────────────────┤
│ 1. HẠT NHÂN LINUX   │ 2. PHẦN CỨNG BÁN DẪN│ 3. GIAO THỨC AXQ CHAIN     │
│ - Tinh chỉnh Kconfig│ - SystemVerilog RTL │ - Proof-of-Kernel Engine   │
│ - Security Hardening│ - Verilator Linter  │ - Tối ưu mạng P2P socket   │
│ - C Driver /dev/axq │ - RISC-V AXQ-V ISA  │ - Thuật toán Entropy RDTSC │
├─────────────────────┼─────────────────────┼────────────────────────────┤
│ 4. HẠ TẦNG MẠNG     │ 5. GIAO DIỆN ĐỒ HỌA │ 6. TÀI LIỆU & BẢN ĐỊA HÓA  │
│ - nftables firewall │ - Web Control Center│ - Hoàn thiện 25 chuyên đề  │
│ - WireGuard MTU/MSS │ - AXQ Studio (Tauri)│ - Dịch thuật đa ngôn ngữ   │
│ - QoS HTB Traffic   │ - Wikialisa-Shell   │ - Viết Tutorial & Diagrams │
└─────────────────────┴─────────────────────┴────────────────────────────┘
```

---

## 3. QUY TRÌNH ĐÓNG GÓP TỪNG BƯỚC

Quy trình đóng góp tuân theo chuẩn GitHub Fork & Pull Request:

### Bước 1: Fork và Clone Repository
```bash
# 1. Fork repository trên giao diện GitHub: https://github.com/wikialisa/wikialisa
# 2. Clone bản fork về máy cục bộ của bạn
git clone https://github.com/<tai-khoan-cua-ban>/wikialisa.git
cd wikialisa

# 3. Thêm remote upstream để đồng bộ phiên bản mới nhất
git remote add upstream https://github.com/wikialisa/wikialisa.git
git fetch upstream
```

### Bước 2: Khởi Tạo Môi Trường Làm Việc
```bash
# Thực thi script tự động hóa kiểm tra công cụ
chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh
```

### Bước 3: Tạo Nhánh Tính Năng (Feature Branch)
Đặt tên nhánh theo quy ước tiền tố rõ ràng:
- `feat/ten-tinh-nang`: Phát triển tính năng mới.
- `fix/loi-can-sua`: Sửa lỗi kỹ thuật.
- `docs/ten-tai-lieu`: Cập nhật hoặc viết mới tài liệu.
- `rtl/ten-mach-logic`: Đóng góp mô-đun phần cứng bán dẫn.
- `ui/ten-giao-dien`: Phát triển giao diện Web/Desktop.

```bash
git checkout -b feat/tối-ưu-driver-axq
```

### Bước 4: Viết Mã & Kiểm Thử Cục Bộ
Xem chi tiết quy chuẩn kiểm thử tại [Mục 4](#4-chuẩn-mực-lập-trình--kiểm-thử).

### Bước 5: Tạo Commit & Đẩy Lên GitHub
```bash
# Luôn sử dụng cờ -s (Sign-off) để xác nhận DCO
git commit -s -m "feat(driver): tối ưu hóa chu kỳ băm PoK qua tập lệnh SHA-NI"
git push origin feat/tối-ưu-driver-axq
```

### Bước 6: Tạo Pull Request (PR)
Truy cập GitHub và mở Pull Request hướng vào nhánh `main` của `wikialisa/wikialisa` kèm theo mô tả chi tiết theo mẫu.

---

## 4. CHUẨN MỰC LẬP TRÌNH & KIỂM THỬ

Mọi mã nguồn gửi lên bắt buộc phải vượt qua các công cụ kiểm tra tự động:

### 4.1. Đối Với Mã Nguồn C / Nhân Linux (`src/kernel/`, `include/`)
- **Kiểu thụt lề (Indentation):** Sử dụng 8 khoảng trắng cho mỗi cấp Tab theo chuẩn [Linux Kernel Coding Style](https://www.kernel.org/doc/html/latest/process/coding-style.html).
- **Kiểm tra chuẩn:** Chạy công cụ kiểm tra của kernel:
  ```bash
  linux-src/scripts/checkpatch.pl --no-tree -f src/kernel/axq/axq_main.c
  ```
- **Thẻ giấy phép:** Bắt buộc có dòng đầu tiên:
  ```c
  /* SPDX-License-Identifier: GPL-2.0 */
  ```

### 4.2. Đối Với Mạch Bán Dẫn Phần Cứng (`src/hardware/rtl/`)
- **Ngôn ngữ:** SystemVerilog (`.sv`), sử dụng kiểu `logic`, đồng bộ hóa tín hiệu Reset (`rst_n`).
- **Kiểm thử tĩnh (Linting):** Bắt buộc chạy linter **Verilator** sạch lỗi cảnh báo 100%:
  ```bash
  verilator --lint-only -Wall src/hardware/rtl/sha256_round_stage.sv
  verilator --lint-only -Wall src/hardware/rtl/leading_zero_comparator.sv
  ```

### 4.3. Đối Với Tập Lệnh Shell Trong Rootfs
- Sử dụng shebang `#!/bin/sh` tương thích hoàn toàn với BusyBox ash.
- **Không** sử dụng cú pháp bashisms (`[[ ]]`, mảng array, hàm `function`).
- Kiểm tra tính hợp lệ bằng công cụ `shellcheck`:
  ```bash
  shellcheck -s sh rootfs/usr/bin/axq-master
  ```

### 4.4. Kiểm Thử Khởi Động Máy Ảo QEMU
Chạy kịch bản Expect kiểm thử tự động xem kernel có boot thành công không:
```bash
expect test_script.exp
```

---

## 5. QUY CHUẨN COMMIT MESSAGE & CAM KẾT DCO

### 5.1. Quy Ước Đặt Tên Commit (Conventional Commits)
Cú pháp chuẩn:
```text
<loại>(<phạm vi>): <mô tả ngắn gọn thì hiện tại>

[Mô tả chi tiết lý do thay đổi và giải pháp kỹ thuật, nếu cần]

Signed-off-by: Tên Đầy Đủ <email@example.com>
```

**Các loại commit (Type):**
- `feat`: Tính năng hoặc chức năng mới.
- `fix`: Sửa lỗi kỹ thuật.
- `docs`: Cập nhật hoặc viết thêm tài liệu.
- `style`: Định dạng mã, khoảng trắng, không ảnh hưởng logic.
- `refactor`: Tái cấu trúc mã nguồn.
- `perf`: Cải thiện hiệu năng tính toán hoặc tốc độ băm.
- `test`: Thêm bài kiểm thử tự động, Verilator testbench.
- `ci`: Thay đổi cấu hình GitHub Actions hoặc kịch bản build.

**Ví dụ commit chuẩn:**
```text
feat(kernel): bổ sung cờ CONFIG_INIT_ON_ALLOC vào cấu hình mặc định

Kích hoạt zero-hóa vùng nhớ tự động khi cấp phát để ngăn chặn rò rỉ
khóa bảo mật giữa các tiến trình người dùng.

Signed-off-by: Nguyen Van A <nguyenvana@example.com>
```

### 5.2. Cam Kết Nguồn Gốc Đóng Góp (Developer Certificate of Origin - DCO)
Bằng việc gắn dòng `Signed-off-by:`, bạn xác nhận rằng bạn có toàn quyền đóng góp mã nguồn này theo giấy phép mã nguồn mở của dự án.

---

## 6. MẪU TẠO PULL REQUEST (PR TEMPLATE)

Khi gửi Pull Request, vui lòng sao chép và điền đầy đủ mẫu sau vào phần mô tả:

```markdown
### 📝 Tóm Tắt Thay Đổi
<!-- Mô tả ngắn gọn nội dung PR này giải quyết vấn đề gì -->

### 🎯 Phân Hệ Ảnh Hưởng
- [ ] Nhân Linux & C Driver (`src/kernel/`)
- [ ] Phần cứng Bán dẫn RTL (`src/hardware/rtl/`)
- [ ] Mạng Lưới AXQ Protocol (`rootfs/usr/bin/axq-master`)
- [ ] Hạ Tầng Mạng & Tường Lửa (`nftables`, `WireGuard`)
- [ ] Giao Diện Đồ Họa Web/Desktop (`src/ui/`)
- [ ] Tài Liệu Hướng Dẫn (`docs/`, `*.md`)

### 🧪 Bằng Chứng Kiểm Thử (Testing Proof)
<!-- Dán kết quả lệnh kiểm thử thành công, ví dụ: verilator output, checkpatch.pl, qemu boot log -->
- [ ] `verilator --lint-only -Wall` chạy sạch lỗi (nếu sửa RTL).
- [ ] Dung lượng `bzImage` vẫn đảm bảo < 8MB (nếu sửa kernel).
- [ ] Kiểm thử QEMU Expect thành công.

### ✅ Danh Sách Kiểm Tra (Checklist)
- [ ] Commit đã có chữ ký `Signed-off-by`.
- [ ] Không chứa mã vi phạm bản quyền hoặc binary blob.
- [ ] Đã cập nhật tài liệu liên quan tương ứng.
```

---

## 7. BỘ QUY TẮC ỨNG XỬ (CODE OF CONDUCT)

Dự án Wikialisa cam kết tạo dựng một môi trường cởi mở, văn minh, hòa nhập và tôn trọng lẫn nhau cho tất cả mọi người, bất kể quốc gia, chủng tộc, tôn giáo, giới tính hay trình độ kỹ thuật.

- **Khuyến khích:** Lắng nghe ý kiến mang tính xây dựng, tập trung vào giải pháp kỹ thuật tốt nhất, hỗ trợ người mới tham gia, và tôn trọng thời gian của các maintainer.
- **Nghiêm cấm:** Ngôn từ thù địch, quấy rối, công kích cá nhân, spam, hoặc cố tình đưa mã độc/cửa sau (backdoors) vào kho lưu trữ.
- **Báo cáo vi phạm:** Mọi hành vi vi phạm vui lòng gửi thông tin đến: `conduct@wikialisa.org` để Hội đồng Quản trị xử lý bảo mật.

---
*Cảm ơn bạn đã đồng hành kiến tạo nền tảng số độc lập cho nhân loại!*
