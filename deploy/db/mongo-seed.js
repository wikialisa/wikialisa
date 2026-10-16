// =============================================================================
// AXQ Wikialisa — MongoDB Seed Data (wikialisa_indexer)
// =============================================================================
// Phủ đầy đủ:
//   - swap_events: EVM, Solana, Tron — đủ mọi token pair, trader roles
//   - reserve_snapshots: 30 ngày + 1 snapshot nguy hiểm (ratio < 1.0)
//   - bridge_relay_events: INBOUND, OUTBOUND, FAILED, CONFIRMED
// =============================================================================
// Usage:
//   mongosh "mongodb://axvn_admin:dev_mongo_2026@localhost:27017/wikialisa_indexer?authSource=admin" \
//           --file deploy/db/mongo-seed.js
// =============================================================================

const db = db.getSiblingDB("wikialisa_indexer");

// Helper: random int in range
function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Helper: random BigInt-as-string (9 decimals AXQ)
function randAXQ(min, max) { return (ri(min, max) * 1_000_000_000).toString(); }

// Helper: random BigInt-as-string (6 decimals USDT)
function randUSDT(min, max) { return (ri(min, max) * 1_000_000).toString(); }

const now = new Date();
const ago = (minutes) => new Date(now.getTime() - minutes * 60 * 1000);

// ─── Token addresses ──────────────────────────────────────────────────────────
const AXQ_EVM   = "0x0000000000000000000000000000000000000001";
const USDT_EVM  = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDC_EVM  = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const AXQ_SOL   = "AXQmint111111111111111111111111111111111111";
const USDT_SOL  = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
const USDT_TRON = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const AXQ_TRON  = "TAxqv1KAqxYNP8mHF4T1111111111111111111";

// ─── Wallet addresses ─────────────────────────────────────────────────────────
const traders = {
  vip:        "0x1000000000000000000000000000000000000010",
  t2:         "0x1000000000000000000000000000000000000011",
  t1:         "0x1000000000000000000000000000000000000012",
  mena:       "0x3000000000000000000000000000000000000030",
  sg:         "0x3000000000000000000000000000000000000031",
  solanaVip:  "VipTraDerSoL1111111111111111111111111111",
  solanaT2:   "T2TraDerSoL2222222222222222222222222222A",
  tronVip:    "TVipTraderTron1111111111111111111111111",
};

// =============================================================================
// COLLECTION: swap_events
// =============================================================================

print("[mongo-seed] Inserting swap_events...");

const swapEvents = [];

// ── EVM swaps — AXQ/USDT (most common pair) ───────────────────────────────────
for (let i = 1; i <= 50; i++) {
  swapEvents.push({
    txHash:      `0xtx_evm_axq_usdt_${String(i).padStart(4,"0")}`,
    blockNumber: 12340000 + i * 10,
    logIndex:    0,
    tokenIn:     i % 2 === 0 ? AXQ_EVM : USDT_EVM,
    tokenOut:    i % 2 === 0 ? USDT_EVM : AXQ_EVM,
    amountIn:    i % 2 === 0 ? randAXQ(100, 5000) : randUSDT(1890, 94500),
    amountOut:   i % 2 === 0 ? randUSDT(1890, 94500) : randAXQ(100, 5000),
    trader:      [traders.vip, traders.t2, traders.t1, traders.mena][i % 4],
    poolAddress: "0xPool_AXQ_USDT_EVM_000000000000000000001",
    priceImpactBps: ri(1, 80),
    feeBps:      30,
    chain:       "evm",
    blockTimestamp: ago(i * 15),  // một swap mỗi 15 phút
    indexedAt:   ago(i * 15 - 1),
  });
}

// ── EVM swaps — AXQ/USDC ─────────────────────────────────────────────────────
for (let i = 1; i <= 20; i++) {
  swapEvents.push({
    txHash:      `0xtx_evm_axq_usdc_${String(i).padStart(4,"0")}`,
    blockNumber: 12341000 + i * 8,
    logIndex:    1,
    tokenIn:     USDC_EVM,
    tokenOut:    AXQ_EVM,
    amountIn:    randUSDT(500, 20000),
    amountOut:   randAXQ(26, 1058),
    trader:      [traders.vip, traders.sg][i % 2],
    poolAddress: "0xPool_AXQ_USDC_EVM_000000000000000000002",
    priceImpactBps: ri(1, 50),
    feeBps:      30,
    chain:       "evm",
    blockTimestamp: ago(i * 22),
    indexedAt:   ago(i * 22 - 1),
  });
}

