#!/usr/bin/env bash
# ─── cli/plugins/stop.sh ─────────────────────────────────────────────────────
COMMAND="stop"
ALIASES=()
DESCRIPTION="PM2 stop all processes"

run() {
  step "Stop all PM2 processes"
  _need_pm2 || return 1
  pm2 stop all --silent 2>/dev/null \
    && done_ "All stopped" \
    || warn "Không có process nào đang chạy"
}
