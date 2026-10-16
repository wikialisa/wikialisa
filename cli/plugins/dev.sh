#!/usr/bin/env bash
# ─── cli/plugins/dev.sh ──────────────────────────────────────────────────────
COMMAND="dev"
ALIASES=("dev:all")
DESCRIPTION="PM2 start ALL apps + services (dev mode)"

# ── private helper ────────────────────────────────────────────────────────────
_pm2_start_filter() {
  local label="$1" filter="$2" eco="$3"
  step "$label"
  mkdir -p "$LOG_DIR"
  _need_pm2 || return 1
  pm2 start "${ROOT}/${eco}" --only "$filter" -f --silent
  nl; pm2 ls; nl
  info "Logs: ${Y}./wikialisa.sh logs${NC}  |  Stop: ${Y}./wikialisa.sh stop${NC}"
}

run() {
  local sub="${1:-all}"
  case "$sub" in
    apps)     _pm2_start_filter "Dev — Apps"     "$APPS_FILTER"                 "ecosystem.dev.cjs" ;;
    services) _pm2_start_filter "Dev — Services" "$SVCS_FILTER"                 "ecosystem.dev.cjs" ;;
    *)        _pm2_start_filter "Dev — All"      "${APPS_FILTER},${SVCS_FILTER}" "ecosystem.dev.cjs" ;;
  esac
}
