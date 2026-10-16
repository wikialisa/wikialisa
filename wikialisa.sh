#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║   W I K I A L I S A  —  Monorepo CLI  ·  AXQ Tech Holding JSC  ·  axvn.vn ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
#  Entry point — load core + discover plugins — không chứa logic trực tiếp.
#  Thêm lệnh mới: tạo cli/plugins/<name>.sh với COMMAND / DESCRIPTION / run()
#
#  Usage nhanh:
#    ./wikialisa.sh                  # interactive menu
#    ./wikialisa.sh help             # danh sách lệnh
#    ./wikialisa.sh install          # pnpm install + WSL1 shims
#    ./wikialisa.sh build            # turbo build toàn bộ
#    ./wikialisa.sh build-pkg        # build packages nội bộ (WSL1-safe, không cần turbo)
#    ./wikialisa.sh build-pkg types config db api-gateway
#    ./wikialisa.sh dev              # PM2 dev — tất cả apps + services
#    ./wikialisa.sh dev:apps         # PM2 dev — chỉ apps
#    ./wikialisa.sh dev:services     # PM2 dev — chỉ services
#    ./wikialisa.sh api              # start api-gateway (dist mode, port 5000)
#    ./wikialisa.sh api stop/status/logs/restart
#    ./wikialisa.sh build-start      # build frontend+backend → PM2 start (alias: bs, prod)
#    ./wikialisa.sh build-start frontend  # chỉ build frontend → start
#    ./wikialisa.sh build-start backend   # chỉ build backend → start
#    ./wikialisa.sh build-start start-only # skip build, chỉ PM2 start
#    ./wikialisa.sh start            # PM2 production (không build)
#    ./wikialisa.sh stop             # PM2 stop all
#    ./wikialisa.sh restart          # PM2 reload --update-env
#    ./wikialisa.sh status           # pm2 ls + metrics
#    ./wikialisa.sh logs [name]      # pm2 logs
#    ./wikialisa.sh lint             # turbo lint
#    ./wikialisa.sh typecheck | tc   # turbo typecheck
#    ./wikialisa.sh test             # turbo test
#    ./wikialisa.sh clean            # xoá dist/ .next/ .turbo/
#    ./wikialisa.sh scaffold         # tạo 11 Dockerfiles + cập nhật CI/infra
#    ./wikialisa.sh setup            # full pipeline: detect→env→clean→install→build→dev
#    ./wikialisa.sh fix [--auto]     # chẩn đoán + khắc phục sự cố

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_DIR="${ROOT}/cli"
export ROOT CLI_DIR

# ── Load core modules ─────────────────────────────────────────────────────────
# shellcheck source=cli/core/colors.sh
source "${CLI_DIR}/core/colors.sh"
# shellcheck source=cli/core/spinner.sh
source "${CLI_DIR}/core/spinner.sh"
# shellcheck source=cli/core/runtime.sh
source "${CLI_DIR}/core/runtime.sh"
# shellcheck source=cli/core/loader.sh
source "${CLI_DIR}/core/loader.sh"

# ── Discover tất cả plugins ───────────────────────────────────────────────────
loader_discover

# ── Dispatch ─────────────────────────────────────────────────────────────────
CMD="${1:-}"

if [ -z "$CMD" ]; then
  loader_menu
  exit 0
fi

banner

case "$CMD" in
  help|--help|-h)
    loader_help ;;

  # ── dev subcommands ────────────────────────────────────────────────────────
  dev:apps)
    loader_dispatch dev apps ;;
  dev:services)
    loader_dispatch dev services ;;

  # ── setup / fix — delegate sang script riêng ──────────────────────────────
  setup)
    exec "${ROOT}/setup.sh" "${@:2}" ;;
  fix)
    exec "${ROOT}/fix.sh" "${@:2}" ;;

  # ── Tất cả lệnh còn lại → plugin loader (kể cả aliases) ──────────────────
  *)
    loader_dispatch "$CMD" "${@:2}" ;;
esac
