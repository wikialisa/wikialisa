#!/usr/bin/env bash
# ─── cli/core/runtime.sh ─────────────────────────────────────────────────────
# Biến môi trường monorepo, guards, WSL1 shims.
# ─────────────────────────────────────────────────────────────────────────────

# ROOT được set bởi wikialisa.sh trước khi source file này
ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
BIN="${ROOT}/node_modules/.bin"
LOG_DIR="${ROOT}/.pm2/logs"
PNPM_VERSION="9.15.9"
NODE_REQUIRED="22"

APPS_FILTER="app-web,id-fiat,pay-portal,explorer,swap-dex,dao-portal,holding-admin,digital-twin,kyc-portal,merchant,sandbox"
SVCS_FILTER="api-gateway,ws-gateway,deposit-worker,fiat-connector,swift-gateway,swift-chain-bridge,indexer-subgraph,otc-liquidity,dune-alert-bots,mock-mgw,role-engine"

export ROOT BIN LOG_DIR PNPM_VERSION NODE_REQUIRED APPS_FILTER SVCS_FILTER

# ── Guards ────────────────────────────────────────────────────────────────────
_need_turbo() {
  if [ ! -x "${BIN}/turbo" ]; then
    fail "turbo không tìm thấy — chạy ${Y}./wikialisa.sh install${NC} trước"
    return 1
  fi
}

_need_pm2() {
  if ! command -v pm2 &>/dev/null; then
    fail "pm2 không tìm thấy — npm i -g pm2"
    return 1
  fi
}

export -f _need_turbo _need_pm2

# ── WSL1 .bin/ shims ─────────────────────────────────────────────────────────
_make_wsl1_bin_shims() {
  local BD="${ROOT}/node_modules/.bin"
  local NM="${ROOT}/node_modules"
  mkdir -p "$BD"

  _shim() {
    local name="$1" rel="$2" pkg="${3:-$1}"
    local full="${NM}/${pkg}/${rel}"
    [ -f "$full" ] || return 0
    printf '#!/usr/bin/env node\nrequire("%s")\n' "$full" > "${BD}/${name}"
    chmod +x "${BD}/${name}"
  }

  _shim turbo        bin/turbo
  _shim prettier     bin/prettier.cjs
  _shim eslint       bin/eslint.js
  _shim tsc          bin/tsc              typescript
  _shim tsserver     bin/tsserver         typescript
  _shim ts-node      dist/bin.js          ts-node
  _shim ts-node-dev  lib/bin.js           ts-node-dev
  _shim tsup         dist/cli-default.js  tsup
  _shim vitest       vitest.mjs           vitest
  _shim next         dist/bin/next        next

  local cs="${NM}/@changesets/cli/bin.js"
  if [ -f "$cs" ]; then
    printf '#!/usr/bin/env node\nrequire("%s")\n' "$cs" > "${BD}/changeset"
    chmod +x "${BD}/changeset"
  fi

  ok "WSL1 .bin shims: $(ls "$BD" 2>/dev/null | wc -l) tools"
}

export -f _make_wsl1_bin_shims

# ── System check (dùng trong menu) ───────────────────────────────────────────
check_env() {
  step "System check"

  if command -v node &>/dev/null; then
    local nv major
    nv=$(node -e "process.stdout.write(process.versions.node)")
    major=$(echo "$nv" | cut -d. -f1)
    if (( major >= NODE_REQUIRED )); then
      ok "Node.js  ${W}v${nv}${NC}"
    else
      warn "Node.js v${nv} — cần >= v${NODE_REQUIRED}"
    fi
  else
    fail "Node.js không tìm thấy"
  fi

  if command -v pnpm &>/dev/null; then
    ok "pnpm     ${W}$(pnpm --version)${NC}"
  else
    fail "pnpm không tìm thấy  →  npm i -g pnpm"
  fi

  if [ -x "${BIN}/turbo" ]; then
    ok "turbo    ${W}$(${BIN}/turbo --version 2>/dev/null || echo 'installed')${NC}"
  elif [ -f "${ROOT}/node_modules/turbo/bin/turbo" ]; then
    info "turbo package có nhưng .bin/ symlink thiếu (WSL1) — tạo shim..."
    _make_wsl1_bin_shims
    ok "turbo    ${W}$(${BIN}/turbo --version 2>/dev/null || echo 'shim ok')${NC}  ${D}(WSL1 shim)${NC}"
  else
    warn "turbo chưa install  →  ${Y}./wikialisa.sh install${NC}"
  fi

  if command -v pm2 &>/dev/null; then
    ok "PM2      ${W}$(pm2 --version)${NC}"
  else
    warn "pm2 không tìm thấy  →  npm i -g pm2"
  fi

  if [ -f "${ROOT}/.env" ]; then
    ok ".env     ${G}found${NC}"
  else
    warn ".env     missing  →  cp .env.example .env"
  fi

  if command -v free &>/dev/null; then
    local total used pct
    total=$(free -m | awk '/Mem:/{print $2}')
    used=$(free -m  | awk '/Mem:/{print $3}')
    pct=$(( used * 100 / total ))
    pbar "$pct" 100 "RAM  ${used}MB / ${total}MB"
  fi
}

export -f check_env
