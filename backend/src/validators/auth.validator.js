import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared field definitions
// ---------------------------------------------------------------------------
const emailField = z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim();

const passwordField = z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and a number'
    );

const phoneField = z
    .string({ required_error: 'Phone is required' })
    .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number');

const locationField = z
    .string({ required_error: 'Location is required' })
    .min(2, 'Location too short')
    .trim();

// ---------------------------------------------------------------------------
// Role discriminated union
// ---------------------------------------------------------------------------
const citizenSchema = z.object({
    role: z.literal('citizen'),
    name: z.string().min(2).trim().optional(),
    full_name: z.string().min(2).trim().optional(),

    email: emailField,
    phone: phoneField,
    password: passwordField,
});

const ngoSchema = z.object({
    role: z.literal('ngo'),
    ngo_name: z.string({ required_error: 'NGO name is required' }).min(2).trim(),
    contact_person: z
        .string({ required_error: 'Contact person is required' })
        .min(2)
        .trim(),
    email: emailField,
    password: passwordField,
    services: z
        .array(z.string().min(1))
        .min(1, 'At least one service is required'),
    location: locationField,
    registration_number: z.string().trim().optional(),
});

const volunteerSchema = z.object({
    role: z.literal('volunteer'),
    name: z.string().min(2).trim().optional(),
    full_name: z.string().min(2).trim().optional(),

    email: emailField,
    phone: phoneField,
    skills: z.array(z.string().min(1)).min(1, 'At least one skill is required'),
    volunteer_type: z
        .string({ required_error: 'Volunteer type is required' })
        .min(2)
        .trim(),
    location: locationField,
    password: passwordField,
});

// Admin signup is explicitly blocked at the route level, but we also guard here
const adminBlockSchema = z.object({
    role: z.literal('admin'),
});

export const signupSchema = z.discriminatedUnion('role', [
    citizenSchema,
    ngoSchema,
    volunteerSchema,
    adminBlockSchema, // will be caught in service layer
]);

// ---------------------------------------------------------------------------
// Login schema
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
    email: emailField,
    password: z
        .string({ required_error: 'Password is required' })
        .min(1, 'Password cannot be empty'),
});

// ---------------------------------------------------------------------------
// Verify email schema
// ---------------------------------------------------------------------------
export const verifyEmailSchema = z.object({
    email: emailField,
    otp: z
        .string({ required_error: 'OTP is required' })
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

// ---------------------------------------------------------------------------
// Resend OTP schema
// ---------------------------------------------------------------------------
export const resendOtpSchema = z.object({
    email: emailField,
});

// ---------------------------------------------------------------------------
// Forgot Password schema
// ---------------------------------------------------------------------------
export const forgotPasswordSchema = z.object({
    email: emailField,
});

// ---------------------------------------------------------------------------
// Reset Password schema
// ---------------------------------------------------------------------------
export const resetPasswordSchema = z.object({
    email: emailField,
    otp: z
        .string({ required_error: 'OTP is required' })
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d{6}$/, 'OTP must contain only digits'),
    newPassword: passwordField,

});

