import { Router } from 'express';
import { getStats, searchNGOs } from '../controllers/public.controller.js';

const router = Router();

// GET /api/public/stats - Public platform stats
router.get('/stats', getStats);

// GET /api/public/ngos - Search NGOs by area
router.get('/ngos', searchNGOs);

export default router;
