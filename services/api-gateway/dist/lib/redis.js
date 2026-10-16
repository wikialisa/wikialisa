"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOtp = setOtp;
exports.getOtp = getOtp;
exports.deleteOtp = deleteOtp;
exports.incOtpAttempts = incOtpAttempts;
exports.resetOtpAttempts = resetOtpAttempts;
exports.blacklistToken = blacklistToken;
exports.isTokenBlacklisted = isTokenBlacklisted;
exports.incPinAttempts = incPinAttempts;
exports.getPinAttempts = getPinAttempts;
exports.resetPinAttempts = resetPinAttempts;
exports.isPinLocked = isPinLocked;
exports.setOtpInternal = setOtpInternal;
exports.getOtpInternal = getOtpInternal;
exports.deleteOtpInternal = deleteOtpInternal;
exports.setPostOtpStep = setPostOtpStep;
exports.getPostOtpStep = getPostOtpStep;
exports.deletePostOtpStep = deletePostOtpStep;
/**
 * services/api-gateway/src/lib/redis.ts
 * Redis client singleton — dùng cho OTP, session blacklist, rate-limit cache
 */
const redis_1 = require("redis");
const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const redis = (0, redis_1.createClient)({ url: REDIS_URL });
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
exports.default = redis;
// ── OTP helpers ──────────────────────────────────────────────────────────────
const OTP_TTL = Number(process.env.REDIS_OTP_TTL ?? 300); // 5 minutes
/** Store OTP hash for a phone+purpose combination */
async function setOtp(phone, purpose, hash) {
    await redis.set(`otp:${purpose}:${phone}`, hash, { EX: OTP_TTL });
}
/** Retrieve OTP hash; returns null if expired or not found */
async function getOtp(phone, purpose) {
    return redis.get(`otp:${purpose}:${phone}`);
}
/** Delete OTP after successful verification */
async function deleteOtp(phone, purpose) {
    await redis.del(`otp:${purpose}:${phone}`);
}
/** Increment OTP attempt counter (max 5 attempts) */
async function incOtpAttempts(phone, purpose) {
    const key = `otp_attempts:${purpose}:${phone}`;
    const count = await redis.incr(key);
    if (count === 1)
        await redis.expire(key, OTP_TTL);
    return count;
}
async function resetOtpAttempts(phone, purpose) {
    await redis.del(`otp_attempts:${purpose}:${phone}`);
}
// ── Refresh token blacklist ───────────────────────────────────────────────────
const RT_TTL = 60 * 60 * 24 * 30; // 30 days
/** Blacklist a refresh token hash (on logout / revoke) */
async function blacklistToken(tokenHash, ttlSeconds = RT_TTL) {
    await redis.set(`blacklist:${tokenHash}`, "1", { EX: ttlSeconds });
}
/** Returns true if token hash is blacklisted */
async function isTokenBlacklisted(tokenHash) {
    const val = await redis.get(`blacklist:${tokenHash}`);
    return val === "1";
}
// ── PIN lockout ───────────────────────────────────────────────────────────────
const PIN_LOCK_TTL = 30; // 30s lockout
const PIN_MAX_ATTEMPTS = 5;
async function incPinAttempts(userId) {
    const key = `pin_attempts:${userId}`;
    const count = await redis.incr(key);
    if (count === 1)
        await redis.expire(key, PIN_LOCK_TTL * PIN_MAX_ATTEMPTS);
    return count;
}
async function getPinAttempts(userId) {
    const val = await redis.get(`pin_attempts:${userId}`);
    return val ? Number(val) : 0;
}
async function resetPinAttempts(userId) {
    await redis.del(`pin_attempts:${userId}`);
}
async function isPinLocked(userId) {
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
async function setOtpInternal(phone, purpose, otp) {
    await redis.set(`otp_internal:${purpose}:${phone}`, otp, { EX: INTERNAL_OTP_TTL });
}
/**
 * Retrieve plaintext OTP for internal callback (TEST mode only).
 * Returns null if expired or not found.
 */
async function getOtpInternal(phone, purpose) {
    return redis.get(`otp_internal:${purpose}:${phone}`);
}
/** Delete internal OTP after it has been consumed */
async function deleteOtpInternal(phone, purpose) {
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
async function setPostOtpStep(phone, step) {
    await redis.set(`post_otp_step:${phone}`, step, { EX: STEP_TOKEN_TTL });
}
async function getPostOtpStep(phone) {
    return redis.get(`post_otp_step:${phone}`);
}
async function deletePostOtpStep(phone) {
    await redis.del(`post_otp_step:${phone}`);
}
