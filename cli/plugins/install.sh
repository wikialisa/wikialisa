#!/usr/bin/env bash
# ─── cli/plugins/install.sh ──────────────────────────────────────────────────
COMMAND="install"
ALIASES=()
DESCRIPTION="pnpm install + update lockfile + WSL1 shims"

run() {
  step "Install dependencies"
  mkdir -p "$LOG_DIR"

  # ── Dừng PM2 trước để tránh file lock trên WSL1/Windows ──────────────────
  if command -v pm2 &>/dev/null && pm2 list 2>/dev/null | grep -q "online"; then
    info "Dừng PM2 để tránh file lock (WSL1)..."
    pm2 stop all --silent 2>/dev/null || true
    sleep 1
  fi

  # ── Phát hiện WSL1 ────────────────────────────────────────────────────────
  local is_wsl1=false
  if grep -qi microsoft /proc/version 2>/dev/null; then
    local kernel; kernel=$(uname -r 2>/dev/null || echo "")
    if ! echo "$kernel" | grep -qi "WSL2"; then
      is_wsl1=true
      info "WSL1 detected — dùng --ignore-scripts để tránh EACCES rename"
    fi
  fi

  # ── Xóa _tmp_ file còn sót từ install bị interrupt ───────────────────────
  info "Xóa temp files tồn đọng..."
  find "${ROOT}/apps" -maxdepth 3 -name "*_tmp_*" -exec rm -rf {} + 2>/dev/null || true
  find "${ROOT}/packages" -maxdepth 3 -name "*_tmp_*" -exec rm -rf {} + 2>/dev/null || true
  find "${ROOT}/services" -maxdepth 3 -name "*_tmp_*" -exec rm -rf {} + 2>/dev/null || true

  # ── Chạy pnpm install ─────────────────────────────────────────────────────
  local install_args=(--no-frozen-lockfile)
  $is_wsl1 && install_args+=(--ignore-scripts)

  info "pnpm install ${install_args[*]}..."

  # Chạy thẳng — không pipe qua grep để giữ exit code thực
  if pnpm install "${install_args[@]}" 2>&1 | tee /tmp/wikialisa_install.log; then
    # ── WSL1: tạo .bin/ shims sau install ──────────────────────────────────
    $is_wsl1 && _make_wsl1_bin_shims

    # ── Xác nhận workspace packages được resolve ───────────────────────────
    local resolved
    resolved=$(ls "${ROOT}/node_modules/@wikialisa/" 2>/dev/null | wc -l)
    if (( resolved > 0 )); then
      ok "@wikialisa/* packages resolved: ${resolved} packages"
    else
      warn "@wikialisa/* không có trong node_modules — workspace links có thể thiếu"
      warn "Thử chạy: pnpm install --no-frozen-lockfile lại một lần nữa"
    fi

    done_ "Dependencies installed"
  else
    local rc=$?
    fail "pnpm install thất bại (exit ${rc})"
    echo ""
    info "Tail log:"
    tail -20 /tmp/wikialisa_install.log
    echo ""
    # ── Gợi ý sửa lỗi theo loại lỗi ─────────────────────────────────────
    if grep -q "EACCES.*rename" /tmp/wikialisa_install.log 2>/dev/null; then
      warn "Lỗi EACCES rename — WSL1 filesystem issue"
      info "Fix: thêm 'package-import-method=copy' và 'side-effects-cache=false' vào .npmrc"
    elif grep -q "FROZEN" /tmp/wikialisa_install.log 2>/dev/null; then
      warn "Lockfile out-of-sync — chạy: pnpm install --no-frozen-lockfile"
    elif grep -q "ERR_PNPM_FETCH" /tmp/wikialisa_install.log 2>/dev/null; then
      warn "Network error — kiểm tra kết nối internet và registry trong .npmrc"
    fi
    return $rc
  fi
}
