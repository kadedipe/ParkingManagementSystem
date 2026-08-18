#!/bin/bash
# ============================================================================
# Worker Entrypoint - Startup Script for Worker Service
# ============================================================================

# parking-management-system/infra/docker/worker-entrypoint.sh

#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Starting Worker Service${NC}"
echo -e "${GREEN}  Worker Type: ${WORKER_TYPE}${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if environment variables are set
if [ -z "$REDIS_HOST" ]; then
    echo -e "${YELLOW}Warning: REDIS_HOST not set, using default${NC}"
    export REDIS_HOST=redis
fi

if [ -z "$REDIS_PORT" ]; then
    echo -e "${YELLOW}Warning: REDIS_PORT not set, using default 6379${NC}"
    export REDIS_PORT=6379
fi

if [ -z "$DB_HOST" ]; then
    echo -e "${YELLOW}Warning: DB_HOST not set, using default${NC}"
    export DB_HOST=postgres
fi

if [ -z "$DB_PORT" ]; then
    echo -e "${YELLOW}Warning: DB_PORT not set, using default 5432${NC}"
    export DB_PORT=5432
fi

# Wait for dependencies
echo -e "${YELLOW}Waiting for Redis...${NC}"
while ! nc -z ${REDIS_HOST} ${REDIS_PORT}; do
    sleep 1
done
echo -e "${GREEN}✓ Redis is ready${NC}"

echo -e "${YELLOW}Waiting for PostgreSQL...${NC}"
while ! nc -z ${DB_HOST} ${DB_PORT}; do
    sleep 1
done
echo -e "${GREEN}✓ PostgreSQL is ready${NC}"

# Run database migrations for worker
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo -e "${YELLOW}Running database migrations...${NC}"
    npm run migration:run
    echo -e "${GREEN}✓ Migrations completed${NC}"
fi

# Start worker based on type
case ${WORKER_TYPE} in
    email)
        echo -e "${GREEN}Starting email worker...${NC}"
        exec node dist/workers/email.worker.js
        ;;
    notification)
        echo -e "${GREEN}Starting notification worker...${NC}"
        exec node dist/workers/notification.worker.js
        ;;
    payment)
        echo -e "${GREEN}Starting payment worker...${NC}"
        exec node dist/workers/payment.worker.js
        ;;
    report)
        echo -e "${GREEN}Starting report worker...${NC}"
        exec node dist/workers/report.worker.js
        ;;
    cache)
        echo -e "${GREEN}Starting cache worker...${NC}"
        exec node dist/workers/cache.worker.js
        ;;
    *)
        echo -e "${GREEN}Starting default worker...${NC}"
        exec node dist/worker.js
        ;;
esac