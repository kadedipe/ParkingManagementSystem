#!/bin/bash
# ============================================================================
# Database Backup Script - Automated Database Backups
# ============================================================================

# parking-management-system/infra/scripts/backup.sh

#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Database Backup Script${NC}"
echo -e "${YELLOW}========================================${NC}"

# Configuration
BACKUP_DIR="/var/backups/postgres"
RETENTION_DAYS=7
S3_BUCKET="parking-backups"
ENVIRONMENT=${1:-"prod"}

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/parking_${ENVIRONMENT}_${TIMESTAMP}.sql.gz"

echo -e "Environment: $ENVIRONMENT"
echo -e "Backup file: $BACKUP_FILE"

# Get database credentials from Kubernetes
if command -v kubectl &> /dev/null; then
    DB_HOST=$(kubectl get secret db-secret -n parking-system -o jsonpath='{.data.host}' | base64 -d)
    DB_PORT=$(kubectl get secret db-secret -n parking-system -o jsonpath='{.data.port}' | base64 -d)
    DB_NAME=$(kubectl get secret db-secret -n parking-system -o jsonpath='{.data.name}' | base64 -d)
    DB_USER=$(kubectl get secret db-secret -n parking-system -o jsonpath='{.data.user}' | base64 -d)
    DB_PASSWORD=$(kubectl get secret db-secret -n parking-system -o jsonpath='{.data.password}' | base64 -d)
else
    echo -e "${RED}Kubectl not available. Please set database credentials manually.${NC}"
    exit 1
fi

# Perform backup
echo -e "Starting database backup..."

PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup completed successfully${NC}"
    
    # Upload to S3 (if AWS CLI is available)
    if command -v aws &> /dev/null; then
        echo -e "Uploading backup to S3..."
        aws s3 cp $BACKUP_FILE s3://$S3_BUCKET/$ENVIRONMENT/
        echo -e "${GREEN}✓ Upload to S3 completed${NC}"
    fi
    
    # Clean up old backups
    echo -e "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
    find $BACKUP_DIR -name "parking_${ENVIRONMENT}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    echo -e "${GREEN}✓ Cleanup completed${NC}"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

echo -e "${GREEN}Backup completed successfully!${NC}"