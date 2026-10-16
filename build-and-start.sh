#!/usr/bin/env bash
# =============================================================================
# build-and-start.sh
#
# 1. Build tất cả frontend apps (Next.js → .next/standalone)
# 2. Build tất cả backend services (tsc → dist/)
# 3. Khởi chạy tất cả bằng PM2 (ecosystem.config.cjs)
#
# Dùng:
#   bash build-and-start.sh               # build + start tất cả
#   bash build-and-start.sh --frontend    # chỉ build + start frontend
#   bash build-and-start.sh --backend     # chỉ build + start backend
#   bash build-and-start.sh --start-only  # skip build, chỉ PM2 start
#   bash build-and-start.sh --dry-run     # in lệnh, không thực thi
# =============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/.pm2/logs"
TURBO="$ROOT/node_modules/.bin/turbo"
PM2="$(command -v pm2 2>/dev/null || echo "$ROOT/node_modules/.bin/pm2")"

# ── Màu sắc ────────────────────────────────────────────────────────────────
C_CYAN="\033[0;36m"; C_GREEN="\033[0;32m"; C_RED="\033[0;31m"
C_YELLOW="\033[0;33m"; C_BOLD="\033[1m"; C_RESET="\033[0m"

log()  { echo -e "${C_CYAN}[build]${C_RESET} $*"; }
ok()   { echo -e "${C_GREEN}  ✓${C_RESET} $*"; }
err()  { echo -e "${C_RED}  ✗${C_RESET} $*" >&2; }
warn() { echo -e "${C_YELLOW}  ⚠${C_RESET} $*"; }
sep()  { echo -e "${C_BOLD}────────────────────────────────────────────────${C_RESET}"; }

# ── Flags ──────────────────────────────────────────────────────────────────
DO_FRONTEND=true
DO_BACKEND=true
START_ONLY=false
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --frontend)   DO_BACKEND=false ;;
    --backend)    DO_FRONTEND=false ;;
    --start-only) START_ONLY=true ;;
    --dry-run)    DRY_RUN=true ;;
    -h|--help)
      grep "^#" "$0" | head -14 | sed 's/^# \{0,1\}//'
      exit 0 ;;
  esac
done

run() {
  if $DRY_RUN; then
    echo -e "  ${C_YELLOW}[dry-run]${C_RESET} $*"
  else
    eval "$*"
  fi
}

# ── Kiểm tra dependencies ──────────────────────────────────────────────────
sep
log "Wikialisa — Build & Start Production"
sep
echo ""

if [ ! -f "$TURBO" ]; then
  warn "turbo not found — chạy pnpm install trước"
  run "pnpm install --frozen-lockfile --ignore-scripts"
fi

mkdir -p "$LOG_DIR"

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 1: Build shared packages (types, config, contracts, …)
# ═══════════════════════════════════════════════════════════════════════════
if ! $START_ONLY; then
  echo ""
  log "📦  Bước 1/3 — Build shared packages"
  sep

  run "$TURBO run build \
    --filter='./packages/*' \
    --cache-dir=.turbo \
    --output-logs=errors-only" && ok "Packages built" || {
      err "Package build failed"; exit 1
    }
fi

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 2: Build Frontend Apps (Next.js → standalone)
# ═══════════════════════════════════════════════════════════════════════════
FRONTEND_APPS=(
  "app-web:3010"
  "pay-portal:3002"
  "explorer-vnkrscan:3003"
  "swap-dex:3004"
  "dao-portal:3005"
  "holding-admin-portal:3006"
  "id-fiat-gateway:3001"
  "kyc-portal:3013"
  "merchant-portal:3011"
  "sandbox-dashboard:3012"
)

