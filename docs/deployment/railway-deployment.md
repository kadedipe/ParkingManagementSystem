Railway Deployment Guide - Parking Management System
1. Overview
1.1 Why Railway?
Railway is a modern deployment platform that offers:

Simplified Deployment: One-click deployments from GitHub

Automatic Scaling: Built-in horizontal scaling

Managed Services: PostgreSQL, Redis, and other databases

Environment Management: Easy environment variables

Built-in CI/CD: Automatic deployments on git push

Cost-Effective: Pay-as-you-go pricing

Global CDN: Fast content delivery worldwide

1.2 Architecture on Railway
text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Railway Platform                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    GitHub Integration                                │   │
│  │                   (Auto-deploy on push)                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      Railway Services                                │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                     API Gateway Service                         │ │   │
│  │  │                   (Node.js + Express)                           │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                    │                                   │ │   │
│  │  ┌──────────────┬──────────────┬──────────────┬──────────────────────┐ │   │
│  │  │              │              │              │                      │ │   │
│  │  ▼              ▼              ▼              ▼                      │ │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────────┐ │   │
│  │  │  Backend   │ │  Backend   │ │  Backend   │ │    Worker          │ │   │
│  │  │  Service 1 │ │  Service 2 │ │  Service 3 │ │    Service         │ │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────────────┘ │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                     Database Services                          │ │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │ │   │
│  │  │  │ PostgreSQL  │  │    Redis    │  │     Storage (S3)        │ │ │   │
│  │  │  │  (Managed)  │  │  (Managed)  │  │     (Managed)           │ │ │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
2. Prerequisites
2.1 Account Setup
bash
# 1. Create Railway Account
# Visit: https://railway.app
# Sign up with GitHub or email

# 2. Install Railway CLI (Optional)
npm install -g @railway/cli

# 3. Login to Railway CLI
railway login

# 4. Verify Installation
railway --version
2.2 Project Structure
text
parking-management-system/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── railway.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── mobile/
│   └── (Not deployed on Railway)
├── infra/
│   ├── docker/
│   └── nginx/
├── railway.json
├── .env.example
├── .gitignore
└── README.md
3. Railway Configuration
3.1 Railway JSON Configuration
json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/package.json",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["backend/**"],
        "excludeFiles": ["backend/**/*.test.js"]
      }
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend",
      "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/frontend",
      "status": 200
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "PORT": 3000
  }
}
3.2 Dockerfile for Railway
dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy source code
COPY . .

# Build application
RUN yarn build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]
3.3 Railway Start Script
json
// backend/package.json
{
  "scripts": {
    "start": "node dist/main.js",
    "build": "tsc",
    "dev": "nodemon src/main.ts",
    "test": "jest",
    "migration:run": "typeorm migration:run",
    "migration:generate": "typeorm migration:generate",
    "migration:revert": "typeorm migration:revert"
  }
}
4. Services Setup
4.1 Backend Service
bash
# 1. Create Backend Service
# In Railway Dashboard:
# New Project -> Deploy from GitHub -> Select Repository

# 2. Configure Service
# Service Name: parking-backend
# Root Directory: /backend
# Build Command: yarn install && yarn build
# Start Command: yarn start

