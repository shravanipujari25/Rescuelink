-- Migration 006: Add AI Triage fields to sos_requests
-- Run this in Supabase SQL Editor

ALTER TABLE sos_requests 
ADD COLUMN IF NOT EXISTS disaster_type TEXT,
ADD COLUMN IF NOT EXISTS severity_score INTEGER,
ADD COLUMN IF NOT EXISTS priority TEXT,
ADD COLUMN IF NOT EXISTS injured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trapped BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_source TEXT,
ADD COLUMN IF NOT EXISTS ai_confidence DOUBLE PRECISION;

-- Add comment for documentation
COMMENT ON COLUMN sos_requests.disaster_type IS 'AI classified disaster type (medical, fire, flood, etc.)';
COMMENT ON COLUMN sos_requests.severity_score IS 'AI urgency score from 1-10';
COMMENT ON COLUMN sos_requests.priority IS 'Computed priority (low, medium, high, critical)';
COMMENT ON COLUMN sos_requests.ai_source IS 'Which AI model or rule set provided this triage (rules, gemini)';
