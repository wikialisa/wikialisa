"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v2Router = void 0;
/**
 * API v2 Router — Stub
 *
 * v2 introduces:
 *  - Cursor-based pagination (`cursor` / `nextCursor`) instead of offset
 *  - Enriched market data endpoints
 *  - Native ISO 20022 payment initiation
 *
 * All v2 routes are aliased here and evolve independently from v1.
 * New products/features ship to v2 first; v1 remains stable.
 */
const express_1 = require("express");
const response_js_1 = require("../lib/response.js");
exports.v2Router = (0, express_1.Router)();
// ─── GET /api/v2/meta — V2 capability discovery ───────────────────────────────
exports.v2Router.get("/meta", (_req, res) => {
    (0, response_js_1.ok)(res, {
        version: "2",
        released: "2025-01-01",
        features: [
            "cursor_pagination",
            "batch_rpc",
            "iso20022_payments",
            "enhanced_market_data",
            "streaming_candles",
        ],
        deprecates: {
            v1: {
                sunset: "2026-12-31",
                docsUrl: "https://docs.axvn.vn/api/migration/v1-to-v2",
            },
        },
    }, "AXQ API v2");
});
// ─── TODO: v2 route modules will be added here ────────────────────────────────
// import { exchangeV2Router } from "./v2/exchange.v2.route.js";
// v2Router.use("/exchange", exchangeV2Router);
