import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/error.middleware.js';
import logger from '../config/logger.js';
import { generateOtp, otpExpiresAt, isOtpExpired } from '../utils/otp.js';
import { sendOtpEmail, sendForgotPasswordEmail } from './email.service.js';

// ---------------------------------------------------------------------------
// Role → initial status/verification mapping
// NOTE: all roles start as "unverified" until email is confirmed.
// After verification, citizens become "active"; ngo/volunteer become "pending".
// ---------------------------------------------------------------------------
const ROLE_DEFAULTS = {
    citizen: {
        status: 'unverified',
        verification_status: null,
        status_after_verify: 'active',
    },
    ngo: {
        status: 'unverified',
        verification_status: 'pending',
        status_after_verify: 'inactive',
    },
    volunteer: {
        status: 'unverified',
        verification_status: 'pending',
        status_after_verify: 'pending',
    },
};

// ---------------------------------------------------------------------------
// signupUser
// ---------------------------------------------------------------------------
export const signupUser = async (data, requestId) => {
    const { role, password, ...rest } = data;

    if (role === 'admin') {
        logger.warn({ requestId, role }, 'Blocked admin signup attempt');
        throw new AppError('Admin accounts cannot be created via this endpoint.', 403);
    }

    const defaults = ROLE_DEFAULTS[role];

    // Check duplicate email
    const { data: existing, error: lookupError } = await supabase
        .from('users')
        .select('id')
        .eq('email', rest.email)
        .maybeSingle();

    if (lookupError) {
        logger.error({ requestId, err: lookupError }, 'DB lookup error during signup');
        throw new AppError('Database error. Please try again.', 500);
    }
    if (existing) {
        throw new AppError('An account with this email already exists.', 409);
    }

    // Hash password + generate OTP
    const password_hash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    const otp = generateOtp();
    const otp_expires_at = otpExpiresAt(env.OTP_EXPIRES_MINUTES);

    const userRecord = {
        role,
        password_hash,
        status: defaults.status,
        verification_status: defaults.verification_status,
        email_verified: false,
        otp_code: otp,
        otp_expires_at: otp_expires_at.toISOString(),
        ...buildRoleFields(role, rest),
        created_at: new Date().toISOString(),
    };

    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert(userRecord)
        .select('id, role, status, verification_status, email, name, ngo_name, contact_person')
        .single();

    if (insertError) {
        logger.error({ requestId, err: insertError }, 'DB insert error during signup');
        throw new AppError('Failed to create account. Please try again.', 500);
    }

    // Send OTP email
    const displayName = newUser.name || newUser.contact_person || newUser.ngo_name || 'User';
    try {
        await sendOtpEmail(newUser.email, displayName, otp);
        logger.info({ requestId, userId: newUser.id, role }, 'OTP email sent');
    } catch (emailErr) {
        // Don't block signup if email fails — log it and let user resend
        logger.error({ requestId, err: emailErr }, 'Failed to send OTP email');
    }

    logger.info({ requestId, userId: newUser.id, role }, 'Signup success — awaiting email verification');

    return {
        userId: newUser.id,
        role: newUser.role,
        status: newUser.status,
        verification_status: newUser.verification_status,
        email: newUser.email,
    };
};

// ---------------------------------------------------------------------------
// verifyEmail
// ---------------------------------------------------------------------------
export const verifyEmail = async (data, requestId) => {
    const { email, otp } = data;

    const { data: user, error } = await supabase
        .from('users')
        .select('id, role, status, email_verified, otp_code, otp_expires_at')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        logger.error({ requestId, err: error }, 'DB error during email verification');
        throw new AppError('Database error. Please try again.', 500);
    }
    if (!user) {
        throw new AppError('No account found with this email.', 404);
    }
    if (user.email_verified) {
        throw new AppError('Email is already verified. Please log in.', 409);
    }
    if (user.otp_code !== otp) {
        logger.warn({ requestId, userId: user.id }, 'Invalid OTP attempt');
        throw new AppError('Invalid verification code.', 400);
    }
    if (isOtpExpired(user.otp_expires_at)) {
        logger.warn({ requestId, userId: user.id }, 'Expired OTP attempt');
        throw new AppError('Verification code has expired. Please request a new one.', 400);
    }

    // Determine the correct post-verification status for this role
    const roleDefaults = ROLE_DEFAULTS[user.role];
    const newStatus = roleDefaults?.status_after_verify ?? 'pending';

    const { error: updateError } = await supabase
        .from('users')
        .update({
            email_verified: true,
            status: newStatus,
            otp_code: null,
            otp_expires_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (updateError) {
        logger.error({ requestId, err: updateError }, 'DB error updating email_verified');
        throw new AppError('Verification failed. Please try again.', 500);
    }

    logger.info({ requestId, userId: user.id, role: user.role, newStatus }, 'Email verified');

    return { role: user.role, status: newStatus };
};

// ---------------------------------------------------------------------------
// resendOtp
// ---------------------------------------------------------------------------
export const resendOtp = async (data, requestId) => {
    const { email } = data;

    const { data: user, error } = await supabase
        .from('users')
        .select('id, role, email_verified, name, ngo_name, contact_person')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        logger.error({ requestId, err: error }, 'DB error during OTP resend');
        throw new AppError('Database error. Please try again.', 500);
    }
    if (!user) throw new AppError('No account found with this email.', 404);
    if (user.email_verified) throw new AppError('Email is already verified.', 409);

    const otp = generateOtp();
    const otp_expires_at = otpExpiresAt(env.OTP_EXPIRES_MINUTES);

    const { error: updateError } = await supabase
        .from('users')
        .update({ otp_code: otp, otp_expires_at: otp_expires_at.toISOString() })
        .eq('id', user.id);

    if (updateError) {
        logger.error({ requestId, err: updateError }, 'DB error updating OTP');
        throw new AppError('Failed to resend code. Please try again.', 500);
    }

    const displayName = user.name || user.contact_person || user.ngo_name || 'User';
    await sendOtpEmail(email, displayName, otp);

    logger.info({ requestId, userId: user.id }, 'OTP resent');
};

