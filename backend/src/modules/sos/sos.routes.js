import express from 'express';
import { sosController } from './sos.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = express.Router();

router.use(requireAuth); // All routes require authentication

// Create SOS (Citizen only)
router.post(
    '/',
    requireRole(['citizen']),
    sosController.createSOS
);

// Get my active SOS (Citizen)
router.get(
    '/my-active',
    requireRole(['citizen']),
    sosController.getMyActiveSOS
);

// Get assigned SOS (Volunteer, NGO, Admin)
router.get(
    '/assigned',
    requireRole(['volunteer', 'ngo', 'admin']),
    sosController.getAssignedSOS
);

// Resolve SOS (Volunteer, NGO, Admin)
router.put(
    '/:id/resolve',
    requireRole(['volunteer', 'ngo', 'admin']),
    sosController.resolveSOS
);

// Update Responder Location
router.post(
    '/:id/location',
    requireRole(['volunteer', 'ngo', 'admin']),
    sosController.updateResponderLocation
);

// Get resolved SOS (Everyone sees their own relevant ones)
router.get(
    '/resolved',
    sosController.getResolvedSOS
);

export default router;
