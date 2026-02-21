import crypto from 'crypto';

/**
 * generateOtp — returns a cryptographically random 6-digit string.
 * Uses crypto.randomInt for uniform distribution (no modulo bias).
 */
export const generateOtp = () => {
    return String(crypto.randomInt(100000, 999999));
};

/**
 * otpExpiresAt — returns a Date object N minutes from now.
 * @param {number} minutes
 */
export const otpExpiresAt = (minutes) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * isOtpExpired — checks if the stored expiry timestamp has passed.
 * @param {string|Date} expiresAt
 */
export const isOtpExpired = (expiresAt) => {
    return new Date() > new Date(expiresAt);
};
