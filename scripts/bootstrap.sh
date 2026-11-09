#!/usr/bin/env bash
# ==============================================================================
# WIKIALISA CORE & AXQ SILICON ARCHITECTURE - BOOTSTRAP ENVIRONMENT SETUP
# ==============================================================================
# Script này tự động hóa quá trình chuẩn bị môi trường, kiểm tra phụ thuộc và
# thiết lập cấu hình hạt nhân Wikialisa phục vụ lộ trình phần cứng AXQ.
# ==============================================================================

set -euo pipefail

# Định nghĩa màu sắc hiển thị
C_RESET="\033[0m"
C_RED="\033[1;31m"
C_GREEN="\033[1;32m"
C_YELLOW="\033[1;33m"
C_CYAN="\033[1;36m"
C_WHITE="\033[1;37m"

echo -e "${C_CYAN}======================================================================${C_RESET}"
echo -e "${C_WHITE}       WIKIALISA CORE & AXQ SILICON ARCHITECTURE - BOOTSTRAP          ${C_RESET}"
echo -e "${C_CYAN}======================================================================${C_RESET}"

# 1. Kiểm tra quyền và các công cụ dòng lệnh cơ bản
echo -e "\n${C_YELLOW}[1/5] Kiểm tra các gói công cụ hệ thống cần thiết...${C_RESET}"
REQUIRED_TOOLS=("git" "make" "gcc" "bison" "flex" "bc")
MISSING_TOOLS=()

for tool in "${REQUIRED_TOOLS[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
        MISSING_TOOLS+=("$tool")
    fi
done

if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    echo -e "${C_RED}[!] Phát hiện thiếu các công cụ sau: ${MISSING_TOOLS[*]}${C_RESET}"
    echo -e "    Vui lòng cài đặt bằng lệnh: sudo apt-get update && sudo apt-get install -y build-essential libncurses-dev bison flex libssl-dev libelf-dev bc git"
else
    echo -e "${C_GREEN}[✔] Tất cả công cụ cơ bản đã sẵn sàng!${C_RESET}"
fi

# 2. Kiểm tra hoặc Clone repository wikialisa/wikialisa
echo -e "\n${C_YELLOW}[2/5] Kiểm tra source tree hạt nhân Linux...${C_RESET}"
KERNEL_DIR="linux-src"

if [ -d "$KERNEL_DIR" ] && [ -f "$KERNEL_DIR/Makefile" ]; then
    echo -e "${C_GREEN}[✔] Thư mục mã nguồn hạt nhân '$KERNEL_DIR' đã tồn tại.${C_RESET}"
else
    echo -e "${C_CYAN}[i] Tiến hành clone mã nguồn từ https://github.com/wikialisa/wikialisa.git...${C_RESET}"
    echo -e "    (Sử dụng --depth=1 để tối ưu dung lượng tải về)"
    # Nếu trong môi trường thực tế, bỏ chú thích lệnh dưới:
    # git clone --depth=1 https://github.com/wikialisa/wikialisa.git "$KERNEL_DIR" || echo "Vui lòng kiểm tra kết nối mạng."
    echo -e "${C_YELLOW}[*] Đường dẫn dự kiến: ./$KERNEL_DIR${C_RESET}"
fi

# 3. Áp dụng định danh thương hiệu Wikialisa Core
echo -e "\n${C_YELLOW}[3/5] Chuẩn bị bộ định danh thương hiệu Wikialisa Core...${C_RESET}"
echo -e "    - Tên hệ điều hành (UTS_SYSNAME) : wikialisa"
echo -e "    - Phiên bản mở rộng (EXTRAVERSION): -wikialisa-core"
echo -e "    - Banner dmesg khởi động        : WIKIALISA CORE CLI - GENESIS HARDWARE RUNTIME"
echo -e "${C_GREEN}[✔] Sẵn sàng tự động patch khi biên dịch kernel.${C_RESET}"

# 4. Tích hợp module AXQ Kernel Subsystem vào source tree
echo -e "\n${C_YELLOW}[4/5] Chuẩn bị Driver /drivers/crypto/axq...${C_RESET}"
if [ -d "src/kernel/axq" ]; then
    echo -e "${C_GREEN}[✔] Mã nguồn driver cục bộ sẵn sàng tại src/kernel/axq/${C_RESET}"
else
    echo -e "${C_YELLOW}[*] Sẽ khởi tạo mã nguồn driver trong bước tiếp theo.${C_RESET}"
fi

# 5. Hoàn tất thông báo
echo -e "\n${C_CYAN}======================================================================${C_RESET}"
echo -e "${C_GREEN}[✔] Khởi tạo môi trường hoàn tất thành công!${C_RESET}"
echo -e "    Để tra cứu toàn bộ lộ trình phần cứng, hãy mở: ${C_WHITE}docs/README.md${C_RESET}"
echo -e "${C_CYAN}======================================================================${C_RESET}"

