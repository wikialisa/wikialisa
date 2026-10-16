#!/usr/bin/env bash
# ─── cli/plugins/api.sh ──────────────────────────────────────────────────────
# Khởi động / dừng / kiểm tra api-gateway trực tiếp (không qua PM2).
# Hữu ích trên WSL1 khi pnpm install chưa hoàn thành nhưng dist/ đã có.
COMMAND="api"
ALIASES=("gw" "gateway")
DESCRIPTION="Start/stop/status api-gateway tại localhost:5000"

run() {
  local sub="${1:-start}"

  case "$sub" in
    # ── start ───────────────────────────────────────────────────────────────
    start)
      step "API Gateway — start"

      # Kiểm tra dist đã build chưa
      local dist="${ROOT}/services/api-gateway/dist/index.js"
      if [ ! -f "$dist" ]; then
        warn "dist/index.js chưa có — chạy build trước"
        info "Thử: ${Y}./wikialisa.sh build-pkg api-gateway${NC}"
        return 1
      fi

      # Tắt process cũ nếu có
      local old_pid
      old_pid=$(lsof -ti:5000 2>/dev/null || true)
      if [ -n "$old_pid" ]; then
        info "Dừng process cũ (PID ${old_pid}) trên port 5000..."
        kill "$old_pid" 2>/dev/null || true
        sleep 1
      fi

      # Parse .env an toàn (không eval, không source trực tiếp)
      info "Load .env..."
      local env_json="/tmp/wikialisa_gw_env.json"
      node -e "
        const fs = require('fs');
        const raw = fs.readFileSync('${ROOT}/.env', 'utf8');
        const env = {};
        for (const line of raw.split('\n')) {
          const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
          if (!m) continue;
          let v = m[2].trim();
          if (/^'.*'\$/.test(v)) v = v.slice(1,-1);
          if (/^\".*\"\$/.test(v)) v = v.slice(1,-1);
          env[m[1]] = v;
        }
        fs.writeFileSync('${env_json}', JSON.stringify(env));
      " 2>/dev/null || { warn ".env parse failed — dùng env hiện tại"; }

      # Tạo loader script
      local loader="/tmp/wikialisa_gw_start.js"
      cat > "$loader" << JSEOF
const fs = require('fs');
try {
  const env = JSON.parse(fs.readFileSync('${env_json}', 'utf8'));
  Object.assign(process.env, env);
} catch(e) { /* dùng env hiện tại */ }
require('${dist}');
JSEOF

      # Start ngầm
      node "$loader" > /tmp/wikialisa_api_gateway.log 2>&1 &
      local pid=$!
      echo "$pid" > /tmp/wikialisa_api_gateway.pid
      info "PID: ${pid} — đợi server khởi động..."

      # Chờ tối đa 10s
      local elapsed=0
      while (( elapsed < 10 )); do
        sleep 1; elapsed=$(( elapsed + 1 ))
        if curl -sf --max-time 1 http://localhost:5000/health >/dev/null 2>&1; then
          break
        fi
      done

      # Kết quả
      if curl -sf --max-time 2 http://localhost:5000/health >/dev/null 2>&1; then
        done_ "API Gateway running — http://localhost:5000"
        info "Health: $(curl -s http://localhost:5000/health)"
        info "Logs:   ${Y}tail -f /tmp/wikialisa_api_gateway.log${NC}"
        info "Stop:   ${Y}./wikialisa.sh api stop${NC}"
      else
        fail "API Gateway không phản hồi sau 10s"
        info "Log:"
        tail -15 /tmp/wikialisa_api_gateway.log
        return 1
      fi
      ;;

    # ── stop ────────────────────────────────────────────────────────────────
    stop)
      step "API Gateway — stop"
      local pid
      pid=$(lsof -ti:5000 2>/dev/null || cat /tmp/wikialisa_api_gateway.pid 2>/dev/null || true)
      if [ -n "$pid" ]; then
        kill "$pid" 2>/dev/null && done_ "API Gateway stopped (PID ${pid})" || warn "Kill failed"
        rm -f /tmp/wikialisa_api_gateway.pid
      else
        warn "Không có process nào đang chạy trên port 5000"
      fi
      ;;

    # ── status / health ─────────────────────────────────────────────────────
    status|health)
      step "API Gateway — status"
      local pid
      pid=$(lsof -ti:5000 2>/dev/null || true)
      if [ -n "$pid" ]; then
        ok "Process: PID ${pid} đang chạy trên port 5000"
        local health; health=$(curl -s --max-time 3 http://localhost:5000/health 2>/dev/null)
        if [ -n "$health" ]; then
          ok "Health: ${health}"
        else
          warn "Process có nhưng health endpoint không phản hồi"
        fi
      else
        warn "Không có process nào trên port 5000"
      fi
      ;;

    # ── logs ─────────────────────────────────────────────────────────────────
    logs)
      tail -f /tmp/wikialisa_api_gateway.log 2>/dev/null || warn "Log file chưa có"
      ;;

    # ── restart ──────────────────────────────────────────────────────────────
    restart)
      run stop
      sleep 1
      run start
      ;;

    *)
      fail "Subcommand không hợp lệ: ${sub}"
      info "Dùng: api [start|stop|status|logs|restart]"
      return 1
      ;;
  esac
}
