// PM2 Ecosystem — DEV MODE (AXQ Tech Holding Monorepo)
//
// Usage:
//   pm2 start ecosystem.dev.cjs               # start tất cả (dev)
//   pm2 start ecosystem.dev.cjs --only api-gateway
//   pm2 logs                                   # xem log realtime
//   pm2 stop all                               # dừng tất cả
//   pm2 delete all                             # xoá khỏi danh sách
//
// Khác với ecosystem.config.cjs (production):
//   - services dùng ts-node-dev (hot-reload, không cần build)
//   - apps dùng next dev (HMR)
//   - log ra .pm2/logs/ trong workspace

const dir = "/root/workspace";
const log = `${dir}/.pm2/logs`;

// Local binaries (ts-node-dev, next)
// WSL1: .bin/ chứa Node.js shim scripts (không phải symlink) → interpreter phải là "node"
const BIN = `${dir}/node_modules/.bin`;
const IS_WSL1 = (() => {
  try {
    const fs = require("fs");
    const v = fs.readFileSync("/proc/version", "utf8");
    return /microsoft/i.test(v) && !/WSL2/i.test(require("os").release());
  } catch { return false; }
})();
const NEXT_INTERPRETER = IS_WSL1 ? "node" : "none";
const SVC_INTERPRETER  = IS_WSL1 ? "node" : "none";

// ─── Helper: Next.js app (next dev) ──────────────────────────────────────────
const nextDev = (name, appDir, port) => ({
  name,
  cwd:               `${dir}/apps/${appDir}`,
  script:            `${BIN}/next`,
  args:              `dev -p ${port}`,
  interpreter:       NEXT_INTERPRETER,
  instances:         1,
  exec_mode:         "fork",
  autorestart:       false,
  watch:             false,
  env: {
    NODE_ENV:          "development",
    PORT:              String(port),
    HOSTNAME:          "0.0.0.0",
    // WSL1: tắt webpack disk cache để tránh ENOENT rename lỗi
    NEXT_WEBPACK_USEPOLLING: IS_WSL1 ? "1" : "0",
  },
  env_file:        `${dir}/.env`,
  error_file:      `${log}/${name}-err.log`,
  out_file:        `${log}/${name}-out.log`,
  log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  merge_logs:      true,
});

// ─── Helper: Node/TypeScript service (ts-node-dev hot-reload) ────────────────
const svcDev = (name, svcDir, entryTs, port, maxMem = "256M", extraEnv = {}) => ({
  name,
  cwd:       `${dir}/services/${svcDir}`,
  script:    `${BIN}/ts-node-dev`,
  args:      `--respawn --transpile-only --exit-child ${entryTs}`,
  interpreter: SVC_INTERPRETER,
  instances:   1,
  exec_mode:   "fork",
  autorestart: false,
  watch:       false,            // ts-node-dev tự watch
  max_memory_restart: maxMem,
  env: {
    NODE_ENV: "development",
    PORT:     String(port),
    ...extraEnv,
  },
  env_file:        `${dir}/.env`,
  error_file:      `${log}/${name}-err.log`,
  out_file:        `${log}/${name}-out.log`,
  log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  merge_logs:      true,
});

// ─── Helper: plain Node.js service (JS, không cần ts-node-dev) ───────────────
const svcNode = (name, svcDir, script, port, extraEnv = {}) => ({
  name,
  cwd:         `${dir}/services/${svcDir}`,
  script,
  interpreter: "node",
  instances:   1,
  exec_mode:   "fork",
  autorestart: false,
  watch:       false,
  env: {
    NODE_ENV: "development",
    PORT:     String(port),
    ...extraEnv,
  },
  env_file:        `${dir}/.env`,
  error_file:      `${log}/${name}-err.log`,
  out_file:        `${log}/${name}-out.log`,
  log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  merge_logs:      true,
});

module.exports = {
  apps: [

    // ┌──────────────────────────────────────────────────────────────────────┐
    // │  BACKEND SERVICES (ts-node-dev hot-reload)                          │
    // ├──────────────────────────────────────────────────────────────────────┤

    svcDev("api-gateway",        "api-gateway",        "src/index.ts",             5000, "512M"),
    svcDev("ws-gateway",         "api-gateway",        "src/websocket/index.ts",   5001, "256M"),
    svcDev("deposit-worker",     "api-gateway",        "src/workers/index.ts",     5002, "256M"),
    svcDev("fiat-connector",     "fiat-connector-api", "src/index.ts",             4001, "128M"),
    svcDev("swift-gateway",      "swift-gateway",      "src/index.ts",             4002, "128M"),
    svcDev("swift-chain-bridge", "swift-chain-bridge", "src/index.ts",             4003, "128M"),
    svcDev("indexer-subgraph",   "indexer-subgraph",   "src/index.ts",             4004, "128M"),
    svcDev("otc-liquidity",      "otc-liquidity-engine","src/index.ts",            4005, "256M"),
    svcDev("dune-alert-bots",    "dune-alert-bots",    "src/index.ts",             4006, "128M"),
    svcDev("mock-mgw",           "mock-mgw",           "src/index.ts",             4007, "128M"),

    // ├──────────────────────────────────────────────────────────────────────┤
    // │  ROLE ENGINE (plain JS, dùng node --watch)                          │
    // ├──────────────────────────────────────────────────────────────────────┤
    svcNode("role-engine", "role-engine", "role-engine.js", 0, {
      LOG_LEVEL:           "debug",
      TRIGGER_INTERVAL_MS: "5000",
    }),

    // ├──────────────────────────────────────────────────────────────────────┤
    // │  FRONTEND APPS (next dev — HMR)                                     │
    // ├──────────────────────────────────────────────────────────────────────┤

    nextDev("app-web",       "app-web",               3010),  // app.axvn.vn
    nextDev("pay-portal",    "pay-portal",             3002),  // pay.axvn.vn
    nextDev("explorer",      "explorer-vnkrscan",      3003),  // scan.axvn.vn
    nextDev("swap-dex",      "swap-dex",               3004),  // swap.axvn.vn
    nextDev("dao-portal",    "dao-portal",             3005),  // dao.axvn.vn
    nextDev("holding-admin", "holding-admin-portal",   3006),  // holding.axvn.vn
    nextDev("id-fiat",       "id-fiat-gateway",        3001),  // id.axvn.vn
    nextDev("kyc-portal",    "kyc-portal",             3013),  // kyc.axvn.vn
    nextDev("merchant",      "merchant-portal",        3011),  // merchant.axvn.vn
    nextDev("sandbox",       "sandbox-dashboard",      3012),  // sandbox.axvn.vn

    // ├──────────────────────────────────────────────────────────────────────┤
    // │  NODE APPS (non-Next.js, ts-node-dev)                               │
    // ├──────────────────────────────────────────────────────────────────────┤
    {
      name:        "digital-twin",
      cwd:         `${dir}/apps/digital-twin-engine`,
      script:      `${BIN}/ts-node-dev`,
      args:        "--respawn --transpile-only src/index.ts",
      interpreter: "none",
      instances:   1,
      exec_mode:   "fork",
      autorestart: false,
      watch:       false,
      env: { NODE_ENV: "development", PORT: "3007" },
      env_file:        `${dir}/.env`,
      error_file:      `${log}/digital-twin-err.log`,
      out_file:        `${log}/digital-twin-out.log`,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs:      true,
    },

    // └──────────────────────────────────────────────────────────────────────┘
  ],
};
