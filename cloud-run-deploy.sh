#!/bin/bash

echo "🚀 Deploying to Google Cloud Run..."

# Set project and region
PROJECT_ID="your-project-id"
REGION="us-central1"

# Build and deploy each service
for service in common parking charging gateway; do
    echo "Deploying ${service}-service..."
    
    gcloud builds submit --tag gcr.io/${PROJECT_ID}/${service}-service ./services/${service}-service
    
    gcloud run deploy ${service}-service \
        --image gcr.io/${PROJECT_ID}/${service}-service \
        --platform managed \
        --region ${REGION} \
        --allow-unauthenticated \
        --memory 512Mi \
        --cpu 1 \
        --max-instances 10
done

echo "✅ All services deployed successfully!"