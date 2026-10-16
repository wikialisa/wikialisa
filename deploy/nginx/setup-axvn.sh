#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
#  deploy/nginx/setup-axvn.sh
#  Cấu hình Nginx + Let's Encrypt TLS cho axvn.vn (và www.axvn.vn)
#  → upstream: localhost:3010  (app-web Next.js PWA)
#
#  Chạy: sudo bash deploy/nginx/setup-axvn.sh
#
#  Yêu cầu trước khi chạy:
#    1. DNS axvn.vn      A → <IP server này>
#    2. DNS www.axvn.vn  A → <IP server này>   (hoặc CNAME → axvn.vn)
#    3. Port 80 và 443 mở trên firewall / security group
#    4. app-web đang chạy tại localhost:3010
#       (pm2 start ecosystem.config.cjs --only app-web)
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Config ─────────────────────────────────────────────────────────────────────
DOMAIN="axvn.vn"
DOMAINS="axvn.vn,www.axvn.vn"          # certbot -d list
EMAIL="ops@axvn.vn"
APP_PORT=3010
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
CERTBOT_WEBROOT="/var/www/certbot"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Màu terminal ───────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Kiểm tra root ──────────────────────────────────────────────────────────────
[[ $EUID -eq 0 ]] || error "Script phải chạy với quyền root: sudo bash $0"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   AXQ — Nginx + Let's Encrypt SSL Setup               ║"
echo "║   Domain : $DOMAIN + www.$DOMAIN               ║"
echo "║   Port   : localhost:$APP_PORT                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Bước 1: Cài nginx + certbot nếu chưa có ──────────────────────────────────
info "Bước 1/6: Kiểm tra và cài đặt nginx, certbot..."
apt-get update -qq
apt-get install -y nginx certbot python3-certbot-nginx dnsutils > /dev/null
success "nginx $(nginx -v 2>&1 | grep -o '[0-9.]*$') và certbot đã sẵn sàng"

# ── Bước 2: Kiểm tra app-web đang chạy ────────────────────────────────────────
info "Bước 2/6: Kiểm tra app-web trên port $APP_PORT..."
if ! ss -tlnp | grep -q ":$APP_PORT"; then
    warn "Không tìm thấy process lắng nghe port $APP_PORT."
    warn "Khởi động app-web: pm2 start ecosystem.config.cjs --only app-web"
    read -r -p "Tiếp tục không? [y/N] " yn
    [[ "$yn" =~ ^[Yy]$ ]] || error "Hủy bởi người dùng."
else
    success "app-web đang chạy tại localhost:$APP_PORT"
fi

