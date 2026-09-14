-- ==========================================================
-- Swift Earn - Production PostgreSQL Database Schema
-- Color Identity: Deep Purple (#6C2BD9) + Bright Lime Green (#B8F500)
-- ==========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'flagged', 'pending_verification')),
    referral_code VARCHAR(32) UNIQUE NOT NULL,
    referred_by_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(128) NOT NULL,
    avatar_initials VARCHAR(4) NOT NULL,
    phone VARCHAR(32),
    country VARCHAR(64) DEFAULT 'Nigeria',
    preferred_payment_method VARCHAR(64) DEFAULT 'bank_transfer',
    bank_name VARCHAR(128),
    account_number VARCHAR(64),
    account_name VARCHAR(128),
    email_notifications BOOLEAN DEFAULT TRUE,
    reward_alerts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Wallets Table (Denormalized summary verified against ledger_entries)
CREATE TABLE IF NOT EXISTS wallets (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    available_balance NUMERIC(14, 2) DEFAULT 0.00 CHECK (available_balance >= 0),
    pending_rewards NUMERIC(14, 2) DEFAULT 0.00 CHECK (pending_rewards >= 0),
    total_earned NUMERIC(14, 2) DEFAULT 0.00 CHECK (total_earned >= 0),
    total_withdrawn NUMERIC(14, 2) DEFAULT 0.00 CHECK (total_withdrawn >= 0),
    currency VARCHAR(8) DEFAULT 'NGN',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reward Opportunities
CREATE TABLE IF NOT EXISTS reward_opportunities (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('video', 'survey', 'app_trial', 'sponsored_task')),
    reward_points NUMERIC(10, 2) NOT NULL CHECK (reward_points > 0),
    estimated_seconds INTEGER NOT NULL CHECK (estimated_seconds > 0),
    provider VARCHAR(64) NOT NULL,
    is_demo BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    daily_cap INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reward Sessions (State Machine for verified completions)
CREATE TABLE IF NOT EXISTS reward_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id VARCHAR(64) NOT NULL REFERENCES reward_opportunities(id),
    provider_session_id VARCHAR(128) NOT NULL,
    provider_token VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'initiated' CHECK (status IN ('initiated', 'in_progress', 'completed', 'verified', 'failed', 'expired')),
    ip_address VARCHAR(45),
    user_agent TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    claimed BOOLEAN DEFAULT FALSE
);

-- 6. Reward Events (Audit trail for ad lifecycle events)
CREATE TABLE IF NOT EXISTS reward_events (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES reward_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL CHECK (event_type IN ('session_start', 'ad_loaded', 'ad_impression', 'ad_progress', 'ad_complete', 'claim_attempt', 'verified_success', 'fraud_flagged')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Ledger Entries (Double-entry / Immutable accounting ledger)
CREATE TABLE IF NOT EXISTS ledger_entries (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_type VARCHAR(32) NOT NULL CHECK (entry_type IN ('reward_credit', 'withdrawal_debit', 'withdrawal_reversal', 'referral_bonus', 'admin_adjustment')),
    amount NUMERIC(14, 2) NOT NULL,
    running_balance NUMERIC(14, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
    reference VARCHAR(128) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Withdrawals Table
CREATE TABLE IF NOT EXISTS withdrawals (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(64) NOT NULL,
    account_details JSONB NOT NULL,
    reference VARCHAR(128) UNIQUE NOT NULL,
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'failed')),
    admin_notes TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id VARCHAR(64) PRIMARY KEY,
    referrer_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(32) DEFAULT 'successful' CHECK (status IN ('registered', 'successful', 'rewarded', 'suspicious')),
    reward_amount NUMERIC(10, 2) DEFAULT 50.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rewarded_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_referred UNIQUE (referred_user_id)
);

-- 10. Fraud Events (Security telemetry & anomaly detection)
CREATE TABLE IF NOT EXISTS fraud_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(64),
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    flag_reason VARCHAR(128) NOT NULL,
    details JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Audit Logs Table (Any administrative or manual balance action)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    admin_id VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    target_resource VARCHAR(64) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) DEFAULT 'reward' CHECK (type IN ('reward', 'withdrawal', 'referral', 'system', 'security')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON ledger_entries(reference);
CREATE INDEX IF NOT EXISTS idx_reward_sessions_user ON reward_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
