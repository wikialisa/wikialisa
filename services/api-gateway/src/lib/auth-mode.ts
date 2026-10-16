/**
 * lib/auth-mode.ts
 *
 * Hai chế độ xác thực:
 *
 *   TEST     — Không gửi OTP thực. OTP mặc định "000000".
 *              Sau khi verify OTP thành công → redirect sang SetupPin (6 số).
 *              Internal callback endpoint để frontend nhận OTP mà không cần SMS.
 *              Dùng cho dev, staging, e2e testing.
 *
 *   ON-CHAIN — Flow thực: OTP gửi qua SMS/provider thật.
 *              Màn hình OTP confirm bình thường.
 *              Sau khi đăng ký thành công → có thể thiết lập PIN (tuỳ chọn).
 *
 * Cách bật:
 *   AUTH_MODE=test       → chế độ TEST
 *   AUTH_MODE=onchain    → chế độ ON-CHAIN (default production)
 */

export type AuthMode = "test" | "onchain";

/**
 * Returns current auth mode from env.
 * Defaults to "onchain" if not set or invalid.
 */
export function getAuthMode(): AuthMode {
  const raw = (process.env["AUTH_MODE"] ?? "onchain").toLowerCase().trim();
  return raw === "test" ? "test" : "onchain";
}

/** Returns true when running in test mode */
export function isTestMode(): boolean {
  return getAuthMode() === "test";
}

/**
 * In TEST mode, every OTP verifies against this static code.
 * Never used in onchain mode.
 */
export const TEST_OTP_CODE = "000000";

/**
 * In TEST mode, the PIN setup step replaces the OTP confirmation screen.
 * The frontend checks this flag to decide which screen to show.
 */
export const TEST_MODE_NEXT_STEP = "SETUP_PIN" as const;
