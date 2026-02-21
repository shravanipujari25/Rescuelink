import { sosService } from './sos.service.js';
import logger from '../../config/logger.js';
import { AppError } from '../../middleware/error.middleware.js';

export const sosController = {
    async createSOS(req, res, next) {
        try {
            const { emergency_type, severity, description, latitude, longitude, address, people_count, contact_phone } = req.body;
            const { userId } = req.user;

            if (!emergency_type || !latitude || !longitude) {
                throw new AppError('Missing required fields', 400);
            }

            const sos = await sosService.createSOS(userId, {
                emergency_type,
                severity,
                description,
                latitude,
                longitude,
                address,
                people_count,
                contact_phone
            });

            res.status(201).json({ status: 'success', data: sos });
        } catch (error) {
            next(error);
        }
    },

    async getMyActiveSOS(req, res, next) {
        try {
            const { userId } = req.user;
            const data = await sosService.getMyActiveSOS(userId);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            next(error);
        }
    },

    async getAssignedSOS(req, res, next) {
        try {
            const { userId } = req.user;
            const { lat, lng } = req.query;
            const data = await sosService.getAssignedSOS(userId, lat, lng);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            next(error);
        }
    },

    async resolveSOS(req, res, next) {
        try {
            const { id } = req.params;
            const { userId } = req.user;
            const data = await sosService.resolveSOS(id, userId);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            next(error);
        }
    },

    async updateResponderLocation(req, res, next) {
        try {
            const { id } = req.params; // sos id
            const { userId } = req.user;
            const { latitude, longitude } = req.body;

            if (!latitude || !longitude) {
                throw new AppError('Latitude and longitude required', 400);
            }

            const data = await sosService.updateResponderLocation(id, userId, latitude, longitude);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            next(error);
        }
    },

    async getResolvedSOS(req, res, next) {
        try {
            const { userId, role } = req.user;
            const data = await sosService.getResolvedSOS(userId, role);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            next(error);
        }
    }
};
