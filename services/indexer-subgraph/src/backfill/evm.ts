/**
 * backfill/evm.ts
 * Historical backfill: fetch past EVM logs in block ranges and persist to MongoDB.
 * Called via POST /backfill/evm — runs in background.
 */

import {
  createPublicClient,
  http,
  parseAbiItem,
  type AbiEvent,
  type Log,
} from "viem";
import { APPCHAIN_RPC_MAINNET, EVM_CONTRACTS } from "@wikialisa/config";
import { upsertSwapEvent, upsertReserveSnapshot } from "@wikialisa/mongo-db";
import type { FastifyBaseLogger } from "fastify";

const RESERVE_ABI = parseAbiItem(
  "event ReserveUpdated(uint256 totalReserveUsd, uint256 axvnCirculatingSupply, uint256 backingRatio)"
) as AbiEvent;

const SWAP_ABI = parseAbiItem(
  "event Swap(address indexed trader, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)"
) as AbiEvent;

const CHUNK_SIZE = 2_000n; // blocks per getLogs call

export async function runEvmBackfill(opts: {
  fromBlock?: number;
  toBlock?: number;
  log: FastifyBaseLogger;
}): Promise<void> {
  const { log } = opts;

  const client = createPublicClient({
    transport: http(process.env["APPCHAIN_RPC"] ?? APPCHAIN_RPC_MAINNET),
  });

  const latestBlock = await client.getBlockNumber();
  const from = BigInt(opts.fromBlock ?? Number(latestBlock) - 10_000);
  const to   = BigInt(opts.toBlock   ?? Number(latestBlock));

  log.info({ from: from.toString(), to: to.toString() }, "[backfill/evm] Starting EVM backfill");

  let swapCount    = 0;
  let reserveCount = 0;

  for (let start = from; start <= to; start += CHUNK_SIZE) {
    const end = start + CHUNK_SIZE - 1n < to ? start + CHUNK_SIZE - 1n : to;

    // ── Swap events ───────────────────────────────────────────────────────────
    const swapLogs = await client.getLogs({
      event:     SWAP_ABI,
      fromBlock: start,
      toBlock:   end,
    });

    for (const log_ of swapLogs as Log[]) {
      const args = (log_ as any).args as {
        trader: string; tokenIn: string; tokenOut: string;
        amountIn: bigint; amountOut: bigint;
      };
      await upsertSwapEvent({
        txHash:      log_.transactionHash ?? "",
        blockNumber: Number(log_.blockNumber ?? 0),
        logIndex:    log_.logIndex ?? undefined,
        tokenIn:     args.tokenIn,
        tokenOut:    args.tokenOut,
        amountIn:    args.amountIn,
        amountOut:   args.amountOut,
        trader:      args.trader,
        chain:       "evm",
      });
      swapCount++;
    }

    // ── Reserve events ────────────────────────────────────────────────────────
    const reserveLogs = await client.getLogs({
      address:   EVM_CONTRACTS.PROOF_RESERVE as `0x${string}`,
      event:     RESERVE_ABI,
      fromBlock: start,
      toBlock:   end,
    });

    for (const log_ of reserveLogs as Log[]) {
      const args = (log_ as any).args as {
        totalReserveUsd: bigint;
        axvnCirculatingSupply: bigint;
        backingRatio: bigint;
      };
      await upsertReserveSnapshot({
        timestamp:             new Date().toISOString(),
        totalReserveUsd:       Number(args.totalReserveUsd) / 1e6,
        axvnCirculatingSupply: args.axvnCirculatingSupply,
        backingRatio:          Number(args.backingRatio) / 1e6,
        blockNumber:           Number(log_.blockNumber ?? 0),
        txHash:                log_.transactionHash ?? undefined,
      });
      reserveCount++;
    }

    log.info(
      { chunk: `${start}-${end}`, swapCount, reserveCount },
      "[backfill/evm] Chunk done"
    );
  }

  log.info(
    { swapCount, reserveCount },
    "[backfill/evm] EVM backfill complete"
  );
}
