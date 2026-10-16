#!/usr/bin/env bash
# ─── cli/plugins/restart.sh ──────────────────────────────────────────────────
COMMAND="restart"
ALIASES=("reload")
DESCRIPTION="PM2 reload all --update-env"

run() {
  step "Restart / reload PM2"
  _need_pm2 || return 1
  pm2 reload all --update-env --silent
  nl; pm2 ls
  done_ "Reloaded"
}
