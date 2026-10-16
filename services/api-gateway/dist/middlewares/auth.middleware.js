"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireAdmin = requireAdmin;
exports.requireCompliance = requireCompliance;
const jwt_js_1 = require("../lib/jwt.js");
const response_js_1 = require("../lib/response.js");
/**
 * Verify Bearer JWT and attach the decoded payload to req.user.
 */
function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        (0, response_js_1.fail)(res, "Unauthorized — missing token", 401, "AUTH_MISSING_TOKEN");
        return;
    }
    const token = header.slice(7);
    try {
        req.user = (0, jwt_js_1.verifyAccessToken)(token);
        next();
    }
    catch {
        (0, response_js_1.fail)(res, "Unauthorized — invalid or expired token", 401, "AUTH_INVALID_TOKEN");
    }
}
/**
 * Require the caller to have the 'admin' role.
 * Must be used after authenticate().
 */
function requireAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
        (0, response_js_1.fail)(res, "Forbidden — admin access required", 403, "AUTH_FORBIDDEN");
        return;
    }
    next();
}
/**
 * Require compliance role (or admin).
 */
function requireCompliance(req, res, next) {
    if (!req.user || !["admin", "compliance"].includes(req.user.role)) {
        (0, response_js_1.fail)(res, "Forbidden — compliance access required", 403, "AUTH_FORBIDDEN");
        return;
    }
    next();
}
