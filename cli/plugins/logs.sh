#!/usr/bin/env bash
# ─── cli/plugins/logs.sh ─────────────────────────────────────────────────────
COMMAND="logs"
ALIASES=()
DESCRIPTION="pm2 logs realtime  [name]  — lọc theo tên process"

run() {
  local name="${1:-}"
  _need_pm2 || return 1
  if [ -n "$name" ]; then
    exec pm2 logs "$name" --lines 60
  else
    exec pm2 logs --lines 30
  fi
}
