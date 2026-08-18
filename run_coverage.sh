#!/bin/bash

echo "📊 Generating coverage reports..."

# Set PYTHONPATH
export PYTHONPATH=.

# Create coverage directory
mkdir -p coverage_reports

for service in common parking charging; do
    echo ""
    echo "📊 Generating coverage for $service..."
    
    # Determine the correct directory name
    if [ -d "services/${service}" ]; then
        cd "services/${service}"
    elif [ -d "services/${service}-service" ]; then
        cd "services/${service}-service"
    else
        echo "❌ Service directory not found: $service"
        continue
    fi
    
    # Clean up old test databases
    rm -f test*.db
    
    # Run tests with coverage
    if [ -d "tests" ]; then
        PYTHONPATH=. pytest tests/ -v --cov=src --cov-report=html:../../coverage_reports/${service}_coverage --cov-report=term --cov-fail-under=0
    else
        echo "⚠️ No tests found for $service"
    fi
    
    cd ../..
done

echo ""
echo "✅ Coverage reports generated in coverage_reports/"
echo "📊 Open coverage_reports/common_coverage/index.html to view coverage"