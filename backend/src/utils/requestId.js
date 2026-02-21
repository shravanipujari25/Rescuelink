import crypto from 'crypto';

/**
 * generateRequestId — creates a short unique ID for log correlation.
 * Attaches it to req.id so all middleware and controllers can reference it.
 */
export const requestId = (req, _res, next) => {
    req.id = crypto.randomUUID();
    next();
};
