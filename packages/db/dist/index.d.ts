import { PoolClient, Pool } from 'pg';
export { PoolClient } from 'pg';
import { FiatReceipt, ReserveSnapshot, SubgraphSwapEvent } from '@wikialisa/types';

/**
 * Returns the shared connection pool.
 * The pool is lazily created on first call using DATABASE_URL from env.
 * Call `closePool()` during graceful shutdown.
 */
declare function getPool(): Pool;
/**
 * Close the pool — call during process shutdown to drain connections cleanly.
 */
declare function closePool(): Promise<void>;
/**
 * Execute a parameterised query and return all rows.
 * Uses a pool-checked-out client to guarantee schema search_path.
 */
declare function query<T extends object>(sql: string, params?: unknown[]): Promise<T[]>;
/**
 * Execute a query and return the first row, or `null` if no rows matched.
 */
declare function queryOne<T extends object>(sql: string, params?: unknown[]): Promise<T | null>;
/**
 * Execute within an explicit transaction.
 * The callback receives the checked-out `PoolClient`; commit/rollback is
 * handled automatically based on whether the callback throws.
 */
declare function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;
interface FiatReceiptRow {
    receipt_id: string;
    order_id: string;
    bank_transaction_ref: string;
    amount: string;
    currency: string;
    bank_code: string | null;
    sender_account: string | null;
    sender_name: string | null;
    hmac_signature: string | null;
    hmac_verified: boolean;
    processed_at: Date | null;
    processing_error: string | null;
    confirmed_at: Date;
    created_at: Date;
}
/** Insert a fiat receipt row; returns the created row. */
declare function insertFiatReceipt(receipt: FiatReceipt & {
    bankCode?: string;
    senderAccount?: string;
    senderName?: string;
    hmacSignature?: string;
    hmacVerified?: boolean;
}): Promise<FiatReceiptRow>;
interface P2POrderRow {
    order_id: string;
    side: string;
    status: string;
    token_mint: string;
    token_amount: string;
    fiat_amount: string;
    fiat_currency: string;
    seller_wallet: string;
    buyer_wallet: string | null;
    escrow_pda: string | null;
    payment_method: string | null;
    payment_ref: string | null;
    matched_at: Date | null;
    fiat_confirmed_at: Date | null;
    token_released_at: Date | null;
    cancelled_at: Date | null;
    cancel_reason: string | null;
    created_at: Date;
    updated_at: Date;
}
/** Find an open P2P order by order_id. */
declare function findP2POrder(orderId: string): Promise<P2POrderRow | null>;
/**
 * Transition a matched P2P order to FIAT_CONFIRMED and link the payment ref.
 * Returns the updated row.
 */
declare function confirmP2PFiatPayment(client: PoolClient, orderId: string, paymentRef: string): Promise<P2POrderRow | null>;
interface OTCQuoteRow {
    id: string;
    quote_id: string;
    counterparty_id: string | null;
    token_in: string;
    token_out: string;
    amount_in: string;
    amount_out: string | null;
    price: string | null;
    fee_bps: number | null;
    status: string;
    requester_wallet: string | null;
    settlement_tx_hash: string | null;
    expires_at: Date;
    accepted_at: Date | null;
    settled_at: Date | null;
    created_at: Date;
}
/** Persist an OTC quote; returns the created row. */
declare function insertOTCQuote(opts: {
    quoteId: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    amountOut: string;
    price: number;
    requesterWallet?: string;
    feeBps?: number;
}): Promise<OTCQuoteRow>;
interface ReserveSnapshotRow {
    id: string;
    block_number: string | null;
    tx_hash: string | null;
    total_reserve_usd: string;
    axvn_circulating_supply: string;
    backing_ratio: string;
    source: string;
    snapshot_ts: Date;
    created_at: Date;
}
/** Persist a reserve snapshot emitted by the on-chain ProofOfReserve contract. */
declare function insertReserveSnapshot(snapshot: ReserveSnapshot & {
    blockNumber?: number;
    txHash?: string;
}): Promise<ReserveSnapshotRow>;
interface SwapEventRow {
    id: string;
    tx_hash: string;
    block_number: string;
    log_index: number | null;
    token_in: string;
    token_out: string;
    amount_in: string;
    amount_out: string;
    trader: string;
    pool_address: string | null;
    price_impact_bps: number | null;
    fee_bps: number | null;
    chain: string;
    block_timestamp: Date | null;
    indexed_at: Date;
}
/** Persist a swap event; silently ignores duplicates (ON CONFLICT tx_hash). */
declare function insertSwapEvent(event: SubgraphSwapEvent & {
    logIndex?: number;
    poolAddress?: string;
    priceImpactBps?: number;
    feeBps?: number;
    chain?: "solana" | "evm" | "tron";
    blockTimestamp?: string;
}): Promise<SwapEventRow | null>;

export { type FiatReceiptRow, type OTCQuoteRow, type P2POrderRow, type ReserveSnapshotRow, type SwapEventRow, closePool, confirmP2PFiatPayment, findP2POrder, getPool, insertFiatReceipt, insertOTCQuote, insertReserveSnapshot, insertSwapEvent, query, queryOne, withTransaction };
