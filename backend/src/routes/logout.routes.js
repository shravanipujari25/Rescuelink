import { Router } from 'express';
import { logout } from '../controllers/logout.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

/**
 * POST /api/auth/logout
 * Protected — requires valid JWT.
 * Adds the token's JTI to the blocklist so it can never be reused.
 */
router.post('/logout', requireAuth, logout);

export default router;
