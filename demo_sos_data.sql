-- RescueLink Demo Data for SOS Coordination Testing
-- Coverage: Mumbai, Pune, Bangalore
-- All passwords are 'demo123' (bcrypt: $2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO)

-- 1. Create Demo Users
INSERT INTO users (id, role, email, password_hash, status, name, phone, location, email_verified, verification_status)
VALUES 
-- ADMIN
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', 'admin@rescuelink.org', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'System Admin', '9999999999', 'Global', true, 'approved'),

-- CITIZENS (To create SOS)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'citizen', 'citizen_mumbai@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Mumbai Resident', '9876543210', 'Mumbai', true, 'approved'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'citizen', 'citizen_pune@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Pune Resident', '9876543211', 'Pune', true, 'approved'),

-- VOLUNTEERS
('01eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'volunteer', 'volunteer_mumbai@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Rahul Mehta', '9876543212', 'Mumbai', true, 'approved'),
('01eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'volunteer', 'volunteer_pune@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Sneha Patil', '9876543213', 'Pune', true, 'approved'),
('01eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'volunteer', 'volunteer_bangalore@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Vijay Kumar', '9876543214', 'Bangalore', true, 'approved');

-- 2. Create Demo NGOs
INSERT INTO users (id, role, email, password_hash, status, ngo_name, contact_person, location, services, email_verified, verification_status)
VALUES 
('defebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'ngo', 'ngo_mumbai@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Mumbai Relief Network', 'Amit Singh', 'Mumbai', ARRAY['Medical', 'Food', 'Logistics'], true, 'approved'),
('defebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'ngo', 'ngo_pune@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Pune Care Plus', 'Priya Deshmukh', 'Pune', ARRAY['Shelter', 'Water'], true, 'approved');

-- 3. Create Active SOS Requests
INSERT INTO sos_requests (id, user_id, emergency_type, severity, description, latitude, longitude, address, status, contact_phone)
VALUES 
-- Mumbai Emergency
('505ebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'medical', 'high', 'Immediate ambulance needed near Gateway of India.', 18.9220, 72.8347, 'Apollo Bandar, Colaba, Mumbai', 'active', '9876543210'),

-- Pune Emergency
('505ebc99-9c0b-4ef8-bb6d-6bb9bd380b00', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'fire', 'critical', 'Fire break out in Shaniwar Peth area.', 18.5195, 73.8553, 'Shaniwar Peth, Pune, Maharashtra', 'active', '9876543211'),

-- Bangalore Emergency
('505ebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'trapped', 'medium', 'Stuck in elevator due to power outage.', 12.9716, 77.5946, 'MG Road, Bangalore, Karnataka', 'active', '9999999999');

-- Add Volunteer Skills for better UI representation
UPDATE users SET skills = ARRAY['First Aid', 'Swimming', 'Drive 4x4'] WHERE role = 'volunteer';
