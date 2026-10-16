"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complianceAdminRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const response_js_1 = require("../../lib/response.js");
const audit_js_1 = require("../../lib/audit.js");
exports.complianceAdminRouter = (0, express_1.Router)();
exports.complianceAdminRouter.use(auth_middleware_js_1.authenticate);
// ─── POST /api/v1/admin/compliance/nq05/report ───────────────────────────────
exports.complianceAdminRouter.post("/nq05/report", auth_middleware_js_1.requireCompliance, async (req, res) => {
    const body = req.body;
    const reportId = `RPT-NQ05-${Date.now()}`;
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "ADMIN_GENERATE_NQ05_REPORT", resource: "compliance/nq05", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: body });
    (0, response_js_1.created)(res, {
        reportId,
        period: `${body.startDate} — ${body.endDate}`,
        totalTransactions: 0,
        totalVolume: "0",
        fileUrl: `https://reports.axvn.vn/nq05/${reportId}.${(body.format ?? "JSON").toLowerCase()}`,
        generatedAt: new Date().toISOString(),
    }, "Báo cáo NQ-05 đã được xuất");
});
// ─── GET /api/v1/admin/compliance/nd284/audit-log ────────────────────────────
exports.complianceAdminRouter.get("/nd284/audit-log", auth_middleware_js_1.requireAdmin, (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    // TODO: query compliance.audit_log
    (0, response_js_1.paginated)(res, [], 0, page, limit);
});
// ─── GET /api/v1/admin/compliance/aml/flagged ────────────────────────────────
exports.complianceAdminRouter.get("/aml/flagged", auth_middleware_js_1.requireAdmin, (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    // TODO: fetch transactions with riskLevel >= HIGH
    (0, response_js_1.paginated)(res, [], 0, page, limit);
});
