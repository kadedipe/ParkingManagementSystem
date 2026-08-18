#!/bin/sh
# ============================================================================
# Nginx Entrypoint - Startup Script
# ============================================================================

# parking-management-system/infra/docker/nginx-entrypoint.sh

#!/bin/sh
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Starting Nginx Server${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if environment variables are set
if [ -z "$NGINX_HOST" ]; then
    echo -e "${YELLOW}Warning: NGINX_HOST not set, using default${NC}"
    export NGINX_HOST=localhost
fi

if [ -z "$NGINX_PORT" ]; then
    echo -e "${YELLOW}Warning: NGINX_PORT not set, using default 80${NC}"
    export NGINX_PORT=80
fi

if [ -z "$BACKEND_HOST" ]; then
    echo -e "${YELLOW}Warning: BACKEND_HOST not set, using default backend${NC}"
    export BACKEND_HOST=backend
fi

if [ -z "$BACKEND_PORT" ]; then
    echo -e "${YELLOW}Warning: BACKEND_PORT not set, using default 3000${NC}"
    export BACKEND_PORT=3000
fi

if [ -z "$FRONTEND_HOST" ]; then
    echo -e "${YELLOW}Warning: FRONTEND_HOST not set, using default frontend${NC}"
    export FRONTEND_HOST=frontend
fi

if [ -z "$FRONTEND_PORT" ]; then
    echo -e "${YELLOW}Warning: FRONTEND_PORT not set, using default 80${NC}"
    export FRONTEND_PORT=80
fi

# Create SSL directory if it doesn't exist
mkdir -p /etc/nginx/ssl

# Generate SSL certificates if not exists and SSL_ENABLED is true
if [ "$SSL_ENABLED" = "true" ] && [ ! -f /etc/nginx/ssl/fullchain.pem ]; then
    echo -e "${YELLOW}Generating SSL certificates...${NC}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/privkey.pem \
        -out /etc/nginx/ssl/fullchain.pem \
        -subj "/CN=${NGINX_HOST}" \
        -addext "subjectAltName=DNS:${NGINX_HOST}"
    echo -e "${GREEN}SSL certificates generated${NC}"
fi

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
echo -e "${GREEN}Starting nginx...${NC}"
exec "$@"