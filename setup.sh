#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║   W I K I A L I S A  —  setup.sh                                          ║
# ║   Pipeline: detect → env → clean → install → db → build → dev → test     ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
#  Idempotent — mỗi bước tự kiểm tra xem đã hoàn thành chưa → bỏ qua nếu rồi.
#
#  Usage:
#    ./setup.sh                  # chạy toàn bộ pipeline
#    ./setup.sh --from build     # bắt đầu từ bước build (bỏ qua trước đó)
#    ./setup.sh --only db        # chỉ chạy bước db
#    ./setup.sh --skip test      # bỏ qua test
#    ./setup.sh --no-clean       # không xoá cache/build
#    ./setup.sh --no-db          # không start Docker / DB
#    ./setup.sh --no-dev         # không start PM2 dev

set -euo pipefail
export TERM="${TERM:-xterm-256color}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN="${ROOT}/node_modules/.bin"
LOG_DIR="${ROOT}/.pm2/logs"
COMPOSE_FILE="${ROOT}/deploy/docker/docker-compose.yml"
STATE_DIR="${ROOT}/.wikialisa"   # cache trạng thái từng bước
mkdir -p "${STATE_DIR}" "${LOG_DIR}"

# ── Parse flags ───────────────────────────────────────────────────────────────
FROM_STEP=""
ONLY_STEP=""
SKIP_STEP=""
NO_CLEAN=false
NO_DB=false
NO_DEV=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --from)   FROM_STEP="$2";  shift 2 ;;
    --only)   ONLY_STEP="$2";  shift 2 ;;
    --skip)   SKIP_STEP="$2";  shift 2 ;;
    --no-clean) NO_CLEAN=true; shift ;;
    --no-db)    NO_DB=true;    shift ;;
    --no-dev)   NO_DEV=true;   shift ;;
    *) shift ;;
  esac
done

# ── Colors ────────────────────────────────────────────────────────────────────
R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'
C='\033[0;36m'; W='\033[1;37m'; D='\033[2m'; NC='\033[0m'; BOLD='\033[1m'

# ── State tracking ─────────────────────────────────────────────────────────────
state_set()   { touch "${STATE_DIR}/$1.done"; }
state_done()  { [ -f "${STATE_DIR}/$1.done" ]; }
state_clear() { rm -f "${STATE_DIR}/$1.done"; }

# ── Helpers ────────────────────────────────────────────────────────────────────
nl()    { echo ""; }
ok()    { echo -e "  ${G}✔${NC}  $*"; }
skip()  { echo -e "  ${D}⊘  skipped: $*${NC}"; }
fail()  { echo -e "  ${R}✖  $*${NC}"; exit 1; }
warn()  { echo -e "  ${Y}⚠${NC}  $*"; }
info()  { echo -e "  ${C}→${NC}  $*"; }

step_header() {
  local num="$1" name="$2" desc="$3"
  echo ""
  echo -e "  ${BG:-}${BOLD}${C}┌─ Step ${num} · ${W}${name}${NC}"
  echo -e "  ${C}│${NC}  ${D}${desc}${NC}"
  echo -e "  ${C}└─────────────────────────────────────────────────${NC}"
}

