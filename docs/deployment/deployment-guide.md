Deployment Guide - Parking Management System
Table of Contents
Overview

Prerequisites

Environment Setup

Database Setup

Backend Deployment

Frontend Deployment

Mobile App Deployment

Monitoring Setup

CI/CD Pipeline

Rollback Procedures

Troubleshooting

1. Overview
1.1 Deployment Architecture
text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Production Environment                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Load Balancer                                │   │
│  │                    (AWS ALB / Nginx)                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         API Gateway                                  │   │
│  │                    (Kong / Nginx)                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      Kubernetes Cluster                              │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    Service Mesh (Istio)                        │ │   │
│  │  │  ┌───────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │               Microservices Pods                         │ │ │   │
│  │  │  │  • Parking Service   • Booking Service                   │ │ │   │
│  │  │  │  • Payment Service   • User Service                      │ │ │   │
│  │  │  │  • Vehicle Service   • Charging Service                  │ │ │   │
│  │  │  │  • Notification      • Report Service                    │ │ │   │
│  │  │  │  • Auth Service      • Admin Service                     │ │ │   │
│  │  │  └───────────────────────────────────────────────────────────┘ │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Data Layer                                   │   │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │   │
│  │  │   PostgreSQL    │  │    Redis     │  │      S3 Storage         │ │   │
│  │  │   (Primary)     │  │   (Cache)    │  │    (Files/Backups)      │ │   │
│  │  └─────────────────┘  └──────────────┘  └─────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
1.2 System Requirements
Component	Minimum	Recommended
CPU	4 cores	8+ cores
RAM	16 GB	32+ GB
Storage	100 GB	500+ GB SSD
Network	1 Gbps	10 Gbps
Node.js	18.x	20.x
Python	3.9+	3.11+
PostgreSQL	14.x	15.x
Redis	6.x	7.x
Kubernetes	1.24+	1.27+
2. Prerequisites
2.1 Tools Installation
bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python and pip
sudo apt-get install -y python3 python3-pip python3-venv

# Install Yarn
npm install -g yarn
2.2 Environment Variables
bash
# .env.production

# Application
NODE_ENV=production
APP_ENV=production
APP_VERSION=2.0.0
APP_NAME=Parking Management System

# API Configuration
API_URL=https://api.parkingapp.com
API_VERSION=v1
PORT=3000

# Database Configuration
DB_HOST=postgres-cluster
DB_PORT=5432
DB_NAME=parking_db
DB_USER=parking_user
DB_PASSWORD=secure_password_here
DB_SSL=true
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40

# Redis Configuration
REDIS_HOST=redis-cluster
REDIS_PORT=6379
REDIS_PASSWORD=secure_redis_password
REDIS_DB=0
REDIS_CACHE_TTL=3600

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=2592000

# Service URLs
PARKING_SERVICE_URL=http://parking-service:3002
BOOKING_SERVICE_URL=http://booking-service:3003
PAYMENT_SERVICE_URL=http://payment-service:3004
USER_SERVICE_URL=http://user-service:3005
VEHICLE_SERVICE_URL=http://vehicle-service:3006
CHARGING_SERVICE_URL=http://charging-service:3007
NOTIFICATION_SERVICE_URL=http://notification-service:3008
REPORT_SERVICE_URL=http://report-service:3009

# External Services
STRIPE_SECRET_KEY=your_live_key
STRIPE_WEBHOOK_SECRET=your_key
GOOGLE_MAPS_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_key
TWILIO_AUTH_TOKEN=your_key
SENDGRID_API_KEY=your_key

# Monitoring
SENTRY_DSN=your_key
DATADOG_API_KEY=your_key
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true

# Security
CORS_ORIGINS=["https://parkingapp.com","https://www.parkingapp.com"]
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60
3. Environment Setup
3.1 Cloud Infrastructure (AWS)
bash
# Terraform Configuration
cd infra/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="environments/prod/terraform.tfvars"

# Apply infrastructure
terraform apply -var-file="environments/prod/terraform.tfvars"

# Variables file (environments/prod/terraform.tfvars)
region = "us-east-1"
environment = "prod"
vpc_cidr = "10.0.0.0/16"
private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnets = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
database_subnets = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
instance_types = ["t3.xlarge", "t3.2xlarge"]
min_nodes = 3
max_nodes = 10
desired_nodes = 5
db_instance_class = "db.t3.large"
db_storage = 100
redis_node_type = "cache.t3.medium"
3.2 Kubernetes Cluster Setup
bash
# Create namespace
kubectl create namespace parking-system

