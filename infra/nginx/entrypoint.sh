#!/bin/bash
# ============================================================================
# Nginx Entrypoint - Production Startup Script
# ============================================================================

# parking-management-system/infra/nginx/entrypoint.sh

#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Nginx Production Server${NC}"
echo -e "${GREEN}========================================${NC}"

# Check for SSL certificates
if [ ! -f /etc/nginx/ssl/fullchain.pem ] || [ ! -f /etc/nginx/ssl/privkey.pem ]; then
    echo -e "${YELLOW}SSL certificates not found. Using self-signed certificates...${NC}"
    
    # Generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/privkey.pem \
        -out /etc/nginx/ssl/fullchain.pem \
        -subj "/CN=parkingapp.com" \
        -addext "subjectAltName=DNS:parkingapp.com,DNS:*.parkingapp.com"
    
    echo -e "${GREEN}Self-signed SSL certificates generated${NC}"
fi

# Set secure permissions for SSL certificates
chmod 600 /etc/nginx/ssl/privkey.pem
chmod 644 /etc/nginx/ssl/fullchain.pem

# Test nginx configuration
echo -e "${YELLOW}Testing nginx configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration is invalid${NC}"
    exit 1
fi

# Start nginx
echo -e "${GREEN}Starting Nginx...${NC}"
exec "$@"