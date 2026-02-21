import logger from '../config/logger.js';
/**
 * role.middleware.js
 *
 * Role-based access control middleware.
 *
 * Role hierarchy:
 *   admin     → all features
 *   ngo       → ngo + citizen features
 *   volunteer → volunteer + citizen features
 *   citizen   → citizen features only
 *
 * Usage:
 *   router.get('/resource', requireAuth, requireRole(['ngo', 'citizen']), handler)
 */

/**
 * requireRole — factory that returns middleware allowing only the specified roles.
 *
 * @param {string[]} allowedRoles - array of roles permitted to access the route
 */
export const requireRole = (allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.',
        });
    }

    const { role, status } = req.user;
    const normalizedRole = role?.toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    console.log(`[RoleCheck] Debug:`, {
        userId: req.user.userId,
        userRole: role,
        normalizedRole,
        userStatus: status,
        allowedRoles,
        isAllowed: normalizedAllowed.includes(normalizedRole)
    });

    // Admin always has access
    if (normalizedRole === 'admin') return next();

    if (!normalizedAllowed.includes(normalizedRole)) {
        logger.warn({
            userId: req.user.userId,
            receivedRole: role,
            allowedRoles,
            path: req.originalUrl
        }, 'Role check failed');

        return res.status(403).json({
            success: false,
            message: `Access denied. Required role(s): ${allowedRoles.join(', ')}.`,
            debug: {
                receivedRole: role,
                allowedRoles,
                userStatus: status,
                hint: "Check if you logged in with the correct account/role."
            }
        });
    }

    // Non-admin users must be active to access protected routes
    if (status !== 'active') {
        return res.status(403).json({
            success: false,
            message: 'Your account is pending approval. Please wait for admin verification.',
        });
    }

    next();
};