# Apply secrets
kubectl apply -f infra/kubernetes/secrets.yaml

# Apply configmaps
kubectl apply -f infra/kubernetes/configmap.yaml

# Apply persistent volumes
kubectl apply -f infra/kubernetes/pvc.yaml

# Apply services
kubectl apply -f infra/kubernetes/service.yaml

# Apply deployments
kubectl apply -f infra/kubernetes/deployment.yaml

# Apply ingress
kubectl apply -f infra/kubernetes/ingress.yaml

# Apply HPA
kubectl apply -f infra/kubernetes/hpa.yaml

# Apply network policies
kubectl apply -f infra/kubernetes/network-policy.yaml
3.3 SSL/TLS Setup
bash
# Install cert-manager
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Create ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@parkingapp.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
4. Database Setup
4.1 PostgreSQL Setup
bash
# Create database
kubectl exec -it postgres-pod -n parking-system -- psql -U parking_user

# Run SQL scripts
CREATE DATABASE parking_db;
CREATE USER parking_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE parking_db TO parking_user;

# Run migrations
npm run migration:run

# Create read replica
aws rds create-db-instance-read-replica \
    --db-instance-identifier parking-db-replica \
    --source-db-instance-identifier parking-db \
    --db-instance-class db.t3.large \
    --availability-zone us-east-1b
4.2 Redis Setup
bash
# Create Redis cluster
kubectl apply -f infra/kubernetes/redis.yaml

# Configure Redis
cat <<EOF | kubectl apply -f -
apiVersion: redis.redis.opstreelabs.in/v1beta1
kind: RedisCluster
metadata:
  name: redis-cluster
  namespace: parking-system
spec:
  clusterSize: 3
  kubernetesConfig:
    image: redis:7.0.11
    imagePullPolicy: IfNotPresent
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
      limits:
        cpu: 1000m
        memory: 2Gi
  persistence:
    enabled: true
    storageClassName: standard
    accessModes:
      - ReadWriteOnce
    size: 10Gi
EOF
5. Backend Deployment
5.1 Build Services
bash
# Clone repository
git clone https://github.com/parkingapp/parking-system.git
cd parking-system

# Build Docker images
docker build -t parking-backend:latest -f infra/docker/Dockerfile.backend .

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag parking-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/parking-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/parking-backend:latest
5.2 Deploy Services
bash
# Deploy all services
kubectl apply -f infra/kubernetes/deployment.yaml

# Check deployment status
kubectl rollout status deployment/parking-backend -n parking-system
kubectl rollout status deployment/parking-booking -n parking-system
kubectl rollout status deployment/parking-payment -n parking-system
kubectl rollout status deployment/parking-user -n parking-system
kubectl rollout status deployment/parking-vehicle -n parking-system
kubectl rollout status deployment/parking-charging -n parking-system
kubectl rollout status deployment/parking-notification -n parking-system
kubectl rollout status deployment/parking-report -n parking-system
kubectl rollout status deployment/parking-auth -n parking-system

# Check pods
kubectl get pods -n parking-system

# Check services
kubectl get services -n parking-system
5.3 Service Health Check
bash
# Health check script
#!/bin/bash
services=(
  "parking-service"
  "booking-service"
  "payment-service"
  "user-service"
  "vehicle-service"
  "charging-service"
  "notification-service"
  "report-service"
  "auth-service"
)

for service in "${services[@]}"; do
  echo "Checking $service..."
  kubectl exec -it $service-pod -n parking-system -- curl -f http://localhost:3000/health
  if [ $? -eq 0 ]; then
    echo "✓ $service is healthy"
  else
    echo "✗ $service is unhealthy"
  fi
done
6. Frontend Deployment
6.1 Web Application
bash
# Build frontend
cd frontend
npm install
npm run build

# Build Docker image
docker build -t parking-frontend:latest -f ../infra/docker/Dockerfile.frontend .

# Deploy to Kubernetes
kubectl apply -f ../infra/kubernetes/frontend-deployment.yaml

# Check deployment
kubectl rollout status deployment/parking-frontend -n parking-system

