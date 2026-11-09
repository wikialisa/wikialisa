#!/bin/bash
# ==============================================================================
# WIKIALISA SOVEREIGN MOUNT SETUP: /wikialisa/mnt/w
# ==============================================================================
# Thiết lập không gian chủ quyền /wikialisa làm GỐC TỐI THƯỢNG,
# và ánh xạ phân vùng lưu trữ đĩa W: vào /wikialisa/mnt/w.
# ==============================================================================

set -euo pipefail

echo "================================================================="
echo "   THIẾT LẬP KHÔNG GIAN CHỦ QUYỀN /wikialisa & /wikialisa/mnt/w   "
echo "================================================================="

# 1. Tạo thư mục gốc /wikialisa và điểm mount /wikialisa/mnt/w
sudo mkdir -p /wikialisa/mnt/w

# 2. Gắn kết ổ đĩa W: vào /wikialisa/mnt/w
if ! mountpoint -q /wikialisa/mnt/w; then
    sudo mount --bind /mnt/w /wikialisa/mnt/w
    echo "[✔] Đã bind mount /mnt/w vào /wikialisa/mnt/w thành công!"
else
    echo "[*] /wikialisa/mnt/w đã được gắn kết."
fi

# 3. Tạo các liên kết chủ quyền từ /wikialisa/mnt/w/wikialisa lên /wikialisa
SOURCE_DIR="/wikialisa/mnt/w/wikialisa"

ITEMS=(".git" "bin" "docs" "src" "include" "etc" "scripts" "README.md" "WIKIALISA_CORE_IDEA.md" "MEMBERS.md" "CONTRIBUTING.md" "AGENT.md")

for item in "${ITEMS[@]}"; do
    if [ -e "$SOURCE_DIR/$item" ]; then
        sudo ln -sfn "$SOURCE_DIR/$item" "/wikialisa/$item"
    fi
done

# 4. Cài đặt launcher 'axq' hệ thống vào /usr/local/bin
sudo cp -f /wikialisa/bin/axq /usr/local/bin/axq
sudo chmod +x /usr/local/bin/axq /wikialisa/bin/axq

echo "================================================================="
echo "[✔] Hoàn tất thiết lập! Bây giờ bạn có thể gõ lệnh 'axq' ở bất kỳ đâu."
echo "    Gốc chủ quyền : /wikialisa"
echo "    Ổ đĩa ánh xạ  : /wikialisa/mnt/w"
echo "================================================================="
ls -la /wikialisa
