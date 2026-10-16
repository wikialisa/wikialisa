-- =============================================================================
-- AXQ — Comprehensive Seed Data (Dev / Staging)
-- =============================================================================
-- Phủ đầy đủ mọi role và use-case:
--   ADMIN, REGULATOR, COMPLIANCE_OFFICER
--   TRADER (Tier1/2/3), TRADER_SUSPENDED, TRADER_PENDING_KYC
--   MERCHANT (Starter/Growth/Pro/Enterprise)
--   OTC_INSTITUTIONAL, SANDBOX_PARTICIPANT
--   READONLY_ANALYST
-- =============================================================================
-- Chạy sau 01_schema.sql. KHÔNG chạy trên production.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: identity.users
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO identity.users (
    id, email, phone, full_name, date_of_birth, nationality,
    password_hash, solana_wallet, evm_wallet, tron_wallet,
    is_active, is_suspended, suspension_reason
) VALUES

-- ── ADMIN ──────────────────────────────────────────────────────────────────
(
    '00000000-0000-0000-0000-000000000001',
    'admin@axvn.vn', '+84901000001',
    'Lê Minh Khôi (Super Admin)', '1985-03-15', 'VN',
    '$2b$12$hashed_admin_pw', -- bcrypt placeholder
    'AdminSoLWaLLet111111111111111111111111111',
    '0xAdm1n000000000000000000000000000000001',
    NULL,
    TRUE, FALSE, NULL
),

-- ── COMPLIANCE OFFICER ─────────────────────────────────────────────────────
(
    '00000000-0000-0000-0000-000000000002',
    'compliance@axvn.vn', '+84901000002',
    'Nguyễn Thị Hương (Compliance)', '1988-07-20', 'VN',
    '$2b$12$hashed_compliance_pw',
    NULL, NULL, NULL,
    TRUE, FALSE, NULL
),

-- ── REGULATOR (NHNN) ───────────────────────────────────────────────────────
(
    '00000000-0000-0000-0000-000000000003',
    'regulator@nhnn.gov.vn', '+84901000003',
    'Cơ quan quản lý NHNN', '1975-01-01', 'VN',
    '$2b$12$hashed_regulator_pw',
    NULL, NULL, NULL,
    TRUE, FALSE, NULL
),

-- ── TRADER — Tier 3 (VIP, đã KYC đầy đủ VNeID Level 2) ───────────────────
(
    '00000000-0000-0000-0000-000000000010',
    'trader.vip@gmail.com', '+84909000010',
    'Trần Đình Phúc (VIP Trader)', '1990-05-12', 'VN',
    '$2b$12$hashed_t3_pw',
    'VipTraDerSoL1111111111111111111111111111',
    '0x1000000000000000000000000000000000000010',
    'TVipTraderTron1111111111111111111111111',
    TRUE, FALSE, NULL
),

-- ── TRADER — Tier 2 (KYC VNeID Level 2, hạn mức trung bình) ──────────────
(
    '00000000-0000-0000-0000-000000000011',
    'trader.t2@gmail.com', '+84909000011',
    'Nguyễn Văn Bình (Trader T2)', '1995-08-25', 'VN',
    '$2b$12$hashed_t2_pw',
    'T2TraDerSoL2222222222222222222222222222A',
    '0x1000000000000000000000000000000000000011',
    NULL,
    TRUE, FALSE, NULL
),

-- ── TRADER — Tier 1 (KYC cơ bản, hạn mức thấp) ───────────────────────────
(
    '00000000-0000-0000-0000-000000000012',
    'trader.t1@gmail.com', '+84909000012',
    'Phạm Thị Cẩm (Trader T1)', '2000-02-14', 'VN',
    '$2b$12$hashed_t1_pw',
    'T1TraDerSoL3333333333333333333333333333B',
    '0x1000000000000000000000000000000000000012',
    NULL,
    TRUE, FALSE, NULL
),

-- ── TRADER — PENDING KYC (chưa xác minh) ──────────────────────────────────
(
    '00000000-0000-0000-0000-000000000013',
    'newuser@gmail.com', '+84909000013',
    'Hoàng Văn Dũng (New User)', '1998-11-30', 'VN',
    '$2b$12$hashed_new_pw',
    'NewUserSoL4444444444444444444444444444C',
    '0x1000000000000000000000000000000000000013',
    NULL,
    TRUE, FALSE, NULL
),

-- ── TRADER — SUSPENDED (vi phạm quy định) ────────────────────────────────
(
    '00000000-0000-0000-0000-000000000014',
    'suspended.trader@gmail.com', '+84909000014',
    'Lý Thanh Tùng (Suspended)', '1992-04-18', 'VN',
    '$2b$12$hashed_sus_pw',
    'SuSpendSoL5555555555555555555555555555D',
    '0x1000000000000000000000000000000000000014',
    NULL,
    TRUE, TRUE, 'Vi phạm AML: giao dịch với địa chỉ OFAC blacklist — quyết định 2025-09-01'
),

-- ── TRADER — REJECTED KYC ────────────────────────────────────────────────
(
    '00000000-0000-0000-0000-000000000015',
    'rejected.kyc@gmail.com', '+84909000015',
    'Mai Văn Tài (KYC Rejected)', '1997-06-07', 'VN',
    '$2b$12$hashed_rej_pw',
    NULL,
    '0x1000000000000000000000000000000000000015',
    NULL,
    TRUE, FALSE, NULL
),

-- ── MERCHANT — Starter ────────────────────────────────────────────────────
(
    '00000000-0000-0000-0000-000000000020',
    'merchant.starter@shop.vn', '+84912000020',
    'Cửa Hàng Nhỏ (Starter)', '1985-01-10', 'VN',
    '$2b$12$hashed_ms_pw',
    NULL,
    '0x2000000000000000000000000000000000000020',
    NULL,
    TRUE, FALSE, NULL
),

-- ── MERCHANT — Growth ─────────────────────────────────────────────────────
(
    '00000000-0000-0000-0000-000000000021',
    'merchant.growth@restaurant.vn', '+84912000021',
    'Nhà Hàng Phở Hà Nội (Growth)', '1980-09-12', 'VN',
    '$2b$12$hashed_mg_pw',
    NULL,
    '0x2000000000000000000000000000000000000021',
    NULL,
    TRUE, FALSE, NULL
),

-- ── MERCHANT — Pro ────────────────────────────────────────────────────────
(
    '00000000-0000-0000-0000-000000000022',
    'merchant.pro@ecommerce.vn', '+84912000022',
    'Thương Mại Điện Tử ABC (Pro)', '1982-12-25', 'VN',
    '$2b$12$hashed_mp_pw',
    NULL,
    '0x2000000000000000000000000000000000000022',
    NULL,
    TRUE, FALSE, NULL
),

-- ── MERCHANT — Enterprise ─────────────────────────────────────────────────
(
    '00000000-0000-0000-0000-000000000023',
    'merchant.enterprise@bigretail.vn', '+84912000023',
    'Tập Đoàn Bán Lẻ XYZ (Enterprise)', '1978-03-30', 'VN',
    '$2b$12$hashed_me_pw',
    NULL,
    '0x2000000000000000000000000000000000000023',
    NULL,
    TRUE, FALSE, NULL
),

-- ── OTC INSTITUTIONAL — Đối tác MENA ─────────────────────────────────────
(
    '00000000-0000-0000-0000-000000000030',
    'otc.mena@menacapital.ae', '+97150000030',
    'MENA Capital LP Representative', '1975-06-01', 'AE',
    '$2b$12$hashed_otc_mena_pw',
    NULL,
    '0x3000000000000000000000000000000000000030',
    NULL,
    TRUE, FALSE, NULL
),

