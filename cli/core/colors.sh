#!/usr/bin/env bash
# ─── cli/core/colors.sh ───────────────────────────────────────────────────────
# Màu sắc ANSI, icon helpers, banner Wikialisa.
# Source file này — không chạy trực tiếp.
# ─────────────────────────────────────────────────────────────────────────────

export TERM="${TERM:-xterm-256color}"

# ── Màu ───────────────────────────────────────────────────────────────────────
R='\033[0;31m'    # red
G='\033[0;32m'    # green
Y='\033[1;33m'    # yellow
B='\033[0;34m'    # blue
C='\033[0;36m'    # cyan
M='\033[0;35m'    # magenta
W='\033[1;37m'    # white bold
D='\033[2m'       # dim
NC='\033[0m'      # reset
BOLD='\033[1m'

export R G Y B C M W D NC BOLD

# ── Helpers ───────────────────────────────────────────────────────────────────
nl()    { echo ""; }
sep()   { echo -e "${D}────────────────────────────────────────────────────────${NC}"; }
ok()    { echo -e "  ${G}✔${NC}  $*"; }
fail()  { echo -e "  ${R}✖${NC}  $*" >&2; }
info()  { echo -e "  ${C}→${NC}  $*"; }
warn()  { echo -e "  ${Y}⚠${NC}  $*"; }
step()  { echo -e "\n${BOLD}${C}  ▶  $*${NC}"; }
done_() { echo -e "  ${G}${BOLD}✔  $*${NC}"; }

export -f nl sep ok fail info warn step done_

# ── Banner ────────────────────────────────────────────────────────────────────
banner() {
  printf '\033[H\033[2J\033[3J' 2>/dev/null || true
  echo -e "${C}"
  echo '  ██╗    ██╗██╗██╗  ██╗██╗ █████╗ ██╗     ██╗███████╗ █████╗ '
  echo '  ██║    ██║██║██║ ██╔╝██║██╔══██╗██║     ██║██╔════╝██╔══██╗'
  echo '  ██║ █╗ ██║██║█████╔╝ ██║███████║██║     ██║███████╗███████║'
  echo '  ██║███╗██║██║██╔═██╗ ██║██╔══██║██║     ██║╚════██║██╔══██║'
  echo '  ╚███╔███╔╝██║██║  ██╗██║██║  ██║███████╗██║███████║██║  ██║'
  echo '   ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚═╝  ╚═╝'
  echo -e "${NC}"
  echo -e "  ${D}AXQ Tech Holding JSC  ·  pnpm ${PNPM_VERSION:-9.15.9}  ·  Turborepo  ·  PM2  ·  axvn.vn${NC}"
  sep
}
export -f banner
