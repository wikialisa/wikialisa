# 🔍 PHÂN TÍCH HIỆN TRẠNG TỪ WIKIALISA_CORE_IDEA.md VÀ CÁC ĐIỂM NGHẼN KỸ THUẬT
### *Baseline Analysis: From axq-master Bash Scripts to Physical Constraints*

---

## 1. MÔ TẢ HIỆN TRẠNG TRONG `WIKIALISA_CORE_IDEA.md`

Trong tài liệu [`WIKIALISA_CORE_IDEA.md`](../../WIKIALISA_CORE_IDEA.md), mã nguồn quản trị và thực thi mạng lưới AXQ Chain được tích hợp dưới dạng tập lệnh Bash `axq-master` nằm tại `/usr/bin/axq-master` (được đưa vào tệp `initrd.img` của hệ điều hành Wikialisa Core).

### Các module chức năng hiện tại:
1. **Khởi tạo và Mã hóa Ví (`cmd_create`):**
   ```bash
   PRIV_KEY=$(openssl rand -hex 32)
   PUB_ADDR="AXQ$(echo "$PRIV_KEY" | sha256sum | awk '{print $1}' | cut -c1-32)"
   # Mã hóa tệp lưu trữ wallet.dat bằng AES-256-CBC với passphrase từ người dùng:
   echo "$PRIV_KEY:$PUB_ADDR" | openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -out "$WALLET_FILE" -pass "pass:$PASSPHRASE"
   ```
2. **Khai thác Khối Proof-of-Kernel (`cmd_mine`):**
   ```bash
   KERNEL_VER=$(uname -r)
   TIMESTAMP=$(date +%s)
   NONCE=0
   while true; do
       BLOCK_DATA="$KERNEL_VER:$TIMESTAMP:$NONCE"
       HASH=$(echo -n "$BLOCK_DATA" | sha256sum | awk '{print $1}')
       if echo "$HASH" | grep -q "^$TARGET_DIFFICULTY"; then
           # Ghi nhận phần thưởng khối vào ví...
           break
       fi
       NONCE=$((NONCE + 1))
   done
   ```
3. **Mạng Ngang Hàng P2P (`cmd_node`):**
   ```bash
   echo -e "AXQ-PROTOCOL-V1-READY\n" | nc -l -p "$NODE_PORT" -q 1
   ```

---

## 2. PHÂN TÍCH ĐIỂM NGHẼN VÀ GIỚI HẠN VẬT LÝ

```
               USERLAND EXECUTION PATH (HIỆN TẠI)
┌─────────────────────────────────────────────────────────────────┐
│ Shell Script: axq-master                                        │
│   ├── Fork process -> Call /usr/bin/openssl (AES-256)           │
│   ├── Fork process -> Call /usr/bin/sha256sum (Pipe overhead)   │
│   ├── Pipe stdout -> awk / cut (String manipulation)            │
│   └── Fork process -> Call /usr/bin/nc (Raw socket)             │
└────────────────────────────────┬────────────────────────────────┘
                                 │ System Calls (fork, exec, read, write)
┌────────────────────────────────▼────────────────────────────────┐
│ WIKIALISA KERNEL (wikialisa/wikialisa)                          │
│   ├── Context Switch (User Mode <-> Kernel Mode)                │
│   ├── Virtual Memory Mapping (TLB Invalidation)                 │
│   └── File System Buffer Cache I/O                              │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Hardware Instructions
┌────────────────────────────────▼────────────────────────────────┐
│ HARDWARE (x86_64 CPU & RAM)                                     │
│   ├── Private Key nằm lộ trong RAM không bảo vệ                │
│   └── Tốc độ giới hạn: ~2,500 hashes/giây do chi phí phần mềm   │
└─────────────────────────────────────────────────────────────────┘
```

### Chi tiết các điểm nghẽn:

### 2.1. Chi phí phân nhánh tiến trình (Process Spawning Overhead)
- Mỗi lần băm một Nonce trong vòng lặp `while true`, script gọi `echo -n "$BLOCK_DATA" | sha256sum`.
- Trên Linux x86_64, một lời gọi `fork()` + `execve()` tiêu tốn trung bình từ **15,000 đến 40,000 chu kỳ xung nhịp CPU** (Clock cycles).
- Hậu quả: Dù CPU có khả năng băm hàng chục triệu mã SHA-256 mỗi giây, script chỉ đạt được khoảng **2,000 - 4,000 lần thử/giây** (lãng phí hơn 99.9% công suất CPU vào việc quản lý tiến trình của hệ điều hành).

### 2.2. Nguy cơ rò rỉ khóa bí mật qua bộ nhớ (Memory Exfiltration Risk)
- Khi thực thi lệnh `axq-master balance`, biến `$PRIV_KEY` được giải mã và lưu tạm trong biến môi trường của Shell.
- Vùng nhớ này nằm trong không gian người dùng (Userland Virtual Memory) không có cờ `mlock()`:
  - Có thể bị ghi tạm xuống phân vùng tráo đổi (Swap partition) hoặc tệp coredump nếu tiến trình bị treo.
  - Dễ bị quét bởi các tiến trình độc hại chạy cùng quyền hoặc qua kỹ thuật khai thác bộ nhớ như Rowhammer, Meltdown/Spectre.

### 2.3. Thiếu tính tiền định (Lack of Determinism) và Trôi thời gian (Jitter)
- Tiện ích `nc -l` (Netcat) dựa trên TCP socket truyền thống ở tầng ứng dụng. Khi mạng chịu tải cao, cơ chế hàng đợi socket và ngắt CPU (Software Interrupts - SoftIRQ) gây ra hiện tượng jitter lên tới vài mili-giây, làm chậm quá trình xác nhận giao dịch giữa các node.

---

## 3. KẾT LUẬN & ĐỊNH HƯỚNG GIẢI PHÁP

Để khắc phục triệt để các hạn chế trên, lộ trình tiến hóa bắt buộc phải:
1. **Bước 1:** Đưa các phép toán băm PoK và mã hóa vào trực tiếp nhân Linux (`/drivers/crypto/axq/`) và cung cấp System Call chuyên dụng để loại bỏ hoàn toàn chi phí `fork`/`exec`.
2. **Bước 2:** Xây dựng cơ chế cô lập khóa riêng tư trong vùng nhớ bảo vệ (Locked Kernel Keyring & Hardware Enclave).
3. **Bước 3:** Chuyển dịch toàn bộ logic xử lý từ phần mềm sang phần cứng chuyên dụng (FPGA & Silicon Core) để đạt hiệu suất tính toán tối ưu và bảo mật vật lý tuyệt đối.

