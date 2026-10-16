/**
 * server.ts — Server-only config (Node.js backend services only).
 *
 * ⚠  KHÔNG import file này từ browser / React / mobile app.
 *    Chỉ dùng trong: api-gateway, fiat-connector, swift-gateway, worker services.
 *
 * Tất cả values đọc từ process.env tại runtime — không có giá trị nào
 * được bundle vào dist khi import trong server context.
 *
 * Cách dùng:
 *   import { MAIL_CONFIG, SWIFT_CONFIG } from "@wikialisa/config/server";
 */

// ─── Stalwart Mail Server ─────────────────────────────────────────────────────

export const MAIL_CONFIG = {
  SMTP_HOST:   process.env["SMTP_HOST"]   ?? "mail.axvn.vn",
  SMTP_PORT:   Number(process.env["SMTP_PORT"] ?? 587),
  SMTP_SECURE: process.env["SMTP_SECURE"] === "true",
  SMTP_USER:   process.env["SMTP_USER"]   ?? "no-reply@axvn.vn",
  SMTP_PASS:   process.env["SMTP_PASS"]   ?? "",
  EMAIL_FROM:  process.env["EMAIL_FROM"]  ?? "AXQ System <no-reply@axvn.vn>",
} as const;

// ─── SWIFT Alliance Gateway ───────────────────────────────────────────────────

export const SWIFT_CONFIG = {
  /** OAuth2 consumer key từ SWIFT Developer Portal */
  CONSUMER_KEY:    process.env["SWIFT_CONSUMER_KEY"]    ?? "",
  /** OAuth2 consumer secret */
  CONSUMER_SECRET: process.env["SWIFT_CONSUMER_SECRET"] ?? "",
  /** SWIFTNet endpoint (sandbox / live) */
  API_BASE_URL:    process.env["SWIFT_API_BASE_URL"]    ?? "https://sandbox.swift.com/swift-preval/v1",
  /** LAU HMAC-SHA256 key (32+ hex chars) */
  LAU_KEY:         process.env["SWIFT_LAU_KEY"]         ?? "",
  /** Redis stream cho outbound messages */
  OUTBOUND_STREAM: process.env["SWIFT_OUTBOUND_STREAM"] ?? "vnkr:swift:outbound",
  /** Redis stream cho inbound ACK */
  INBOUND_STREAM:  process.env["SWIFT_INBOUND_STREAM"]  ?? "vnkr:swift:inbound",
} as const;

// ─── Database ─────────────────────────────────────────────────────────────────

export const DB_CONFIG = {
  DATABASE_URL: process.env["DATABASE_URL"] ?? "",
  POOL_MAX:     Number(process.env["DB_POOL_MAX"] ?? 20),
  POOL_IDLE_MS: Number(process.env["DB_POOL_IDLE_MS"] ?? 30_000),
} as const;

// ─── Redis ────────────────────────────────────────────────────────────────────

export const REDIS_CONFIG = {
  REDIS_URL:      process.env["REDIS_URL"]      ?? "redis://localhost:6379",
  REDIS_PASSWORD: process.env["REDIS_PASSWORD"] ?? "",
  REDIS_DB:       Number(process.env["REDIS_DB"] ?? 0),
} as const;
