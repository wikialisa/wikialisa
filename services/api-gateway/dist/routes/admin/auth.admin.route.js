"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authAdminRouter = void 0;
const express_1 = require("express");
const jwt_js_1 = require("../../lib/jwt.js");
const response_js_1 = require("../../lib/response.js");
const audit_js_1 = require("../../lib/audit.js");
exports.authAdminRouter = (0, express_1.Router)();
// ─── POST /api/v1/admin/auth/login ────────────────────────────────────────────
exports.authAdminRouter.post("/login", async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        (0, response_js_1.fail)(res, "identifier và password bắt buộc", 400, "VALIDATION_ERROR");
        return;
    }
    // TODO: lookup admin user in DB, verify password hash, check role = 'admin'
    const adminId = "admin-root-id";
    const accessToken = (0, jwt_js_1.signAccessToken)({ sub: adminId, role: "admin" });
    const refreshToken = (0, jwt_js_1.signRefreshToken)({ sub: adminId, role: "admin" });
    await (0, audit_js_1.auditLog)({ userId: adminId, action: "ADMIN_LOGIN", resource: "admin/auth", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString() });
    (0, response_js_1.ok)(res, { adminId, accessToken, refreshToken, expiresIn: 900 }, "Admin đăng nhập thành công");
});
