import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';
import logger from '../config/logger.js';

// ---------------------------------------------------------------------------
// getPendingUsers — list all users awaiting approval (ngo + volunteer)
// ---------------------------------------------------------------------------
export const getPendingUsers = async (requestId) => {
    const { data, error } = await supabase
        .from('users')
        .select(
            'id, role, status, verification_status, email, name, ngo_name, contact_person, location, services, skills, volunteer_type, created_at'
        )
        .in('status', ['pending', 'inactive'])
        .eq('email_verified', true)
        .order('created_at', { ascending: true });

    if (error) {
        logger.error({ requestId, err: error }, 'Failed to fetch pending users');
        throw new AppError('Failed to fetch pending users.', 500);
    }

    return data;
};

// ---------------------------------------------------------------------------
// getAllUsers — list all users with optional role/status filter
// ---------------------------------------------------------------------------
export const getAllUsers = async ({ role, status } = {}, requestId) => {
    let query = supabase
        .from('users')
        .select(
            'id, role, status, verification_status, email_verified, email, name, ngo_name, contact_person, location, created_at'
        )
        .order('created_at', { ascending: false });

    if (role) query = query.eq('role', role);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
        logger.error({ requestId, err: error }, 'Failed to fetch users');
        throw new AppError('Failed to fetch users.', 500);
    }

    return data;
};

// ---------------------------------------------------------------------------
// getUserById — get a single user's full profile
// ---------------------------------------------------------------------------
export const getUserById = async (userId, requestId) => {
    const { data, error } = await supabase
        .from('users')
        .select(
            'id, role, status, verification_status, email_verified, email, name, ngo_name, contact_person, phone, location, services, skills, volunteer_type, registration_number, created_at, updated_at'
        )
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        logger.error({ requestId, err: error }, 'Failed to fetch user by ID');
        throw new AppError('Failed to fetch user.', 500);
    }
    if (!data) throw new AppError('User not found.', 404);

    return data;
};

// ---------------------------------------------------------------------------
// approveUser — approve an NGO or volunteer
// ---------------------------------------------------------------------------
export const approveUser = async (userId, adminId, requestId) => {
    const user = await getUserById(userId, requestId);

    if (user.role === 'citizen' || user.role === 'admin') {
        throw new AppError('Only NGO and volunteer accounts can be approved.', 400);
    }
    if (user.verification_status === 'approved') {
        throw new AppError('User is already approved.', 409);
    }

    // NGO approved → status becomes 'active'; volunteer approved → 'active'
    const { error } = await supabase
        .from('users')
        .update({
            status: 'active',
            verification_status: 'approved',
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

    if (error) {
        logger.error({ requestId, err: error }, 'Failed to approve user');
        throw new AppError('Failed to approve user.', 500);
    }

    logger.info(
        { requestId, adminId, userId, role: user.role },
        'Admin approved user'
    );

    return { userId, role: user.role, status: 'active', verification_status: 'approved' };
};

// ---------------------------------------------------------------------------
// rejectUser — reject an NGO or volunteer with a reason
// ---------------------------------------------------------------------------
export const rejectUser = async (userId, adminId, reason, requestId) => {
    const user = await getUserById(userId, requestId);

    if (user.role === 'citizen' || user.role === 'admin') {
        throw new AppError('Only NGO and volunteer accounts can be rejected.', 400);
    }

    const { error } = await supabase
        .from('users')
        .update({
            status: 'inactive',
            verification_status: 'rejected',
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

    if (error) {
        logger.error({ requestId, err: error }, 'Failed to reject user');
        throw new AppError('Failed to reject user.', 500);
    }

    logger.info(
        { requestId, adminId, userId, role: user.role, reason },
        'Admin rejected user'
    );

    return { userId, role: user.role, status: 'inactive', verification_status: 'rejected' };
};

// ---------------------------------------------------------------------------
// suspendUser — suspend any non-admin user
// ---------------------------------------------------------------------------
export const suspendUser = async (userId, adminId, requestId) => {
    const user = await getUserById(userId, requestId);

    if (user.role === 'admin') {
        throw new AppError('Admin accounts cannot be suspended.', 403);
    }
    if (user.status === 'suspended') {
        throw new AppError('User is already suspended.', 409);
    }

    const { error } = await supabase
        .from('users')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) {
        logger.error({ requestId, err: error }, 'Failed to suspend user');
        throw new AppError('Failed to suspend user.', 500);
    }

    logger.info({ requestId, adminId, userId }, 'Admin suspended user');
    return { userId, status: 'suspended' };
};

// ---------------------------------------------------------------------------
// unsuspendUser — restore a suspended user to their previous active state
// ---------------------------------------------------------------------------
export const unsuspendUser = async (userId, adminId, requestId) => {
    const user = await getUserById(userId, requestId);

    if (user.status !== 'suspended') {
        throw new AppError('User is not suspended.', 400);
    }

    // Restore to active (citizens) or active (approved ngo/volunteer)
    const restoreStatus =
        user.verification_status === 'approved' || user.role === 'citizen'
            ? 'active'
            : 'pending';

    const { error } = await supabase
        .from('users')
        .update({ status: restoreStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) {
        logger.error({ requestId, err: error }, 'Failed to unsuspend user');
        throw new AppError('Failed to unsuspend user.', 500);
    }

    logger.info({ requestId, adminId, userId, restoreStatus }, 'Admin unsuspended user');
    return { userId, status: restoreStatus };
};

// ---------------------------------------------------------------------------
// getDashboardStats — counts for admin dashboard
// ---------------------------------------------------------------------------
export const getDashboardStats = async (requestId) => {
    const { data, error } = await supabase
        .from('users')
        .select('role, status, verification_status');

    if (error) {
        logger.error({ requestId, err: error }, 'Failed to fetch dashboard stats');
        throw new AppError('Failed to fetch stats.', 500);
    }

    const stats = {
        total: data.length,
        byRole: { citizen: 0, ngo: 0, volunteer: 0, admin: 0 },
        byStatus: { active: 0, inactive: 0, pending: 0, unverified: 0, suspended: 0 },
        pendingApproval: 0,
    };

    for (const user of data) {
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
        stats.byStatus[user.status] = (stats.byStatus[user.status] || 0) + 1;
        if (
            (user.status === 'pending' || user.status === 'inactive') &&
            user.verification_status === 'pending'
        ) {
            stats.pendingApproval++;
        }
    }

    return stats;
};
