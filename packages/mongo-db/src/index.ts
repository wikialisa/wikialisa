/**
 * @wikialisa/mongo-db
 *
 * Shared Mongoose connection pool and typed document schemas for on-chain
 * event storage used by the indexer-subgraph service.
 *
 * Collections:
 *   - swap_events          — DEX swap events (EVM / Solana / Tron)
 *   - reserve_snapshots    — ProofOfReserve on-chain snapshots
 *   - bridge_relay_events  — SWIFT ↔ chain bridge relay records
 */

import mongoose, {
  Schema,
  model,
  type Document,
  type Model,
  type ConnectOptions,
} from "mongoose";

import type { ReserveSnapshot, SubgraphSwapEvent } from "@wikialisa/types";

// ─── Connection ───────────────────────────────────────────────────────────────

let _connected = false;

/**
 * Connect to MongoDB using MONGODB_URI env var.
 * Safe to call multiple times — idempotent after first connection.
 */
export async function connectMongo(uri?: string): Promise<void> {
  if (_connected || mongoose.connection.readyState === 1) {
    return;
  }

  const connectionString = uri ?? process.env["MONGODB_URI"];
  if (!connectionString) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const opts: ConnectOptions = {
    dbName: process.env["MONGODB_DBNAME"] ?? "wikialisa_indexer",
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5_000,
    socketTimeoutMS: 45_000,
  };

  await mongoose.connect(connectionString, opts);
  _connected = true;

  mongoose.connection.on("disconnected", () => {
    _connected = false;
    console.warn("[mongo-db] Disconnected from MongoDB");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[mongo-db] MongoDB connection error:", err.message);
  });
}

/**
 * Gracefully close the MongoDB connection.
 * Call during process shutdown.
 */
export async function closeMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    _connected = false;
  }
}

/**
 * Returns true if the connection is currently established.
 */
export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// ─── Schema: swap_events ──────────────────────────────────────────────────────

export interface ISwapEvent extends Document {
  txHash:          string;
  blockNumber:     number;
  logIndex:        number | null;
  tokenIn:         string;
  tokenOut:        string;
  amountIn:        string;   // stored as string to preserve BigInt precision
  amountOut:       string;
  trader:          string;
  poolAddress:     string | null;
  priceImpactBps:  number | null;
  feeBps:          number | null;
  chain:           "evm" | "solana" | "tron";
  blockTimestamp:  Date | null;
  indexedAt:       Date;
}

const SwapEventSchema = new Schema<ISwapEvent>(
  {
    txHash:         { type: String, required: true, unique: true, index: true },
    blockNumber:    { type: Number, required: true, index: true },
    logIndex:       { type: Number, default: null },
    tokenIn:        { type: String, required: true, index: true },
    tokenOut:       { type: String, required: true, index: true },
    amountIn:       { type: String, required: true },
    amountOut:      { type: String, required: true },
    trader:         { type: String, required: true, index: true },
    poolAddress:    { type: String, default: null },
    priceImpactBps: { type: Number, default: null },
    feeBps:         { type: Number, default: null },
    chain: {
      type: String,
      enum: ["evm", "solana", "tron"],
      default: "evm",
      index: true,
    },
    blockTimestamp: { type: Date, default: null },
    indexedAt:      { type: Date, default: () => new Date(), index: true },
  },
  {
    collection: "swap_events",
    timestamps: false, // indexedAt is explicit
    versionKey: false,
  }
);

// Compound index for range queries
SwapEventSchema.index({ chain: 1, blockNumber: -1 });
SwapEventSchema.index({ trader: 1, indexedAt: -1 });
SwapEventSchema.index({ tokenIn: 1, tokenOut: 1, indexedAt: -1 });

export const SwapEventModel: Model<ISwapEvent> =
  mongoose.models["SwapEvent"] ??
  model<ISwapEvent>("SwapEvent", SwapEventSchema);

// ─── Schema: reserve_snapshots ────────────────────────────────────────────────

export interface IReserveSnapshot extends Document {
  blockNumber:           number | null;
  txHash:                string | null;
  totalReserveUsd:       number;
  axvnCirculatingSupply: string;   // BigInt as string
  backingRatio:          number;
  source:                "on-chain" | "manual" | "snapshot";
  snapshotTs:            Date;
  indexedAt:             Date;
}

const ReserveSnapshotSchema = new Schema<IReserveSnapshot>(
  {
    blockNumber:           { type: Number, default: null, index: true },
    txHash:                { type: String, default: null, sparse: true, unique: true },
    totalReserveUsd:       { type: Number, required: true },
    axvnCirculatingSupply: { type: String, required: true },
    backingRatio:          { type: Number, required: true },
    source: {
      type: String,
      enum: ["on-chain", "manual", "snapshot"],
      default: "on-chain",
    },
    snapshotTs: { type: Date, required: true, index: true },
    indexedAt:  { type: Date, default: () => new Date() },
  },
  {
    collection: "reserve_snapshots",
    timestamps: false,
    versionKey: false,
  }
);

ReserveSnapshotSchema.index({ snapshotTs: -1 });

export const ReserveSnapshotModel: Model<IReserveSnapshot> =
  mongoose.models["ReserveSnapshot"] ??
  model<IReserveSnapshot>("ReserveSnapshot", ReserveSnapshotSchema);

