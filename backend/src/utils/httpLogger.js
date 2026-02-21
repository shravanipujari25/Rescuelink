import pinoHttp from 'pino-http';
import pino from 'pino';
import { env } from '../config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.resolve(__dirname, '../logs');

/**
 * HTTP access logger using pino-http.
 * Writes to src/logs/access.log.
 * In development, also pretty-prints to console.
 */
export const httpLogger = pinoHttp({
    logger: pino(
        {
            level: 'info',
            timestamp: pino.stdTimeFunctions.isoTime,
            base: { service: 'rescuelink-http' },
        },
        pino.multistream([
            // stdout (JSON in prod, readable in dev via pino-pretty CLI if piped)
            { stream: process.stdout, level: env.LOG_LEVEL },
            // access.log
            {
                stream: pino.destination({
                    dest: path.join(logsDir, 'access.log'),
                    sync: false,
                    mkdir: true,
                }),
                level: 'info',
            },
        ])
    ),
    // Use request ID set by requestId middleware
    genReqId: (req) => req.id,
    customLogLevel: (_req, res) => {
        if (res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },
    serializers: {
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: req.url,
                remoteAddress: req.remoteAddress,
            };
        },
        res(res) {
            return { statusCode: res.statusCode };
        },
    },
});
