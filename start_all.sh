#!/bin/bash

echo "🚀 Starting all services..."

# Start PostgreSQL
echo "Starting PostgreSQL..."
net start postgresql-x64-17 2>/dev/null || echo "PostgreSQL already running"

# Start Redis (if installed)
echo "Starting Redis..."
redis-server 2>/dev/null || echo "Redis not installed, skipping..."

# Start Parking Service
echo "Starting Parking Service..."
cd services/parking-service
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload &
PARKING_PID=$!

# Start Charging Service
echo "Starting Charging Service..."
cd ../charging-service
uvicorn src.main:app --host 0.0.0.0 --port 8003 --reload &
CHARGING_PID=$!

# Start API Gateway
echo "Starting API Gateway..."
cd ../gateway-service
uvicorn main:app --host 0.0.0.0 --port 8080 --reload &
GATEWAY_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "📊 Service URLs:"
echo "  🅿️  Parking Service:  http://localhost:8000/docs"
echo "  🔌 Charging Service:  http://localhost:8003/docs"
echo "  🌐 API Gateway:      http://localhost:8080"
echo "  🏥 Health Check:     http://localhost:8080/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
wait $PARKING_PID $CHARGING_PID $GATEWAY_PID