-- ── OTC INSTITUTIONAL — Đối tác Singapore ────────────────────────────────
(
    '00000000-0000-0000-0000-000000000031',
    'otc.sg@sgdigital.sg', '+6591000031',
    'SG Digital Assets Representative', '1980-11-15', 'SG',
    '$2b$12$hashed_otc_sg_pw',
    NULL,
    '0x3000000000000000000000000000000000000031',
    NULL,
    TRUE, FALSE, NULL
),

-- ── SANDBOX PARTICIPANT — Tier 1 Alpha ───────────────────────────────────
(
    '00000000-0000-0000-0000-000000000040',
    'sandbox.fintech@vnpay.vn', '+84928000040',
    'VNPay FinTech Alpha (Sandbox T1)', '1983-07-20', 'VN',
    '$2b$12$hashed_sbx1_pw',
    NULL,
    '0x4000000000000000000000000000000000000040',
    NULL,
    TRUE, FALSE, NULL
),

-- ── SANDBOX PARTICIPANT — Tier 2 Active ──────────────────────────────────
(
    '00000000-0000-0000-0000-000000000041',
    'sandbox.axvn@axvn.vn', '+84928000041',
    'AXQ FinTech Services (Sandbox T2)', '1985-04-05', 'VN',
    '$2b$12$hashed_sbx2_pw',
    NULL,
    '0x4000000000000000000000000000000000000041',
    NULL,
    TRUE, FALSE, NULL
),

-- ── READONLY ANALYST ─────────────────────────────────────────────────────
(
    '00000000-0000-0000-0000-000000000050',
    'analyst@axvn.vn', '+84901000050',
    'Phân tích viên dữ liệu', '1993-02-28', 'VN',
    '$2b$12$hashed_analyst_pw',
    NULL, NULL, NULL,
    TRUE, FALSE, NULL
)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: identity.kyc_profiles
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO identity.kyc_profiles (
    user_id, wallet_address, status, tier,
    vneid_national_id, vneid_level, vneid_verified_at,
    zkp_proof_hash, zkp_attestation_at,
    reviewed_by, reviewed_at, rejection_reason, verified_at
) VALUES

-- ADMIN — Tier 3, VNeID Level 2
(
    '00000000-0000-0000-0000-000000000001',
    '0xAdm1n000000000000000000000000000000001',
    'VERIFIED', 3,
    '079***001', 2, now() - INTERVAL '365 days',
    '0xzkp_admin_hash_001', now() - INTERVAL '365 days',
    '00000000-0000-0000-0000-000000000001', now() - INTERVAL '364 days',
    NULL, now() - INTERVAL '364 days'
),

-- COMPLIANCE OFFICER — Tier 3
(
    '00000000-0000-0000-0000-000000000002',
    '0x0000000000000000000000000000000000000000',
    'VERIFIED', 3,
    '079***002', 2, now() - INTERVAL '300 days',
    NULL, NULL,
    '00000000-0000-0000-0000-000000000001', now() - INTERVAL '299 days',
    NULL, now() - INTERVAL '299 days'
),

-- VIP TRADER — Tier 3, VNeID Level 2 + ZKP
(
    '00000000-0000-0000-0000-000000000010',
    '0x1000000000000000000000000000000000000010',
    'VERIFIED', 3,
    '079***010', 2, now() - INTERVAL '180 days',
    '0xzkp_vip_trader_010', now() - INTERVAL '179 days',
    '00000000-0000-0000-0000-000000000002', now() - INTERVAL '178 days',
    NULL, now() - INTERVAL '178 days'
),

-- TRADER T2 — Tier 2, VNeID Level 2
(
    '00000000-0000-0000-0000-000000000011',
    '0x1000000000000000000000000000000000000011',
    'VERIFIED', 2,
    '079***011', 2, now() - INTERVAL '60 days',
    NULL, NULL,
    '00000000-0000-0000-0000-000000000002', now() - INTERVAL '59 days',
    NULL, now() - INTERVAL '59 days'
),

-- TRADER T1 — Tier 1, VNeID Level 1 (chỉ xác minh cơ bản)
(
    '00000000-0000-0000-0000-000000000012',
    '0x1000000000000000000000000000000000000012',
    'VERIFIED', 1,
    '079***012', 1, now() - INTERVAL '14 days',
    NULL, NULL,
    '00000000-0000-0000-0000-000000000002', now() - INTERVAL '13 days',
    NULL, now() - INTERVAL '13 days'
),

-- NEW USER — PENDING (mới nộp, chưa xét)
(
    '00000000-0000-0000-0000-000000000013',
    '0x1000000000000000000000000000000000000013',
    'PENDING', 1,
    NULL, NULL, NULL,
    NULL, NULL,
    NULL, NULL,
    NULL, NULL
),

-- SUSPENDED TRADER — VERIFIED nhưng tài khoản bị treo
(
    '00000000-0000-0000-0000-000000000014',
    '0x1000000000000000000000000000000000000014',
    'SUSPENDED', 2,
    '079***014', 2, now() - INTERVAL '90 days',
    NULL, NULL,
    '00000000-0000-0000-0000-000000000001', now() - INTERVAL '10 days',
    'Tài khoản bị treo: giao dịch với địa chỉ OFAC — AML investigation #2025-1009',
    now() - INTERVAL '89 days'
),

-- REJECTED KYC — thông tin không khớp
(
    '00000000-0000-0000-0000-000000000015',
    '0x1000000000000000000000000000000000000015',
    'REJECTED', 1,
    NULL, NULL, NULL,
    NULL, NULL,
    '00000000-0000-0000-0000-000000000002', now() - INTERVAL '5 days',
    'Ảnh CMND không hợp lệ — mặt trước bị che khuất',
    NULL
),

-- MERCHANT STARTER — Tier 2
(
    '00000000-0000-0000-0000-000000000020',
    '0x2000000000000000000000000000000000000020',
    'VERIFIED', 2,
    '079***020', 2, now() - INTERVAL '20 days',
    NULL, NULL,
    '00000000-0000-0000-0000-000000000002', now() - INTERVAL '19 days',
    NULL, now() - INTERVAL '19 days'
),

-- MERCHANT GROWTH — Tier 2
(
    '00000000-0000-0000-0000-000000000021',
    '0x2000000000000000000000000000000000000021',
    'VERIFIED', 2,
    '079***021', 2, now() - INTERVAL '45 days',
    NULL, NULL,
    '00000000-0000-0000-0000-000000000002', now() - INTERVAL '44 days',
    NULL, now() - INTERVAL '44 days'
),

-- MERCHANT PRO — Tier 3
(
    '00000000-0000-0000-0000-000000000022',
    '0x2000000000000000000000000000000000000022',
    'VERIFIED', 3,
    '079***022', 2, now() - INTERVAL '120 days',
    '0xzkp_merchant_pro_022', now() - INTERVAL '119 days',
    '00000000-0000-0000-0000-000000000002', now() - INTERVAL '118 days',
    NULL, now() - INTERVAL '118 days'
),

-- MERCHANT ENTERPRISE — Tier 3
(
    '00000000-0000-0000-0000-000000000023',
    '0x2000000000000000000000000000000000000023',
    'VERIFIED', 3,
    '079***023', 2, now() - INTERVAL '200 days',
    '0xzkp_merchant_ent_023', now() - INTERVAL '199 days',
    '00000000-0000-0000-0000-000000000001', now() - INTERVAL '198 days',
    NULL, now() - INTERVAL '198 days'
),

