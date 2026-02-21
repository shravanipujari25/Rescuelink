import express from 'express';
import { liveLocationController } from './live.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.post(
    '/',
    requireRole(['citizen']),
    liveLocationController.updateLocation
);

export default router;
