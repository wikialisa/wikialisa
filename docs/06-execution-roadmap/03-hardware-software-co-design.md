# 🤝 ĐỒNG THIẾT KẾ PHẦN CỨNG VÀ PHẦN MỀM (HARDWARE-SOFTWARE CO-DESIGN)
### *Bridging Low-Level Silicon Gates with High-Level CLI Utilities & Developer SDKs*

---

## 1. NGUYÊN TẮC ĐỒNG THIẾT KẾ (CO-DESIGN PHILOSOPHY)

Một nhân phần cứng dù mạnh mẽ và tối tân đến đâu cũng sẽ trở nên vô dụng nếu các nhà phát triển phần mềm không thể tiếp cận và sử dụng nó một cách dễ dàng.

Nguyên tắc đồng thiết kế trong dự án Wikialisa:
> **"Mọi cải tiến ở tầng bán dẫn phải được ánh xạ trực tiếp và liền mạch lên tầng ứng dụng, đảm bảo tính tương thích ngược 100% với các công cụ dòng lệnh đã định hình trong `DOCS.MD`."**

```
+-------------------------------------------------------------+
| TẦNG ỨNG DỤNG NGƯỜI DÙNG (USERLAND APPLICATIONS)            |
|  [axq-master mine]   [axq-wallet create]   [AI Agent CLI]   |
+------------------------------+------------------------------+
                               │ POSIX CLI / Shell Interface
+------------------------------v------------------------------+
| TẦNG THƯ VIỆN & SDK (DEVELOPER SDK & RUNTIME)               |
|  - Rust Crate: `axq-core-rs`                                |
|  - C/C++ Static Library: `libaxq.a`                         |
|  - Go SDK / Python Bindings                                 |
+------------------------------+------------------------------+
                               │ Direct Syscalls / MMAP Ring Buffer
+------------------------------v------------------------------+
| LỚP TRỪU TƯỢNG PHẦN CỨNG (HARDWARE ABSTRACTION LAYER - HAL)  |
|  - Tự động phát hiện: Phần mềm -> Kernel -> FPGA -> Silicon  |
+------------------------------+------------------------------+
                               │ Custom ISA / PCIe / MMIO
+------------------------------v------------------------------+
| PHẦN CỨNG VẬT LÝ (AXQ HARDWARE ACCELERATOR / SILICON CORE)  |
+-------------------------------------------------------------+
```

---

## 2. LỚP TRỪU TƯỢNG PHẦN CỨNG THÔNG MINH (DYNAMIC HARDWARE HAL)

Lớp HAL (`axq_hal.c`) tự động kiểm tra năng lực phần cứng tại thời điểm khởi chạy ứng dụng để kích hoạt chế độ tăng tốc tối ưu nhất:

```c
#include <stdio.h>
#include <stdint.h>
#include <fcntl.h>
#include <unistd.h>

typedef enum {
    ACCEL_MODE_SOFTWARE_FALLBACK = 0, // Dùng CPU và OpenSSL như trong DOCS.MD
    ACCEL_MODE_KERNEL_DRIVER     = 1, // Kích hoạt qua /dev/axq
    ACCEL_MODE_FPGA_PCIE         = 2, // Kích hoạt qua card Alveo PCIe
    ACCEL_MODE_NATIVE_SILICON    = 3  // Chạy trên CPU bản địa RISC-V AXQ-V Core
} axq_accel_mode_t;

axq_accel_mode_t axq_detect_hardware_capability(void) {
    // 1. Kiểm tra xem có đang chạy trên CPU hỗ trợ tập lệnh mở rộng AXQ-V không
    #if defined(__riscv) && defined(__riscv_axq)
        return ACCEL_MODE_NATIVE_SILICON;
    #endif

    // 2. Kiểm tra thiết bị tăng tốc FPGA qua PCIe
    if (access("/sys/bus/pci/devices/0000:03:00.0/axq_accel", F_OK) == 0) {
        return ACCEL_MODE_FPGA_PCIE;
    }

    // 3. Kiểm tra Driver tầng nhân Linux
    if (access("/dev/axq", F_OK) == 0) {
        return ACCEL_MODE_KERNEL_DRIVER;
    }

    // 4. Mặc định dự phòng về phần mềm
    return ACCEL_MODE_SOFTWARE_FALLBACK;
}
```

---

## 3. TƯƠNG THÍCH NGƯỢC HOÀN TOÀN VỚI `axq-master`

Người quản trị hệ thống gõ cùng một câu lệnh quen thuộc:
```bash
axq-master mine
```

Bên dưới hệ điều hành, công cụ `axq-master` sẽ tự động hiển thị tầng tăng tốc đang phục vụ:
- Nếu máy chủ chạy thông thường:
  ```text
  [AXQ Engine] Khởi chạy ở chế độ Software Fallback (2,500 H/s)
  ```
- Nếu máy chủ cài đặt Driver Kernel (Phase 1):
  ```text
  [AXQ Engine] Kích hoạt Kernel Space Driver /dev/axq (1,250,000 H/s)
  ```
- Nếu máy chủ cắm card tăng tốc FPGA (Phase 3):
  ```text
  [AXQ Engine] Kích hoạt Xilinx Alveo Hardware Acceleration (300,000,000 H/s)
  ```
- Nếu máy chủ trang bị chip bán dẫn độc quyền **AXQ-1** (Phase 4):
  ```text
  [AXQ Engine] Kích hoạt AXQ-V Silicon Core Pipeline (1,500,000,000 H/s)
  [AXQ Engine] Khóa bảo mật: SRAM PUF Vault Active (Physical Zero-Knowledge)
  ```

---

## 4. KẾT LUẬN VỀ KIẾN TRÚC TỔNG THỂ

Bằng việc kết hợp chặt chẽ giữa thiết kế vi mạch bán dẫn và các lớp phần mềm trừu tượng tiện dụng, hệ thống **Wikialisa Core & AXQ Chain** đã định hình một lộ trình công nghệ vững chắc, đưa sản phẩm từ một hệ thống dòng lệnh máy chủ tinh gọn vươn lên trở thành **nhân lõi phần cứng tối tân, an toàn và có hiệu suất cao nhất trong kỷ nguyên số**.

