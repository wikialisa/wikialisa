/**
 * routes/index.ts
 * REST API routes for querying indexed on-chain data from MongoDB.
 *
 * GET /health                          — health check
 * GET /swaps                           — list swap events (paginated, filterable)
 * GET /swaps/:txHash                   — single swap event
 * GET /reserve                         — latest reserve snapshot
 * GET /reserve/history                 — reserve snapshots history (paginated)
 * POST /backfill/evm                   — trigger EVM historical backfill
 * POST /backfill/solana                — trigger Solana historical backfill
 */

import type { FastifyInstance } from "fastify";
import {
  isMongoConnected,
  SwapEventModel,
  ReserveSnapshotModel,
} from "@wikialisa/mongo-db";

// ─── Query param defaults ─────────────────────────────────────────────────────

const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

function parsePagination(query: Record<string, unknown>): {
  page: number;
  limit: number;
  skip: number;
} {
  const page  = Math.max(1, Number(query["page"])  || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query["limit"]) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
}

// ─── Route registration ───────────────────────────────────────────────────────

export async function registerRoutes(app: FastifyInstance): Promise<void> {

  // ── GET /health ─────────────────────────────────────────────────────────────
  app.get("/health", async () => ({
    status:  "ok",
    service: "indexer-subgraph",
    mongo:   isMongoConnected(),
    uptime:  process.uptime(),
  }));

  // ── GET /swaps ───────────────────────────────────────────────────────────────
  // Query params: chain, trader, tokenIn, tokenOut, page, limit
  app.get<{
    Querystring: {
      chain?: string;
      trader?: string;
      tokenIn?: string;
      tokenOut?: string;
      page?: string;
      limit?: string;
    };
  }>("/swaps", async (req, reply) => {
    const { chain, trader, tokenIn, tokenOut } = req.query;
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

    const filter: Record<string, unknown> = {};
    if (chain)    filter["chain"]    = chain;
    if (trader)   filter["trader"]   = { $regex: new RegExp(`^${trader}$`, "i") };
    if (tokenIn)  filter["tokenIn"]  = tokenIn;
    if (tokenOut) filter["tokenOut"] = tokenOut;

    const [docs, total] = await Promise.all([
      SwapEventModel.find(filter)
        .sort({ indexedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SwapEventModel.countDocuments(filter),
    ]);

    return reply.send({
      success: true,
      data: docs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  });

  // ── GET /swaps/:txHash ───────────────────────────────────────────────────────
  app.get<{ Params: { txHash: string } }>(
    "/swaps/:txHash",
    async (req, reply) => {
      const doc = await SwapEventModel.findOne({ txHash: req.params.txHash }).lean();
      if (!doc) return reply.status(404).send({ success: false, message: "Not found" });
      return reply.send({ success: true, data: doc });
    }
  );

  // ── GET /reserve ─────────────────────────────────────────────────────────────
  app.get("/reserve", async (_req, reply) => {
    const doc = await ReserveSnapshotModel.findOne()
      .sort({ snapshotTs: -1 })
      .lean();
    if (!doc) return reply.status(404).send({ success: false, message: "No snapshots yet" });
    return reply.send({ success: true, data: doc });
  });

  // ── GET /reserve/history ─────────────────────────────────────────────────────
  // Query params: from (ISO date), to (ISO date), page, limit
  app.get<{
    Querystring: {
      from?: string;
      to?: string;
      page?: string;
      limit?: string;
    };
  }>("/reserve/history", async (req, reply) => {
    const { from, to } = req.query;
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

    const filter: Record<string, unknown> = {};
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range["$gte"] = new Date(from);
      if (to)   range["$lte"] = new Date(to);
      filter["snapshotTs"] = range;
    }

    const [docs, total] = await Promise.all([
      ReserveSnapshotModel.find(filter)
        .sort({ snapshotTs: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReserveSnapshotModel.countDocuments(filter),
    ]);

    return reply.send({
      success: true,
      data: docs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  });

  // ── POST /backfill/evm ───────────────────────────────────────────────────────
  // Body: { fromBlock: number, toBlock: number }
  // Fires a background job — returns immediately with job ID.
  app.post<{ Body: { fromBlock?: number; toBlock?: number } }>(
    "/backfill/evm",
    { schema: { body: { type: "object", properties: {
      fromBlock: { type: "number" },
      toBlock:   { type: "number" },
    }}}},
    async (req, reply) => {
      const { fromBlock, toBlock } = req.body ?? {};
      const jobId = `evm-backfill-${Date.now()}`;

      // Fire-and-forget — actual implementation in backfill/evm.ts
      setImmediate(() => {
        import("../backfill/evm.js")
          .then(({ runEvmBackfill }) =>
            runEvmBackfill({ fromBlock, toBlock, log: app.log })
          )
          .catch((err) => app.log.error({ err }, "[backfill/evm] Job failed"));
      });

      return reply.status(202).send({
        success: true,
        message: "EVM backfill job accepted",
        jobId,
        params: { fromBlock, toBlock },
      });
    }
  );

  // ── POST /backfill/solana ─────────────────────────────────────────────────────
  // Body: { signatures?: string[], before?: string, until?: string, limit?: number }
  app.post<{
    Body: {
      before?: string;
      until?: string;
      limit?: number;
    };
  }>(
    "/backfill/solana",
    { schema: { body: { type: "object", properties: {
      before: { type: "string" },
      until:  { type: "string" },
      limit:  { type: "number" },
    }}}},
    async (req, reply) => {
      const jobId = `solana-backfill-${Date.now()}`;

      setImmediate(() => {
        import("../backfill/solana.js")
          .then(({ runSolanaBackfill }) =>
            runSolanaBackfill({ ...req.body, log: app.log })
          )
          .catch((err) => app.log.error({ err }, "[backfill/solana] Job failed"));
      });

      return reply.status(202).send({
        success: true,
        message: "Solana backfill job accepted",
        jobId,
        params: req.body,
      });
    }
  );
}
