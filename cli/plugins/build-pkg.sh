#!/usr/bin/env bash
# ─── cli/plugins/build-pkg.sh ────────────────────────────────────────────────
# Build một hoặc nhiều internal packages theo đúng dependency order.
# Dùng khi pnpm install bị timeout trên WSL1 nhưng dist/ cần được tạo.
#
# Usage:
#   ./wikialisa.sh build-pkg              # build tất cả packages theo thứ tự
#   ./wikialisa.sh build-pkg types        # build chỉ @wikialisa/types
#   ./wikialisa.sh build-pkg types config db api-gateway
COMMAND="build-pkg"
ALIASES=("pkg")
DESCRIPTION="Build nội bộ packages/services theo dependency order (WSL1-safe)"

# ── Dependency order (phải build trước → sau) ─────────────────────────────────
# Key = package short name, Value = tsup/tsc command
declare -A _PKG_BUILD_CMD=(
  [types]="tsup src/index.ts --format cjs,esm --dts --clean"
  [config]="tsup src/index.ts src/server.ts --format cjs,esm --dts --clean"
  [db]="tsup src/index.ts --format cjs,esm --dts --clean"
  [mongo-db]="tsup src/index.ts --format cjs,esm --dts --clean"
  [core-sdk]="tsup src/index.ts --format cjs,esm --dts --clean"
  [web3-config]="tsup src/index.ts --format cjs,esm --dts --clean"
  [merchant-sdk]="tsup src/index.ts --format cjs,esm --dts --clean"
  [swift-core]="tsup --config tsup.config.ts"
  [sdk-swift]="tsup src/index.ts --format cjs,esm --dts --clean"
  [contracts]="tsup src/index.ts --format cjs,esm --dts --clean"
  [ui-kit]="vite build && tsc --emitDeclarationOnly --declaration --outDir dist"
  [swift-gateway-pkg]="tsup --config tsup.config.ts"
)

# Thứ tự build đúng (dependency graph)
_PKG_ORDER=(
  "types:packages/types"
  "config:packages/config"
  "db:packages/db"
  "mongo-db:packages/mongo-db"
  "core-sdk:packages/core-sdk"
  "web3-config:packages/web3-config"
  "merchant-sdk:packages/merchant-sdk"
  "swift-core:packages/swift-core"
  "sdk-swift:packages/sdk-swift"
  "contracts:packages/contracts"
  "swift-gateway-pkg:packages/swift-gateway"
)

# Services build sau packages
_SVC_ORDER=(
  "api-gateway:services/api-gateway:tsc --outDir dist"
  "fiat-connector-api:services/fiat-connector-api:tsc --outDir dist"
  "indexer-subgraph:services/indexer-subgraph:tsc --outDir dist"
  "swift-chain-bridge:services/swift-chain-bridge:tsc --outDir dist"
  "svc-swift-gateway:services/swift-gateway:tsc --outDir dist"
  "dune-alert-bots:services/dune-alert-bots:tsc --outDir dist"
)

run() {
  local targets=("$@")
  local BIN_LOCAL="${ROOT}/node_modules/.bin"
  local built=0 failed=0 skipped=0

  step "Build internal packages"

  # ── Build tất cả nếu không có arg ─────────────────────────────────────────
  if [ ${#targets[@]} -eq 0 ]; then
    info "Build toàn bộ packages theo dependency order..."
    for entry in "${_PKG_ORDER[@]}"; do
      local name="${entry%%:*}"
      local path="${entry##*:}"
      _build_one "$name" "${ROOT}/${path}" "${_PKG_BUILD_CMD[$name]:-}" \
        && built=$(( built+1 )) || failed=$(( failed+1 ))
    done
    info "Build services..."
    for entry in "${_SVC_ORDER[@]}"; do
      IFS=: read -r name path cmd <<< "$entry"
      _build_one "$name" "${ROOT}/${path}" "$cmd" \
        && built=$(( built+1 )) || failed=$(( failed+1 ))
    done
  else
    # ── Build từng target được chỉ định ─────────────────────────────────────
    for target in "${targets[@]}"; do
      local found=false

      # Tìm trong packages
      for entry in "${_PKG_ORDER[@]}"; do
        local name="${entry%%:*}"
        local path="${entry##*:}"
        if [ "$name" = "$target" ] || [ "$(basename "$path")" = "$target" ]; then
          _build_one "$name" "${ROOT}/${path}" "${_PKG_BUILD_CMD[$name]:-}" \
            && built=$(( built+1 )) || failed=$(( failed+1 ))
          found=true; break
        fi
      done

      # Tìm trong services
      if ! $found; then
        for entry in "${_SVC_ORDER[@]}"; do
          IFS=: read -r name path cmd <<< "$entry"
          if [ "$name" = "$target" ] || [ "$(basename "$path")" = "$target" ]; then
            _build_one "$name" "${ROOT}/${path}" "$cmd" \
              && built=$(( built+1 )) || failed=$(( failed+1 ))
            found=true; break
          fi
        done
      fi

      $found || { warn "Package không tìm thấy: ${target}"; skipped=$(( skipped+1 )); }
    done
  fi

  # ── Summary ───────────────────────────────────────────────────────────────
  echo ""
  ok "Built:   ${built}"
  [ $failed  -gt 0 ] && fail "Failed:  ${failed}"  || true
  [ $skipped -gt 0 ] && warn "Skipped: ${skipped}" || true

  [ $failed -eq 0 ] && done_ "build-pkg hoàn thành" || return 1
}

# ── Helper: build một package ──────────────────────────────────────────────────
_build_one() {
  local name="$1" dir="$2" cmd="$3"
  local BIN_LOCAL="${ROOT}/node_modules/.bin"

  [ -d "$dir" ] || { warn "Directory không tồn tại: ${dir}"; return 1; }

  # Nếu không có cmd → lấy từ package.json scripts.build
  if [ -z "$cmd" ]; then
    cmd=$(node -e "
      try {
        const p = require('${dir}/package.json');
        process.stdout.write(p.scripts && p.scripts.build ? p.scripts.build : '');
      } catch(e) { process.stdout.write(''); }
    " 2>/dev/null)
  fi

  [ -z "$cmd" ] && { warn "${name}: không có build command"; return 1; }

  info "Building ${W}${name}${NC}..."

  # Thay thế bin references thành absolute path
  local abs_cmd="${cmd}"
  abs_cmd="${abs_cmd//tsup/${BIN_LOCAL}/tsup}"
  abs_cmd="${abs_cmd//tsc/${BIN_LOCAL}/tsc}"
  abs_cmd="${abs_cmd//vite/${BIN_LOCAL}/vite}"

  # Chạy trong thư mục của package
  if ( cd "$dir" && eval "$abs_cmd" > /tmp/wikialisa_build_${name}.log 2>&1 ); then
    ok "${name} → ${dir}/dist/"
    return 0
  else
    fail "${name} build FAILED"
    tail -8 "/tmp/wikialisa_build_${name}.log" | while IFS= read -r l; do
      echo -e "    ${D}${l}${NC}"
    done
    return 1
  fi
}
