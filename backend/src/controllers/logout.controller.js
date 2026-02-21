import { logoutUser } from '../services/token.service.js';
import { asyncHandler } from '../middleware/async.middleware.js';
import logger from '../config/logger.js';

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// Requires: valid JWT (requireAuth middleware must run first)
// ---------------------------------------------------------------------------
export const logout = asyncHandler(async (req, res) => {
    const requestId = req.id;
    const { userId, jti, exp } = req.user;

    logger.info({ requestId, userId }, 'Logout request received');

    await logoutUser({ jti, userId, expiresAt: exp }, requestId);

    return res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
    });
});
