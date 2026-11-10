# 📐 ĐẶC TẢ KIẾN TRÚC RTL PHẦN CỨNG (FPGA IP CORE SPECIFICATION)
### *Register-Transfer Level (RTL) Microarchitecture for AXQ Acceleration Core*

---

## 1. MỤC TIÊU CỦA GIAI ĐOẠN RTL (KỶ NGUYÊN 3)

Trong [`WIKIALISA_CORE_IDEA.md`](../../WIKIALISA_CORE_IDEA.md), toàn bộ các tác vụ tính toán (băm SHA-256, ký ví AES/ECDSA, đồng thuận PoK) đều chạy bằng phần mềm tuần tự trên tập lệnh của CPU máy chủ.

Trong **Kỷ nguyên 3**, chúng ta chuyển hóa toàn bộ các thuật toán cốt lõi thành **mạch phần cứng số (Digital Logic Circuits)** được mô tả bằng ngôn ngữ phần cứng hiện đại (**SystemVerilog** và **Chisel HDL**). Mục tiêu là tạo ra một khối sở hữu trí tuệ phần cứng (**AXQ Hardware IP Core**) có thể nạp trực tiếp vào các dòng chip FPGA hiệu năng cao (như AMD/Xilinx UltraScale+, Kria SOM hoặc Alveo PCIe Accelerator) trước khi tiến hành tape-out đúc chip silicon.

---

## 2. SƠ ĐỒ KHỐI KIẾN TRÚC TỔNG THỂ (TOP-LEVEL BLOCK DIAGRAM)

```
                         AXI4 / PCIe HOST BUS
                                  ▲
                                  │
    +-----------------------------┴-----------------------------+
    |                     AXQ-CORE TOP IP                      |
    |                                                           |
    |  +--------------------+         +----------------------+  |
    |  | AXI4-Lite Slave    |         | AXI4-Stream Master   |  |
    |  | Control & Status   |         | High-Throughput DMA  |  |
    |  | Registers (CSR)    |         | Packet In/Out        |  |
    |  +---------+----------+         +----------+-----------+  |
    |            │                               │              |
    |  +---------v-------------------------------v-----------+  |
    |  |          INTERNAL CROSSBAR & ARBITER (AXI4)         |  |
    |  +---+--------------------+--------------------+-------+  |
    |      │                    │                    │          |
    |  +---v---------------+ +--v---------------+ +--v-------+  |
    |  |  HARDWARE POK     | | CRYPTOGRAPHIC    | | ZERO-KNOW|  |
    |  |  MINING ENGINE    | | CO-PROCESSOR     | | PROOF    |  |
    |  |  - 64-Stage Pipe  | | - Secp256k1 ALU  | | ACCEL    |  |
    |  |  - Ring TRNG      | | - Ed25519 / BLS  | | - Posei- |  |
    |  |  - Target Comp    | | - AES-GCM Vault  | |   don    |  |
    |  +-------------------+ +------------------+ +----------+  |
    +-----------------------------------------------------------+
```

---

## 3. BẢN ĐỒ THANH GHI ĐIỀU KHIỂN VÀ TRẠNG THÁI (CSR MEMORY MAP)

Bộ điều khiển AXI4-Lite ánh xạ vào không gian bộ nhớ của Host thông qua các thanh ghi 32-bit (Base Offset: `0x0000`):

| Địa chỉ Offset | Tên Thanh ghi | Quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| `0x0000` | `AXQ_CTRL_REG` | R/W | Bit 0: Kích hoạt lõi (Core Enable); Bit 1: Soft Reset; Bit 2: Xóa ngắt |
| `0x0004` | `AXQ_STATUS_REG` | R | Bit 0: Bận (Busy); Bit 1: Khối PoK tìm thấy; Bit 2: Lỗi tràn bộ đệm |
| `0x0008` | `AXQ_POK_TARGET_REG` | R/W | Định dạng độ khó mục tiêu (Số lượng số 0 yêu cầu ở đầu hash) |
| `0x000C` | `AXQ_POK_NONCE_LO` | R/W | 32 bit thấp của Nonce bắt đầu |
| `0x0010` | `AXQ_POK_NONCE_HI` | R/W | 32 bit cao của Nonce bắt đầu |
| `0x0014` | `AXQ_WIN_NONCE_LO` | R | 32 bit thấp của Nonce chiến thắng |
| `0x0018` | `AXQ_WIN_NONCE_HI` | R | 32 bit cao của Nonce chiến thắng |
| `0x0020 - 0x003F` | `AXQ_HASH_RESULT_0..7`| R | 256 bit mã băm SHA-256 chiến thắng (8 thanh ghi 32-bit) |

---

## 4. MÔ TẢ PHẦN CỨNG BẰNG CHISEL HDL (`AxqTopCore.scala`)

Sử dụng ngôn ngữ Chisel (dựa trên Scala) giúp biên dịch mã sang SystemVerilog có tính kiểm thử và cấu hình tham số linh hoạt:

```scala
package axq.core

import chisel3._
import chisel3.util._

class AxqControlIO extends Bundle {
  val start        = Input(Bool())
  val targetZeros  = Input(UInt(8.W))
  val startNonce   = Input(UInt(64.W))
  val blockHeader  = Input(UInt(512.W))
  
  val busy         = Output(Bool())
  val blockFound   = Output(Bool())
  val winningNonce = Output(UInt(64.W))
  val winningHash  = Output(UInt(256.W))
}

class AxqTopCore extends Module {
  val io = IO(new AxqControlIO)

  val pokEngine   = Module(new HardwarePokEngine)
  val cryptoAlu   = Module(new Secp256k1PointAlu)
  val trngModule  = Module(new RingOscillatorTrng)

  // Kết nối tín hiệu điều khiển và trạng thái
  pokEngine.io.start        := io.start
  pokEngine.io.targetZeros  := io.targetZeros
  pokEngine.io.startNonce   := io.startNonce
  pokEngine.io.blockHeader  := io.blockHeader
  pokEngine.io.entropySeed  := trngModule.io.entropyOut

  io.busy         := pokEngine.io.busy
  io.blockFound   := pokEngine.io.blockFound
  io.winningNonce := pokEngine.io.winningNonce
  io.winningHash  := pokEngine.io.winningHash
}
```

---

## 5. CHỈ SỐ TIÊU THỤ TÀI NGUYÊN DỰ KIẾN (FPGA RESOURCE ESTIMATION)

Ước tính trên kiến trúc **Xilinx Virtex UltraScale+ XCVU9P**:
- **Look-Up Tables (LUTs):** 45,000 / 1,182,000 (~3.8%)
- **Flip-Flops (Registers):** 62,000 / 2,364,000 (~2.6%)
- **Block RAM (BRAM 36Kb):** 120 blocks (Phục vụ lưu trữ bảng tra cứu và S-box)
- **DSP Slices (DSP48E2):** 64 slices (Phục vụ phép nhân trường số lớn Secp256k1)
- **Tần số hoạt động tối đa ($F_{\text{max}}$):** **350 MHz** (Đường truyền tới hạn đạt Slack dương +0.24 ns).