# Update nginx configuration
kubectl apply -f ../infra/kubernetes/ingress.yaml
6.2 Admin Dashboard
bash
# Build admin dashboard
cd admin-dashboard
npm install
npm run build

# Build Docker image
docker build -t parking-admin:latest -f ../infra/docker/Dockerfile.admin .

# Deploy to Kubernetes
kubectl apply -f ../infra/kubernetes/admin-deployment.yaml

# Check deployment
kubectl rollout status deployment/parking-admin -n parking-system
7. Mobile App Deployment
7.1 iOS Deployment
bash
# Install dependencies
cd mobile
npm install
cd ios && pod install

# Build for production
npx react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios

# Open Xcode
open ios/ParkingApp.xcworkspace

# Archive and upload
# In Xcode: Product -> Archive
# Upload to App Store Connect

# Using Fastlane
fastlane ios deploy
7.2 Android Deployment
bash
# Build for production
cd android
./gradlew clean
./gradlew assembleRelease

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore parkingapp-release-key.keystore app/build/outputs/apk/release/app-release-unsigned.apk alias_name

# Optimize with zipalign
zipalign -v -p 4 app/build/outputs/apk/release/app-release-unsigned.apk app/build/outputs/apk/release/app-release.apk

# Upload to Play Store
# Using Fastlane
fastlane android deploy
8. Monitoring Setup
8.1 Prometheus & Grafana
bash
# Install Prometheus
kubectl apply -f infra/monitoring/prometheus.yaml

# Install Grafana
kubectl apply -f infra/monitoring/grafana.yaml

# Install metrics server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Port forward Grafana
kubectl port-forward service/grafana-service -n monitoring 3000:3000

# Import dashboards
# Login to Grafana (admin/admin)
# Import dashboards from infra/monitoring/dashboards/
8.2 Logging Setup
bash
# Install Elasticsearch
kubectl apply -f infra/logging/elasticsearch.yaml

# Install Logstash
kubectl apply -f infra/logging/logstash.yaml

# Install Kibana
kubectl apply -f infra/logging/kibana.yaml

# Install Filebeat
kubectl apply -f infra/logging/filebeat.yaml

# Port forward Kibana
kubectl port-forward service/kibana-service -n logging 5601:5601
8.3 Alerts Configuration
yaml
# Prometheus alerts
groups:
  - name: service_alerts
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        annotations:
          summary: "Service {{ $labels.service }} is down"
          description: "Service {{ $labels.service }} has been down for more than 1 minute"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate for {{ $labels.service }}"
          description: "Error rate is {{ $value }} for the last 5 minutes"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        annotations:
          summary: "High response time for {{ $labels.service }}"
          description: "95th percentile response time is {{ $value }} seconds"
9. CI/CD Pipeline
9.1 GitHub Actions Configuration
yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: parking-app
  CLUSTER_NAME: parking-cluster

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and tag Docker image
        run: |
          docker build -t ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }} .
          docker tag ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }} ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:latest

      - name: Push image to Amazon ECR
        run: |
          docker push ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }}
          docker push ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:latest

      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name ${{ env.CLUSTER_NAME }} --region ${{ env.AWS_REGION }}

      - name: Deploy to EKS
        run: |
          kubectl set image deployment/parking-backend parking-backend=${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }} -n parking-system
          kubectl rollout status deployment/parking-backend -n parking-system

      - name: Run smoke tests
        run: |
          ./scripts/smoke-tests.sh

      - name: Notify team
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "Deployment to production completed successfully!"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
9.2 Jenkins Pipeline
groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        AWS_REGION = 'us-east-1'
        ECR_REPOSITORY = 'parking-app'
        CLUSTER_NAME = 'parking-cluster'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/parkingapp/parking-system.git', branch: 'main'
            }
        }
        
        stage('Build') {
            steps {
                sh 'docker build -t parking-backend:latest -f infra/docker/Dockerfile.backend .'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm run test'
                sh 'npm run test:e2e'
            }
        }
        
        stage('Push Image') {
            steps {
                withAWS(credentials: 'aws-credentials', region: env.AWS_REGION) {
                    sh 'aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com'
                    sh 'docker tag parking-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/parking-backend:latest'
                    sh 'docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/parking-backend:latest'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'aws eks update-kubeconfig --name parking-cluster --region us-east-1'
                sh 'kubectl set image deployment/parking-backend parking-backend=<account-id>.dkr.ecr.us-east-1.amazonaws.com/parking-backend:latest -n parking-system'
                sh 'kubectl rollout status deployment/parking-backend -n parking-system'
            }
        }
        
        stage('Verify') {
            steps {
                sh './scripts/health-check.sh'
            }
        }
    }
    
    post {
        success {
            slackSend(
                color: 'good',
                message: "Deployment to production completed successfully!"
            )
        }
        failure {
            slackSend(
                color: 'danger',
                message: "Deployment to production failed!"
            )
        }
    }
}
10. Rollback Procedures
10.1 Service Rollback
bash
# Rollback to previous version
kubectl rollout undo deployment/parking-backend -n parking-system

