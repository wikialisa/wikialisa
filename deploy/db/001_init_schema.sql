-- ═══════════════════════════════════════════════════════════════════════════
--  AXQ Vietnam — PostgreSQL Schema Migration 001
--  Database : db
--  Created  : 2026-10-05
--  Run      : psql -U vnkr -d db -f deploy/db/001_init_schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUM TYPES ──────────────────────────────────────────────────────────────

CREATE TYPE kyc_status      AS ENUM ('NONE','PENDING','LEVEL1','LEVEL2','LEVEL3','REJECTED','SUSPENDED');
CREATE TYPE account_status  AS ENUM ('ACTIVE','LOCKED','SUSPENDED','CLOSED');
CREATE TYPE tx_status       AS ENUM ('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED','REFUNDED');
CREATE TYPE tx_type         AS ENUM ('TRANSFER','P2P','SWIFT','ONRAMP','OFFRAMP','CASHBACK','REFERRAL','STAKING','FEE');
CREATE TYPE tx_direction    AS ENUM ('IN','OUT','INTERNAL');
CREATE TYPE otp_purpose     AS ENUM ('REGISTER','LOGIN','TRANSFER','RESET_PIN','RESET_PASSWORD','WITHDRAW');
CREATE TYPE doc_type        AS ENUM ('CCCD','PASSPORT','DRIVER_LICENSE');
CREATE TYPE bill_status     AS ENUM ('ACTIVE','PAUSED','FAILED','PENDING','CANCELLED');
CREATE TYPE card_status     AS ENUM ('ACTIVE','FROZEN','CANCELLED');
CREATE TYPE device_status   AS ENUM ('TRUSTED','REVOKED');

-- ─── USERS ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
    id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone             VARCHAR(20) UNIQUE NOT NULL,
    email             VARCHAR(255) UNIQUE,
    password_hash     TEXT        NOT NULL,
    pin_hash          TEXT,                           -- bcrypt(PIN, 12) — NEVER plaintext
    full_name         VARCHAR(255),
    avatar_url        TEXT,
    kyc_status        kyc_status  NOT NULL DEFAULT 'NONE',
    account_status    account_status NOT NULL DEFAULT 'ACTIVE',
    role              VARCHAR(50) NOT NULL DEFAULT 'user',  -- user | admin | compliance
    referral_code     VARCHAR(20) UNIQUE,
    referred_by       UUID        REFERENCES users(id),
    totp_secret       TEXT,                           -- encrypted TOTP secret
    totp_enabled      BOOLEAN     NOT NULL DEFAULT FALSE,
    last_login_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone   ON users(phone);
CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_role    ON users(role);
CREATE INDEX idx_users_kyc     ON users(kyc_status);

-- ─── OTP (stored in Redis primary, PostgreSQL fallback/audit) ────────────────

CREATE TABLE otp_logs (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,
    phone       VARCHAR(20) NOT NULL,
    purpose     otp_purpose NOT NULL,
    code_hash   TEXT        NOT NULL,                -- bcrypt hash of OTP
    expires_at  TIMESTAMPTZ NOT NULL,
    verified    BOOLEAN     NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    attempts    INT         NOT NULL DEFAULT 0,
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_phone   ON otp_logs(phone, purpose);
CREATE INDEX idx_otp_expires ON otp_logs(expires_at);

-- ─── WALLETS ─────────────────────────────────────────────────────────────────

CREATE TABLE wallets (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency    VARCHAR(20) NOT NULL,               -- VND, AXQ, USDT, BTC, ETH, SOL
    balance     NUMERIC(36,8) NOT NULL DEFAULT 0,
    locked      NUMERIC(36,8) NOT NULL DEFAULT 0,   -- funds in escrow
    address     TEXT,                               -- on-chain address (crypto only)
    network     VARCHAR(20),                        -- TRC20, ERC20, SOL, etc.
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, currency)
);

CREATE INDEX idx_wallets_user     ON wallets(user_id);
CREATE INDEX idx_wallets_currency ON wallets(currency);

-- ─── TRANSACTIONS ────────────────────────────────────────────────────────────

