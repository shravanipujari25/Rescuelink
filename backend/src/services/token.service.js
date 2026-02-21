import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';
import logger from '../config/logger.js';

// ---------------------------------------------------------------------------
// logoutUser — adds the token's JTI to the blocklist
// ---------------------------------------------------------------------------
export const logoutUser = async ({ jti, userId, expiresAt }, requestId) => {
    // Tokens issued before jti was added won't have this claim.
    // Can't blocklist them — they'll expire naturally via JWT exp.
    if (!jti) {
        logger.warn(
            { requestId, userId },
            'Logout: token has no jti — cannot blocklist, will expire naturally'
        );
        return; // still 200 to client — logout UX is unaffected
    }

    const { error } = await supabase.from('token_blocklist').insert({
        token_jti: jti,
        user_id: userId,
        expires_at: new Date(expiresAt * 1000).toISOString(),
    });

    if (error) {
        logger.error({ requestId, err: error }, 'Failed to blocklist token');
        throw new AppError('Logout failed. Please try again.', 500);
    }

    logger.info({ requestId, userId, jti }, 'User logged out — token blocklisted');
};

// ---------------------------------------------------------------------------
// isTokenBlocklisted — called by requireAuth on every protected request
// ---------------------------------------------------------------------------
export const isTokenBlocklisted = async (jti) => {
    const { data, error } = await supabase
        .from('token_blocklist')
        .select('id')
        .eq('token_jti', jti)
        .maybeSingle();

    if (error) return false; // fail open — don't block valid users on DB hiccup
    return !!data;
};

// ---------------------------------------------------------------------------
// cleanExpiredTokens — utility to purge old blocklist rows (run via cron)
// ---------------------------------------------------------------------------
export const cleanExpiredTokens = async () => {
    const { error } = await supabase
        .from('token_blocklist')
        .delete()
        .lt('expires_at', new Date().toISOString());

    if (error) {
        logger.error({ err: error }, 'Failed to clean expired blocklist tokens');
    }
};
