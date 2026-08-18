#!/bin/bash
# ============================================================================
# Nginx Health Check - Production Health Check
# ============================================================================

# parking-management-system/infra/nginx/healthcheck.sh

#!/bin/bash

# Check if nginx is running
if ! pgrep nginx > /dev/null; then
    echo "Nginx is not running"
    exit 1
fi

# Check if nginx is responding
if ! wget --quiet --tries=1 --spider http://localhost/health; then
    echo "Nginx health check failed"
    exit 1
fi

# Check if backend is reachable
if [ -n "$BACKEND_HOST" ]; then
    if ! wget --quiet --tries=1 --spider http://${BACKEND_HOST}:${BACKEND_PORT}/health; then
        echo "Backend health check failed"
        exit 1
    fi
fi

echo "Nginx is healthy"
exit 0