CREATE TABLE transactions (
    id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_ref            VARCHAR(64) UNIQUE NOT NULL,  -- idempotency key
    user_id           UUID        NOT NULL REFERENCES users(id),
    counterpart_id    UUID        REFERENCES users(id),
    type              tx_type     NOT NULL,
    direction         tx_direction NOT NULL,
    currency          VARCHAR(20) NOT NULL,
    amount            NUMERIC(36,8) NOT NULL,
    fee               NUMERIC(36,8) NOT NULL DEFAULT 0,
    status            tx_status   NOT NULL DEFAULT 'PENDING',
    description       TEXT,
    metadata          JSONB       DEFAULT '{}',     -- flexible: bank_code, swift_ref, etc.
    ip_address        INET,
    otp_verified      BOOLEAN     NOT NULL DEFAULT FALSE,
    pin_verified      BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at      TIMESTAMPTZ
);

CREATE INDEX idx_tx_user      ON transactions(user_id, created_at DESC);
CREATE INDEX idx_tx_ref       ON transactions(tx_ref);
CREATE INDEX idx_tx_status    ON transactions(status);
CREATE INDEX idx_tx_type      ON transactions(type);
CREATE INDEX idx_tx_created   ON transactions(created_at DESC);

-- ─── KYC SUBMISSIONS ─────────────────────────────────────────────────────────

