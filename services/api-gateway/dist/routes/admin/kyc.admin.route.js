"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kycAdminRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const response_js_1 = require("../../lib/response.js");
const audit_js_1 = require("../../lib/audit.js");
exports.kycAdminRouter = (0, express_1.Router)();
exports.kycAdminRouter.use(auth_middleware_js_1.authenticate, auth_middleware_js_1.requireAdmin);
// ─── GET /api/v1/admin/kyc/pending ────────────────────────────────────────────
exports.kycAdminRouter.get("/pending", (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    // TODO: fetch from DB where kyc_status = 'PENDING'
    (0, response_js_1.paginated)(res, [
        { userId: "u002", fullName: "Trần Thị B", phone: "0912345678", documentType: "CCCD", submittedAt: "2024-06-20T09:00:00Z", frontImageUrl: "https://cdn.axvn.vn/kyc/u002-front.jpg", selfieImageUrl: "https://cdn.axvn.vn/kyc/u002-selfie.jpg" },
        { userId: "u005", fullName: "Phạm Quốc D", phone: "0934567890", documentType: "PASSPORT", submittedAt: "2024-06-22T14:30:00Z", frontImageUrl: "https://cdn.axvn.vn/kyc/u005-front.jpg", selfieImageUrl: "https://cdn.axvn.vn/kyc/u005-selfie.jpg" },
    ], 2, page, limit);
});
// ─── POST /api/v1/admin/kyc/review ────────────────────────────────────────────
exports.kycAdminRouter.post("/review", async (req, res) => {
    const body = req.body;
    if (!body.userId || !body.action || !["APPROVE", "REJECT"].includes(body.action)) {
        (0, response_js_1.fail)(res, "userId và action (APPROVE|REJECT) bắt buộc", 400, "VALIDATION_ERROR");
        return;
    }
    if (body.action === "REJECT" && !body.reason) {
        (0, response_js_1.fail)(res, "Cần lý do từ chối khi action = REJECT", 400, "VALIDATION_ERROR");
        return;
    }
    // TODO: update KYC status in DB, notify user via WebSocket/Email
    await (0, audit_js_1.auditLog)({
        userId: req.user.sub,
        action: `ADMIN_KYC_${body.action}`,
        resource: `kyc/${body.userId}`,
        ...(0, audit_js_1.buildAuditContext)(req),
        timestamp: new Date().toISOString(),
        changes: { targetUserId: body.userId, action: body.action, reason: body.reason, tierToGrant: body.tierToGrant },
    });
    (0, response_js_1.ok)(res, {
        userId: body.userId,
        kycStatus: body.action === "APPROVE" ? "VERIFIED" : "REJECTED",
        reviewedAt: new Date().toISOString(),
        reason: body.reason,
    }, `KYC đã được ${body.action === "APPROVE" ? "phê duyệt" : "từ chối"}`);
});
