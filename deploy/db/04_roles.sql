-- =============================================================================
-- AXQ — Database Users & Role-Based Access Control
-- =============================================================================
-- Chạy bằng superuser (postgres)
-- =============================================================================

-- ── Application roles ─────────────────────────────────────────────────────────

-- Service role cho fiat-connector-api (chỉ đọc/ghi payments + identity.kyc)
CREATE ROLE fiat_connector LOGIN PASSWORD 'f59d03e00523a26f110684515438b881';
GRANT CONNECT ON DATABASE vnkr TO fiat_connector;
GRANT USAGE ON SCHEMA identity, payments, notifications TO fiat_connector;
GRANT SELECT ON identity.users, identity.kyc_profiles TO fiat_connector;
GRANT SELECT, INSERT, UPDATE ON payments.fiat_receipts TO fiat_connector;
GRANT SELECT, UPDATE ON payments.p2p_orders TO fiat_connector;
GRANT INSERT ON notifications.delivery_log TO fiat_connector;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA payments TO fiat_connector;

-- Service role cho otc-liquidity-engine
CREATE ROLE otc LOGIN PASSWORD '7bd75616eb967d72cecff73e4230d7e7';
GRANT CONNECT ON DATABASE vnkr TO otc;
GRANT USAGE ON SCHEMA otc, identity, treasury TO otc;
GRANT SELECT, INSERT, UPDATE ON otc.quotes TO otc;
GRANT SELECT ON otc.counterparties TO otc;
GRANT SELECT ON identity.kyc_profiles TO otc;
GRANT SELECT ON treasury.reserve_snapshots TO otc;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA otc TO otc;

-- Service role cho indexer-subgraph (ghi treasury data)
CREATE ROLE indexer LOGIN PASSWORD 'c0a4052e68b059f46ed45ce90f44070d';
GRANT CONNECT ON DATABASE vnkr TO indexer;
GRANT USAGE ON SCHEMA treasury TO indexer;
GRANT SELECT, INSERT ON treasury.reserve_snapshots TO indexer;
GRANT SELECT, INSERT ON treasury.swap_events TO indexer;
GRANT SELECT, INSERT ON treasury.tvl_snapshots TO indexer;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA treasury TO indexer;

-- Service role cho swift-chain-bridge
CREATE ROLE swift LOGIN PASSWORD '77d0053c95a085a361c67f6bbc68d3ff';
GRANT CONNECT ON DATABASE vnkr TO swift;
GRANT USAGE ON SCHEMA swift, payments, treasury TO swift;
GRANT SELECT, INSERT, UPDATE ON swift.messages TO swift;
GRANT SELECT, INSERT, UPDATE ON swift.bridge_relay_log TO swift;
GRANT SELECT, UPDATE ON payments.p2p_orders TO swift;
GRANT SELECT ON treasury.reserve_snapshots TO swift;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA swift TO swift;

-- Service role cho KYC portal / kyc-portal
CREATE ROLE kyc_portal LOGIN PASSWORD '212eeb48c921e410ce1373c19ad384ed';
GRANT CONNECT ON DATABASE vnkr TO kyc_portal;
GRANT USAGE ON SCHEMA identity, notifications TO kyc_portal;
GRANT SELECT, INSERT, UPDATE ON identity.users TO kyc_portal;
GRANT SELECT, INSERT, UPDATE ON identity.kyc_profiles TO kyc_portal;
GRANT SELECT, INSERT ON notifications.delivery_log TO kyc_portal;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA identity TO kyc_portal;

-- Service role cho merchant portal / pay-portal
CREATE ROLE merchant LOGIN PASSWORD 'af1cb86e618914062b9fe51bdd4cee41';
GRANT CONNECT ON DATABASE vnkr TO merchant;
GRANT USAGE ON SCHEMA payments, identity TO merchant;
GRANT SELECT, INSERT, UPDATE ON payments.merchants TO merchant;
GRANT SELECT, INSERT, UPDATE ON payments.merchant_orders TO merchant;
GRANT SELECT ON payments.cashback_rules TO merchant;
GRANT SELECT, INSERT ON payments.cashback_ledger TO merchant;
GRANT SELECT ON identity.kyc_profiles TO merchant;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA payments TO merchant;

-- Service role cho sandbox dashboard (read-heavy + alerts write)
CREATE ROLE sandbox LOGIN PASSWORD '4df7b105ddaba0b32fe7535b07015e4a';
GRANT CONNECT ON DATABASE vnkr TO sandbox;
GRANT USAGE ON SCHEMA sandbox, treasury, payments, identity TO sandbox;
GRANT SELECT, UPDATE ON sandbox.participants TO sandbox;
GRANT SELECT, INSERT ON sandbox.circuit_breaker_events TO sandbox;
GRANT SELECT, INSERT, UPDATE ON sandbox.alerts TO sandbox;
GRANT SELECT, INSERT ON sandbox.telemetry TO sandbox;
GRANT SELECT ON treasury.tvl_snapshots TO sandbox;
GRANT SELECT ON treasury.reserve_snapshots TO sandbox;
GRANT SELECT ON payments.p2p_orders TO sandbox;

-- Read-only role cho analytics / reporting
CREATE ROLE readonly LOGIN PASSWORD '1cf5cfda6e008c9ffb2bf9f5a4cb15d9';
GRANT CONNECT ON DATABASE vnkr TO readonly;
GRANT USAGE ON SCHEMA identity, payments, treasury, otc, sandbox, swift, notifications TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA identity      TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA payments      TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA treasury      TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA otc           TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA sandbox       TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA swift         TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA notifications TO readonly;

-- Admin role (full access — only for DBA / migrations)
CREATE ROLE admin LOGIN PASSWORD '1cbd92cc1b943220974cef765a3fb114' CREATEROLE;
GRANT ALL ON DATABASE vnkr TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA identity      TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA payments      TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA treasury      TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA otc           TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA sandbox       TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA swift         TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA notifications TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA identity      TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA payments      TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA treasury      TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA otc           TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA sandbox       TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA swift         TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA notifications TO admin;

-- ── Row-Level Security: sandbox.alerts (regulators see all, participants see own) ─
ALTER TABLE sandbox.alerts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox.participants ENABLE ROW LEVEL SECURITY;

-- Bypass for admin
CREATE POLICY rls_admin_sandbox_alerts ON sandbox.alerts
    USING (current_user IN ('admin', 'postgres'));

CREATE POLICY rls_admin_sandbox_parts ON sandbox.participants
    USING (current_user IN ('admin', 'postgres', 'sandbox', 'readonly'));

-- ── Revoke default public access ─────────────────────────────────────────────
REVOKE ALL ON SCHEMA identity      FROM PUBLIC;
REVOKE ALL ON SCHEMA payments      FROM PUBLIC;
REVOKE ALL ON SCHEMA treasury      FROM PUBLIC;
REVOKE ALL ON SCHEMA otc           FROM PUBLIC;
REVOKE ALL ON SCHEMA sandbox       FROM PUBLIC;
REVOKE ALL ON SCHEMA swift         FROM PUBLIC;
REVOKE ALL ON SCHEMA notifications FROM PUBLIC;
