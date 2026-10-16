#!/usr/bin/env bash
# ─── cli/plugins/build.sh ────────────────────────────────────────────────────
COMMAND="build"
ALIASES=()
DESCRIPTION="turbo build toàn bộ monorepo (packages → apps → services)"

run() {
  step "Build monorepo"
  _need_turbo || return 1

  local tasks=(
    "@wikialisa/types"
    "@wikialisa/config"
    "@wikialisa/db  @wikialisa/web3-config  @wikialisa/ui-kit"
    "@wikialisa/core-sdk  @wikialisa/swift-core  @wikialisa/contracts"
    "@wikialisa/sdk-swift  @wikialisa/swift-gateway  @wikialisa/merchant-sdk"
    "apps/*  services/*"
  )

  echo ""
  local i=1
  for task in "${tasks[@]}"; do
    pbar "$i" "${#tasks[@]}" "Building  ${D}${task}${NC}"
    i=$(( i + 1 ))
  done
  echo ""

  spin "turbo build" "${BIN}/turbo" run build --cache-dir=.turbo
  done_ "Build complete"
}
