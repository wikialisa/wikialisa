# 🧬 VI KIẾN TRÚC NHÂN VI XỬ LÝ AXQ-1 (MICROARCHITECTURE PIPELINE)
### *Out-of-Order Superscalar Execution Engine with Integrated Cryptographic Pipeline*

---

## 1. TỔNG QUAN VI KIẾN TRÚC NHÂN AXQ-1

Nhân vi xử lý **AXQ-1** là lõi tính toán trung tâm (Silicon Core) của hệ sinh thái Wikialisa, được thiết kế theo kiến trúc **Siêu vô hướng thực thi ngoài thứ tự (Out-of-Order Superscalar Execution Core)** 64-bit dựa trên tập lệnh RISC-V RV64GC và bộ mở rộng độc quyền **AXQ-V**.

### Thông số kỹ thuật chính:
- **Tiến trình chế tạo mục tiêu (Target Process Node):** TSMC 7nm / Intel 16 / SkyWater 130nm (cho bản Open-Source MPW).
- **Tần số xung nhịp thiết kế:** 2.0 GHz - 2.8 GHz.
- **Bề rộng đường ống (Pipeline Width):** 4-way Fetch / Decode / Rename / Dispatch.
- **Cửa sổ lệnh (Instruction Window / ROB):** 128 mục Reorder Buffer (ROB).

---

## 2. SƠ ĐỒ ĐƯỜNG ỐNG THỰC THI (8-STAGE PIPELINE)

```
[ L1 Instruction Cache (64KB, 4-Way) ]
               │
+--------------v---------------+
| 1. FETCH STAGE (4-wide)      | <--- TAGE Branch Predictor & RAS
+--------------+---------------+
               │
+--------------v---------------+
| 2. DECODE STAGE (4-wide)     | <--- Nhận diện các chỉ thị AXQ-V
+--------------+---------------+
               │
+--------------v---------------+
| 3. REGISTER RENAME           | <--- RAT & Physical Register File (PRF)
+--------------+---------------+
               │
+--------------v---------------+
| 4. DISPATCH / ISSUE QUEUE    |
+---+---------+---------+------+
    │         │         │
+---v---+ +---v---+ +---v--------------------------+
| INT   | | FPU   | | AXQ CRYPTO & POK EXECUTION   |
| ALUs  | | Unit  | | UNIT (AXQ-EU)                |
| (x2)  | |       | | - Single-Cycle SHA256 Step   |
|       | |       | | - Secp256k1 Point Multiplier |
|       | |       | | - TRNG Entropy Collector     |
+---+---+ +---+---+ +---+--------------------------+
    │         │         │
+---v---------v---------v------+
| 5. WRITE-BACK STAGE          |
+--------------+---------------+
               │
+--------------v---------------+
| 6. COMMIT / RETIRE (ROB)     |
+------------------------------+
```

---

## 3. KHỐI THỰC THI MẬT MÃ TÍCH HỢP (AXQ-EU: EXECUTION UNIT)

Điểm khác biệt căn bản giữa vi xử lý AXQ-1 và các chip x86/ARM thông thường là sự hiện diện của **AXQ Execution Unit (AXQ-EU)** nằm ngang hàng với khối số học nguyên (ALU) và khối dấu phẩy động (FPU):

1. **Khối Băm PoK Trực tiếp (PoK Unit):**
   - Đọc trực tiếp từ thanh ghi vật lý (Physical Registers) của CPU mà không qua trung gian bộ nhớ đệm (Cache Bypass).
   - Tích hợp mạch nén SHA-256 nội suy, hoàn thành 1 round nén chỉ trong **1 chu kỳ xung nhịp CPU**.
2. **Khối Điểm Đường cong Elliptic (EC Point Unit):**
   - Mảng nhân Montgomery 256-bit được tối ưu hóa cho chu kỳ trễ cố định (Constant-Time).
   - Bảo vệ tuyệt đối trước mọi kỹ thuật phân tích công suất vi sai (DPA) nhờ mạch tạo nhiễu ngẫu nhiên nội tại.
3. **Bộ thu thập Entropy Chu kỳ (Cycle Telemetry):**
   - Kết nối trực tiếp với cảm biến nhiệt độ trên die chip, số lần dao động của transistor vi mô để cung cấp hạt giống entropy cho thuật toán Proof-of-Kernel.

---

## 4. HỆ THỐNG BỘ NHỚ ĐỆM VÀ ĐẢM BẢO NHẤT QUÁN (CACHE & MEMORY HIERARCHY)

```
+-----------------------------------------------------------+
| AXQ-1 CORE                                                |
|  - L1I: 64 KB, 4-way associative, Parity protected        |
|  - L1D: 64 KB, 4-way associative, ECC protected, SEC-DED  |
+-----------------------------+-----------------------------+
                              │
+-----------------------------v-----------------------------+
| PRIVATE L2 CACHE (512 KB, 8-way, Inclusive, ECC)          |
+-----------------------------+-----------------------------+
                              │ TileLink-C / Coherent Fabric
+-----------------------------v-----------------------------+
| SHARED L3 CACHE (8 MB - 32 MB) & HARDWARE MEMORY ENCLAVE  |
|  - Tích hợp bộ giải mã/mã hóa phần cứng AES-XTS on-the-fly|
+-----------------------------+-----------------------------+
                              │ DDR5 / LPDDR5 / CXL 3.0
+-----------------------------v-----------------------------+
| PHYSICAL OFF-CHIP DRAM MEMORY                             |
+-----------------------------------------------------------+
```

### Đặc tính Chống Rò rỉ Bộ nhớ:
- Toàn bộ dòng cache L1/L2 liên quan đến khóa ví AXQ được gắn cờ bảo mật **`SECURE_LINE`**.
- Khi có ngắt chuyển ngữ cảnh (Context Switch), các dòng cache này tự động bị vô hiệu hóa và xóa trắng (Zero-flush), ngăn chặn triệt để các cuộc tấn công qua bộ đệm như Spectre V2 và Meltdown.

