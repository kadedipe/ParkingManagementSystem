// ============================================================================
// Worker Service - Background Job Processor
// ============================================================================

// parking-management-system/backend/src/worker.js

import { createServer } from 'http';
import { Worker, Queue, QueueScheduler } from 'bullmq';
import Redis from 'ioredis';
import { config } from './config';
import { logger } from './utils/logger';
import { processEmail } from './workers/email.processor';
import { processNotification } from './workers/notification.processor';
import { processPayment } from './workers/payment.processor';
import { processReport } from './workers/report.processor';
import { processCache } from './workers/cache.processor';

// Redis connection
const connection = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
    },
});

// Create queues
export const emailQueue = new Queue('email', { connection });
export const notificationQueue = new Queue('notification', { connection });
export const paymentQueue = new Queue('payment', { connection });
export const reportQueue = new Queue('report', { connection });
export const cacheQueue = new Queue('cache', { connection });

// Create queue schedulers
new QueueScheduler('email', { connection });
new QueueScheduler('notification', { connection });
new QueueScheduler('payment', { connection });
new QueueScheduler('report', { connection });
new QueueScheduler('cache', { connection });

// Worker configurations
const workerConfig = {
    connection,
    concurrency: config.worker.concurrency || 5,
    limiter: {
        max: config.worker.rateLimit || 100,
        duration: 1000,
    },
    settings: {
        stalledInterval: 30000,
        maxStalledCount: 3,
        retryProcessDelay: 5000,
    },
};

// Email worker
const emailWorker = new Worker('email', processEmail, workerConfig);
emailWorker.on('completed', (job) => {
    logger.info(`Email job ${job.id} completed`);
});
emailWorker.on('failed', (job, err) => {
    logger.error(`Email job ${job.id} failed: ${err.message}`);
});

// Notification worker
const notificationWorker = new Worker('notification', processNotification, workerConfig);
notificationWorker.on('completed', (job) => {
    logger.info(`Notification job ${job.id} completed`);
});
notificationWorker.on('failed', (job, err) => {
    logger.error(`Notification job ${job.id} failed: ${err.message}`);
});

// Payment worker
const paymentWorker = new Worker('payment', processPayment, workerConfig);
paymentWorker.on('completed', (job) => {
    logger.info(`Payment job ${job.id} completed`);
});
paymentWorker.on('failed', (job, err) => {
    logger.error(`Payment job ${job.id} failed: ${err.message}`);
});

// Report worker
const reportWorker = new Worker('report', processReport, workerConfig);
reportWorker.on('completed', (job) => {
    logger.info(`Report job ${job.id} completed`);
});
reportWorker.on('failed', (job, err) => {
    logger.error(`Report job ${job.id} failed: ${err.message}`);
});

// Cache worker
const cacheWorker = new Worker('cache', processCache, workerConfig);
cacheWorker.on('completed', (job) => {
    logger.info(`Cache job ${job.id} completed`);
});
cacheWorker.on('failed', (job, err) => {
    logger.error(`Cache job ${job.id} failed: ${err.message}`);
});

// Health check server
const server = createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            workers: {
                email: emailWorker.isRunning(),
                notification: notificationWorker.isRunning(),
                payment: paymentWorker.isRunning(),
                report: reportWorker.isRunning(),
                cache: cacheWorker.isRunning(),
            },
        }));
    } else {
        res.writeHead(404);
        res.end();
    }
});

const PORT = config.worker.port || 3001;
server.listen(PORT, () => {
    logger.info(`Worker service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing workers...');
    await Promise.all([
        emailWorker.close(),
        notificationWorker.close(),
        paymentWorker.close(),
        reportWorker.close(),
        cacheWorker.close(),
    ]);
    await connection.quit();
    server.close(() => {
        logger.info('Worker service closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    logger.info('SIGINT signal received: closing workers...');
    await Promise.all([
        emailWorker.close(),
        notificationWorker.close(),
        paymentWorker.close(),
        reportWorker.close(),
        cacheWorker.close(),
    ]);
    await connection.quit();
    server.close(() => {
        logger.info('Worker service closed');
        process.exit(0);
    });
});