
import { supabase } from './src/config/supabase.js';

async function checkUser(email) {
    console.log(`Checking user with email: ${email}`);
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        console.error('Error:', error);
    } else {
        if (data) {
            console.log(`Email: ${data.email} | Role: ${data.role} | Status: ${data.status} | ID: ${data.id}`);
        } else {
            console.log(`User not found for ${email}`);
        }
    }
}

// Check typical test accounts
const emails = ['shravup007@gmail.com', 'volunteer@example.com', 'citizen@example.com'];
emails.forEach(email => checkUser(email));