CREATE TABLE kyc_submissions (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doc_type        doc_type    NOT NULL,
    doc_front_url   TEXT        NOT NULL,
    doc_back_url    TEXT,
    selfie_url      TEXT,
    liveness_score  NUMERIC(5,4),                   -- 0.0000 – 1.0000
    liveness_passed BOOLEAN,
    ocr_data        JSONB       DEFAULT '{}',        -- extracted from document
    status          kyc_status  NOT NULL DEFAULT 'PENDING',
    reviewer_id     UUID        REFERENCES users(id),
    reviewer_note   TEXT,
    reviewed_at     TIMESTAMPTZ,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kyc_user   ON kyc_submissions(user_id);
CREATE INDEX idx_kyc_status ON kyc_submissions(status);

-- ─── DEVICES (trusted devices / session management) ──────────────────────────

CREATE TABLE devices (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name     VARCHAR(255) NOT NULL,
    device_type     VARCHAR(50),                    -- mobile, desktop, tablet
    user_agent      TEXT,
    ip_address      INET,
    fingerprint     VARCHAR(255),
    status          device_status NOT NULL DEFAULT 'TRUSTED',
    last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_devices_user ON devices(user_id);

-- ─── REFRESH TOKENS (blacklist & audit) ──────────────────────────────────────

CREATE TABLE refresh_tokens (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      TEXT        NOT NULL UNIQUE,    -- sha256 of token
    device_id       UUID        REFERENCES devices(id),
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked         BOOLEAN     NOT NULL DEFAULT FALSE,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rt_user    ON refresh_tokens(user_id);
CREATE INDEX idx_rt_hash    ON refresh_tokens(token_hash);
CREATE INDEX idx_rt_expires ON refresh_tokens(expires_at);

-- ─── CONTACTS (transfer phonebook) ───────────────────────────────────────────

CREATE TABLE contacts (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id   UUID        REFERENCES users(id),
    nickname    VARCHAR(100),
    phone       VARCHAR(20),
    bank_code   VARCHAR(20),
    account_no  VARCHAR(50),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (owner_id, phone)
);

CREATE INDEX idx_contacts_owner ON contacts(owner_id);

-- ─── CARDS ───────────────────────────────────────────────────────────────────

CREATE TABLE cards (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_name       VARCHAR(100) NOT NULL DEFAULT 'Cashie',
    last4           VARCHAR(4)  NOT NULL,
    expiry          VARCHAR(7)  NOT NULL,           -- MM/YY
    cvv_hash        TEXT        NOT NULL,           -- bcrypt hash
    card_bg         VARCHAR(20) NOT NULL DEFAULT 'violet',
    status          card_status NOT NULL DEFAULT 'ACTIVE',
    online_enabled  BOOLEAN     NOT NULL DEFAULT TRUE,
    intl_enabled    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cards_user ON cards(user_id);

-- ─── AUTO-DEBIT SUBSCRIPTIONS ────────────────────────────────────────────────

CREATE TABLE auto_debit_subscriptions (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    provider        VARCHAR(100),
    amount          NUMERIC(15,0) NOT NULL,
    avg_amount_3m   NUMERIC(15,0),
    due_day         SMALLINT    NOT NULL CHECK (due_day BETWEEN 1 AND 28),
    category        VARCHAR(50),
    status          bill_status NOT NULL DEFAULT 'ACTIVE',
    active          BOOLEAN     NOT NULL DEFAULT TRUE,
    retry_count     SMALLINT    NOT NULL DEFAULT 0,
    last_paid_at    TIMESTAMPTZ,
    next_due_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_autodebit_user ON auto_debit_subscriptions(user_id);

-- ─── CASHBACK ────────────────────────────────────────────────────────────────

CREATE TABLE cashback_balances (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL UNIQUE REFERENCES users(id),
    balance     NUMERIC(15,0) NOT NULL DEFAULT 0,
    lifetime    NUMERIC(15,0) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cashback_vouchers (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES users(id),
    voucher_code    VARCHAR(50) UNIQUE NOT NULL,
    amount          NUMERIC(15,0) NOT NULL,
    used            BOOLEAN     NOT NULL DEFAULT FALSE,
    used_at         TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vouchers_code ON cashback_vouchers(voucher_code);
CREATE INDEX idx_vouchers_user ON cashback_vouchers(user_id);

-- ─── REFERRALS ────────────────────────────────────────────────────────────────

CREATE TABLE referral_commissions (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id     UUID        NOT NULL REFERENCES users(id),
    referee_id      UUID        NOT NULL REFERENCES users(id),
    level           SMALLINT    NOT NULL CHECK (level IN (1,2,3)),
    amount          NUMERIC(15,0) NOT NULL,
    claimed         BOOLEAN     NOT NULL DEFAULT FALSE,
    claimed_at      TIMESTAMPTZ,
    tx_id           UUID        REFERENCES transactions(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referral_referrer ON referral_commissions(referrer_id);

-- ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    resource    VARCHAR(100) NOT NULL,
    resource_id TEXT,
    ip_address  INET,
    user_agent  TEXT,
    metadata    JSONB       DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user    ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action  ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ─── SUPPORT TICKETS ─────────────────────────────────────────────────────────

CREATE TABLE support_tickets (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_ref  VARCHAR(30) UNIQUE NOT NULL,        -- TKT-xxx (server-generated)
    user_id     UUID        REFERENCES users(id),
    subject     VARCHAR(255) NOT NULL,
    body        TEXT        NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'OPEN',  -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    assigned_to UUID        REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_user   ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);

-- ─── COMPLIANCE AML FLAGS ────────────────────────────────────────────────────

CREATE TABLE aml_flags (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_id       UUID        NOT NULL REFERENCES transactions(id),
    user_id     UUID        NOT NULL REFERENCES users(id),
    risk_level  VARCHAR(20) NOT NULL,               -- LOW, MEDIUM, HIGH, CRITICAL
    flags       TEXT[]      NOT NULL,               -- ['LARGE_OUTFLOW', ...]
    reviewed    BOOLEAN     NOT NULL DEFAULT FALSE,
    reviewer_id UUID        REFERENCES users(id),
    action_taken TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_aml_user     ON aml_flags(user_id);
CREATE INDEX idx_aml_reviewed ON aml_flags(reviewed);

-- ─── updated_at auto-trigger ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN FOR t IN SELECT unnest(ARRAY[
  'users','wallets','transactions','auto_debit_subscriptions','support_tickets'
]) LOOP
  EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
END LOOP; END $$;

-- ─── SEED: default admin user ────────────────────────────────────────────────
-- Password: Admin@2026 (bcrypt hash, change immediately)
INSERT INTO users (phone, email, password_hash, full_name, role, kyc_status, account_status)
VALUES (
  '0900000001',
  'admin@axvn.vn',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TsidbTq5S.C8Qe0QSxuvFCWu6G0C',
  'AXQ Admin',
  'admin',
  'LEVEL2',
  'ACTIVE'
) ON CONFLICT DO NOTHING;

\echo '✅ Schema 001 applied successfully'
