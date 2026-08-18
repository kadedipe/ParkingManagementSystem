#!/bin/bash

echo "Running Parking Service Tests..."
cd services/parking-service
pytest tests/ -v --cov=src --cov-report=html

echo "Running Charging Service Tests..."
cd ../charging-service
pytest tests/ -v --cov=src --cov-report=html

echo "Tests completed! Check coverage reports in htmlcov/"
