#!/bin/bash

echo "🧪 Running tests..."

# Clean up old test databases
rm -f test*.db

# Set PYTHONPATH
export PYTHONPATH=.

# Run tests with coverage
pytest tests/ -v \
    --cov=src \
    --cov-report=html \
    --cov-report=term \
    --junitxml=test-results.xml \
    --maxfail=5

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    echo "📊 Coverage report generated in htmlcov/index.html"
else
    echo "❌ Some tests failed."
fi

# Clean up test databases
rm -f test*.db
