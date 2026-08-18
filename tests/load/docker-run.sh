#!/bin/bash
# ============================================================================
# Docker Run Script - Run K6 in Docker
# ============================================================================

# parking-management-system/tests/load/docker-run.sh

#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Running K6 Load Tests in Docker${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Set environment variables
export BASE_URL=${BASE_URL:-"http://host.docker.internal:3000"}
export TEST_PROFILE=${1:-"load"}

echo -e "${YELLOW}Base URL: ${BASE_URL}${NC}"
echo -e "${YELLOW}Test Profile: ${TEST_PROFILE}${NC}"

# Create results directory
mkdir -p results

# Run K6 in Docker
docker run --rm \
    -v $(pwd):/scripts \
    -v $(pwd)/results:/results \
    -e BASE_URL=${BASE_URL} \
    -e TEST_PROFILE=${TEST_PROFILE} \
    grafana/k6:latest \
    run /scripts/k6-script.js \
    --config /scripts/k6-config.js \
    --out json=/results/results-${TEST_PROFILE}-$(date +%Y%m%d-%H%M%S).json

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Load Test Complete${NC}"
echo -e "${GREEN}========================================${NC}"