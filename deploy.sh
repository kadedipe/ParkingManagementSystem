#!/bin/bash

echo "🚀 Deploying Parking Management System to Cloud..."

# Build Docker images
echo "Building Docker images..."
docker-compose build

# Push images to registry (example: Docker Hub)
echo "Tagging and pushing images..."
docker tag parking_postgres:latest yourusername/postgres:latest
docker tag redis:latest yourusername/redis:latest
docker tag common_service:latest yourusername/common-service:latest
docker tag parking_service:latest yourusername/parking-service:latest
docker tag charging_service:latest yourusername/charging-service:latest
docker tag api_gateway:latest yourusername/api-gateway:latest

# Push to registry
docker push yourusername/postgres:latest
docker push yourusername/redis:latest
docker push yourusername/common-service:latest
docker push yourusername/parking-service:latest
docker push yourusername/charging-service:latest
docker push yourusername/api-gateway:latest

echo "✅ Images pushed successfully!"
echo "📦 Deployment complete!"