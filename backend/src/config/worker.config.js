// ============================================================================
// Worker Configuration - Worker Service Configuration
// ============================================================================

// parking-management-system/backend/src/config/worker.config.js

export const workerConfig = {
    // Redis configuration
    redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        retryStrategy: (times) => Math.min(times * 50, 2000),
    },

    // Worker configuration
    worker: {
        port: parseInt(process.env.WORKER_PORT) || 3001,
        concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 5,
        rateLimit: parseInt(process.env.WORKER_RATE_LIMIT) || 100,
        stalledInterval: 30000,
        maxStalledCount: 3,
        retryProcessDelay: 5000,
        removeOnComplete: {
            age: 3600, // 1 hour
            count: 1000,
        },
        removeOnFail: {
            age: 86400, // 24 hours
            count: 10000,
        },
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: {
                age: 3600,
                count: 1000,
            },
            removeOnFail: {
                age: 86400,
                count: 10000,
            },
        },
    },

    // Email worker configuration
    email: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM || 'noreply@parkingapp.com',
        maxRetries: 3,
        retryDelay: 5000,
    },

    // Notification worker configuration
    notification: {
        expoToken: process.env.EXPONENT_TOKEN,
        maxRetries: 3,
        retryDelay: 5000,
        batchSize: 100,
    },

    // Payment worker configuration
    payment: {
        stripeSecretKey: process.env.STRIPE_SECRET_KEY,
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        maxRetries: 3,
        retryDelay: 5000,
    },

    // Report worker configuration
    report: {
        awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
        awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        awsRegion: process.env.AWS_REGION || 'us-east-1',
        s3Bucket: process.env.AWS_S3_BUCKET,
        maxRetries: 3,
        retryDelay: 5000,
    },

    // Cache worker configuration
    cache: {
        ttl: parseInt(process.env.CACHE_TTL) || 3600,
        maxRetries: 3,
        retryDelay: 5000,
    },
};