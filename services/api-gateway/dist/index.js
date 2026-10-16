"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * API Gateway — Main Entry Point
 * Express server wiring all route domains.
 *
 * Ports:
 *   HTTP API  — PORT=5000   (env: PORT)
 *   WebSocket — PORT=5001   (env: WEBSOCKET_PORT)
 *
 * Versioning:
 *   /api/v1  — stable, current default  (env: API_PREFIX)
 *   /api/v2  — new features, cursor pagination
 *   /api/v1/rpc — JSON-RPC 2.0 blockchain node proxy
 */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const multer_1 = __importDefault(require("multer"));
// ── Route modules — v1 ────────────────────────────────────────────────────────
const auth_route_js_1 = require("./routes/auth.route.js");
const user_route_js_1 = require("./routes/user.route.js");
const exchange_route_js_1 = require("./routes/exchange.route.js");
const finance_route_js_1 = require("./routes/finance.route.js");
const ext_route_js_1 = require("./routes/ext.route.js");
const public_route_js_1 = require("./routes/public.route.js");
const learn_route_js_1 = require("./routes/learn.route.js");
const referral_route_js_1 = require("./routes/referral.route.js");
const webhooks_route_js_1 = require("./routes/webhooks.route.js");
const compliance_route_js_1 = require("./routes/compliance.route.js");
const rpc_route_js_1 = require("./routes/rpc.route.js");
const wallet_route_js_1 = require("./routes/wallet.route.js");
const p2p_route_js_1 = require("./routes/p2p.route.js");
const swift_route_js_1 = require("./routes/swift.route.js");
// ── Admin route modules ───────────────────────────────────────────────────────
const auth_admin_route_js_1 = require("./routes/admin/auth.admin.route.js");
const users_admin_route_js_1 = require("./routes/admin/users.admin.route.js");
const kyc_admin_route_js_1 = require("./routes/admin/kyc.admin.route.js");
const finance_admin_route_js_1 = require("./routes/admin/finance.admin.route.js");
const cms_admin_route_js_1 = require("./routes/admin/cms.admin.route.js");
const compliance_admin_route_js_1 = require("./routes/admin/compliance.admin.route.js");
const system_admin_route_js_1 = require("./routes/admin/system.admin.route.js");
// ── v2 router ─────────────────────────────────────────────────────────────────
const v2_route_js_1 = require("./routes/v2.route.js");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
const V1 = process.env.API_PREFIX ?? "/api/v1";
const V2 = "/api/v2";
// ── Global Middleware ─────────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.APP_URL ?? "http://localhost:3010",
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Rate limiting — global 200 req/min per IP
app.use((0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 200,
    message: { success: false, message: "Too many requests. Please try again later.", data: null },
    standardHeaders: true,
    legacyHeaders: false,
}));
// Stricter rate limit for auth endpoints (20 req / 15 min)
const authLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
// Stricter rate limit for RPC endpoint (60 req / min)
const rpcLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
// Multer for media upload (memory storage — upload to cloud from there)
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "api-gateway", ts: new Date().toISOString() });
});
// ── API Discovery ─────────────────────────────────────────────────────────────
app.get("/api", (_req, res) => {
    res.json({
        service: "vnkr-api-gateway",
        versions: [
            { version: "v1", prefix: V1, status: "stable", docsUrl: "https://docs.axvn.vn/api/v1" },
            { version: "v2", prefix: V2, status: "preview", docsUrl: "https://docs.axvn.vn/api/v2" },
        ],
        rpc: { url: `${V1}/rpc`, protocol: "JSON-RPC 2.0", description: "Blockchain node proxy" },
        ws: { url: `ws://api.axvn.vn:5001`, protocol: "WebSocket", description: "Real-time data streams" },
    });
});
// ── API v1 Routes ─────────────────────────────────────────────────────────────
app.use(`${V1}/auth`, authLimiter, auth_route_js_1.authRouter);
app.use(`${V1}/user`, user_route_js_1.userRouter);
app.use(`${V1}/exchange`, exchange_route_js_1.exchangeRouter);
app.use(`${V1}/finance`, finance_route_js_1.financeRouter);
app.use(`${V1}/ext`, ext_route_js_1.extRouter);
app.use(`${V1}/public`, public_route_js_1.publicRouter);
app.use(`${V1}/blogs`, public_route_js_1.publicRouter); // /blogs shares publicRouter handlers
app.use(`${V1}/content`, public_route_js_1.publicRouter); // /content/announcements
app.use(`${V1}/upload`, upload.single("file"), public_route_js_1.publicRouter);
app.use(`${V1}/learn`, learn_route_js_1.learnRouter);
app.use(`${V1}/referral`, referral_route_js_1.referralRouter);
app.use(`${V1}/webhooks`, webhooks_route_js_1.webhookRouter);
app.use(`${V1}/compliance`, compliance_route_js_1.complianceRouter);
app.use(`${V1}/wallet`, wallet_route_js_1.walletRouter);
app.use(`${V1}/p2p`, p2p_route_js_1.p2pRouter);
app.use(`${V1}/swift`, swift_route_js_1.swiftRouter);
// ── JSON-RPC 2.0 endpoint (blockchain node proxy) ─────────────────────────────
app.use(`${V1}/rpc`, rpcLimiter, rpc_route_js_1.rpcRouter);
app.use(`${V2}/rpc`, rpcLimiter, rpc_route_js_1.rpcRouter); // same handler, different prefix
// ── Admin API Routes ──────────────────────────────────────────────────────────
app.use(`${V1}/admin/auth`, authLimiter, auth_admin_route_js_1.authAdminRouter);
app.use(`${V1}/admin/users`, users_admin_route_js_1.usersAdminRouter);
app.use(`${V1}/admin/kyc`, kyc_admin_route_js_1.kycAdminRouter);
app.use(`${V1}/admin/finance`, finance_admin_route_js_1.financeAdminRouter);
app.use(`${V1}/admin/cms`, cms_admin_route_js_1.cmsAdminRouter);
app.use(`${V1}/admin/compliance`, compliance_admin_route_js_1.complianceAdminRouter);
app.use(`${V1}/admin/system`, system_admin_route_js_1.systemAdminRouter);
// ── API v2 Routes ─────────────────────────────────────────────────────────────
app.use(V2, v2_route_js_1.v2Router);
// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found", data: null, errorCode: "NOT_FOUND" });
});
// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error("[api-gateway] Unhandled error:", err.message, err.stack);
    res.status(500).json({ success: false, message: "Internal server error", data: null, errorCode: "INTERNAL_ERROR" });
});
// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[api-gateway] Listening on port ${PORT} (v1: ${V1}  v2: ${V2})`);
});
exports.default = app;
