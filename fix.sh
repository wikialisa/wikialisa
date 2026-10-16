#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║   W I K I A L I S A  —  Trình Khắc Phục Sự Cố                            ║
# ║   AXQ Tech Holding JSC  ·  fix.sh                                         ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
#  Usage:
#    ./fix.sh              # chẩn đoán toàn bộ + hỏi tự động sửa
#    ./fix.sh --auto       # sửa tất cả không hỏi
#    ./fix.sh --check      # chỉ chẩn đoán, không sửa
#    ./fix.sh pm2          # chỉ sửa vấn đề PM2
#    ./fix.sh install      # chỉ sửa vấn đề pnpm/lockfile
#    ./fix.sh ports        # kiểm tra + kill port đang bị chiếm
#    ./fix.sh env          # kiểm tra biến môi trường

set -euo pipefail
export TERM="${TERM:-xterm-256color}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN="${ROOT}/node_modules/.bin"
LOG_DIR="${ROOT}/.pm2/logs"

# ── Colors ────────────────────────────────────────────────────────────────────
R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'
C='\033[0;36m'; W='\033[1;37m'; D='\033[2m'; NC='\033[0m'; BOLD='\033[1m'

ISSUES=0   # đếm số vấn đề phát hiện
FIXED=0    # đếm số vấn đề đã sửa

# ── Helpers ───────────────────────────────────────────────────────────────────
nl()     { echo ""; }
sep()    { echo -e "${D}────────────────────────────────────────────────────────${NC}"; }
ok()     { echo -e "  ${G}✔${NC}  $*"; }
bad()    { echo -e "  ${R}✖${NC}  $*"; ISSUES=$(( ISSUES + 1 )); }
fixed()  { echo -e "  ${G}⚡${NC}  ${G}FIXED${NC}  $*"; FIXED=$(( FIXED + 1 )); }
warn()   { echo -e "  ${Y}⚠${NC}  $*"; }
info()   { echo -e "  ${C}→${NC}  $*"; }
step()   { echo -e "\n${BOLD}${C}  ▶  $*${NC}"; sep; }
skip()   { echo -e "  ${D}—  skip: $*${NC}"; }

MODE="${1:-}"
AUTO=false
[[ "$MODE" == "--auto" ]] && AUTO=true

ask_fix() {
  # ask_fix "description" "fix_command_or_function"
  local desc="$1"; local fix_fn="$2"
  if $AUTO; then
    eval "$fix_fn" && fixed "$desc" || warn "Fix thất bại: $desc"
  else
    # /dev/tty không available trong pipe/CI → skip interactive prompt
    if ! { true </dev/tty; } 2>/dev/null; then
      skip "$desc  ${D}(non-interactive: dùng ./fix.sh --auto)${NC}"
      return 0
    fi
    printf "  ${Y}?${NC}  Tự động sửa: ${W}%s${NC}? [y/N] " "$desc"
    read -r ans </dev/tty
    if [[ "$ans" =~ ^[Yy]$ ]]; then
      eval "$fix_fn" && fixed "$desc" || warn "Fix thất bại: $desc"
    else
      skip "$desc"
    fi
  fi
}

