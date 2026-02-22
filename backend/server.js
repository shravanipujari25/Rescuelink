import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import { env } from './src/config/env.js';
import logger from './src/config/logger.js';

const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(
        {
            host: env.HOST,
            port: env.PORT,
            environment: env.NODE_ENV,
        },
        `🚀 RescueLink API started`
    );
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
const shutdown = (signal) => {
    logger.info({ signal }, 'Shutdown signal received. Closing server...');
    server.close(() => {
        logger.info('HTTP server closed. Exiting process.');
        process.exit(0);
    });

    // Force exit after 10 seconds if connections don't drain
    setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
    }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled rejections / exceptions
process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled Promise Rejection');
    shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught Exception — shutting down');
    process.exit(1);
});
