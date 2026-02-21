
import { supabase } from './src/config/supabase.js';

async function checkTracking() {
    console.log('Checking responder_tracking table...');
    const { data, error } = await supabase
        .from('responder_tracking')
        .select('*');

    if (error) {
        console.error('Error fetching tracking data:', error);
    } else {
        console.log('Tracking Data:', data);
        console.log('Count:', data.length);
    }

    console.log('Checking sos_requests table...');
    const { data: sos, error: sosError } = await supabase
        .from('sos_requests')
        .select('*');

    if (sosError) {
        console.error('Error fetching SOS data:', sosError);
    } else {
        console.log('SOS Data Count:', sos.length);
        sos.forEach(s => {
            console.log(`SOS ID: ${s.id}, Status: ${s.status}, Assigned: ${s.assigned_to}, Creator: ${s.user_id}`);
        });
    }
}

checkTracking();
