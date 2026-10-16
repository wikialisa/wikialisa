/**
 * routes/auth.route.ts
 *
 * Xác thực hai chế độ:
 *
 *   TEST (AUTH_MODE=test):
 *     - Đăng ký không cần OTP xác minh trước (tạo tài khoản ngay)
 *     - /otp/send   → lưu OTP "000000" vào Redis + lưu plaintext để /otp/internal-callback trả về
 *     - /otp/verify → chấp nhận "000000" hoặc OTP thực từ Redis
 *                     → trả về nextStep: "SETUP_PIN" thay vì chuyển màn hình OTP confirm
 *     - /otp/internal-callback → trả về OTP plaintext (chỉ TEST, nội bộ frontend gọi backend)
 *     - Đăng nhập  → trả về nextStep: "SETUP_PIN" nếu chưa có PIN
 *
 *   ON-CHAIN (AUTH_MODE=onchain, default production):
 *     - Đăng ký yêu cầu OTP xác minh qua SMS trước khi tạo tài khoản
 *     - /otp/send   → gửi SMS thực (cần SMS provider)
 *     - /otp/verify → so khớp OTP thực
 *     - /otp/internal-callback → 403 Forbidden
 *     - Thiết lập PIN là bước tuỳ chọn sau khi đăng nhập
 */

import { Router }       from "express";
import bcrypt           from "bcryptjs";
import speakeasy        from "speakeasy";
import qrcode           from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { ok, created, fail } from "../lib/response.js";
import { auditLog, buildAuditContext } from "../lib/audit.js";
import { queryOne, query } from "../lib/db.js";
import {
  setOtp, getOtp, deleteOtp, incOtpAttempts, resetOtpAttempts,
  blacklistToken, isTokenBlacklisted,
  incPinAttempts, resetPinAttempts, isPinLocked,
  setOtpInternal, getOtpInternal, deleteOtpInternal,
  setPostOtpStep, getPostOtpStep,
} from "../lib/redis.js";
import { isTestMode, TEST_OTP_CODE, TEST_MODE_NEXT_STEP } from "../lib/auth-mode.js";
import type {
  RegisterRequest, LoginRequest, RefreshTokenRequest,
  ForgotPasswordRequest, ResetPasswordRequest,
  Enable2FARequest, Disable2FARequest, VerifyPinRequest,
} from "@wikialisa/types";
import crypto from "crypto";

export const authRouter = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate a 6-digit numeric OTP */
function generateOtp(): string {
  return String(Math.floor(100000 + crypto.randomInt(900000)));
}

/** SHA-256 hash of a token string (for blacklist key) */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Determine the next step after OTP verification.
 * TEST mode  → always "SETUP_PIN" (màn hình OTP confirm → thiết lập PIN)
 * ON-CHAIN   → "COMPLETE" (flow thông thường, PIN tuỳ chọn sau)
 */
function resolveNextStep(): "SETUP_PIN" | "COMPLETE" {
  return isTestMode() ? TEST_MODE_NEXT_STEP : "COMPLETE";
}

// ─── GET /api/v1/auth/mode ────────────────────────────────────────────────────
// Frontend gọi để biết chế độ hiện tại và điều chỉnh UI
authRouter.get("/mode", (_req, res) => {
  ok(res, {
    mode:        isTestMode() ? "test" : "onchain",
    otpRequired: !isTestMode(),          // TEST: không cần nhập OTP thực
    pinSetupOnVerify: isTestMode(),      // TEST: sau verify → màn hình PIN
    testOtp:     isTestMode() ? TEST_OTP_CODE : null, // chỉ trả về trong test
  }, "Auth mode info");
});

