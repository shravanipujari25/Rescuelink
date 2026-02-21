-- Update coordinates for demo users to enable strict area-wise filtering
-- Mumbai: 18.922, 72.834
-- Pune: 18.520, 73.855
-- Bangalore: 12.971, 77.594
-- Delhi: 28.613, 77.209
-- Hyderabad: 17.385, 78.486
-- Chennai: 13.082, 80.270
-- Kolkata: 22.572, 88.363

-- Mumbai Users
UPDATE users SET latitude = 18.922, longitude = 72.834 WHERE location ILIKE '%Mumbai%';

-- Pune Users
UPDATE users SET latitude = 18.520, longitude = 73.855 WHERE location ILIKE '%Pune%';

-- Bangalore Users
UPDATE users SET latitude = 12.971, longitude = 77.594 WHERE location ILIKE '%Bangalore%';

-- Delhi Users
UPDATE users SET latitude = 28.613, longitude = 77.209 WHERE location ILIKE '%Delhi%' OR location ILIKE '%Gurgaon%';

-- Hyderabad Users
UPDATE users SET latitude = 17.385, longitude = 78.486 WHERE location ILIKE '%Hyderabad%' OR location ILIKE '%Gachibowli%';

-- Chennai Users
UPDATE users SET latitude = 13.082, longitude = 80.270 WHERE location ILIKE '%Chennai%';

-- Kolkata Users
UPDATE users SET latitude = 22.572, longitude = 88.363 WHERE location ILIKE '%Kolkata%';

-- Ahmedabad
UPDATE users SET latitude = 23.0225, longitude = 72.5714 WHERE location ILIKE '%Ahmedabad%';
