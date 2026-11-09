# 📜 ĐẶC TẢ TẬP LỆNH MỞ RỘNG RISC-V: AXQ-V ISA EXTENSION
### *Custom Instruction Set Architecture for Blockchain, Cryptography & Hardware Consensus*

---

## 1. TỔNG QUAN TẬP LỆNH AXQ-V (KỶ NGUYÊN 4)

Để biến AXQ thành nhân lõi vi xử lý phần cứng độc lập thực thụ, chúng ta chọn chuẩn kiến trúc tập lệnh mở **RISC-V (RV64GC)** làm nền tảng và phát triển bộ tập lệnh mở rộng chuyên dụng độc quyền: **`AXQ-V ISA Extension`**.

Bộ tập lệnh mở rộng này được gán vào không gian mã lệnh tùy biến của RISC-V (`custom-0` và `custom-1`, Opcode `0x0B` và `0x2B`), cho phép phần mềm thực thi các tác vụ mật mã, đồng thuận Proof-of-Kernel, và tương tác AI Agent chỉ bằng một chỉ thị máy hợp ngữ duy nhất.

```
                     KHÔNG GIAN LỆNH RISC-V AXQ-V
+-------------------+--------------------+--------------------+
| Lệnh Cơ sở RV64G  | Lệnh Vector (RVV)  | Lệnh Mở rộng AXQ-V |
| (Integer, FPU,    | (Xử lý mảng dữ liệu| (PoK, Secp256k1,   |
|  Atomics, Control)|  lớn, Matrix)      |  Poseidon, Enclave)|
+-------------------+--------------------+--------------------+
```

---

## 2. BẢNG MÃ LỆNH VÀ ĐỊNH DẠNG CHỈ THỊ (INSTRUCTION ENCODING)

### Định dạng lệnh kiểu R-Type tùy biến:
```text
 31         25 24     20 19     15 14  12 11      7 6      0
+-------------+---------+---------+------+---------+--------+
|   funct7    |   rs2   |   rs1   |funct3|   rd    | opcode |
+-------------+---------+---------+------+---------+--------+
```

### Danh mục các chỉ thị mở rộng cốt lõi:

| Tên Chỉ thị Hợp ngữ | Mã Lệnh (Opcode/Funct3/Funct7) | Chức năng Kỹ thuật |
| :--- | :--- | :--- |
| `axq.pok.step rd, rs1, rs2` | `0x0B / 0x0 / 0x01` | Thực hiện 1 bước nén SHA-256 kết hợp trạng thái entropy của thanh ghi `rs1` và Nonce trong `rs2`, lưu hash vào `rd`. |
| `axq.pok.check rd, rs1, rs2`| `0x0B / 0x1 / 0x01` | Kiểm tra xem mã hash trong `rs1` có thỏa mãn số bit 0 mục tiêu trong `rs2` hay không (Trả về 1/0 vào `rd`). |
| `axq.secp.add rd, rs1, rs2` | `0x0B / 0x2 / 0x02` | Thực hiện phép cộng điểm Jacobian trên đường cong Secp256k1 trong 1 chu kỳ xung nhịp. |
| `axq.secp.mul rd, rs1, rs2` | `0x0B / 0x3 / 0x02` | Nhân điểm vô hướng (Scalar Multiplication $k \cdot P$) trên phần cứng với bảo vệ kênh kề. |
| `axq.zk.poseidon rd, rs1, rs2`| `0x0B / 0x4 / 0x03` | Thực thi một vòng biến đổi hàm băm Poseidon $S\text{-box}$ cho Zero-Knowledge Proofs. |
| `axq.vault.seal rd, rs1`    | `0x2B / 0x0 / 0x10` | Đóng băng vùng nhớ khóa bảo mật; khóa riêng tư chỉ có thể được dùng nội bộ bởi các lệnh ký. |
| `axq.vault.sign rd, rs1, rs2`| `0x2B / 0x1 / 0x10` | Ký thông điệp giao dịch `rs1` bằng khóa vật lý PUF trong buồng bảo mật, trả về chữ ký $(R, S)$ vào `rd`. |

---

## 3. CÁC THANH GHI ĐẶC BIỆT CỦA PHẦN CỨNG (CSR - CONTROL & STATUS REGISTERS)

AXQ-V bổ sung các thanh ghi điều khiển phần cứng được bảo vệ trong Machine Mode:

- **`0x8C0 (axq_entropy)`**: Đọc chuỗi bit ngẫu nhiên trực tiếp từ bộ phát sinh số ngẫu nhiên vật lý TRNG on-chip (Read-only).
- **`0x8C1 (axq_pok_target)`**: Thiết lập độ khó mục tiêu cho Proof-of-Kernel.
- **`0x8C2 (axq_cycle_entropy)`**: Đọc dấu vân tay chu kỳ và trạng thái năng lượng của nhân vi xử lý.
- **`0x8C3 (axq_sec_status)`**: Thanh ghi trạng thái an ninh (báo cạy mở vỏ chip, phát hiện tấn công điện áp, trạng thái khóa ví).

---

## 4. VÍ DỤ MÃ HỢP NGỮ SỬ DỤNG AXQ-V ISA (`mine_block.s`)

Đoạn mã sau đây minh họa việc khai thác khối Proof-of-Kernel ở tốc độ phần cứng tối đa bằng hợp ngữ RISC-V:

```assembly
.global axq_fast_hardware_miner
# Tham số đầu vào:
# a0 = Địa chỉ con trỏ Block Header
# a1 = Độ khó yêu cầu (Target Leading Zeros)
# Trả về: a0 = Nonce chiến thắng

axq_fast_hardware_miner:
    # 1. Thiết lập độ khó vào thanh ghi CSR của phần cứng
    csrw 0x8C1, a1
    
    # 2. Khởi tạo Nonce xuất phát
    li t0, 0                    # t0 = Nonce counter

pok_loop:
    # Thực thi lệnh phần cứng AXQ-V: Tính hash và kiểm tra độ khó chỉ trong 1 chu kỳ
    axq.pok.step t1, a0, t0     # t1 = Hash(BlockHeader, Nonce)
    axq.pok.check t2, t1, a1    # t2 = (LeadingZeros(t1) >= a1) ? 1 : 0
    
    bnez t2, pok_found          # Nếu t2 != 0, tìm thấy khối thành công!
    
    addi t0, t0, 1              # Nonce++
    j pok_loop

pok_found:
    mv a0, t0                   # Trả về Nonce chiến thắng
    ret
```

---

## 5. TÍCH HỢP TRÌNH BIÊN DỊCH (TOOLCHAIN SUPPORT)

Bộ tập lệnh mở rộng AXQ-V được tích hợp trực tiếp vào trình biên dịch **GNU Toolchain (`binutils-gdb`, `gcc`)** và **LLVM/Clang**, cho phép lập trình viên viết mã C/C++ hoặc Rust thông qua các hàm nội suy trực tiếp (Compiler Intrinsics):

```c
#include <axq_intrinsics.h>

uint64_t mine_block(const block_header_t *header, uint32_t difficulty) {
    uint64_t nonce = 0;
    while (1) {
        uint256_t hash = __builtin_axq_pok_step(header, nonce);
        if (__builtin_axq_pok_check(hash, difficulty)) {
            return nonce;
        }
        nonce++;
    }
}
```
Mã nguồn C trên được biên dịch thẳng thành một vòng lặp gồm 4 chỉ thị máy RISC-V, đạt tốc độ hàng trăm triệu phép thử mỗi giây trên nhân vi xử lý **AXQ-1**.

