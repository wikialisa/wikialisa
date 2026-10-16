/**
 * services/api-gateway/src/lib/redis.ts
 * Redis client singleton — dùng cho OTP, session blacklist, rate-limit cache
 */
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

const redis = createClient({ url: REDIS_URL });

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

redis.on("ready", () => {
  console.log("[Redis] Connected →", REDIS_URL);
});

// Connect on module load (idempotent)
redis.connect().catch((err) => {
  console.error("[Redis] Failed to connect:", err.message);
});

export default redis;

// ── OTP helpers ──────────────────────────────────────────────────────────────

const OTP_TTL = Number(process.env.REDIS_OTP_TTL ?? 300); // 5 minutes

/** Store OTP hash for a phone+purpose combination */
export async function setOtp(phone: string, purpose: string, hash: string): Promise<void> {
  await redis.set(`otp:${purpose}:${phone}`, hash, { EX: OTP_TTL });
}

/** Retrieve OTP hash; returns null if expired or not found */
export async function getOtp(phone: string, purpose: string): Promise<string | null> {
  return redis.get(`otp:${purpose}:${phone}`);
}

/** Delete OTP after successful verification */
export async function deleteOtp(phone: string, purpose: string): Promise<void> {
  await redis.del(`otp:${purpose}:${phone}`);
}

/** Increment OTP attempt counter (max 5 attempts) */
export async function incOtpAttempts(phone: string, purpose: string): Promise<number> {
  const key = `otp_attempts:${purpose}:${phone}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, OTP_TTL);
  return count;
}

export async function resetOtpAttempts(phone: string, purpose: string): Promise<void> {
  await redis.del(`otp_attempts:${purpose}:${phone}`);
}

// ── Refresh token blacklist ───────────────────────────────────────────────────

const RT_TTL = 60 * 60 * 24 * 30; // 30 days

/** Blacklist a refresh token hash (on logout / revoke) */
export async function blacklistToken(tokenHash: string, ttlSeconds = RT_TTL): Promise<void> {
  await redis.set(`blacklist:${tokenHash}`, "1", { EX: ttlSeconds });
}

/** Returns true if token hash is blacklisted */
export async function isTokenBlacklisted(tokenHash: string): Promise<boolean> {
  const val = await redis.get(`blacklist:${tokenHash}`);
  return val === "1";
}

// ── PIN lockout ───────────────────────────────────────────────────────────────

const PIN_LOCK_TTL = 30;       // 30s lockout
const PIN_MAX_ATTEMPTS = 5;

export async function incPinAttempts(userId: string): Promise<number> {
  const key = `pin_attempts:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, PIN_LOCK_TTL * PIN_MAX_ATTEMPTS);
  return count;
}

export async function getPinAttempts(userId: string): Promise<number> {
  const val = await redis.get(`pin_attempts:${userId}`);
  return val ? Number(val) : 0;
}

export async function resetPinAttempts(userId: string): Promise<void> {
  await redis.del(`pin_attempts:${userId}`);
}

export async function isPinLocked(userId: string): Promise<boolean> {
  return (await getPinAttempts(userId)) >= PIN_MAX_ATTEMPTS;
}

// ── Internal OTP store (TEST mode — no SMS provider needed) ──────────────────
// Stores the plaintext OTP briefly so the /otp/internal-callback endpoint
// can return it to the frontend directly (callback from backend to frontend).

const INTERNAL_OTP_TTL = 120; // 2 minutes

/**
 * Store a plaintext OTP for internal retrieval (TEST mode only).
 * Key: `otp_internal:<purpose>:<phone>`
 */
export async function setOtpInternal(phone: string, purpose: string, otp: string): Promise<void> {
  await redis.set(`otp_internal:${purpose}:${phone}`, otp, { EX: INTERNAL_OTP_TTL });
}

/**
 * Retrieve plaintext OTP for internal callback (TEST mode only).
 * Returns null if expired or not found.
 */
export async function getOtpInternal(phone: string, purpose: string): Promise<string | null> {
  return redis.get(`otp_internal:${purpose}:${phone}`);
}

/** Delete internal OTP after it has been consumed */
export async function deleteOtpInternal(phone: string, purpose: string): Promise<void> {
  await redis.del(`otp_internal:${purpose}:${phone}`);
}

// ── Post-OTP step token (TEST mode: signals frontend to show PIN setup) ───────
// After OTP verify succeeds, backend stores a short-lived "step token"
// that the frontend exchanges for a PIN setup screen.

const STEP_TOKEN_TTL = 300; // 5 minutes

/**
 * Store the next step for a phone after OTP verification.
 * Value: "SETUP_PIN" | "COMPLETE"
 */
export async function setPostOtpStep(phone: string, step: string): Promise<void> {
  await redis.set(`post_otp_step:${phone}`, step, { EX: STEP_TOKEN_TTL });
}

export async function getPostOtpStep(phone: string): Promise<string | null> {
  return redis.get(`post_otp_step:${phone}`);
}

export async function deletePostOtpStep(phone: string): Promise<void> {
  await redis.del(`post_otp_step:${phone}`);
}
