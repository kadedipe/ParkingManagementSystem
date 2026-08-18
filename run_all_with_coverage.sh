#!/bin/bash

echo "🧪 Running all tests with coverage..."
echo "====================================="
echo ""

# Set PYTHONPATH
export PYTHONPATH=.

for service in common parking charging; do
    echo "📦 Testing $service-service..."
    
    # Determine the correct directory
    if [ -d "services/${service}" ]; then
        cd "services/${service}"
    elif [ -d "services/${service}-service" ]; then
        cd "services/${service}-service"
    else
        echo "  ❌ Directory not found"
        continue
    fi
    
    # Clean up old test databases
    rm -f test*.db
    
    # Run tests with coverage
    if [ -d "tests" ]; then
        PYTHONPATH=. pytest tests/ -v --cov=src --cov-report=term --cov-fail-under=0
        if [ $? -eq 0 ]; then
            echo "  ✅ $service tests passed!"
        else
            echo "  ❌ $service tests failed."
        fi
    else
        echo "  ⚠️ No tests found for $service"
    fi
    
    cd ../..
    echo ""
done

echo "✅ All tests completed!"
