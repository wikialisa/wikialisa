#!/usr/bin/env bash
# ─── build-images.sh — Wikialisa Monorepo Docker Image Builder ────────────────
# Build và (tùy chọn) push Docker images độc lập cho từng service.
#
# Usage:
#   ./deploy/docker/build-images.sh [OPTIONS] [SERVICE...]
#
# Options:
#   -p, --push          Push images lên registry sau khi build
#   -r, --registry URL  Registry prefix  (default: ghcr.io/axq-tech/wikialisa)
#   -t, --tag TAG       Image tag         (default: git short SHA)
#   --target STAGE      Build stage: builder | dev | runner  (default: runner)
#   --no-cache          Disable Docker layer cache
#   -h, --help          Show this help
#
# Examples:
#   # Build tất cả services với tag 'latest'
#   ./deploy/docker/build-images.sh --tag latest
#
#   # Build chỉ swift-gateway + swift-chain-bridge, push lên GHCR
#   ./deploy/docker/build-images.sh --push swift-gateway swift-chain-bridge
#
#   # Build image dev stage để test local
#   ./deploy/docker/build-images.sh --target dev --tag dev-local api-gateway
#
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

REGISTRY="${REGISTRY:-ghcr.io/axq-tech/wikialisa}"
TAG="${TAG:-$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo "local")}"
TARGET="${TARGET:-runner}"
PUSH=false
NO_CACHE=""
SELECTED_SERVICES=()

# ── All known services + their Dockerfiles ────────────────────────────────────
declare -A DOCKERFILES=(
  [api-gateway]="deploy/docker/Dockerfile.api-gateway"
  [fiat-connector-api]="deploy/docker/Dockerfile.fiat-connector-api"
  [otc-liquidity-engine]="deploy/docker/Dockerfile.otc-liquidity-engine"
  [indexer-subgraph]="deploy/docker/Dockerfile.indexer-subgraph"
  [swift-gateway]="deploy/docker/Dockerfile.swift-gateway"
  [swift-chain-bridge]="deploy/docker/Dockerfile.swift-chain-bridge"
  [dune-alert-bots]="deploy/docker/Dockerfile.dune-alert-bots"
  [role-engine]="deploy/docker/Dockerfile.role-engine"
  [app-web]="deploy/docker/Dockerfile.app-web"
  [id-fiat-gateway]="deploy/docker/Dockerfile.id-fiat-gateway"
  [pay-portal]="deploy/docker/Dockerfile.pay-portal"
  [explorer-vnkrscan]="deploy/docker/Dockerfile.explorer-vnkrscan"
  [swap-dex]="deploy/docker/Dockerfile.swap-dex"
  [dao-portal]="deploy/docker/Dockerfile.dao-portal"
  [holding-admin-portal]="deploy/docker/Dockerfile.holding-admin-portal"
  [digital-twin-engine]="deploy/docker/Dockerfile.digital-twin-engine"
  [kyc-portal]="deploy/docker/Dockerfile.kyc-portal"
  [merchant-portal]="deploy/docker/Dockerfile.merchant-portal"
  [sandbox-dashboard]="deploy/docker/Dockerfile.sandbox-dashboard"
)

# ── Parse args ────────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--push)        PUSH=true; shift ;;
    -r|--registry)    REGISTRY="$2"; shift 2 ;;
    -t|--tag)         TAG="$2"; shift 2 ;;
    --target)         TARGET="$2"; shift 2 ;;
    --no-cache)       NO_CACHE="--no-cache"; shift ;;
    -h|--help)
      head -30 "$0" | grep "^#" | sed 's/^# \?//'
      exit 0 ;;
    -*)
      echo "❌ Unknown option: $1" >&2; exit 1 ;;
    *)
      SELECTED_SERVICES+=("$1"); shift ;;
  esac
done

# If no services specified, build all
if [[ ${#SELECTED_SERVICES[@]} -eq 0 ]]; then
  SELECTED_SERVICES=("${!DOCKERFILES[@]}")
fi

# ── Validate ──────────────────────────────────────────────────────────────────
for svc in "${SELECTED_SERVICES[@]}"; do
  if [[ -z "${DOCKERFILES[$svc]+_}" ]]; then
    echo "❌ Unknown service: '$svc'" >&2
    echo "   Known services: ${!DOCKERFILES[*]}" >&2
    exit 1
  fi
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  Wikialisa Monorepo — Docker Image Builder                       ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo "  Registry : $REGISTRY"
echo "  Tag      : $TAG"
echo "  Target   : $TARGET"
echo "  Push     : $PUSH"
echo "  Services : ${SELECTED_SERVICES[*]}"
echo ""

# ── Build loop ────────────────────────────────────────────────────────────────
FAILED=()
BUILT=()

for svc in "${SELECTED_SERVICES[@]}"; do
  dockerfile="${DOCKERFILES[$svc]}"
  image="${REGISTRY}-${svc}:${TAG}"
  image_latest="${REGISTRY}-${svc}:latest"

  echo "┌─────────────────────────────────────────────────────────────────"
  echo "│  Building: $svc"
  echo "│  Image:    $image"
  echo "│  File:     $dockerfile"
  echo "└─────────────────────────────────────────────────────────────────"

  if docker build \
      --file "$REPO_ROOT/$dockerfile" \
      --target "$TARGET" \
      --tag "$image" \
      --tag "$image_latest" \
      --build-arg NODE_ENV=production \
      --label "org.opencontainers.image.revision=$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo 'unknown')" \
      --label "org.opencontainers.image.created=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      --label "org.opencontainers.image.source=https://github.com/axq-tech/wikialisa" \
      $NO_CACHE \
      "$REPO_ROOT"; then

    BUILT+=("$svc")
    echo "✅ Built: $image"

    if [[ "$PUSH" == true ]]; then
      echo "📤 Pushing $image ..."
      docker push "$image"
      docker push "$image_latest"
      echo "✅ Pushed: $image"
    fi
  else
    FAILED+=("$svc")
    echo "❌ FAILED: $svc"
  fi

  echo ""
done

# ── Report ────────────────────────────────────────────────────────────────────
echo "══════════════════════════════════════════════════════════════════════"
echo "  Build Summary"
echo "══════════════════════════════════════════════════════════════════════"

if [[ ${#BUILT[@]} -gt 0 ]]; then
  echo "  ✅ Built (${#BUILT[@]}): ${BUILT[*]}"
fi

if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo "  ❌ Failed (${#FAILED[@]}): ${FAILED[*]}"
  exit 1
fi

echo ""
echo "  All images built successfully."
[[ "$PUSH" == true ]] && echo "  All images pushed to: $REGISTRY"
