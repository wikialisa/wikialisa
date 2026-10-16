interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
    errorCode?: string;
    meta?: Record<string, unknown>;
}
interface PaginatedResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T[];
    pagination: PaginationMeta;
}
type JsonRpcVersion = "2.0";
interface JsonRpcRequest {
    jsonrpc: JsonRpcVersion;
    id: string | number | null;
    method: string;
    params?: unknown[] | Record<string, unknown>;
}
interface JsonRpcSuccessResponse<T = unknown> {
    jsonrpc: JsonRpcVersion;
    id: string | number | null;
    result: T;
}
interface JsonRpcError {
    code: number;
    message: string;
    data?: unknown;
}
interface JsonRpcErrorResponse {
    jsonrpc: JsonRpcVersion;
    id: string | number | null;
    error: JsonRpcError;
}
type JsonRpcResponse<T = unknown> = JsonRpcSuccessResponse<T> | JsonRpcErrorResponse;
/** Standard JSON-RPC error codes */
declare const JSON_RPC_ERRORS: {
    readonly PARSE_ERROR: {
        readonly code: -32700;
        readonly message: "Parse error";
    };
    readonly INVALID_REQUEST: {
        readonly code: -32600;
        readonly message: "Invalid Request";
    };
    readonly METHOD_NOT_FOUND: {
        readonly code: -32601;
        readonly message: "Method not found";
    };
    readonly INVALID_PARAMS: {
        readonly code: -32602;
        readonly message: "Invalid params";
    };
    readonly INTERNAL_ERROR: {
        readonly code: -32603;
        readonly message: "Internal error";
    };
    readonly UNAUTHORIZED: {
        readonly code: -32001;
        readonly message: "Unauthorized";
    };
    readonly RATE_LIMITED: {
        readonly code: -32002;
        readonly message: "Rate limit exceeded";
    };
    readonly CHAIN_ERROR: {
        readonly code: -32010;
        readonly message: "Blockchain error";
    };
};
type WSMessageType = "connected" | "ping" | "pong" | "subscribe" | "unsubscribe" | "subscribed" | "unsubscribed" | "error" | "ticker" | "orderbook" | "trade" | "notification";
/** Generic WS envelope — all messages over the wire conform to this shape */
interface WSEnvelope<T = unknown> {
    type: WSMessageType;
    channel?: string;
    data?: T;
    ts: number;
    id?: string;
}
/** Client → Server: subscribe request */
interface WSSubscribeMessage {
    type: "subscribe" | "unsubscribe";
    channel: string;
    token?: string;
    id?: string;
}
/** Server → Client: subscription ack */
interface WSSubscribedMessage {
    type: "subscribed" | "unsubscribed";
    channel: string;
    ts: number;
}
/** Server → Client: error frame */
interface WSErrorMessage {
    type: "error";
    code: number;
    message: string;
    ts: number;
}
type KYCStatus = "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
interface KYCProfile {
    userId: string;
    walletAddress: string;
    status: KYCStatus;
    tier: 1 | 2 | 3;
    verifiedAt?: string;
}
interface RegisterRequest {
    phone?: string;
    email?: string;
    password: string;
    fullName?: string;
    referralCode?: string;
}
interface LoginRequest {
    identifier: string;
    password: string;
    totpCode?: string;
}
interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
interface RefreshTokenRequest {
    refreshToken: string;
}
interface ForgotPasswordRequest {
    identifier: string;
}
interface ResetPasswordRequest {
    identifier: string;
    otp: string;
    newPassword: string;
}
interface Setup2FAResponse {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}
interface Enable2FARequest {
    totpCode: string;
}
interface Disable2FARequest {
    totpCode: string;
    backupCode?: string;
}
interface VerifyPinRequest {
    pin: string;
    action: "transfer" | "withdraw" | "cvv" | "swap";
}
interface UserProfile {
    userId: string;
    fullName: string;
    phone?: string;
    email?: string;
    avatar?: string;
    bio?: string;
    kycStatus: KYCStatus;
    kycTier: 1 | 2 | 3;
    createdAt: string;
}
interface UpdateProfileRequest {
    fullName?: string;
    avatar?: string;
    bio?: string;
}
interface KYCSubmitRequest {
    documentType: "CCCD" | "PASSPORT" | "DRIVING_LICENSE";
    documentNumber: string;
    frontImageUrl: string;
    backImageUrl?: string;
    selfieImageUrl: string;
}
interface KYCStatusResponse {
    status: KYCStatus;
    tier: number;
    submittedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
}
interface SessionEntry {
    sessionId: string;
    deviceName: string;
    deviceOS: string;
    ipAddress: string;
    location: string;
    lastSeen: string;
    current: boolean;
}
interface RevokeSessionRequest {
    sessionId: string;
}
interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
interface NotificationItem {
    id: string;
    type: "TRANSACTION" | "SECURITY" | "SYSTEM" | "PROMO";
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    metadata?: Record<string, unknown>;
}
interface MarkNotificationsReadRequest {
    notificationIds: string[];
}
type OrderStatus = "OPEN" | "MATCHED" | "FIAT_CONFIRMED" | "TOKEN_RELEASED" | "CANCELLED" | "DISPUTED";
type OrderSide = "BUY" | "SELL";
interface P2POrder {
    orderId: string;
    side: OrderSide;
    status: OrderStatus;
    tokenMint: string;
    tokenAmount: bigint;
    fiatAmount: number;
    fiatCurrency: "VND" | "SGD" | "USD" | "AED";
    sellerWallet: string;
    buyerWallet?: string;
    escrowPda?: string;
    createdAt: string;
    updatedAt: string;
}
interface MarketInfo {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    lastPrice: string;
    volume24h: string;
    change24h: string;
    high24h: string;
    low24h: string;
}
interface TickerData {
    symbol: string;
    price: string;
    change: string;
    changePercent: string;
    volume: string;
    timestamp: number;
}
interface OrderBookLevel {
    price: string;
    amount: string;
    total: string;
}
interface OrderBook {
    symbol: string;
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    timestamp: number;
}
interface TradeRecord {
    tradeId: string;
    symbol: string;
    price: string;
    amount: string;
    side: "buy" | "sell";
    timestamp: number;
}
type OrderType = "LIMIT" | "MARKET" | "STOP_LIMIT";
interface PlaceOrderRequest {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    amount: string;
    price?: string;
    stopPrice?: string;
}
interface OrderRecord {
    orderId: string;
    symbol: string;
    side: OrderSide;
    type: OrderType;
    status: "OPEN" | "FILLED" | "PARTIAL" | "CANCELLED";
    amount: string;
    filledAmount: string;
    price?: string;
    avgFillPrice?: string;
    createdAt: string;
    updatedAt: string;
}
interface SwapQuoteRequest {
    fromToken: string;
    toToken: string;
    amount: string;
}
interface SwapQuoteResponse {
    quoteId: string;
    fromToken: string;
    toToken: string;
    fromAmount: string;
    toAmount: string;
    rate: string;
    priceImpact: string;
    fee: string;
    expiresAt: number;
}
interface SwapExecuteRequest {
    quoteId: string;
    pin: string;
    slippageTolerance?: string;
}
type WalletNetwork = "TRC20" | "ERC20" | "BEP20" | "SOL" | "VND";
interface WalletBalance {
    asset: string;
    network: WalletNetwork;
    available: string;
    locked: string;
    usdEquivalent: string;
}
interface CryptoDepositAddressRequest {
    asset: string;
    network: WalletNetwork;
}
interface CryptoDepositAddressResponse {
    address: string;
    asset: string;
    network: WalletNetwork;
    memo?: string;
    qrCode?: string;
}
interface FiatDepositRequest {
    amount: number;
    bankCode?: string;
    description?: string;
}
interface FiatDepositResponse {
    orderId: string;
    vietQrContent: string;
    bankAccount: string;
    bankName: string;
    amount: number;
    description: string;
    expiresAt: string;
}
interface WithdrawCryptoRequest {
    asset: string;
    network: WalletNetwork;
    toAddress: string;
    amount: string;
    memo?: string;
    pin: string;
    totpCode?: string;
}
interface WithdrawFiatRequest {
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    description?: string;
    pin: string;
    totpCode?: string;
}
interface P2PTransferRequest {
    toIdentifier: string;
    amount: number;
    note?: string;
    pin: string;
    idempotencyKey: string;
}
interface SwiftTransferRequest {
    beneficiaryName: string;
    beneficiaryAccount: string;
    beneficiaryBank: string;
    swiftCode: string;
    countryCode: string;
    currency: string;
    amount: number;
    purpose: string;
    feeType: "SHA" | "OUR" | "BEN";
    pin: string;
    totpCode?: string;
}
type TransactionType = "DEPOSIT" | "WITHDRAW" | "TRANSFER" | "SWAP" | "CASHBACK" | "STAKING";
type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
interface TransactionRecord {
    txId: string;
    type: TransactionType;
    status: TransactionStatus;
    asset: string;
    amount: string;
    fee: string;
    description: string;
    fromAddress?: string;
    toAddress?: string;
    txHash?: string;
    createdAt: string;
    updatedAt: string;
}
interface FiatReceipt {
    receiptId: string;
    orderId: string;
    bankTransactionRef: string;
    amount: number;
    currency: string;
    confirmedAt: string;
    /** Memo / narration field from bank transfer — used for Offer ID parsing */
    description?: string;
}
type AccountStatus = "ACTIVE" | "LOCKED" | "SUSPENDED";
interface AdminUserRecord {
    userId: string;
    fullName: string;
    phone?: string;
    email?: string;
    kycStatus: KYCStatus;
    kycTier: number;
    accountStatus: AccountStatus;
    createdAt: string;
    lastLoginAt?: string;
    totalVolume?: string;
}
interface UpdateUserStatusRequest {
    status: AccountStatus;
    reason?: string;
}
interface KYCReviewRequest {
    userId: string;
    action: "APPROVE" | "REJECT";
    reason?: string;
    tierToGrant?: 1 | 2 | 3;
}
interface PendingWithdrawal {
    withdrawId: string;
    userId: string;
    userName: string;
    asset: string;
    amount: string;
    network?: WalletNetwork;
    bankCode?: string;
    createdAt: string;
    riskScore?: number;
}
interface ApproveWithdrawalRequest {
    withdrawId: string;
    action: "APPROVE" | "REJECT";
    reason?: string;
}
interface SystemMetrics {
    dailyVolume: string;
    dailyTransactions: number;
    totalUsers: number;
    activeUsers24h: number;
    pendingKYC: number;
    pendingWithdrawals: number;
    revenue24h: string;
}
interface BotTradingConfig {
    botId: string;
    type: "GRID" | "DCA";
    symbol: string;
    status: "RUNNING" | "PAUSED" | "STOPPED";
    profit: string;
    createdAt: string;
}
interface StartBotRequest {
    type: "GRID" | "DCA";
    symbol: string;
    upperPrice?: string;
    lowerPrice?: string;
    gridCount?: number;
    dcaAmount?: string;
    dcaInterval?: "1h" | "4h" | "1d" | "1w";
    totalInvestment: string;
}
interface StakingPool {
    poolId: string;
    asset: string;
    type: "FLEXIBLE" | "FIXED";
    apr: string;
    minStake: string;
    maxStake?: string;
    lockPeriodDays?: number;
    totalStaked: string;
    status: "ACTIVE" | "FULL" | "CLOSED";
}
interface StakingSubscribeRequest {
    poolId: string;
    amount: string;
    pin: string;
}
interface AISignal {
    signalId: string;
    symbol: string;
    direction: "LONG" | "SHORT" | "NEUTRAL";
    confidence: number;
    entryPrice: string;
    targetPrice: string;
    stopLoss: string;
    timeframe: string;
    reasoning: string;
    createdAt: string;
}
interface Course {
    courseId: string;
    title: string;
    description: string;
    level: "BEGINNER" | "INTERMEDIATE" | "PRO";
    category: string;
    lessonCount: number;
    durationMinutes: number;
    thumbnailUrl?: string;
    published: boolean;
    createdAt: string;
}
interface Lesson {
    lessonId: string;
    courseId: string;
    title: string;
    contentType: "VIDEO" | "ARTICLE";
    videoUrl?: string;
    contentHtml?: string;
    durationMinutes?: number;
    order: number;
}
interface LessonProgressRequest {
    lessonId: string;
    courseId: string;
    completed: boolean;
    watchedSeconds?: number;
}
interface LessonProgressResponse {
    courseId: string;
    completedLessons: number;
    totalLessons: number;
    percentComplete: number;
    certificateUrl?: string;
}
interface ReferralInfo {
    referralCode: string;
    referralLink: string;
    tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
    totalReferrals: number;
    totalEarned: string;
}
interface ReferralNode {
    userId: string;
    name: string;
    level: 1 | 2 | 3;
    joinedAt: string;
    volume: string;
    commission: string;
}
interface CommissionRecord {
    commissionId: string;
    fromUserId: string;
    fromUserName: string;
    level: 1 | 2 | 3;
    amount: string;
    asset: string;
    source: "TRADE" | "SWAP" | "DEPOSIT";
    createdAt: string;
}
interface ClaimCommissionRequest {
    amount?: string;
}
interface CryptoDepositWebhook {
    txHash: string;
    blockNumber: number;
    toAddress: string;
    asset: string;
    network: WalletNetwork;
    amount: string;
    confirmations: number;
    status: "PENDING" | "CONFIRMED";
    timestamp: number;
}
interface VietQRWebhook {
    transactionId: string;
    bankCode: string;
    accountNumber: string;
    amount: number;
    description: string;
    transactionDate: string;
    hmacSignature?: string;
}
interface P2PEscrowWebhook {
    orderId: string;
    event: "LOCKED" | "RELEASED" | "CANCELLED";
    escrowPda: string;
    txHash: string;
    timestamp: number;
}
interface NQ05ReportRequest {
    startDate: string;
    endDate: string;
    format: "JSON" | "CSV" | "XML";
}
interface NQ05ReportResponse {
    reportId: string;
    period: string;
    totalTransactions: number;
    totalVolume: string;
    fileUrl: string;
    generatedAt: string;
}
interface AuditLogEntry {
    logId: string;
    userId?: string;
    action: string;
    resource: string;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    changes?: Record<string, unknown>;
}
interface AMLVerifyRequest {
    transactionId: string;
    userId: string;
    amount: string;
    asset: string;
    direction: "IN" | "OUT";
    counterpartyAddress?: string;
}
interface AMLVerifyResponse {
    transactionId: string;
    riskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    flags: string[];
    requiresReview: boolean;
}
interface MerchantCreateOrderRequest {
    merchantId: string;
    amount: number;
    currency: string;
    description: string;
    callbackUrl: string;
    metadata?: Record<string, unknown>;
}
interface MerchantOrderResponse {
    orderId: string;
    status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
    paymentUrl: string;
    expiresAt: string;
}
interface ReserveSnapshot {
    timestamp: string;
    totalReserveUsd: number;
    axvnCirculatingSupply: bigint;
    backingRatio: number;
}
interface SubgraphSwapEvent {
    txHash: string;
    blockNumber: number;
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    amountOut: bigint;
    trader: string;
}
interface WSTicker {
    channel: "ticker@public";
    symbol: string;
    price: string;
    change: string;
    volume: string;
    timestamp: number;
}
interface WSOrderBook {
    channel: `orderbook@${string}`;
    symbol: string;
    bids: [string, string][];
    asks: [string, string][];
    timestamp: number;
}
interface WSUserTrade {
    channel: "user@trades";
    userId: string;
    tradeId: string;
    symbol: string;
    side: OrderSide;
    amount: string;
    price: string;
    timestamp: number;
}
interface WSNotification {
    channel: "notifications@user";
    userId: string;
    type: NotificationItem["type"];
    title: string;
    body: string;
    metadata?: Record<string, unknown>;
}