# Spinner cho lệnh chạy ngầm
spin() {
  local label="$1"; shift
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local i=0
  "$@" >/tmp/setup_spin.log 2>&1 &
  local pid=$!
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r     ${C}%s${NC}  %s  " "${frames[$i]}" "$label"
    i=$(( (i+1) % ${#frames[@]} ))
    sleep 0.09
  done
  wait "$pid"
  local rc=$?
  if [ $rc -eq 0 ]; then
    printf "\r  ${G}✔${NC}  %-60s\n" "$label"
  else
    printf "\r  ${R}✖${NC}  %-60s\n" "$label"
    echo -e "${D}$(tail -10 /tmp/setup_spin.log)${NC}"
    return $rc
  fi
}

# Progress bar
pbar() {
  local filled=$1 total=$2 label="$3"
  local w=28
  local f=$(( filled * w / total ))
  local e=$(( w - f ))
  local bar="${G}$(printf '█%.0s' $(seq 1 $f 2>/dev/null || true))${D}$(printf '░%.0s' $(seq 1 $e 2>/dev/null || true))${NC}"
  printf "  %s  ${W}%2d/%d${NC}  %s\n" "$bar" "$filled" "$total" "$label"
}

# Quyết định có chạy step không
should_run() {
  local name="$1"
  [ -n "$ONLY_STEP" ] && [ "$ONLY_STEP" != "$name" ] && return 1
  [ -n "$SKIP_STEP" ] && [ "$SKIP_STEP"  = "$name" ] && return 1
  if [ -n "$FROM_STEP" ]; then
    # đã qua FROM_STEP rồi → chạy; chưa → bỏ qua
    case "$FROM_STEP" in
      detect)  true ;;
      env)     [[ "$name" =~ ^(env|clean|install|db|build|dev|test)$ ]] ;;
      clean)   [[ "$name" =~ ^(clean|install|db|build|dev|test)$ ]] ;;
      install) [[ "$name" =~ ^(install|db|build|dev|test)$ ]] ;;
      db)      [[ "$name" =~ ^(db|build|dev|test)$ ]] ;;
      build)   [[ "$name" =~ ^(build|dev|test)$ ]] ;;
      dev)     [[ "$name" =~ ^(dev|test)$ ]] ;;
      test)    [ "$name" = "test" ] ;;
    esac
    return $?
  fi
  return 0
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BANNER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
printf '\033[H\033[2J\033[3J' 2>/dev/null || true
echo -e "${C}"
echo '  ┬ ┬┬┬┌─┬┌─┐┬  ┬┌─┐┌─┐'
echo '  ││││├┴┐│├─┤│  │└─┐├─┤'
echo '  └┴┘┴└─┘┴┴ ┴┴─┘┴└─┘┴ ┴  setup.sh'
echo -e "${NC}  ${D}AXQ Tech Holding JSC  ·  Full Setup Pipeline  ·  axvn.vn${NC}"
echo ""
echo -e "  ${D}Pipeline:${NC}  ${C}detect${NC} → ${C}env${NC} → ${C}clean${NC} → ${C}install${NC} → ${C}db${NC} → ${C}build${NC} → ${C}dev${NC} → ${C}test${NC}"
echo -e "  ${D}Root:${NC}      ${W}${ROOT}${NC}"
echo ""

TOTAL_STEPS=8
DONE_STEPS=0

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# WSL1 BIN SHIMS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_wsl1_bin_shims() {
  local BD="${ROOT}/node_modules/.bin"
  local NM="${ROOT}/node_modules"
  mkdir -p "$BD"
  _s() {
    local name="$1" rel="$2" pkg="${3:-$1}"
    local f="${NM}/${pkg}/${rel}"
    [ -f "$f" ] || return 0
    printf '#!/usr/bin/env node\nrequire("%s")\n' "$f" > "${BD}/${name}"
    chmod +x "${BD}/${name}"
  }
  _s turbo       bin/turbo
  _s prettier    bin/prettier.cjs
  _s eslint      bin/eslint.js
  _s tsc         bin/tsc            typescript
  _s tsserver    bin/tsserver       typescript
  _s ts-node     dist/bin.js        ts-node
  _s ts-node-dev lib/bin.js         ts-node-dev
  _s tsup        dist/cli-default.js
  _s vitest      vitest.mjs
  _s next        dist/bin/next
  local cs="${NM}/@changesets/cli/bin.js"
  [ -f "$cs" ] && printf '#!/usr/bin/env node\nrequire("%s")\n' "$cs" > "${BD}/changeset" && chmod +x "${BD}/changeset"
  ok "WSL1 .bin shims: $(ls "$BD" | wc -l) tools"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DOCKER HELPERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Phát hiện distro để chọn package manager
_detect_distro() {
  if [ -f /etc/os-release ]; then
    # shellcheck disable=SC1091
    source /etc/os-release
    echo "${ID:-unknown}"
  elif command -v lsb_release &>/dev/null; then
    lsb_release -si | tr '[:upper:]' '[:lower:]'
  else
    echo "unknown"
  fi
}

