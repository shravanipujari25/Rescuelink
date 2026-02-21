-- RescueLink Bulk Demo Data Expansion
-- Coverage: Mumbai, Pune, Bangalore, Delhi, Hyderabad, Chennai, Kolkata
-- All passwords are 'demo123' (bcrypt: $2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO)

-- 1. Bulk NGOs (15)
INSERT INTO users (role, email, password_hash, status, ngo_name, contact_person, location, services, email_verified, verification_status)
VALUES 
('ngo', 'ngo_mumbai_2@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Mumbai Health Trust', 'Sanjay Gupta', 'Mumbai', ARRAY['Medical', 'Blood Bank'], true, 'approved'),
('ngo', 'ngo_mumbai_3@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Dharavi Development NGO', 'Meera Iyer', 'Dharavi, Mumbai', ARRAY['Education', 'Food'], true, 'approved'),
('ngo', 'ngo_pune_2@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Pune Rescue Squad', 'Vikram Rao', 'Pune', ARRAY['Logistics', 'Vehicle'], true, 'approved'),
('ngo', 'ngo_pune_3@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Deccan Relief Foundation', 'Anil Deshpande', 'Deccan, Pune', ARRAY['Elderly Care', 'Shelter'], true, 'approved'),
('ngo', 'ngo_bangalore_1@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Tech Relief BLR', 'Karthik S', 'Bangalore', ARRAY['Tech Support', 'Communication'], true, 'approved'),
('ngo', 'ngo_bangalore_2@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'HSR Layout Volunteers', 'Sunitha R', 'HSR Layout, Bangalore', ARRAY['Local Aid', 'Sanitation'], true, 'approved'),
('ngo', 'ngo_delhi_1@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Capital Relief Force', 'Rajesh Khanna', 'Delhi', ARRAY['Ambulance', 'Night Shelter'], true, 'approved'),
('ngo', 'ngo_delhi_2@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Saket Community Aid', 'Neha Verma', 'Saket, Delhi', ARRAY['Women Safety', 'Counselling'], true, 'approved'),
('ngo', 'ngo_hyderabad_1@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Charminar Support', 'Osman Ali', 'Hyderabad', ARRAY['Old Mosque Aid', 'Heritage Protection'], true, 'approved'),
('ngo', 'ngo_hyderabad_2@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Gachibowli Relief', 'Arjun Reddy', 'Gachibowli, Hyderabad', ARRAY['Flood Rescue'], true, 'approved'),
('ngo', 'ngo_chennai_1@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Marina Rescue Foundation', 'Venkat Raman', 'Chennai', ARRAY['Coastal Aid', 'Logistics'], true, 'approved'),
('ngo', 'ngo_chennai_2@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Adyar Volunteers', 'Lakshmi P', 'Adyar, Chennai', ARRAY['Animal Welfare', 'Sanitation'], true, 'approved'),
('ngo', 'ngo_kolkata_1@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Howrah Bridge Support', 'Subhash Bose', 'Kolkata', ARRAY['River Rescue', 'Basic Needs'], true, 'approved'),
('ngo', 'ngo_kolkata_2@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Salt Lake Relief', 'Debjani Roy', 'Salt Lake, Kolkata', ARRAY['Medical', 'Education'], true, 'approved'),
('ngo', 'ngo_ahmedabad_1@demo.com', '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO', 'active', 'Gujarat Relief Crew', 'Parth Patel', 'Ahmedabad', ARRAY['Earthquake Alert', 'Food'], true, 'approved');

-- 2. Bulk Volunteers (30)
INSERT INTO users (role, email, password_hash, status, name, phone, location, skills, email_verified, verification_status)
VALUES 
('volunteer', 'vol_m_1@demo.com', '...', 'active', 'Amitabh B', '9000000001', 'Mumbai', ARRAY['Driving', 'First Aid'], true, 'approved'),
('volunteer', 'vol_m_2@demo.com', '...', 'active', 'Shahrukh K', '9000000002', 'Mumbai', ARRAY['Public Speaking', 'Logistics'], true, 'approved'),
('volunteer', 'vol_m_3@demo.com', '...', 'active', 'Salman K', '9000000003', 'Mumbai', ARRAY['Heavy Lifting', 'Driving'], true, 'approved'),
('volunteer', 'vol_m_4@demo.com', '...', 'active', 'Deepika P', '9000000004', 'Mumbai', ARRAY['Medical Asst', 'First Aid'], true, 'approved'),
('volunteer', 'vol_m_5@demo.com', '...', 'active', 'Alia B', '9000000005', 'Mumbai', ARRAY['Child Care', 'Sling Helper'], true, 'approved'),
('volunteer', 'vol_p_1@demo.com', '...', 'active', 'Nana P', '9000000006', 'Pune', ARRAY['Security', 'Driving'], true, 'approved'),
('volunteer', 'vol_p_2@demo.com', '...', 'active', 'Sonali B', '9000000007', 'Pune', ARRAY['Teaching', 'Admin'], true, 'approved'),
('volunteer', 'vol_p_3@demo.com', '...', 'active', 'Amol P', '9000000008', 'Pune', ARRAY['Photography', 'Social Media'], true, 'approved'),
('volunteer', 'vol_p_4@demo.com', '...', 'active', 'Radhika A', '9000000009', 'Pune', ARRAY['Nursing', 'First Aid'], true, 'approved'),
('volunteer', 'vol_p_5@demo.com', '...', 'active', 'Riteish D', '9000000010', 'Pune', ARRAY['Communication', 'Management'], true, 'approved'),
('volunteer', 'vol_b_1@demo.com', '...', 'active', 'Puneeth R', '9000000011', 'Bangalore', ARRAY['Field Work', 'Driving'], true, 'approved'),
('volunteer', 'vol_b_2@demo.com', '...', 'active', 'Rashmika M', '9000000012', 'Bangalore', ARRAY['Publicity', 'Fundraising'], true, 'approved'),
('volunteer', 'vol_b_3@demo.com', '...', 'active', 'Yash G', '9000000013', 'Bangalore', ARRAY['Construction', 'Manual Labor'], true, 'approved'),
('volunteer', 'vol_b_4@demo.com', '...', 'active', 'Anushka S', '9000000014', 'Bangalore', ARRAY['Yoga Instruction', 'Counseling'], true, 'approved'),
('volunteer', 'vol_b_5@demo.com', '...', 'active', 'Rishab S', '9000000015', 'Bangalore', ARRAY['Translation', 'Tech'], true, 'approved'),
('volunteer', 'vol_d_1@demo.com', '...', 'active', 'Akshay K', '9000000016', 'Delhi', ARRAY['Martial Arts', 'Rescue'], true, 'approved'),
('volunteer', 'vol_d_2@demo.com', '...', 'active', 'Kareena K', '9000000017', 'Delhi', ARRAY['Logistics', 'Food Prep'], true, 'approved'),
('volunteer', 'vol_d_3@demo.com', '...', 'active', 'Ranbir K', '9000000018', 'Delhi', ARRAY['Heavy Vehicle Driving'], true, 'approved'),
('volunteer', 'vol_d_4@demo.com', '...', 'active', 'Priyanka C', '9000000019', 'Delhi', ARRAY['Intl Coordination'], true, 'approved'),
('volunteer', 'vol_d_5@demo.com', '...', 'active', 'Ayushmann K', '9000000020', 'Delhi', ARRAY['Couselling', 'Music Therapy'], true, 'approved'),
('volunteer', 'vol_h_1@demo.com', '...', 'active', 'Prabhas R', '9000000021', 'Hyderabad', ARRAY['Power Lifting', 'Protection'], true, 'approved'),
('volunteer', 'vol_h_2@demo.com', '...', 'active', 'Samantha R', '9000000022', 'Hyderabad', ARRAY['Nutrition', 'Health'], true, 'approved'),
('volunteer', 'vol_h_3@demo.com', '...', 'active', 'Allu A', '9000000023', 'Hyderabad', ARRAY['Fast Response', 'Bike Rescue'], true, 'approved'),
('volunteer', 'vol_h_4@demo.com', '...', 'active', 'Tamannaah B', '9000000024', 'Hyderabad', ARRAY['Translation', 'Field Support'], true, 'approved'),
('volunteer', 'vol_h_5@demo.com', '...', 'active', 'Mahesh B', '9000000025', 'Hyderabad', ARRAY['Strategy', 'Logistics'], true, 'approved'),
('volunteer', 'vol_c_1@demo.com', '...', 'active', 'Rajini K', '9000000026', 'Chennai', ARRAY['Leadership', 'Crisis Mgmt'], true, 'approved'),
('volunteer', 'vol_c_2@demo.com', '...', 'active', 'Kamal H', '9000000027', 'Chennai', ARRAY['Technical Expert', 'Underwater'], true, 'approved'),
('volunteer', 'vol_c_3@demo.com', '...', 'active', 'Vijay Th', '9000000028', 'Chennai', ARRAY['Driving', 'Food Service'], true, 'approved'),
('volunteer', 'vol_c_4@demo.com', '...', 'active', 'Nayan Th', '9000000029', 'Chennai', ARRAY['Planning', 'Shelter'], true, 'approved'),
('volunteer', 'vol_c_5@demo.com', '...', 'active', 'Ajith K', '9000000030', 'Chennai', ARRAY['Mechanic', 'High Speed Response'], true, 'approved');

-- Fix passwords for volunteers (using common bcrypt hash)
UPDATE users SET password_hash = '$2b$10$EqfLIDZRWfDtMGlhZqSlU.E.OaK.Z7HkGlvGZqK6f6Oq7/5U.k7lO' WHERE password_hash = '...';
