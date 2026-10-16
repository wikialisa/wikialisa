"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const response_js_1 = require("../lib/response.js");
const audit_js_1 = require("../lib/audit.js");
exports.walletRouter = (0, express_1.Router)();
// All wallet routes require authentication
exports.walletRouter.use(auth_middleware_js_1.authenticate);
// ─── GET /api/v1/wallet/balance ───────────────────────────────────────────────
exports.walletRouter.get("/balance", (_req, res) => {
    // TODO: aggregate from DB per authenticated user
    (0, response_js_1.ok)(res, {
        vnd: { available: "2500000", locked: "0" },
        vnkr: { available: "2500000", locked: "0" },
        crypto: [
            { asset: "BTC", network: "ERC20", available: "0.0842", locked: "0", usdEquivalent: "5680.04" },
            { asset: "ETH", network: "ERC20", available: "1.25", locked: "0", usdEquivalent: "4275.00" },
            { asset: "SOL", network: "SOL", available: "12.5", locked: "0", usdEquivalent: "1850.00" },
            { asset: "USDT", network: "TRC20", available: "500.00", locked: "100.00", usdEquivalent: "500.00" },
        ],
    });
});
// ─── GET /api/v1/wallet/transactions ─────────────────────────────────────────
exports.walletRouter.get("/transactions", (req, res) => {
    const page = Number(req.query["page"]) || 1;
    const limit = Number(req.query["limit"]) || 20;
    // TODO: fetch paginated from DB for authenticated user
    (0, response_js_1.paginated)(res, [], 0, page, limit);
});
// ─── POST /api/v1/wallet/transfer ────────────────────────────────────────────
/**
 * Internal wallet transfer (VND / AXQ between AXQ users).
 * For cross-border SWIFT transfers use POST /api/v1/swift/transfer.
 */
exports.walletRouter.post("/transfer", async (req, res) => {
    const { toIdentifier, amount, asset, pin, idempotencyKey } = req.body;
    if (!toIdentifier || !amount || !asset || !pin || !idempotencyKey) {
        (0, response_js_1.fail)(res, "Thiếu thông tin chuyển tiền", 400, "VALIDATION_ERROR");
        return;
    }
    if (pin.length !== 6) {
        (0, response_js_1.fail)(res, "PIN không hợp lệ", 401, "INVALID_PIN");
        return;
    }
    // TODO: verify PIN hash, check balance, idempotency key (Redis), debit/credit
    const txId = `TXN-${Date.now()}`;
    await (0, audit_js_1.auditLog)({
        userId: req.user.sub, action: "WALLET_TRANSFER", resource: "wallet",
        ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(),
        changes: { txId, to: toIdentifier, amount, asset },
    });
    (0, response_js_1.ok)(res, { txId, status: "SUCCESS", completedAt: new Date().toISOString() }, "Chuyển tiền thành công");
});
// ─── POST /api/v1/wallet/withdraw/fiat ───────────────────────────────────────
exports.walletRouter.post("/withdraw/fiat", async (req, res) => {
    const body = req.body;
    if (!body.amount || !body.bankCode || !body.accountNumber || !body.accountName || !body.pin) {
        (0, response_js_1.fail)(res, "Thiếu thông tin rút tiền fiat", 400, "VALIDATION_ERROR");
        return;
    }
    if (body.pin.length !== 6) {
        (0, response_js_1.fail)(res, "PIN không hợp lệ", 401, "INVALID_PIN");
        return;
    }
    const withdrawId = `WF-${Date.now()}`;
    await (0, audit_js_1.auditLog)({
        userId: req.user.sub, action: "WITHDRAW_FIAT", resource: "wallet",
        ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(),
        changes: { withdrawId, amount: body.amount, bankCode: body.bankCode },
    });
    (0, response_js_1.ok)(res, { withdrawId, status: "PENDING", estimatedTime: "1-2 giờ" }, "Lệnh rút về tài khoản ngân hàng đã được gửi");
});
// ─── POST /api/v1/wallet/withdraw/crypto ─────────────────────────────────────
exports.walletRouter.post("/withdraw/crypto", async (req, res) => {
    const body = req.body;
    if (!body.asset || !body.network || !body.toAddress || !body.amount || !body.pin) {
        (0, response_js_1.fail)(res, "Thiếu thông tin rút tiền crypto", 400, "VALIDATION_ERROR");
        return;
    }
    if (body.pin.length !== 6) {
        (0, response_js_1.fail)(res, "PIN không hợp lệ", 401, "INVALID_PIN");
        return;
    }
    const withdrawId = `WC-${Date.now()}`;
    await (0, audit_js_1.auditLog)({
        userId: req.user.sub, action: "WITHDRAW_CRYPTO", resource: "wallet",
        ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(),
        changes: { withdrawId, asset: body.asset, amount: body.amount, network: body.network },
    });
    (0, response_js_1.ok)(res, { withdrawId, status: "PENDING", estimatedTime: "5-30 phút" }, "Lệnh rút đã được khởi tạo");
});
