# 🔒 CƠ CHẾ VÙNG NHỚ CÔ LẬP VÀ PHẦN CỨNG BẢO MẬT ENCLAVE
### *Zero-Trust Memory Protection & Hardware Enclaves (AMD SEV-SNP, Intel SGX, RISC-V PMP)*

---

## 1. MỤC TIÊU BẢO VỆ DỮ LIỆU CỐT LÕI

Trong [`WIKIALISA_CORE_IDEA.md`](../../WIKIALISA_CORE_IDEA.md), tệp `wallet.dat` được bảo vệ bằng mã hóa AES-256 Passphrase. Tuy nhiên, khi người dùng nhập mật khẩu để kiểm tra số dư (`axq-master balance`) hoặc khai thác khối (`axq-master mine`), chuỗi khóa riêng tư (Private Key) bắt buộc phải được giải mã và lưu trữ trong bộ nhớ RAM.

Nếu kẻ tấn công:
1. Gắn thiết bị đọc trộm phần cứng (Hardware Interceptor) vào thanh RAM (Cold Boot Attack).
2. Chiếm quyền điều khiển Bus phần cứng thông qua cổng cắm ngoài (Direct Memory Access - DMA Attack qua PCIe/Thunderbolt).
3. Khai thác lỗ hổng vi kiến trúc (Meltdown, Spectre, Foreshadow).

Khóa riêng tư của ví và thẩm quyền ký khối của mạng lưới sẽ bị đánh cắp hoàn toàn. Giải pháp trong Kỷ nguyên 2 là kích hoạt công nghệ **Phần cứng Vùng nhớ Cô lập (Hardware Enclaves & Memory Encryption)**.

---

## 2. KIẾN TRÚC BẢO VỆ ĐA TẦNG (DEFENSE-IN-DEPTH)

```
+-------------------------------------------------------------+
| NON-SECURE MEMORY SPACE (Linux / Userland OS)               |
| - Chạy các tiến trình thông thường, tải file, logs          |
+-------------------------------------------------------------+
                               |
                   Ranh giới Phần cứng (Hardware Barrier)
                               |
+------------------------------v------------------------------+
| HARDWARE SECURE ENCLAVE (AMD SEV-SNP / Intel SGX / Keystone)|
|                                                             |
|   +-----------------------------------------------------+   |
|   | AXQ KEY VAULT ENGINE                                |   |
|   |  - Khóa riêng tư giải mã trực tiếp trong CPU Cache   |   |
|   |  - Mã hóa toàn bộ đường truyền RAM bằng phần cứng   |   |
|   |  - Chữ ký giao dịch được tạo bên trong Enclave       |   |
|   +-----------------------------------------------------+   |
+-------------------------------------------------------------+
```

---

## 3. CƠ CHẾ TRIỂN KHAI KỸ THUẬT

### 3.1. Mã hóa Bộ nhớ Toàn phần bằng Phần cứng (AMD SEV-SNP / Intel TME)
- Mọi trang nhớ được phân bổ cho AXQ Vault đều được CPU tự động mã hóa bằng thuật toán **AES-128/256 XTS** thông qua một khóa bí mật độc lập được sinh ra ngẫu nhiên trong bộ vi điều khiển an toàn (Secure Processor) của CPU.
- Ngay cả khi hacker rút thanh RAM ra khỏi máy chủ đang chạy để đọc dữ liệu vật lý, toàn bộ nội dung thu được chỉ là chuỗi nhiễu ngẫu nhiên vô nghĩa.

### 3.2. Cấu hình RISC-V Physical Memory Protection (PMP)
Trên kiến trúc mở RISC-V, chúng tôi định cấu hình các thanh ghi PMP (`pmpcfg0`, `pmpaddr0`) trong Machine Mode:
```assembly
# Khóa vùng nhớ chứa Khóa Ví AXQ (Địa chỉ 0x80000000 - 0x8000FFFF)
# Chỉ cho phép Machine Mode truy cập; cấm hoàn toàn User/Supervisor Mode

li t0, 0x80000000
srli t0, t0, 2
csrw pmpaddr0, t0

# Thiết lập cờ: Khóa (L=1), Không Đọc/Ghi/Thực thi từ OS (R=0, W=0, X=0, A=TOR)
li t1, 0x88
csrw pmpcfg0, t1
```

### 3.3. Cơ chế Tự hủy Dữ liệu (Tamper-Triggered Zero-Fill)
Khi cảm biến trên bo mạch chủ phát hiện một trong các dấu hiệu xâm nhập:
- Vỏ thùng máy bị mở (Chassis Intrusion Switch kích hoạt).
- Điện áp CPU giảm đột ngột (Dấu hiệu của tấn công Voltage Glitching).
- Xung nhịp hệ thống bị biến dạng.

Vi nhân sẽ phát tín hiệu ngắt phi điều kiện (NMI - Non-Maskable Interrupt), kích hoạt vòng lặp xóa sạch toàn bộ vùng nhớ Enclave về số `0x00` chỉ trong **dưới 50 chu kỳ xung nhịp**:
```c
static inline void secure_memory_wipe(volatile void *v, size_t n) {
    volatile unsigned char *p = v;
    while (n--) *p++ = 0;
    // Đảm bảo ghi trực tiếp xuống RAM, bỏ qua cache
    asm volatile("wbinvd" ::: "memory");
}
```

---

## 4. KẾT LUẬN

Nhờ cơ chế vùng nhớ cô lập Enclave, hệ thống Wikialisa Core đạt tiêu chuẩn bảo mật ngang hàng với các thiết bị lưu trữ chuyên dụng của ngân hàng (HSM - Hardware Security Module) ngay trên phần cứng máy chủ thương mại.

