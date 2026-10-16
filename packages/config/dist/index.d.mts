/**
 * features.ts — Feature flags cho các external service chưa có API key.
 *
 * Đọc từ biến môi trường FEATURE_* (mặc định false — tắt an toàn).
 * Khi có key thật, đặt FEATURE_XYZ=true trong .env để bật.
 *
 * Cách dùng trong service:
 *   import { features } from "@wikialisa/config";
 *   if (!features.VIETQR) return;          // skip silently
 *   if (!features.TWILIO) throw new Error("SMS disabled"); // hoặc throw
 */
declare const features: {
    /** Ethereum/EVM RPC qua Alchemy — cần ALCHEMY_API_KEY */
    readonly ALCHEMY: boolean;
    /** On-chain deposit listener (TRON/BTC) — cần TATUM_API_KEY */
    readonly TATUM: boolean;
    /** VietQR deposit initiation — cần VIETQR_API_KEY */
    readonly VIETQR: boolean;
    /** NAPAS liên ngân hàng — cần NAPAS_API_KEY */
    readonly NAPAS: boolean;
    /** Cloud storage S3 (ảnh KYC, media) — cần AWS_ACCESS_KEY_ID */
    readonly AWS_S3: boolean;
    /** SMS OTP — cần TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN */
    readonly TWILIO: boolean;
    /** Chainalysis AML screening — cần AML_PROVIDER_API_KEY */
    readonly AML: boolean;
    /** AI trading signals — cần AI_SIGNAL_API_KEY */
    readonly AI_SIGNAL: boolean;
    /** Dune Analytics PoR — cần DUNE_API_KEY */
    readonly DUNE: boolean;
    /** Telegram bot alerts — cần TELEGRAM_BOT_TOKEN */
    readonly TELEGRAM_ALERT: boolean;
    /** Discord bot alerts — cần DISCORD_BOT_TOKEN */
    readonly DISCORD_ALERT: boolean;
};
type FeatureKey = keyof typeof features;
/**
 * Guard — throw nếu feature bị tắt.
 *
 * @example
 *   requireFeature("TWILIO", "SMS OTP service");
 */
declare function requireFeature(key: FeatureKey, label?: string): void;
/**
 * Guard — log warn và return false nếu feature tắt (không throw).
 * Dùng cho background jobs / workers có thể skip gracefully.
 *
 * @example
 *   if (!checkFeature("DUNE")) return;
 */
declare function checkFeature(key: FeatureKey, label?: string): boolean;

declare const SOLANA_RPC_DEVNET = "https://api.devnet.solana.com";
declare const SOLANA_RPC_MAINNET = "https://api.mainnet-beta.solana.com";
/** App-Chain Genesis (EVM, Chain ID: 1337 local / 1 mainnet) */
declare const APPCHAIN_RPC_LOCAL = "http://localhost:8545";
declare const APPCHAIN_RPC_MAINNET = "https://rpc.axvn.vn";
declare const TRON_FULL_HOST = "https://api.trongrid.io";
declare const TRON_NILE_TESTNET = "https://nile.trongrid.io";
declare const DEFAULT_API_ENDPOINT = "https://dev-api.axvn.vn";
declare const PROGRAM_IDS: {
    readonly P2P_ESCROW: "ESCRw1111111111111111111111111111111111111111";
    readonly MINT_GOVERNANCE: "MINTg1111111111111111111111111111111111111111";
    readonly AMM_SWAP: "AMMSw1111111111111111111111111111111111111111";
    readonly TREASURY_RBS: "TRBSr1111111111111111111111111111111111111111";
};
declare const SEEDS: {
    readonly ESCROW_VAULT: Buffer<ArrayBuffer>;
    readonly ORDER_STATE: Buffer<ArrayBuffer>;
    readonly MINT_AUTHORITY: Buffer<ArrayBuffer>;
    readonly TREASURY_VAULT: Buffer<ArrayBuffer>;
};
declare const EVM_CONTRACTS: {
    readonly AXVN_TOKEN: "0x0000000000000000000000000000000000000001";
    readonly PROOF_RESERVE: "0x0000000000000000000000000000000000000002";
};

export { APPCHAIN_RPC_LOCAL, APPCHAIN_RPC_MAINNET, DEFAULT_API_ENDPOINT, EVM_CONTRACTS, type FeatureKey, PROGRAM_IDS, SEEDS, SOLANA_RPC_DEVNET, SOLANA_RPC_MAINNET, TRON_FULL_HOST, TRON_NILE_TESTNET, checkFeature, features, requireFeature };
