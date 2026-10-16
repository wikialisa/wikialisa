"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAuditContext = buildAuditContext;
exports.auditLog = auditLog;
/**
 * Extract requester context from an Express request.
 */
function buildAuditContext(req) {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]) ??
        req.socket.remoteAddress ??
        "unknown";
    return {
        ipAddress: ip.trim(),
        userAgent: req.headers["user-agent"] ?? "unknown",
    };
}
/**
 * Write an audit event.
 * In production this should persist to a tamper-evident audit log store
 * (e.g. append-only DB table, WORM object storage, SIEM).
 * Here we emit to stdout and the caller can pipe to a log aggregator.
 */
async function auditLog(event) {
    const entry = {
        ...event,
        timestamp: event.timestamp ?? new Date().toISOString(),
    };
    // Structured JSON log — pick up by Fluentd / Loki / CloudWatch
    process.stdout.write(JSON.stringify({ audit: true, ...entry }) + "\n");
    // TODO: INSERT INTO compliance.audit_log (...)
}
