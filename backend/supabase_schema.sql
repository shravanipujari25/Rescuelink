-- =============================================================================
-- RescueLink / RescueLink — Users Table Schema
-- Safe to re-run: uses IF NOT EXISTS and DO blocks for idempotency
-- =============================================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUM types — created only if they don't already exist
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('citizen', 'ngo', 'volunteer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- users table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role                  user_role NOT NULL,
  email                 TEXT NOT NULL UNIQUE,
  password_hash         TEXT NOT NULL,
  status                user_status NOT NULL DEFAULT 'pending',
  verification_status   verification_status,

  -- Citizen / Volunteer shared fields
  name                  TEXT,
  phone                 TEXT,

  -- NGO-specific fields
  ngo_name              TEXT,
  contact_person        TEXT,
  registration_number   TEXT,
  services              TEXT[],

  -- Volunteer-specific fields
  skills                TEXT[],
  volunteer_type        TEXT,

  -- Shared location
  location              TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Auto-update updated_at on row changes
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger first if it exists, then recreate (idempotent)
DROP TRIGGER IF EXISTS set_updated_at ON users;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email  ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role   ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then recreate (idempotent)
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Users can read their own row
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own row
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Service role (backend) has full access — bypasses RLS automatically
