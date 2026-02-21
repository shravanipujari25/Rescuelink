-- Migration 007: Update find_nearby_sos RPC to include AI Triage fields
-- Run this in Supabase SQL Editor

-- We must drop the function first because we are changing the return type
DROP FUNCTION IF EXISTS find_nearby_sos(double precision, double precision, double precision);

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
  distance_km DOUBLE PRECISION,
  -- New fields added in Migration 006
  disaster_type TEXT,
  severity_score INTEGER,
  priority TEXT,
  injured BOOLEAN,
  trapped BOOLEAN,
  ai_source TEXT,
  ai_confidence DOUBLE PRECISION
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
    ) AS distance_km,
    s.disaster_type,
    s.severity_score,
    s.priority,
    s.injured,
    s.trapped,
    s.ai_source,
    s.ai_confidence
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
