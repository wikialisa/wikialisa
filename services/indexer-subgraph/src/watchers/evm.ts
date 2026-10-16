/**
 * watchers/evm.ts
 * Watch EVM App-Chain events: ReserveUpdated + Swap
 * Tự động reconnect sau khi RPC mất kết nối (exponential backoff).
 */

import {
  createPublicClient,
  http,
  parseAbiItem,
  type Log,
  type AbiEvent,
  type PublicClient,
} from "viem";
import { APPCHAIN_RPC_MAINNET, EVM_CONTRACTS } from "@wikialisa/config";
import type { ReserveSnapshot, SubgraphSwapEvent } from "@wikialisa/types";
import { upsertSwapEvent, upsertReserveSnapshot } from "@wikialisa/mongo-db";
import type { FastifyBaseLogger } from "fastify";

// ─── ABIs ─────────────────────────────────────────────────────────────────────

const RESERVE_UPDATED_ABI = parseAbiItem(
  "event ReserveUpdated(uint256 totalReserveUsd, uint256 axvnCirculatingSupply, uint256 backingRatio)"
) as AbiEvent;

const SWAP_ABI = parseAbiItem(
  "event Swap(address indexed trader, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)"
) as AbiEvent;

// ─── Reconnect config ─────────────────────────────────────────────────────────

const MAX_RETRIES   = 10;
const BASE_DELAY_MS = 2_000;
const MAX_DELAY_MS  = 60_000;

function backoff(attempt: number): number {
  return Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
}

// ─── EVM Watcher class ────────────────────────────────────────────────────────

export class EvmWatcher {
  private client: PublicClient;
  private unwatchReserve: (() => void) | null = null;
  private unwatchSwap: (() => void) | null = null;
  private running = false;

  constructor(private readonly log: FastifyBaseLogger) {
    this.client = createPublicClient({
      transport: http(process.env["APPCHAIN_RPC"] ?? APPCHAIN_RPC_MAINNET),
    });
  }

  /** Start both EVM watchers. Retries on failure. */
  async start(): Promise<void> {
    this.running = true;
    await this._startWithRetry(0);
  }

  /** Gracefully stop all watchers. */
  stop(): void {
    this.running = false;
    this.unwatchReserve?.();
    this.unwatchSwap?.();
    this.unwatchReserve = null;
    this.unwatchSwap = null;
    this.log.info("[evm-watcher] Stopped");
  }

  private async _startWithRetry(attempt: number): Promise<void> {
    try {
      await this._watchAll();
    } catch (err: unknown) {
      if (!this.running) return;
      const delay = backoff(attempt);
      this.log.warn(
        { err, attempt, nextRetryMs: delay },
        "[evm-watcher] Connection failed, retrying…"
      );
      if (attempt >= MAX_RETRIES) {
        this.log.error("[evm-watcher] Max retries reached, giving up");
        return;
      }
      await new Promise((r) => setTimeout(r, delay));
      await this._startWithRetry(attempt + 1);
    }
  }

  private async _watchAll(): Promise<void> {
    this.log.info(
      { rpc: process.env["APPCHAIN_RPC"] ?? APPCHAIN_RPC_MAINNET },
      "[evm-watcher] Starting EVM event watchers…"
    );

    // ── ReserveUpdated ────────────────────────────────────────────────────────
    this.unwatchReserve = (this.client.watchEvent as any)({
      address: EVM_CONTRACTS.PROOF_RESERVE as `0x${string}`,
      event:   RESERVE_UPDATED_ABI,
      onLogs:  async (logs: Log[]) => {
        for (const log of logs) {
          const args = (log as any).args as {
            totalReserveUsd: bigint;
            axvnCirculatingSupply: bigint;
            backingRatio: bigint;
          };
          const snapshot: ReserveSnapshot & { blockNumber?: number; txHash?: string } = {
            timestamp:             new Date().toISOString(),
            totalReserveUsd:       Number(args.totalReserveUsd) / 1e6,
            axvnCirculatingSupply: args.axvnCirculatingSupply,
            backingRatio:          Number(args.backingRatio) / 1e6,
            blockNumber:           Number(log.blockNumber ?? 0),
            txHash:                log.transactionHash ?? undefined,
          };
          this.log.info(
            { backingRatio: snapshot.backingRatio, usd: snapshot.totalReserveUsd },
            "[evm-watcher] ReserveUpdated"
          );
          try {
            await upsertReserveSnapshot(snapshot);
          } catch (err) {
            this.log.error({ err }, "[evm-watcher] Failed to persist reserve snapshot");
          }
        }
      },
      onError: (err: Error) => {
        this.log.error({ err }, "[evm-watcher] ReserveUpdated watch error");
      },
    });

    // ── Swap ──────────────────────────────────────────────────────────────────
    this.unwatchSwap = (this.client.watchEvent as any)({
      event:  SWAP_ABI,
      onLogs: async (logs: Log[]) => {
        for (const log of logs) {
          const args = (log as any).args as {
            trader: string;
            tokenIn: string;
            tokenOut: string;
            amountIn: bigint;
            amountOut: bigint;
          };
          const event: SubgraphSwapEvent & { chain: "evm"; logIndex?: number } = {
            txHash:      log.transactionHash ?? "",
            blockNumber: Number(log.blockNumber ?? 0),
            logIndex:    log.logIndex ?? undefined,
            tokenIn:     args.tokenIn,
            tokenOut:    args.tokenOut,
            amountIn:    args.amountIn,
            amountOut:   args.amountOut,
            trader:      args.trader,
            chain:       "evm",
          };
          this.log.info(
            { txHash: event.txHash, trader: event.trader },
            "[evm-watcher] Swap"
          );
          try {
            await upsertSwapEvent(event);
          } catch (err) {
            this.log.error({ err }, "[evm-watcher] Failed to persist swap event");
          }
        }
      },
      onError: (err: Error) => {
        this.log.error({ err }, "[evm-watcher] Swap watch error");
      },
    });

    this.log.info("[evm-watcher] Both EVM watchers active");
  }
}
