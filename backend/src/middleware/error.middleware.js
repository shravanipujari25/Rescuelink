import logger from '../config/logger.js';

/**
 * error.middleware.js
 *
 * Centralised Express error handler. Must be registered LAST in app.js.
 * Catches all errors forwarded via next(err).
 */
export const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;
    const isOperational = err.isOperational ?? false;

    // Log the error
    logger.error(
        {
            err: {
                message: err.message,
                name: err.name,
                type: err.type,
                limit: err.limit,
                received: err.received,
                stack: err.stack,
                statusCode,
            },
            req: {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
                requestId: req.id,
                headers: req.headers
            },
        },
        'Unhandled error 🚨'
    );

    // Don't leak stack traces in production
    const response = {
        success: false,
        message:
            isOperational || statusCode < 500
                ? err.message
                : 'An unexpected error occurred. Please try again later.',
    };

    if (process.env.NODE_ENV === 'development' && !isOperational) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

/**
 * AppError — operational error class for known, expected errors.
 * These are safe to expose to the client.
 */
export class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