# 3. Environment Variables
NODE_ENV=production
PORT=3000
DB_HOST=${RAILWAY_POSTGRES_HOST}
DB_PORT=${RAILWAY_POSTGRES_PORT}
DB_NAME=${RAILWAY_POSTGRES_DATABASE}
DB_USER=${RAILWAY_POSTGRES_USER}
DB_PASSWORD=${RAILWAY_POSTGRES_PASSWORD}
REDIS_HOST=${RAILWAY_REDIS_HOST}
REDIS_PORT=${RAILWAY_REDIS_PORT}
REDIS_PASSWORD=${RAILWAY_REDIS_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=2592000
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
SENDGRID_API_KEY=${SENDGRID_API_KEY}
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
SENTRY_DSN=${SENTRY_DSN}
CORS_ORIGINS=["https://parkingapp.railway.app"]
4.2 Frontend Service
bash
# 1. Create Frontend Service
# Service Name: parking-frontend
# Root Directory: /frontend
# Build Command: npm install && npm run build
# Start Command: npm start

# 2. Environment Variables
REACT_APP_API_URL=https://parking-backend.railway.app/api
REACT_APP_WS_URL=wss://parking-backend.railway.app/ws
REACT_APP_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
REACT_APP_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
REACT_APP_ENV=production
4.3 Database Services
bash
# 1. Create PostgreSQL Database
# In Railway Dashboard:
# New Service -> Database -> PostgreSQL

# 2. PostgreSQL Configuration
# Database Name: parking_db
# User: parking_user
# Password: Auto-generated (copy this)

# 3. Run Migrations
# Connect to database and run migrations
railway connect postgres
4.4 Redis Service
bash
# 1. Create Redis Cache
# New Service -> Database -> Redis

# 2. Redis Configuration
# Redis URL: Generated automatically
# Password: Auto-generated
5. Environment Variables
5.1 Production Environment Variables
bash
# Core Configuration
NODE_ENV=production
APP_ENV=production
APP_VERSION=2.0.0
PORT=3000

# Database
DB_HOST=${RAILWAY_POSTGRES_HOST}
DB_PORT=${RAILWAY_POSTGRES_PORT}
DB_NAME=${RAILWAY_POSTGRES_DATABASE}
DB_USER=${RAILWAY_POSTGRES_USER}
DB_PASSWORD=${RAILWAY_POSTGRES_PASSWORD}
DB_SSL=true
DB_POOL_SIZE=20

# Redis
REDIS_HOST=${RAILWAY_REDIS_HOST}
REDIS_PORT=${RAILWAY_REDIS_PORT}
REDIS_PASSWORD=${RAILWAY_REDIS_PASSWORD}
REDIS_CACHE_TTL=3600

# JWT
JWT_SECRET=your-very-secure-jwt-secret-key
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=2592000

# Microservices (Internal)
PARKING_SERVICE_URL=http://parking-service:3002
BOOKING_SERVICE_URL=http://booking-service:3003
PAYMENT_SERVICE_URL=http://payment-service:3004
USER_SERVICE_URL=http://user-service:3005
VEHICLE_SERVICE_URL=http://vehicle-service:3006
CHARGING_SERVICE_URL=http://charging-service:3007
NOTIFICATION_SERVICE_URL=http://notification-service:3008

# External APIs
STRIPE_SECRET_KEY=your_live_key
STRIPE_WEBHOOK_SECRET=your_key
GOOGLE_MAPS_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_key
TWILIO_AUTH_TOKEN=your_key
SENDGRID_API_KEY=your_key

# Monitoring
SENTRY_DSN=xxx
LOG_LEVEL=info

# Security
CORS_ORIGINS=["https://parkingapp.railway.app"]
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60
5.2 Staging Environment Variables
bash
# Core Configuration
NODE_ENV=staging
APP_ENV=staging
APP_VERSION=2.0.0-beta
PORT=3000

# Database (Use Railway's staging database)
DB_HOST=${RAILWAY_POSTGRES_HOST}
DB_PORT=${RAILWAY_POSTGRES_PORT}
DB_NAME=${RAILWAY_POSTGRES_DATABASE}
DB_USER=${RAILWAY_POSTGRES_USER}
DB_PASSWORD=${RAILWAY_POSTGRES_PASSWORD}
DB_SSL=true

# Redis
REDIS_HOST=${RAILWAY_REDIS_HOST}
REDIS_PORT=${RAILWAY_REDIS_PORT}
REDIS_PASSWORD=${RAILWAY_REDIS_PASSWORD}

# JWT
JWT_SECRET=staging-jwt-secret-key
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=2592000

# External APIs (Use test keys)
STRIPE_SECRET_KEY=your_test_key
STRIPE_WEBHOOK_SECRET=your_test_key
GOOGLE_MAPS_API_KEY=your_test_key
TWILIO_ACCOUNT_SID=your_test_key
TWILIO_AUTH_TOKEN=your_test_key
SENDGRID_API_KEY=your_test_key

# Security
CORS_ORIGINS=["https://staging-parkingapp.railway.app"]
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_PERIOD=60
6. Deployment Steps
6.1 Initial Deployment
bash
# Step 1: Connect GitHub Repository
# 1. Go to Railway Dashboard
# 2. Click "New Project"
# 3. Select "Deploy from GitHub repo"
# 4. Choose your repository
# 5. Select the branch (main)

# Step 2: Configure Services
# Railway will auto-detect services
# Configure each service:

# Backend Service
Service Name: parking-backend
Environment Variables: Add from .env.production

# Frontend Service
Service Name: parking-frontend
Environment Variables: Add from frontend .env

# Step 3: Add Databases
# Click "Add Service" -> "Database" -> "PostgreSQL"
# Name: postgres-prod
# Click "Add Service" -> "Database" -> "Redis"
# Name: redis-prod

# Step 4: Connect Services
# In Railway, services automatically connect
# The database URLs are injected as environment variables

# Step 5: Deploy
# Click "Deploy" on each service
# Wait for build and deployment
6.2 Automated Deployment Script
bash
#!/bin/bash
# deploy-railway.sh

echo "🚀 Starting Railway deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
railway login

# Set environment
railway environment production

# Deploy backend
echo "📦 Deploying backend..."
cd backend
railway up --service parking-backend

# Deploy frontend
echo "📦 Deploying frontend..."
cd ../frontend
railway up --service parking-frontend

# Run database migrations
echo "🔄 Running database migrations..."
railway run npm run migration:run

# Check deployment status
echo "✅ Deployment completed!"
railway status
6.3 Deployment Verification
bash
# Health check script
#!/bin/bash
# health-check.sh

echo "🔍 Performing health check..."

# Check backend
BACKEND_URL="https://parking-backend.railway.app/health"
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL)

