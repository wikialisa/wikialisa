const dir = "/root/workspace";
module.exports = {
  apps: [{
    name:        "api-gateway",
    script:      `${dir}/node_modules/.bin/ts-node-dev`,
    interpreter: "node",
    args:        "--respawn --transpile-only --exit-child src/index.ts",
    cwd:         `${dir}/services/api-gateway`,
    instances:   1,
    exec_mode:   "fork",
    autorestart: false,
    watch:       false,
    env_file:    `${dir}/.env`,
    env: { NODE_ENV: "development", PORT: "5000" },
    error_file:  `${dir}/.pm2/logs/api-gateway-err.log`,
    out_file:    `${dir}/.pm2/logs/api-gateway-out.log`,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    merge_logs:  true,
  }],
};
