-- Example NGO data for testing area-wise filtering
-- To be run in Supabase SQL Editor

-- Ensure some test users exist with role 'ngo' and status 'active'
-- Note: You may need to adjust the UUIDs or just use real IDs from your table

-- 1. NGO in Mumbai
INSERT INTO users (id, ngo_name, contact_person, location, services, role, status, email, password_hash, email_verified)
VALUES 
(gen_random_uuid(), 'Mumbai Relief Foundation', 'Amit Sharma', 'Mumbai', ARRAY['Food', 'Medical'], 'ngo', 'active', 'mumbai@relief.org', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', true),
(gen_random_uuid(), 'Andheri Community Support', 'Priya Das', 'Andheri, Mumbai', ARRAY['Shelter', 'Logistics'], 'ngo', 'active', 'andheri@support.org', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', true),

-- 2. NGO in Pune
(gen_random_uuid(), 'Pune Care Collective', 'Rahul Verma', 'Pune', ARRAY['Rescue', 'Food'], 'ngo', 'active', 'pune@care.org', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', true),
(gen_random_uuid(), 'Hinjewadi Sahayata', 'Sneha Patil', 'Pune', ARRAY['Medical'], 'ngo', 'active', 'hinjewadi@sahayata.org', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', true),

-- 3. NGO in Delhi
(gen_random_uuid(), 'Delhi Sahayata Kendra', 'Sanjay Gupta', 'New Delhi', ARRAY['Food', 'Shelter'], 'ngo', 'active', 'delhi@sahayata.org', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', true),
(gen_random_uuid(), 'NCR Logistics Hub', 'Anita Rao', 'Gurgaon, NCR', ARRAY['Logistics'], 'ngo', 'active', 'ncr@logistics.org', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', true);

-- Verification Query:
-- SELECT id, ngo_name, location FROM users WHERE role = 'ngo' AND status = 'active';