// ── EVM large OTC swap (MENA — 50,000 AXQ → AED equivalent USDT) ────────────
swapEvents.push({
  txHash:      "0xtx_evm_otc_mena_large_001",
  blockNumber: 12345678,
  logIndex:    0,
  tokenIn:     AXQ_EVM,
  tokenOut:    USDT_EVM,
  amountIn:    "50000000000000",   // 50,000 AXQ
  amountOut:   "945000000000",     // 945,000 USDT (~$18.9/AXQ)
  trader:      traders.mena,
  poolAddress: "0xPool_AXQ_USDT_EVM_000000000000000000001",
  priceImpactBps: 350,             // large trade, high impact
  feeBps:      25,                 // enterprise rate
  chain:       "evm",
  blockTimestamp: ago(72 * 60),   // 3 days ago
  indexedAt:   ago(72 * 60 - 1),
});

// ── Solana swaps — AMM DEX ────────────────────────────────────────────────────
for (let i = 1; i <= 30; i++) {
  swapEvents.push({
    txHash:      `SoLSwApTx${String(i).padStart(5,"0")}SiGnAtUrE1111111111111111111111111111`,
    blockNumber: 290000000 + i * 100,  // Solana slot
    logIndex:    null,
    tokenIn:     i % 3 === 0 ? USDT_SOL : AXQ_SOL,
    tokenOut:    i % 3 === 0 ? AXQ_SOL  : USDT_SOL,
    amountIn:    i % 3 === 0 ? randUSDT(200, 10000) : randAXQ(10, 500),
    amountOut:   i % 3 === 0 ? randAXQ(10, 500) : randUSDT(200, 10000),
    trader:      [traders.solanaVip, traders.solanaT2][i % 2],
    poolAddress: "SoLPoolAMMswap1111111111111111111111111111",
    priceImpactBps: ri(2, 120),
    feeBps:      25,
    chain:       "solana",
    blockTimestamp: ago(i * 20),
    indexedAt:   ago(i * 20 - 1),
  });
}

// ── Tron swaps ────────────────────────────────────────────────────────────────
for (let i = 1; i <= 10; i++) {
  swapEvents.push({
    txHash:      `TRoNtX${String(i).padStart(5,"0")}hAsH111111111111111111111111111111111111`,
    blockNumber: 65000000 + i * 50,
    logIndex:    null,
    tokenIn:     USDT_TRON,
    tokenOut:    AXQ_TRON,
    amountIn:    randUSDT(100, 5000),
    amountOut:   randAXQ(5, 265),
    trader:      traders.tronVip,
    poolAddress: "TRoNpOoL1111111111111111111111111111111111",
    priceImpactBps: ri(5, 200),
    feeBps:      30,
    chain:       "tron",
    blockTimestamp: ago(i * 45),
    indexedAt:   ago(i * 45 - 1),
  });
}

// ── Failed/high-slippage EVM swap (test edge case) ────────────────────────────
swapEvents.push({
  txHash:      "0xtx_evm_high_impact_reverted_edge",
  blockNumber: 12350000,
  logIndex:    2,
  tokenIn:     AXQ_EVM,
  tokenOut:    USDT_EVM,
  amountIn:    randAXQ(10000, 50000),
  amountOut:   "1",                 // near-zero output (edge case)
  trader:      traders.t1,
  poolAddress: "0xPool_AXQ_USDT_EVM_000000000000000000001",
  priceImpactBps: 9500,             // 95% impact — suspicious
  feeBps:      30,
  chain:       "evm",
  blockTimestamp: ago(5 * 60),
  indexedAt:   ago(5 * 60 - 1),
});

// Bulk insert with dedup
for (const doc of swapEvents) {
  db.swap_events.updateOne(
    { txHash: doc.txHash },
    { $setOnInsert: doc },
    { upsert: true }
  );
}
print(`[mongo-seed] swap_events: ${swapEvents.length} records inserted/skipped`);

// =============================================================================
// COLLECTION: reserve_snapshots
// =============================================================================

print("[mongo-seed] Inserting reserve_snapshots...");

const reserveSnapshots = [];

// 30 ngày lịch sử — mỗi 6 giờ 1 snapshot (120 snapshots)
for (let i = 0; i < 120; i++) {
  const daysAgo      = (120 - i) * 6 / 24;  // in days
  const baseReserve  = 8000000 + Math.random() * 2000000;
  const supply       = (500000000 + i * 25000) * 1_000_000_000;
  const ratio        = 1.05 + Math.random() * 0.20;
  reserveSnapshots.push({
    blockNumber:           12300000 + i * 1800,
    txHash:                `0xtx_reserve_snapshot_${String(i).padStart(4,"0")}`,
    totalReserveUsd:       Math.round(baseReserve * 100) / 100,
    axvnCirculatingSupply: supply.toString(),
    backingRatio:          Math.round(ratio * 1_000_000) / 1_000_000,
    source:                "on-chain",
    snapshotTs:            new Date(now.getTime() - daysAgo * 86400000),
    indexedAt:             new Date(now.getTime() - daysAgo * 86400000 + 60000),
  });
}

