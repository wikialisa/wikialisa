"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.p2pRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const response_js_1 = require("../lib/response.js");
const audit_js_1 = require("../lib/audit.js");
exports.p2pRouter = (0, express_1.Router)();
// All P2P routes require authentication
exports.p2pRouter.use(auth_middleware_js_1.authenticate);
// ─── GET /api/v1/p2p/offers ──────────────────────────────────────────────────
/**
 * Fetch the live P2P orderbook (buy + sell offers).
 * Query params: side (BUY|SELL), asset, minAmount, maxAmount, page, limit
 */
exports.p2pRouter.get("/offers", (req, res) => {
    const page = Number(req.query["page"]) || 1;
    const limit = Number(req.query["limit"]) || 20;
    const side = req.query["side"];
    const asset = req.query["asset"];
    // TODO: query P2P orderbook from DB with filters
    (0, response_js_1.paginated)(res, [], 0, page, limit);
});
// ─── POST /api/v1/p2p/offers ─────────────────────────────────────────────────
/**
 * Create a new P2P offer (makeOffer).
 * Locks AXQ/AXQ into the Solana escrow PDA via on-chain instruction.
 */
exports.p2pRouter.post("/offers", async (req, res) => {
    const { side, asset, amount, rate, minLimit, maxLimit, paymentMethod, pin } = req.body;
    if (!side || !asset || !amount || !rate || !minLimit || !maxLimit || !paymentMethod || !pin) {
        (0, response_js_1.fail)(res, "Thiếu thông tin tạo lệnh P2P", 400, "VALIDATION_ERROR");
        return;
    }
    if (!["BUY", "SELL"].includes(side)) {
        (0, response_js_1.fail)(res, "side phải là BUY hoặc SELL", 400, "VALIDATION_ERROR");
        return;
    }
    if (pin.length !== 6) {
        (0, response_js_1.fail)(res, "PIN không hợp lệ", 401, "INVALID_PIN");
        return;
    }
    // TODO: verify PIN, check balance, call makeOffer() on Solana escrow
    const offerId = `OFFER-${Date.now().toString(36).toUpperCase()}`;
    await (0, audit_js_1.auditLog)({
        userId: req.user.sub, action: "P2P_MAKE_OFFER", resource: "p2p",
        ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(),
        changes: { offerId, side, asset, amount },
    });
    (0, response_js_1.created)(res, {
        offerId,
        side,
        asset,
        amount,
        rate,
        minLimit,
        maxLimit,
        paymentMethod,
        status: "OPEN",
        onChainTx: null, // set once makeOffer() confirms
        createdAt: new Date().toISOString(),
    }, "Lệnh P2P đã được tạo");
});
// ─── POST /api/v1/p2p/offers/:id/take ────────────────────────────────────────
/**
 * Take an existing P2P offer (takeOffer).
 * Transitions the offer to MATCHED and triggers the fiat payment window.
 */
exports.p2pRouter.post("/offers/:id/take", async (req, res) => {
    const { id } = req.params;
    const { pin } = req.body;
    if (!pin) {
        (0, response_js_1.fail)(res, "PIN bắt buộc", 400, "VALIDATION_ERROR");
        return;
    }
    if (pin.length !== 6) {
        (0, response_js_1.fail)(res, "PIN không hợp lệ", 401, "INVALID_PIN");
        return;
    }
    // TODO: find offer, verify status = OPEN, call takeOffer() on Solana escrow
    await (0, audit_js_1.auditLog)({
        userId: req.user.sub, action: "P2P_TAKE_OFFER", resource: "p2p",
        ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(),
        changes: { offerId: id },
    });
    (0, response_js_1.ok)(res, {
        offerId: id,
        status: "MATCHED",
        fiatDeadlineMinutes: 15,
        bankAccountInfo: null, // populated from offer maker's verified bank details
        matchedAt: new Date().toISOString(),
    }, "Đã nhận lệnh. Vui lòng chuyển khoản trong 15 phút.");
});
// ─── DELETE /api/v1/p2p/offers/:id ───────────────────────────────────────────
/**
 * Cancel a P2P offer (cancelOffer).
 * Only the offer creator can cancel; offer must be in OPEN state.
 * Returns AXQ/AXQ from the escrow PDA back to the maker's wallet.
 */
exports.p2pRouter.delete("/offers/:id", async (req, res) => {
    const { id } = req.params;
    // TODO: find offer, verify ownership, verify status = OPEN, call cancelOffer()
    await (0, audit_js_1.auditLog)({
        userId: req.user.sub, action: "P2P_CANCEL_OFFER", resource: "p2p",
        ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(),
        changes: { offerId: id },
    });
    (0, response_js_1.ok)(res, { offerId: id, status: "CANCELLED", cancelledAt: new Date().toISOString() }, "Lệnh P2P đã bị hủy");
});
