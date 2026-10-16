#!/usr/bin/env bash
# ─── cli/plugins/start.sh ────────────────────────────────────────────────────
COMMAND="start"
ALIASES=()
DESCRIPTION="PM2 production start (ecosystem.config.cjs)"

run() {
  step "Start — Production"
  mkdir -p "$LOG_DIR"
  _need_pm2 || return 1

  if pm2 list 2>/dev/null | grep -q "app-web"; then
    info "Đã có process — reload với --update-env..."
    pm2 reload "${ROOT}/ecosystem.config.cjs" --update-env --silent
  else
    pm2 start "${ROOT}/ecosystem.config.cjs" -f --silent
  fi
  pm2 save --silent 2>/dev/null || true
  nl; pm2 ls
  done_ "Production started"
}