// ─── Schema: bridge_relay_events ─────────────────────────────────────────────

export interface IBridgeRelayEvent extends Document {
  swiftMessageId:  string | null;   // UUID from swift.messages
  uetr:            string | null;   // ISO 20022 UETR
  direction:       "SWIFT_TO_CHAIN" | "CHAIN_TO_SWIFT";
  chain:           "evm" | "solana";
  contractAddress: string | null;
  txHash:          string | null;
  blockNumber:     number | null;
  amountUsd:       number | null;
  fxRateVnd:       number | null;
  feeBps:          number;
  status:          "PENDING" | "SUBMITTED" | "CONFIRMED" | "FAILED" | "REVERTED";
  errorMessage:    string | null;
  retryCount:      number;
  submittedAt:     Date | null;
  confirmedAt:     Date | null;
  indexedAt:       Date;
}

const BridgeRelayEventSchema = new Schema<IBridgeRelayEvent>(
  {
    swiftMessageId:  { type: String, default: null, index: true },
    uetr:            { type: String, default: null, sparse: true },
    direction: {
      type: String,
      enum: ["SWIFT_TO_CHAIN", "CHAIN_TO_SWIFT"],
      required: true,
      index: true,
    },
    chain: {
      type: String,
      enum: ["evm", "solana"],
      default: "evm",
    },
    contractAddress: { type: String, default: null },
    txHash:          { type: String, default: null, sparse: true },
    blockNumber:     { type: Number, default: null },
    amountUsd:       { type: Number, default: null },
    fxRateVnd:       { type: Number, default: null },
    feeBps:          { type: Number, default: 10 },
    status: {
      type: String,
      enum: ["PENDING", "SUBMITTED", "CONFIRMED", "FAILED", "REVERTED"],
      default: "PENDING",
      index: true,
    },
    errorMessage: { type: String, default: null },
    retryCount:   { type: Number, default: 0 },
    submittedAt:  { type: Date, default: null },
    confirmedAt:  { type: Date, default: null },
    indexedAt:    { type: Date, default: () => new Date(), index: true },
  },
  {
    collection: "bridge_relay_events",
    timestamps: false,
    versionKey: false,
  }
);

BridgeRelayEventSchema.index({ status: 1, indexedAt: -1 });
BridgeRelayEventSchema.index({ txHash: 1 }, { sparse: true });

export const BridgeRelayEventModel: Model<IBridgeRelayEvent> =
  mongoose.models["BridgeRelayEvent"] ??
  model<IBridgeRelayEvent>("BridgeRelayEvent", BridgeRelayEventSchema);

// ─── Helper: upsert swap event ────────────────────────────────────────────────

/**
 * Upsert a swap event by txHash.
 * Silently ignores duplicates (idempotent indexing).
 */
export async function upsertSwapEvent(
  event: SubgraphSwapEvent & {
    logIndex?: number;
    poolAddress?: string;
    priceImpactBps?: number;
    feeBps?: number;
    chain?: "evm" | "solana" | "tron";
    blockTimestamp?: string | Date;
  }
): Promise<ISwapEvent> {
  const doc = await SwapEventModel.findOneAndUpdate(
    { txHash: event.txHash },
    {
      $setOnInsert: {
        txHash:         event.txHash,
        blockNumber:    event.blockNumber,
        logIndex:       event.logIndex ?? null,
        tokenIn:        event.tokenIn,
        tokenOut:       event.tokenOut,
        amountIn:       event.amountIn.toString(),
        amountOut:      event.amountOut.toString(),
        trader:         event.trader,
        poolAddress:    event.poolAddress ?? null,
        priceImpactBps: event.priceImpactBps ?? null,
        feeBps:         event.feeBps ?? null,
        chain:          event.chain ?? "evm",
        blockTimestamp: event.blockTimestamp
          ? new Date(event.blockTimestamp as string)
          : null,
        indexedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );
  return doc!;
}

// ─── Helper: upsert reserve snapshot ─────────────────────────────────────────

/**
 * Upsert a reserve snapshot.
 * Deduplicates on txHash when present, otherwise always inserts.
 */
export async function upsertReserveSnapshot(
  snapshot: ReserveSnapshot & {
    blockNumber?: number;
    txHash?: string;
  }
): Promise<IReserveSnapshot> {
  const filter = snapshot.txHash
    ? { txHash: snapshot.txHash }
    : { _id: new mongoose.Types.ObjectId() }; // always insert if no txHash

  const doc = await ReserveSnapshotModel.findOneAndUpdate(
    filter,
    {
      $setOnInsert: {
        blockNumber:           snapshot.blockNumber ?? null,
        txHash:                snapshot.txHash ?? null,
        totalReserveUsd:       snapshot.totalReserveUsd,
        axvnCirculatingSupply: snapshot.axvnCirculatingSupply.toString(),
        backingRatio:          snapshot.backingRatio,
        source:                "on-chain",
        snapshotTs:            new Date(snapshot.timestamp),
        indexedAt:             new Date(),
      },
    },
    { upsert: true, new: true }
  );
  return doc!;
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export { mongoose };
