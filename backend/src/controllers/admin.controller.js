import {
    getPendingUsers,
    getAllUsers,
    getUserById,
    approveUser,
    rejectUser,
    suspendUser,
    unsuspendUser,
    getDashboardStats,
} from '../services/admin.service.js';
import { asyncHandler } from '../middleware/async.middleware.js';
import logger from '../config/logger.js';

// ---------------------------------------------------------------------------
// GET /api/admin/dashboard
// ---------------------------------------------------------------------------
export const dashboardStats = asyncHandler(async (req, res) => {
    const stats = await getDashboardStats(req.id);
    return res.status(200).json({ success: true, data: stats });
});

// ---------------------------------------------------------------------------
// GET /api/admin/users
// Query params: ?role=citizen|ngo|volunteer|admin  &status=active|pending|...
// ---------------------------------------------------------------------------
export const listUsers = asyncHandler(async (req, res) => {
    const { role, status } = req.query;
    const users = await getAllUsers({ role, status }, req.id);
    return res.status(200).json({ success: true, count: users.length, data: users });
});

// ---------------------------------------------------------------------------
// GET /api/admin/users/pending
// ---------------------------------------------------------------------------
export const listPendingUsers = asyncHandler(async (req, res) => {
    const users = await getPendingUsers(req.id);
    return res.status(200).json({ success: true, count: users.length, data: users });
});

// ---------------------------------------------------------------------------
// GET /api/admin/users/:id
// ---------------------------------------------------------------------------
export const getUser = asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id, req.id);
    return res.status(200).json({ success: true, data: user });
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/users/:id/approve
// ---------------------------------------------------------------------------
export const approve = asyncHandler(async (req, res) => {
    logger.info({ requestId: req.id, adminId: req.user.userId, targetId: req.params.id }, 'Admin approve action');
    const result = await approveUser(req.params.id, req.user.userId, req.id);
    return res.status(200).json({
        success: true,
        message: 'User approved successfully. They can now log in.',
        data: result,
    });
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/users/:id/reject
// Body: { reason: string }  (optional)
// ---------------------------------------------------------------------------
export const reject = asyncHandler(async (req, res) => {
    const reason = req.body?.reason ?? 'No reason provided';
    logger.info({ requestId: req.id, adminId: req.user.userId, targetId: req.params.id, reason }, 'Admin reject action');
    const result = await rejectUser(req.params.id, req.user.userId, reason, req.id);
    return res.status(200).json({
        success: true,
        message: 'User rejected.',
        data: result,
    });
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/users/:id/suspend
// ---------------------------------------------------------------------------
export const suspend = asyncHandler(async (req, res) => {
    logger.info({ requestId: req.id, adminId: req.user.userId, targetId: req.params.id }, 'Admin suspend action');
    const result = await suspendUser(req.params.id, req.user.userId, req.id);
    return res.status(200).json({
        success: true,
        message: 'User suspended.',
        data: result,
    });
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/users/:id/unsuspend
// ---------------------------------------------------------------------------
export const unsuspend = asyncHandler(async (req, res) => {
    logger.info({ requestId: req.id, adminId: req.user.userId, targetId: req.params.id }, 'Admin unsuspend action');
    const result = await unsuspendUser(req.params.id, req.user.userId, req.id);
    return res.status(200).json({
        success: true,
        message: 'User unsuspended.',
        data: result,
    });
});
