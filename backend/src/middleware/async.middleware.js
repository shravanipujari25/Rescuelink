/**
 * asyncHandler — wraps async route handlers to forward errors to Express
 * error middleware, eliminating try/catch boilerplate in controllers.
 *
 * @param {Function} fn - async express handler
 * @returns {Function} wrapped handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
