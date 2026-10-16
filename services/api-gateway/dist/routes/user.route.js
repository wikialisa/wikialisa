"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const response_js_1 = require("../lib/response.js");
const audit_js_1 = require("../lib/audit.js");
exports.userRouter = (0, express_1.Router)();
// ─── All user routes require authentication ───────────────────────────────────
exports.userRouter.use(auth_middleware_js_1.authenticate);
// ─── GET /api/v1/user/profile ─────────────────────────────────────────────────
exports.userRouter.get("/profile", (req, res) => {
    // TODO: fetch from DB
    (0, response_js_1.ok)(res, {
        userId: req.user.sub,
        fullName: "Nguyễn Văn A",
        phone: "0901234567",
        email: "nguyen.van.a@axvn.vn",
        avatar: null,
        kycStatus: "VERIFIED",
        kycTier: 2,
        createdAt: "2024-01-15T00:00:00Z",
    });
});
// ─── PUT /api/v1/user/profile ─────────────────────────────────────────────────
exports.userRouter.put("/profile", async (req, res) => {
    const body = req.body;
    // TODO: update DB record
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "UPDATE_PROFILE", resource: "users", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: body });
    (0, response_js_1.ok)(res, body, "Hồ sơ đã được cập nhật");
});
// ─── POST /api/v1/user/kyc/submit ────────────────────────────────────────────
exports.userRouter.post("/kyc/submit", async (req, res) => {
    const body = req.body;
    if (!body.documentType || !body.documentNumber || !body.frontImageUrl || !body.selfieImageUrl) {
        (0, response_js_1.fail)(res, "Thiếu thông tin hồ sơ KYC", 400, "VALIDATION_ERROR");
        return;
    }
    // TODO: create KYC record in DB with PENDING status, enqueue for review
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "KYC_SUBMIT", resource: "kyc", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString() });
    (0, response_js_1.created)(res, { status: "PENDING", submittedAt: new Date().toISOString() }, "Hồ sơ KYC đã được nộp");
});
// ─── GET /api/v1/user/kyc/status ─────────────────────────────────────────────
exports.userRouter.get("/kyc/status", (req, res) => {
    // TODO: fetch from DB
    (0, response_js_1.ok)(res, { status: "VERIFIED", tier: 2, verifiedAt: "2024-02-01T00:00:00Z" });
});
// ─── GET /api/v1/user/security/sessions ──────────────────────────────────────
exports.userRouter.get("/security/sessions", (req, res) => {
    // TODO: fetch sessions from Redis/DB
    (0, response_js_1.ok)(res, [
        { sessionId: "sess-001", deviceName: "iPhone 15 Pro", deviceOS: "iOS 17.4", ipAddress: "103.1.2.3", location: "TP.HCM, VN", lastSeen: new Date().toISOString(), current: true },
    ]);
});
// ─── POST /api/v1/user/security/sessions/revoke ──────────────────────────────
exports.userRouter.post("/security/sessions/revoke", async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        (0, response_js_1.fail)(res, "sessionId bắt buộc", 400, "VALIDATION_ERROR");
        return;
    }
    // TODO: remove session from Redis
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "REVOKE_SESSION", resource: "sessions", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: { sessionId } });
    (0, response_js_1.ok)(res, null, "Đã đăng xuất thiết bị thành công");
});
// ─── PUT /api/v1/user/security/change-password ───────────────────────────────
exports.userRouter.put("/security/change-password", async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        (0, response_js_1.fail)(res, "Thiếu thông tin đổi mật khẩu", 400, "VALIDATION_ERROR");
        return;
    }
    if (newPassword.length < 8) {
        (0, response_js_1.fail)(res, "Mật khẩu mới phải có ít nhất 8 ký tự", 400, "WEAK_PASSWORD");
        return;
    }
    // TODO: verify currentPassword, update hash
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "CHANGE_PASSWORD", resource: "security", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString() });
    (0, response_js_1.ok)(res, null, "Đổi mật khẩu thành công");
});
// ─── GET /api/v1/user/notifications ──────────────────────────────────────────
exports.userRouter.get("/notifications", (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    // TODO: fetch from DB
    (0, response_js_1.paginated)(res, [], 0, page, limit);
});
// ─── PATCH /api/v1/user/notifications/read ───────────────────────────────────
exports.userRouter.patch("/notifications/read", async (req, res) => {
    const { notificationIds } = req.body;
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        (0, response_js_1.fail)(res, "notificationIds phải là mảng không rỗng", 400, "VALIDATION_ERROR");
        return;
    }
    // TODO: update isRead = true in DB
    (0, response_js_1.ok)(res, null, "Đã đánh dấu đã đọc");
});