// ── Snapshot nguy hiểm — backing ratio < 1.0 (test CRITICAL alert) ───────────
reserveSnapshots.push({
  blockNumber:           12320000,
  txHash:                "0xtx_reserve_critical_warning_007",
  totalReserveUsd:       7200000,
  axvnCirculatingSupply: "500000000000000000",
  backingRatio:          0.96,
  source:                "manual",
  snapshotTs:            ago(7 * 24 * 60),
  indexedAt:             ago(7 * 24 * 60 - 2),
});

// ── Snapshot phục hồi sau warning ─────────────────────────────────────────────
reserveSnapshots.push({
  blockNumber:           12322000,
  txHash:                "0xtx_reserve_recovery_after_007",
  totalReserveUsd:       8500000,
  axvnCirculatingSupply: "500000000000000000",
  backingRatio:          1.08,
  source:                "on-chain",
  snapshotTs:            ago(7 * 24 * 60 - 60), // 1 giờ sau khi critical
  indexedAt:             ago(7 * 24 * 60 - 61),
});

for (const doc of reserveSnapshots) {
  db.reserve_snapshots.updateOne(
    { txHash: doc.txHash },
    { $setOnInsert: doc },
    { upsert: true }
  );
}
print(`[mongo-seed] reserve_snapshots: ${reserveSnapshots.length} records inserted/skipped`);

// =============================================================================
// COLLECTION: bridge_relay_events
// =============================================================================

print("[mongo-seed] Inserting bridge_relay_events...");

const bridgeEvents = [
  // ── CONFIRMED — SWIFT MT103 inbound → mint AXQ on EVM ─────────────────────
  {
    swiftMessageId:  "cccc0000-0000-0000-0000-000000000001",
    uetr:            "uetr-0001-0001-0001-0001-000000000001",
    direction:       "SWIFT_TO_CHAIN",
    chain:           "evm",
    contractAddress: "0x0000000000000000000000000000000000000003",
    txHash:          "0xtx_bridge_swift_to_chain_001",
    blockNumber:     12345677,
    amountUsd:       9450000,
    fxRateVnd:       25200.50,
    feeBps:          10,
    status:          "CONFIRMED",
    errorMessage:    null,
    retryCount:      0,
    submittedAt:     ago(3 * 24 * 60 - 15),
    confirmedAt:     ago(3 * 24 * 60 - 30),
    indexedAt:       ago(3 * 24 * 60 - 31),
  },

  // ── CONFIRMED — EVM burn → SWIFT MT103 outbound (CHAIN_TO_SWIFT) ──────────
  {
    swiftMessageId:  "cccc0000-0000-0000-0000-000000000005",
    uetr:            "uetr-0005-0005-0005-0005-000000000005",
    direction:       "CHAIN_TO_SWIFT",
    chain:           "evm",
    contractAddress: "0x0000000000000000000000000000000000000003",
    txHash:          "0xtx_bridge_chain_to_swift_005",
    blockNumber:     12349900,
    amountUsd:       200000,
    fxRateVnd:       25185.00,
    feeBps:          10,
    status:          "CONFIRMED",
    errorMessage:    null,
    retryCount:      0,
    submittedAt:     ago(6 * 60 + 10),
    confirmedAt:     ago(6 * 60),
    indexedAt:       ago(5 * 60 + 59),
  },

  // ── SUBMITTED — đang chờ EVM confirmation ─────────────────────────────────
  {
    swiftMessageId:  "cccc0000-0000-0000-0000-000000000003",
    uetr:            "uetr-0003-0003-0003-0003-000000000003",
    direction:       "SWIFT_TO_CHAIN",
    chain:           "evm",
    contractAddress: "0x0000000000000000000000000000000000000003",
    txHash:          "0xtx_bridge_submitted_003",
    blockNumber:     null,
    amountUsd:       5000000,
    fxRateVnd:       25180.75,
    feeBps:          10,
    status:          "SUBMITTED",
    errorMessage:    null,
    retryCount:      0,
    submittedAt:     ago(24 * 60 - 65),
    confirmedAt:     null,
    indexedAt:       ago(24 * 60 - 66),
  },

  // ── PENDING — chưa submit (đang đợi FX rate) ──────────────────────────────
  {
    swiftMessageId:  "cccc0000-0000-0000-0000-000000000002",
    uetr:            "uetr-0002-0002-0002-0002-000000000002",
    direction:       "CHAIN_TO_SWIFT",
    chain:           "evm",
    contractAddress: "0x0000000000000000000000000000000000000003",
    txHash:          null,
    blockNumber:     null,
    amountUsd:       10000,
    fxRateVnd:       null,
    feeBps:          10,
    status:          "PENDING",
    errorMessage:    null,
    retryCount:      0,
    submittedAt:     null,
    confirmedAt:     null,
    indexedAt:       ago(10),
  },

  // ── FAILED — RPC timeout, 2 retries ───────────────────────────────────────
  {
    swiftMessageId:  "cccc0000-0000-0000-0000-000000000004",
    uetr:            "uetr-0004-0004-0004-0004-000000000004",
    direction:       "SWIFT_TO_CHAIN",
    chain:           "evm",
    contractAddress: "0x0000000000000000000000000000000000000003",
    txHash:          null,
    blockNumber:     null,
    amountUsd:       1000000,
    fxRateVnd:       25000.00,
    feeBps:          10,
    status:          "FAILED",
    errorMessage:    "EVM RPC timeout after 30s — gas estimation failed",
    retryCount:      2,
    submittedAt:     ago(4 * 24 * 60 - 1),
    confirmedAt:     null,
    indexedAt:       ago(4 * 24 * 60),
  },

  // ── REVERTED — contract rejected (insufficient reserve) ───────────────────
  {
    swiftMessageId:  null,
    uetr:            null,
    direction:       "SWIFT_TO_CHAIN",
    chain:           "evm",
    contractAddress: "0x0000000000000000000000000000000000000003",
    txHash:          "0xtx_bridge_reverted_reserve_006",
    blockNumber:     12310000,
    amountUsd:       15000000,
    fxRateVnd:       25200.00,
    feeBps:          10,
    status:          "REVERTED",
    errorMessage:    "execution reverted: InsufficientReserve() — mint would drop backing ratio below 100%",
    retryCount:      0,
    submittedAt:     ago(8 * 24 * 60),
    confirmedAt:     null,
    indexedAt:       ago(8 * 24 * 60 - 1),
  },

  // ── Solana bridge (INBOUND, CONFIRMED) ────────────────────────────────────
  {
    swiftMessageId:  null,
    uetr:            "uetr-sol-0007-0007-0007-000000000007",
    direction:       "SWIFT_TO_CHAIN",
    chain:           "solana",
    contractAddress: "SWIFTBriDGePrOgRaMsOLmInT111111111111111",
    txHash:          "SoLBriDgeTx001111111111111111111111111111111111111111111111",
    blockNumber:     290100000,
    amountUsd:       500000,
    fxRateVnd:       25150.00,
    feeBps:          10,
    status:          "CONFIRMED",
    errorMessage:    null,
    retryCount:      0,
    submittedAt:     ago(2 * 24 * 60 + 5),
    confirmedAt:     ago(2 * 24 * 60),
    indexedAt:       ago(2 * 24 * 60 - 1),
  },
];

