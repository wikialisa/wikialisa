#!/usr/bin/env bash
# ─── cli/plugins/status.sh ───────────────────────────────────────────────────
COMMAND="status"
ALIASES=("ps")
DESCRIPTION="pm2 ls + system metrics (RAM, load avg)"

run() {
  step "Status"
  _need_pm2 || return 1

  if command -v free &>/dev/null; then
    local total used pct
    total=$(free -m | awk '/Mem:/{print $2}')
    used=$(free -m  | awk '/Mem:/{print $3}')
    pct=$(( used * 100 / total ))
    pbar "$pct" 100 "RAM  ${used}MB / ${total}MB"
  fi

  if [ -f /proc/loadavg ]; then
    local load; load=$(awk '{print $1}' /proc/loadavg)
    info "Load avg: ${W}${load}${NC}"
  fi

  nl; pm2 ls
}
