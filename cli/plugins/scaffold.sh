#!/usr/bin/env bash
# ─── cli/plugins/scaffold.sh ─────────────────────────────────────────────────
COMMAND="scaffold"
ALIASES=()
DESCRIPTION="Tạo 11 Dockerfiles + cập nhật CI/infra files (9 hạng mục, idempotent)"

run() {
  echo ""
  echo -e "${BOLD}${C}  🚀  Wikialisa Scaffold — Chạy toàn bộ 9 hạng mục${NC}"
  sep

  _s1_dockerfiles
  _s2_compose_prod
  _s3_compose_dev
  _s4_build_images
  _s5_github_workflow
  _s6_next_config
  _s7_turbo_env
  _s8_lockfile
  _s9_fix_auth_import

  echo ""
  echo "🎉 scaffold hoàn tất. Tất cả 9 hạng mục đã được xử lý."
}

# ─────────────────────────────────────────────────────────────────────────────
# Section 1 — 11 Dockerfile
# ─────────────────────────────────────────────────────────────────────────────
_s1_dockerfiles() {
  echo ""; echo "# SECTION 1: 11 Dockerfile"
  mkdir -p "${ROOT}/deploy/docker"

  # ── helper: tạo Next.js standalone Dockerfile ─────────────────────────────
  _nextjs_df() {
    local name="$1" app_path="$2" port="$3"
    local out="${ROOT}/deploy/docker/Dockerfile.${name}"
    echo "🔧 Tạo Dockerfile.${name} ..."
    cat > "$out" << DOCKERFILE
# ─── Dockerfile.${name} ──────────────────────────────────────────────────────
# Next.js standalone — ${app_path} — Port ${port}
ARG NODE_VERSION=22
ARG PNPM_VERSION=9.15.9

FROM node:\${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat && \\
    corepack enable && \\
    corepack prepare pnpm@\${PNPM_VERSION} --activate

FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml turbo.json package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY ${app_path}/ ./${app_path}/
RUN pnpm install --frozen-lockfile
ARG NEXT_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo build --filter=$(basename "${app_path}")...

FROM node:\${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${port}
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/${app_path}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/${app_path}/.next/static      ./${app_path}/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/${app_path}/public            ./${app_path}/public
USER nextjs
EXPOSE ${port}
CMD ["node", "${app_path}/server.js"]
DOCKERFILE
    echo "✅ Dockerfile.${name} tạo xong"
  }

  _nextjs_df "app-web"              "apps/app-web"              3010
  _nextjs_df "id-fiat-gateway"      "apps/id-fiat-gateway"      3001
  _nextjs_df "pay-portal"           "apps/pay-portal"           3002
  _nextjs_df "explorer-vnkrscan"    "apps/explorer-vnkrscan"    3003
  _nextjs_df "swap-dex"             "apps/swap-dex"             3004
  _nextjs_df "dao-portal"           "apps/dao-portal"           3005
  _nextjs_df "holding-admin-portal" "apps/holding-admin-portal" 3006
  _nextjs_df "kyc-portal"           "apps/kyc-portal"           3013
  _nextjs_df "merchant-portal"      "apps/merchant-portal"      3011
  _nextjs_df "sandbox-dashboard"    "apps/sandbox-dashboard"    3012

  # ── digital-twin-engine (Plain Node) ─────────────────────────────────────
  echo "🔧 Tạo Dockerfile.digital-twin-engine ..."
  cat > "${ROOT}/deploy/docker/Dockerfile.digital-twin-engine" << 'EOF'
# ─── Dockerfile.digital-twin-engine ──────────────────────────────────────────
# Plain Node.js — apps/digital-twin-engine — Port 3007
ARG NODE_VERSION=22
ARG PNPM_VERSION=9.15.9

FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml turbo.json package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/digital-twin-engine/ ./apps/digital-twin-engine/
RUN pnpm install --frozen-lockfile
RUN pnpm turbo build --filter=digital-twin-engine...

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3007
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeapp
COPY --from=builder --chown=nodeapp:nodejs /app/apps/digital-twin-engine/dist         ./apps/digital-twin-engine/dist
COPY --from=builder --chown=nodeapp:nodejs /app/apps/digital-twin-engine/node_modules ./apps/digital-twin-engine/node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/apps/digital-twin-engine/package.json ./apps/digital-twin-engine/package.json
USER nodeapp
EXPOSE 3007
CMD ["node", "apps/digital-twin-engine/dist/index.js"]
EOF
  echo "✅ Dockerfile.digital-twin-engine tạo xong"
  echo "✅ Section 1 hoàn tất — 11 Dockerfile"
}

# ─────────────────────────────────────────────────────────────────────────────
# Section 2 — docker-compose.yml
# ─────────────────────────────────────────────────────────────────────────────
_s2_compose_prod() {
  echo ""; echo "# SECTION 2: docker-compose.yml"
  local COMPOSE="${ROOT}/deploy/docker/docker-compose.yml"
  if grep -q "wikialisa-app-web" "$COMPOSE" 2>/dev/null; then
    echo "⚠️  Frontend services đã có — bỏ qua"; return 0
  fi
  local TMP; TMP="$(mktemp)"
  sed '/^volumes:/,$d' "$COMPOSE" > "$TMP"
  cat >> "$TMP" << 'YAML'

  # ── Frontend Apps ──────────────────────────────────────────────────────────
  app-web:
    image: ghcr.io/axqtech/app-web:${TAG:-latest}
    container_name: wikialisa-app-web
    restart: unless-stopped
    ports: ["3010:3010"]
    env_file: [../../.env]
    depends_on: [api-gateway]
    networks: [wikialisa-net]

  id-fiat-gateway:
    image: ghcr.io/axqtech/id-fiat-gateway:${TAG:-latest}
    container_name: wikialisa-id-fiat-gateway
    restart: unless-stopped
    ports: ["3001:3001"]
    env_file: [../../.env]
    depends_on: [api-gateway]
    networks: [wikialisa-net]

  pay-portal:
    image: ghcr.io/axqtech/pay-portal:${TAG:-latest}
    container_name: wikialisa-pay-portal
    restart: unless-stopped
    ports: ["3002:3002"]
    env_file: [../../.env]
    depends_on: [api-gateway]
    networks: [wikialisa-net]

  explorer-vnkrscan:
    image: ghcr.io/axqtech/explorer-vnkrscan:${TAG:-latest}
    container_name: wikialisa-explorer-vnkrscan
    restart: unless-stopped
    ports: ["3003:3003"]
    env_file: [../../.env]
    depends_on: [api-gateway]
    networks: [wikialisa-net]

  swap-dex:
    image: ghcr.io/axqtech/swap-dex:${TAG:-latest}
    container_name: wikialisa-swap-dex
    restart: unless-stopped
    ports: ["3004:3004"]
    env_file: [../../.env]
    depends_on: [api-gateway]
    networks: [wikialisa-net]

  dao-portal:
    image: ghcr.io/axqtech/dao-portal:${TAG:-latest}
    container_name: wikialisa-dao-portal
    restart: unless-stopped
    ports: ["3005:3005"]
    env_file: [../../.env]
    depends_on: [api-gateway]
    networks: [wikialisa-net]

  holding-admin-portal:
    image: ghcr.io/axqtech/holding-admin-portal:${TAG:-latest}
    container_name: wikialisa-holding-admin-portal
    restart: unless-stopped
    ports: ["3006:3006"]
    env_file: [../../.env]
    depends_on: [api-gateway]
    networks: [wikialisa-net]

  digital-twin-engine:
    image: ghcr.io/axqtech/digital-twin-engine:${TAG:-latest}
    container_name: wikialisa-digital-twin-engine
    restart: unless-stopped
    ports: ["3007:3007"]
    env_file: [../../.env]
    depends_on: [mongodb]
    networks: [wikialisa-net]

  kyc-portal:
    image: ghcr.io/axqtech/kyc-portal:${TAG:-latest}
    container_name: wikialisa-kyc-portal
    restart: unless-stopped
    ports: ["3013:3013"]
    env_file: [../../.env]
    depends_on: [api-gateway]
    networks: [wikialisa-net]

  merchant-portal:
    image: ghcr.io/axqtech/merchant-portal:${TAG:-latest}
    container_name: wikialisa-merchant-portal
    restart: unless-stopped
    ports: ["3011:3011"]
    env_file: [../../.env]
    depends_on: [api-gateway]
    networks: [wikialisa-net]

  sandbox-dashboard:
    image: ghcr.io/axqtech/sandbox-dashboard:${TAG:-latest}
    container_name: wikialisa-sandbox-dashboard
    restart: unless-stopped
    ports: ["3012:3012"]
    env_file: [../../.env]
    depends_on: [api-gateway]
    networks: [wikialisa-net]

volumes:
  postgres-data:
  mongodb-data:
  stalwart-data:
  stalwart-etc:
  swift-mgw-db:
  swift-mgw-log:
  redis-data:

networks:
  wikialisa-net:
    name: wikialisa-network
  default:
    name: vnkr-network
YAML
  cp "$TMP" "$COMPOSE"; rm -f "$TMP"
  echo "✅ docker-compose.yml cập nhật xong"
}

# ─────────────────────────────────────────────────────────────────────────────
# Section 3 — docker-compose.dev.yml
# ─────────────────────────────────────────────────────────────────────────────
_s3_compose_dev() {
  echo ""; echo "# SECTION 3: docker-compose.dev.yml"
  local DEV="${ROOT}/deploy/docker/docker-compose.dev.yml"
  if grep -q "pnpm --filter app-web dev" "$DEV" 2>/dev/null; then
    echo "⚠️  Frontend dev overrides đã có — bỏ qua"; return 0
  fi
  cat >> "$DEV" << 'YAML'

  # ── Frontend dev overrides ─────────────────────────────────────────────────
  app-web:
    environment: {NODE_ENV: development}
    volumes: [../../apps/app-web:/app/apps/app-web]
    command: pnpm --filter app-web dev

  id-fiat-gateway:
    environment: {NODE_ENV: development}
    volumes: [../../apps/id-fiat-gateway:/app/apps/id-fiat-gateway]
    command: pnpm --filter id-fiat-gateway dev

  pay-portal:
    environment: {NODE_ENV: development}
    volumes: [../../apps/pay-portal:/app/apps/pay-portal]
    command: pnpm --filter pay-portal dev

  explorer-vnkrscan:
    environment: {NODE_ENV: development}
    volumes: [../../apps/explorer-vnkrscan:/app/apps/explorer-vnkrscan]
    command: pnpm --filter explorer-vnkrscan dev

  swap-dex:
    environment: {NODE_ENV: development}
    volumes: [../../apps/swap-dex:/app/apps/swap-dex]
    command: pnpm --filter swap-dex dev

  dao-portal:
    environment: {NODE_ENV: development}
    volumes: [../../apps/dao-portal:/app/apps/dao-portal]
    command: pnpm --filter dao-portal dev

  holding-admin-portal:
    environment: {NODE_ENV: development}
    volumes: [../../apps/holding-admin-portal:/app/apps/holding-admin-portal]
    command: pnpm --filter holding-admin-portal dev

  digital-twin-engine:
    environment: {NODE_ENV: development}
    volumes: [../../apps/digital-twin-engine:/app/apps/digital-twin-engine]
    command: pnpm --filter digital-twin-engine dev

  kyc-portal:
    environment: {NODE_ENV: development}
    volumes: [../../apps/kyc-portal:/app/apps/kyc-portal]
    command: pnpm --filter kyc-portal dev

  merchant-portal:
    environment: {NODE_ENV: development}
    volumes: [../../apps/merchant-portal:/app/apps/merchant-portal]
    command: pnpm --filter merchant-portal dev

  sandbox-dashboard:
    environment: {NODE_ENV: development}
    volumes: [../../apps/sandbox-dashboard:/app/apps/sandbox-dashboard]
    command: pnpm --filter sandbox-dashboard dev
YAML
  echo "✅ docker-compose.dev.yml cập nhật xong"
}

# ─────────────────────────────────────────────────────────────────────────────
# Section 4 — build-images.sh
# ─────────────────────────────────────────────────────────────────────────────
_s4_build_images() {
  echo ""; echo "# SECTION 4: build-images.sh"
  local BSH="${ROOT}/deploy/docker/build-images.sh"
  if grep -q '"app-web"' "$BSH" 2>/dev/null; then
    echo "⚠️  Frontend entries đã có — bỏ qua"; return 0
  fi
  sed -i '/\[role-engine\]="deploy\/docker\/Dockerfile\.role-engine"/a\
  [app-web]="deploy/docker/Dockerfile.app-web"\
  [id-fiat-gateway]="deploy/docker/Dockerfile.id-fiat-gateway"\
  [pay-portal]="deploy/docker/Dockerfile.pay-portal"\
  [explorer-vnkrscan]="deploy/docker/Dockerfile.explorer-vnkrscan"\
  [swap-dex]="deploy/docker/Dockerfile.swap-dex"\
  [dao-portal]="deploy/docker/Dockerfile.dao-portal"\
  [holding-admin-portal]="deploy/docker/Dockerfile.holding-admin-portal"\
  [digital-twin-engine]="deploy/docker/Dockerfile.digital-twin-engine"\
  [kyc-portal]="deploy/docker/Dockerfile.kyc-portal"\
  [merchant-portal]="deploy/docker/Dockerfile.merchant-portal"\
  [sandbox-dashboard]="deploy/docker/Dockerfile.sandbox-dashboard"' "$BSH"
  echo "✅ build-images.sh cập nhật xong"
}

# ─────────────────────────────────────────────────────────────────────────────
# Section 5 — publish-docker.yml
# ─────────────────────────────────────────────────────────────────────────────
_s5_github_workflow() {
  echo ""; echo "# SECTION 5: publish-docker.yml"
  local WF="${ROOT}/.github/workflows/publish-docker.yml"
  if grep -q "app-web" "$WF" 2>/dev/null; then
    echo "⚠️  Frontend matrix entries đã có — bỏ qua"; return 0
  fi
  sed -i '/dockerfile: deploy\/docker\/Dockerfile\.dune-alert-bots/a\
\
          - service: app-web\
            dockerfile: deploy/docker/Dockerfile.app-web\
            image: ghcr.io/axqtech/app-web\
            target: runner\
          - service: id-fiat-gateway\
            dockerfile: deploy/docker/Dockerfile.id-fiat-gateway\
            image: ghcr.io/axqtech/id-fiat-gateway\
            target: runner\
          - service: pay-portal\
            dockerfile: deploy/docker/Dockerfile.pay-portal\
            image: ghcr.io/axqtech/pay-portal\
            target: runner\
          - service: explorer-vnkrscan\
            dockerfile: deploy/docker/Dockerfile.explorer-vnkrscan\
            image: ghcr.io/axqtech/explorer-vnkrscan\
            target: runner\
          - service: swap-dex\
            dockerfile: deploy/docker/Dockerfile.swap-dex\
            image: ghcr.io/axqtech/swap-dex\
            target: runner\
          - service: dao-portal\
            dockerfile: deploy/docker/Dockerfile.dao-portal\
            image: ghcr.io/axqtech/dao-portal\
            target: runner\
          - service: holding-admin-portal\
            dockerfile: deploy/docker/Dockerfile.holding-admin-portal\
            image: ghcr.io/axqtech/holding-admin-portal\
            target: runner\
          - service: digital-twin-engine\
            dockerfile: deploy/docker/Dockerfile.digital-twin-engine\
            image: ghcr.io/axqtech/digital-twin-engine\
            target: runner\
          - service: kyc-portal\
            dockerfile: deploy/docker/Dockerfile.kyc-portal\
            image: ghcr.io/axqtech/kyc-portal\
            target: runner\
          - service: merchant-portal\
            dockerfile: deploy/docker/Dockerfile.merchant-portal\
            image: ghcr.io/axqtech/merchant-portal\
            target: runner\
          - service: sandbox-dashboard\
            dockerfile: deploy/docker/Dockerfile.sandbox-dashboard\
            image: ghcr.io/axqtech/sandbox-dashboard\
            target: runner' "$WF"
  echo "✅ publish-docker.yml cập nhật xong"
}

# ─────────────────────────────────────────────────────────────────────────────
# Section 6 — next.config.* output: standalone
# ─────────────────────────────────────────────────────────────────────────────
_s6_next_config() {
  echo ""; echo "# SECTION 6: next.config.* output: standalone"
  local APPS=(app-web id-fiat-gateway pay-portal explorer-vnkrscan swap-dex
              dao-portal holding-admin-portal kyc-portal merchant-portal sandbox-dashboard)
  for app in "${APPS[@]}"; do
    local dir="${ROOT}/apps/${app}"
    [ -d "$dir" ] || { echo "⚠️  apps/${app} không tồn tại"; continue; }
    if grep -rq "output.*standalone" "$dir" 2>/dev/null; then
      echo "✅ apps/${app}: đã có output: 'standalone'"; continue
    fi
    local cfg=""
    for f in next.config.ts next.config.mjs next.config.js; do
      [ -f "${dir}/${f}" ] && cfg="${dir}/${f}" && break
    done
    if [ -z "$cfg" ]; then
      printf 'import type { NextConfig } from "next";\nconst nextConfig: NextConfig = { output: "standalone" };\nexport default nextConfig;\n' \
        > "${dir}/next.config.ts"
      echo "✅ apps/${app}/next.config.ts tạo mới"
    else
      if grep -q "const nextConfig" "$cfg"; then
        sed -i "s/\(const nextConfig[^=]*=\s*{\)/\1\n  output: \"standalone\",/" "$cfg"
      elif grep -q "module.exports" "$cfg"; then
        sed -i "s/module\.exports\s*=\s*{/module.exports = {\n  output: 'standalone',/" "$cfg"
      else
        sed -i "0,/{/{s/{/{\n  output: 'standalone',/}" "$cfg"
      fi
      echo "🔧 apps/${app}: patched output: 'standalone'"
    fi
  done
  echo "✅ Section 6 hoàn tất"
}

# ─────────────────────────────────────────────────────────────────────────────
# Section 7 — turbo.json globalEnv += AUTH_MODE
# ─────────────────────────────────────────────────────────────────────────────
_s7_turbo_env() {
  echo ""; echo "# SECTION 7: turbo.json AUTH_MODE"
  local TJ="${ROOT}/turbo.json"
  if grep -q '"AUTH_MODE"' "$TJ"; then
    echo "✅ AUTH_MODE đã có — bỏ qua"; return 0
  fi
  if command -v jq &>/dev/null; then
    local TMP; TMP="$(mktemp)"
    jq '.globalEnv += ["AUTH_MODE"]' "$TJ" > "$TMP" && cp "$TMP" "$TJ"
    rm -f "$TMP"
    echo "✅ AUTH_MODE thêm vào globalEnv (jq)"
  else
    sed -i 's/"LOG_LEVEL"/"AUTH_MODE",\n    "LOG_LEVEL"/' "$TJ"
    echo "✅ AUTH_MODE thêm vào globalEnv (sed)"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Section 8 — pnpm-lock.yaml regenerate nếu thiếu mongo-db
# ─────────────────────────────────────────────────────────────────────────────
_s8_lockfile() {
  echo ""; echo "# SECTION 8: pnpm-lock.yaml"
  if grep -q "@wikialisa/mongo-db" "${ROOT}/pnpm-lock.yaml" 2>/dev/null; then
    echo "✅ @wikialisa/mongo-db đã có — bỏ qua regenerate"; return 0
  fi
  echo "📦 Regenerating pnpm lockfile..."
  pnpm install --no-frozen-lockfile
  echo "✅ pnpm-lock.yaml tái tạo xong"
}

# ─────────────────────────────────────────────────────────────────────────────
# Section 9 — xóa import thừa deletePostOtpStep
# ─────────────────────────────────────────────────────────────────────────────
_s9_fix_auth_import() {
  echo ""; echo "# SECTION 9: xóa deletePostOtpStep import"
  local AR="${ROOT}/services/api-gateway/src/routes/auth.route.ts"
  [ -f "$AR" ] || { echo "⚠️  auth.route.ts không tìm thấy"; return 0; }
  if ! grep -q "deletePostOtpStep" "$AR"; then
    echo "✅ deletePostOtpStep không có — bỏ qua"; return 0
  fi
  sed -i 's/import { \(.*\), deletePostOtpStep\(.*\) } from/import { \1\2 } from/g' "$AR"
  sed -i '/^\s*deletePostOtpStep,\s*$/d' "$AR"
  sed -i '/^\s*deletePostOtpStep\s*$/d'  "$AR"
  sed -i 's/,\s*deletePostOtpStep\s*,/,/g' "$AR"
  sed -i 's/,\s*deletePostOtpStep\s*$//'  "$AR"
  sed -i 's/deletePostOtpStep\s*,\s*//g'  "$AR"
  if grep -q "deletePostOtpStep" "$AR"; then
    echo "⚠️  Vẫn còn tham chiếu — kiểm tra thủ công:"; grep -n "deletePostOtpStep" "$AR"
  else
    echo "✅ deletePostOtpStep đã xóa hoàn toàn"
  fi
}
