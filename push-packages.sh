#!/usr/bin/env bash
# =============================================================================
# push-packages.sh
# Init git repo cho từng package, tạo GitHub repo (nếu chưa có), rồi push.
#
# Yêu cầu:
#   - GitHub CLI (gh) đã login: gh auth login
#   - NPM_TOKEN đã set trong GitHub org secrets (https://github.com/organizations/wikialisa/settings/secrets)
#
# Chạy:
#   chmod +x push-packages.sh
#   GITHUB_ORG=wikialisa bash push-packages.sh
# =============================================================================

set -e

GITHUB_ORG="${GITHUB_ORG:-wikialisa}"
PACKAGES_ROOT="$(cd "$(dirname "$0")" && pwd)/temp-wikialisa-ui/packages"

echo "📦 WikiAlisa Packages Publisher"
echo "   Org : $GITHUB_ORG"
echo "   Root: $PACKAGES_ROOT"
echo ""

# Collect all package dirs (those containing package.json)
mapfile -t PKG_DIRS < <(find "$PACKAGES_ROOT" -name "package.json" -exec dirname {} \; | sort)

TOTAL=${#PKG_DIRS[@]}
echo "Found $TOTAL packages to publish."
echo ""

for dir in "${PKG_DIRS[@]}"; do
    name=$(node -p "require('$dir/package.json').name" 2>/dev/null)
    bare=$(echo "$name" | cut -d/ -f2)   # e.g. "button"
    repo="$GITHUB_ORG/$bare"

    echo "━━━ [$bare] $name ━━━"

    # ── 1. Init git if not already ──────────────────────────────────────
    if [ ! -d "$dir/.git" ]; then
        git -C "$dir" init -b main
        git -C "$dir" config user.name  "WikiAlisa Bot"
        git -C "$dir" config user.email "bot@axvn.vn"
        echo "  ✓ git init"
    fi

    # ── 2. Create GitHub repo (idempotent) ──────────────────────────────
    if gh repo view "$repo" &>/dev/null; then
        echo "  ✓ repo already exists: https://github.com/$repo"
    else
        gh repo create "$repo" \
            --org "$GITHUB_ORG" \
            --public \
            --description "$(node -p "require('$dir/package.json').description" 2>/dev/null)" \
            --homepage "https://axvn.vn" \
            --source "$dir" \
            --remote origin
        echo "  ✓ repo created: https://github.com/$repo"
    fi

    # ── 3. Ensure remote origin is set ──────────────────────────────────
    if git -C "$dir" remote get-url origin &>/dev/null; then
        git -C "$dir" remote set-url origin "https://github.com/$repo.git"
    else
        git -C "$dir" remote add origin "https://github.com/$repo.git"
    fi
    echo "  ✓ remote: https://github.com/$repo.git"

    # ── 4. Stage + commit + push ────────────────────────────────────────
    git -C "$dir" add -A
    if git -C "$dir" diff --cached --quiet; then
        echo "  - nothing to commit, skipping push"
    else
        git -C "$dir" commit -m "chore: initial package scaffold v$(node -p "require('$dir/package.json').version")"
        git -C "$dir" push -u origin main --force
        echo "  ✓ pushed to main"
    fi

    echo ""
done

echo "✅ All $TOTAL packages processed."
echo ""
echo "Next steps:"
echo "  1. Go to https://github.com/orgs/$GITHUB_ORG/settings/secrets"
echo "     Add secret: NPM_TOKEN = <your npmjs.com access token>"
echo "  2. To trigger publish, create a tag in any package:"
echo "     cd temp-wikialisa-ui/packages/components/button"
echo "     git tag v1.0.0 && git push origin v1.0.0"
echo "  3. GitHub Actions will automatically build + publish to npm + GitHub Packages."
