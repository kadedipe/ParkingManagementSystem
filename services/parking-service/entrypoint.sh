#!/bin/bash
# ============================================================================
# Entrypoint Script - Parking Service Startup
# ============================================================================

# parking-management-system/services/parking-service/entrypoint.sh

#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Starting Parking Service${NC}"
echo -e "${GREEN}  Service: ${SERVICE_NAME}${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if environment variables are set
if [ -z "$DB_HOST" ]; then
    echo -e "${YELLOW}Warning: DB_HOST not set, using default${NC}"
    export DB_HOST=postgres
fi

if [ -z "$DB_PORT" ]; then
    echo -e "${YELLOW}Warning: DB_PORT not set, using default 5432${NC}"
    export DB_PORT=5432
fi

if [ -z "$REDIS_HOST" ]; then
    echo -e "${YELLOW}Warning: REDIS_HOST not set, using default${NC}"
    export REDIS_HOST=redis
fi

if [ -z "$REDIS_PORT" ]; then
    echo -e "${YELLOW}Warning: REDIS_PORT not set, using default 6379${NC}"
    export REDIS_PORT=6379
fi

# Wait for dependencies
echo -e "${YELLOW}Waiting for PostgreSQL...${NC}"
while ! nc -z ${DB_HOST} ${DB_PORT}; do
    sleep 1
done
echo -e "${GREEN}✓ PostgreSQL is ready${NC}"

echo -e "${YELLOW}Waiting for Redis...${NC}"
while ! nc -z ${REDIS_HOST} ${REDIS_PORT}; do
    sleep 1
done
echo -e "${GREEN}✓ Redis is ready${NC}"

# Run database migrations
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo -e "${YELLOW}Running database migrations...${NC}"
    npm run migration:run
    echo -e "${GREEN}✓ Migrations completed${NC}"
fi

# Start the service
echo -e "${GREEN}Starting parking service...${NC}"
exec "$@"