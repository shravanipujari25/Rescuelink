import { supabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/error.middleware.js';

export const liveLocationRepository = {
    async upsert(sosId, userId, latitude, longitude) {
        const { data, error } = await supabase
            .from('sos_live_locations')
            .upsert({
                sos_id: sosId,
                user_id: userId,
                latitude,
                longitude,
                updated_at: new Date().toISOString()
            }, { onConflict: 'sos_id' })
            .select()
            .single();

        if (error) throw new AppError(error.message, 500);
        return data;
    }
};
