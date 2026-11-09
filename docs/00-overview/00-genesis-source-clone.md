# 🏁 KHỞI NGUYÊN: QUY TRÌNH CLONE VÀ THIẾT LẬP NGUYÊN THỦY LÕI WIKIALISA
### *From Vanilla Linux Kernel Repository to the Custom Wikialisa Core & AXQ Journey*

---

## 1. MỤC TIÊU VÀ ĐIỂM XUẤT PHÁT

Mọi hành trình vĩ đại đều bắt đầu từ một bước đi đầu tiên. Trước khi tiến hóa thành một nhân vi xử lý phần cứng độc lập (AXQ Silicon Core) hay một vi nhân siêu tốc (AXQ-NanoKernel), toàn bộ kiến trúc được khai sinh từ nhánh fork chính thống của Linux Kernel Source Tree:
- **Repository gốc:** `https://github.com/wikialisa/wikialisa.git`
- **Tên định danh thư mục cục bộ:** `wikialisa`
- **Mục tiêu giai đoạn khởi nguyên:** Thiết lập môi trường biên dịch, định hình thương hiệu hạt nhân `wikialisa-core`, cấu hình tối giản hóa nhân máy chủ CLI, và tạo bệ phóng vững chắc để đưa thuật toán AXQ từ phần mềm xuống phần cứng.

```mermaid
flowchart LR
    A["https://github.com/wikialisa/wikialisa.git"] -->|git clone --depth=1| B["Thư mục Cục bộ: wikialisa"]
    B -->|Cài đặt Toolchain & Host Deps| C["Môi trường Biên dịch Nhân"]
    C -->|Rebranding & Kconfig Minimal| D["Nhân Wikialisa Core CLI"]
    D -->|Tích hợp AXQ Subsystem| E["Hành trình Phần cứng Silicon"]
```

---

## 2. QUY TRÌNH CLONE VÀ THIẾT LẬP SOURCE TREE CỤC BỘ

### Bước 1: Clone Repository từ GitHub về máy cục bộ
Mở Terminal / Shell và thực thi lệnh clone với thư mục đích mang tên `wikialisa`:

```bash
# Clone source tree chính thức về thư mục cục bộ mang tên wikialisa
git clone https://github.com/wikialisa/wikialisa.git wikialisa

# Điều hướng vào thư mục dự án
cd wikialisa

# Kiểm tra trạng thái nhánh và commit gốc
git status
git log -1 --oneline
```

> **Mẹo tối ưu dung lượng (Shallow Clone):** Do Linux kernel tree có lịch sử commit hàng chục gigabytes, nếu bạn muốn tiết kiệm băng thông và tăng tốc quá trình clone trên máy chủ hoặc CI/CD, có thể dùng cờ `--depth=1`:
> ```bash
> git clone --depth=1 https://github.com/wikialisa/wikialisa.git wikialisa
> ```

---

### Bước 2: Chuẩn bị Môi trường Toolchain và Gói Phụ trợ
Để có thể cấu hình, chỉnh sửa và biên dịch nhân `wikialisa`, hệ thống máy chủ cần trang bị đầy đủ bộ công cụ chuẩn:

```bash
# Cài đặt trình biên dịch GCC, công cụ phân tích từ vựng và xử lý mã nguồn
sudo apt-get update && sudo apt-get install -y \
    build-essential \
    libncurses-dev \
    bison \
    flex \
    libssl-dev \
    libelf-dev \
    bc \
    git \
    cpio \
    qemu-system-x86
```

---

## 3. KHẮC SÂU ĐỊNH DANH THƯƠNG HIỆU: ĐỔI TÊN LÕI THÀNH `wikialisa`

Dựa trên hướng dẫn từ [`DOCS.MD`](../../DOCS.MD), để hệ thống phản ánh đúng danh xưng hạt nhân độc quyền khi thực thi `uname -a` và xuất hiện trong nhật ký khởi động `dmesg`, chúng ta thực hiện điều chỉnh trực tiếp trên mã nguồn C của nhân:

### 3.1. Đổi tên hệ điều hành gốc (`UTS_SYSNAME`)
Mở tệp `include/linux/uts.h` (hoặc cấu hình thông qua compile-time flags) để thay thế `Linux` bằng `wikialisa`:

```c
/* include/linux/uts.h */
#ifndef UTS_SYSNAME
#define UTS_SYSNAME "wikialisa"
#endif
```

Hoặc thiết lập tự động trong tệp `Makefile` gốc của kernel:
```makefile
# Makefile gốc
NAME = Wikialisa Genesis
EXTRAVERSION = -wikialisa-core
```

### 3.2. Tùy biến Banner Khởi động `dmesg` (`init/main.c`)
Tìm đến hàm `start_kernel()` trong `init/main.c` và bổ sung biểu tượng khởi động độc quyền của Wikialisa:

```c
/* init/main.c trong start_kernel() */
pr_notice("====================================================\n");
pr_notice("    WIKIALISA CORE CLI - GENESIS HARDWARE RUNTIME   \n");
pr_notice("    Kernel Version: %s - Identity: wikialisa-core  \n", init_uts_ns.name.release);
pr_notice("====================================================\n");
```

---

## 4. KHỞI TẠO CẤU HÌNH TỐI GIẢN HÓA (MINIMAL DEFCONFIG)

Sau khi định danh lõi thành công, tiến hành tạo tệp cấu hình `.config` loại bỏ toàn bộ đồ họa và driver rườm rà (chuẩn bị bệ phóng cho các driver AXQ sau này):

```bash
# 1. Sinh cấu hình mặc định x86_64
make defconfig

# 2. Vô hiệu hóa đồ họa và âm thanh để đạt kích thước nhỏ nhất
./scripts/config --disable CONFIG_SOUND
./scripts/config --disable CONFIG_DRM
./scripts/config --disable CONFIG_FB
./scripts/config --disable CONFIG_WIRELESS

# 3. Kích hoạt Serial Console, NVMe và Mạng máy chủ CLI
./scripts/config --enable CONFIG_SERIAL_8250
./scripts/config --enable CONFIG_SERIAL_8250_CONSOLE
./scripts/config --enable CONFIG_BLK_DEV_NVME
./scripts/config --enable CONFIG_EXT4_FS
./scripts/config --enable CONFIG_INET
./scripts/config --set-str CONFIG_LOCALVERSION "-wikialisa-core"

# 4. Kiểm tra cấu hình hoàn chỉnh
make olddefconfig
```

---

## 5. BƯỚC CHUYỂN DỊCH VÀO HÀNH TRÌNH PHẦN CỨNG AXQ

Khi source tree `wikialisa` đã được clone và cấu hình định danh chuẩn mực, đây chính là "mảnh đất màu mỡ" để triển khai:
1. **Thư mục driver chuyên dụng:** Tạo `drivers/crypto/axq/` để nhúng thuật toán Proof-of-Kernel và quản lý ví vào nhân (Kỷ nguyên 1).
2. **Kích hoạt System Calls tùy biến:** Bổ sung các lệnh gọi hệ thống `sys_axq_mine` và `sys_axq_sign` trực tiếp trong bảng gọi hàm của nhân `wikialisa`.
3. **Tiến tới vi mạch độc lập:** Từ các module nhân C này, chuyển thể logic thành vi nhân Rust (`docs/02-baremetal-and-microkernel/`) và mạch bán dẫn phần cứng (`docs/03-fpga-ip-cores/` & `docs/04-silicon-isa-core/`).

> Xem tiếp: [01-executive-summary.md](01-executive-summary.md) để nắm bắt tóm lược chiến lược phần cứng toàn diện.

