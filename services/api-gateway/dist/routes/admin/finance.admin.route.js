"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeAdminRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const response_js_1 = require("../../lib/response.js");
const audit_js_1 = require("../../lib/audit.js");
exports.financeAdminRouter = (0, express_1.Router)();
exports.financeAdminRouter.use(auth_middleware_js_1.authenticate, auth_middleware_js_1.requireAdmin);
// ─── GET /api/v1/admin/finance/withdrawals ────────────────────────────────────
exports.financeAdminRouter.get("/withdrawals", (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    // TODO: fetch high-value pending withdrawals from DB (above auto-approve threshold)
    (0, response_js_1.paginated)(res, [
        { withdrawId: "WC-001", userId: "u001", userName: "Nguyễn Văn A", asset: "BTC", amount: "1.5", network: "ERC20", createdAt: "2024-06-27T10:00:00Z", riskScore: 15 },
        { withdrawId: "WF-002", userId: "u003", userName: "Lê Minh C", asset: "VND", amount: "200000000", bankCode: "VCB", createdAt: "2024-06-27T11:30:00Z", riskScore: 55 },
    ], 2, page, limit);
});
// ─── POST /api/v1/admin/finance/withdrawals/approve ───────────────────────────
exports.financeAdminRouter.post("/withdrawals/approve", async (req, res) => {
    const body = req.body;
    if (!body.withdrawId || !body.action || !["APPROVE", "REJECT"].includes(body.action)) {
        (0, response_js_1.fail)(res, "withdrawId và action (APPROVE|REJECT) bắt buộc", 400, "VALIDATION_ERROR");
        return;
    }
    // TODO: update withdrawal status, trigger on-chain tx if APPROVE, notify user
    await (0, audit_js_1.auditLog)({
        userId: req.user.sub,
        action: `ADMIN_WITHDRAWAL_${body.action}`,
        resource: `finance/withdrawals/${body.withdrawId}`,
        ...(0, audit_js_1.buildAuditContext)(req),
        timestamp: new Date().toISOString(),
        changes: { withdrawId: body.withdrawId, action: body.action, reason: body.reason },
    });
    (0, response_js_1.ok)(res, {
        withdrawId: body.withdrawId,
        status: body.action === "APPROVE" ? "PROCESSING" : "REJECTED",
        processedAt: new Date().toISOString(),
    }, `Lệnh rút đã được ${body.action === "APPROVE" ? "phê duyệt" : "từ chối"}`);
});