if [ $BACKEND_RESPONSE -eq 200 ]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Check frontend
FRONTEND_URL="https://parking-frontend.railway.app"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)

if [ $FRONTEND_RESPONSE -eq 200 ]; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

# Check database
DB_CHECK=$(railway run "node -e 'require(\"./backend/src/utils/db-check.js\")'")

if [ $DB_CHECK -eq 0 ]; then
    echo "✅ Database is healthy"
else
    echo "❌ Database health check failed"
    exit 1
fi

echo "✅ All services are healthy!"
7. Monitoring & Logging
7.1 Railway Monitoring
bash
# View logs
railway logs

# View specific service logs
railway logs --service parking-backend

# View metrics
railway metrics

# View deployment status
railway status
7.2 Custom Monitoring Setup
javascript
// backend/src/utils/monitoring.js
import express from 'express';
import { logger } from './logger.js';

const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
    });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
    const metrics = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        activeConnections: getActiveConnections(),
        requestCount: getRequestCount(),
        errorCount: getErrorCount()
    };
    res.json(metrics);
});

export default app;
7.3 Alerts Configuration
yaml
# railway.yml
alerts:
  - name: "High CPU Usage"
    condition: "cpu_usage > 80"
    duration: "5m"
    severity: "warning"
    channels: ["email", "slack"]
    
  - name: "High Memory Usage"
    condition: "memory_usage > 85"
    duration: "5m"
    severity: "warning"
    channels: ["email", "slack"]
    
  - name: "Service Down"
    condition: "service_status == 'down'"
    duration: "1m"
    severity: "critical"
    channels: ["email", "slack", "pagerduty"]
    
  - name: "High Error Rate"
    condition: "error_rate > 5"
    duration: "5m"
    severity: "critical"
    channels: ["email", "slack"]
8. Performance Optimization
8.1 Caching Strategy
javascript
// backend/src/middleware/cache.js
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export const cacheMiddleware = (duration = 3600) => {
    return async (req, res, next) => {
        const key = `cache:${req.originalUrl}`;
        
        try {
            const cached = await redis.get(key);
            if (cached) {
                return res.json(JSON.parse(cached));
            }
            
            // Store original send function
            const originalSend = res.json;
            res.json = function(data) {
                redis.setex(key, duration, JSON.stringify(data));
                originalSend.call(this, data);
            };
            
            next();
        } catch (error) {
            console.error('Cache error:', error);
            next();
        }
    };
};
8.2 Database Optimization
sql
-- Railway PostgreSQL Optimizations
-- Enable connection pooling
ALTER SYSTEM SET max_connections = '100';
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '768MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = '0.9';
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = '100';
ALTER SYSTEM SET random_page_cost = '1.1';
ALTER SYSTEM SET effective_io_concurrency = '200';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Reload configuration
SELECT pg_reload_conf();
8.3 Node.js Performance
javascript
// backend/src/utils/performance.js
import cluster from 'cluster';
import os from 'os';

