#!/bin/bash
# ============================================================================
# Verification Script - Post-Deployment Verification
# ============================================================================

# parking-management-system/infra/scripts/verify.sh

#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Deployment Verification${NC}"
echo -e "${YELLOW}========================================${NC}"

# Configuration
API_URL=${API_URL:-"http://localhost:3000"}
TIMEOUT=30

# Function to verify endpoint
verify_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Verifying $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED (HTTP $response)${NC}"
        return 1
    fi
}

# Verify services
echo -e "${GREEN}Verifying services...${NC}"

# Backend
verify_endpoint "Backend" "${API_URL}/health"

# API endpoints
verify_endpoint "API - Auth" "${API_URL}/api/auth/health"
verify_endpoint "API - Parking" "${API_URL}/api/parking/health"
verify_endpoint "API - Bookings" "${API_URL}/api/bookings/health"
verify_endpoint "API - Payments" "${API_URL}/api/payments/health"

# Database connection
verify_endpoint "Database Connection" "${API_URL}/api/health/db"

# Redis connection
verify_endpoint "Redis Connection" "${API_URL}/api/health/redis"

# Frontend (if running)
if [ -n "$FRONTEND_URL" ]; then
    verify_endpoint "Frontend" "${FRONTEND_URL}/health"
fi

echo -e "\n${GREEN}Verification completed!${NC}"