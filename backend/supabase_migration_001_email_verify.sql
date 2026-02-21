-- =============================================================================
-- Migration: Add email verification columns to users table
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Add email_verified flag
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

-- Add OTP columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS otp_code TEXT,
  ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;

-- Add 'unverified' to user_status enum (if not already present)
DO $$ BEGIN
  ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'unverified';
EXCEPTION WHEN others THEN NULL;
END $$;
