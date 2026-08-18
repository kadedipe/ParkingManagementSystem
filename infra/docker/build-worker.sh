#!/bin/bash
# ============================================================================
# Worker Build Script - Build and Deploy Workers
# ============================================================================

# parking-management-system/infra/docker/build-worker.sh

#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Building Worker Services${NC}"
echo -e "${GREEN}========================================${NC}"

# Build worker image
echo -e "${YELLOW}Building worker image...${NC}"
docker build \
    -t parking-worker:latest \
    -f Dockerfile.worker \
    ../../backend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Worker image built successfully${NC}"
else
    echo -e "${RED}✗ Worker image build failed${NC}"
    exit 1
fi

# Tag for different worker types
echo -e "${YELLOW}Tagging worker images...${NC}"
docker tag parking-worker:latest parking-worker-email:latest
docker tag parking-worker:latest parking-worker-notification:latest
docker tag parking-worker:latest parking-worker-payment:latest
docker tag parking-worker:latest parking-worker-report:latest
docker tag parking-worker:latest parking-worker-cache:latest

echo -e "${GREEN}✓ Worker images tagged successfully${NC}"

# Deploy workers
if [ "$1" == "--deploy" ]; then
    echo -e "${YELLOW}Deploying workers...${NC}"
    docker-compose -f docker-compose.worker.yml up -d
    echo -e "${GREEN}✓ Workers deployed successfully${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Build completed successfully${NC}"
echo -e "${GREEN}========================================${NC}"