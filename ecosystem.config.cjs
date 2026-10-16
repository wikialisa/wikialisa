// PM2 Ecosystem — AXQ Tech Holding Monorepo
// Usage:
//   pm2 start ecosystem.config.cjs               # start tất cả
//   pm2 start ecosystem.config.cjs --only api-gateway
//   pm2 restart ecosystem.config.cjs             # restart tất cả
// Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/

const dir = "/root/workspace";
const log = "/root/workspace/.pm2/logs";

/** Helper for Next.js app processes */
const nextApp = (name, appDir, port) => ({
  name,
  cwd: `${dir}/apps/${appDir}`,
  script: "node_modules/.bin/next",
  args: `start -p ${port}`,
  interpreter: "none",
  instances: 1,
  exec_mode: "fork",
  autorestart: true,
  watch: false,
  max_memory_restart: "512M",
  env: {
    NODE_ENV: "production",
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
  },
  error_file: `${log}/${name}-err.log`,
  out_file: `${log}/${name}-out.log`,
  log_date_format: "YYYY-MM-DD HH:mm:ss Z",
});

/** Helper for Node.js service processes */
const svc = (name, svcDir, script, port, maxMem = "256M") => ({
  name,
  cwd: `${dir}/services/${svcDir}`,
  script,
  interpreter: "node",
  instances: 1,
  exec_mode: "fork",
  autorestart: true,
  watch: false,
  max_memory_restart: maxMem,
  env: {
    NODE_ENV: "production",
    PORT: String(port),
  },
  env_file: `${dir}/.env`,
  error_file: `${log}/${name}-err.log`,
  out_file: `${log}/${name}-out.log`,
  log_date_format: "YYYY-MM-DD HH:mm:ss Z",
});

module.exports = {
  apps: [
    // ┌──────────────────────────────────────────────────────────────────┐
    // │  BACKEND SERVICES                                                │
    // ├──────────────────────────────────────────────────────────────────┤
    svc("api-gateway", "api-gateway", "dist/index.js", 5000, "512M"),
    svc("ws-gateway", "api-gateway", "dist/websocket/index.js", 5001, "256M"),
    svc("deposit-worker", "api-gateway", "dist/workers/index.js", 5002, "256M"),
    svc("fiat-connector", "fiat-connector-api", "dist/index.js", 4001, "128M"),
    svc("swift-gateway", "swift-gateway", "dist/index.js", 4002, "128M"),
    svc("swift-chain-bridge", "swift-chain-bridge", "dist/index.js", 4003, "128M"),
    svc("indexer-subgraph", "indexer-subgraph", "dist/index.js", 4004, "128M"),
    svc("otc-liquidity", "otc-liquidity-engine", "dist/index.js", 4005, "256M"),
    svc("dune-alert-bots", "dune-alert-bots", "dist/index.js", 4006, "128M"),
    svc("mock-mgw", "mock-mgw", "dist/index.js", 4007, "128M"),
    // ├──────────────────────────────────────────────────────────────────┤
    // │  ROLE ENGINE — Global Leadership Automation Worker               │
    // ├──────────────────────────────────────────────────────────────────┤
    {
      name: "role-engine",
      cwd: `${dir}/services/role-engine`,
      script: "role-engine.js",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        LOG_LEVEL: "info",
        TRIGGER_INTERVAL_MS: "5000",
      },
      error_file: `${log}/role-engine-err.log`,
      out_file: `${log}/role-engine-out.log`,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      restart_delay: 3000,
    },
    // ├──────────────────────────────────────────────────────────────────┤
    // │  FRONTEND APPS                                                   │
    // ├──────────────────────────────────────────────────────────────────┤
    nextApp("app-web", "app-web", 3010), // app.axvn.vn
    nextApp("pay-portal", "pay-portal", 3002), // pay.axvn.vn
    nextApp("explorer", "explorer-vnkrscan", 3003), // scan.axvn.vn
    nextApp("swap-dex", "swap-dex", 3004), // swap.axvn.vn
    nextApp("dao-portal", "dao-portal", 3005), // dao.axvn.vn
    nextApp("holding-admin", "holding-admin-portal", 3006), // holding.axvn.vn
    nextApp("id-fiat", "id-fiat-gateway", 3001), // id.axvn.vn
    nextApp("kyc-portal", "kyc-portal", 3013), // kyc.axvn.vn
    nextApp("merchant", "merchant-portal", 3011), // merchant.axvn.vn
    nextApp("sandbox", "sandbox-dashboard", 3012), // sandbox.axvn.vn
    // ├──────────────────────────────────────────────────────────────────┤
    // │  NODE APPS (non-Next.js)                                         │
    // ├──────────────────────────────────────────────────────────────────┤
    {
      name: "digital-twin",
      cwd: `${dir}/apps/digital-twin-engine`,
      script: "dist/index.js",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: { NODE_ENV: "production", PORT: "3007" },
      env_file: `${dir}/.env`,
      error_file: `${log}/digital-twin-err.log`,
      out_file: `${log}/digital-twin-out.log`,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    // └──────────────────────────────────────────────────────────────────┘
  ],
};
