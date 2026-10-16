#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
#  deploy/nginx/setup-axvn-all.sh
#  Tạo vhost nginx + SSL Let's Encrypt cho tất cả subdomain axvn.vn
#  Chạy: sudo bash deploy/nginx/setup-axvn-all.sh
#
#  Yêu cầu: DNS tất cả subdomain đã trỏ A → 222.255.180.177
# ═══════════════════════════════════════════════════════════════════════════════
set -uo pipefail

EMAIL="ops@axvn.vn"
IP="222.255.180.177"
VHOST_DIR="/www/server/panel/vhost/nginx"
CERT_DIR="/www/server/panel/vhost/cert"
LOG_DIR="/www/wwwlogs"
WEBROOT_BASE="/www/wwwroot"
NGINX="/www/server/nginx/sbin/nginx"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; }

[[ $EUID -eq 0 ]] || { echo "Cần root: sudo bash $0"; exit 1; }

# ── Danh sách: "domain:port" ──────────────────────────────────────────────────
# app.axvn.vn và cms.axvn.vn đã cấu hình — bỏ qua
SITES=(
  "pay.axvn.vn:3002"
  "scan.axvn.vn:3003"
  "swap.axvn.vn:3004"
  "dao.axvn.vn:3005"
  "holding.axvn.vn:3006"
  "id.axvn.vn:3001"
  "kyc.axvn.vn:3013"
  "merchant.axvn.vn:3011"
  "sandbox.axvn.vn:3012"
  "api.axvn.vn:5000"
  "admin.axvn.vn:3010"
  "www.axvn.vn:3010"
)

# ── Helper: tạo vhost HTTP (để xin cert) ─────────────────────────────────────
make_http_vhost() {
  local domain=$1
  cat > "$VHOST_DIR/${domain}.conf" << VHEOF
server
{
    listen 80;
    server_name ${domain};
    root ${WEBROOT_BASE}/${domain};

    location /.well-known/acme-challenge/ {
        root ${WEBROOT_BASE}/${domain};
        default_type "text/plain";
        try_files \$uri =404;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }

    access_log  ${LOG_DIR}/${domain}.log;
    error_log   ${LOG_DIR}/${domain}.error.log;
}
VHEOF
}

