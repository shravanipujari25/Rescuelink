import { sosRepository } from './sos.repository.js';
import logger from '../../config/logger.js';
import { AppError } from '../../middleware/error.middleware.js';
import { supabase } from '../../config/supabase.js';
import { aiTriageService } from '../../services/aiTriage.service.js';

export const sosService = {
    async createSOS(userId, data) {
        logger.info({ userId, data }, 'Creating SOS request');

        let sosData = {
            user_id: userId,
            emergency_type: data.emergency_type,
            severity: data.severity || 'medium',
            description: data.description,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            people_count: data.people_count || 1,
            contact_phone: data.contact_phone,
            status: 'active'
        };

        // 🚨 AI TRIAGE INTEGRATION
        try {
            const aiResult = await aiTriageService.getTriage(data.description, userId);
            if (aiResult) {
                logger.info({ userId, aiResult }, 'Merging AI Triage data');
                sosData = {
                    ...sosData,
                    ...aiResult,
                    // If AI identifies a high priority, escalate the severity
                    severity: aiResult.priority === 'critical' ? 'critical' : (aiResult.priority === 'high' ? 'high' : sosData.severity)
                };
            }
        } catch (err) {
            logger.error({ userId, err }, 'AI Triage integration failed (non-blocking)');
        }

        const sos = await sosRepository.create(sosData);
        logger.info({ sosId: sos.id }, 'SOS_CREATED');
        return sos;
    },

    async getMyActiveSOS(userId) {
        // Find active or assigned SOS by this user
        // We need a repo method for this. For now let's reuse findAssignedTo logic but filtering by user_id
        // Actually, we need a new repo method: findActiveByUser
        const activeSOS = await sosRepository.findActiveByUser(userId);

        // For each SOS, attach responder location if exists
        const enrichedSOS = await Promise.all(activeSOS.map(async (sos) => {
            const loc = await sosRepository.getResponderLocation(sos.id);
            return { ...sos, responder_location: loc };
        }));

        return enrichedSOS;
    },

    async getAssignedSOS(userId, lat, lng) {
        logger.info({ userId, lat, lng }, 'Fetching assigned SOS requests');
        // Using supabase filter assigned_to = userId
        return await sosRepository.findAssignedTo(userId, lat, lng);
    },

    async resolveSOS(id, userId) {
        const sos = await sosRepository.findById(id);

        const updated = await sosRepository.updateStatus(id, {
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            assigned_to: sos.assigned_to || userId // Ensure we know who resolved it
        });

        // Explicitly cleanup tracking data when resolved
        try {
            await supabase.from('responder_tracking').delete().eq('sos_id', id);
        } catch (err) {
            logger.warn({ sosId: id }, 'Failed to delete tracking data on resolve (non-critical)');
        }

        logger.info({ sosId: id, resolvedBy: userId }, 'SOS_RESOLVED');
        return updated;
    },

    async updateResponderLocation(id, userId, lat, long) {
        // Verify SOS exists and is active?
        const sos = await sosRepository.findById(id);
        if (sos.status === 'resolved') {
            throw new AppError('Cannot track resolved SOS', 400);
        }

        // Update location
        const tracking = await sosRepository.updateResponderLocation(id, userId, lat, long);
        logger.info({ sosId: id, lat, long }, 'RESPONDER_LOCATION_UPDATED');
        return tracking;
    },

    async getResolvedSOS(userId, role) {
        return await sosRepository.findResolved(userId, role);
    }
};
