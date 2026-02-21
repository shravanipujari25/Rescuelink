import { Router } from 'express';
import {
    dashboardStats,
    listUsers,
    listPendingUsers,
    getUser,
    approve,
    reject,
    suspend,
    unsuspend,
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All admin routes require: valid JWT + admin role
router.use(requireAuth, requireRole(['admin']));

/**
 * GET  /api/admin/dashboard       — stats overview
 * GET  /api/admin/users           — all users (filter: ?role=&status=)
 * GET  /api/admin/users/pending   — NGO + volunteers awaiting approval
 * GET  /api/admin/users/:id       — single user profile
 * PATCH /api/admin/users/:id/approve
 * PATCH /api/admin/users/:id/reject
 * PATCH /api/admin/users/:id/suspend
 * PATCH /api/admin/users/:id/unsuspend
 */
router.get('/dashboard', dashboardStats);
router.get('/users', listUsers);
router.get('/users/pending', listPendingUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/approve', approve);
router.patch('/users/:id/reject', reject);
router.patch('/users/:id/suspend', suspend);
router.patch('/users/:id/unsuspend', unsuspend);

export default router;
