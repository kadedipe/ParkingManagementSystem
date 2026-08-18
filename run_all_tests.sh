#!/bin/bash

echo "🧪 Running tests for all services..."

# Set PYTHONPATH
export PYTHONPATH=.

for service in common parking charging; do
    echo ""
    echo "📦 Testing $service..."
    
    # Check if the service directory exists with -service suffix
    if [ -d "services/${service}-service" ]; then
        cd "services/${service}-service"
    elif [ -d "services/$service" ]; then
        cd "services/$service"
    else
        echo "❌ Service directory not found: $service"
        continue
    fi
    
    # Clean up old test databases
    rm -f test*.db 2>/dev/null
    
    # Run tests if tests directory exists
    if [ -d "tests" ]; then
        PYTHONPATH=. pytest tests/ -v --tb=short --maxfail=5
        if [ $? -eq 0 ]; then
            echo "✅ $service tests passed!"
        else
            echo "❌ $service tests failed."
        fi
    else
        echo "⚠️ No tests found for $service"
    fi
    
    cd ../..
done

echo ""
echo "✅ All tests completed!"