// ─── POST /api/v1/auth/register ───────────────────────────────────────────────
//
// TEST mode:
//   - Tạo tài khoản ngay, không cần OTP trước
//   - Trả về accessToken + refreshToken + nextStep: "SETUP_PIN"
//
// ON-CHAIN mode:
//   - Yêu cầu otpVerified: true trong body (frontend phải gọi /otp/verify trước)
//   - Tạo tài khoản chỉ khi OTP đã được xác minh
// ──────────────────────────────────────────────────────────────────────────────
authRouter.post("/register", async (req, res) => {
  const body = req.body as RegisterRequest & { otpVerified?: boolean };

  if (!body.password || (!body.phone && !body.email)) {
    fail(res, "Vui lòng cung cấp số điện thoại/email và mật khẩu", 400, "VALIDATION_ERROR");
    return;
  }

  // ON-CHAIN: bắt buộc OTP phải được xác minh trước
  if (!isTestMode() && !body.otpVerified) {
    fail(res, "Vui lòng xác minh OTP trước khi đăng ký", 400, "OTP_REQUIRED");
    return;
  }

  const existing = await queryOne(
    "SELECT id FROM users WHERE phone = $1 OR email = $2",
    [body.phone ?? null, body.email ?? null]
  );
  if (existing) {
    fail(res, "Số điện thoại hoặc email đã được đăng ký", 409, "ALREADY_EXISTS");
    return;
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const userId       = uuidv4();
  const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();

  await query(
    `INSERT INTO users (id, phone, email, password_hash, full_name, referral_code)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, body.phone ?? null, body.email ?? null, passwordHash, body.fullName ?? null, referralCode]
  );

  const accessToken  = signAccessToken({ sub: userId, role: "user" });
  const refreshToken = signRefreshToken({ sub: userId, role: "user" });

  await query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 days')",
    [userId, hashToken(refreshToken)]
  );

  await auditLog({
    userId, action: "REGISTER", resource: "users",
    ...buildAuditContext(req), timestamp: new Date().toISOString(),
  });

  // TEST mode: nextStep = SETUP_PIN (frontend chuyển màn hình thiết lập PIN)
  // ON-CHAIN:  nextStep = COMPLETE  (PIN tuỳ chọn)
  created(res, {
    userId,
    accessToken,
    refreshToken,
    expiresIn:  900,
    nextStep:   resolveNextStep(),
    mode:       isTestMode() ? "test" : "onchain",
  }, "Đăng ký thành công");
});

// ─── POST /api/v1/auth/otp/send ───────────────────────────────────────────────
//
// TEST mode:
//   - Lưu OTP = "000000" vào Redis (hash)
//   - Lưu plaintext OTP vào otp_internal store để /otp/internal-callback trả về
//   - Không gửi SMS
//
// ON-CHAIN mode:
//   - Sinh OTP ngẫu nhiên, bcrypt hash → Redis
//   - Gửi qua SMS provider (ESMS / Twilio) — TODO
// ──────────────────────────────────────────────────────────────────────────────
authRouter.post("/otp/send", async (req, res) => {
  const { phone, purpose = "REGISTER" } = req.body as { phone: string; purpose?: string };
  if (!phone) { fail(res, "Số điện thoại bắt buộc", 400, "VALIDATION_ERROR"); return; }

  let otp: string;

  if (isTestMode()) {
    // TEST: dùng OTP tĩnh "000000"
    otp = TEST_OTP_CODE;
    const hash = await bcrypt.hash(otp, 10);
    await setOtp(phone, purpose, hash);
    // Lưu plaintext để /otp/internal-callback trả về cho frontend
    await setOtpInternal(phone, purpose, otp);

    console.log(`[AUTH TEST] OTP for ${phone}/${purpose}: ${otp} (static code)`);
  } else {
    // ON-CHAIN: sinh OTP ngẫu nhiên, gửi SMS
    otp = generateOtp();
    const hash = await bcrypt.hash(otp, 10);
    await setOtp(phone, purpose, hash);

    // TODO: gọi SMS provider (ESMS, Twilio, Vonage…)
    // await sendSms(phone, `Mã OTP AXQ của bạn: ${otp}. Hết hạn sau 5 phút.`);
    if (process.env["NODE_ENV"] !== "production") {
      console.log(`[OTP DEV] ${phone} / ${purpose}: ${otp}`);
    }
  }

  await auditLog({
    userId: phone, action: "OTP_SEND", resource: "auth",
    ...buildAuditContext(req), timestamp: new Date().toISOString(),
  });

  ok(res, {
    sent:         true,
    mode:         isTestMode() ? "test" : "onchain",
    // TEST mode: trả về hint để frontend biết dùng internal-callback
    internalCallback: isTestMode() ? `/api/v1/auth/otp/internal-callback` : null,
  }, "Mã OTP đã được gửi");
});

// ─── POST /api/v1/auth/otp/verify ─────────────────────────────────────────────
//
// TEST mode:
//   - Chấp nhận "000000" hoặc bất kỳ OTP nào đang lưu trong Redis
//   - Trả về nextStep: "SETUP_PIN" → frontend chuyển sang màn hình thiết lập PIN 6 số
//
// ON-CHAIN mode:
//   - So khớp OTP bcrypt bình thường
//   - Trả về nextStep: "COMPLETE"
// ──────────────────────────────────────────────────────────────────────────────
authRouter.post("/otp/verify", async (req, res) => {
  const { phone, otp, purpose = "REGISTER" } = req.body as {
    phone: string; otp: string; purpose?: string;
  };
  if (!phone || !otp) { fail(res, "Thiếu phone hoặc otp", 400, "VALIDATION_ERROR"); return; }

  const attempts = await incOtpAttempts(phone, purpose);
  if (attempts > 5) {
    fail(res, "Quá nhiều lần thử. Vui lòng yêu cầu OTP mới.", 429, "TOO_MANY_ATTEMPTS");
    return;
  }

  let valid = false;

  if (isTestMode()) {
    // TEST: "000000" luôn hợp lệ; hoặc so khớp hash thực nếu có
    if (otp === TEST_OTP_CODE) {
      valid = true;
    } else {
      const hash = await getOtp(phone, purpose);
      valid = hash ? await bcrypt.compare(otp, hash) : false;
    }
  } else {
    // ON-CHAIN: so khớp hash bình thường
    const hash = await getOtp(phone, purpose);
    if (!hash) {
      fail(res, "Mã OTP đã hết hạn hoặc không tồn tại", 400, "OTP_EXPIRED");
      return;
    }
    valid = await bcrypt.compare(otp, hash);
  }

  if (!valid) {
    fail(res, "Mã OTP không đúng", 401, "INVALID_OTP");
    return;
  }

  // Cleanup
  await deleteOtp(phone, purpose);
  await deleteOtpInternal(phone, purpose);
  await resetOtpAttempts(phone, purpose);

  // Lưu next step cho phone này (dùng khi frontend hỏi lại)
  const nextStep = resolveNextStep();
  await setPostOtpStep(phone, nextStep);

  ok(res, {
    verified: true,
    nextStep,           // "SETUP_PIN" (test) hoặc "COMPLETE" (onchain)
    mode:     isTestMode() ? "test" : "onchain",
  }, isTestMode()
    ? "OTP xác thực thành công — Vui lòng thiết lập PIN 6 số"
    : "OTP xác thực thành công"
  );
});

// ─── POST /api/v1/auth/otp/resend ─────────────────────────────────────────────
authRouter.post("/otp/resend", async (req, res) => {
  const { phone, purpose = "REGISTER" } = req.body as { phone: string; purpose?: string };
  if (!phone) { fail(res, "Số điện thoại bắt buộc", 400, "VALIDATION_ERROR"); return; }

  await resetOtpAttempts(phone, purpose);

  let otp: string;

  if (isTestMode()) {
    otp = TEST_OTP_CODE;
    const hash = await bcrypt.hash(otp, 10);
    await setOtp(phone, purpose, hash);
    await setOtpInternal(phone, purpose, otp);
    console.log(`[AUTH TEST] OTP resend for ${phone}/${purpose}: ${otp} (static)`);
  } else {
    otp = generateOtp();
    const hash = await bcrypt.hash(otp, 10);
    await setOtp(phone, purpose, hash);
    // TODO: gửi SMS
    if (process.env["NODE_ENV"] !== "production") {
      console.log(`[OTP RESEND] ${phone} / ${purpose}: ${otp}`);
    }
  }

  ok(res, {
    sent: true,
    mode: isTestMode() ? "test" : "onchain",
    internalCallback: isTestMode() ? `/api/v1/auth/otp/internal-callback` : null,
  }, "Đã gửi lại OTP");
});

// ─── POST /api/v1/auth/otp/internal-callback ──────────────────────────────────
//
// CHỈ hoạt động trong TEST mode.
// Frontend gọi ngay sau /otp/send để nhận OTP nội bộ mà không qua SMS.
// Mô phỏng callback từ SMS provider đến frontend — không qua bên thứ 3.
//
// Body: { phone: string, purpose?: string }
// Response: { otp: string }
//
// ON-CHAIN: trả về 403 Forbidden
// ──────────────────────────────────────────────────────────────────────────────
authRouter.post("/otp/internal-callback", async (req, res) => {
  if (!isTestMode()) {
    fail(res, "Internal callback chỉ khả dụng trong TEST mode", 403, "TEST_MODE_ONLY");
    return;
  }

  const { phone, purpose = "REGISTER" } = req.body as { phone: string; purpose?: string };
  if (!phone) { fail(res, "Số điện thoại bắt buộc", 400, "VALIDATION_ERROR"); return; }

  const otp = await getOtpInternal(phone, purpose);
  if (!otp) {
    fail(res, "OTP không tồn tại hoặc đã hết hạn. Vui lòng gọi /otp/send trước.", 404, "OTP_NOT_FOUND");
    return;
  }

  // Trả về OTP plaintext — frontend tự điền vào form
  ok(res, {
    otp,
    phone,
    purpose,
    expiresInSeconds: 120,
    note: "TEST mode only — not available in production",
  }, "OTP nội bộ (test mode)");
});

// ─── GET /api/v1/auth/otp/next-step ──────────────────────────────────────────
// Frontend gọi để hỏi bước tiếp theo sau OTP verify.
// Trả về: { nextStep: "SETUP_PIN" | "COMPLETE" }
authRouter.get("/otp/next-step", async (req, res) => {
  const phone = req.query["phone"] as string | undefined;
  if (!phone) { fail(res, "phone query param bắt buộc", 400, "VALIDATION_ERROR"); return; }

  const step = await getPostOtpStep(phone);
  ok(res, {
    nextStep: step ?? resolveNextStep(),
    mode:     isTestMode() ? "test" : "onchain",
  });
});

// ─── POST /api/v1/auth/login ──────────────────────────────────────────────────
//
// TEST mode:
//   - Đăng nhập thông thường
//   - Nếu user chưa có PIN → trả về nextStep: "SETUP_PIN"
//   - Nếu đã có PIN        → trả về nextStep: "VERIFY_PIN"
//
// ON-CHAIN:
//   - Đăng nhập thông thường
//   - nextStep: "VERIFY_PIN" hoặc "COMPLETE"
// ──────────────────────────────────────────────────────────────────────────────
authRouter.post("/login", async (req, res) => {
  const body = req.body as LoginRequest;
  if (!body.identifier || !body.password) {
    fail(res, "Thiếu thông tin đăng nhập", 400, "VALIDATION_ERROR");
    return;
  }

  const user = await queryOne<{
    id: string; password_hash: string; role: string;
    account_status: string; full_name: string; pin_hash: string | null;
  }>(
    "SELECT id, password_hash, role, account_status, full_name, pin_hash FROM users WHERE phone = $1 OR email = $1",
    [body.identifier]
  );

  if (!user) {
    fail(res, "Thông tin đăng nhập không đúng", 401, "INVALID_CREDENTIALS");
    return;
  }
  if (user.account_status !== "ACTIVE") {
    fail(res, "Tài khoản bị khoá hoặc tạm ngưng", 403, "ACCOUNT_LOCKED");
    return;
  }

  const passwordOk = await bcrypt.compare(body.password, user.password_hash);
  if (!passwordOk) {
    fail(res, "Thông tin đăng nhập không đúng", 401, "INVALID_CREDENTIALS");
    return;
  }

  const accessToken  = signAccessToken({ sub: user.id, role: user.role as any });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role as any });

  await query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 days')",
    [user.id, hashToken(refreshToken)]
  );

  await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [user.id]);

  // Xác định nextStep dựa trên trạng thái PIN và chế độ
  let nextStep: "SETUP_PIN" | "VERIFY_PIN" | "COMPLETE";
  if (!user.pin_hash) {
    // Chưa có PIN → cần thiết lập (cả hai chế độ)
    nextStep = "SETUP_PIN";
  } else {
    // Đã có PIN → yêu cầu xác minh
    nextStep = "VERIFY_PIN";
  }

  await auditLog({
    userId: user.id, action: "LOGIN", resource: "auth",
    ...buildAuditContext(req), timestamp: new Date().toISOString(),
  });

  ok(res, {
    userId:       user.id,
    accessToken,
    refreshToken,
    expiresIn:    900,
    fullName:     user.full_name,
    hasPIN:       !!user.pin_hash,
    nextStep,
    mode:         isTestMode() ? "test" : "onchain",
  }, "Đăng nhập thành công");
});

// ─── POST /api/v1/auth/refresh-token ─────────────────────────────────────────
authRouter.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body as RefreshTokenRequest;
  if (!refreshToken) { fail(res, "Missing refresh token", 400, "VALIDATION_ERROR"); return; }

  if (await isTokenBlacklisted(hashToken(refreshToken))) {
    fail(res, "Refresh token đã bị thu hồi", 401, "TOKEN_REVOKED");
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    const stored = await queryOne(
      "SELECT id, revoked FROM refresh_tokens WHERE token_hash = $1 AND user_id = $2",
      [hashToken(refreshToken), payload.sub]
    );
    if (!stored || (stored as { revoked: boolean }).revoked) {
      fail(res, "Refresh token không hợp lệ", 401, "INVALID_REFRESH_TOKEN");
      return;
    }

    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role });
    ok(res, { accessToken, expiresIn: 900 });
  } catch {
    fail(res, "Refresh token không hợp lệ hoặc đã hết hạn", 401, "INVALID_REFRESH_TOKEN");
  }
});

// ─── POST /api/v1/auth/logout ─────────────────────────────────────────────────
authRouter.post("/logout", authenticate, async (req, res) => {
  const authHeader = req.headers.authorization ?? "";
  const token      = authHeader.replace("Bearer ", "").trim();

  if (token) await blacklistToken(hashToken(token), 900);

  await query(
    "UPDATE refresh_tokens SET revoked = TRUE, revoked_at = NOW() WHERE user_id = $1 AND revoked = FALSE",
    [req.user!.sub]
  );

  await auditLog({
    userId: req.user!.sub, action: "LOGOUT", resource: "auth",
    ...buildAuditContext(req), timestamp: new Date().toISOString(),
  });
  ok(res, null, "Đã đăng xuất thành công");
});

// ─── POST /api/v1/auth/forgot-password ───────────────────────────────────────
authRouter.post("/forgot-password", async (req, res) => {
  const { identifier } = req.body as ForgotPasswordRequest;
  if (!identifier) { fail(res, "Vui lòng cung cấp email hoặc số điện thoại", 400, "VALIDATION_ERROR"); return; }

  const user = await queryOne<{ phone: string }>(
    "SELECT phone FROM users WHERE phone = $1 OR email = $1", [identifier]
  );

  if (user) {
    let otp: string;
    if (isTestMode()) {
      otp = TEST_OTP_CODE;
      await setOtpInternal(identifier, "RESET_PASSWORD", otp);
    } else {
      otp = generateOtp();
      // TODO: gửi SMS
      if (process.env["NODE_ENV"] !== "production") {
        console.log(`[OTP RESET_PASSWORD] ${identifier}: ${otp}`);
      }
    }
    const hash = await bcrypt.hash(otp, 10);
    await setOtp(identifier, "RESET_PASSWORD", hash);
  }

  ok(res, {
    otpSent: true,
    mode: isTestMode() ? "test" : "onchain",
    internalCallback: isTestMode() ? `/api/v1/auth/otp/internal-callback` : null,
  }, "Mã khôi phục đã được gửi nếu tài khoản tồn tại");
});

// ─── POST /api/v1/auth/reset-password ────────────────────────────────────────
authRouter.post("/reset-password", async (req, res) => {
  const body = req.body as ResetPasswordRequest;
  if (!body.otp || !body.newPassword || !body.identifier) {
    fail(res, "Thiếu thông tin xác nhận", 400, "VALIDATION_ERROR");
    return;
  }

  let valid = false;

  if (isTestMode() && body.otp === TEST_OTP_CODE) {
    // TEST: "000000" luôn hợp lệ
    valid = true;
  } else {
    const hash = await getOtp(body.identifier, "RESET_PASSWORD");
    if (!hash) { fail(res, "OTP hết hạn hoặc không tồn tại", 400, "OTP_EXPIRED"); return; }
    valid = await bcrypt.compare(body.otp, hash);
  }

  if (!valid) { fail(res, "OTP không đúng", 401, "INVALID_OTP"); return; }

  const newHash = await bcrypt.hash(body.newPassword, 12);
  await query(
    "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE phone = $2 OR email = $2",
    [newHash, body.identifier]
  );
  await deleteOtp(body.identifier, "RESET_PASSWORD");
  await deleteOtpInternal(body.identifier, "RESET_PASSWORD");

  ok(res, null, "Mật khẩu đã được cập nhật thành công");
});

// ─── POST /api/v1/auth/pin/set ────────────────────────────────────────────────
//
// Thiết lập PIN 6 số — được gọi sau:
//   TEST:    sau khi /otp/verify trả về nextStep: "SETUP_PIN"
//   ON-CHAIN: bất kỳ lúc nào khi đã authenticated
//
// Yêu cầu: Bearer token (authenticate middleware)
// Body: { newPin: string (6 chữ số), confirmPin: string }
// ──────────────────────────────────────────────────────────────────────────────
authRouter.post("/pin/set", authenticate, async (req, res) => {
  const { newPin, confirmPin } = req.body as { newPin: string; confirmPin?: string };

  if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
    fail(res, "PIN phải là 6 chữ số", 400, "VALIDATION_ERROR");
    return;
  }
  if (confirmPin !== undefined && confirmPin !== newPin) {
    fail(res, "PIN xác nhận không khớp", 400, "PIN_MISMATCH");
    return;
  }

  const pinHash = await bcrypt.hash(newPin, 12);
  await query("UPDATE users SET pin_hash = $1, updated_at = NOW() WHERE id = $2", [pinHash, req.user!.sub]);
  await resetPinAttempts(req.user!.sub);

  await auditLog({
    userId: req.user!.sub, action: "PIN_SET", resource: "security",
    ...buildAuditContext(req), timestamp: new Date().toISOString(),
  });

  ok(res, {
    pinSet:   true,
    nextStep: "COMPLETE",
    mode:     isTestMode() ? "test" : "onchain",
  }, "PIN đã được thiết lập thành công");
});

// ─── POST /api/v1/auth/pin/setup-after-verify ─────────────────────────────────
//
// Alias cho /pin/set dành riêng cho luồng TEST:
//   1. User gọi /otp/send → nhận callback từ /otp/internal-callback
//   2. User gọi /otp/verify → nhận nextStep: "SETUP_PIN" + accessToken (qua register)
//   3. User gọi /pin/setup-after-verify với PIN 6 số
//   → tương đương /pin/set nhưng tên rõ ràng hơn cho frontend test mode
//
// Cũng hoạt động trong ON-CHAIN (nếu frontend muốn dùng endpoint này)
// ──────────────────────────────────────────────────────────────────────────────
authRouter.post("/pin/setup-after-verify", authenticate, async (req, res) => {
  const { pin, confirmPin } = req.body as { pin: string; confirmPin?: string };

  if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    fail(res, "PIN phải là 6 chữ số", 400, "VALIDATION_ERROR");
    return;
  }
  if (confirmPin !== undefined && confirmPin !== pin) {
    fail(res, "PIN xác nhận không khớp", 400, "PIN_MISMATCH");
    return;
  }

  const pinHash = await bcrypt.hash(pin, 12);
  await query("UPDATE users SET pin_hash = $1, updated_at = NOW() WHERE id = $2", [pinHash, req.user!.sub]);
  await resetPinAttempts(req.user!.sub);

  await auditLog({
    userId: req.user!.sub, action: "PIN_SETUP_AFTER_VERIFY", resource: "security",
    ...buildAuditContext(req), timestamp: new Date().toISOString(),
  });

  ok(res, {
    pinSet:     true,
    nextStep:   "COMPLETE",
    setupFlow:  isTestMode() ? "test_otp_to_pin" : "onchain_verify_to_pin",
    mode:       isTestMode() ? "test" : "onchain",
  }, "PIN đã được thiết lập — Đăng ký hoàn tất!");
});

// ─── POST /api/v1/auth/pin/verify ────────────────────────────────────────────
authRouter.post("/pin/verify", authenticate, async (req, res) => {
  const { pin, action } = req.body as VerifyPinRequest;
  if (!pin || !action) { fail(res, "PIN và action bắt buộc", 400, "VALIDATION_ERROR"); return; }

  if (await isPinLocked(req.user!.sub)) {
    fail(res, "PIN tạm thời bị khoá. Vui lòng chờ 30 giây.", 429, "PIN_LOCKED");
    return;
  }

  const user = await queryOne<{ pin_hash: string | null }>(
    "SELECT pin_hash FROM users WHERE id = $1", [req.user!.sub]
  );
  if (!user?.pin_hash) {
    fail(res, "Chưa thiết lập PIN", 400, "PIN_NOT_SET");
    return;
  }

  const valid = await bcrypt.compare(pin, user.pin_hash);
  if (!valid) {
    await incPinAttempts(req.user!.sub);
    fail(res, "PIN không đúng", 401, "INVALID_PIN");
    return;
  }

  await resetPinAttempts(req.user!.sub);
  const verifyToken = signAccessToken({ sub: req.user!.sub, role: req.user!.role });
  await auditLog({
    userId: req.user!.sub, action: `PIN_VERIFY:${action}`, resource: "security",
    ...buildAuditContext(req), timestamp: new Date().toISOString(),
  });
  ok(res, { verified: true, verifyToken }, "PIN xác thực thành công");
});

// ─── POST /api/v1/auth/2fa/setup ─────────────────────────────────────────────
authRouter.post("/2fa/setup", authenticate, async (req, res) => {
  const user = await queryOne<{ phone: string }>("SELECT phone FROM users WHERE id = $1", [req.user!.sub]);
  const secret = speakeasy.generateSecret({ name: `AXQ:${user?.phone ?? req.user!.sub}`, length: 20 });
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url ?? "");

  await query("UPDATE users SET totp_secret = $1 WHERE id = $2", [secret.base32, req.user!.sub]);

  ok(res, {
    secret:      secret.base32,
    qrCodeUrl,
    backupCodes: Array.from({ length: 8 }, () => uuidv4().slice(0, 8).toUpperCase()),
  });
});

// ─── POST /api/v1/auth/2fa/enable ────────────────────────────────────────────
authRouter.post("/2fa/enable", authenticate, async (req, res) => {
  const { totpCode } = req.body as Enable2FARequest;
  if (!totpCode) { fail(res, "Mã TOTP bắt buộc", 400, "VALIDATION_ERROR"); return; }

  const user = await queryOne<{ totp_secret: string | null }>(
    "SELECT totp_secret FROM users WHERE id = $1", [req.user!.sub]
  );
  if (!user?.totp_secret) { fail(res, "Chưa thiết lập 2FA secret", 400, "2FA_NOT_SETUP"); return; }

  const valid = speakeasy.totp.verify({
    secret:   user.totp_secret,
    encoding: "base32",
    token:    totpCode,
    window:   2,
  });
  if (!valid) { fail(res, "Mã TOTP không đúng", 401, "INVALID_TOTP"); return; }

  await query("UPDATE users SET totp_enabled = TRUE WHERE id = $1", [req.user!.sub]);
  await auditLog({
    userId: req.user!.sub, action: "2FA_ENABLE", resource: "security",
    ...buildAuditContext(req), timestamp: new Date().toISOString(),
  });
  ok(res, { twoFAEnabled: true }, "2FA đã được kích hoạt");
});

// ─── POST /api/v1/auth/2fa/disable ───────────────────────────────────────────
authRouter.post("/2fa/disable", authenticate, async (req, res) => {
  const { totpCode } = req.body as Disable2FARequest;
  if (!totpCode) { fail(res, "Cần mã TOTP để tắt 2FA", 400, "VALIDATION_ERROR"); return; }

  const user = await queryOne<{ totp_secret: string | null }>(
    "SELECT totp_secret FROM users WHERE id = $1", [req.user!.sub]
  );
  const valid = user?.totp_secret && speakeasy.totp.verify({
    secret:   user.totp_secret,
    encoding: "base32",
    token:    totpCode,
    window:   2,
  });
  if (!valid) { fail(res, "Mã TOTP không đúng", 401, "INVALID_TOTP"); return; }

  await query("UPDATE users SET totp_enabled = FALSE, totp_secret = NULL WHERE id = $1", [req.user!.sub]);
  await auditLog({
    userId: req.user!.sub, action: "2FA_DISABLE", resource: "security",
    ...buildAuditContext(req), timestamp: new Date().toISOString(),
  });
  ok(res, { twoFAEnabled: false }, "2FA đã được tắt");
});
