/**
 * backfill/solana.ts
 * Historical backfill: fetch past Solana transactions for AMM_SWAP program
 * and persist swap events to MongoDB.
 * Called via POST /backfill/solana — runs in background.
 */

import {
  Connection,
  PublicKey,
  type ConfirmedSignatureInfo,
} from "@solana/web3.js";
import { SOLANA_RPC_MAINNET, PROGRAM_IDS } from "@wikialisa/config";
import { upsertSwapEvent } from "@wikialisa/mongo-db";
import type { FastifyBaseLogger } from "fastify";

const BATCH_SIZE = 100; // max signatures per getSignaturesForAddress call

export async function runSolanaBackfill(opts: {
  before?: string;
  until?: string;
  limit?: number;
  log: FastifyBaseLogger;
}): Promise<void> {
  const { log, before, until, limit = 1_000 } = opts;

  const rpc = process.env["SOLANA_RPC"] ?? SOLANA_RPC_MAINNET;
  const connection = new Connection(rpc, "confirmed");
  const programId  = new PublicKey(PROGRAM_IDS.AMM_SWAP);

  log.info({ before, until, limit }, "[backfill/solana] Starting Solana backfill");

  let fetched   = 0;
  let persisted = 0;
  let cursor    = before;

  while (fetched < limit) {
    const batch = Math.min(BATCH_SIZE, limit - fetched);

    const sigs: ConfirmedSignatureInfo[] =
      await connection.getSignaturesForAddress(programId, {
        limit:  batch,
        before: cursor,
        until,
      });

    if (sigs.length === 0) break;

    for (const sig of sigs) {
      if (sig.err) { fetched++; continue; }

      // Fetch full transaction to parse logs
      const tx = await connection.getParsedTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });

      if (!tx) { fetched++; continue; }

      const logs = tx.meta?.logMessages ?? [];
      const slot  = tx.slot ?? 0;

      for (const line of logs) {
        const prefix = "Program log: SWAP:";
        if (!line.startsWith(prefix)) continue;
        const parts = line.slice(prefix.length).split(":");
        if (parts.length < 6) continue;
        const [txHashP, tokenIn, tokenOut, amountIn, amountOut, trader] = parts;
        try {
          await upsertSwapEvent({
            txHash:      sig.signature,
            blockNumber: slot,
            tokenIn:     tokenIn!,
            tokenOut:    tokenOut!,
            amountIn:    BigInt(amountIn!),
            amountOut:   BigInt(amountOut!),
            trader:      trader!,
            chain:       "solana",
          });
          persisted++;
        } catch (err) {
          log.warn({ err, sig: sig.signature }, "[backfill/solana] Failed to persist swap");
        }
      }

      fetched++;
    }

    cursor = sigs[sigs.length - 1]?.signature;
    log.info({ fetched, persisted }, "[backfill/solana] Batch done");
    if (!cursor) break;
  }

  log.info({ fetched, persisted }, "[backfill/solana] Solana backfill complete");
}