-- OTC MENA — Tier 3 (ngoại kiều, jurisdiction AE)
(
    '00000000-0000-0000-0000-000000000030',
    '0x3000000000000000000000000000000000000030',
    'VERIFIED', 3,
    NULL, 2, now() - INTERVAL '150 days',
    '0xzkp_otc_mena_030', now() - INTERVAL '149 days',
    '00000000-0000-0000-0000-000000000001', now() - INTERVAL '148 days',
    NULL, now() - INTERVAL '148 days'
),

-- OTC SG — Tier 3
(
    '00000000-0000-0000-0000-000000000031',
    '0x3000000000000000000000000000000000000031',
    'VERIFIED', 3,
    NULL, 2, now() - INTERVAL '80 days',
    '0xzkp_otc_sg_031', now() - INTERVAL '79 days',
    '00000000-0000-0000-0000-000000000001', now() - INTERVAL '78 days',
    NULL, now() - INTERVAL '78 days'
)

ON CONFLICT (user_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: identity.api_keys
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO identity.api_keys (
    id, user_id, name, key_hash, key_prefix,
    permissions, is_active, expires_at
) VALUES
-- Admin có full-access key
(
    'aaaa0000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Admin Full Access',
    sha256('axvn_admin_secret_key_001'::bytea)::TEXT,
    'axvn_adm_',
    ARRAY['read','write','admin','webhook'],
    TRUE, NULL
),
-- Merchant Pro có write + webhook
(
    'aaaa0000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000022',
    'Production API Key',
    sha256('axvn_merchant_pro_key_022'::bytea)::TEXT,
    'axvn_mpr_',
    ARRAY['read','write','webhook'],
    TRUE, now() + INTERVAL '1 year'
),
-- Analyst read-only
(
    'aaaa0000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000050',
    'Analytics Read-Only',
    sha256('axvn_analyst_key_050'::bytea)::TEXT,
    'axvn_aly_',
    ARRAY['read'],
    TRUE, now() + INTERVAL '90 days'
),
-- Expired key (Merchant Starter)
(
    'aaaa0000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000020',
    'Old API Key (Expired)',
    sha256('axvn_starter_old_key_020'::bytea)::TEXT,
    'axvn_mst_',
    ARRAY['read','write'],
    FALSE, now() - INTERVAL '30 days'
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: payments.merchants
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO payments.merchants (
    id, user_id, business_name, business_type,
    website_url, callback_url, webhook_url,
    tier, monthly_volume_vnd, is_verified, is_active
) VALUES
(
    '10000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000020',
    'Cửa Hàng Nhỏ Online', 'ECOMMERCE',
    'https://cuahangnho.vn', 'https://cuahangnho.vn/vnkr/callback',
    'https://cuahangnho.vn/vnkr/webhook',
    'STARTER', 45000000, TRUE, TRUE    -- 45M VND/tháng
),
(
    '10000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000021',
    'Nhà Hàng Phở Hà Nội', 'F&B',
    'https://pho-hanoi.vn', 'https://pho-hanoi.vn/pay/callback',
    'https://pho-hanoi.vn/pay/webhook',
    'GROWTH', 380000000, TRUE, TRUE    -- 380M VND/tháng
),
(
    '10000000-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-000000000022',
    'Thương Mại Điện Tử ABC', 'ECOMMERCE',
    'https://abc-ecommerce.vn', 'https://abc-ecommerce.vn/payment/callback',
    'https://abc-ecommerce.vn/payment/webhook',
    'PRO', 2800000000, TRUE, TRUE      -- 2.8B VND/tháng
),
(
    '10000000-0000-0000-0000-000000000023',
    '00000000-0000-0000-0000-000000000023',
    'Tập Đoàn Bán Lẻ XYZ', 'RETAIL',
    'https://xyz-retail.vn', 'https://xyz-retail.vn/payment/callback',
    'https://xyz-retail.vn/payment/webhook',
    'ENTERPRISE', 45000000000, TRUE, TRUE  -- 45B VND/tháng
)
ON CONFLICT (user_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: payments.cashback_rules — mỗi tier merchant có cashback khác nhau
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO payments.cashback_rules (
    merchant_id, category, rate_bps, max_amount_vnd, valid_from, valid_until
) VALUES
-- Starter: 0.5%
(
    '10000000-0000-0000-0000-000000000020',
    'ECOMMERCE', 50,   50000, now(), now() + INTERVAL '1 year'
),
-- Growth: 1%
(
    '10000000-0000-0000-0000-000000000021',
    'F&B', 100, 100000, now(), now() + INTERVAL '1 year'
),
-- Pro: 1.5%
(
    '10000000-0000-0000-0000-000000000022',
    'ECOMMERCE', 150, 200000, now(), now() + INTERVAL '1 year'
),
-- Enterprise: 2% không giới hạn
(
    '10000000-0000-0000-0000-000000000023',
    'RETAIL', 200, NULL, now(), now() + INTERVAL '1 year'
)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: payments.p2p_orders
-- Đủ mọi trạng thái: OPEN, MATCHED, FIAT_CONFIRMED, TOKEN_RELEASED, CANCELLED, DISPUTED
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO payments.p2p_orders (
    order_id, side, status, token_mint, token_amount,
    fiat_amount, fiat_currency, seller_wallet, buyer_wallet,
    escrow_pda, payment_method, payment_ref,
    dispute_reason, matched_at, fiat_confirmed_at, token_released_at,
    cancelled_at, cancel_reason, created_at
) VALUES

-- OPEN — VIP Trader bán AXQ
(
    'ORD-001-OPEN-SELL',
    'SELL', 'OPEN',
    'AXQmint111111111111111111111111111111111',
    1000000000000,           -- 1000 AXQ (9 decimals)
    18900000, 'VND',
    '0x1000000000000000000000000000000000000010',
    NULL,
    'ESCROWpda1111111111111111111111111111111',
    'Vietcombank', NULL,
    NULL, NULL, NULL, NULL, NULL, NULL,
    now() - INTERVAL '3 hours'
),

-- OPEN — Trader T2 bán USDT
(
    'ORD-002-OPEN-SELL-USDT',
    'SELL', 'OPEN',
    'USDTmint111111111111111111111111111111111',
    500000000,               -- 500 USDT (6 decimals)
    12700000, 'VND',
    '0x1000000000000000000000000000000000000011',
    NULL, NULL,
    'MB Bank', NULL,
    NULL, NULL, NULL, NULL, NULL, NULL,
    now() - INTERVAL '1 hour'
),

-- MATCHED — đang chờ fiat
(
    'ORD-003-MATCHED',
    'BUY', 'MATCHED',
    'AXQmint111111111111111111111111111111111',
    300000000000,            -- 300 AXQ
    5670000, 'VND',
    '0x1000000000000000000000000000000000000010',
    '0x1000000000000000000000000000000000000012',
    'ESCROWpda3333333333333333333333333333333',
    'Techcombank', NULL,
    NULL,
    now() - INTERVAL '2 hours',
    NULL, NULL, NULL, NULL,
    now() - INTERVAL '3 hours'
),

-- FIAT_CONFIRMED — fiat đã nhận, chờ release token
(
    'ORD-004-FIAT-CONFIRMED',
    'SELL', 'FIAT_CONFIRMED',
    'AXQmint111111111111111111111111111111111',
    200000000000,
    3780000, 'VND',
    '0x1000000000000000000000000000000000000011',
    '0x1000000000000000000000000000000000000013',
    'ESCROWpda4444444444444444444444444444444',
    'ACB Bank', 'ACB-TRN-2025100401',
    NULL,
    now() - INTERVAL '90 minutes',
    now() - INTERVAL '30 minutes',
    NULL, NULL, NULL,
    now() - INTERVAL '2 hours'
),

-- TOKEN_RELEASED — hoàn thành
(
    'ORD-005-COMPLETED',
    'SELL', 'TOKEN_RELEASED',
    'AXQmint111111111111111111111111111111111',
    500000000000,
    9450000, 'VND',
    '0x1000000000000000000000000000000000000012',
    '0x1000000000000000000000000000000000000011',
    'ESCROWpda5555555555555555555555555555555',
    'BIDV', 'BIDV-2025100302',
    NULL,
    now() - INTERVAL '1 day' + INTERVAL '1 hour',
    now() - INTERVAL '1 day' + INTERVAL '2 hours',
    now() - INTERVAL '1 day' + INTERVAL '2 hours 5 minutes',
    NULL, NULL,
    now() - INTERVAL '1 day'
),

-- CANCELLED — người mua huỷ
(
    'ORD-006-CANCELLED',
    'BUY', 'CANCELLED',
    'USDTmint111111111111111111111111111111111',
    100000000,
    2540000, 'VND',
    '0x1000000000000000000000000000000000000010',
    '0x1000000000000000000000000000000000000013',
    NULL,
    'Sacombank', NULL,
    NULL,
    now() - INTERVAL '6 hours',
    NULL, NULL,
    now() - INTERVAL '5 hours',
    'Người mua huỷ vì lý do cá nhân',
    now() - INTERVAL '7 hours'
),

-- DISPUTED — tranh chấp đang xử lý
(
    'ORD-007-DISPUTED',
    'SELL', 'DISPUTED',
    'AXQmint111111111111111111111111111111111',
    800000000000,
    15120000, 'VND',
    '0x1000000000000000000000000000000000000011',
    '0x1000000000000000000000000000000000000012',
    'ESCROWpda7777777777777777777777777777777',
    'VPBank', 'VPB-TRN-2025100201',
    'Người mua xác nhận đã chuyển tiền nhưng người bán phủ nhận',
    now() - INTERVAL '2 days' + INTERVAL '1 hour',
    now() - INTERVAL '2 days' + INTERVAL '2 hours',
    NULL, NULL, NULL,
    now() - INTERVAL '2 days'
),

-- AED cross-border — OTC VIP
(
    'ORD-008-OTC-AED',
    'SELL', 'TOKEN_RELEASED',
    'AXQmint111111111111111111111111111111111',
    50000000000000,          -- 50,000 AXQ
    9450000000, 'AED',       -- 9.45M AED
    '0x3000000000000000000000000000000000000030',
    '0x1000000000000000000000000000000000000010',
    'ESCROWpda8888888888888888888888888888888',
    'Swift Wire Transfer', 'SWIFT-REF-20251004-AED-001',
    NULL,
    now() - INTERVAL '3 days' + INTERVAL '1 hour',
    now() - INTERVAL '3 days' + INTERVAL '4 hours',
    now() - INTERVAL '3 days' + INTERVAL '4 hours 30 minutes',
    NULL, NULL,
    now() - INTERVAL '3 days'
)

ON CONFLICT (order_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: payments.fiat_receipts
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO payments.fiat_receipts (
    receipt_id, order_id, bank_transaction_ref,
    amount, currency, bank_code,
    sender_account, sender_name,
    hmac_signature, hmac_verified,
    processed_at, confirmed_at
) VALUES
(
    'RCP-001', 'ORD-004-FIAT-CONFIRMED',
    'ACB-TRN-2025100401',
    3780000, 'VND', 'ACB',
    '0123456789', 'NGUYEN VAN BINH',
    'hmac_sig_acb_001', TRUE,
    now() - INTERVAL '30 minutes',
    now() - INTERVAL '30 minutes'
),
(
    'RCP-002', 'ORD-005-COMPLETED',
    'BIDV-2025100302',
    9450000, 'VND', 'BIDV',
    '1234567890', 'PHAM THI CAM',
    'hmac_sig_bidv_002', TRUE,
    now() - INTERVAL '1 day' + INTERVAL '2 hours',
    now() - INTERVAL '1 day' + INTERVAL '2 hours'
),
(
    'RCP-003', 'ORD-007-DISPUTED',
    'VPB-TRN-2025100201',
    15120000, 'VND', 'VPBank',
    '9876543210', 'PHAM THI CAM',
    'hmac_sig_vpb_003', TRUE,
    now() - INTERVAL '2 days' + INTERVAL '2 hours',
    now() - INTERVAL '2 days' + INTERVAL '2 hours'
)
ON CONFLICT (receipt_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: payments.merchant_orders — đủ mọi trạng thái
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO payments.merchant_orders (
    order_id, merchant_id, amount, currency, description, metadata,
    status, payment_url, payment_method, payment_reference,
    paid_at, callback_url, callback_sent_at, callback_status, expires_at
) VALUES
-- PAID — Starter
(
    'PAY-001-STARTER-PAID',
    '10000000-0000-0000-0000-000000000020',
    150000, 'VND', 'Mua áo thun #A001',
    '{"product_id":"A001","size":"M","color":"white"}',
    'PAID', 'https://pay.axvn.vn/PAY-001-STARTER-PAID',
    'AXQ_P2P', 'ORD-005-COMPLETED',
    now() - INTERVAL '1 day' + INTERVAL '2 hours',
    'https://cuahangnho.vn/vnkr/callback',
    now() - INTERVAL '1 day' + INTERVAL '2 hours 1 minute', 200,
    now() - INTERVAL '1 day' + INTERVAL '30 minutes'
),
-- PENDING — Starter
(
    'PAY-002-STARTER-PENDING',
    '10000000-0000-0000-0000-000000000020',
    89000, 'VND', 'Mua quần short #Q002',
    '{"product_id":"Q002","size":"L"}',
    'PENDING', 'https://pay.axvn.vn/PAY-002-STARTER-PENDING',
    NULL, NULL,
    NULL, 'https://cuahangnho.vn/vnkr/callback', NULL, NULL,
    now() + INTERVAL '28 minutes'
),
-- EXPIRED — Starter
(
    'PAY-003-STARTER-EXPIRED',
    '10000000-0000-0000-0000-000000000020',
    230000, 'VND', 'Mua giày thể thao #G003', NULL,
    'EXPIRED', 'https://pay.axvn.vn/PAY-003-STARTER-EXPIRED',
    NULL, NULL,
    NULL, 'https://cuahangnho.vn/vnkr/callback', NULL, NULL,
    now() - INTERVAL '2 hours'
),
-- PAID — Growth (F&B)
(
    'PAY-004-GROWTH-PAID',
    '10000000-0000-0000-0000-000000000021',
    350000, 'VND', 'Đặt bàn cho 4 người — Phở đặc biệt',
    '{"table":"T05","guests":4,"menu":"special_pho"}',
    'PAID', 'https://pay.axvn.vn/PAY-004-GROWTH-PAID',
    'AXQ_P2P', 'ORD-003-MATCHED',
    now() - INTERVAL '2 hours',
    'https://pho-hanoi.vn/pay/callback',
    now() - INTERVAL '2 hours 1 minute', 200,
    now() - INTERVAL '1 hour 30 minutes'
),
-- REFUNDED — Growth
(
    'PAY-005-GROWTH-REFUNDED',
    '10000000-0000-0000-0000-000000000021',
    120000, 'VND', 'Đơn giao hàng bị huỷ', NULL,
    'REFUNDED', 'https://pay.axvn.vn/PAY-005-GROWTH-REFUNDED',
    'AXQ_P2P', NULL,
    NULL, 'https://pho-hanoi.vn/pay/callback',
    now() - INTERVAL '3 hours', 200,
    now() - INTERVAL '5 hours'
),
-- PAID — Pro (large order)
(
    'PAY-006-PRO-PAID',
    '10000000-0000-0000-0000-000000000022',
    4500000, 'VND', 'Đặt hàng điện tử #E-2025-9901',
    '{"sku":"LAPTOP-X1","qty":1,"warranty":"24m"}',
    'PAID', 'https://pay.axvn.vn/PAY-006-PRO-PAID',
    'AXQ_P2P', 'ORD-001-OPEN-SELL',
    now() - INTERVAL '30 minutes',
    'https://abc-ecommerce.vn/payment/callback',
    now() - INTERVAL '29 minutes', 200,
    now() + INTERVAL '20 minutes'
),
-- FAILED — Pro (callback failed)
(
    'PAY-007-PRO-FAILED',
    '10000000-0000-0000-0000-000000000022',
    780000, 'VND', 'Mua phụ kiện #PK-001', NULL,
    'FAILED', 'https://pay.axvn.vn/PAY-007-PRO-FAILED',
    NULL, NULL,
    NULL, 'https://abc-ecommerce.vn/payment/callback', NULL, NULL,
    now() - INTERVAL '10 minutes'
),
-- PAID — Enterprise (bulk)
(
    'PAY-008-ENT-PAID',
    '10000000-0000-0000-0000-000000000023',
    85000000, 'VND', 'Thanh toán đơn hàng doanh nghiệp #B-20251004-001',
    '{"po_number":"PO-2025-0987","department":"IT","approver":"CFO"}',
    'PAID', 'https://pay.axvn.vn/PAY-008-ENT-PAID',
    'SWIFT', 'SWIFT-REF-20251004-AED-001',
    now() - INTERVAL '4 hours',
    'https://xyz-retail.vn/payment/callback',
    now() - INTERVAL '3 hours 59 minutes', 200,
    now() - INTERVAL '3 hours'
)
ON CONFLICT (order_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: payments.cashback_ledger
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO payments.cashback_ledger (
    user_id, order_id, merchant_id,
    amount_vnd, rate_bps, status, credited_at
) VALUES
(
    '00000000-0000-0000-0000-000000000020',
    'PAY-001-STARTER-PAID',
    '10000000-0000-0000-0000-000000000020',
    75, 50, 'CREDITED', now() - INTERVAL '1 day' + INTERVAL '2 hours 5 minutes'
),
(
    '00000000-0000-0000-0000-000000000021',
    'PAY-004-GROWTH-PAID',
    '10000000-0000-0000-0000-000000000021',
    3500, 100, 'CREDITED', now() - INTERVAL '1 hour 55 minutes'
),
(
    '00000000-0000-0000-0000-000000000022',
    'PAY-006-PRO-PAID',
    '10000000-0000-0000-0000-000000000022',
    67500, 150, 'CREDITED', now() - INTERVAL '25 minutes'
),
(
    '00000000-0000-0000-0000-000000000021',
    'PAY-005-GROWTH-REFUNDED',
    '10000000-0000-0000-0000-000000000021',
    1200, 100, 'REVERSED', NULL
)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: treasury.reserve_snapshots — 30 ngày lịch sử
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO treasury.reserve_snapshots (
    total_reserve_usd, axvn_circulating_supply, backing_ratio, source, snapshot_ts
)
SELECT
    (8000000 + (random() * 2000000))::NUMERIC(24,6),
    ((500000000 + i * 50000) * 1000000000)::BIGINT,
    (1.05 + (random() * 0.20))::NUMERIC(10,6),
    'on-chain',
    now() - ((30 - i) * INTERVAL '1 day')
FROM generate_series(1, 30) AS i;

-- Reserve nguy hiểm (backing ratio < 1.0 — test warning UI)
INSERT INTO treasury.reserve_snapshots (
    total_reserve_usd, axvn_circulating_supply, backing_ratio, source, snapshot_ts
) VALUES (
    7200000, 500000000000000000, 0.96, 'manual', now() - INTERVAL '7 days'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: treasury.tvl_snapshots — 30 ngày
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO treasury.tvl_snapshots (
    date, tvl_vnd, tvl_usd, active_users, tx_count, volume_vnd
)
SELECT
    (CURRENT_DATE - (30 - i))::DATE,
    (180000000000 + (random() * 20000000000))::NUMERIC(24,2),
    (7200000 + (random() * 800000))::NUMERIC(24,6),
    (40000 + (random() * 10000))::INT,
    (10000 + (random() * 5000))::INT,
    (50000000000 + (random() * 15000000000))::NUMERIC(24,2)
FROM generate_series(1, 30) AS i
ON CONFLICT (date) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: otc.counterparties
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO otc.counterparties (
    id, name, bic_code, jurisdiction, license_number, license_type,
    api_endpoint, max_quote_size_usd, is_active
) VALUES
(
    '30000000-0000-0000-0000-000000000001',
    'MENA Capital LP', 'MENALP22XXX', 'UAE',
    'VARA-2024-0089', 'VARA',
    'https://api.menacapital.ae/axq',
    50000000, TRUE     -- max 50M USD/quote
),
(
    '30000000-0000-0000-0000-000000000002',
    'SG Digital Assets Ltd', 'SGDAL33XXX', 'SG',
    'MAS-DPT-2023-0142', 'MAS',
    'https://api.sgdigital.sg/axq',
    10000000, TRUE     -- max 10M USD/quote
),
(
    '30000000-0000-0000-0000-000000000003',
    'HK Crypto Holdings', 'HKCHL44XXX', 'HK',
    'SFC-LC-2024-0223', 'SFC',
    'https://api.hkcrypto.hk/axq',
    5000000, FALSE     -- tạm ngưng
)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: otc.quotes — đủ mọi trạng thái
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO otc.quotes (
    id, quote_id, counterparty_id,
    token_in, token_out, amount_in, amount_out, price, fee_bps,
    status, requester_wallet, settlement_tx_hash,
    expires_at, accepted_at, settled_at
) VALUES
-- PENDING (vừa tạo)
(
    'eeee0000-0000-0000-0000-000000000001',
    'OTC-20251004-001',
    '30000000-0000-0000-0000-000000000001',
    'AXQmint111111111111111111111111111111111',
    'USDT',
    10000000000000, 189000000000, -- 10,000 AXQ → 189,000 USDT (≈$189/AXQ)
    18900, 30,
    'PENDING',
    '0x3000000000000000000000000000000000000030',
    NULL,
    now() + INTERVAL '25 seconds', NULL, NULL
),
-- ACCEPTED
(
    'eeee0000-0000-0000-0000-000000000002',
    'OTC-20251003-045',
    '30000000-0000-0000-0000-000000000002',
    'USDT', 'AXQmint111111111111111111111111111111111',
    5000000000, 264550000000, -- 5,000 USDT → 264,550 AXQ
    18904, 30,
    'ACCEPTED',
    '0x3000000000000000000000000000000000000031',
    NULL,
    now() + INTERVAL '20 seconds',
    now() - INTERVAL '5 seconds', NULL
),
-- SETTLED
(
    'eeee0000-0000-0000-0000-000000000003',
    'OTC-20251002-112',
    '30000000-0000-0000-0000-000000000001',
    'AXQmint111111111111111111111111111111111', 'AED',
    50000000000000, 9450000, -- 50,000 AXQ → 9,450 AED
    18900, 25,
    'SETTLED',
    '0x3000000000000000000000000000000000000030',
    '0xtx_otc_settled_abc123def456',
    now() - INTERVAL '1 day 23 hours',
    now() - INTERVAL '2 days' + INTERVAL '3 hours',
    now() - INTERVAL '2 days' + INTERVAL '3 hours 5 minutes'
),
-- EXPIRED (bị bỏ qua)
(
    'eeee0000-0000-0000-0000-000000000004',
    'OTC-20251001-078',
    '30000000-0000-0000-0000-000000000002',
    'AXQmint111111111111111111111111111111111', 'SGD',
    1000000000000, 2000000, NULL, 30,
    'EXPIRED',
    '0x3000000000000000000000000000000000000031',
    NULL,
    now() - INTERVAL '3 days' + INTERVAL '30 seconds',
    NULL, NULL
),
-- REJECTED
(
    'eeee0000-0000-0000-0000-000000000005',
    'OTC-20250930-201',
    '30000000-0000-0000-0000-000000000003',  -- counterparty inactive
    'AXQmint111111111111111111111111111111111', 'USDT',
    20000000000000, NULL, NULL, 30,
    'REJECTED',
    '0x3000000000000000000000000000000000000030',
    NULL,
    now() - INTERVAL '4 days' + INTERVAL '30 seconds',
    NULL, NULL
)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: sandbox.participants
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sandbox.participants (
    id, company_name, sandbox_id, contact_email,
    current_tier, status,
    kyc_compliance_rate, dispute_rate, uptime_pct,
    tvl_current_vnd, tvl_cap_vnd,
    approved_by, approved_at
) VALUES
-- Tier 1 Alpha (mới vào)
(
    '20000000-0000-0000-0000-000000000001',
    'VNPay FinTech Alpha', 'SBX-VNPAY1',
    'sandbox@vnpay.vn',
    1, 'ALPHA',
    98.5, 0.00200, 99.95,
    800000000, 1000000000,    -- 800M / 1B VND cap Tier 1
    'compliance@axvn.vn', now() - INTERVAL '30 days'
),
-- Tier 2 Active (hoạt động tốt)
(
    '20000000-0000-0000-0000-000000000002',
    'AXQ FinTech Services JSC', 'SBX-AXVN01',
    'sandbox@axvn.vn',
    2, 'ACTIVE',
    100.0, 0.00050, 99.99,
    200000000000, 10000000000000,  -- 200B / 10T VND cap Tier 2
    'compliance@axvn.vn', now() - INTERVAL '180 days'
),
-- Tier 3 Active (sắp tốt nghiệp)
(
    '20000000-0000-0000-0000-000000000003',
    'MoMo E-Wallet Corp', 'SBX-MOMO03',
    'sandbox@momo.vn',
    3, 'ACTIVE',
    100.0, 0.00010, 100.0,
    800000000000, 100000000000000,  -- 800B / 100T VND cap Tier 3
    'compliance@axvn.vn', now() - INTERVAL '365 days'
),
-- SUSPENDED (vi phạm)
(
    '20000000-0000-0000-0000-000000000004',
    'Crypto Exchange XYZ', 'SBX-CEXYZ4',
    'sandbox@cexyz.io',
    1, 'SUSPENDED',
    85.0, 0.08000, 97.50,
    50000000, 1000000000,
    'compliance@axvn.vn', now() - INTERVAL '60 days'
),
-- GRADUATED (đã ra sản xuất)
(
    '20000000-0000-0000-0000-000000000005',
    'Timo Digital Bank', 'SBX-TIMO05',
    'sandbox@timo.vn',
    4, 'GRADUATED',
    100.0, 0.00020, 99.98,
    5000000000000, 100000000000000,
    'compliance@axvn.vn', now() - INTERVAL '500 days'
)
ON CONFLICT (sandbox_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: sandbox.circuit_breaker_events
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sandbox.circuit_breaker_events (
    participant_id, action, triggered_by, trigger_role,
    reason, tx_hash, paused_at, unpaused_at, duration_seconds
) VALUES
-- VNPay — pause ngắn (volume spike)
(
    '20000000-0000-0000-0000-000000000001',
    'PAUSE', 'regulator@nhnn.gov.vn', 'REGULATOR',
    'Đột biến khối lượng >300% trong 1 giờ — hệ thống auto-detect',
    '0xtx_cb_pause_vnpay_001',
    now() - INTERVAL '15 days',
    now() - INTERVAL '15 days' + INTERVAL '22 minutes',
    1320
),
(
    '20000000-0000-0000-0000-000000000001',
    'UNPAUSE', 'compliance@axvn.vn', 'COMPLIANCE',
    'Xác minh nguồn gốc giao dịch hợp lệ — resume hoạt động',
    NULL,
    now() - INTERVAL '15 days' + INTERVAL '22 minutes',
    NULL, NULL
),
-- AXQ — pause do blacklist
(
    '20000000-0000-0000-0000-000000000002',
    'PAUSE', 'regulator@nhnn.gov.vn', 'REGULATOR',
    'Phát hiện tương tác với địa chỉ OFAC blacklist',
    '0xtx_cb_pause_axvn_002',
    now() - INTERVAL '30 days',
    now() - INTERVAL '30 days' + INTERVAL '8 minutes',
    480
),
(
    '20000000-0000-0000-0000-000000000002',
    'UNPAUSE', 'admin@axvn.vn', 'ADMIN',
    'Xác minh false positive — địa chỉ đã xoá khỏi OFAC list',
    NULL,
    now() - INTERVAL '30 days' + INTERVAL '8 minutes',
    NULL, NULL
),
-- CryptoXYZ — vẫn đang pause
(
    '20000000-0000-0000-0000-000000000004',
    'PAUSE', 'regulator@nhnn.gov.vn', 'REGULATOR',
    'KYC compliance rate < 90%, dispute rate > 5% — vi phạm nghiêm trọng',
    '0xtx_cb_pause_cexyz_004',
    now() - INTERVAL '10 days',
    NULL, NULL
)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: sandbox.alerts
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sandbox.alerts (
    participant_id, alert_type, severity, description,
    wallet_address, metric_value, metric_threshold,
    status, resolved_by, resolved_at, resolution_note, auto_generated
) VALUES
-- CRITICAL — VNPay volume spike (RESOLVED)
(
    '20000000-0000-0000-0000-000000000001',
    'VOLUME_SPIKE', 'CRITICAL',
    'Khối lượng giao dịch tăng 312% so với trung bình 1h',
    NULL, 312, 200,
    'RESOLVED', 'compliance@axvn.vn', now() - INTERVAL '14 days',
    'False positive: sự kiện khuyến mãi lớn được phê duyệt trước', TRUE
),
-- CRITICAL — AXQ blacklist
(
    '20000000-0000-0000-0000-000000000002',
    'BLACKLIST_ADDRESS', 'CRITICAL',
    'Phát hiện giao dịch tới địa chỉ trong danh sách OFAC SDN',
    '0xDEAD000000000000000000000000000000BEEF',
    NULL, NULL,
    'RESOLVED', 'compliance@axvn.vn', now() - INTERVAL '29 days',
    'Address removed from OFAC list — case closed', TRUE
),
-- WARNING — AXQ failed tx rate
(
    '20000000-0000-0000-0000-000000000002',
    'FAILED_TX_RATE', 'WARNING',
    'Tỷ lệ giao dịch thất bại đạt 4.8% (ngưỡng: 5%)',
    NULL, 4.8, 5.0,
    'RESOLVED', 'admin@axvn.vn', now() - INTERVAL '20 days',
    'Tối ưu slippage tolerance — tỷ lệ giảm về 0.3%', TRUE
),
-- CRITICAL — MoMo reserve ratio drop
(
    '20000000-0000-0000-0000-000000000003',
    'RESERVE_RATIO', 'WARNING',
    'Tỷ lệ backing giảm xuống 9.6% (ngưỡng tối thiểu: 10%)',
    NULL, 9.6, 10.0,
    'INVESTIGATING', NULL, NULL, NULL, TRUE
),
-- CRITICAL — CryptoXYZ KYC failure (OPEN)
(
    '20000000-0000-0000-0000-000000000004',
    'KYC_COMPLIANCE', 'CRITICAL',
    'Tỷ lệ KYC compliance giảm xuống 85% — vi phạm điều kiện sandbox',
    NULL, 85.0, 100.0,
    'OPEN', NULL, NULL, NULL, TRUE
),
-- CRITICAL — CryptoXYZ dispute rate
(
    '20000000-0000-0000-0000-000000000004',
    'DISPUTE_RATE', 'CRITICAL',
    'Tỷ lệ tranh chấp đạt 8% (giới hạn tối đa: 5%)',
    NULL, 8.0, 5.0,
    'OPEN', NULL, NULL, NULL, TRUE
),
-- INFO — VNPay TVL near cap (tự động)
(
    '20000000-0000-0000-0000-000000000001',
    'TVL_NEAR_CAP', 'INFO',
    'TVL đạt 80% giới hạn Tier 1 (800M/1B VND) — cần nâng tier',
    NULL, 80.0, 80.0,
    'INVESTIGATING', NULL, NULL, NULL, TRUE
)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: sandbox.telemetry — dữ liệu mẫu tuần hiện tại
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sandbox.telemetry (participant_id, metric, value, window_minutes, recorded_at)
SELECT
    '20000000-0000-0000-0000-000000000002',
    m.metric,
    m.base + (random() * m.variance),
    60,
    now() - (i * INTERVAL '1 hour')
FROM generate_series(0, 167) AS i,
LATERAL (VALUES
    ('tx_count',    120.0,  50.0),
    ('volume_vnd',  50000000.0, 20000000.0),
    ('failed_rate', 0.3,    0.2),
    ('tvl_vnd',     200000000000.0, 5000000000.0)
) AS m(metric, base, variance)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: swift.messages
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO swift.messages (
    id, uetr, message_type, direction,
    sender_bic, receiver_bic, currency, amount, value_date,
    raw_payload, parsed_fields, status,
    related_order_id, on_chain_tx_hash, settlement_block,
    sent_at, received_at, settled_at
) VALUES
-- INBOUND MT103 — đã settled
(
    'cccc0000-0000-0000-0000-000000000001',
    'uetr-0001-0001-0001-0001-000000000001',
    'MT103', 'INBOUND',
    'MENALP22XXX', 'AXVNVNVNXXX',
    'AED', 9450000, '2025-10-02',
    'encrypted:mt103_raw_payload_001',
    '{"field_20":"REF-001","field_32A":"251002AED9450000","field_50":{"name":"MENA CAPITAL LP"},"field_59":{"account":"0x3000...0030"}}',
    'SETTLED',
    'ORD-008-OTC-AED', '0xtx_otc_settled_abc123def456', 12345678,
    now() - INTERVAL '3 days' + INTERVAL '30 minutes',
    now() - INTERVAL '3 days' + INTERVAL '31 minutes',
    now() - INTERVAL '3 days' + INTERVAL '4 hours 30 minutes'
),
-- OUTBOUND MT103 — đang processing
(
    'cccc0000-0000-0000-0000-000000000002',
    'uetr-0002-0002-0002-0002-000000000002',
    'MT103', 'OUTBOUND',
    'AXVNVNVNXXX', 'SGDAL33XXX',
    'SGD', 200000, '2025-10-04',
    'encrypted:mt103_raw_payload_002',
    '{"field_20":"OTC-20251004-001","field_32A":"251004SGD200000"}',
    'PROCESSING',
    'OTC-20251004-001', NULL, NULL,
    now() - INTERVAL '10 minutes',
    now() - INTERVAL '9 minutes',
    NULL
),
-- INBOUND pacs.008 — validated
(
    'cccc0000-0000-0000-0000-000000000003',
    'uetr-0003-0003-0003-0003-000000000003',
    'pacs.008', 'INBOUND',
    'SGDAL33XXX', 'AXVNVNVNXXX',
    'USD', 5000000, '2025-10-03',
    'encrypted:pacs008_raw_payload_003',
    '{"CdtTrfTxInf":{"Amt":{"InstdAmt":{"Ccy":"USD","value":5000000}}}}',
    'VALIDATED',
    'OTC-20251003-045', NULL, NULL,
    now() - INTERVAL '1 day' + INTERVAL '1 hour',
    now() - INTERVAL '1 day' + INTERVAL '1 hour 2 minutes',
    NULL
),
-- INBOUND MT103 — FAILED
(
    'cccc0000-0000-0000-0000-000000000004',
    'uetr-0004-0004-0004-0004-000000000004',
    'MT103', 'INBOUND',
    'HKCHL44XXX', 'AXVNVNVNXXX',
    'HKD', 1000000, '2025-09-30',
    'encrypted:mt103_raw_payload_004',
    '{"field_20":"FAILED-REF-004"}',
    'FAILED',
    NULL, NULL, NULL,
    now() - INTERVAL '4 days',
    now() - INTERVAL '4 days' + INTERVAL '1 minute',
    NULL
),
-- OUTBOUND MT940 — camt.053 statement
(
    'cccc0000-0000-0000-0000-000000000005',
    'uetr-0005-0005-0005-0005-000000000005',
    'MT940', 'OUTBOUND',
    'AXVNVNVNXXX', 'MENALP22XXX',
    'AED', NULL, '2025-10-04',
    'encrypted:mt940_statement_005',
    '{"StmtDt":"2025-10-04","Ccy":"AED","Ntry":[{"Amt":9450000,"CdtDbtInd":"DBIT"}]}',
    'SETTLED',
    NULL, NULL, NULL,
    now() - INTERVAL '6 hours',
    now() - INTERVAL '5 hours 59 minutes',
    now() - INTERVAL '5 hours 50 minutes'
)
ON CONFLICT (uetr) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: swift.bridge_relay_log
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO swift.bridge_relay_log (
    swift_message_id, direction, chain,
    contract_address, tx_hash, block_number, gas_used,
    fx_rate_vnd, fx_source, fee_bps, fee_vnkr,
    status, error_message, retry_count,
    submitted_at, confirmed_at
) VALUES
-- SWIFT_TO_CHAIN — đã confirmed
(
    'cccc0000-0000-0000-0000-000000000001',
    'SWIFT_TO_CHAIN', 'evm',
    '0x0000000000000000000000000000000000000003',
    '0xtx_bridge_swift_to_chain_001', 12345677, 145832,
    25200.50, 'VCB', 10, 1000000000,
    'CONFIRMED', NULL, 0,
    now() - INTERVAL '3 days' + INTERVAL '4 hours 15 minutes',
    now() - INTERVAL '3 days' + INTERVAL '4 hours 30 minutes'
),
-- CHAIN_TO_SWIFT — đang pending
(
    'cccc0000-0000-0000-0000-000000000002',
    'CHAIN_TO_SWIFT', 'evm',
    '0x0000000000000000000000000000000000000003',
    NULL, NULL, NULL,
    25185.00, 'SBV', 10, NULL,
    'PENDING', NULL, 0,
    NULL, NULL
),
-- CHAIN_TO_SWIFT — submitted, chờ confirm
(
    'cccc0000-0000-0000-0000-000000000003',
    'SWIFT_TO_CHAIN', 'evm',
    '0x0000000000000000000000000000000000000003',
    '0xtx_bridge_submitted_003', NULL, NULL,
    25180.75, 'VCB', 10, 500000000,
    'SUBMITTED', NULL, 0,
    now() - INTERVAL '1 day' + INTERVAL '1 hour 5 minutes',
    NULL
),
-- FAILED + 2 retries
(
    'cccc0000-0000-0000-0000-000000000004',
    'SWIFT_TO_CHAIN', 'evm',
    '0x0000000000000000000000000000000000000003',
    NULL, NULL, NULL,
    25000.00, 'VCB', 10, NULL,
    'FAILED', 'EVM RPC timeout after 30s — gas estimation failed', 2,
    now() - INTERVAL '4 days' + INTERVAL '1 minute',
    NULL
)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA: notifications.delivery_log
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO notifications.delivery_log (
    user_id, channel, event_type, recipient,
    subject, body_preview,
    status, http_status, error_message, retry_count,
    sent_at
) VALUES
-- Email xác nhận KYC — VIP Trader
(
    '00000000-0000-0000-0000-000000000010',
    'email', 'kyc_verified',
    'trader.vip@gmail.com',
    'Xác minh danh tính thành công — AXQ',
    'Tài khoản của bạn đã được xác minh KYC Tier 3. Hạn mức giao dịch đã được nâng lên.',
    'SENT', NULL, NULL, 0,
    now() - INTERVAL '178 days'
),
-- Email thông báo order MATCHED
(
    '00000000-0000-0000-0000-000000000012',
    'email', 'p2p_matched',
    'trader.t1@gmail.com',
    'Lệnh mua của bạn đã được khớp — AXQ Pay',
    'Lệnh mua ORD-003-MATCHED của bạn đã được khớp. Vui lòng chuyển khoản trong 30 phút.',
    'SENT', NULL, NULL, 0,
    now() - INTERVAL '2 hours 59 minutes'
),
-- Telegram alert — sandbox CRITICAL
(
    '00000000-0000-0000-0000-000000000003',
    'telegram', 'sandbox_alert_critical',
    '-1001234567890',  -- chat_id
    NULL,
    '🚨 CRITICAL: VNPay volume spike 312% — Circuit breaker triggered',
    'SENT', NULL, NULL, 0,
    now() - INTERVAL '15 days'
),
-- Webhook merchant paid
(
    '00000000-0000-0000-0000-000000000022',
    'webhook', 'payment_received',
    'https://abc-ecommerce.vn/payment/callback',
    NULL,
    '{"order_id":"PAY-006-PRO-PAID","status":"PAID","amount":4500000}',
    'SENT', 200, NULL, 0,
    now() - INTERVAL '29 minutes'
),
-- Email FAILED (bounce)
(
    '00000000-0000-0000-0000-000000000014',
    'email', 'account_suspended',
    'suspended.trader@gmail.com',
    'Tài khoản bị tạm khoá — Yêu cầu xác minh',
    'Tài khoản của bạn đã bị tạm khoá theo quyết định AML #2025-1009.',
    'BOUNCED', NULL, 'Mailbox full (550 5.1.1)', 3,
    now() - INTERVAL '10 days'
),
-- SMS OTP
(
    '00000000-0000-0000-0000-000000000013',
    'sms', 'otp_login',
    '+84909000013',
    NULL, 'OTP của bạn là: 847291 (hết hạn sau 5 phút)',
    'SENT', NULL, NULL, 0,
    now() - INTERVAL '5 minutes'
),
-- Push notification
(
    '00000000-0000-0000-0000-000000000011',
    'push', 'p2p_fiat_confirmed',
    'device_token_trader_t2_abc123',
    'Nhận được thanh toán',
    'Bạn vừa nhận được 3,780,000 VND cho lệnh ORD-004.',
    'SENT', NULL, NULL, 0,
    now() - INTERVAL '30 minutes'
),
-- Webhook FAILED (3 retries)
(
    '00000000-0000-0000-0000-000000000020',
    'webhook', 'payment_received',
    'https://cuahangnho.vn/vnkr/webhook',
    NULL,
    '{"order_id":"PAY-003-STARTER-EXPIRED","status":"EXPIRED"}',
    'FAILED', 503, 'Connection refused after 3 attempts', 3,
    now() - INTERVAL '1 hour 50 minutes'
)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SUMMARY
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    RAISE NOTICE '══════════════════════════════════════════════════════';
    RAISE NOTICE '  AXQ Wikialisa — Comprehensive Seed Complete';
    RAISE NOTICE '══════════════════════════════════════════════════════';
    RAISE NOTICE 'Users:                  %', (SELECT count(*) FROM identity.users);
    RAISE NOTICE '  - Active:             %', (SELECT count(*) FROM identity.users WHERE is_active AND NOT is_suspended);
    RAISE NOTICE '  - Suspended:          %', (SELECT count(*) FROM identity.users WHERE is_suspended);
    RAISE NOTICE 'KYC Profiles:           %', (SELECT count(*) FROM identity.kyc_profiles);
    RAISE NOTICE '  - VERIFIED:           %', (SELECT count(*) FROM identity.kyc_profiles WHERE status=''VERIFIED'');
    RAISE NOTICE '  - PENDING:            %', (SELECT count(*) FROM identity.kyc_profiles WHERE status=''PENDING'');
    RAISE NOTICE '  - REJECTED:           %', (SELECT count(*) FROM identity.kyc_profiles WHERE status=''REJECTED'');
    RAISE NOTICE '  - SUSPENDED:          %', (SELECT count(*) FROM identity.kyc_profiles WHERE status=''SUSPENDED'');
    RAISE NOTICE 'API Keys:               %', (SELECT count(*) FROM identity.api_keys);
    RAISE NOTICE 'Merchants:              %', (SELECT count(*) FROM payments.merchants);
    RAISE NOTICE 'P2P Orders:             %', (SELECT count(*) FROM payments.p2p_orders);
    RAISE NOTICE 'Fiat Receipts:          %', (SELECT count(*) FROM payments.fiat_receipts);
    RAISE NOTICE 'Merchant Orders:        %', (SELECT count(*) FROM payments.merchant_orders);
    RAISE NOTICE 'Cashback Ledger:        %', (SELECT count(*) FROM payments.cashback_ledger);
    RAISE NOTICE 'Reserve Snapshots:      %', (SELECT count(*) FROM treasury.reserve_snapshots);
    RAISE NOTICE 'TVL Snapshots:          %', (SELECT count(*) FROM treasury.tvl_snapshots);
    RAISE NOTICE 'OTC Counterparties:     %', (SELECT count(*) FROM otc.counterparties);
    RAISE NOTICE 'OTC Quotes:             %', (SELECT count(*) FROM otc.quotes);
    RAISE NOTICE 'Sandbox Participants:   %', (SELECT count(*) FROM sandbox.participants);
    RAISE NOTICE 'CB Events:              %', (SELECT count(*) FROM sandbox.circuit_breaker_events);
    RAISE NOTICE 'Alerts:                 %', (SELECT count(*) FROM sandbox.alerts);
    RAISE NOTICE 'Telemetry rows:         %', (SELECT count(*) FROM sandbox.telemetry);
    RAISE NOTICE 'SWIFT Messages:         %', (SELECT count(*) FROM swift.messages);
    RAISE NOTICE 'Bridge Relay Log:       %', (SELECT count(*) FROM swift.bridge_relay_log);
    RAISE NOTICE 'Notifications:          %', (SELECT count(*) FROM notifications.delivery_log);
    RAISE NOTICE '══════════════════════════════════════════════════════';
END;
$$;