banner() {
  printf '\033[H\033[2J\033[3J' 2>/dev/null || true
  echo -e "${C}"
  echo '   █████╗ ██╗  ██╗    ███████╗██╗██╗  ██╗███████╗██████╗ '
  echo '  ██╔══██╗╚██╗██╔╝    ██╔════╝██║╚██╗██╔╝██╔════╝██╔══██╗'
  echo '  ███████║ ╚███╔╝     █████╗  ██║ ╚███╔╝ █████╗  ██████╔╝'
  echo '  ██╔══██║ ██╔██╗     ██╔══╝  ██║ ██╔██╗ ██╔══╝  ██╔══██╗'
  echo '  ██║  ██║██╔╝ ██╗    ██║     ██║██╔╝ ██╗███████╗██║  ██║'
  echo '  ╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝'
  echo -e "${NC}  ${D}Wikialisa — Trình Khắc Phục Sự Cố  ·  axvn.vn${NC}"
  nl; sep
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 1 — PREREQUISITES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
check_prereqs() {
  step "1 · Prerequisites"

  # Node.js
  if command -v node &>/dev/null; then
    local v; v=$(node -e "process.stdout.write(process.versions.node)")
    local major; major=$(echo "$v" | cut -d. -f1)
    if (( major >= 22 )); then ok "Node.js v${v}"
    else
      bad "Node.js v${v} — cần >= v22"
      info "nvm install 22 && nvm use 22"
    fi
  else
    bad "Node.js không tìm thấy"
    info "Cài đặt: https://nodejs.org hoặc nvm install 22"
  fi

  # pnpm
  if command -v pnpm &>/dev/null; then
    ok "pnpm $(pnpm --version)"
  else
    bad "pnpm không tìm thấy"
    ask_fix "cài pnpm global" "npm install -g pnpm@9.15.9"
  fi

  # PM2
  if command -v pm2 &>/dev/null; then
    ok "PM2 $(pm2 --version)"
  else
    bad "PM2 không tìm thấy"
    ask_fix "cài PM2 global" "npm install -g pm2"
  fi

  # turbo (local)
  if [ -x "${BIN}/turbo" ]; then
    ok "turbo $("${BIN}/turbo" --version 2>/dev/null || echo 'ok')"
  else
    bad "turbo không tìm thấy trong node_modules/.bin"
    info "Chạy: ${Y}./wikialisa.sh install${NC}"
  fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 2 — PNPM / LOCKFILE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
check_install() {
  step "2 · pnpm install / lockfile"

  # node_modules tồn tại?
  if [ ! -d "${ROOT}/node_modules" ]; then
    bad "node_modules/ không tồn tại"
    ask_fix "pnpm install" "_do_install"
    return
  fi
  ok "node_modules/ tồn tại"

  # turbo binary?
  if [ ! -x "${BIN}/turbo" ]; then
    bad "node_modules/.bin/turbo thiếu — install chưa đầy đủ"
    ask_fix "pnpm install lại" "_do_install"
    return
  fi

  # lockfile sync với package.json (catalog: changes)?
  local mismatch=false
  if command -v pnpm &>/dev/null; then
    if ! pnpm install --frozen-lockfile --dry-run 2>/tmp/fix_lock_check.log >/dev/null 2>&1; then
      if grep -q "don't match specs\|lockfile is not up-to-date\|ERR_PNPM" /tmp/fix_lock_check.log 2>/dev/null; then
        mismatch=true
      fi
    fi
  fi

  if $mismatch; then
    bad "pnpm-lock.yaml lỗi thời (catalog: version mismatch)"
    info "$(head -3 /tmp/fix_lock_check.log 2>/dev/null || true)"
    ask_fix "pnpm install --no-frozen-lockfile (update lockfile)" "_do_install"
  else
    ok "pnpm-lock.yaml đồng bộ"
  fi
}

_do_install() {
  # Dừng PM2 trước để tránh EACCES rename trên WSL1
  if command -v pm2 &>/dev/null && pm2 list 2>/dev/null | grep -q "online"; then
    info "Dừng PM2 tránh file lock WSL1..."
    pm2 stop all --silent 2>/dev/null || true; sleep 1
  fi
  cd "${ROOT}"
  pnpm install --no-frozen-lockfile 2>&1 | grep -E "Progress|ERR|added|warn" | tail -8 || true
  echo ""
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 3 — PM2 PROCESSES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
check_pm2() {
  step "3 · PM2 Processes"

  if ! command -v pm2 &>/dev/null; then
    warn "PM2 chưa cài — bỏ qua mục này"; return; fi

  local list; list=$(pm2 jlist 2>/dev/null || echo "[]")

  if [ "$list" = "[]" ] || [ -z "$list" ]; then
    warn "Chưa có process nào trong PM2"
    info "Chạy: ${Y}./wikialisa.sh dev${NC}"
    return
  fi

  # Phân tích từng process bằng bash (không cần jq)
  local errored=0 stopped=0
  while IFS= read -r line; do
    local name status restarts
    name=$(echo "$line" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
    status=$(echo "$line" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    restarts=$(echo "$line" | grep -o '"restart_time":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    [ -z "$name" ] && continue

    if [ "$status" = "online" ]; then
      if (( restarts > 5 )); then
        warn "${W}${name}${NC}  online  ${Y}↺ ${restarts} restarts${NC}"
      else
        ok "${W}${name}${NC}  online  ↺ ${restarts}"
      fi
    elif [ "$status" = "errored" ]; then
      bad "${W}${name}${NC}  ${R}errored${NC}  ↺ ${restarts}"
      errored=$(( errored + 1 ))
    else
      bad "${W}${name}${NC}  ${Y}${status}${NC}"
      stopped=$(( stopped + 1 ))
    fi
  done < <(echo "$list" | grep -o '{[^{}]*}' 2>/dev/null || true)

  if (( errored > 0 )); then
    nl
    ask_fix "xem log các process errored" \
      "pm2 logs --nostream --lines 20 2>/dev/null | grep -A5 'error\|Error\|ERR' | head -40 || true"
    ask_fix "xóa và restart các process errored" \
      "pm2 delete errored 2>/dev/null; pm2 start '${ROOT}/ecosystem.dev.cjs' -f --silent 2>/dev/null || true"
  fi

  if (( stopped > 0 )); then
    ask_fix "restart các process stopped" \
      "pm2 restart stopped --silent 2>/dev/null || true"
  fi

  # Log dir
  if [ ! -d "$LOG_DIR" ]; then
    bad "Log dir ${LOG_DIR} không tồn tại"
    ask_fix "tạo .pm2/logs/" "mkdir -p '${LOG_DIR}'"
  else
    ok "Log dir  ${D}${LOG_DIR}${NC}"
    # Kiểm tra log files quá lớn (> 50MB)
    local big_logs
    big_logs=$(find "$LOG_DIR" -name "*.log" -size +50M 2>/dev/null | wc -l || echo 0)
    if (( big_logs > 0 )); then
      warn "${big_logs} log file > 50MB"
      ask_fix "flush log files (pm2 flush)" "pm2 flush --silent 2>/dev/null || true"
    fi
  fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 4 — PORTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
check_ports() {
  step "4 · Port Conflicts"

  declare -A PORT_MAP=(
    [3001]="id-fiat"        [3002]="pay-portal"
    [3003]="explorer"       [3004]="swap-dex"
    [3005]="dao-portal"     [3006]="holding-admin"
    [3007]="digital-twin"   [3010]="app-web"
    [3011]="merchant"       [3012]="sandbox"
    [3013]="kyc-portal"     [4001]="fiat-connector"
    [4002]="swift-gateway"  [4003]="swift-chain-bridge"
    [4004]="indexer"        [4005]="otc-liquidity"
    [4006]="dune-bots"      [4007]="mock-mgw"
    [5000]="api-gateway"    [5001]="ws-gateway"
    [5002]="deposit-worker"
  )

  local conflict=false
  for port in $(echo "${!PORT_MAP[@]}" | tr ' ' '\n' | sort -n); do
    local svc="${PORT_MAP[$port]}"
    local pid
    pid=$(lsof -ti ":${port}" 2>/dev/null || ss -tlnp 2>/dev/null | grep ":${port} " | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2 || echo "")
    if [ -n "$pid" ]; then
      local pname; pname=$(ps -p "$pid" -o comm= 2>/dev/null || echo "?")
      ok "  :${port}  ${D}${svc}${NC}  ${D}→ pid ${pid} (${pname})${NC}"
    else
      echo -e "  ${D}○${NC}  :${port}  ${D}${svc} — free${NC}"
    fi
  done

  # Kiểm tra port conflict thực sự (2 process trên cùng port)
  for port in 3001 3002 3003 3004 3005 3006 3007 3010 3011 3012 3013 5000 5001; do
    local pids; pids=$(lsof -ti ":${port}" 2>/dev/null | wc -l || echo 0)
    if (( pids > 1 )); then
      bad "Port ${port} bị chiếm bởi ${pids} process"
      conflict=true
      ask_fix "kill tất cả process trên :${port}" \
        "lsof -ti :${port} 2>/dev/null | xargs kill -9 2>/dev/null || true"
    fi
  done

  $conflict || ok "Không có port conflict"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 5 — .ENV
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
check_env_file() {
  step "5 · Environment (.env)"

  local env_file="${ROOT}/.env"

  if [ ! -f "$env_file" ]; then
    bad ".env không tồn tại"
    ask_fix "copy .env.example → .env" "cp '${ROOT}/.env.example' '${env_file}'"
    return
  fi
  ok ".env found"

  # Kiểm tra các key bắt buộc
  local required=(
    DATABASE_URL REDIS_URL JWT_SECRET NODE_ENV
    NEXT_PUBLIC_API_URL
  )
  local missing=()
  for key in "${required[@]}"; do
    if ! grep -qE "^${key}=.+" "$env_file" 2>/dev/null; then
      missing+=("$key")
    fi
  done

  if [ ${#missing[@]} -gt 0 ]; then
    bad "Thiếu biến môi trường: ${missing[*]}"
    info "Mở ${Y}${env_file}${NC} và điền giá trị cho các key trên"
  else
    ok "Tất cả required env vars có mặt"
  fi

  # Cảnh báo giá trị mặc định nguy hiểm trong production
  if grep -qE "^NODE_ENV=production" "$env_file" 2>/dev/null; then
    if grep -qE "change_me|placeholder|your_|example|localhost" "$env_file" 2>/dev/null; then
      warn "NODE_ENV=production nhưng vẫn còn giá trị placeholder trong .env!"
      grep -nE "change_me|placeholder|your_|localhost" "$env_file" 2>/dev/null | head -5 | while read -r line; do
        info "${D}${line}${NC}"
      done
    fi
  fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 6 — DISK / RAM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
check_resources() {
  step "6 · System Resources"

  # RAM
  if command -v free &>/dev/null; then
    local total used pct
    total=$(free -m | awk '/Mem:/{print $2}')
    used=$(free -m  | awk '/Mem:/{print $3}')
    pct=$(( used * 100 / total ))
    local bar_filled=$(( pct * 30 / 100 ))
    local bar_empty=$(( 30 - bar_filled ))
    local bar_color=$G
    (( pct > 80 )) && bar_color=$Y
    (( pct > 90 )) && bar_color=$R
    local bar="${bar_color}$(printf '█%.0s' $(seq 1 $bar_filled 2>/dev/null))${D}$(printf '░%.0s' $(seq 1 $bar_empty 2>/dev/null))${NC}"
    printf "  %s  ${W}%3d%%${NC}  RAM  %sMB / %sMB\n" "$bar" "$pct" "$used" "$total"
    if (( pct > 90 )); then
      bad "RAM sử dụng ${pct}% — nguy hiểm"
      info "Top processes: $(ps aux --sort=-%mem | awk 'NR>1{print $11}' | head -5 | tr '\n' ' ')"
      ask_fix "pm2 stop all để giải phóng RAM" "pm2 stop all --silent 2>/dev/null || true"
    elif (( pct > 80 )); then
      warn "RAM ${pct}% — cao, theo dõi"
    fi
  fi

  # Disk (thư mục workspace)
  if command -v df &>/dev/null; then
    local disk_pct; disk_pct=$(df -h "${ROOT}" 2>/dev/null | awk 'NR==2{gsub(/%/,"",$5); print $5}' || echo "?")
    if [ "$disk_pct" != "?" ] && (( disk_pct > 85 )); then
      bad "Disk ${disk_pct}% đầy"
      local nm_size; nm_size=$(du -sh "${ROOT}/node_modules" 2>/dev/null | cut -f1 || echo "?")
      info "node_modules chiếm ${nm_size}"
      ask_fix "xoá dist/ .next/ .turbo/ để giải phóng disk" \
        "find '${ROOT}' -maxdepth 4 \( -name 'dist' -o -name '.next' -o -name '.turbo' \) -not -path '*/node_modules/*' -type d -exec rm -rf {} + 2>/dev/null; true"
    else
      ok "Disk ${disk_pct}%"
    fi
  fi

  # Load average
  if [ -f /proc/loadavg ]; then
    local load; load=$(cut -d' ' -f1 /proc/loadavg)
    local cores; cores=$(nproc 2>/dev/null || echo 1)
    local load_int; load_int=$(echo "$load" | cut -d. -f1)
    if (( load_int > cores )); then
      warn "Load avg ${load} > ${cores} cores — hệ thống quá tải"
    else
      ok "Load avg ${load}  (${cores} cores)"
    fi
  fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 7 — WORKSPACE INTEGRITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
check_workspace() {
  step "7 · Workspace Integrity"

  # tsconfig.base.json
  [ -f "${ROOT}/tsconfig.base.json" ] \
    && ok "tsconfig.base.json" \
    || bad "tsconfig.base.json thiếu"

  # Anchor.toml test script dùng pnpm (không dùng yarn)
  if [ -f "${ROOT}/Anchor.toml" ]; then
    if grep -q 'yarn' "${ROOT}/Anchor.toml"; then
      bad "Anchor.toml dùng yarn — nên là pnpm"
      ask_fix "sửa Anchor.toml test = pnpm exec ..." \
        "sed -i 's/yarn exec/pnpm exec/g; s/\"yarn /\"pnpm /g' '${ROOT}/Anchor.toml'"
    else
      ok "Anchor.toml  test script dùng pnpm"
    fi
  fi

  # Kiểm tra catalog: consistency — không còn hardcode next version
  local hardcoded; hardcoded=$(grep -rl '"next": "\^' "${ROOT}/apps" 2>/dev/null | wc -l || echo 0)
  if (( hardcoded > 0 )); then
    bad "${hardcoded} app(s) vẫn hardcode next version thay vì catalog:"
    grep -rl '"next": "\^' "${ROOT}/apps" 2>/dev/null | while read -r f; do
      info "${D}${f}${NC}"
    done
    ask_fix "đổi sang catalog: trong các app trên" \
      "grep -rl '\"next\": \"\^' '${ROOT}/apps' | xargs -I{} sed -i 's/\"next\": \"\^[^\"]*\"/\"next\": \"catalog:\"/g' {}"
  else
    ok "Tất cả apps dùng catalog: cho next"
  fi

  # pnpm-workspace.yaml tồn tại
  [ -f "${ROOT}/pnpm-workspace.yaml" ] \
    && ok "pnpm-workspace.yaml" \
    || bad "pnpm-workspace.yaml thiếu"

  # turbo.json tồn tại
  [ -f "${ROOT}/turbo.json" ] \
    && ok "turbo.json" \
    || bad "turbo.json thiếu"

  # .npmrc
  [ -f "${ROOT}/.npmrc" ] \
    && ok ".npmrc" \
    || bad ".npmrc thiếu"

  # wikialisa.sh executable
  if [ -f "${ROOT}/wikialisa.sh" ]; then
    if [ -x "${ROOT}/wikialisa.sh" ]; then
      ok "wikialisa.sh  executable"
    else
      bad "wikialisa.sh không có quyền execute"
      ask_fix "chmod +x wikialisa.sh" "chmod +x '${ROOT}/wikialisa.sh'"
    fi
  fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SUMMARY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
summary() {
  nl; sep
  echo -e "  ${BOLD}Kết quả chẩn đoán${NC}"
  nl
  if (( ISSUES == 0 )); then
    echo -e "  ${G}${BOLD}✔  Không phát hiện vấn đề nào.${NC}"
  else
    echo -e "  ${R}✖  Phát hiện ${BOLD}${ISSUES}${NC}${R} vấn đề${NC}"
    if (( FIXED > 0 )); then
      echo -e "  ${G}⚡  Đã tự động sửa ${BOLD}${FIXED}${NC}${G} vấn đề${NC}"
    fi
    local remain=$(( ISSUES - FIXED ))
    if (( remain > 0 )); then
      echo -e "  ${Y}⚠  Còn ${BOLD}${remain}${NC}${Y} vấn đề cần xử lý thủ công${NC}"
    fi
  fi
  nl
  echo -e "  ${D}Quick fixes:${NC}"
  echo -e "  ${C}./wikialisa.sh install${NC}   — cài lại dependencies"
  echo -e "  ${C}./wikialisa.sh dev${NC}        — start dev mode"
  echo -e "  ${C}./fix.sh --auto${NC}           — sửa tất cả tự động"
  nl; sep; nl
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENTRYPOINT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
banner

case "${MODE}" in
  pm2)
    check_pm2
    summary
    ;;
  install)
    check_install
    summary
    ;;
  ports)
    check_ports
    summary
    ;;
  env)
    check_env_file
    summary
    ;;
  --check)
    AUTO=false
    check_prereqs
    check_install
    check_pm2
    check_ports
    check_env_file
    check_resources
    check_workspace
    summary
    ;;
  --auto|"")
    check_prereqs
    check_install
    check_pm2
    check_ports
    check_env_file
    check_resources
    check_workspace
    summary
    ;;
  help|--help|-h)
    nl
    echo -e "  ${BOLD}fix.sh${NC} — Wikialisa Trình Khắc Phục Sự Cố"
    nl
    echo -e "  ${C}./fix.sh${NC}           chẩn đoán + hỏi từng bước"
    echo -e "  ${C}./fix.sh --auto${NC}    chẩn đoán + tự sửa tất cả"
    echo -e "  ${C}./fix.sh --check${NC}   chỉ chẩn đoán, không sửa"
    echo -e "  ${C}./fix.sh pm2${NC}       chỉ kiểm tra PM2 processes"
    echo -e "  ${C}./fix.sh install${NC}   chỉ kiểm tra pnpm / lockfile"
    echo -e "  ${C}./fix.sh ports${NC}     kiểm tra port conflicts"
    echo -e "  ${C}./fix.sh env${NC}       kiểm tra .env variables"
    nl
    ;;
  *)
    warn "Unknown command: ${MODE}"
    info "Dùng: ${Y}./fix.sh --help${NC}"
    exit 1
    ;;
esac
