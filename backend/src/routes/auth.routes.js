import { Router } from 'express';
import { signup, login, verifyEmailHandler, resendOtpHandler, forgotPasswordHandler, resetPasswordHandler } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
    signupSchema,
    loginSchema,
    verifyEmailSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from '../validators/auth.validator.js';


const router = Router();

/** POST /api/auth/signup — role-based signup, sends OTP email */
router.post('/signup', validate(signupSchema), signup);

/** POST /api/auth/verify-email — submit OTP to verify email */
router.post('/verify-email', validate(verifyEmailSchema), verifyEmailHandler);

/** POST /api/auth/resend-otp — resend a fresh OTP */
router.post('/resend-otp', validate(resendOtpSchema), resendOtpHandler);

/** POST /api/auth/login — returns JWT (only for verified + active accounts) */
router.post('/login', validate(loginSchema), login);

/** POST /api/auth/forgot-password — trigger OTP for password reset */
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordHandler);

/** POST /api/auth/reset-password — verify OTP and reset password */
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordHandler);


export default router;