if ! $START_ONLY && $DO_FRONTEND; then
  echo ""
  log "🖥️   Bước 2/3 — Build frontend apps (Next.js standalone)"
  sep

  FAILED_APPS=()
  for entry in "${FRONTEND_APPS[@]}"; do
    app="${entry%%:*}"
    port="${entry##*:}"
    app_dir="$ROOT/apps/$app"

    [ -d "$app_dir" ] || { warn "$app — thư mục không tồn tại, bỏ qua"; continue; }

    echo -ne "  Building ${C_BOLD}$app${C_RESET} (port $port)… "

    if $DRY_RUN; then
      echo -e "${C_YELLOW}[dry-run]${C_RESET}"
      continue
    fi

    BUILD_LOG="$LOG_DIR/${app}-build.log"
    if (cd "$app_dir" && \
        NODE_ENV=production \
        NEXT_TELEMETRY_DISABLED=1 \
        node_modules/.bin/next build 2>&1 || \
        # fallback: dùng turbo filter
        (cd "$ROOT" && $TURBO run build --filter="./apps/$app" \
          --cache-dir=.turbo --output-logs=errors-only 2>&1)
       ) > "$BUILD_LOG" 2>&1; then
      ok "$app"
    else
      err "$app — FAILED (xem $BUILD_LOG)"
      FAILED_APPS+=("$app")
    fi
  done

  if [ ${#FAILED_APPS[@]} -gt 0 ]; then
    warn "Các app build lỗi: ${FAILED_APPS[*]}"
    warn "Tiếp tục với các app còn lại…"
  fi
fi

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 3: Build Backend Services (tsc → dist/)
# ═══════════════════════════════════════════════════════════════════════════
BACKEND_SERVICES=(
  "api-gateway"
  "fiat-connector-api"
  "indexer-subgraph"
  "otc-liquidity-engine"
  "swift-chain-bridge"
  "swift-gateway"
  "mock-mgw"
  "dune-alert-bots"
)

if ! $START_ONLY && $DO_BACKEND; then
  echo ""
  log "⚙️   Bước 3/3 — Build backend services (TypeScript → dist/)"
  sep

  FAILED_SVCS=()
  for svc in "${BACKEND_SERVICES[@]}"; do
    svc_dir="$ROOT/services/$svc"

    [ -d "$svc_dir" ] || { warn "$svc — thư mục không tồn tại, bỏ qua"; continue; }

    # Bỏ qua role-engine (plain JS, không cần build)
    build_cmd=$(python3 -c \
      "import json; d=json.load(open('$svc_dir/package.json')); \
       print(d.get('scripts',{}).get('build','NONE'))" 2>/dev/null)
    [[ "$build_cmd" == "NONE" || "$build_cmd" == *"echo"* ]] && {
      ok "$svc — (no build step, plain JS)"
      continue
    }

    echo -ne "  Building ${C_BOLD}$svc${C_RESET}… "

    if $DRY_RUN; then
      echo -e "${C_YELLOW}[dry-run]${C_RESET}"
      continue
    fi

    BUILD_LOG="$LOG_DIR/${svc}-build.log"
    if (cd "$svc_dir" && \
        PATH="$ROOT/node_modules/.bin:$PATH" \
        pnpm run build 2>&1
       ) > "$BUILD_LOG" 2>&1; then
      ok "$svc"
    else
      err "$svc — FAILED (xem $BUILD_LOG)"
      FAILED_SVCS+=("$svc")
    fi
  done

  if [ ${#FAILED_SVCS[@]} -gt 0 ]; then
    warn "Các service build lỗi: ${FAILED_SVCS[*]}"
    warn "Tiếp tục start các service còn lại…"
  fi
fi

# ═══════════════════════════════════════════════════════════════════════════
# BƯỚC 4: Khởi chạy tất cả bằng PM2
# ═══════════════════════════════════════════════════════════════════════════
echo ""
log "🚀  PM2 — Khởi chạy production"
sep

# Dừng các process cũ nếu đang chạy
if $DRY_RUN; then
  echo -e "  ${C_YELLOW}[dry-run]${C_RESET} pm2 delete all"
  echo -e "  ${C_YELLOW}[dry-run]${C_RESET} pm2 start ecosystem.config.cjs"
else
  "$PM2" delete all 2>/dev/null || true
  run "mkdir -p '$LOG_DIR'"

  if $DO_FRONTEND && ! $DO_BACKEND; then
    # Chỉ start frontend
    for entry in "${FRONTEND_APPS[@]}"; do
      app="${entry%%:*}"
      case "$app" in
        app-web)               name="app-web" ;;
        pay-portal)            name="pay-portal" ;;
        explorer-vnkrscan)     name="explorer" ;;
        swap-dex)              name="swap-dex" ;;
        dao-portal)            name="dao-portal" ;;
        holding-admin-portal)  name="holding-admin" ;;
        id-fiat-gateway)       name="id-fiat" ;;
        kyc-portal)            name="kyc-portal" ;;
        merchant-portal)       name="merchant" ;;
        sandbox-dashboard)     name="sandbox" ;;
      esac
      "$PM2" start ecosystem.config.cjs --only "$name" 2>/dev/null || true
    done
  elif ! $DO_FRONTEND && $DO_BACKEND; then
    # Chỉ start backend
    for svc_name in api-gateway ws-gateway fiat-connector indexer otc-engine swift-bridge swift-svc mock-mgw role-engine dune-bots digital-twin; do
      "$PM2" start ecosystem.config.cjs --only "$svc_name" 2>/dev/null || true
    done
  else
    # Start tất cả
    NODE_ENV=production "$PM2" start "$ROOT/ecosystem.config.cjs"
  fi
fi

echo ""
sep
log "📊  Trạng thái PM2:"
sep
if ! $DRY_RUN; then
  "$PM2" status
fi

echo ""
echo -e "${C_GREEN}${C_BOLD}✅  Hoàn thành!${C_RESET}"
echo ""
echo -e "  Xem logs   : ${C_CYAN}pm2 logs${C_RESET}"
echo -e "  Trạng thái : ${C_CYAN}pm2 status${C_RESET}"
echo -e "  Dừng tất cả: ${C_CYAN}pm2 stop all${C_RESET}"
echo ""
