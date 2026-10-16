// ─── MongoDB Init Script — Wikialisa Indexer ─────────────────────────────────
// Chạy tự động khi container khởi lần đầu (MONGO_INITDB_DATABASE).
// Tạo DB, user riêng cho indexer-subgraph, và các collections + indexes.
// ─────────────────────────────────────────────────────────────────────────────

// Switch to the indexer database
const db = db.getSiblingDB("wikialisa_indexer");

// ── Create application user (least privilege) ─────────────────────────────────
db.createUser({
  user: "indexer_app",
  pwd: process.env.MONGO_APP_PASS || "CHANGE_ME_indexer_app_2026",
  roles: [
    { role: "readWrite", db: "wikialisa_indexer" },
  ],
});

// ── Collection: swap_events ───────────────────────────────────────────────────
db.createCollection("swap_events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["txHash", "blockNumber", "tokenIn", "tokenOut", "amountIn", "amountOut", "trader", "chain"],
      properties: {
        txHash:      { bsonType: "string" },
        blockNumber: { bsonType: "int" },
        tokenIn:     { bsonType: "string" },
        tokenOut:    { bsonType: "string" },
        amountIn:    { bsonType: "string" },
        amountOut:   { bsonType: "string" },
        trader:      { bsonType: "string" },
        chain:       { bsonType: "string", enum: ["evm", "solana", "tron"] },
      },
    },
  },
});

db.swap_events.createIndex({ txHash: 1 },           { unique: true, name: "ux_swap_txhash" });
db.swap_events.createIndex({ trader: 1, indexedAt: -1 }, { name: "ix_swap_trader_time" });
db.swap_events.createIndex({ chain: 1, blockNumber: -1 }, { name: "ix_swap_chain_block" });
db.swap_events.createIndex({ tokenIn: 1, tokenOut: 1, indexedAt: -1 }, { name: "ix_swap_tokens_time" });
db.swap_events.createIndex({ indexedAt: -1 },        { name: "ix_swap_indexed" });

print("[mongo-init] swap_events collection created");

// ── Collection: reserve_snapshots ─────────────────────────────────────────────
db.createCollection("reserve_snapshots", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["totalReserveUsd", "axvnCirculatingSupply", "backingRatio", "snapshotTs"],
      properties: {
        totalReserveUsd:       { bsonType: "double" },
        axvnCirculatingSupply: { bsonType: "string" },
        backingRatio:          { bsonType: "double" },
        source:                { bsonType: "string", enum: ["on-chain", "manual", "snapshot"] },
        snapshotTs:            { bsonType: "date" },
      },
    },
  },
});

db.reserve_snapshots.createIndex({ snapshotTs: -1 },      { name: "ix_reserve_ts" });
db.reserve_snapshots.createIndex({ txHash: 1 },           { sparse: true, unique: true, name: "ux_reserve_txhash" });
db.reserve_snapshots.createIndex({ blockNumber: -1 },     { sparse: true, name: "ix_reserve_block" });

print("[mongo-init] reserve_snapshots collection created");

// ── Collection: bridge_relay_events ───────────────────────────────────────────
db.createCollection("bridge_relay_events");

db.bridge_relay_events.createIndex({ swiftMessageId: 1 }, { sparse: true, name: "ix_bridge_swift_msg" });
db.bridge_relay_events.createIndex({ txHash: 1 },          { sparse: true, name: "ix_bridge_txhash" });
db.bridge_relay_events.createIndex({ status: 1, indexedAt: -1 }, { name: "ix_bridge_status_time" });
db.bridge_relay_events.createIndex({ direction: 1, indexedAt: -1 }, { name: "ix_bridge_dir_time" });

print("[mongo-init] bridge_relay_events collection created");

// ── TTL indexes (auto-expire old data after 1 year) ───────────────────────────
db.swap_events.createIndex(
  { indexedAt: 1 },
  { expireAfterSeconds: 365 * 24 * 3600, name: "ttl_swap_1year" }
);

print("[mongo-init] TTL indexes created");
print("[mongo-init] wikialisa_indexer database initialized ✅");
