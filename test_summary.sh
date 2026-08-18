#!/bin/bash

echo "📊 Test Summary Report"
echo "======================"
echo ""

for service in common parking charging; do
    echo "📦 $service-service:"
    
    # Determine the correct directory
    if [ -d "services/${service}" ]; then
        cd "services/${service}"
    elif [ -d "services/${service}-service" ]; then
        cd "services/${service}-service"
    else
        echo "  ❌ Directory not found"
        continue
    fi
    
    if [ -d "tests" ]; then
        # Count tests
        test_count=$(pytest tests/ --collect-only -q 2>/dev/null | grep "collected" | awk '{print $1}')
        if [ -n "$test_count" ]; then
            echo "  ✅ Tests: $test_count tests"
        else
            echo "  ⚠️ No tests collected"
        fi
    else
        echo "  ❌ No tests directory"
    fi
    
    cd ../..
done

echo ""
echo "======================"
echo "✅ Summary complete!"
