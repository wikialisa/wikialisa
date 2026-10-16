/**
 * services/indexer-subgraph — Entry point
 *
 * Orchestrates:
 *   - MongoDB connection (@wikialisa/mongo-db)
 *   - EVM watcher (watchers/evm.ts)  — ReserveUpdated + Swap events
 *   - Solana watcher (watchers/solana.ts) — AMM_SWAP log subscription
 *   - Fastify REST API (routes/index.ts) — query + backfill endpoints
 *
 * Port: 4003
 */

import Fastify from "fastify";
import { connectMongo, closeMongo } from "@wikialisa/mongo-db";
import { EvmWatcher }    from "./watchers/evm.js";
import { SolanaWatcher } from "./watchers/solana.js";
import { registerRoutes } from "./routes/index.js";

// ─── Server ───────────────────────────────────────────────────────────────────

const app = Fastify({
  logger: {
    level: process.env["LOG_LEVEL"] ?? "info",
  },
});

// ─── Watchers (created lazily after startup) ──────────────────────────────────

let evmWatcher:    EvmWatcher    | null = null;
let solanaWatcher: SolanaWatcher | null = null;

// ─── Graceful shutdown ────────────────────────────────────────────────────────

const signals: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];
for (const sig of signals) {
  process.on(sig, async () => {
    app.log.info(`[indexer] Received ${sig}, shutting down…`);
    evmWatcher?.stop();
    solanaWatcher?.stop();
    await app.close();
    await closeMongo();
    process.exit(0);
  });
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  // 1. Connect MongoDB
  await connectMongo();
  app.log.info("[indexer] MongoDB connected");

  // 2. Register REST routes
  await registerRoutes(app);

  // 3. Start Fastify HTTP server
  await app.listen({
    port: Number(process.env["PORT"] ?? 4003),
    host: "0.0.0.0",
  });

  // 4. Start on-chain event watchers (non-blocking)
  evmWatcher = new EvmWatcher(app.log);
  evmWatcher.start().catch((err) =>
    app.log.error({ err }, "[indexer] EVM watcher fatal error")
  );

  // Solana watcher — only enable if SOLANA_RPC is configured
  if (process.env["SOLANA_RPC"] || process.env["ENABLE_SOLANA_WATCHER"] === "true") {
    solanaWatcher = new SolanaWatcher(app.log);
    solanaWatcher.start().catch((err) =>
      app.log.error({ err }, "[indexer] Solana watcher fatal error")
    );
  } else {
    app.log.info("[indexer] Solana watcher disabled (set SOLANA_RPC or ENABLE_SOLANA_WATCHER=true)");
  }
}

// ─── Entry ────────────────────────────────────────────────────────────────────

bootstrap().catch((err) => {
  console.error("[indexer] Fatal startup error:", err);
  process.exit(1);
});
