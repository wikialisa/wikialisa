#!/usr/bin/env bash
# ─── cli/plugins/test.sh ─────────────────────────────────────────────────────
COMMAND="test"
ALIASES=()
DESCRIPTION="turbo test toàn bộ monorepo"

run() {
  step "Test"
  _need_turbo || return 1
  "${BIN}/turbo" run test --cache-dir=.turbo
  done_ "Tests passed"
}
