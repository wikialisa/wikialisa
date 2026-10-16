"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rpcRouter = void 0;
/**
 * JSON-RPC 2.0 Router — Blockchain Node Proxy
 * POST /api/v1/rpc  (and /api/v2/rpc)
 *
 * Supported methods (mirrors Ethereum/Solana compatible subset):
 *   eth_blockNumber          — latest EVM block height
 *   eth_getBalance           — EVM account balance
 *   eth_call                 — read-only smart-contract call
 *   eth_sendRawTransaction   — broadcast signed EVM tx
 *   eth_getTransactionByHash — get EVM tx by hash
 *   eth_getTransactionReceipt
 *   net_version              — chain id (numeric string)
 *   web3_clientVersion       — node software version string
 *   sol_getBalance           — Solana account lamports
 *   sol_getTransaction       — Solana tx by signature
 *   sol_sendTransaction      — broadcast signed Solana tx
 */
const express_1 = require("express");
const types_1 = require("@wikialisa/types");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
exports.rpcRouter = (0, express_1.Router)();
// ─── Helpers ─────────────────────────────────────────────────────────────────
function rpcOk(res, id, result) {
    res.status(200).json({ jsonrpc: "2.0", id, result });
}
function rpcErr(res, id, error, data) {
    res.status(200).json({
        jsonrpc: "2.0",
        id,
        error: { ...error, ...(data !== undefined ? { data } : {}) },
    });
}
const METHODS = {
    // ── EVM / Ethereum-compatible ────────────────────────────────────────────
    eth_blockNumber: () => "0x" + (12_000_000).toString(16),
    eth_getBalance: (params) => {
        const [address] = params;
        if (!address)
            throw types_1.JSON_RPC_ERRORS.INVALID_PARAMS;
        // TODO: proxy to EVM RPC (AXVN_EVM_RPC)
        return "0x" + (1000000000000000000n).toString(16);
    },
    eth_call: (params) => {
        const [tx] = params;
        if (!tx?.to)
            throw types_1.JSON_RPC_ERRORS.INVALID_PARAMS;
        // TODO: proxy to EVM RPC
        return "0x";
    },
    eth_sendRawTransaction: (params) => {
        const [signedTx] = params;
        if (!signedTx)
            throw types_1.JSON_RPC_ERRORS.INVALID_PARAMS;
        // TODO: broadcast via Tatum / direct RPC node
        return "0x" + Buffer.from(signedTx.slice(2, 34), "hex").toString("hex");
    },
    eth_getTransactionByHash: (params) => {
        const [hash] = params;
        if (!hash)
            throw types_1.JSON_RPC_ERRORS.INVALID_PARAMS;
        // TODO: fetch from node or indexed DB
        return null; // null = tx not found (standard behaviour)
    },
    eth_getTransactionReceipt: (params) => {
        const [hash] = params;
        if (!hash)
            throw types_1.JSON_RPC_ERRORS.INVALID_PARAMS;
        return null;
    },
    net_version: () => process.env.CHAIN_ID ?? "1",
    web3_clientVersion: () => "AXQ/1.0.0/linux/node",
    // ── Solana-compatible ────────────────────────────────────────────────────
    sol_getBalance: (params) => {
        const [address] = params;
        if (!address)
            throw types_1.JSON_RPC_ERRORS.INVALID_PARAMS;
        // TODO: proxy to Solana RPC (SOL_RPC_URL)
        return { value: 1_000_000_000, context: { slot: 300_000_000 } };
    },
    sol_getTransaction: (params) => {
        const [signature] = params;
        if (!signature)
            throw types_1.JSON_RPC_ERRORS.INVALID_PARAMS;
        return null;
    },
    sol_sendTransaction: (params) => {
        const [encodedTx] = params;
        if (!encodedTx)
            throw types_1.JSON_RPC_ERRORS.INVALID_PARAMS;
        // TODO: forward to Solana RPC
        return "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLiSLiSLiSLiSLiSLiS";
    },
};
// ─── Single endpoint — handles both individual and batch requests ─────────────
exports.rpcRouter.post("/", auth_middleware_js_1.authenticate, // all RPC calls require a valid JWT
async (req, res) => {
    const body = req.body;
    // ── Batch request ──────────────────────────────────────────────────────
    if (Array.isArray(body)) {
        if (body.length === 0) {
            return rpcErr(res, null, types_1.JSON_RPC_ERRORS.INVALID_REQUEST);
        }
        const results = await Promise.all(body.map((item) => handleSingle(item, req)));
        return res.status(200).json(results);
    }
    // ── Single request ─────────────────────────────────────────────────────
    return handleSingleHttp(body, req, res);
});
// ─── Internal helpers ─────────────────────────────────────────────────────────
async function handleSingle(item, req) {
    if (item.jsonrpc !== "2.0" || !item.method) {
        return { jsonrpc: "2.0", id: item.id ?? null, error: types_1.JSON_RPC_ERRORS.INVALID_REQUEST };
    }
    const handler = METHODS[item.method];
    if (!handler) {
        return { jsonrpc: "2.0", id: item.id, error: types_1.JSON_RPC_ERRORS.METHOD_NOT_FOUND };
    }
    try {
        const result = await handler(item.params ?? [], req);
        return { jsonrpc: "2.0", id: item.id, result };
    }
    catch (err) {
        const known = err;
        if (known?.code !== undefined) {
            return { jsonrpc: "2.0", id: item.id, error: { code: known.code, message: known.message ?? "Error" } };
        }
        console.error("[rpc] Unhandled error:", err);
        return { jsonrpc: "2.0", id: item.id, error: types_1.JSON_RPC_ERRORS.INTERNAL_ERROR };
    }
}
function handleSingleHttp(item, req, res) {
    if (item.jsonrpc !== "2.0" || !item.method) {
        rpcErr(res, item.id ?? null, types_1.JSON_RPC_ERRORS.INVALID_REQUEST);
        return;
    }
    const handler = METHODS[item.method];
    if (!handler) {
        rpcErr(res, item.id, types_1.JSON_RPC_ERRORS.METHOD_NOT_FOUND);
        return;
    }
    Promise.resolve()
        .then(() => handler(item.params ?? [], req))
        .then((result) => rpcOk(res, item.id, result))
        .catch((err) => {
        const known = err;
        if (known?.code !== undefined) {
            rpcErr(res, item.id, { code: known.code, message: known.message ?? "Error" });
        }
        else {
            console.error("[rpc] Unhandled error:", err);
            rpcErr(res, item.id, types_1.JSON_RPC_ERRORS.INTERNAL_ERROR);
        }
    });
}
