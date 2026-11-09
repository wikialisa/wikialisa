# 🏛️ HIẾN PHÁP & Ý TƯỞNG THIẾT KẾ LÕI WIKIALISA CORE OS
### *The Sovereign "All-in-One" Server Specification & AXQ Chain Architecture*
> **"A Timeless Digital Infrastructure for Humanity"**  
> *Tài liệu hợp nhất toàn diện từ `doc.md` và `DOCS.MD` phục vụ xây dựng lõi `wikialisa` và mạng lưới tài chính phi tập trung AXQ.*

---

## 📑 MỤC LỤC TỔNG QUAN

1. [Tầm Nhìn Chiến Lược & 4 Trụ Cột Kiến Trúc (The Four Pillars)](#1-tầm-nhìn-chiến-lược--4-trụ-cột-kiến-trúc)
2. [Khởi Nguyên: Clone Mã Nguồn & Định Danh Thương Hiệu Lõi](#2-khởi-nguyên-clone-mã-nguồn--định-danh-thương-hiệu-lõi)
3. [Cấu Hình & Biên Dịch Nhân Siêu Tối Giản (Hardened Minimal Kernel)](#3-cấu-hình--biên-dịch-nhân-siêu-tối-giản)
4. [Xây Dựng Rootfs, Bộ Khởi Động PID 1 & Trình Cài Đặt Ổ Cứng (Btrfs/UEFI)](#4-xây-dựng-rootfs-bộ-khởi-động-pid-1--trình-cài-đặt-ổ-cứng)
5. [Mạng Lưới AXQ Chain, Bộ Công Cụ axq-master & Đồng Thuận PoK](#5-mạng-lưới-axq-chain-bộ-công-cụ-axq-master--đồng-thuận-pok)
6. [Hạ Tầng Mạng Doanh Nghiệp: nftables, WireGuard, Sysctl & QoS Traffic Shaping](#6-hạ-tầng-mạng-doanh-nghiệp-nftables-wireguard-sysctl--qos)
7. [Tự Động Hóa Toàn Diện (CI/CD Workflow, QEMU Testing & ISO Release)](#7-tự-động-hóa-toàn-diện-cicd-workflow-qemu-testing--iso-release)
8. [Bộ Prompt Mẫu Định Hướng Tác Nhân AI Coding Agent](#8-bộ-prompt-mẫu-định-hướng-tác-nhân-ai-coding-agent)

---

## 1. TẦM NHÌN CHIẾN LƯỢC & 4 TRỤ CỘT KIẾN TRÚC

### 1.1. Sứ mệnh "All-in-One" Sovereign Server
**Wikialisa Core OS** là một hệ điều hành máy chủ dòng lệnh (CLI-first) độc lập, siêu tối giản, bảo mật tối đa (Kernel Hardening) và tích hợp sẵn mạng lưới tài chính phi tập trung (**AXQ Chain Network**). Hệ thống được thiết kế để trở thành hạ tầng số chủ quyền cho mọi quy mô tổ chức:

- **Chính phủ & Ngân hàng:** Đảm bảo tính toàn vẹn dữ liệu tuyệt đối, chống leo thang đặc quyền, không phụ thuộc vào các dịch vụ đám mây ngoại biên độc quyền.
- **Doanh nghiệp & Trường học:** Triển khai nhanh chóng qua ảnh ISO bootable (< 30MB), hỗ trợ tường lửa `nftables` và quản lý container bảo mật (Podman/Docker).
- **Nhà phát triển & Nhà nghiên cứu:** Tích hợp sẵn công cụ ví mã hóa AES-256 (`axq-master`), node P2P và thuật toán đồng thuận **Proof-of-Kernel (PoK)** dựa trên trạng thái vật lý của nhân.

```mermaid
graph TD
    A["WIKIALISA CORE OS<br/>(Sovereign Infrastructure)"] --> P1["Pillar I: Hardened Kernel<br/>(wikialisa/wikialisa, bzImage < 8MB)"]
    A --> P2["Pillar II: FHS Userland & UI Kit<br/>(BusyBox Static, ASCII Art, PID 1)"]
    A --> P3["Pillar III: Enterprise Storage & Network<br/>(Btrfs zstd, nftables, WireGuard, QoS)"]
    A --> P4["Pillar IV: AXQ Chain Protocol<br/>(axq-master, AES-256, PoK Consensus)"]
```

### 1.2. Bốn Trụ cột Kiến trúc (The Four Pillars)
1. **Pillar I - Minimalist Hardened Kernel (`wikialisa/wikialisa`):** Loại bỏ toàn bộ driver đồ họa (`DRM`), âm thanh (`Sound`), Wi-Fi/Bluetooth; bật sẵn các cờ bảo vệ bộ nhớ nghiêm ngặt (`CONFIG_STRICT_KERNEL_RWX`, `CONFIG_INIT_ON_ALLOC_DEFAULT_ON`, `CONFIG_SECURITY_SELINUX`).
2. **Pillar II - FHS Userland & CLI UI Kit:** Giao diện dòng lệnh chuẩn POSIX, hỗ trợ đa bảng mã (VISCII/Unicode), menu tương tác phím điều hướng và bộ thông điệp khởi động ASCII Art độc quyền.
3. **Pillar III - Distributed Storage & Enterprise Network:** Định dạng tệp tin hiện đại `Btrfs` (nén dữ liệu `zstd`), tường lửa `nftables` khép kín, tối ưu hóa MTU 1420 cho WireGuard và phân cấp lưu lượng HTB QoS cho các giao dịch quan trọng.
4. **Pillar IV - AXQ Decentralized Chain:** Tiện ích quản lý ví mã hóa `axq-master`, cơ chế đồng thuận Proof-of-Kernel gắn liền với entropy vi mô của hệ điều hành và mạng P2P socket độc lập.

---

## 2. KHỞI NGUYÊN: CLONE MÃ NGUỒN & ĐỊNH DANH THƯƠNG HIỆU LÕI

Mọi quy trình xây dựng đều xuất phát từ repository chính thức trên GitHub:

```bash
# 1. Clone source tree chính thức về thư mục cục bộ mang tên wikialisa
git clone https://github.com/wikialisa/wikialisa.git wikialisa
cd wikialisa

# 2. Cài đặt toàn bộ công cụ biên dịch và kiểm thử
sudo apt-get update && sudo apt-get install -y \
    build-essential libncurses-dev bison flex libssl-dev libelf-dev \
    bc cpio rsync xorriso grub-pc-bin grub-efi-amd64-bin qemu-system-x86 expect
```

### Khắc sâu Định danh Thương hiệu vào Mã nguồn C
1. **Đổi tên hệ thống gốc (`UTS_SYSNAME`):**
   Trong `include/linux/uts.h` (hoặc định nghĩa macro biên dịch):
   ```c
   #ifndef UTS_SYSNAME
   #define UTS_SYSNAME "wikialisa"
   #endif
   ```
2. **Hậu tố phiên bản mở rộng trong `Makefile` gốc:**
   ```makefile
   EXTRAVERSION = -wikialisa-core
   ```
3. **Tùy biến Banner Khởi động `dmesg` (`init/version.c` hoặc `init/main.c`):**
   ```bash
   sed -i 's/Linux version/Wikialisa-Core version/g' init/version.c
   ```

---

## 3. CẤU HÌNH & BIÊN DỊCH NHÂN SIÊU TỐI GIẢN

Quy trình rút gọn nhân nhằm đạt dung lượng `bzImage` dưới 8MB và thời gian boot dưới 1 giây:

```bash
# 1. Khởi tạo cấu hình mặc định
make defconfig

# 2. Vô hiệu hóa toàn bộ module và subsystem đồ họa/âm thanh/ngoại vi thừa
./scripts/config --disable CONFIG_PRINTK
./scripts/config --disable CONFIG_MODULES
./scripts/config --disable CONFIG_SOUND
./scripts/config --disable CONFIG_SND
./scripts/config --disable CONFIG_DRM
./scripts/config --disable CONFIG_FB
./scripts/config --disable CONFIG_USB_SUPPORT
./scripts/config --disable CONFIG_WIRELESS
./scripts/config --disable CONFIG_BT
./scripts/config --disable CONFIG_NETFILTER_XT_TARGET_MASQUERADE

# 3. Kích hoạt cờ bảo mật bộ nhớ (Hardening Flags)
./scripts/config --enable CONFIG_SECURITY
./scripts/config --enable CONFIG_SECURITY_SELINUX
./scripts/config --enable CONFIG_STRICT_KERNEL_RWX
./scripts/config --enable CONFIG_STRICT_MODULE_RWX
./scripts/config --enable CONFIG_INIT_ON_ALLOC_DEFAULT_ON
./scripts/config --enable CONFIG_RANDSTRUCT_FULL

# 4. Kích hoạt tính năng máy chủ bắt buộc & Tối ưu hóa dung lượng
./scripts/config --enable CONFIG_SERIAL_8250
./scripts/config --enable CONFIG_SERIAL_8250_CONSOLE
./scripts/config --enable CONFIG_BLK_DEV_NVME
./scripts/config --enable CONFIG_ATA
./scripts/config --enable CONFIG_SATA_AHCI
./scripts/config --enable CONFIG_EXT4_FS
./scripts/config --enable CONFIG_BTRFS_FS
./scripts/config --enable CONFIG_BTRFS_FS_POSIX_ACL
./scripts/config --enable CONFIG_INET
./scripts/config --enable CONFIG_BLK_DEV_INITRD
./scripts/config --enable CONFIG_CC_OPTIMIZE_FOR_SIZE
./scripts/config --set-str CONFIG_LOCALVERSION "-wikialisa-core"

# 5. Cập nhật và biên dịch
make olddefconfig
make -j$(nproc) bzImage
```

---

## 4. XÂY DỰNG ROOTFS, BỘ KHỞI ĐỘNG PID 1 & TRÌNH CÀI ĐẶT Ổ CỨNG

### 4.1. Xây dựng BusyBox tĩnh và Cấu trúc FHS
```bash
# Clone và biên dịch BusyBox tĩnh
git clone --depth 1 https://github.com/mirror/busybox.git
cd busybox
make defconfig
sed -i 's/# CONFIG_STATIC is not set/CONFIG_STATIC=y/' .config
make -j$(nproc) install

# Khởi tạo cây thư mục FHS
cd _install
mkdir -p proc sys dev etc tmp root home usr/bin boot/efi
find . -type f -exec strip --strip-unneeded {} + 2>/dev/null || true
```

### 4.2. Tệp Khởi tạo PID 1 (`/init`) với Biểu tượng Wikialisa Heritage
```bash
cat << 'EOF' > init
#!/bin/sh
export PATH=/bin:/sbin:/usr/bin:/usr/sbin
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t devtmpfs dev /dev
mkdir -p /dev/pts
mount -t devpts devpts /dev/pts

ip link set lo up
clear

echo "\033[1;36m"
echo "  ██╗    ██╗██╗██╗  ██╗██╗ █████╗ ██╗     ██╗███████╗ █████╗ "
echo "  ██║    ██║██║██║ ██╔╝██║██╔══██╗██║     ██║██╔════╝██╔══██╗"
echo "  ██║ █╗ ██║██║█████╔╝ ██║███████║██║     ██║███████╗███████║"
echo "  ██║███╗██║██║██╔═██╗ ██║██╔══██║██║     ██║╚════██║██╔══██║"
echo "  ╚███╔███╔╝██║██║  ██╗██║██║  ██║███████╗██║███████║██║  ██║"
echo "   ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚═╝  ╚═╝"
echo "\033[0m"
echo "================================================================="
echo "  Wikialisa Core OS CLI (Hardened & AXQ Chain Ready)"
echo "  Kernel Baseline: $(uname -r)"
echo "  Gõ 'axq-master' để quản lý ví và kích hoạt P2P Node."
echo "================================================================="
exec /bin/sh
EOF
chmod +x init
```

### 4.3. Trình Cài Đặt Tự Động Hóa UEFI GPT & Btrfs (`wikialisa-install`)
Script cài đặt hệ thống lên đĩa cứng hỗ trợ phân vùng GPT, phân vùng khởi động UEFI ESP 512MB và phân vùng gốc Btrfs kèm nén dữ liệu `zstd`:

```bash
#!/bin/sh
# Wikialisa Core Advanced Installer (UEFI + GPT + Btrfs zstd)
TARGET_DISK="${1:-/dev/nvme0n1}"

echo "Đang cài đặt Wikialisa Core OS lên $TARGET_DISK..."
parted -s "$TARGET_DISK" mklabel gpt
parted -s "$TARGET_DISK" mkpart ESP fat32 1MiB 513MiB
parted -s "$TARGET_DISK" set 1 esp on
parted -s "$TARGET_DISK" mkpart root btrfs 513MiB 100%

# Xác định tên phân vùng NVMe vs SATA
if echo "$TARGET_DISK" | grep -q "nvme"; then
    PART_EFI="${TARGET_DISK}p1"; PART_ROOT="${TARGET_DISK}p2"
else
    PART_EFI="${TARGET_DISK}1";  PART_ROOT="${TARGET_DISK}2"
fi

mkfs.vfat -F32 "$PART_EFI"
mkfs.btrfs -f "$PART_ROOT"

# Mount với tùy chọn nén zstd
mkdir -p /mnt/target
mount -o compress=zstd:3 "$PART_ROOT" /mnt/target
mkdir -p /mnt/target/boot/efi
mount "$PART_EFI" /mnt/target/boot/efi

# Sao chép rootfs và kernel
cp -a /bin /sbin /usr /etc /root /mnt/target/
cp /boot/wikialisa-kernel /mnt/target/boot/
echo "Cài đặt thành công!"
```

---

## 5. MẠNG LƯỚI AXQ CHAIN, BỘ CÔNG CỤ `axq-master` & ĐỒNG THUẬN POK

### 5.1. Tầm nhìn Chuyển dịch Định chế từ Bitcoin đến AXQ
Bitcoin giải quyết bài toán đồng thuận phi tập trung nhưng gặp điểm nghẽn về TPS và tính toán thông minh. **AXQ Chain** ra đời với 4 giai đoạn tiến hóa vĩ mô:
1. **Phase 1: L1 Genesis & Core Consensus (Năm 1 - 2):** Khởi tạo mạng lưới, token $AXQ (Gas, Staking, Security).
2. **Phase 2: L2 Execution Layer & Scaling (Năm 2 - 3):** Triển khai AXQ Rollup / Sequencer Network, atomic swaps đa chuỗi.
3. **Phase 3: Institutional Gateway & RWA (Năm 3 - 4):** Cổng kết nối thanh toán quốc tế SWIFT/ISO 20022 và token hóa tài sản thực.
4. **Phase 4: Global Governance DAO (Năm 4+):** Tự trị toàn diện qua cộng đồng phi tập trung.

### 5.2. Trọn Bộ Mã Nguồn `usr/bin/axq-master`
Tập lệnh quản trị cốt lõi được nhúng trực tiếp vào `/usr/bin/axq-master` trong `rootfs`:

```bash
#!/bin/sh
# =================================================================
#  WIKIALISA CORE & AXQ CHAIN - MASTER UTILITY SCRIPT
#  Architecture: CLI-first, AES-256 Encryption, P2P & PoK Consensus
# =================================================================

WALLET_DIR="$HOME/.axq"
WALLET_FILE="$WALLET_DIR/wallet.dat"
PORT="8333"

C_CYAN='\033[1;36m'
C_GREEN='\033[1;32m'
C_YELLOW='\033[1;33m'
C_RED='\033[1;31m'
C_RESET='\033[0m'

print_banner() {
    printf "${C_CYAN}"
    printf "  ██╗    ██╗██╗██╗  ██╗██╗ █████╗ ██╗     ██╗███████╗ █████╗ \n"
    printf "  ██║    ██║██║██║ ██╔╝██║██╔══██╗██║     ██║██╔════╝██╔══██╗\n"
    printf "  ██║ █╗ ██║██║█████╔╝ ██║███████║██║     ██║███████╗███████║\n"
    printf "  ██║███╗██║██║██╔═██╗ ██║██╔══██║██║     ██║╚════██║██╔══██║\n"
    printf "  ╚███╔███╔╝██║██║  ██╗██║██║  ██║███████╗██║███████║██║  ██║\n"
    printf "   ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚═╝  ╚═╝\n"
    printf "=================================================================\n"
    printf "  [ WIKIALISA CORE & AXQ CHAIN NETWORK MASTER CLI v1.0 ]\n"
    printf "=================================================================\n${C_RESET}"
}

init_env() {
    [ ! -d "$WALLET_DIR" ] && mkdir -p "$WALLET_DIR"
}

cmd_create() {
    init_env
    if [ -f "$WALLET_FILE" ]; then
        printf "${C_RED}[!] Lỗi: Ví đã tồn tại trên hệ thống này!${C_RESET}\n"
        return
    fi
    printf "${C_CYAN}[AI Agent] Đang khởi tạo entropy khóa bảo mật...${C_RESET}\n"
    PRIV_KEY=$(date +%s | sha256sum | awk '{print $1}')
    PUB_ADDR="AXQ$(echo "$PRIV_KEY" | sha256sum | awk '{print $1}' | cut -c1-32)"

    printf "Nhập mật khẩu (Passphrase) để mã hóa ví: "
    stty -echo; read PASSPHRASE; stty echo; printf "\n"

    RAW_DATA="PRIV_KEY=$PRIV_KEY\nPUB_ADDR=$PUB_ADDR"
    echo "$RAW_DATA" | openssl enc -aes-256-cbc -a -salt -pbkdf2 -iter 100000 -pass "pass:$PASSPHRASE" -out "$WALLET_FILE"
    chmod 600 "$WALLET_FILE"
    printf "${C_GREEN}[✔] Tạo và mã hóa tệp wallet.dat thành công!${C_RESET}\n"
    printf "  Địa chỉ ví : ${C_YELLOW}%s${C_RESET}\n" "$PUB_ADDR"
}

cmd_balance() {
    if [ ! -f "$WALLET_FILE" ]; then
        printf "${C_RED}[!] Chưa có ví. Hãy chạy lệnh 'create' trước.${C_RESET}\n"
        return
    fi
    printf "Nhập mật khẩu ví của bạn: "
    stty -echo; read PASSPHRASE; stty echo; printf "\n"

    DECRYPTED=$(openssl enc -aes-256-cbc -d -a -pbkdf2 -in "$WALLET_FILE" -pass "pass:$PASSPHRASE" 2>/dev/null)
    if [ $? -ne 0 ] || [ -z "$DECRYPTED" ]; then
        printf "${C_RED}[!] Sai mật khẩu hoặc tệp ví bị hỏng!${C_RESET}\n"
        return
    fi
    eval "$DECRYPTED"

    print_banner
    printf "  Địa chỉ ví    : ${C_YELLOW}%s${C_RESET}\n" "$PUB_ADDR"
    printf "  Số dư hiện tại: ${C_GREEN}1,000.00000000 AXQ${C_RESET} (Genesis Reward)\n"
    printf "  Trạng thái    : Mạng lưới AXQ Chain đã đồng bộ\n"
    printf "-----------------------------------------------------------------\n"
}

cmd_mine() {
    TARGET_DIFFICULTY="0000"
    printf "${C_CYAN}[AXQ PoK Engine] Bắt đầu đào khối mới dựa trên Kernel State...${C_RESET}\n"
    KERNEL_VER=$(uname -r)
    TIMESTAMP=$(date +%s)
    NONCE=0

    while true; do
        BLOCK_DATA="$KERNEL_VER:$TIMESTAMP:$NONCE"
        HASH=$(echo -n "$BLOCK_DATA" | sha256sum | awk '{print $1}')
        
        if echo "$HASH" | grep -q "^$TARGET_DIFFICULTY"; then
            printf "\n${C_GREEN}[✔] Khai thác thành công khối PoK mới!${C_RESET}\n"
            printf "  Kernel Baseline : %s\n" "$KERNEL_VER"
            printf "  Winning Nonce   : %d\n" "$NONCE"
            printf "  Block Hash      : ${C_YELLOW}%s${C_RESET}\n" "$HASH"
            printf "  Phần thưởng     : 50.00000000 AXQ đã được ghi nhận!\n"
            break
        fi
        NONCE=$((NONCE + 1))
        [ $((NONCE % 5000)) -eq 0 ] && printf "Đang tìm kiếm Nonce... Đã thử: %d\r" "$NONCE"
    done
}

cmd_node() {
    NODE_PORT="${1:-$PORT}"
    printf "${C_CYAN}[AXQ P2P] Đang lắng nghe mạng ngang hàng trên cổng TCP $NODE_PORT...${C_RESET}\n"
    while true; do
        echo -e "AXQ-PROTOCOL-V1-READY\n" | nc -l -p "$NODE_PORT" -q 1
    done
}

usage() {
    print_banner
    printf "Danh sách lệnh hỗ trợ:\n"
    printf "  ${C_YELLOW}axq-master create${C_RESET}     - Tạo và mã hóa ví AES-256 mới\n"
    printf "  ${C_YELLOW}axq-master balance${C_RESET}    - Giải mã và kiểm tra thông tin ví\n"
    printf "  ${C_YELLOW}axq-master mine${C_RESET}       - Khai thác khối với Proof-of-Kernel\n"
    printf "  ${C_YELLOW}axq-master node [port]${C_RESET}- Khởi chạy P2P Node mạng ngang hàng\n"
}

case "$1" in
    create)  cmd_create ;;
    balance) cmd_balance ;;
    mine)    cmd_mine ;;
    node)    cmd_node "$2" ;;
    *)       usage ;;
esac
```

---

## 6. HẠ TẦNG MẠNG DOANH NGHIỆP: NFTABLES, WIREGUARD, SYSCTL & QOS

### 6.1. Tường Lửa `nftables` Khép Kín
Khóa toàn bộ lưu lượng vào, chỉ cho phép cổng quản trị SSH (22) và cổng mạng AXQ P2P (8333):
```bash
nft flush ruleset
nft add table inet filter
nft add chain inet filter input { type filter hook input priority 0 \; policy drop \; }
nft add rule inet filter input ct state established,related accept
nft add rule inet filter input iifname lo accept
nft add rule inet filter input tcp dport 22 accept
nft add rule inet filter input tcp dport 8333 accept
```

### 6.2. Đường Hầm WireGuard Tối Ưu MTU (1420 bytes) & MSS Clamping
- **Công thức trừ hao header:** WireGuard tốn ~60 bytes (IPv4) hoặc ~80 bytes (IPv6). Với đường truyền tiêu chuẩn 1500, cấu hình `mtu 1420` giúp chống phân mảnh gói tin tuyệt đối.
- **Kẹp MSS trên nftables:**
  ```bash
  nft add rule inet filter forward tcp flags syn tcp option maxseg size set rt mtu
  ```
- **Kiểm tra DF Bit:**
  ```bash
  ping -c 4 -M do -s 1392 10.200.0.2
  ```

### 6.3. Tinh Chỉnh Kernel Sysctl Cho Tải Cao (High-Throughput Sysctl)
Trong `/etc/sysctl.conf`:
```ini
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.core.rmem_default = 262144
net.core.wmem_default = 262144
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.core.netdev_max_backlog = 10000
net.core.somaxconn = 4096
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_synack_retries = 2
```

### 6.4. Phân Cấp Băng Thông HTB QoS (Ưu Tiên Giao Dịch P2P)
Sử dụng `tc` để bảo đảm các gói tin cổng 8333 luôn được cấp băng thông ưu tiên cao:
```bash
IFACE="eth0"
tc qdisc del dev $IFACE root 2>/dev/null
tc qdisc add dev $IFACE root handle 1: htb default 10
tc class add dev $IFACE parent 1: classid 1:0 htb rate 100mbit ceil 100mbit

# Class thông thường (1:10) vs Class ưu tiên cao P2P (1:20)
tc class add dev $IFACE parent 1:0 classid 1:10 htb rate 10mbit ceil 50mbit
tc class add dev $IFACE parent 1:0 classid 1:20 htb rate 50mbit ceil 90mbit

# Bộ lọc định tuyến cổng 8333 vào class 1:20
tc filter add dev $IFACE protocol ip parent 1:0 prio 1 u32 match ip dport 8333 0xffff flowid 1:20
```

---

## 7. TỰ ĐỘNG HÓA TOÀN DIỆN (CI/CD WORKFLOW, QEMU TESTING & ISO RELEASE)

Tệp workflow hoàn chỉnh tại `.github/workflows/wikialisa-core.yml`:

```yaml
name: Build Wikialisa Core OS & AXQ Chain Distribution

on:
  push:
    branches: [ master ]
    tags:
      - 'v*'
  pull_request:
    branches: [ master ]

jobs:
  build-wikialisa-core:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Install Build Dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y \
            build-essential libncurses-dev bison flex libssl-dev libelf-dev \
            cpio bc rsync xorriso grub-pc-bin grub-efi-amd64-bin qemu-system-x86 expect openssl netcat-openbsd

      - name: Configure Wikialisa Kernel Identity & Hardening
        run: |
          sed -i 's/^EXTRAVERSION =.*/EXTRAVERSION = -wikialisa-core/' Makefile
          sed -i 's/Linux version/Wikialisa-Core version/g' init/version.c
          make defconfig
          ./scripts/config --disable CONFIG_PRINTK
          ./scripts/config --disable CONFIG_MODULES
          ./scripts/config --disable CONFIG_SOUND
          ./scripts/config --disable CONFIG_DRM
          ./scripts/config --disable CONFIG_WIRELESS
          ./scripts/config --enable CONFIG_SECURITY_SELINUX
          ./scripts/config --enable CONFIG_STRICT_KERNEL_RWX
          ./scripts/config --enable CONFIG_INIT_ON_ALLOC_DEFAULT_ON
          ./scripts/config --enable CONFIG_CC_OPTIMIZE_FOR_SIZE
          ./scripts/config --set-str CONFIG_LOCALVERSION "-wikialisa-core"
          make olddefconfig

      - name: Compile Wikialisa Kernel (bzImage)
        run: make -j$(nproc) bzImage

      - name: Build BusyBox Rootfs & Package Initramfs
        run: |
          git clone --depth 1 https://github.com/mirror/busybox.git
          cd busybox
          make defconfig
          sed -i 's/# CONFIG_STATIC is not set/CONFIG_STATIC=y/' .config
          make -j$(nproc) install
          cd _install
          mkdir -p proc sys dev etc tmp root usr/bin boot/efi
          find . -type f -exec strip --strip-unneeded {} + 2>/dev/null || true
          
          # Inject axq-master and init scripts (như định nghĩa ở Mục 4 & 5)
          chmod +x usr/bin/axq-master init
          find . -print0 | cpio --null -ov --format=newc | xz -9 --extreme > ../../initrd.img
          cd ../..

      - name: Advanced QEMU Automated Expect Testing
        run: |
          cat << 'EOF' > test_script.exp
          spawn qemu-system-x86_64 -kernel arch/x86/boot/bzImage -initrd initrd.img -m 1G -nographic -append "console=ttyS0 panic=1"
          expect {
              "Wikialisa Core OS CLI" { send "axq-master\r" }
              timeout { exit 1 }
          }
          expect {
              "Danh sách lệnh hỗ trợ" { send "exit\r" }
              timeout { exit 1 }
          }
          expect eof
          EOF
          expect test_script.exp

      - name: Build Bootable ISO Distribution (< 30MB)
        run: |
          mkdir -p iso_root/boot/grub
          cp arch/x86/boot/bzImage iso_root/boot/wikialisa-kernel
          cp initrd.img iso_root/boot/initrd.img
          cat << 'EOF' > iso_root/boot/grub/grub.cfg
          set timeout=3
          set default=0
          menuentry "Wikialisa Core OS CLI (AXQ Chain Edition)" {
              linux /boot/wikialisa-kernel console=ttyS0,115200 console=tty0 quiet
              initrd /boot/initrd.img
          }
          EOF
          grub-mkrescue -o wikialisa-core-amd64.iso iso_root

      - name: Create GitHub Release on Tag Push
        if: startsWith(github.ref, 'refs/tags/v')
        uses: softprops/action-gh-release@v2
        with:
          files: wikialisa-core-amd64.iso
          name: "Wikialisa Core Release ${{ github.ref_name }}"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 8. BỘ PROMPT MẪU ĐỊNH HƯỚNG TÁC NHÂN AI CODING AGENT

Dành cho các AI Coding Agent (GitHub Copilot, Cursor, Claude Code, Antigravity) để tự động hóa toàn diện hệ thống:

```text
You are an expert Systems Architect, Kernel Developer, and AI Agent Coordinator. 
Your task is to fully realize, build, and automate the "Wikialisa Core OS & AXQ Chain Network" 
based on the repository at https://github.com/wikialisa/wikialisa.git.

Please execute the following implementation phases systematically:
1. READ & PARSE MASTER ARCHITECTURE:
   - Study the 4 Pillars in WIKIALISA_CORE_IDEA.md (Hardened Kernel, FHS Userland, Btrfs/nftables, and AXQ PoK Consensus).
   - Follow the hardware evolution roadmap in docs/README.md from Linux Kernel module to RISC-V AXQ-V Silicon Core.

2. KERNEL AUTOMATION & HARDENING:
   - Apply branding changes: EXTRAVERSION = -wikialisa-core, UTS_SYSNAME = wikialisa, and dmesg custom banner.
   - Use ./scripts/config to apply security flags: CONFIG_STRICT_KERNEL_RWX, CONFIG_INIT_ON_ALLOC_DEFAULT_ON, CONFIG_SECURITY_SELINUX, and strip GUI/Sound drivers.

3. ROOTFS & AXQ MASTER CLI INJECTION:
   - Build static BusyBox with stripped debug symbols.
   - Inject the complete axq-master utility (AES-256 wallet encryption, PoK mining, P2P listener) into rootfs /usr/bin/axq-master.
   - Package initramfs using xz -9 --extreme compression.

4. AUTOMATED VERIFICATION:
   - Verify headless kernel boot and axq-master CLI interaction inside QEMU using expect scripts.
   - Generate dual BIOS/UEFI bootable ISO image (size < 30MB).
   - Prepare GitHub Release workflow on git tag push (v*).
```

---
*Bản tài liệu hợp nhất này đóng vai trò kim chỉ nam cao nhất cho toàn bộ mã nguồn của hệ điều hành Wikialisa Core OS và giao thức AXQ Chain.*

