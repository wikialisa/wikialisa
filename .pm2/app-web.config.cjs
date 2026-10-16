// PM2 config — app-web :3010
// WSL1-safe: interpreter "node" vì .bin/next là shim JS, không phải binary native

const dir = "/root/workspace";

// Phát hiện WSL1 để chọn interpreter
const IS_WSL1 = (() => {
  try {
    const v = require("fs").readFileSync("/proc/version", "utf8");
    return /microsoft/i.test(v) && !/WSL2/i.test(require("os").release());
  } catch { return false; }
})();

module.exports = {
  apps: [{
    name:        "app-web",
    script:      `${dir}/node_modules/.bin/next`,
    interpreter: IS_WSL1 ? "node" : "none",
    args:        "dev -p 3010",
    cwd:         `${dir}/apps/app-web`,
    instances:   1,
    exec_mode:   "fork",
    autorestart: false,
    watch:       false,
    env: {
      NODE_ENV: "development",
      PORT:     "3010",
      HOSTNAME: "0.0.0.0",
    },
    env_file:        `${dir}/.env`,
    error_file:      `${dir}/.pm2/logs/app-web-err.log`,
    out_file:        `${dir}/.pm2/logs/app-web-out.log`,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    merge_logs:      true,
  }],
};
