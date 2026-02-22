import express from 'express';

import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

import { env } from './config/env.js';
import { requestId } from './utils/requestId.js';
import { httpLogger } from './utils/httpLogger.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import logoutRoutes from './routes/logout.routes.js';
import adminRoutes from './routes/admin.routes.js';
import sosRoutes from './modules/sos/sos.routes.js';
import liveRoutes from './modules/liveLocation/live.routes.js';
import donationRoutes from './modules/donation/donation.routes.js';
import publicRoutes from './routes/public.routes.js';


const app = express();

// ---------------------------------------------------------------------------
// Request parsing (Must be early for large payloads)
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// ---------------------------------------------------------------------------
// Security middleware
// ---------------------------------------------------------------------------
app.use(helmet());

const ALLOWED_ORIGINS = [
    ...env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    // Always allow the Vite dev server in development
    ...(env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://localhost:5174'] : []),
];

app.use(
    cors({
        origin: ALLOWED_ORIGINS,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
});

// app.use(limiter); // Applied per-route below to avoid interference with large payloads

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
});

// ---------------------------------------------------------------------------
// Request parsing & logging
// ---------------------------------------------------------------------------
app.use(requestId);
app.use(httpLogger);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/auth', limiter, authLimiter, authRoutes);
app.use('/api/auth', limiter, authLimiter, logoutRoutes);

// Admin routes — stricter rate limit
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many admin requests. Slow down.' },
});
app.use('/api/admin', limiter, adminLimiter, adminRoutes);

app.use('/api/sos/live-location', liveRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/public', publicRoutes);


// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'RescueLink API is running.',
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found.',
    });
});

// ---------------------------------------------------------------------------
// Centralised error handler (must be last)
// ---------------------------------------------------------------------------
app.use(errorMiddleware);

export default app;