// ---------------------------------------------------------------------------
// loginUser
// ---------------------------------------------------------------------------
export const loginUser = async (data, requestId) => {
    const { email, password } = data;

    const { data: user, error } = await supabase
        .from('users')
        .select('id, role, status, verification_status, password_hash, email_verified, name, ngo_name, contact_person')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        logger.error({ requestId, err: error }, 'DB error during login');
        throw new AppError('Database error. Please try again.', 500);
    }
    if (!user) {
        logger.warn({ requestId, email }, 'Login failed — user not found');
        throw new AppError('Invalid email or password.', 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
        logger.warn({ requestId, userId: user.id }, 'Login failed — wrong password');
        throw new AppError('Invalid email or password.', 401);
    }

    // Must verify email before logging in
    if (!user.email_verified) {
        throw new AppError(
            'Please verify your email first. Check your inbox for the OTP.',
            403
        );
    }

    if (user.status !== 'active') {
        logger.warn({ requestId, userId: user.id, status: user.status }, 'Login failed — not active');
        throw new AppError(
            'Your account is pending admin approval. You will be notified once approved.',
            403
        );
    }

    const jti = crypto.randomUUID();
    const token = jwt.sign(
        { userId: user.id, role: user.role, status: user.status, jti },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );

    logger.info({ requestId, userId: user.id, role: user.role }, 'Login success');

    return {
        userId: user.id,
        role: user.role,
        status: user.status,
        name: user.name,
        ngo_name: user.ngo_name,
        contact_person: user.contact_person,
        token
    };
};

// ---------------------------------------------------------------------------
// forgotPassword
// ---------------------------------------------------------------------------
export const forgotPassword = async (data, requestId) => {
    const { email } = data;

    const { data: user, error } = await supabase
        .from('users')
        .select('id, name, ngo_name, contact_person')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        logger.error({ requestId, err: error }, 'DB error during forgot password');
        throw new AppError('Database error. Please try again.', 500);
    }
    if (!user) {
        // Security best practice: don't reveal if user exists.
        // But for this platform, a 404 is helpful during rescue scenarios.
        throw new AppError('No account found with this email.', 404);
    }

    const otp = generateOtp();
    const otp_expires_at = otpExpiresAt(env.OTP_EXPIRES_MINUTES);

    const { error: updateError } = await supabase
        .from('users')
        .update({
            otp_code: otp,
            otp_expires_at: otp_expires_at.toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

    if (updateError) {
        logger.error({ requestId, err: updateError }, 'DB error updating reset OTP');
        throw new AppError('Failed to process request. Please try again.', 500);
    }

    const displayName = user.name || user.contact_person || user.ngo_name || 'User';
    try {
        if (typeof sendForgotPasswordEmail === 'function') {
            await sendForgotPasswordEmail(email, displayName, otp);
            logger.info({ requestId, userId: user.id }, 'Forgot password email sent');
        } else {
            logger.error({ requestId, userId: user.id }, 'sendForgotPasswordEmail is not a function at runtime');
        }
    } catch (emailErr) {
        logger.error({ requestId, err: emailErr }, 'Failed to send forgot password email');
    }
};

// ---------------------------------------------------------------------------
// resetPassword
// ---------------------------------------------------------------------------
export const resetPassword = async (data, requestId) => {
    const { email, otp, newPassword } = data;

    const { data: user, error } = await supabase
        .from('users')
        .select('id, otp_code, otp_expires_at')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        logger.error({ requestId, err: error }, 'DB error during password reset');
        throw new AppError('Database error. Please try again.', 500);
    }
    if (!user) {
        throw new AppError('Invalid request.', 400);
    }
    if (user.otp_code !== otp) {
        throw new AppError('Invalid reset code.', 400);
    }
    if (isOtpExpired(user.otp_expires_at)) {
        throw new AppError('Reset code has expired. Please request a new one.', 400);
    }

    const password_hash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

    const { error: updateError } = await supabase
        .from('users')
        .update({
            password_hash,
            otp_code: null,
            otp_expires_at: null,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

    if (updateError) {
        logger.error({ requestId, err: updateError }, 'DB error updating password');
        throw new AppError('Failed to reset password. Please try again.', 500);
    }

    logger.info({ requestId, userId: user.id }, 'Password reset successful');
};


// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------
function buildRoleFields(role, rest) {
    switch (role) {
        case 'citizen':
            return { name: rest.full_name || rest.name, email: rest.email, phone: rest.phone };
        case 'ngo':
            return {
                name: rest.name || rest.contact_person,
                ngo_name: rest.ngo_name || rest.name,
                contact_person: rest.contact_person,
                email: rest.email,
                services: rest.services,
                location: rest.location,
                registration_number: rest.registration_number ?? null,
            };
        case 'volunteer':
            return {
                name: rest.name,
                email: rest.email,
                phone: rest.phone,
                skills: rest.skills,
                volunteer_type: rest.volunteer_type,
                location: rest.location,
            };
        default:
            return {};
    }
}
