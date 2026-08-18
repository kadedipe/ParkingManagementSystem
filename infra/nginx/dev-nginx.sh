#!/bin/bash
# ============================================================================
# Nginx Development Script - Start/Stop Development Nginx
# ============================================================================

# parking-management-system/infra/nginx/dev-nginx.sh

#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_CONF="${SCRIPT_DIR}/nginx.dev.conf"
NGINX_SSL="${SCRIPT_DIR}/ssl"
NGINX_LOGS="${SCRIPT_DIR}/logs"
NGINX_CACHE="${SCRIPT_DIR}/cache"

# Create necessary directories
mkdir -p "${NGINX_SSL}" "${NGINX_LOGS}" "${NGINX_CACHE}"

# Check if SSL certificates exist
if [ ! -f "${NGINX_SSL}/dev-fullchain.pem" ]; then
    echo -e "${YELLOW}SSL certificates not found. Generating...${NC}"
    "${SCRIPT_DIR}/generate-dev-ssl.sh"
fi

# Function to start nginx
start_nginx() {
    echo -e "${GREEN}Starting Nginx development server...${NC}"
    
    # Check if nginx is already running
    if pgrep -x "nginx" > /dev/null; then
        echo -e "${YELLOW}Nginx is already running. Restarting...${NC}"
        stop_nginx
        sleep 2
    fi
    
    # Start nginx
    nginx -c "${NGINX_CONF}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Nginx started successfully${NC}"
        echo -e "${GREEN}  - HTTP: http://localhost${NC}"
        echo -e "${GREEN}  - HTTPS: https://localhost${NC}"
        echo -e "${GREEN}  - API: http://localhost/api${NC}"
        echo -e "${GREEN}  - WebSocket: ws://localhost/ws${NC}"
        echo -e "${GREEN}  - Logs: ${NGINX_LOGS}${NC}"
    else
        echo -e "${RED}✗ Failed to start Nginx${NC}"
        exit 1
    fi
}

# Function to stop nginx
stop_nginx() {
    echo -e "${YELLOW}Stopping Nginx development server...${NC}"
    
    if pgrep -x "nginx" > /dev/null; then
        nginx -s stop
        echo -e "${GREEN}✓ Nginx stopped successfully${NC}"
    else
        echo -e "${YELLOW}Nginx is not running${NC}"
    fi
}

# Function to reload nginx
reload_nginx() {
    echo -e "${YELLOW}Reloading Nginx configuration...${NC}"
    
    # Test configuration
    nginx -t -c "${NGINX_CONF}"
    
    if [ $? -eq 0 ]; then
        nginx -s reload
        echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
    else
        echo -e "${RED}✗ Nginx configuration test failed${NC}"
        exit 1
    fi
}

# Function to test nginx configuration
test_nginx() {
    echo -e "${YELLOW}Testing Nginx configuration...${NC}"
    nginx -t -c "${NGINX_CONF}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
    else
        echo -e "${RED}✗ Nginx configuration is invalid${NC}"
        exit 1
    fi
}

# Function to show status
status_nginx() {
    echo -e "${YELLOW}Nginx status:${NC}"
    
    if pgrep -x "nginx" > /dev/null; then
        echo -e "${GREEN}✓ Nginx is running${NC}"
        echo -e "${GREEN}  PID: $(pgrep -x nginx)${NC}"
        echo -e "${GREEN}  Logs: ${NGINX_LOGS}${NC}"
        echo -e "${GREEN}  Configuration: ${NGINX_CONF}${NC}"
    else
        echo -e "${RED}✗ Nginx is not running${NC}"
    fi
}

# Function to show logs
logs_nginx() {
    echo -e "${YELLOW}Showing Nginx logs...${NC}"
    tail -f "${NGINX_LOGS}/access.log" &
    tail -f "${NGINX_LOGS}/error.log"
}

# Main script
case "$1" in
    start)
        start_nginx
        ;;
    stop)
        stop_nginx
        ;;
    restart)
        stop_nginx
        sleep 2
        start_nginx
        ;;
    reload)
        reload_nginx
        ;;
    test)
        test_nginx
        ;;
    status)
        status_nginx
        ;;
    logs)
        logs_nginx
        ;;
    *)
        echo -e "${YELLOW}Usage: $0 {start|stop|restart|reload|test|status|logs}${NC}"
        echo -e ""
        echo -e "Commands:"
        echo -e "  start   - Start Nginx development server"
        echo -e "  stop    - Stop Nginx development server"
        echo -e "  restart - Restart Nginx development server"
        echo -e "  reload  - Reload Nginx configuration"
        echo -e "  test    - Test Nginx configuration"
        echo -e "  status  - Show Nginx status"
        echo -e "  logs    - Show Nginx logs"
        exit 1
        ;;
esac

exit 0