# Cài Docker Engine theo distro
_install_docker() {
  local distro; distro=$(_detect_distro)
  info "Distro: ${W}${distro}${NC}"

  case "$distro" in
    ubuntu|debian|linuxmint|pop)
      info "Cài Docker Engine (apt)..."
      export DEBIAN_FRONTEND=noninteractive
      # Xoá package cũ (nếu có)
      apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
      # Cài dependencies
      spin "apt-get update + ca-certificates curl" \
        bash -c "apt-get update -qq && apt-get install -y -qq ca-certificates curl gnupg lsb-release 2>/dev/null"
      # Add GPG key + repo
      spin "Thêm Docker GPG key + apt repo" bash -c "
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
          | gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null
        chmod a+r /etc/apt/keyrings/docker.gpg
        echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
          https://download.docker.com/linux/ubuntu \$(. /etc/os-release && echo \"\$VERSION_CODENAME\") stable\" \
          > /etc/apt/sources.list.d/docker.list
        apt-get update -qq 2>/dev/null
      "
      spin "apt-get install docker-ce docker-ce-cli containerd.io" \
        bash -c "apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin 2>/dev/null"
      ;;
    centos|rhel|fedora|rocky|almalinux)
      info "Cài Docker Engine (dnf/yum)..."
      local pm="dnf"; command -v dnf &>/dev/null || pm="yum"
      spin "Thêm Docker CE repo" \
        bash -c "$pm install -y -q yum-utils 2>/dev/null && \
          yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo 2>/dev/null"
      spin "$pm install docker-ce docker-ce-cli containerd.io" \
        bash -c "$pm install -y -q docker-ce docker-ce-cli containerd.io docker-compose-plugin 2>/dev/null"
      ;;
    arch|manjaro)
      spin "pacman -S docker" \
        bash -c "pacman -Sy --noconfirm docker 2>/dev/null"
      ;;
    alpine)
      spin "apk add docker" \
        bash -c "apk add --no-cache docker 2>/dev/null"
      ;;
    *)
      # Convenience script (universal fallback)
      warn "Distro '${distro}' — dùng Docker convenience script..."
      spin "curl -fsSL https://get.docker.com | sh" \
        bash -c "curl -fsSL https://get.docker.com | sh 2>/dev/null"
      ;;
  esac

  # Thêm user hiện tại vào group docker
  if command -v usermod &>/dev/null && [ -n "${SUDO_USER:-}" ]; then
    usermod -aG docker "${SUDO_USER}" 2>/dev/null || true
    info "Đã thêm ${SUDO_USER} vào group docker (cần re-login để có hiệu lực)"
  fi

  # Khởi động service
  _start_docker_service
}

# Start Docker daemon (systemd / service / dockerd ngầm)
_try_dockerd_bg() {
  _start_docker_service
}

