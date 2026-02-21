import nodemailer from 'nodemailer';
import { env } from './env.js';

/**
 * Reusable Nodemailer transporter.
 * Uses SMTP credentials from .env (Gmail App Password recommended).
 */
export const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for 465, false for 587 (STARTTLS)
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});
