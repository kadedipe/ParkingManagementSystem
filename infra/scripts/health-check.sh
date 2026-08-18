#!/bin/bash
# ============================================================================
# Health Check Script - Service Health Monitoring
# ============================================================================

# parking-management-system/infra/scripts/health-check.sh

#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Service Health Check${NC}"
echo -e "${YELLOW}========================================${NC}"

# Configuration
API_URL=${API_URL:-"http://localhost:3000"}
HEALTH_ENDPOINT="/health"
TIMEOUT=10

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $service_name... "
    
    if curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" | grep -q "$expected_status"; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Check backend
check_service "Backend" "${API_URL}${HEALTH_ENDPOINT}"

# Check frontend (if running)
if [ -n "$FRONTEND_URL" ]; then
    check_service "Frontend" "${FRONTEND_URL}${HEALTH_ENDPOINT}"
fi

# Check database
check_service "Database" "${API_URL}/api/health/db"

# Check Redis
check_service "Redis" "${API_URL}/api/health/redis"

echo -e "${GREEN}Health check completed!${NC}"