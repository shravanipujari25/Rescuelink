-- =============================================================================
-- Migration 002: Token blocklist for logout + admin user seed
-- Run this in Supabase SQL Editor
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Token blocklist table (for server-side JWT invalidation on logout)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS token_blocklist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_jti   TEXT NOT NULL UNIQUE,   -- JWT "jti" claim (unique token ID)
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,   -- same as JWT exp — for cleanup
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocklist_jti        ON token_blocklist (token_jti);
CREATE INDEX IF NOT EXISTS idx_blocklist_expires_at ON token_blocklist (expires_at);

-- RLS: only service role can write (backend bypasses RLS)
ALTER TABLE token_blocklist ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Seed: create the first admin user
-- Replace the values below with real credentials before running!
-- Password below is: Admin@12345  (bcrypt hash, 12 rounds)
-- Generate your own at: https://bcrypt-generator.com/ (rounds=12)
-- ---------------------------------------------------------------------------
INSERT INTO users (
  role, email, password_hash, status, email_verified,
  name, phone
)
VALUES (
  'admin',
  'admin@rescuelink.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TsCBaYQb7F3eLZjpqMXqLFpJZCHe',
  'active',
  true,
  'Super Admin',
  '+910000000000'
)
ON CONFLICT (email) DO NOTHING;
