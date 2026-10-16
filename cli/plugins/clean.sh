#!/usr/bin/env bash
# ─── cli/plugins/clean.sh ────────────────────────────────────────────────────
COMMAND="clean"
ALIASES=()
DESCRIPTION="Xoá dist/ .next/ .turbo/ tsconfig.tsbuildinfo"

run() {
  step "Clean build artifacts"
  spin "Removing dist/  .next/  .turbo/" \
    bash -c "
      find '${ROOT}' -maxdepth 4 \( -name 'dist' -o -name '.next' \) \
        -not -path '*/node_modules/*' -type d -exec rm -rf {} + 2>/dev/null || true
      find '${ROOT}' -maxdepth 4 -name '.turbo' \
        -not -path '*/node_modules/*' -type d -exec rm -rf {} + 2>/dev/null || true
      find '${ROOT}' -maxdepth 4 -name 'tsconfig.tsbuildinfo' \
        -not -path '*/node_modules/*' -exec rm -f {} + 2>/dev/null || true
      true
    "
  done_ "Clean complete"
}
