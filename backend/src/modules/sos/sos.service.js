import { sosRepository } from './sos.repository.js';
import logger from '../../config/logger.js';
import { AppError } from '../../middleware/error.middleware.js';
import { supabase } from '../../config/supabase.js';
import { aiTriageService } from '../../services/aiTriage.service.js';

export const sosService = {
    async createSOS(userId, data) {
        logger.info({ userId, data }, 'Creating SOS request');

        const sosData = {
            user_id: userId,
            emergency_type: data.emergency_type,
            severity: data.severity || 'medium',
            description: data.description,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            people_count: data.people_count || 1,
            contact_phone: data.contact_phone,
            status: 'active',
            // Mesh Metadata
            offline_id: data.offline_id,
            is_relayed: data.is_relayed || false,
            relayed_by: data.relayed_by || (data.is_relayed ? userId : null),
            reported_at: data.reported_at || new Date().toISOString()
        };

        // 1. Create/Upsert the SOS record
        let sos;
        try {
            logger.info({ sosData }, 'Inserting SOS into database');
            sos = await sosRepository.create(sosData);
            logger.info({ sosId: sos.id }, 'SOS_CREATED_SUCCESSFULLY');

            // 2. Start AI Triage in the background (non-blocking)
            // ...
            // We use an immediately-invoked async function to keep it floating
            (async () => {
                try {
                    const aiResult = await aiTriageService.getTriage(data.description, userId, data.imageBase64);
                    if (aiResult) {
                        logger.info({ sosId: sos.id, aiResult }, 'Merging AI Triage data in background');

                        const updates = {
                            ...aiResult,
                            // Escalate severity if AI identifies critical/high priority
                            severity: aiResult.priority === 'critical' ? 'critical' :
                                (aiResult.priority === 'high' ? 'high' : sosData.severity)
                        };

                        await sosRepository.updateStatus(sos.id, updates);
                        logger.info({ sosId: sos.id }, 'SOS_ENRICHED_BY_AI');
                    }
                } catch (err) {
                    logger.error({ sosId: sos.id, err }, 'Background AI Triage failed (non-critical)');
                }
            })();

        } catch (err) {
            logger.error({ userId, err }, 'Failed to create SOS request');
            throw err;
        }

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
