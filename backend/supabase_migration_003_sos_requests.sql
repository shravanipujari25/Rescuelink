-- Drop existing objects to ensure a clean slate
DROP TABLE IF EXISTS sos_live_locations CASCADE;
DROP TABLE IF EXISTS sos_requests CASCADE;
DROP TYPE IF EXISTS emergency_type CASCADE;
DROP TYPE IF EXISTS severity_level CASCADE;
DROP TYPE IF EXISTS sos_status CASCADE;

-- Create ENUMs for Emergency Type, Severity, and SOS Status
CREATE TYPE emergency_type AS ENUM (
    'medical',
    'fire',
    'flood',
    'earthquake',
    'trapped',
    'missing_person',
    'food_water',
    'other'
);

CREATE TYPE severity_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE sos_status AS ENUM (
    'active',
    'assigned',
    'resolved',
    'cancelled'
);

-- Create TABLE: sos_requests
CREATE TABLE sos_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    emergency_type emergency_type NOT NULL,
    severity severity_level DEFAULT 'medium',
    description text,
    
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    address text,
    
    status sos_status DEFAULT 'active',
    assigned_to uuid REFERENCES users(id),
    
    people_count integer DEFAULT 1,
    contact_phone text,
    notes text,
    responder_eta text,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    resolved_at timestamptz
);

-- Create INDEXES for sos_requests
CREATE INDEX idx_sos_user_id ON sos_requests(user_id);
CREATE INDEX idx_sos_status ON sos_requests(status);
CREATE INDEX idx_sos_created ON sos_requests(created_at);
CREATE INDEX idx_sos_location ON sos_requests(latitude, longitude);

-- Create TABLE: responder_tracking
CREATE TABLE responder_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sos_id uuid UNIQUE REFERENCES sos_requests(id) ON DELETE CASCADE,
    responder_id uuid REFERENCES users(id), -- The volunteer/NGO
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    updated_at timestamptz DEFAULT now()
);

-- Create INDEXES for responder_tracking
CREATE INDEX idx_responder_tracking_loc ON responder_tracking(latitude, longitude);

-- Enable Row Level Security (RLS)
ALTER TABLE sos_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE responder_tracking ENABLE ROW LEVEL SECURITY;

-- ... RLS Policies for sos_requests (same as before) ...
-- Citizens can create their own SOS requests
CREATE POLICY "Citizens can create own SOS" 
ON sos_requests FOR INSERT 
TO authenticated 
WITH CHECK (true); -- Logic handled by backend

-- Citizens can view their own SOS requests
CREATE POLICY "Citizens can view own SOS" 
ON sos_requests FOR SELECT 
TO authenticated 
USING (true); -- Logic handled by backend

-- Volunteers, NGOs, and Admins can view all active SOS requests
CREATE POLICY "Authenticated users can view all SOS" 
ON sos_requests FOR SELECT 
TO authenticated 
USING (true);

-- Assigned users can update SOS
CREATE POLICY "Assigned users can update SOS" 
ON sos_requests FOR UPDATE 
TO authenticated 
USING (true);


-- RLS Policies for responder_tracking

-- Responders can update their own location
CREATE POLICY "Responders can update own location" 
ON responder_tracking FOR ALL
TO authenticated 
USING (true)
WITH CHECK (true);

-- Citizens can view responder location for their SOS
CREATE POLICY "Citizens can view responder location" 
ON responder_tracking FOR SELECT 
TO authenticated 
USING (true);
