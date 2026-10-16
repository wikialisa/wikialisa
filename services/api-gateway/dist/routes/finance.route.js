"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const response_js_1 = require("../lib/response.js");
const audit_js_1 = require("../lib/audit.js");
exports.financeRouter = (0, express_1.Router)();
// All finance routes require authentication
exports.financeRouter.use(auth_middleware_js_1.authenticate);
// ─── GET /api/v1/finance/balances ─────────────────────────────────────────────
exports.financeRouter.get("/balances", (req, res) => {
    // TODO: aggregate balances from DB
    (0, response_js_1.ok)(res, [
        { asset: "VND", network: "VND", available: "2500000", locked: "0", usdEquivalent: "100.00" },
        { asset: "BTC", network: "ERC20", available: "0.0842", locked: "0", usdEquivalent: "5680.04" },
        { asset: "ETH", network: "ERC20", available: "1.25", locked: "0", usdEquivalent: "4275.00" },
        { asset: "SOL", network: "SOL", available: "12.5", locked: "0", usdEquivalent: "1850.00" },
        { asset: "USDT", network: "TRC20", available: "500.00", locked: "100.00", usdEquivalent: "500.00" },
    ]);
});
// ─── POST /api/v1/finance/deposit/crypto/address ─────────────────────────────
exports.financeRouter.post("/deposit/crypto/address", async (req, res) => {
    const body = req.body;
    if (!body.asset || !body.network) {
        (0, response_js_1.fail)(res, "asset và network bắt buộc", 400, "VALIDATION_ERROR");
        return;
    }
    // TODO: generate or fetch deposit address from Tatum/Alchemy
    const address = `T${req.user.sub.slice(0, 30)}`; // mock TRC20 address placeholder
    (0, response_js_1.created)(res, { address, asset: body.asset, network: body.network, memo: undefined, qrCode: undefined });
});
// ─── POST /api/v1/finance/deposit/fiat ───────────────────────────────────────
exports.financeRouter.post("/deposit/fiat", async (req, res) => {
    const body = req.body;
    if (!body.amount || body.amount <= 0) {
        (0, response_js_1.fail)(res, "Số tiền không hợp lệ", 400, "VALIDATION_ERROR");
        return;
    }
    const orderId = `FD-${Date.now()}`;
    // TODO: create VietQR payment intent
    (0, response_js_1.created)(res, {
        orderId,
        vietQrContent: `00020101021238540010A000000727012700069704220113${orderId}5303704540${body.amount}5802VN6304`,
        bankAccount: "1234567890",
        bankName: "AXQ Internal Bank",
        amount: body.amount,
        description: body.description ?? `AXQ NAP ${orderId}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
});
// ─── POST /api/v1/finance/withdraw/crypto ────────────────────────────────────
exports.financeRouter.post("/withdraw/crypto", async (req, res) => {
    const body = req.body;
    if (!body.asset || !body.network || !body.toAddress || !body.amount || !body.pin) {
        (0, response_js_1.fail)(res, "Thiếu thông tin rút tiền crypto", 400, "VALIDATION_ERROR");
        return;
    }
    // Security: validate PIN before processing
    if (body.pin.length !== 6) {
        (0, response_js_1.fail)(res, "PIN không hợp lệ", 401, "INVALID_PIN");
        return;
    }
    // TODO: verify PIN hash, check balance, check AML, enqueue to withdraw-worker
    const withdrawId = `WC-${Date.now()}`;
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "WITHDRAW_CRYPTO", resource: "finance", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: { withdrawId, asset: body.asset, amount: body.amount, network: body.network } });
    (0, response_js_1.created)(res, { withdrawId, status: "PENDING", estimatedTime: "5-30 phút" }, "Lệnh rút đã được khởi tạo");
});
// ─── POST /api/v1/finance/withdraw/fiat ──────────────────────────────────────
exports.financeRouter.post("/withdraw/fiat", async (req, res) => {
    const body = req.body;
    if (!body.amount || !body.bankCode || !body.accountNumber || !body.accountName || !body.pin) {
        (0, response_js_1.fail)(res, "Thiếu thông tin rút tiền fiat", 400, "VALIDATION_ERROR");
        return;
    }
    if (body.pin.length !== 6) {
        (0, response_js_1.fail)(res, "PIN không hợp lệ", 401, "INVALID_PIN");
        return;
    }
    // TODO: verify PIN, check balance, enqueue to withdraw-worker (may require admin approval if > threshold)
    const withdrawId = `WF-${Date.now()}`;
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "WITHDRAW_FIAT", resource: "finance", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: { withdrawId, amount: body.amount, bankCode: body.bankCode } });
    (0, response_js_1.created)(res, { withdrawId, status: "PENDING", estimatedTime: "1-2 giờ" }, "Lệnh rút về tài khoản ngân hàng đã được gửi");
});
// ─── POST /api/v1/finance/transfer/p2p ───────────────────────────────────────
exports.financeRouter.post("/transfer/p2p", async (req, res) => {
    const body = req.body;
    if (!body.toIdentifier || !body.amount || !body.pin || !body.idempotencyKey) {
        (0, response_js_1.fail)(res, "Thiếu thông tin chuyển tiền P2P", 400, "VALIDATION_ERROR");
        return;
    }
    if (body.pin.length !== 6) {
        (0, response_js_1.fail)(res, "PIN không hợp lệ", 401, "INVALID_PIN");
        return;
    }
    // Idempotency check
    // TODO: check idempotencyKey in Redis, if exists return cached result
    const txId = `P2P-${Date.now()}`;
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "P2P_TRANSFER", resource: "finance", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: { txId, to: body.toIdentifier, amount: body.amount } });
    (0, response_js_1.ok)(res, { txId, status: "SUCCESS", completedAt: new Date().toISOString() }, "Chuyển tiền thành công");
});
// ─── POST /api/v1/finance/swift/transfer ─────────────────────────────────────
exports.financeRouter.post("/swift/transfer", async (req, res) => {
    const body = req.body;
    if (!body.beneficiaryName || !body.swiftCode || !body.amount || !body.currency || !body.pin) {
        (0, response_js_1.fail)(res, "Thiếu thông tin SWIFT", 400, "VALIDATION_ERROR");
        return;
    }
    if (body.pin.length !== 6) {
        (0, response_js_1.fail)(res, "PIN không hợp lệ", 401, "INVALID_PIN");
        return;
    }
    // TODO: verify PIN, send to swift-gateway service
    const uetr = `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
    await (0, audit_js_1.auditLog)({ userId: req.user.sub, action: "SWIFT_TRANSFER", resource: "finance", ...(0, audit_js_1.buildAuditContext)(req), timestamp: new Date().toISOString(), changes: { uetr, amount: body.amount, currency: body.currency } });
    (0, response_js_1.ok)(res, { uetr, status: "SUBMITTED", estimatedSettlement: "1-3 ngày làm việc" }, "Lệnh SWIFT đã được gửi");
});
// ─── GET /api/v1/finance/transactions/history ────────────────────────────────
exports.financeRouter.get("/transactions/history", (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    // TODO: fetch paginated from DB
    (0, response_js_1.paginated)(res, [], 0, page, limit);
});
