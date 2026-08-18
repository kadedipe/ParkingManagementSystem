#!/bin/bash

echo "🚀 Deploying to AWS ECS..."

# Set AWS region
AWS_REGION="us-east-1"

# Build and push to ECR
for service in common parking charging gateway; do
    echo "Deploying ${service}-service..."
    
    # Create ECR repository
    aws ecr create-repository --repository-name ${service}-service --region ${AWS_REGION}
    
    # Get ECR login
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.${AWS_REGION}.amazonaws.com
    
    # Build and tag
    docker build -t ${service}-service ./services/${service}-service
    docker tag ${service}-service:latest <your-account-id>.dkr.ecr.${AWS_REGION}.amazonaws.com/${service}-service:latest
    
    # Push to ECR
    docker push <your-account-id>.dkr.ecr.${AWS_REGION}.amazonaws.com/${service}-service:latest
done

echo "✅ All services pushed to ECR!"