"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complianceRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const response_js_1 = require("../lib/response.js");
const audit_js_1 = require("../lib/audit.js");
exports.complianceRouter = (0, express_1.Router)();
exports.complianceRouter.use(auth_middleware_js_1.authenticate);
// ─── POST /api/v1/compliance/nq05/report ─────────────────────────────────────
exports.complianceRouter.post("/nq05/report", auth_middleware_js_1.requireCompliance, async (req, res) => {
    const body = req.body;
    if (!body.startDate || !body.endDate || !body.format) {
        (0, response_js_1.fail)(res, "startDate, endDate, format bắt buộc", 400, "VALIDATION_ERROR");
        return;
    }
    // TODO: query all transactions in period, generate report file, upload to S3
    const reportId = `RPT-NQ05-${Date.now()}`;
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "GENERATE_NQ05_REPORT", resource: "compliance", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: body });
    (0, response_js_1.ok)(res, {
        reportId,
        period: `${body.startDate} — ${body.endDate}`,
        totalTransactions: 0, // placeholder until DB query
        totalVolume: "0",
        fileUrl: `https://reports.axvn.vn/nq05/${reportId}.${body.format.toLowerCase()}`,
        generatedAt: new Date().toISOString(),
    }, "Báo cáo NQ-05 đã được tạo");
});
// ─── GET /api/v1/compliance/nd284/audit-log ───────────────────────────────────
exports.complianceRouter.get("/nd284/audit-log", auth_middleware_js_1.requireAdmin, (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const userId = req.query.userId;
    const action = req.query.action;
    // TODO: query from compliance.audit_log table
    (0, response_js_1.ok)(res, { items: [], total: 0, page, limit, filters: { userId, action } });
});
// ─── POST /api/v1/compliance/aml/verify ──────────────────────────────────────
exports.complianceRouter.post("/aml/verify", async (req, res) => {
    const body = req.body;
    if (!body.transactionId || !body.userId || !body.amount || !body.asset) {
        (0, response_js_1.fail)(res, "Thiếu thông tin AML check", 400, "VALIDATION_ERROR");
        return;
    }
    const amount = parseFloat(body.amount);
    // Simple rule-based scoring — replace with Chainalysis/TRM integration
    let riskScore = 0;
    const flags = [];
    if (amount > 100_000_000) {
        riskScore += 40;
        flags.push("LARGE_TRANSACTION");
    }
    if (amount > 500_000_000) {
        riskScore += 30;
        flags.push("VERY_LARGE_TRANSACTION");
    }
    if (body.direction === "OUT" && amount > 50_000_000) {
        riskScore += 20;
        flags.push("LARGE_OUTFLOW");
    }
    const riskLevel = riskScore >= 80 ? "CRITICAL" :
        riskScore >= 50 ? "HIGH" :
            riskScore >= 20 ? "MEDIUM" : "LOW";
    (0, response_js_1.ok)(res, {
        transactionId: body.transactionId,
        riskScore,
        riskLevel,
        flags,
        requiresReview: riskScore >= 50,
    });
});
