FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/swift-core/package.json ./packages/swift-core/
COPY services/swift-chain-bridge/package.json ./services/swift-chain-bridge/

RUN pnpm install --frozen-lockfile --filter @wikialisa/swift-chain-bridge...

COPY packages/types ./packages/types
COPY packages/config ./packages/config
COPY packages/swift-core ./packages/swift-core
COPY services/swift-chain-bridge ./services/swift-chain-bridge

RUN pnpm --filter @wikialisa/swift-chain-bridge build

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/swift-chain-bridge/dist ./dist
COPY --from=builder /app/packages ./packages

EXPOSE 4003
CMD ["node", "dist/index.js"]
