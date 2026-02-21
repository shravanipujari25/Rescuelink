import { liveLocationService } from './live.service.js';
import logger from '../../config/logger.js';
import { AppError } from '../../middleware/error.middleware.js';

export const liveLocationController = {
    async updateLocation(req, res, next) {
        try {
            const { sos_id, latitude, longitude } = req.body;
            const { userId } = req.user;

            if (!sos_id) {
                throw new AppError('SOS ID required', 400);
            }

            const location = await liveLocationService.updateLocation(userId, sos_id, latitude, longitude);

            res.status(200).json({ status: 'success', data: location });
        } catch (error) {
            next(error);
        }
    }
};
