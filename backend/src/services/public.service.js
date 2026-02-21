import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';
import logger from '../config/logger.js';

export const getGlobalStats = async (requestId) => {
    try {
        // 1. Active Incidents (status != 'resolved')
        const { count: activeIncidents, error: activeError } = await supabase
            .from('sos_requests')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'resolved');

        if (activeError) throw activeError;

        // 2. Volunteers Registered (role = 'volunteer' and status = 'active')
        const { count: volunteersOnline, error: volunteerError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'volunteer')
            .eq('status', 'active');

        if (volunteerError) throw volunteerError;

        // 3. Total Rescues (status = 'resolved')
        const { count: totalRescues, error: rescueError } = await supabase
            .from('sos_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'resolved');

        if (rescueError) throw rescueError;

        return {
            activeIncidents: activeIncidents || 0,
            volunteersOnline: volunteersOnline || 0,
            totalRescues: totalRescues || 0
        };
    } catch (error) {
        logger.error({ requestId, err: error }, 'Failed to fetch public stats');
        throw new AppError('Failed to fetch platform statistics.', 500);
    }
};

/**
 * listNGOs — search for active, approved NGOs by location/area
 */
export const listNGOs = async ({ query, service }, requestId) => {
    let q = supabase
        .from('users')
        .select('id, ngo_name, contact_person, location, services, created_at')
        .eq('role', 'ngo')
        .eq('status', 'active')
        .order('ngo_name', { ascending: true });

    if (query) {
        // Partial, case-insensitive match on location
        q = q.ilike('location', `%${query}%`);
    }

    if (service) {
        // PostgREST/Supabase uses .contains() for Postgres ARRAY columns
        q = q.contains('services', [service]);
    }

    const { data, error } = await q;

    if (error) {
        logger.error({ requestId, err: error, query }, 'Failed to search NGOs');
        throw new AppError('Failed to search NGOs.', 500);
    }

    return data;
};
