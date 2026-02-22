import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET;

async function verifyMeshBackend() {
    console.log('🚀 Starting Mesh Backend Verification...');

    try {
        // 1. Signup a fresh user
        const email = `mesh_test_${Date.now()}@example.com`;
        console.log(`Signing up fresh user: ${email}...`);
        const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password: 'Password123!',
                role: 'citizen',
                full_name: 'Mesh Test User',
                phone: '+919999999999'
            })
        });
        const signupJson = await signupRes.json();

        if (!signupRes.ok) {
            console.error('❌ Signup failed:', JSON.stringify(signupJson));
            return;
        }

        const userId = signupJson.data?.userId;
        if (!userId) {
            console.error('❌ Signup successful but no userId returned in data:', JSON.stringify(signupJson.data));
            return;
        }

        // 2. Manually generate a JWT token
        console.log(`Generating manual token for userId: ${userId}`);
        const token = jwt.sign(
            { userId, role: 'citizen' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log('✅ Manual token generated.');

        const offlineId = `mesh-test-${Date.now()}`;
        const commonData = {
            emergency_type: 'medical',
            latitude: 18.5204,
            longitude: 73.8567,
            description: 'Test Mesh SOS - Deduplication Check',
            offline_id: offlineId,
            reported_at: new Date().toISOString()
        };

        // 3. First broadcast attempt
        console.log('Sending first relay attempt (creating record)...');
        const response1 = await fetch(`${BASE_URL}/sos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(commonData)
        });
        const json1 = await response1.json();
        console.log('Response 1 Status:', response1.status);
        console.log('Response 1 Data:', JSON.stringify(json1.data || json1.message));

        if (!response1.ok) {
            console.error('❌ First attempt failed. Error:', json1.message || JSON.stringify(json1));
            console.log('Note: If this fails with "column does not exist", please ensure you have run migrations_mesh.sql in Supabase.');
            return;
        }

        // 4. Second relay attempt (Duplicated)
        console.log('Sending second (duplicate) relay attempt (should upsert/ignore)...');
        const response2 = await fetch(`${BASE_URL}/sos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(commonData)
        });
        const json2 = await response2.json();
        console.log('Response 2 Status:', response2.status);
        console.log('Response 2 Data:', JSON.stringify(json2.data || json2.message));

        if (json1.data?.id && json1.data?.id === json2.data?.id) {
            console.log('✅ SUCCESS: Deduplication verified! Both requests mapped to the same record ID.');
        } else {
            console.error('❌ FAILURE: Deduplication failed! Different IDs returned or records created.');
        }

    } catch (err) {
        console.error('❌ Error during verification:', err.message);
    }
}

verifyMeshBackend();