export { type AISignal, type AMLVerifyRequest, type AMLVerifyResponse, type AccountStatus, type AdminUserRecord, type ApiResponse, type ApproveWithdrawalRequest, type AuditLogEntry, type BotTradingConfig, type ChangePasswordRequest, type ClaimCommissionRequest, type CommissionRecord, type Course, type CryptoDepositAddressRequest, type CryptoDepositAddressResponse, type CryptoDepositWebhook, type Disable2FARequest, type Enable2FARequest, type FiatDepositRequest, type FiatDepositResponse, type FiatReceipt, type ForgotPasswordRequest, JSON_RPC_ERRORS, type JsonRpcError, type JsonRpcErrorResponse, type JsonRpcRequest, type JsonRpcResponse, type JsonRpcSuccessResponse, type JsonRpcVersion, type KYCProfile, type KYCReviewRequest, type KYCStatus, type KYCStatusResponse, type KYCSubmitRequest, type Lesson, type LessonProgressRequest, type LessonProgressResponse, type LoginRequest, type MarkNotificationsReadRequest, type MarketInfo, type MerchantCreateOrderRequest, type MerchantOrderResponse, type NQ05ReportRequest, type NQ05ReportResponse, type NotificationItem, type OrderBook, type OrderBookLevel, type OrderRecord, type OrderSide, type OrderStatus, type OrderType, type P2PEscrowWebhook, type P2POrder, type P2PTransferRequest, type PaginatedResponse, type PaginationMeta, type PendingWithdrawal, type PlaceOrderRequest, type ReferralInfo, type ReferralNode, type RefreshTokenRequest, type RegisterRequest, type ReserveSnapshot, type ResetPasswordRequest, type RevokeSessionRequest, type SessionEntry, type Setup2FAResponse, type StakingPool, type StakingSubscribeRequest, type StartBotRequest, type SubgraphSwapEvent, type SwapExecuteRequest, type SwapQuoteRequest, type SwapQuoteResponse, type SwiftTransferRequest, type SystemMetrics, type TickerData, type TokenPair, type TradeRecord, type TransactionRecord, type TransactionStatus, type TransactionType, type UpdateProfileRequest, type UpdateUserStatusRequest, type UserProfile, type VerifyPinRequest, type VietQRWebhook, type WSEnvelope, type WSErrorMessage, type WSMessageType, type WSNotification, type WSOrderBook, type WSSubscribeMessage, type WSSubscribedMessage, type WSTicker, type WSUserTrade, type WalletBalance, type WalletNetwork, type WithdrawCryptoRequest, type WithdrawFiatRequest };
