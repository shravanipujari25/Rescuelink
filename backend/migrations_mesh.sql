-- =============================================================================
-- RescueLink / migrations_mesh.sql
-- Adds support for offline SOS deduplication and mesh relay tracking
-- =============================================================================

-- 1. Add mesh-specific columns to sos_requests
ALTER TABLE sos_requests 
ADD COLUMN IF NOT EXISTS offline_id UUID UNIQUE,
ADD COLUMN IF NOT EXISTS is_relayed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS relayed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reported_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Add an index for faster lookups by offline_id
CREATE INDEX IF NOT EXISTS idx_sos_offline_id ON sos_requests(offline_id);

-- 3. Update existing records to have a reported_at value if they don't
UPDATE sos_requests SET reported_at = created_at WHERE reported_at IS NULL;

-- 4. Audit Log Entry (optional but good practice)
-- COMMENT ON COLUMN sos_requests.offline_id IS 'Unique client-side ID for mesh deduplication';
