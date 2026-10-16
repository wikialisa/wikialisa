// src/features.ts
function flag(key) {
  const val = process.env[key];
  if (val === void 0 || val === "") return false;
  return val.trim().toLowerCase() === "true" || val.trim() === "1";
}
var features = {
  /** Ethereum/EVM RPC qua Alchemy — cần ALCHEMY_API_KEY */
  ALCHEMY: flag("FEATURE_ALCHEMY"),
  /** On-chain deposit listener (TRON/BTC) — cần TATUM_API_KEY */
  TATUM: flag("FEATURE_TATUM"),
  /** VietQR deposit initiation — cần VIETQR_API_KEY */
  VIETQR: flag("FEATURE_VIETQR"),
  /** NAPAS liên ngân hàng — cần NAPAS_API_KEY */
  NAPAS: flag("FEATURE_NAPAS"),
  /** Cloud storage S3 (ảnh KYC, media) — cần AWS_ACCESS_KEY_ID */
  AWS_S3: flag("FEATURE_AWS_S3"),
  /** SMS OTP — cần TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN */
  TWILIO: flag("FEATURE_TWILIO"),
  /** Chainalysis AML screening — cần AML_PROVIDER_API_KEY */
  AML: flag("FEATURE_AML"),
  /** AI trading signals — cần AI_SIGNAL_API_KEY */
  AI_SIGNAL: flag("FEATURE_AI_SIGNAL"),
  /** Dune Analytics PoR — cần DUNE_API_KEY */
  DUNE: flag("FEATURE_DUNE"),
  /** Telegram bot alerts — cần TELEGRAM_BOT_TOKEN */
  TELEGRAM_ALERT: flag("FEATURE_TELEGRAM_ALERT"),
  /** Discord bot alerts — cần DISCORD_BOT_TOKEN */
  DISCORD_ALERT: flag("FEATURE_DISCORD_ALERT")
};
function requireFeature(key, label) {
  if (!features[key]) {
    throw new Error(
      `Feature "${label ?? key}" is disabled. Set FEATURE_${key}=true in .env to enable.`
    );
  }
}
function checkFeature(key, label) {
  if (!features[key]) {
    console.warn(
      `[features] "${label ?? key}" is disabled (FEATURE_${key}=false). Skipping.`
    );
    return false;
  }
  return true;
}

// src/index.ts
var SOLANA_RPC_DEVNET = "https://api.devnet.solana.com";
var SOLANA_RPC_MAINNET = "https://api.mainnet-beta.solana.com";
var APPCHAIN_RPC_LOCAL = "http://localhost:8545";
var APPCHAIN_RPC_MAINNET = "https://rpc.axvn.vn";
var TRON_FULL_HOST = "https://api.trongrid.io";
var TRON_NILE_TESTNET = "https://nile.trongrid.io";
var DEFAULT_API_ENDPOINT = "https://dev-api.axvn.vn";
var PROGRAM_IDS = {
  P2P_ESCROW: "ESCRw1111111111111111111111111111111111111111",
  MINT_GOVERNANCE: "MINTg1111111111111111111111111111111111111111",
  AMM_SWAP: "AMMSw1111111111111111111111111111111111111111",
  TREASURY_RBS: "TRBSr1111111111111111111111111111111111111111"
};
var SEEDS = {
  ESCROW_VAULT: Buffer.from("escrow_vault"),
  ORDER_STATE: Buffer.from("order_state"),
  MINT_AUTHORITY: Buffer.from("mint_authority"),
  TREASURY_VAULT: Buffer.from("treasury_vault")
};
var EVM_CONTRACTS = {
  AXVN_TOKEN: "0x0000000000000000000000000000000000000001",
  PROOF_RESERVE: "0x0000000000000000000000000000000000000002"
};
export {
  APPCHAIN_RPC_LOCAL,
  APPCHAIN_RPC_MAINNET,
  DEFAULT_API_ENDPOINT,
  EVM_CONTRACTS,
  PROGRAM_IDS,
  SEEDS,
  SOLANA_RPC_DEVNET,
  SOLANA_RPC_MAINNET,
  TRON_FULL_HOST,
  TRON_NILE_TESTNET,
  checkFeature,
  features,
  requireFeature
};
