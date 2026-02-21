-- Migration: Add coordinates to users and implement spatial SOS discovery
-- Run this in Supabase SQL Editor

-- 1. Add coordinates to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 2. Create spatial index for users (optional but good for performance)
CREATE INDEX IF NOT EXISTS idx_users_location_coords ON users (latitude, longitude);

-- 3. Function to find nearby SOS requests
-- Uses Haversine formula (Distance in KM)
CREATE OR REPLACE FUNCTION find_nearby_sos(
  volunteer_lat DOUBLE PRECISION,
  volunteer_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 20.0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  emergency_type TEXT,
  severity TEXT,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  status TEXT,
  assigned_to UUID,
  people_count INTEGER,
  contact_phone TEXT,
  created_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    s.emergency_type::TEXT,
    s.severity::TEXT,
    s.description,
    s.latitude,
    s.longitude,
    s.address,
    s.status::TEXT,
    s.assigned_to,
    s.people_count,
    s.contact_phone,
    s.created_at,
    (
      6371 * acos(
        cos(radians(volunteer_lat)) * cos(radians(s.latitude)) * 
        cos(radians(s.longitude) - radians(volunteer_lng)) + 
        sin(radians(volunteer_lat)) * sin(radians(s.latitude))
      )
    ) AS distance_km
  FROM sos_requests s
  WHERE s.status != 'resolved' 
    AND (
      6371 * acos(
        cos(radians(volunteer_lat)) * cos(radians(s.latitude)) * 
        cos(radians(s.longitude) - radians(volunteer_lng)) + 
        sin(radians(volunteer_lat)) * sin(radians(s.latitude))
      )
    ) <= radius_km
  ORDER BY distance_km ASC;
END;
$$;
