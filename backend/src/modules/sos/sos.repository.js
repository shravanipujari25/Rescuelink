import { supabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/error.middleware.js';

export const sosRepository = {
    async create(data) {
        const { data: sos, error } = await supabase
            .from('sos_requests')
            .insert(data)
            .select()
            .single();

        if (error) throw new AppError(error.message, 500);
        return sos;
    },

    async findActiveByUser(userId) {
        const { data, error } = await supabase
            .from('sos_requests')
            .select(`
                *,
                 assigned_user:assigned_to (
                    name,
                    phone
                )
            `)
            .eq('user_id', userId)
            .neq('status', 'resolved')
            .order('created_at', { ascending: false });

        if (error) throw new AppError(error.message, 500);
        return data;
    },

    async findAssignedTo(userId) {
        const { data, error } = await supabase
            .from('sos_requests')
            .select(`
                *,
                user:user_id (
                    name,
                    phone
                )
            `)
            .neq('status', 'resolved')  // Show all non-resolved requests
            .order('created_at', { ascending: false }); // Newest first

        if (error) throw new AppError(error.message, 500);
        return data;
    },

    async findById(id) {
        const { data, error } = await supabase
            .from('sos_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new AppError('SOS request not found', 404);
        return data;
    },

    async updateStatus(id, updates) {
        const { data, error } = await supabase
            .from('sos_requests')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new AppError(error.message, 500);
        return data;
    },

    async updateResponderLocation(sosId, responderId, lat, long) {
        const { data, error } = await supabase
            .from('responder_tracking')
            .upsert({
                sos_id: sosId,
                responder_id: responderId,
                latitude: lat,
                longitude: long,
                updated_at: new Date()
            }, { onConflict: 'sos_id' })
            .select()
            .single();

        if (error) throw new AppError(error.message, 500);
        return data;
    },

    async getResponderLocation(sosId) {
        const { data, error } = await supabase
            .from('responder_tracking')
            .select('*')
            .eq('sos_id', sosId)
            .single();

        return data; // Return null if not found (no error)
    },

    async findResolved(userId, role, limit = 10) {
        let query = supabase
            .from('sos_requests')
            .select(`
                *,
                user:user_id (name),
                assigned_user:assigned_to (name)
            `)
            .eq('status', 'resolved')
            .order('resolved_at', { ascending: false })
            .limit(limit);

        if (role === 'citizen') {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (error) throw new AppError(error.message, 500);
        return data;
    }
};
