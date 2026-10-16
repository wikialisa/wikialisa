#!/usr/bin/env bash
# ─── cli/core/spinner.sh ──────────────────────────────────────────────────────
# spin()  — chạy lệnh ngầm và hiện Braille spinner.
# pbar()  — thanh tiến trình ASCII.
# ─────────────────────────────────────────────────────────────────────────────

# spin "label" cmd [args...]
spin() {
  local label="$1"; shift
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local i=0
  "$@" >/tmp/wikialisa_spin.log 2>&1 &
  local pid=$!
  tput civis 2>/dev/null || true
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r  ${C}%s${NC}  %s  " "${frames[$i]}" "$label"
    i=$(( (i+1) % ${#frames[@]} ))
    sleep 0.08
  done
  wait "$pid"
  local rc=$?
  tput cnorm 2>/dev/null || true
  if [ $rc -eq 0 ]; then
    printf "\r  ${G}✔${NC}  %-50s\n" "$label"
  else
    printf "\r  ${R}✖${NC}  %-50s\n" "$label"
    echo -e "${D}$(tail -6 /tmp/wikialisa_spin.log)${NC}"
    return $rc
  fi
}

# pbar value max "label"
pbar() {
  local val=$1 max=$2 label="$3"
  local width=30
  local filled=$(( val * width / max ))
  local empty=$(( width - filled ))
  local bar="${G}$(printf '█%.0s' $(seq 1 "$filled"))${D}$(printf '░%.0s' $(seq 1 "$empty"))${NC}"
  printf "  %s  ${W}%3d%%${NC}  %s\n" "$bar" $(( val * 100 / max )) "$label"
}

export -f spin pbar
