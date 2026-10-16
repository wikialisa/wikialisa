// src/index.ts
import { Pool } from "pg";
var _pool = null;
function getPool() {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 5e3
    });
    _pool.on("error", (err) => {
      console.error("[db] Unexpected pool client error:", err.message);
    });
  }
  return _pool;
}
async function closePool() {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
async function query(sql, params) {
  const result = await getPool().query(sql, params);
  return result.rows;
}
async function queryOne(sql, params) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}
async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
async function insertFiatReceipt(receipt) {
  const row = await queryOne(
    `INSERT INTO payments.fiat_receipts
       (receipt_id, order_id, bank_transaction_ref, amount, currency,
        bank_code, sender_account, sender_name,
        hmac_signature, hmac_verified, confirmed_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (receipt_id) DO NOTHING
     RETURNING *`,
    [
      receipt.receiptId,
      receipt.orderId,
      receipt.bankTransactionRef,
      receipt.amount,
      receipt.currency,
      receipt.bankCode ?? null,
      receipt.senderAccount ?? null,
      receipt.senderName ?? null,
      receipt.hmacSignature ?? null,
      receipt.hmacVerified ?? false,
      receipt.confirmedAt
    ]
  );
  if (!row) {
    const existing = await queryOne(
      `SELECT * FROM payments.fiat_receipts WHERE receipt_id = $1`,
      [receipt.receiptId]
    );
    return existing;
  }
  return row;
}
async function findP2POrder(orderId) {
  return queryOne(
    `SELECT * FROM payments.p2p_orders WHERE order_id = $1`,
    [orderId]
  );
}
async function confirmP2PFiatPayment(client, orderId, paymentRef) {
  const result = await client.query(
    `UPDATE payments.p2p_orders
        SET status           = 'FIAT_CONFIRMED',
            payment_ref      = $2,
            fiat_confirmed_at = now()
      WHERE order_id = $1
        AND status IN ('OPEN','MATCHED')
      RETURNING *`,
    [orderId, paymentRef]
  );
  return result.rows[0] ?? null;
}
async function insertOTCQuote(opts) {
  const row = await queryOne(
    `INSERT INTO otc.quotes
       (quote_id, token_in, token_out, amount_in, amount_out,
        price, fee_bps, requester_wallet, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now() + INTERVAL '30 seconds')
     RETURNING *`,
    [
      opts.quoteId,
      opts.tokenIn,
      opts.tokenOut,
      opts.amountIn,
      opts.amountOut,
      opts.price,
      opts.feeBps ?? 30,
      opts.requesterWallet ?? null
    ]
  );
  return row;
}
async function insertReserveSnapshot(snapshot) {
  const row = await queryOne(
    `INSERT INTO treasury.reserve_snapshots
       (block_number, tx_hash, total_reserve_usd,
        axvn_circulating_supply, backing_ratio, source, snapshot_ts)
     VALUES ($1,$2,$3,$4,$5,'on-chain',$6)
     RETURNING *`,
    [
      snapshot.blockNumber ?? null,
      snapshot.txHash ?? null,
      snapshot.totalReserveUsd,
      snapshot.axvnCirculatingSupply.toString(),
      snapshot.backingRatio,
      snapshot.timestamp
    ]
  );
  return row;
}
async function insertSwapEvent(event) {
  return queryOne(
    `INSERT INTO treasury.swap_events
       (tx_hash, block_number, log_index, token_in, token_out,
        amount_in, amount_out, trader, pool_address,
        price_impact_bps, fee_bps, chain, block_timestamp)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (tx_hash) DO NOTHING
     RETURNING *`,
    [
      event.txHash,
      event.blockNumber,
      event.logIndex ?? null,
      event.tokenIn,
      event.tokenOut,
      event.amountIn.toString(),
      event.amountOut.toString(),
      event.trader,
      event.poolAddress ?? null,
      event.priceImpactBps ?? null,
      event.feeBps ?? null,
      event.chain ?? "evm",
      event.blockTimestamp ?? null
    ]
  );
}
export {
  closePool,
  confirmP2PFiatPayment,
  findP2POrder,
  getPool,
  insertFiatReceipt,
  insertOTCQuote,
  insertReserveSnapshot,
  insertSwapEvent,
  query,
  queryOne,
  withTransaction
};
