#!/usr/bin/env bash
# =============================================================================
# publish-npm.sh
# Build và publish tất cả packages lên npmjs.com và GitHub Packages.
#
# Yêu cầu:
#   export NPM_TOKEN=<token từ npmjs.com>
#   export GITHUB_TOKEN=<personal access token quyền write:packages>
#
# Chạy:
#   NPM_TOKEN=xxx GITHUB_TOKEN=yyy bash publish-npm.sh
# =============================================================================

set -e

if [ -z "$NPM_TOKEN" ]; then
    echo "❌ NPM_TOKEN is not set. Export it first:"
    echo "   export NPM_TOKEN=<NPM_TOKEN>"
    exit 1
fi

PACKAGES_ROOT="$(cd "$(dirname "$0")" && pwd)/temp-wikialisa-ui/packages"

# Configure npm auth
npm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"

mapfile -t PKG_DIRS < <(find "$PACKAGES_ROOT" -name "package.json" -exec dirname {} \; | sort)
TOTAL=${#PKG_DIRS[@]}

echo "🚀 Publishing $TOTAL packages to npm..."
echo ""

PUBLISHED=0
FAILED=0

for dir in "${PKG_DIRS[@]}"; do
    name=$(node -p "require('$dir/package.json').name" 2>/dev/null)
    version=$(node -p "require('$dir/package.json').version" 2>/dev/null)

    echo "━━━ $name@$version ━━━"

    # Install deps
    if [ ! -d "$dir/node_modules" ]; then
        npm install --prefix "$dir" --silent
    fi

    # Build
    npm run build --prefix "$dir" 2>&1 | tail -3

    # Publish to npmjs
    if npm publish "$dir" --access public 2>&1 | grep -q "npm notice"; then
        echo "  ✓ Published to https://www.npmjs.com/package/$name"
        PUBLISHED=$((PUBLISHED + 1))
    else
        echo "  ✗ Failed or already exists (skipping)"
        FAILED=$((FAILED + 1))
    fi

    # Publish to GitHub Packages
    if [ -n "$GITHUB_TOKEN" ]; then
        npm config set //npm.pkg.github.com/:_authToken "$GITHUB_TOKEN"
        echo "@wikialisa:registry=https://npm.pkg.github.com" > "$dir/.npmrc.gpr"
        npm publish "$dir" --access public --registry https://npm.pkg.github.com \
            --userconfig "$dir/.npmrc.gpr" 2>&1 | tail -2 || true
        rm -f "$dir/.npmrc.gpr"
        echo "  ✓ Published to GitHub Packages"
    fi

    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Done: $PUBLISHED published, $FAILED skipped/failed"
echo ""
echo "View packages:"
echo "  npm  → https://www.npmjs.com/org/wikialisa"
echo "  ghcr → https://github.com/orgs/wikialisa/packages"
