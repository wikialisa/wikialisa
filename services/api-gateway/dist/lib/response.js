"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.created = created;
exports.noContent = noContent;
exports.paginated = paginated;
exports.fail = fail;
// ─── Success helpers ──────────────────────────────────────────────────────────
/** 200 OK — single resource or generic payload */
function ok(res, data, message = "Success") {
    res.status(200).json({ success: true, message, data });
}
/** 201 Created — resource was created */
function created(res, data, message = "Created") {
    res.status(201).json({ success: true, message, data });
}
/** 204 No Content — action succeeded with no body to return */
function noContent(res) {
    res.status(204).end();
}
/**
 * 200 OK — paginated collection.
 * Automatically computes totalPages, hasNext, hasPrev from the provided values.
 */
function paginated(res, data, total, page, limit, message = "Success") {
    const totalPages = Math.ceil(total / limit) || 1;
    const pagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
    res.status(200).json({
        success: true,
        message,
        data,
        pagination,
    });
}
// ─── Error helper ─────────────────────────────────────────────────────────────
function fail(res, message, statusCode = 400, errorCode) {
    res.status(statusCode).json({
        success: false,
        message,
        data: null,
        errorCode,
    });
}
