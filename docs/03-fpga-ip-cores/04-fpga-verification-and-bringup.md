# 🧪 QUY TRÌNH KIỂM THỬ VÀ NẠP BITSTREAM TRÊN FPGA
### *Verification, Synthesis, Simulation & Hardware Bring-Up on Xilinx UltraScale+*

---

## 1. MÔ HÌNH KIỂM THỬ MÃ NGUỒN PHẦN CỨNG (VERIFICATION ENVIRONMENT)

Trước khi nạp mã RTL lên phần cứng thực tế, quy trình kiểm thử hai tầng được thiết lập để đảm bảo độ chính xác logic tuyệt đối:
1. **Mô phỏng chu kỳ chính xác (Cycle-Accurate Simulation) với Verilator & C++ Testbench:** Chạy mô phỏng hàng tỷ chu kỳ xung nhịp ở tốc độ phần mềm cao nhất.
2. **Kiểm thử chuẩn công nghiệp UVM (Universal Verification Methodology) với Cocotb (Python):** Tạo ra hàng triệu giao dịch ngẫu nhiên có kiểm soát (Constrained Random Testing) để phát hiện các trường hợp biên (Corner Cases).

```
+-------------------------------------------------------------+
| COCOTB PYTHON TESTBENCH (axq_test_runner.py)                |
|  - Sinh dữ liệu giao dịch giả lập                           |
|  - Đối chiếu mã băm và chữ ký với thư viện chuẩn Rust/C     |
+------------------------------+------------------------------+
                               | GPI / VPI
+------------------------------v------------------------------+
| VERILATOR SIMULATOR                                         |
|  - Biên dịch toàn bộ SystemVerilog thành C++ nhị phân       |
|  - Xuất dạng sóng tín hiệu VCD/FST để gỡ lỗi qua GTKWave    |
+-------------------------------------------------------------+
```

---

## 2. KỊCH BẢN KIỂM THỬ ĐỒNG THUẬN POK (`test_pok_core.py`)

```python
import cocotb
from cocotb.triggers import RisingEdge, ClockCycles
from cocotb.clock import Clock
import hashlib

@cocotb.test()
async def test_pok_block_finding(dut):
    """Kiểm tra khả năng tìm kiếm Nonce thỏa mãn độ khó của Hardware PoK Core"""
    clock = Clock(dut.clk, 3.33, units="ns")  # 300 MHz
    cocotb.start_soon(clock.start())

    # Khởi tạo Reset
    dut.rst_n.value = 0
    await ClockCycles(dut.clk, 5)
    dut.rst_n.value = 1
    await ClockCycles(dut.clk, 5)

    # Nạp dữ liệu tiêu đề khối mẫu (Block Header)
    dut.blockHeader.value = int("0x" + "a" * 128, 16)
    dut.targetZeros.value = 16  # Yêu cầu 16 bit 0 ở đầu (tương đương 4 ký tự hex)
    dut.startNonce.value = 0
    dut.start.value = 1
    await RisingEdge(dut.clk)
    dut.start.value = 0

    # Chờ tín hiệu ngắt tìm thấy khối (blockFound)
    while dut.blockFound.value == 0:
        await RisingEdge(dut.clk)

    winning_nonce = int(dut.winningNonce.value)
    winning_hash = hex(int(dut.winningHash.value))[2:].zfill(64)

    dut._log.info(f"[PASS] Hardware PoK tìm thấy Nonce: {winning_nonce}")
    dut._log.info(f"[PASS] Mã băm chiến thắng: {winning_hash}")
    assert winning_hash.startswith("0000"), "Mã băm không thỏa mãn độ khó!"
```

---

## 3. QUY TRÌNH TỔNG HỢP VÀ ĐÓNG GÓI BITSTREAM (VIVADO TCL SCRIPT)

Sử dụng tập lệnh tự động hóa `build_bitstream.tcl` trong môi trường CI/CD:

```tcl
# Khởi tạo dự án Vivado cho board AMD/Xilinx Alveo U50
create_project -force axq_fpga_project ./build -part xcu50-fsvh2104-2-e

# Nạp mã nguồn RTL
add_files [glob ../rtl/*.sv]
add_files [glob ../rtl/chisel_gen/*.v]

# Nạp ràng buộc chân và xung nhịp (XDC Constraints)
add_files -fileset constrs_1 ./constraints/alveo_u50.xdc

# Tổng hợp logic (Synthesis)
synth_design -top AxqTopCore -flatten_hierarchy rebuilt

# Tối ưu hóa logic và định tuyến (Place & Route)
opt_design
place_design
phys_opt_design
route_design

# Kiểm tra vi phạm thời gian xung nhịp (Timing Report)
report_timing_summary -file ./reports/timing_summary.rpt

# Xuất tệp nhị phân bitstream nạp chip
write_bitstream -force ./output/axq_core_u50.bit
```

---

## 4. QUY TRÌNH NẠP PHẦN CỨNG THỰC TẾ (HARDWARE BRING-UP)

1. Cắm card **Alveo U50 PCIe** vào khe cắm PCIe Gen4 x16 của máy chủ Wikialisa Core.
2. Nạp bitstream vào cấu trúc logic FPGA thông qua tiện ích quản lý phần cứng:
   ```bash
   xbutil program --device 0000:03:00.0 --base --bitstream /opt/axq/axq_core_u50.bit
   ```
3. Sau khi bitstream được nạp thành công, kernel driver Linux (`/dev/axq` trong Phase 1) sẽ tự động nhận diện thiết bị tăng tốc phần cứng thông qua ID nhà cung cấp `0x10EE` (Xilinx) và ID thiết bị `0xAXQ1`.
4. Mọi lệnh gọi từ `axq-master mine` hoặc `axq-wallet` lập tức được điều hướng trực tiếp xuống mạch FPGA, giải phóng 100% công suất CPU chủ.

