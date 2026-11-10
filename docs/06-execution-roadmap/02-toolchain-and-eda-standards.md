# 🛠️ CHUẨN CÔNG CỤ THIẾT KẾ BÁN DẪN VÀ MÔ PHỎNG (TOOLCHAIN & EDA STANDARDS)
### *Electronic Design Automation (EDA) Tools, Emulation Platforms & Synthesis Flow*

---

## 1. MÔI TRƯỜNG THIẾT KẾ PHẦN CỨNG MÃ NGUỒN MỞ VÀ THƯƠNG MẠI

Dự án AXQ áp dụng chiến lược kết hợp linh hoạt giữa các công cụ **EDA Mã nguồn mở (Open-Source EDA)** phục vụ nghiên cứu cộng đồng và các công cụ **EDA Thương mại Tiêu chuẩn Công nghiệp** phục vụ quá trình tape-out sản phẩm thương mại.

```
+-------------------------------------------------------------+
| GIAI ĐOẠN MÔ TẢ PHẦN CỨNG (RTL & HDL DESIGN)                |
|  - Chisel HDL (Scala-based) / SystemVerilog (IEEE 1800-2017)|
|  - Định dạng mã: Verible Linter / Clang-Format HDL          |
+------------------------------+------------------------------+
                               │
+------------------------------v------------------------------+
| MÔ PHỎNG VÀ XÁC MINH CHU KỲ (SIMULATION & VERIFICATION)     |
|  - Verilator (C++ Cycle-Accurate Simulator)                 |
|  - Cocotb (Python Coroutine-based Testbench)                |
|  - GTKWave & Surfer (Waveform Viewer: VCD / FST)            |
|  - Synopsys VCS / Siemens QuestaSim (Cho kiểm thử UVM)      |
+------------------------------+------------------------------+
                               │
+------------------------------v------------------------------+
| TỔNG HỢP VÀ ĐÓNG GÓI BÁN DẪN (SYNTHESIS & PHYSICAL DESIGN)  |
|  - Nhánh FPGA: AMD/Xilinx Vivado ML Enterprise              |
|  - Nhánh ASIC Open-Source: OpenROAD Flow + Yosys + Magic    |
|  - Nhánh ASIC Commercial: Synopsys Design Compiler + ICC2   |
+-------------------------------------------------------------+
```

---

## 2. NỀN TẢNG MÔ PHỎNG HỆ THỐNG ĐẦY ĐỦ (FULL-SYSTEM EMULATION)

Để các kỹ sư phần mềm có thể viết mã ứng dụng cho tập lệnh **AXQ-V** ngay từ trước khi có chip vật lý, chúng tôi phát triển môi trường mô phỏng ảo hóa:

### 2.1. QEMU với Plugin Mở rộng AXQ-V (`qemu-system-riscv64`)
- Tích hợp thêm các bộ giải mã chỉ thị máy cho `axq.pok.step`, `axq.secp.mul`, và `axq.vault.sign`.
- Hỗ trợ chạy toàn bộ hệ điều hành Wikialisa Core và tiện ích `axq-master` bên trong máy ảo QEMU giả lập với độ chính xác tập lệnh 100%.

### 2.2. Spike RISC-V ISA Golden Reference Simulator
- Bộ mô phỏng chuẩn của RISC-V International được nhúng mã nguồn C++ mô phỏng các thanh ghi CSR và tập lệnh tùy biến của AXQ.
- Dùng làm thước đo chuẩn mực (Golden Reference Model) để đối chiếu từng chu kỳ xung nhịp với kết quả đầu ra của mô phỏng RTL Verilator.

---

## 3. QUY CHUẨN TỰ ĐỘNG HÓA CI/CD CHO PHẦN CỨNG (HARDWARE CI/CD)

Tương tự như quy trình tự động hóa nhân Linux trong [`WIKIALISA_CORE_IDEA.md`](../../WIKIALISA_CORE_IDEA.md), toàn bộ mã nguồn phần cứng trong repository đều được tự động kiểm tra qua GitHub Actions (`.github/workflows/hardware-ci.yml`):

1. **Bước 1 (Linting & Style Check):** Chạy `verible-verilog-lint` kiểm tra chuẩn viết code an toàn, không có chốt tín hiệu ngầm (no inferred latches).
2. **Bước 2 (Unit Testing):** Chạy 1,500 bài test Cocotb mô phỏng các phép toán băm SHA-256, nhân điểm Secp256k1 và Poseidon.
3. **Bước 3 (FPGA Synthesis Check):** Tự động gọi Vivado Batch Mode kiểm tra vi phạm xung nhịp (Timing Closure) và tổng hợp LUT/FF.
4. **Bước 4 (Artifact Release):** Xuất bản báo cáo diện tích die (Area Report), mức tiêu thụ năng lượng (Power Report) và tệp bitstream kiểm thử cho cộng đồng.

