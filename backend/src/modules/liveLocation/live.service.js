import { liveLocationRepository } from './live.repository.js';
import { sosRepository } from '../sos/sos.repository.js';
import logger from '../../config/logger.js';
import { AppError } from '../../middleware/error.middleware.js';

export const liveLocationService = {
    async updateLocation(userId, sosId, latitude, longitude) {
        if (!sosId || !latitude || !longitude) {
            throw new AppError('Missing required fields', 400);
        }

        // Verify SOS belongs to user
        const sos = await sosRepository.findById(sosId);

        if (sos.user_id !== userId) {
            logger.warn({ userId, sosId }, 'LIVE_LOCATION_DENIED');
            throw new AppError('You can only stream location for your own SOS', 403);
        }

        const location = await liveLocationRepository.upsert(sosId, userId, latitude, longitude);

        logger.info({ userId, sosId }, 'LIVE_LOCATION_UPDATED');
        return location;
    }
};
