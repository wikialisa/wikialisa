FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/core-sdk/package.json ./packages/core-sdk/
COPY packages/sdk-swift/package.json ./packages/sdk-swift/
COPY apps/digital-twin-engine/package.json ./apps/digital-twin-engine/

RUN pnpm install --frozen-lockfile --filter @wikialisa/digital-twin-engine...

COPY packages ./packages
COPY apps/digital-twin-engine ./apps/digital-twin-engine

RUN pnpm --filter @wikialisa/digital-twin-engine build

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/digital-twin-engine/dist ./dist
COPY --from=builder /app/packages ./packages

EXPOSE 3007
CMD ["node", "dist/index.js"]
