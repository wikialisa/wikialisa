#!/usr/bin/env bash
# ─── cli/plugins/typecheck.sh ────────────────────────────────────────────────
COMMAND="typecheck"
ALIASES=("tc")
DESCRIPTION="turbo typecheck toàn bộ monorepo"

run() {
  step "Typecheck"
  _need_turbo || return 1
  "${BIN}/turbo" run typecheck --cache-dir=.turbo
  done_ "Typecheck passed"
}
