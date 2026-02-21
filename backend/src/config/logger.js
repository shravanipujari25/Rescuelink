import pino from 'pino';
import { env } from './env.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.resolve(__dirname, '../logs');

// ---------------------------------------------------------------------------
// Build streams array
// ---------------------------------------------------------------------------
const streams = [
    // app.log — info and above
    {
        stream: pino.destination({
            dest: path.join(logsDir, 'app.log'),
            sync: false,
            mkdir: true,
        }),
        level: 'info',
    },
    // error.log — errors only
    {
        stream: pino.destination({
            dest: path.join(logsDir, 'error.log'),
            sync: false,
            mkdir: true,
        }),
        level: 'error',
    },
];

// ---------------------------------------------------------------------------
// In development: add pino-pretty transport for readable console output.
// pino.transport() is the correct ESM-safe way to use pino-pretty.
// ---------------------------------------------------------------------------
let logger;

if (env.NODE_ENV === 'development') {
    const prettyTransport = pino.transport({
        targets: [
            // Pretty console
            {
                target: 'pino-pretty',
                level: env.LOG_LEVEL,
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
            },
            // app.log
            {
                target: 'pino/file',
                level: 'info',
                options: { destination: path.join(logsDir, 'app.log'), mkdir: true },
            },
            // error.log
            {
                target: 'pino/file',
                level: 'error',
                options: { destination: path.join(logsDir, 'error.log'), mkdir: true },
            },
        ],
    });

    logger = pino(
        {
            level: env.LOG_LEVEL,
            timestamp: pino.stdTimeFunctions.isoTime,
            base: { pid: process.pid, service: 'rescuelink-backend' },
        },
        prettyTransport
    );
} else {
    // Production: JSON to stdout + log files
    logger = pino(
        {
            level: env.LOG_LEVEL,
            timestamp: pino.stdTimeFunctions.isoTime,
            formatters: {
                level(label) {
                    return { level: label };
                },
            },
            base: { pid: process.pid, service: 'rescuelink-backend' },
        },
        pino.multistream([{ stream: process.stdout, level: env.LOG_LEVEL }, ...streams])
    );
}

export default logger;
