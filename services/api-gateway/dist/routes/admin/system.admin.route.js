"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemAdminRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const response_js_1 = require("../../lib/response.js");
const audit_js_1 = require("../../lib/audit.js");
exports.systemAdminRouter = (0, express_1.Router)();
exports.systemAdminRouter.use(auth_middleware_js_1.authenticate, auth_middleware_js_1.requireAdmin);
// ─── GET /api/v1/admin/system/metrics ────────────────────────────────────────
exports.systemAdminRouter.get("/metrics", (_req, res) => {
    // TODO: aggregate from DB/Redis
    (0, response_js_1.ok)(res, {
        dailyVolume: "2500000000",
        dailyTransactions: 4820,
        totalUsers: 125000,
        activeUsers24h: 8400,
        pendingKYC: 124,
        pendingWithdrawals: 18,
        revenue24h: "12500000",
        serverUptime: "99.98%",
        redisLatencyMs: 1.2,
        dbConnectionsActive: 8,
    });
});
// ─── PUT /api/v1/admin/system/exchange-rates ─────────────────────────────────
exports.systemAdminRouter.put("/exchange-rates", async (req, res) => {
    const rates = req.body;
    // TODO: validate and persist rates to Redis/DB
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "UPDATE_EXCHANGE_RATES", resource: "system/rates", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: rates });
    (0, response_js_1.ok)(res, { updatedRates: rates, updatedAt: new Date().toISOString() }, "Tỷ giá đã được cập nhật");
});
// ─── PUT /api/v1/admin/system/maintenance ────────────────────────────────────
exports.systemAdminRouter.put("/maintenance", async (req, res) => {
    const { enabled, message } = req.body;
    if (typeof enabled !== "boolean") {
        (0, response_js_1.fail)(res, "enabled (boolean) bắt buộc", 400, "VALIDATION_ERROR");
        return;
    }
    // TODO: set maintenance flag in Redis
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: enabled ? "MAINTENANCE_ON" : "MAINTENANCE_OFF", resource: "system/maintenance", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString() });
    (0, response_js_1.ok)(res, { maintenance: enabled, message, updatedAt: new Date().toISOString() }, "Maintenance mode đã được cập nhật");
});
// ─── GET /api/v1/admin/system/feature-flags ──────────────────────────────────
exports.systemAdminRouter.get("/feature-flags", (_req, res) => {
    // TODO: fetch from Redis
    (0, response_js_1.ok)(res, { swap: true, staking: true, botTrading: true, referral: true, learn: true, p2p: true, swift: true });
});
// ─── PUT /api/v1/admin/system/feature-flags ──────────────────────────────────
exports.systemAdminRouter.put("/feature-flags", async (req, res) => {
    const flags = req.body;
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "UPDATE_FEATURE_FLAGS", resource: "system/features", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: flags });
    (0, response_js_1.ok)(res, flags, "Feature flags đã được cập nhật");
});
