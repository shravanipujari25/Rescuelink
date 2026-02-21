import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),
    HOST: z.string().default('localhost'),

    CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173'),

    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX: z.coerce.number().default(100),

    SUPABASE_URL: z.string().trim().url('SUPABASE_URL must be a valid URL'),
    SUPABASE_ANON_KEY: z.string().trim().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1),

    SMTP_HOST: z.string().default('smtp.gmail.com'),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
    SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
    SMTP_FROM: z.string().min(1).default('RescueLink <no-reply@rescuelink.com>'),
    OTP_EXPIRES_MINUTES: z.coerce.number().int().min(1).max(60).default(10),

    LOG_LEVEL: z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
        .default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:\n', parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;
