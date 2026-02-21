import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { isTokenBlocklisted } from '../services/token.service.js';

/**
 * requireAuth — verifies Bearer JWT and checks it hasn't been logged out.
 * Attaches decoded payload to req.user on success.
 */
export const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Provide a Bearer token.',
        });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
        decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
        const message =
            err.name === 'TokenExpiredError'
                ? 'Token has expired. Please log in again.'
                : 'Invalid token. Please log in again.';
        return res.status(401).json({ success: false, message });
    }

    // Check if this token was explicitly logged out
    if (decoded.jti) {
        const blocklisted = await isTokenBlocklisted(decoded.jti);
        if (blocklisted) {
            return res.status(401).json({
                success: false,
                message: 'Token has been revoked. Please log in again.',
            });
        }
    }

    req.user = decoded;
    next();
};
