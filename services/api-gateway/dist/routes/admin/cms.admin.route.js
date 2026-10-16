"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsAdminRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const response_js_1 = require("../../lib/response.js");
const audit_js_1 = require("../../lib/audit.js");
exports.cmsAdminRouter = (0, express_1.Router)();
exports.cmsAdminRouter.use(auth_middleware_js_1.authenticate, auth_middleware_js_1.requireAdmin);
// ─── GET /api/v1/admin/cms/blogs ─────────────────────────────────────────────
exports.cmsAdminRouter.get("/blogs", (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    // TODO: fetch all blogs including drafts
    (0, response_js_1.paginated)(res, [], 0, page, limit);
});
// ─── POST /api/v1/admin/cms/blogs ────────────────────────────────────────────
exports.cmsAdminRouter.post("/blogs", async (req, res) => {
    const { title, content, category, published } = req.body;
    if (!title || !content) {
        (0, response_js_1.fail)(res, "title và content bắt buộc", 400, "VALIDATION_ERROR");
        return;
    }
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
    // TODO: insert into CMS DB
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "CMS_CREATE_BLOG", resource: "cms/blogs", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: { title, category } });
    (0, response_js_1.created)(res, { slug, title, published: published ?? false, createdAt: new Date().toISOString() }, "Bài viết đã được tạo");
});
// ─── PUT /api/v1/admin/cms/blogs/:slug ───────────────────────────────────────
exports.cmsAdminRouter.put("/blogs/:slug", async (req, res) => {
    const { slug } = req.params;
    // TODO: update in DB
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "CMS_UPDATE_BLOG", resource: `cms/blogs/${slug}`, ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString() });
    (0, response_js_1.ok)(res, { slug, updatedAt: new Date().toISOString() }, "Bài viết đã được cập nhật");
});
// ─── DELETE /api/v1/admin/cms/blogs/:slug ────────────────────────────────────
exports.cmsAdminRouter.delete("/blogs/:slug", async (req, res) => {
    const { slug } = req.params;
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "CMS_DELETE_BLOG", resource: `cms/blogs/${slug}`, ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString() });
    (0, response_js_1.ok)(res, null, "Bài viết đã được xoá");
});
// ─── GET /api/v1/admin/cms/courses ───────────────────────────────────────────
exports.cmsAdminRouter.get("/courses", (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    (0, response_js_1.paginated)(res, [], 0, page, limit);
});
// ─── POST /api/v1/admin/cms/courses ──────────────────────────────────────────
exports.cmsAdminRouter.post("/courses", async (req, res) => {
    const { title, description, level, category } = req.body;
    if (!title || !level) {
        (0, response_js_1.fail)(res, "title và level bắt buộc", 400, "VALIDATION_ERROR");
        return;
    }
    const courseId = `C${Date.now()}`;
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "CMS_CREATE_COURSE", resource: "cms/courses", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: { courseId, title, level } });
    (0, response_js_1.created)(res, { courseId, title, level, category, published: false, createdAt: new Date().toISOString() }, "Khóa học đã được tạo");
});
