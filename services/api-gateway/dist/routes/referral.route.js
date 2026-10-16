"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const response_js_1 = require("../lib/response.js");
const audit_js_1 = require("../lib/audit.js");
exports.referralRouter = (0, express_1.Router)();
// All referral routes require authentication
exports.referralRouter.use(auth_middleware_js_1.authenticate);
// ─── GET /api/v1/referral/info ────────────────────────────────────────────────
exports.referralRouter.get("/info", (req, res) => {
    const userId = req.user.sub;
    // TODO: fetch from DB
    (0, response_js_1.ok)(res, {
        referralCode: userId.slice(0, 8).toUpperCase(),
        referralLink: `https://app.axvn.vn/register?ref=${userId.slice(0, 8).toUpperCase()}`,
        tier: "SILVER",
        totalReferrals: 12,
        totalEarned: "2450000",
    });
});
// ─── GET /api/v1/referral/tree ────────────────────────────────────────────────
exports.referralRouter.get("/tree", (req, res) => {
    // TODO: recursive query for up to 3 levels
    (0, response_js_1.ok)(res, {
        f1: [
            { userId: "u001", name: "Trần Thị B", level: 1, joinedAt: "2024-03-01T00:00:00Z", volume: "5000000", commission: "50000" },
            { userId: "u002", name: "Lê Minh C", level: 1, joinedAt: "2024-04-15T00:00:00Z", volume: "2000000", commission: "20000" },
        ],
        f2: [],
        f3: [],
        totalTree: 2,
    });
});
// ─── GET /api/v1/referral/commissions ────────────────────────────────────────
exports.referralRouter.get("/commissions", (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    // TODO: fetch from DB
    (0, response_js_1.paginated)(res, [], 0, page, limit);
});
// ─── POST /api/v1/referral/claim ─────────────────────────────────────────────
exports.referralRouter.post("/claim", async (req, res) => {
    const body = req.body;
    // TODO: check claimable balance, transfer to main wallet
    const claimId = `CLM-${Date.now()}`;
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "CLAIM_COMMISSION", resource: "referral", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: { claimId, amount: body.amount ?? "all" } });
    (0, response_js_1.created)(res, { claimId, status: "PROCESSED", transferredAt: new Date().toISOString() }, "Hoa hồng đã được chuyển về ví chính");
});
