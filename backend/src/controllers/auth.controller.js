import { signupUser, loginUser, verifyEmail, resendOtp, forgotPassword, resetPassword } from '../services/auth.service.js';
import { asyncHandler } from '../middleware/async.middleware.js';
import logger from '../config/logger.js';

// ---------------------------------------------------------------------------
// POST /api/auth/signup
// ---------------------------------------------------------------------------
export const signup = asyncHandler(async (req, res) => {
    const requestId = req.id;
    logger.info({ requestId, role: req.validatedBody?.role }, 'Signup request received');

    const result = await signupUser(req.validatedBody, requestId);

    return res.status(201).json({
        success: true,
        message: `Account created! A 6-digit verification code has been sent to ${result.email}. Please verify your email to continue.`,
        data: {
            userId: result.userId,
            role: result.role,
            status: result.status,
            verification_status: result.verification_status,
        },
    });
});

// ---------------------------------------------------------------------------
// POST /api/auth/verify-email
// ---------------------------------------------------------------------------
export const verifyEmailHandler = asyncHandler(async (req, res) => {
    const requestId = req.id;
    logger.info({ requestId, email: req.validatedBody?.email }, 'Email verification attempt');

    const result = await verifyEmail(req.validatedBody, requestId);

    const message =
        result.status === 'active'
            ? 'Email verified! Your account is active. You can now log in.'
            : 'Email verified! Your account is pending admin approval. You will be notified once approved.';

    return res.status(200).json({ success: true, message, data: result });
});

// ---------------------------------------------------------------------------
// POST /api/auth/resend-otp
// ---------------------------------------------------------------------------
export const resendOtpHandler = asyncHandler(async (req, res) => {
    const requestId = req.id;
    logger.info({ requestId, email: req.validatedBody?.email }, 'OTP resend request');

    await resendOtp(req.validatedBody, requestId);

    return res.status(200).json({
        success: true,
        message: 'A new verification code has been sent to your email.',
    });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
export const login = asyncHandler(async (req, res) => {
    const requestId = req.id;
    logger.info({ requestId, email: req.validatedBody?.email }, 'Login request received');

    const result = await loginUser(req.validatedBody, requestId);

    return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
            userId: result.userId,
            role: result.role,
            status: result.status,
            token: result.token,
        },
    });
});

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// ---------------------------------------------------------------------------
export const forgotPasswordHandler = asyncHandler(async (req, res) => {
    const requestId = req.id;
    logger.info({ requestId, email: req.validatedBody?.email }, 'Forgot password request');

    await forgotPassword(req.validatedBody, requestId);

    return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset code has been sent.',
    });
});

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// ---------------------------------------------------------------------------
export const resetPasswordHandler = asyncHandler(async (req, res) => {
    const requestId = req.id;
    logger.info({ requestId, email: req.validatedBody?.email }, 'Password reset start');

    await resetPassword(req.validatedBody, requestId);

    return res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. You can now log in.',
    });
});

