#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
#  deploy/nginx/setup-app-axvn.sh
#  Cấu hình Nginx + Let's Encrypt TLS cho app.axvn.vn
#  → upstream: localhost:3010  (app-web Next.js PWA)
#
#  Chạy: sudo bash deploy/nginx/setup-app-axvn.sh
#
#  Yêu cầu trước khi chạy:
#    1. DNS app.axvn.vn  A → <IP server này>
#    2. Port 80 và 443 mở trên firewall
#    3. app-web đang chạy: pm2 start ecosystem.config.cjs --only app-web
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

DOMAIN="app.axvn.vn"
EMAIL="ops@axvn.vn"
APP_PORT=3010
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
CERTBOT_WEBROOT="/var/www/certbot"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

[[ $EUID -eq 0 ]] || error "Cần quyền root: sudo bash $0"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   AXQ — Nginx + Let's Encrypt SSL Setup               ║"
echo "║   Domain : $DOMAIN                          ║"
echo "║   Port   : localhost:$APP_PORT                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── 1. Cài nginx + certbot ────────────────────────────────────────────────────
info "1/6: Kiểm tra nginx, certbot..."
apt-get update -qq
apt-get install -y nginx certbot python3-certbot-nginx dnsutils > /dev/null
success "nginx + certbot OK"

# ── 2. Kiểm tra app-web ───────────────────────────────────────────────────────
info "2/6: Kiểm tra app-web trên port $APP_PORT..."
if ! ss -tlnp | grep -q ":$APP_PORT"; then
    warn "Không thấy process trên port $APP_PORT."
    warn "Khởi động: pm2 start ecosystem.config.cjs --only app-web"
    read -r -p "Tiếp tục? [y/N] " yn; [[ "$yn" =~ ^[Yy]$ ]] || error "Hủy."
else
    success "app-web đang chạy tại localhost:$APP_PORT"
fi

# ── 3. Kiểm tra DNS ───────────────────────────────────────────────────────────
info "3/6: Kiểm tra DNS $DOMAIN..."
SERVER_IP=$(curl -s --max-time 5 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
DOMAIN_IP=$(dig +short "$DOMAIN" 2>/dev/null | grep -E '^[0-9]+\.' | tail -1)

echo "  Server IP      : $SERVER_IP"
echo "  $DOMAIN IP     : ${DOMAIN_IP:-<không phân giải được>}"

DNS_OK=true
if [[ "$SERVER_IP" != "$DOMAIN_IP" ]]; then
    warn "DNS chưa trỏ đúng! Cần A record: $DOMAIN → $SERVER_IP"
    DNS_OK=false
else
    success "DNS OK: $DOMAIN → $SERVER_IP"
fi

# ── 4. Webroot certbot ────────────────────────────────────────────────────────
info "4/6: Tạo webroot certbot..."
mkdir -p "$CERTBOT_WEBROOT"
success "Webroot: $CERTBOT_WEBROOT"

# ── 5. Deploy nginx HTTP config ───────────────────────────────────────────────
info "5/6: Deploy nginx HTTP config..."
rm -f "$NGINX_ENABLED_DIR/default" 2>/dev/null || true
cp "$SCRIPT_DIR/app.axvn.vn.conf.http-only" "$NGINX_CONF_DIR/$DOMAIN"
ln -sf "$NGINX_CONF_DIR/$DOMAIN" "$NGINX_ENABLED_DIR/$DOMAIN"
nginx -t 2>&1 || error "Nginx config lỗi"
systemctl reload nginx
success "Nginx HTTP config active: $DOMAIN"

# ── 6. Lấy SSL cert ───────────────────────────────────────────────────────────
if [[ "$DNS_OK" == true ]]; then
    info "6/6: Lấy SSL cert từ Let's Encrypt..."
    certbot certonly \
        --webroot \
        --webroot-path "$CERTBOT_WEBROOT" \
        -d "$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --keep-until-expiring \
        2>&1 || error "Certbot thất bại — kiểm tra DNS và port 80"
    success "Cert: /etc/letsencrypt/live/$DOMAIN/"

    info "Chuyển sang HTTPS config..."
    cp "$SCRIPT_DIR/app.axvn.vn.conf" "$NGINX_CONF_DIR/$DOMAIN"
    nginx -t 2>&1 || error "HTTPS config lỗi"
    systemctl reload nginx
    success "HTTPS active: $DOMAIN"

    systemctl enable certbot.timer && systemctl start certbot.timer
    success "Auto-renewal: $(systemctl is-active certbot.timer)"
    certbot renew --dry-run --quiet 2>&1 && success "Renewal dry-run OK" || warn "Dry-run warning — kiểm tra: journalctl -u certbot"
else
    warn "6/6: BỎ QUA SSL — DNS chưa trỏ đúng."
    warn "Sau khi DNS cập nhật, chạy lại: sudo bash $SCRIPT_DIR/setup-app-axvn.sh"
fi

# ── Kết quả ───────────────────────────────────────────────────────────────────
echo ""
echo "═══ KẾT QUẢ ══════════════════════════════════════════════"
echo "  Nginx   : $(systemctl is-active nginx)"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" 2>/dev/null || echo "N/A")
echo "  HTTP    : $HTTP_CODE"
if [[ "$DNS_OK" == true ]]; then
    HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" 2>/dev/null || echo "N/A")
    echo "  HTTPS   : $HTTPS_CODE"
    CERT_EXPIRY=$(certbot certificates 2>/dev/null | grep -A3 "Domains:.*$DOMAIN" | grep "Expiry" | awk '{print $3, $4}')
    echo "  Cert    : ${CERT_EXPIRY:-certbot certificates}"
fi
echo "  Logs    : /var/log/nginx/$DOMAIN.{access,error}.log"
echo ""
if [[ "$DNS_OK" == true ]]; then
    echo -e "  ${GREEN}✅ XONG! https://$DOMAIN${NC}"
else
    echo -e "  ${YELLOW}⏳ HTTP chạy. Thêm A record: $DOMAIN → $SERVER_IP rồi chạy lại.${NC}"
fi
echo ""
