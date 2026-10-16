#!/usr/bin/env bash
# ─── cli/plugins/lint.sh ─────────────────────────────────────────────────────
COMMAND="lint"
ALIASES=()
DESCRIPTION="turbo lint toàn bộ monorepo"

run() {
  step "Lint"
  _need_turbo || return 1
  "${BIN}/turbo" run lint --cache-dir=.turbo
  done_ "Lint passed"
}
