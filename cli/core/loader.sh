#!/usr/bin/env bash
# ─── cli/core/loader.sh ──────────────────────────────────────────────────────
# Plugin loader: discover, register, dispatch, menu tự generate.
#
# Mỗi plugin trong cli/plugins/*.sh phải khai báo:
#   COMMAND="tên-lệnh"         (bắt buộc, unique)
#   ALIASES=("a" "b")          (tuỳ chọn)
#   DESCRIPTION="mô tả ngắn"  (bắt buộc)
#   run() { ... }              (bắt buộc)
#
# Sau khi source, loader export ba mảng:
#   _PLUGIN_COMMANDS[]   — tên command chính
#   _PLUGIN_DESCS[]      — mô tả tương ứng
#   _PLUGIN_FILES[]      — đường dẫn file plugin
# ─────────────────────────────────────────────────────────────────────────────

PLUGIN_DIR="${ROOT}/cli/plugins"

# Mảng registry (parallel arrays — bash 3 compat)
_PLUGIN_COMMANDS=()
_PLUGIN_DESCS=()
_PLUGIN_FILES=()
_PLUGIN_ALIASES=()   # "cmd1:alias1,alias2" format

# ── Discover & register tất cả plugin ────────────────────────────────────────
loader_discover() {
  local f cmd desc aliases
  for f in "${PLUGIN_DIR}"/*.sh; do
    [ -f "$f" ] || continue

    # Đọc metadata — grep nhanh, không source toàn bộ
    cmd=$(     grep -m1 '^COMMAND='     "$f" | cut -d= -f2- | tr -d '"'"'" )
    desc=$(    grep -m1 '^DESCRIPTION=' "$f" | cut -d= -f2- | tr -d '"')
    # ALIASES line ví dụ: ALIASES=("d" "dev:all")
    aliases=$( grep -m1 '^ALIASES='     "$f" | sed 's/ALIASES=//;s/[()"]//g;s/'"'"'//g' | xargs)

    [ -z "$cmd" ] && continue   # bỏ qua file không có COMMAND

    _PLUGIN_COMMANDS+=("$cmd")
    _PLUGIN_DESCS+=("${desc:-No description}")
    _PLUGIN_FILES+=("$f")
    _PLUGIN_ALIASES+=("${cmd}:${aliases}")
  done
}

# ── Tìm file plugin theo command (kể cả alias) ───────────────────────────────
loader_find() {
  local target="$1"
  local i
  for (( i=0; i<${#_PLUGIN_COMMANDS[@]}; i++ )); do
    # Match command chính
    if [ "${_PLUGIN_COMMANDS[$i]}" = "$target" ]; then
      echo "${_PLUGIN_FILES[$i]}"
      return 0
    fi
    # Match alias
    local aliases_raw="${_PLUGIN_ALIASES[$i]}"
    local aliases_part="${aliases_raw#*:}"
    for alias_item in $aliases_part; do
      if [ "$alias_item" = "$target" ]; then
        echo "${_PLUGIN_FILES[$i]}"
        return 0
      fi
    done
  done
  return 1
}

# ── Dispatch: source plugin + gọi run() ──────────────────────────────────────
loader_dispatch() {
  local cmd="$1"; shift
  local plugin_file
  plugin_file=$(loader_find "$cmd") || {
    fail "Unknown command: ${W}${cmd}${NC}"
    info "Run ${Y}./wikialisa.sh help${NC} để xem danh sách lệnh"
    return 1
  }
  # Source plugin vào shell hiện tại (kế thừa ROOT, BIN, helpers...)
  # shellcheck disable=SC1090
  source "$plugin_file"
  run "$@"
}

# ── Menu tự generate ─────────────────────────────────────────────────────────
loader_menu() {
  banner
  check_env
  nl

  echo -e "  ${BOLD}${W}Chọn lệnh${NC}  ${D}(nhập số hoặc tên)${NC}"
  nl

  local i
  for (( i=0; i<${#_PLUGIN_COMMANDS[@]}; i++ )); do
    local num=$(( i + 1 ))
    local cmd="${_PLUGIN_COMMANDS[$i]}"
    local desc="${_PLUGIN_DESCS[$i]}"
    printf "  ${C}%2d${NC}  %-22s ${D}%s${NC}\n" "$num" "$cmd" "$desc"
  done

  echo -e "  ${D} q  quit${NC}"
  nl
  sep
  printf "  ${BOLD}${C}›${NC} "
  read -r choice

  # Số → command
  if [[ "$choice" =~ ^[0-9]+$ ]]; then
    local idx=$(( choice - 1 ))
    if (( idx >= 0 && idx < ${#_PLUGIN_COMMANDS[@]} )); then
      nl
      loader_dispatch "${_PLUGIN_COMMANDS[$idx]}" "$@"
    else
      warn "Lựa chọn không hợp lệ: ${choice}"; sleep 1; loader_menu
      return
    fi
  else
    case "$choice" in
      q|quit|exit) nl; echo -e "  ${D}bye.${NC}"; nl; exit 0 ;;
      "")          loader_menu; return ;;
      *)
        nl
        loader_dispatch "$choice" "$@" 2>/dev/null || {
          warn "Unknown: ${choice}"; sleep 1; loader_menu; return
        }
        ;;
    esac
  fi

  nl; sep
  printf "  ${D}Enter để quay lại menu, q để thoát...${NC} "
  read -r again
  [ "$again" = "q" ] && exit 0 || loader_menu
}

# ── Help tự generate ─────────────────────────────────────────────────────────
loader_help() {
  nl
  echo -e "  ${BOLD}wikialisa.sh${NC} — AXQ Tech Holding Monorepo CLI"
  nl
  echo -e "  ${C}Usage:${NC}  ./wikialisa.sh <command> [args]"
  nl
  echo -e "  ${C}Commands:${NC}"
  local i
  for (( i=0; i<${#_PLUGIN_COMMANDS[@]}; i++ )); do
    printf "    %-22s %s\n" "${_PLUGIN_COMMANDS[$i]}" "${_PLUGIN_DESCS[$i]}"
  done
  nl
  echo -e "  ${D}Plugin dir: ${PLUGIN_DIR}${NC}"
  nl
}

export -f loader_discover loader_find loader_dispatch loader_menu loader_help
