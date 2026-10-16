/**
 * watchers/solana.ts
 * Watch Solana on-chain events via WebSocket log subscription:
 *   - AMM_SWAP program → swap_events (chain: "solana")
 *   - TREASURY_RBS program → reserve_snapshots (periodic)
 *
 * Uses @solana/web3.js onLogs subscription with auto-reconnect.
 */

import {
  Connection,
  PublicKey,
  type LogsCallback,
  type Logs,
} from "@solana/web3.js";
import { SOLANA_RPC_MAINNET, PROGRAM_IDS } from "@wikialisa/config";
import { upsertSwapEvent } from "@wikialisa/mongo-db";
import type { FastifyBaseLogger } from "fastify";

// ─── Reconnect config ─────────────────────────────────────────────────────────

const MAX_RETRIES   = 10;
const BASE_DELAY_MS = 3_000;
const MAX_DELAY_MS  = 60_000;

function backoff(attempt: number): number {
  return Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
}

// ─── Log parser ───────────────────────────────────────────────────────────────

/**
 * Parse a Solana program log line emitted by the AMM_SWAP program.
 * Expected format: "Program log: SWAP:<txHash>:<tokenIn>:<tokenOut>:<amountIn>:<amountOut>:<trader>"
 * (adjust to the actual program log format)
 */
function parseSwapLog(log: string): {
  txHash:    string;
  tokenIn:   string;
  tokenOut:  string;
  amountIn:  bigint;
  amountOut: bigint;
  trader:    string;
} | null {
  const prefix = "Program log: SWAP:";
  if (!log.startsWith(prefix)) return null;
  const parts = log.slice(prefix.length).split(":");
  if (parts.length < 7) return null;
  const [txHash, tokenIn, tokenOut, amountIn, amountOut, trader] = parts;
  try {
    return {
      txHash:    txHash!,
      tokenIn:   tokenIn!,
      tokenOut:  tokenOut!,
      amountIn:  BigInt(amountIn!),
      amountOut: BigInt(amountOut!),
      trader:    trader!,
    };
  } catch {
    return null;
  }
}

// ─── Solana Watcher class ─────────────────────────────────────────────────────

export class SolanaWatcher {
  private connection: Connection | null = null;
  private subscriptionId: number | null = null;
  private running = false;

  constructor(private readonly log: FastifyBaseLogger) {}

  async start(): Promise<void> {
    this.running = true;
    await this._startWithRetry(0);
  }

  stop(): void {
    this.running = false;
    this._cleanup();
    this.log.info("[solana-watcher] Stopped");
  }

  private _cleanup(): void {
    if (this.connection && this.subscriptionId !== null) {
      this.connection
        .removeOnLogsListener(this.subscriptionId)
        .catch(() => {});
      this.subscriptionId = null;
    }
    this.connection = null;
  }

  private async _startWithRetry(attempt: number): Promise<void> {
    try {
      await this._subscribe();
    } catch (err: unknown) {
      if (!this.running) return;
      this._cleanup();
      const delay = backoff(attempt);
      this.log.warn(
        { err, attempt, nextRetryMs: delay },
        "[solana-watcher] Connection failed, retrying…"
      );
      if (attempt >= MAX_RETRIES) {
        this.log.error("[solana-watcher] Max retries reached, giving up");
        return;
      }
      await new Promise((r) => setTimeout(r, delay));
      await this._startWithRetry(attempt + 1);
    }
  }

  private async _subscribe(): Promise<void> {
    const rpc = process.env["SOLANA_RPC"] ?? SOLANA_RPC_MAINNET;
    // Use wss:// for subscriptions; fallback https → wss
    const wsRpc = rpc.replace(/^https?:\/\//, "wss://");

    this.log.info({ rpc: wsRpc }, "[solana-watcher] Connecting to Solana WS…");

    this.connection = new Connection(wsRpc, "confirmed");
    const programId = new PublicKey(PROGRAM_IDS.AMM_SWAP);

    const callback: LogsCallback = async (logs: Logs, ctx) => {
      if (logs.err) return; // skip failed transactions

      for (const logLine of logs.logs) {
        const parsed = parseSwapLog(logLine);
        if (!parsed) continue;

        this.log.info(
          { txHash: logs.signature, trader: parsed.trader },
          "[solana-watcher] Swap"
        );

        try {
          await upsertSwapEvent({
            txHash:      logs.signature,
            blockNumber: ctx.slot,
            tokenIn:     parsed.tokenIn,
            tokenOut:    parsed.tokenOut,
            amountIn:    parsed.amountIn,
            amountOut:   parsed.amountOut,
            trader:      parsed.trader,
            chain:       "solana",
          });
        } catch (err) {
          this.log.error({ err }, "[solana-watcher] Failed to persist swap event");
        }
      }
    };

    this.subscriptionId = this.connection.onLogs(
      programId,
      callback,
      "confirmed"
    );

    this.log.info(
      { subscriptionId: this.subscriptionId, program: PROGRAM_IDS.AMM_SWAP },
      "[solana-watcher] Subscribed to AMM_SWAP logs"
    );
  }
}