# ── Bước 3: Kiểm tra DNS ──────────────────────────────────────────────────────
info "Bước 3/6: Kiểm tra DNS $DOMAIN và www.$DOMAIN..."
SERVER_IP=$(curl -s --max-time 5 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
DOMAIN_IP=$(dig +short "$DOMAIN" 2>/dev/null | grep -E '^[0-9]+\.' | tail -1)
WWW_IP=$(dig    +short "www.$DOMAIN" 2>/dev/null | grep -E '^[0-9]+\.' | tail -1)

echo "  Server IP       : $SERVER_IP"
echo "  $DOMAIN IP      : ${DOMAIN_IP:-<không phân giải được>}"
echo "  www.$DOMAIN IP  : ${WWW_IP:-<không phân giải được>}"

DNS_OK=true
if [[ "$SERVER_IP" != "$DOMAIN_IP" ]]; then
    warn "DNS $DOMAIN chưa trỏ đúng! Cần A record: $DOMAIN → $SERVER_IP"
    DNS_OK=false
fi
if [[ "$SERVER_IP" != "$WWW_IP" ]]; then
    warn "DNS www.$DOMAIN chưa trỏ đúng! Cần A/CNAME: www.$DOMAIN → $SERVER_IP"
    DNS_OK=false
fi
[[ "$DNS_OK" == true ]] && success "DNS trỏ đúng cho $DOMAIN và www.$DOMAIN"

# ── Bước 4: Tạo webroot cho ACME challenge ────────────────────────────────────
info "Bước 4/6: Tạo webroot certbot..."
mkdir -p "$CERTBOT_WEBROOT"
success "Webroot: $CERTBOT_WEBROOT"

# ── Bước 5: Triển khai nginx HTTP-only config ─────────────────────────────────
info "Bước 5/6: Triển khai nginx HTTP config..."

# Disable default nếu còn
rm -f "$NGINX_ENABLED_DIR/default" 2>/dev/null || true

# Deploy HTTP-only config
cp "$SCRIPT_DIR/axvn.vn.conf.http-only" "$NGINX_CONF_DIR/$DOMAIN"
ln -sf "$NGINX_CONF_DIR/$DOMAIN" "$NGINX_ENABLED_DIR/$DOMAIN"

nginx -t 2>&1 || error "Nginx config lỗi — xem output bên trên"
systemctl reload nginx
success "Nginx HTTP config đã kích hoạt cho $DOMAIN"

# ── Bước 6: Lấy SSL cert ─────────────────────────────────────────────────────
if [[ "$DNS_OK" == true ]]; then
    info "Bước 6/6: Lấy SSL certificate từ Let's Encrypt..."

    certbot certonly \
        --webroot \
        --webroot-path "$CERTBOT_WEBROOT" \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --keep-until-expiring \
        2>&1 || error "Certbot thất bại — kiểm tra DNS và port 80"

    success "Cert đã cấp tại /etc/letsencrypt/live/$DOMAIN/"

    # Chuyển sang HTTPS full config
    info "Chuyển sang HTTPS config đầy đủ..."
    cp "$SCRIPT_DIR/axvn.vn.conf" "$NGINX_CONF_DIR/$DOMAIN"
    nginx -t 2>&1 || error "HTTPS nginx config lỗi"
    systemctl reload nginx
    success "HTTPS đã kích hoạt cho $DOMAIN và www.$DOMAIN"

    # Auto-renewal
    info "Kích hoạt auto-renewal (certbot.timer)..."
    systemctl enable certbot.timer
    systemctl start  certbot.timer
    success "Auto-renewal: $(systemctl is-active certbot.timer)"

    # Dry-run kiểm tra renewal
    info "Kiểm tra renewal dry-run..."
    certbot renew --dry-run --quiet 2>&1 \
        && success "Renewal dry-run OK" \
        || warn "Dry-run có cảnh báo — kiểm tra: journalctl -u certbot"

else
    warn "Bước 6/6: BỎ QUA SSL — DNS chưa trỏ đúng."
    warn "Sau khi cập nhật DNS, chạy lại:"
    warn "  sudo bash $SCRIPT_DIR/setup-axvn.sh"
fi

# ── Kết quả ───────────────────────────────────────────────────────────────────
echo ""
echo "═══ KẾT QUẢ ═══════════════════════════════════════════════"
echo ""
echo "  Nginx status    : $(systemctl is-active nginx)"
echo "  app-web (PM2)   : $(pm2 show app-web 2>/dev/null | grep status | awk '{print $4}' || echo 'kiểm tra với: pm2 ls')"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" 2>/dev/null || echo "N/A")
echo "  HTTP $DOMAIN    : $HTTP_CODE"
if [[ "$DNS_OK" == true ]]; then
    HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" 2>/dev/null || echo "N/A")
    WWW_CODE=$(curl  -s -o /dev/null -w "%{http_code}" "https://www.$DOMAIN" 2>/dev/null || echo "N/A")
    echo "  HTTPS $DOMAIN       : $HTTPS_CODE"
    echo "  HTTPS www.$DOMAIN   : $WWW_CODE  (phải redirect → axvn.vn)"
    CERT_EXPIRY=$(certbot certificates 2>/dev/null | grep -A2 "$DOMAIN" | grep "Expiry" | awk '{print $3, $4}')
    echo "  Cert hết hạn        : ${CERT_EXPIRY:-kiểm tra với: certbot certificates}"
fi
echo ""
echo "  Access log : /var/log/nginx/axvn.vn.access.log"
echo "  Error  log : /var/log/nginx/axvn.vn.error.log"
echo ""
if [[ "$DNS_OK" == true ]]; then
    echo -e "  ${GREEN}✅ XONG! Truy cập: https://axvn.vn${NC}"
else
    echo -e "  ${YELLOW}⏳ HTTP đang chạy. Cập nhật DNS rồi chạy lại script.${NC}"
    echo -e "  ${CYAN}   Thêm A record:  axvn.vn     → $SERVER_IP${NC}"
    echo -e "  ${CYAN}   Thêm A record:  www.axvn.vn → $SERVER_IP${NC}"
fi
echo ""