export const setupCluster = () => {
    if (cluster.isMaster) {
        const numCPUs = os.cpus().length;
        console.log(`Master ${process.pid} running`);
        
        // Fork workers
        for (let i = 0; i < Math.min(numCPUs, 4); i++) {
            cluster.fork();
        }
        
        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`);
            cluster.fork();
        });
    } else {
        console.log(`Worker ${process.pid} started`);
        // Run app
        startApp();
    }
};

// Enable compression
import compression from 'compression';
app.use(compression());

// Enable gzip
app.use((req, res, next) => {
    res.set('Content-Encoding', 'gzip');
    next();
});
9. Backup & Recovery
9.1 Database Backup
bash
#!/bin/bash
# backup-railway.sh

echo "🔄 Starting database backup..."

# Create backup directory
mkdir -p ./backups

# Backup PostgreSQL
railway connect postgres --command "pg_dump -U parking_user parking_db > ./backups/backup_$(date +%Y%m%d_%H%M%S).sql"

# Compress backup
gzip ./backups/backup_*.sql

# Upload to S3 (optional)
aws s3 cp ./backups/ s3://parking-backups/railway/ --recursive

# Keep only last 7 days
find ./backups -name "*.sql.gz" -mtime +7 -delete

echo "✅ Backup completed!"
9.2 Restore Procedure
bash
#!/bin/bash
# restore-railway.sh

echo "🔄 Starting database restore..."

# Get latest backup
LATEST_BACKUP=$(ls -t ./backups/backup_*.sql.gz | head -1)

# Uncompress backup
gunzip $LATEST_BACKUP

# Restore database
railway connect postgres --command "psql -U parking_user parking_db < ${LATEST_BACKUP%.gz}"

# Clean up
rm ${LATEST_BACKUP%.gz}

echo "✅ Restore completed!"
10. Troubleshooting
10.1 Common Issues & Solutions
10.1.1 Build Failures
bash
# Issue: Build fails due to memory limits
# Solution: Increase memory limit in railway.json
{
  "build": {
    "memory": 4096
  }
}

# Issue: Missing dependencies
# Solution: Check package.json and install missing dependencies
railway run npm install

# Issue: TypeScript compilation errors
# Solution: Run type check locally first
npm run build
10.1.2 Connection Issues
bash
# Issue: Database connection timeout
# Solution: Increase connection pool size
DB_POOL_SIZE=20
DB_QUERY_TIMEOUT=30000

# Issue: Redis connection refused
# Solution: Verify Redis URL and restart service
railway logs --service redis-prod

# Issue: CORS errors
# Solution: Update CORS configuration
CORS_ORIGINS=["https://parkingapp.railway.app", "https://*.railway.app"]
10.1.3 Performance Issues
bash
# Issue: High latency
# Solution: Enable caching and CDN
# Add Railway CDN for static assets

# Issue: Memory leak
# Solution: Check for memory leaks and restart service
railway restart --service parking-backend

# Issue: CPU throttling
# Solution: Increase CPU allocation
# In railway.json:
{
  "cpu": 2
}
10.2 Debugging Commands
bash
# View all services
railway services

# View service logs
railway logs --service parking-backend

# View deployment history
railway deployments

# Rollback to previous deployment
railway rollback

# Open shell in service
railway shell --service parking-backend

# Run commands in environment
railway run "node -e 'console.log(process.env)'"
10.3 Support Resources
markdown
# Railway Support
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/railwayapp/railway/issues

# Parking App Support
- Team Discord: https://discord.gg/parkingapp
- Documentation: https://docs.parkingapp.com
- Email: support@parkingapp.com
11. Cost Optimization
11.1 Resource Optimization
yaml
# railway.yml
resources:
  backend:
    cpu: 1
    memory: 512
    instances: 2
    auto_scaling:
      enabled: true
      min: 2
      max: 5
      cpu_threshold: 70
      
  frontend:
    cpu: 0.5
    memory: 256
    instances: 1
    
  worker:
    cpu: 0.5
    memory: 256
    instances: 1
11.2 Cost Saving Tips
markdown
1. **Use Staging Environment**: Test before deploying to production
2. **Auto-scaling**: Scale down during off-peak hours
3. **Cache Optimization**: Reduce database calls
4. **CDN Usage**: Serve static assets from CDN
5. **Database Optimization**: Use appropriate instance sizes
6. **Monitor Usage**: Set up alerts for unexpected usage
7. **Clean Up**: Remove unused services and data
12. Security Best Practices
12.1 Environment Security
bash
# Use Railway's secret management
railway secrets set JWT_SECRET=xxx
railway secrets set DB_PASSWORD=xxx

# Never commit secrets to GitHub
# Use .env.example for documentation
# Use Railway's environment variables
12.2 Network Security
yaml
# railway.yml
network:
  enabled: true
  private_networking: true
  allowed_ips:
    - "10.0.0.0/8"
    - "172.16.0.0/12"
12.3 Application Security
javascript
// Security middleware
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Helmet for security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGINS.split(','),
    credentials: true
}));
This guide is maintained by the DevOps team and updated regularly.