# Rollback to specific revision
kubectl rollout undo deployment/parking-backend -n parking-system --to-revision=2

# Check rollback status
kubectl rollout status deployment/parking-backend -n parking-system

# View rollout history
kubectl rollout history deployment/parking-backend -n parking-system
10.2 Database Rollback
bash
# Revert migrations
npm run migration:revert

# Restore from backup
aws rds restore-db-instance-from-db-snapshot \
    --db-instance-identifier parking-db-restored \
    --db-snapshot-identifier parking-db-snapshot-2024-01-15 \
    --db-instance-class db.t3.large
10.3 Emergency Rollback Script
bash
#!/bin/bash
# emergency-rollback.sh

echo "Starting emergency rollback..."

# Stop traffic
kubectl patch service parking-backend -n parking-system -p '{"spec":{"selector":{"app":"parking-backend-old"}}}'

# Scale down current deployment
kubectl scale deployment parking-backend -n parking-system --replicas=0

# Scale up previous version
kubectl scale deployment parking-backend-old -n parking-system --replicas=3

# Verify health
kubectl get pods -n parking-system | grep parking-backend-old

# Restore traffic
kubectl patch service parking-backend -n parking-system -p '{"spec":{"selector":{"app":"parking-backend"}}}'

echo "Emergency rollback completed!"
11. Troubleshooting
11.1 Common Issues
11.1.1 Pods Not Starting
bash
# Check pod status
kubectl describe pod <pod-name> -n parking-system

# Check logs
kubectl logs <pod-name> -n parking-system

# Check events
kubectl get events -n parking-system --sort-by='.lastTimestamp'

# Check resource limits
kubectl describe node
11.1.2 Database Connection Issues
bash
# Test database connection
kubectl exec -it <pod-name> -n parking-system -- nc -zv postgres-cluster 5432

# Check database logs
kubectl logs postgres-pod -n parking-system

# Verify credentials
kubectl get secret db-secret -n parking-system -o yaml
11.1.3 Performance Issues
bash
# Check pod resource usage
kubectl top pods -n parking-system

# Check node resource usage
kubectl top nodes

# Check HPA status
kubectl get hpa -n parking-system

# View metrics
kubectl port-forward service/prometheus-service -n monitoring 9090:9090
11.2 Debugging Commands
bash
# Debug script
#!/bin/bash
echo "=== Pod Status ==="
kubectl get pods -n parking-system

echo -e "\n=== Service Status ==="
kubectl get services -n parking-system

echo -e "\n=== Deployment Status ==="
kubectl get deployments -n parking-system

echo -e "\n=== HPA Status ==="
kubectl get hpa -n parking-system

echo -e "\n=== PVC Status ==="
kubectl get pvc -n parking-system

echo -e "\n=== Node Status ==="
kubectl get nodes

echo -e "\n=== Recent Events ==="
kubectl get events -n parking-system --sort-by='.lastTimestamp' | tail -10
11.3 Performance Tuning
bash
# Tune Kubernetes resources
apiVersion: apps/v1
kind: Deployment
metadata:
  name: parking-backend
spec:
  replicas: 5
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: backend
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
11.4 Support Contacts
Team	Contact	Responsibility
DevOps	devops@parkingapp.com	Infrastructure, Deployment
Backend	backend@parkingapp.com	API, Services
Database	dba@parkingapp.com	Database, Performance
Security	security@parkingapp.com	Security, Compliance
Monitoring	monitoring@parkingapp.com	Monitoring, Alerts
This document is maintained by the DevOps team and updated regularly.