# ── Helper: tạo vhost HTTPS đầy đủ ───────────────────────────────────────────
make_https_vhost() {
  local domain=$1
  local port=$2
  cat > "$VHOST_DIR/${domain}.conf" << VHEOF
server
{
    listen 80;
    server_name ${domain};
    root ${WEBROOT_BASE}/${domain};

    location /.well-known/acme-challenge/ {
        root ${WEBROOT_BASE}/${domain};
        default_type "text/plain";
        try_files \$uri =404;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }

    access_log  ${LOG_DIR}/${domain}.log;
    error_log   ${LOG_DIR}/${domain}.error.log;
}

server
{
    listen 443 ssl http2;
    server_name ${domain};
    root ${WEBROOT_BASE}/${domain};

    #SSL-START
    ssl_certificate     ${CERT_DIR}/${domain}/fullchain.pem;
    ssl_certificate_key ${CERT_DIR}/${domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets on;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    error_page 497 https://\$host\$request_uri;
    #SSL-END

    location /.well-known/acme-challenge/ {
        root ${WEBROOT_BASE}/${domain};
        default_type "text/plain";
        try_files \$uri =404;
    }

    include ${VHOST_DIR}/proxy/${domain}/*.conf;

    location ~ ^/(\.user.ini|\.htaccess|\.git|\.env|\.svn) {
        return 404;
    }

    access_log  ${LOG_DIR}/${domain}.log;
    error_log   ${LOG_DIR}/${domain}.error.log;
}
VHEOF
}

# ── Helper: tạo proxy config ──────────────────────────────────────────────────
make_proxy() {
  local domain=$1
  local port=$2
  mkdir -p "$VHOST_DIR/proxy/${domain}"
  cat > "$VHOST_DIR/proxy/${domain}/proxy.conf" << PEOF
#PROXY-START/

location / {
    proxy_pass http://127.0.0.1:${port};
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header REMOTE-HOST \$remote_addr;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection \$connection_upgrade;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_http_version 1.1;

    set \$static_next 0;
    if ( \$uri ~* "^\/_next\/static\/" ) { set \$static_next 1; }
    if ( \$static_next = 1 ) { expires 365d; }

    set \$static_file 0;
    if ( \$uri ~* "\.(gif|png|jpg|css|js|woff|woff2|svg|ico)$" ) { set \$static_file 1; expires 1d; }
    if ( \$static_file = 0 ) { add_header Cache-Control no-cache; }

    add_header X-Cache \$upstream_cache_status;
}

#PROXY-END/
PEOF
}

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  AXQ axvn.vn — Batch vhost + SSL setup                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

FAILED=()

for entry in "${SITES[@]}"; do
  DOMAIN="${entry%%:*}"
  PORT="${entry##*:}"

  echo "──────────────────────────────────────────────"
  info "Domain: $DOMAIN  →  localhost:$PORT"

  # Kiểm tra DNS
  DOMAIN_IP=$(dig +short "$DOMAIN" 2>/dev/null | grep -E '^[0-9]+\.' | tail -1)
  if [[ "$DOMAIN_IP" != "$IP" ]]; then
    warn "DNS chưa trỏ đúng ($DOMAIN_IP != $IP) — BỎ QUA $DOMAIN"
    FAILED+=("$DOMAIN (DNS chưa đúng)")
    continue
  fi

  # Tạo dirs
  mkdir -p "$WEBROOT_BASE/$DOMAIN"
  mkdir -p "$CERT_DIR/$DOMAIN"
  mkdir -p "$VHOST_DIR/extension/$DOMAIN"
  touch "$LOG_DIR/${DOMAIN}.log" "$LOG_DIR/${DOMAIN}.error.log" 2>/dev/null || true

  # Tạo proxy config
  make_proxy "$DOMAIN" "$PORT"

  # Deploy HTTP vhost để lấy cert
  make_http_vhost "$DOMAIN"
  $NGINX -t -c /www/server/nginx/conf/nginx.conf -q 2>&1 || { error "Nginx config lỗi cho $DOMAIN"; FAILED+=("$DOMAIN (nginx config)"); continue; }
  $NGINX -s reload

  # Xin cert
  info "Xin SSL cert cho $DOMAIN..."
  if certbot certonly \
      --webroot \
      --webroot-path "$WEBROOT_BASE/$DOMAIN" \
      -d "$DOMAIN" \
      --email "$EMAIL" \
      --agree-tos \
      --non-interactive \
      --keep-until-expiring \
      2>&1 | tail -5; then

    # Copy cert vào aaPanel
    cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$CERT_DIR/$DOMAIN/fullchain.pem"
    cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem"   "$CERT_DIR/$DOMAIN/privkey.pem"

    # Deploy HTTPS vhost
    make_https_vhost "$DOMAIN" "$PORT"
    $NGINX -t -c /www/server/nginx/conf/nginx.conf -q && $NGINX -s reload
    success "$DOMAIN — HTTPS OK (cert hết hạn $(openssl x509 -noout -enddate -in $CERT_DIR/$DOMAIN/fullchain.pem | cut -d= -f2))"
  else
    error "Certbot thất bại cho $DOMAIN"
    FAILED+=("$DOMAIN (certbot)")
  fi
done

# ── Kết quả cuối ──────────────────────────────────────────────────────────────
echo ""
echo "═══ KẾT QUẢ ══════════════════════════════════════════════"
echo ""
echo "  Nginx: $(ps aux | grep -c '[n]ginx: worker'  ) workers đang chạy"
echo ""
echo "  Domains đã cấu hình:"
for entry in "${SITES[@]}"; do
  DOMAIN="${entry%%:*}"
  PORT="${entry##*:}"
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" "https://$DOMAIN/" 2>/dev/null || echo "N/A")
  if [[ "$CODE" == "200" || "$CODE" == "301" || "$CODE" == "302" ]]; then
    echo -e "  ${GREEN}✅${NC} https://$DOMAIN  [$CODE]  → :$PORT"
  else
    echo -e "  ${RED}❌${NC} https://$DOMAIN  [$CODE]  → :$PORT"
  fi
done

if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo ""
  echo "  Thất bại:"
  for f in "${FAILED[@]}"; do echo -e "  ${RED}✗${NC} $f"; done
fi
echo ""
