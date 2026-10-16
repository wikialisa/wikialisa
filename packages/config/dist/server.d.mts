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
declare const MAIL_CONFIG: {
    readonly SMTP_HOST: string;
    readonly SMTP_PORT: number;
    readonly SMTP_SECURE: boolean;
    readonly SMTP_USER: string;
    readonly SMTP_PASS: string;
    readonly EMAIL_FROM: string;
};
declare const SWIFT_CONFIG: {
    /** OAuth2 consumer key từ SWIFT Developer Portal */
    readonly CONSUMER_KEY: string;
    /** OAuth2 consumer secret */
    readonly CONSUMER_SECRET: string;
    /** SWIFTNet endpoint (sandbox / live) */
    readonly API_BASE_URL: string;
    /** LAU HMAC-SHA256 key (32+ hex chars) */
    readonly LAU_KEY: string;
    /** Redis stream cho outbound messages */
    readonly OUTBOUND_STREAM: string;
    /** Redis stream cho inbound ACK */
    readonly INBOUND_STREAM: string;
};
declare const DB_CONFIG: {
    readonly DATABASE_URL: string;
    readonly POOL_MAX: number;
    readonly POOL_IDLE_MS: number;
};
declare const REDIS_CONFIG: {
    readonly REDIS_URL: string;
    readonly REDIS_PASSWORD: string;
    readonly REDIS_DB: number;
};

export { DB_CONFIG, MAIL_CONFIG, REDIS_CONFIG, SWIFT_CONFIG };
