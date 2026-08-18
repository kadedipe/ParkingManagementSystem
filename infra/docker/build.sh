#!/bin/bash
# ============================================================================
# Docker Build Script - Build All Docker Images
# ============================================================================

# parking-management-system/infra/docker/build.sh

#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Building Docker Images for Parking App${NC}"
echo -e "${GREEN}========================================${NC}"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Build backend
echo -e "${YELLOW}Building backend...${NC}"
docker build \
    -t parking-backend:latest \
    -f Dockerfile.backend \
    ../../backend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend built successfully${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
fi

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
docker build \
    -t parking-frontend:latest \
    -f Dockerfile.frontend \
    ../../frontend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi

# Build mobile (optional)
if [ "$1" == "--mobile" ]; then
    echo -e "${YELLOW}Building mobile...${NC}"
    docker build \
        -t parking-mobile:latest \
        -f Dockerfile.mobile \
        ../../mobile
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Mobile built successfully${NC}"
    else
        echo -e "${RED}✗ Mobile build failed${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  All Docker images built successfully${NC}"
echo -e "${GREEN}========================================${NC}"

# List built images
echo -e "${YELLOW}Built images:${NC}"
docker images | grep parking-

# Run the stack
if [ "$2" == "--up" ]; then
    echo -e "${YELLOW}Starting Docker Compose stack...${NC}"
    docker-compose up -d
    echo -e "${GREEN}Stack started successfully${NC}"
fi