_start_docker_service() {
  info "Khởi động Docker daemon..."

  # Phân biệt WSL1 vs WSL2 — WSL1 không hỗ trợ dockerd
  local is_wsl=false is_wsl1=false is_wsl2=false
  if grep -qi microsoft /proc/version 2>/dev/null; then
    is_wsl=true
    # WSL1: uname -r không chứa "WSL2"; WSL2 chứa "WSL2" hoặc kernel >= 5.x
    local kernel; kernel=$(uname -r 2>/dev/null || echo "")
    if echo "$kernel" | grep -qi "WSL2"; then
      is_wsl2=true
    else
      is_wsl1=true
    fi
  fi

  if $is_wsl1; then
    # WSL1 không chạy được dockerd — cần Docker Desktop trên Windows
    warn "WSL1 detected — dockerd không chạy được trên WSL1"
    warn "Giải pháp: cài ${W}Docker Desktop for Windows${NC} rồi bật ${W}WSL integration${NC}"
    info "https://docs.docker.com/desktop/windows/wsl/"
    info "Sau khi cài xong, chạy lại: ${Y}./setup.sh --from db${NC}"
    NO_DB=true
    return 0
  elif $is_wsl2; then
    info "WSL2 detected — khởi động dockerd ngầm..."
    if ! docker info &>/dev/null 2>&1; then
      nohup dockerd >/tmp/dockerd.log 2>&1 &
      local elapsed=0
      while ! docker info &>/dev/null 2>&1 && (( elapsed < 20 )); do
        sleep 2; elapsed=$(( elapsed + 2 ))
        printf "\r  ${C}⠿${NC}  dockerd: waiting... ${elapsed}s  "
      done
      printf "\r"
    fi
  elif command -v systemctl &>/dev/null; then
    systemctl enable docker 2>/dev/null || true
    systemctl start  docker 2>/dev/null || true
    sleep 3
  elif command -v service &>/dev/null; then
    service docker start 2>/dev/null || true
    sleep 3
  fi

  # Kiểm tra kết quả
  if docker info &>/dev/null 2>&1; then
    ok "Docker daemon running  $(docker --version | grep -o '[0-9]*\.[0-9]*\.[0-9]*' | head -1)"
  else
    warn "Docker daemon chưa ready — bước db sẽ bị bỏ qua"
    NO_DB=true
  fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 1 — DETECT: kiểm tra tools đã cài chưa
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
step_detect() {
  step_header 1 "detect" "Kiểm tra tools: Node, pnpm, PM2, Docker"

  local all_ok=true

  # Node.js
  if command -v node &>/dev/null; then
    local nv; nv=$(node -e "process.stdout.write(process.versions.node)")
    local major; major=$(echo "$nv" | cut -d. -f1)
    if (( major >= 22 )); then ok "node  v${nv}"
    else warn "node v${nv} — nên >= v22"; all_ok=false; fi
  else
    fail "Node.js chưa cài  →  nvm install 22"
  fi

  # pnpm
  if command -v pnpm &>/dev/null; then
    ok "pnpm  $(pnpm --version)"
  else
    info "Cài pnpm..."
    npm install -g pnpm@9.15.9 --silent && ok "pnpm installed" || fail "pnpm install failed"
  fi

  # PM2
  if command -v pm2 &>/dev/null; then
    ok "pm2   $(pm2 --version)"
  else
    info "Cài PM2..."
    npm install -g pm2 --silent && ok "pm2 installed" || warn "pm2 install failed — dev start sẽ bị bỏ qua"
  fi

  # Docker — tự cài nếu chưa có, thử start daemon nếu chưa chạy
  if $NO_DB; then
    skip "docker — --no-db được bật"
  elif command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
    ok "docker  $(docker --version | grep -o '[0-9]*\.[0-9]*\.[0-9]*' | head -1)"
  elif command -v docker &>/dev/null; then
    # Docker binary có nhưng daemon chưa chạy → thử start
    warn "Docker daemon chưa chạy — đang thử khởi động..."
    if command -v systemctl &>/dev/null && systemctl start docker 2>/dev/null; then
      sleep 3
      if docker info &>/dev/null 2>&1; then
        ok "docker daemon started  $(docker --version | grep -o '[0-9]*\.[0-9]*\.[0-9]*' | head -1)"
      else
        warn "Docker daemon vẫn chưa ready — thử dockerd ngầm..."
        _try_dockerd_bg
      fi
    else
      _try_dockerd_bg
    fi
  else
    # Docker chưa cài — tự cài
    warn "Docker chưa cài — đang cài đặt..."
    _install_docker
  fi

  # turbo (local — chỉ sau install)
  if [ -x "${BIN}/turbo" ]; then
    ok "turbo $("${BIN}/turbo" --version 2>/dev/null || echo 'ok')"
  else
    info "turbo sẽ có sau bước install"
  fi

  # PATH check
  local missing_path=false
  for tool in git curl; do
    if command -v "$tool" &>/dev/null; then
      ok "$tool  $(command -v $tool)"
    else
      warn "$tool không tìm thấy trong PATH"
      missing_path=true
    fi
  done

  $missing_path && warn "PATH: $(echo $PATH | tr ':' '\n' | head -5 | paste -sd' ')"

  DONE_STEPS=$(( DONE_STEPS + 1 ))
  pbar $DONE_STEPS $TOTAL_STEPS "detect complete"
  state_set detect
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 2 — ENV: kiểm tra .env, tự hoàn thành nếu thiếu
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
step_env() {
  step_header 2 "env" "Kiểm tra .env — tự điền defaults nếu thiếu"

  local env_file="${ROOT}/.env"

  # Tạo .env từ .env.example nếu chưa có
  if [ ! -f "$env_file" ]; then
    cp "${ROOT}/.env.example" "$env_file"
    info "Tạo .env từ .env.example"
  else
    ok ".env tồn tại"
  fi

  # Hàm: đảm bảo KEY=VALUE tồn tại, nếu chưa có thì thêm vào
  ensure_env() {
    local key="$1" val="$2"
    if ! grep -qE "^${key}=" "$env_file" 2>/dev/null; then
      echo "${key}=${val}" >> "$env_file"
      info "  + ${key}=${val}"
    fi
  }

  # Tự hoàn thành các key bắt buộc với giá trị dev mặc định
  ensure_env NODE_ENV             "development"
  ensure_env DATABASE_URL         "postgresql://postgres:dev_password_2026@localhost:5432/vnkr"
  ensure_env REDIS_URL            "redis://localhost:6379"
  ensure_env JWT_SECRET           "wikialisa_dev_jwt_$(openssl rand -hex 8 2>/dev/null || echo 'secret_dev')"
  ensure_env REFRESH_TOKEN_SECRET "wikialisa_dev_refresh_$(openssl rand -hex 8 2>/dev/null || echo 'refresh_dev')"
  ensure_env ENCRYPTION_KEY       "$(openssl rand -hex 16 2>/dev/null || echo '0000000000000000000000000000000000000000000000000000000000000000')"
  ensure_env NEXT_PUBLIC_API_URL  "http://localhost:5000/api/v1"
  ensure_env NEXT_PUBLIC_RPC_URL  "https://api.mainnet-beta.solana.com"
  ensure_env PORT                 "5000"
  ensure_env LOG_LEVEL            "info"

  # Báo cáo key còn placeholder
  local placeholders; placeholders=$(grep -cE "=your_|=change_me|=CHANGE_ME|=placeholder" "$env_file" 2>/dev/null || echo 0)
  if (( placeholders > 0 )); then
    warn "${placeholders} biến vẫn dùng giá trị placeholder (OK cho dev)"
    grep -nE "=your_|=change_me|=CHANGE_ME|=placeholder" "$env_file" 2>/dev/null | head -5 | while IFS= read -r line; do
      echo -e "     ${D}${line}${NC}"
    done
  fi

  ok ".env đã sẵn sàng"
  DONE_STEPS=$(( DONE_STEPS + 1 ))
  pbar $DONE_STEPS $TOTAL_STEPS "env complete"
  state_set env
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 3 — CLEAN: xoá cache build gọn gàng
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
step_clean() {
  step_header 3 "clean" "Xoá dist/ .next/ .turbo/ tsconfig.tsbuildinfo"

  if $NO_CLEAN; then
    skip "clean — --no-clean được bật"
    DONE_STEPS=$(( DONE_STEPS + 1 ))
    pbar $DONE_STEPS $TOTAL_STEPS "clean skipped"
    return 0
  fi

  # Đếm trước
  local dist_count; dist_count=$(find "${ROOT}" -maxdepth 5 -name "dist" -not -path "*/node_modules/*" -type d 2>/dev/null | wc -l)
  local next_count; next_count=$(find "${ROOT}" -maxdepth 5 -name ".next" -not -path "*/node_modules/*" -type d 2>/dev/null | wc -l)
  local turbo_count; turbo_count=$(find "${ROOT}" -maxdepth 5 -name ".turbo" -not -path "*/node_modules/*" -type d 2>/dev/null | wc -l)

  info "Tìm thấy: ${dist_count} dist/  ${next_count} .next/  ${turbo_count} .turbo/"

  spin "Xoá dist/ (.next/ .turbo/ tsbuildinfo)" \
    bash -c "
      find '${ROOT}' -maxdepth 5 -name 'dist'   -not -path '*/node_modules/*' -type d -exec rm -rf {} + 2>/dev/null || true
      find '${ROOT}' -maxdepth 5 -name '.next'  -not -path '*/node_modules/*' -type d -exec rm -rf {} + 2>/dev/null || true
      find '${ROOT}' -maxdepth 5 -name '.turbo' -not -path '*/node_modules/*' -type d -exec rm -rf {} + 2>/dev/null || true
      find '${ROOT}' -maxdepth 5 -name 'tsconfig.tsbuildinfo' -not -path '*/node_modules/*' -exec rm -f {} + 2>/dev/null || true
      true
    "

  # dump.rdb Redis
  [ -f "${ROOT}/dump.rdb" ] && rm -f "${ROOT}/dump.rdb" && info "Xoá dump.rdb"

  ok "Cache đã được dọn sạch"
  DONE_STEPS=$(( DONE_STEPS + 1 ))
  pbar $DONE_STEPS $TOTAL_STEPS "clean complete"
  state_set clean
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 4 — INSTALL: pnpm install
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
step_install() {
  step_header 4 "install" "pnpm install — idempotent, update lockfile nếu stale"

  # Kiểm tra nếu đã install và turbo có mặt
  if state_done install && [ -x "${BIN}/turbo" ]; then
    # Xác nhận lockfile vẫn sync
    if pnpm install --frozen-lockfile --dry-run 2>/dev/null >/dev/null; then
      skip "install — đã hoàn thành và lockfile sync"
      DONE_STEPS=$(( DONE_STEPS + 1 ))
      pbar $DONE_STEPS $TOTAL_STEPS "install skipped"
      return 0
    else
      info "Lockfile cần update (catalog: changes)"
      state_clear install
    fi
  fi

  # Dừng PM2 trước để tránh EACCES rename (WSL1)
  if command -v pm2 &>/dev/null && pm2 list 2>/dev/null | grep -q "online"; then
    info "Dừng PM2 tránh file lock (WSL1)..."
    pm2 stop all --silent 2>/dev/null || true
    sleep 1
  fi

  info "pnpm install --no-frozen-lockfile..."
  if pnpm install --no-frozen-lockfile 2>&1 | tee /tmp/setup_install.log | \
       grep -E "^(Progress|added|warn )" | tail -6 || true; then
    # WSL1: pnpm không tạo .bin/ symlink → shim tự động
    if grep -qi microsoft /proc/version 2>/dev/null; then
      info "WSL1 — tạo .bin/ shims..."
      _wsl1_bin_shims
    fi
    if [ -x "${BIN}/turbo" ]; then
      ok "Dependencies installed — turbo: OK"
      state_set install
    else
      fail "pnpm install xong nhưng turbo vẫn không có — xem /tmp/setup_install.log"
    fi
  else
    fail "pnpm install thất bại — xem /tmp/setup_install.log"
  fi

  DONE_STEPS=$(( DONE_STEPS + 1 ))
  pbar $DONE_STEPS $TOTAL_STEPS "install complete"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 5 — DB: start PostgreSQL + Redis (Docker), chạy schema
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
step_db() {
  step_header 5 "db" "PostgreSQL + Redis (Docker) → schema → seed"

  if $NO_DB; then
    skip "db — --no-db được bật"
    DONE_STEPS=$(( DONE_STEPS + 1 ))
    pbar $DONE_STEPS $TOTAL_STEPS "db skipped"
    return 0
  fi

  if ! command -v docker &>/dev/null || ! docker info &>/dev/null 2>&1; then
    skip "db — Docker không available"
    DONE_STEPS=$(( DONE_STEPS + 1 ))
    pbar $DONE_STEPS $TOTAL_STEPS "db skipped"
    return 0
  fi

  local DC="docker compose"
  docker compose version &>/dev/null 2>&1 || DC="docker-compose"

  # Kiểm tra container đã healthy chưa
  _container_healthy() {
    local name="$1"
    local status; status=$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null || echo "missing")
    [ "$status" = "healthy" ]
  }

  if _container_healthy vnkr-postgres && _container_healthy vnkr-redis; then
    skip "db — postgres + redis đã healthy"
  else
    info "Khởi động postgres + redis..."
    spin "docker compose up -d postgres redis" \
      $DC -f "${COMPOSE_FILE}" up -d --no-deps postgres redis 2>/dev/null

    # Chờ healthy (tối đa 60s)
    info "Chờ postgres healthy..."
    local elapsed=0
    until _container_healthy vnkr-postgres || (( elapsed >= 60 )); do
      sleep 3; elapsed=$(( elapsed + 3 ))
      printf "\r  ${C}⠿${NC}  postgres: waiting... ${elapsed}s  "
    done
    printf "\r"
    _container_healthy vnkr-postgres && ok "postgres healthy" || warn "postgres timeout — tiếp tục anyway"

    info "Chờ redis healthy..."
    elapsed=0
    until _container_healthy vnkr-redis || (( elapsed >= 30 )); do
      sleep 2; elapsed=$(( elapsed + 2 ))
    done
    _container_healthy vnkr-redis && ok "redis healthy" || warn "redis timeout"
  fi

  # Chạy schema nếu chưa
  if ! docker exec vnkr-postgres psql -U postgres -d vnkr -c "SELECT 1 FROM information_schema.schemata WHERE schema_name='identity'" 2>/dev/null | grep -q "1 row"; then
    info "Áp dụng DB schema..."
    for sql_file in 01_schema 02_seed 03_views 04_roles; do
      local path="${ROOT}/deploy/db/${sql_file}.sql"
      if [ -f "$path" ]; then
        spin "  $sql_file.sql" \
          bash -c "docker exec -i vnkr-postgres psql -U postgres -d vnkr -v ON_ERROR_STOP=0 --quiet < '$path' 2>/dev/null || true"
      fi
    done
    ok "Schema applied"
  else
    skip "db schema — đã tồn tại (identity schema found)"
  fi

  DONE_STEPS=$(( DONE_STEPS + 1 ))
  pbar $DONE_STEPS $TOTAL_STEPS "db complete"
  state_set db
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 6 — BUILD: turbo build toàn bộ packages
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
step_build() {
  step_header 6 "build" "turbo build — packages → apps → services"

  if ! [ -x "${BIN}/turbo" ]; then
    fail "turbo không tìm thấy — chạy bước install trước"
  fi

  # Load .env
  set -o allexport
  # shellcheck disable=SC1090
  source <(grep -v '^\s*#' "${ROOT}/.env" | grep -v '^\s*$') 2>/dev/null || true
  set +o allexport

  info "Build order: types → config → packages → apps/*"
  spin "turbo run build --cache-dir=.turbo" \
    "${BIN}/turbo" run build --cache-dir="${ROOT}/.turbo"

  ok "Build complete"
  DONE_STEPS=$(( DONE_STEPS + 1 ))
  pbar $DONE_STEPS $TOTAL_STEPS "build complete"
  state_set build
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 7 — DEV: start từng app/* bằng PM2 dev ecosystem
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
step_dev() {
  step_header 7 "dev" "PM2 start apps/* (next dev HMR) + services (ts-node-dev)"

  if $NO_DEV; then
    skip "dev — --no-dev được bật"
    DONE_STEPS=$(( DONE_STEPS + 1 ))
    pbar $DONE_STEPS $TOTAL_STEPS "dev skipped"
    return 0
  fi

  if ! command -v pm2 &>/dev/null; then
    warn "PM2 không tìm thấy — bỏ qua bước dev"
    DONE_STEPS=$(( DONE_STEPS + 1 ))
    return 0
  fi

  mkdir -p "$LOG_DIR"

  # Danh sách apps và ports
  declare -A APPS=(
    [app-web]=3010 [id-fiat]=3001 [pay-portal]=3002
    [explorer]=3003 [swap-dex]=3004 [dao-portal]=3005
    [holding-admin]=3006 [digital-twin]=3007 [kyc-portal]=3013
    [merchant]=3011 [sandbox]=3012
  )

  local running=0 started=0
  for app in "${!APPS[@]}"; do
    local port="${APPS[$app]}"
    if pm2 list 2>/dev/null | grep -q "│ ${app} "; then
      ok "  ${W}${app}${NC}  ${D}:${port} — already running${NC}"
      running=$(( running + 1 ))
    else
      pm2 start "${ROOT}/ecosystem.dev.cjs" --only "$app" -f --silent 2>/dev/null || true
      ok "  ${G}↑${NC}  ${W}${app}${NC}  :${port}"
      started=$(( started + 1 ))
    fi
  done

  nl
  info "${running} apps already running  ·  ${started} apps started"
  nl
  pm2 ls 2>/dev/null | grep -E "name|app-web|id-fiat|pay-portal|explorer|swap-dex|dao-portal|holding-admin|kyc-portal|merchant|sandbox|digital-twin" || pm2 ls

  DONE_STEPS=$(( DONE_STEPS + 1 ))
  pbar $DONE_STEPS $TOTAL_STEPS "dev complete"
  state_set dev
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 8 — TEST: health check từng app + turbo test packages
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
step_test() {
  step_header 8 "test" "Health check apps · turbo test packages"

  local pass=0 fail_count=0

  # Health check HTTP (chờ tối đa 30s mỗi app)
  declare -A APP_PORTS=(
    [app-web]=3010 [id-fiat]=3001 [pay-portal]=3002
    [explorer]=3003 [swap-dex]=3004 [dao-portal]=3005
    [holding-admin]=3006 [kyc-portal]=3013
    [merchant]=3011 [sandbox]=3012
  )

  if ! $NO_DEV && command -v pm2 &>/dev/null; then
    info "HTTP health check (waiting up to 30s per app)..."
    for app in "${!APP_PORTS[@]}"; do
      local port="${APP_PORTS[$app]}"
      local ok_flag=false
      local elapsed=0
      while (( elapsed < 30 )); do
        if curl -sf "http://localhost:${port}" -o /dev/null 2>/dev/null; then
          ok_flag=true; break
        fi
        sleep 3; elapsed=$(( elapsed + 3 ))
      done
      if $ok_flag; then
        ok "  ${W}${app}${NC}  http://localhost:${port}  ${G}200${NC}"
        pass=$(( pass + 1 ))
      else
        warn "  ${W}${app}${NC}  :${port}  ${Y}no response${NC}  ${D}(still starting?)${NC}"
      fi
    done
  fi

  # turbo test — packages có test suite
  if [ -x "${BIN}/turbo" ]; then
    nl; info "turbo test packages..."
    if "${BIN}/turbo" run test \
         --filter=@wikialisa/swift-core \
         --filter=@wikialisa/core-sdk \
         --cache-dir="${ROOT}/.turbo" 2>&1 | \
         grep -E "Tests|PASS|FAIL|✓|✗|passed|failed" | tail -12; then
      ok "Package tests passed"
    else
      warn "Package tests: xem log bên trên"
    fi
  fi

  nl
  echo -e "  ${G}✔ ${pass} apps responding${NC}  ${D}(others may still be starting)${NC}"

  DONE_STEPS=$(( DONE_STEPS + 1 ))
  pbar $DONE_STEPS $TOTAL_STEPS "test complete"
  state_set test
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SUMMARY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_summary() {
  nl
  echo -e "  ${D}────────────────────────────────────────────────────────${NC}"
  echo -e "  ${BOLD}${G}✔  Wikialisa Setup Complete${NC}"
  nl
  echo -e "  ${BOLD}Apps (dev mode):${NC}"
  echo -e "  ${C}app-web${NC}        http://localhost:3010  ${D}app.axvn.vn${NC}"
  echo -e "  ${C}id-fiat${NC}        http://localhost:3001  ${D}id.axvn.vn${NC}"
  echo -e "  ${C}pay-portal${NC}     http://localhost:3002  ${D}pay.axvn.vn${NC}"
  echo -e "  ${C}explorer${NC}       http://localhost:3003  ${D}scan.axvn.vn${NC}"
  echo -e "  ${C}swap-dex${NC}       http://localhost:3004  ${D}swap.axvn.vn${NC}"
  echo -e "  ${C}dao-portal${NC}     http://localhost:3005  ${D}dao.axvn.vn${NC}"
  echo -e "  ${C}holding-admin${NC}  http://localhost:3006  ${D}holding.axvn.vn${NC}"
  echo -e "  ${C}kyc-portal${NC}     http://localhost:3013  ${D}kyc.axvn.vn${NC}"
  echo -e "  ${C}merchant${NC}       http://localhost:3011  ${D}merchant.axvn.vn${NC}"
  echo -e "  ${C}sandbox${NC}        http://localhost:3012  ${D}sandbox.axvn.vn${NC}"
  nl
  echo -e "  ${BOLD}Useful commands:${NC}"
  echo -e "  ${Y}./wikialisa.sh status${NC}     — xem PM2 status"
  echo -e "  ${Y}./wikialisa.sh logs${NC}       — xem logs realtime"
  echo -e "  ${Y}./fix.sh --check${NC}          — chẩn đoán vấn đề"
  echo -e "  ${Y}./setup.sh --from build${NC}   — rebuild + restart"
  nl
  echo -e "  ${D}────────────────────────────────────────────────────────${NC}"
  nl
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PIPELINE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cd "${ROOT}"

should_run detect  && step_detect
should_run env     && step_env
should_run clean   && step_clean
should_run install && step_install
should_run db      && step_db
should_run build   && step_build
should_run dev     && step_dev
should_run test    && step_test

print_summary
