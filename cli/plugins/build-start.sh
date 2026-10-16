#!/usr/bin/env bash
# ─── cli/plugins/build-start.sh ──────────────────────────────────────────────
# Build frontend (Next.js → standalone) + backend (tsc → dist/) rồi PM2 start.
# ─────────────────────────────────────────────────────────────────────────────
COMMAND="build-start"
ALIASES=("bs" "prod")
DESCRIPTION="Build frontend + backend → PM2 start production"

# ── Danh sách apps/services ────────────────────────────────────────────────
_FRONTEND_APPS=(
  "app-web:3010:app-web"
  "pay-portal:3002:pay-portal"
  "explorer-vnkrscan:3003:explorer"
  "swap-dex:3004:swap-dex"
  "dao-portal:3005:dao-portal"
  "holding-admin-portal:3006:holding-admin"
  "id-fiat-gateway:3001:id-fiat"
  "kyc-portal:3013:kyc-portal"
  "merchant-portal:3011:merchant"
  "sandbox-dashboard:3012:sandbox"
)

_BACKEND_SVCS=(
  "api-gateway"
  "fiat-connector-api"
  "indexer-subgraph"
  "otc-liquidity-engine"
  "swift-chain-bridge"
  "swift-gateway"
  "mock-mgw"
  "dune-alert-bots"
)

# ── Helpers nội bộ ─────────────────────────────────────────────────────────
_pbar() {
  local cur=$1 total=$2 label=$3
  local pct=$(( cur * 100 / total ))
  local filled=$(( pct / 5 ))
  local bar=""
  for ((i=0; i<filled; i++)); do bar+="█"; done
  for ((i=filled; i<20; i++)); do bar+="░"; done
  printf "  [%s] %3d%%  %s\n" "$bar" "$pct" "$label"
}

_build_frontend() {
  step "Build frontend apps (Next.js → .next/standalone)"
  sep

  local total=${#_FRONTEND_APPS[@]}
  local done=0 failed=()

  for entry in "${_FRONTEND_APPS[@]}"; do
    local dir="${entry%%:*}"
    local rest="${entry#*:}"
    local port="${rest%%:*}"
    local pm2name="${rest##*:}"
    local app_dir="${ROOT}/apps/${dir}"

    [ -d "$app_dir" ] || { warn "$dir — không tồn tại, bỏ qua"; done=$(( done+1 )); continue; }

    printf "  Building ${BOLD}%-28s${NC} (:%s) … " "$dir" "$port"

    local build_log="${LOG_DIR}/${dir}-build.log"
    mkdir -p "$LOG_DIR"

    if (
      cd "$app_dir"
      export NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
      export PATH="${ROOT}/node_modules/.bin:$PATH"
      next build 2>&1
    ) > "$build_log" 2>&1; then
      echo -e "${G}✔${NC}"
    else
      echo -e "${R}✗ FAILED${NC}  → $build_log"
      failed+=("$dir")
    fi
    done=$(( done+1 ))
    _pbar "$done" "$total" "" 2>/dev/null || true
  done

  nl
  if [ ${#failed[@]} -gt 0 ]; then
    warn "Frontend build lỗi: ${failed[*]}"
  else
    ok "Tất cả frontend apps đã build"
  fi
}

_build_backend() {
  step "Build backend services (TypeScript → dist/)"
  sep

  local total=${#_BACKEND_SVCS[@]}
  local done=0 failed=()

  for svc in "${_BACKEND_SVCS[@]}"; do
    local svc_dir="${ROOT}/services/${svc}"

    [ -d "$svc_dir" ] || { warn "$svc — không tồn tại, bỏ qua"; done=$(( done+1 )); continue; }

    # Lấy build script
    local build_cmd
    build_cmd=$(python3 -c \
      "import json; d=json.load(open('${svc_dir}/package.json')); \
       print(d.get('scripts',{}).get('build','NONE'))" 2>/dev/null)

    if [[ "$build_cmd" == "NONE" || "$build_cmd" == *"echo"* ]]; then
      ok "$svc (no build — plain JS)"
      done=$(( done+1 ))
      continue
    fi

    printf "  Building ${BOLD}%-28s${NC} … " "$svc"

    local build_log="${LOG_DIR}/${svc}-build.log"
    if (
      cd "$svc_dir"
      export PATH="${ROOT}/node_modules/.bin:$PATH"
      pnpm run build 2>&1
    ) > "$build_log" 2>&1; then
      echo -e "${G}✔${NC}"
    else
      echo -e "${R}✗ FAILED${NC}  → $build_log"
      failed+=("$svc")
    fi
    done=$(( done+1 ))
  done

  nl
  if [ ${#failed[@]} -gt 0 ]; then
    warn "Backend build lỗi: ${failed[*]}"
  else
    ok "Tất cả backend services đã build"
  fi
}

_pm2_start() {
  step "PM2 — khởi chạy production"
  sep
  _need_pm2 || return 1

  mkdir -p "$LOG_DIR"

  # Dừng process cũ
  pm2 delete all 2>/dev/null || true

  # Start toàn bộ ecosystem
  NODE_ENV=production pm2 start "${ROOT}/ecosystem.config.cjs" -f --silent

  pm2 save --silent 2>/dev/null || true

  nl
  pm2 ls
  nl
  done_ "Production đang chạy"
  echo ""
  echo -e "  ${D}Logs     :${NC} ${C}pm2 logs${NC}"
  echo -e "  ${D}Status   :${NC} ${C}pm2 status${NC}"
  echo -e "  ${D}Stop all :${NC} ${C}pm2 stop all${NC}"
}

# ── Entry point ────────────────────────────────────────────────────────────
run() {
  local mode="${1:-all}"   # all | frontend | backend | start-only

  case "$mode" in
    --frontend|frontend)
      # Chỉ build packages + frontend rồi start
      step "Build packages nội bộ"
      spin "turbo build packages" "${BIN}/turbo" run build \
        --filter="./packages/*" --cache-dir=.turbo --output-logs=errors-only
      _build_frontend
      _pm2_start
      ;;

    --backend|backend)
      # Chỉ build packages + backend rồi start
      step "Build packages nội bộ"
      spin "turbo build packages" "${BIN}/turbo" run build \
        --filter="./packages/*" --cache-dir=.turbo --output-logs=errors-only
      _build_backend
      _pm2_start
      ;;

    --start-only|start-only)
      # Bỏ qua build, chỉ PM2 start
      warn "Skip build — chạy thẳng PM2 start (cần dist/ và .next/ đã có sẵn)"
      _pm2_start
      ;;

    all|*)
      # Build packages → frontend → backend → start
      step "Build packages nội bộ (shared libs)"
      _need_turbo || return 1
      spin "turbo build packages" "${BIN}/turbo" run build \
        --filter="./packages/*" --cache-dir=.turbo --output-logs=errors-only
      ok "Packages built"

      _build_frontend
      _build_backend
      _pm2_start
      ;;
  esac
}
