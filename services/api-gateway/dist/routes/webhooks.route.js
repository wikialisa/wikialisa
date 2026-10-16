"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRouter = void 0;
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const response_js_1 = require("../lib/response.js");
exports.webhookRouter = (0, express_1.Router)();
const WEBHOOK_SECRET = process.env.COMPLIANCE_SECRET_KEY ?? "webhook_secret_placeholder";
/** Verify HMAC-SHA256 signature from request header */
function verifyHMAC(payload, signature) {
    const expected = crypto_1.default
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(payload)
        .digest("hex");
    return crypto_1.default.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
// ─── POST /api/v1/webhooks/crypto/deposit ─────────────────────────────────────
exports.webhookRouter.post("/crypto/deposit", async (req, res) => {
    const sig = req.headers["x-tatum-signature"] ?? "";
    const raw = JSON.stringify(req.body);
    if (sig && !verifyHMAC(raw, sig)) {
        (0, response_js_1.fail)(res, "Invalid webhook signature", 401, "WEBHOOK_AUTH_FAILED");
        return;
    }
    const event = req.body;
    if (!event.txHash || !event.toAddress || !event.asset || !event.amount) {
        (0, response_js_1.fail)(res, "Invalid payload", 400, "VALIDATION_ERROR");
        return;
    }
    // TODO: find user by toAddress, credit balance if confirmations >= threshold
    // TODO: enqueue to deposit-worker BullMQ queue
    console.log("[webhook/crypto/deposit]", event);
    (0, response_js_1.ok)(res, { received: true, txHash: event.txHash });
});
// ─── POST /api/v1/webhooks/fiat/vietqr ───────────────────────────────────────
exports.webhookRouter.post("/fiat/vietqr", async (req, res) => {
    const sig = req.headers["x-hmac-signature"] ?? "";
    const raw = JSON.stringify(req.body);
    if (sig && !verifyHMAC(raw, sig)) {
        (0, response_js_1.fail)(res, "Invalid HMAC signature", 401, "WEBHOOK_AUTH_FAILED");
        return;
    }
    const event = req.body;
    if (!event.transactionId || !event.amount || !event.description) {
        (0, response_js_1.fail)(res, "Invalid VietQR payload", 400, "VALIDATION_ERROR");
        return;
    }
    // TODO: parse description for orderId, credit user VND balance
    // TODO: enqueue to deposit-worker
    console.log("[webhook/fiat/vietqr]", event);
    (0, response_js_1.ok)(res, { received: true, transactionId: event.transactionId });
});
// ─── POST /api/v1/webhooks/p2p/escrow ────────────────────────────────────────
exports.webhookRouter.post("/p2p/escrow", async (req, res) => {
    const event = req.body;
    if (!event.orderId || !event.event || !event.txHash) {
        (0, response_js_1.fail)(res, "Invalid escrow webhook payload", 400, "VALIDATION_ERROR");
        return;
    }
    // TODO: update P2P order status in DB
    console.log("[webhook/p2p/escrow]", event);
    (0, response_js_1.ok)(res, { received: true, orderId: event.orderId, event: event.event });
});
