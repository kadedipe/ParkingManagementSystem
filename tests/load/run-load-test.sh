#!/bin/bash
# ============================================================================
# Load Test Runner - Run K6 Load Tests
# ============================================================================

# parking-management-system/tests/load/run-load-test.sh

#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Running Load Tests${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${YELLOW}k6 not found. Installing...${NC}"
    
    # Install k6 on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install k6
    # Install k6 on Linux
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6
    else
        echo -e "${RED}Unsupported OS. Please install k6 manually.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ k6 is installed${NC}"

# Create results directory
mkdir -p results

# Set environment variables
export BASE_URL=${BASE_URL:-"http://localhost:3000"}

echo -e "${YELLOW}Base URL: ${BASE_URL}${NC}"

# Run load test
echo -e "${GREEN}Starting load test...${NC}"
echo -e "${GREEN}========================================${NC}"

k6 run k6-script.js \
    --config k6-config.json \
    --out json=results/load-test-results.json \
    --out dashboard

# Generate HTML report
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}Generating HTML report...${NC}"
    python3 generate-report.py results/load-test-results.json results/load-test-report.html
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Load Test Complete${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Results saved to: results/load-test-results.json${NC}"
echo -e "${GREEN}Report saved to: results/load-test-report.html${NC}"