for (const doc of bridgeEvents) {
  const filter = doc.uetr
    ? { uetr: doc.uetr }
    : { txHash: doc.txHash, direction: doc.direction, status: doc.status };
  db.bridge_relay_events.updateOne(
    filter,
    { $setOnInsert: { ...doc, indexedAt: doc.indexedAt || new Date() } },
    { upsert: true }
  );
}
print(`[mongo-seed] bridge_relay_events: ${bridgeEvents.length} records inserted/skipped`);

// =============================================================================
// SUMMARY
// =============================================================================
print("══════════════════════════════════════════════════════");
print("  AXQ Wikialisa — MongoDB Seed Complete");
print("══════════════════════════════════════════════════════");
print(`  swap_events:         ${db.swap_events.countDocuments()}`);
print(`    - evm:             ${db.swap_events.countDocuments({chain:"evm"})}`);
print(`    - solana:          ${db.swap_events.countDocuments({chain:"solana"})}`);
print(`    - tron:            ${db.swap_events.countDocuments({chain:"tron"})}`);
print(`  reserve_snapshots:   ${db.reserve_snapshots.countDocuments()}`);
print(`    - on-chain:        ${db.reserve_snapshots.countDocuments({source:"on-chain"})}`);
print(`    - manual:          ${db.reserve_snapshots.countDocuments({source:"manual"})}`);
print(`  bridge_relay_events: ${db.bridge_relay_events.countDocuments()}`);
print(`    - CONFIRMED:       ${db.bridge_relay_events.countDocuments({status:"CONFIRMED"})}`);
print(`    - PENDING:         ${db.bridge_relay_events.countDocuments({status:"PENDING"})}`);
print(`    - SUBMITTED:       ${db.bridge_relay_events.countDocuments({status:"SUBMITTED"})}`);
print(`    - FAILED:          ${db.bridge_relay_events.countDocuments({status:"FAILED"})}`);
print(`    - REVERTED:        ${db.bridge_relay_events.countDocuments({status:"REVERTED"})}`);
print("══════════════════════════════════════════════════════");
