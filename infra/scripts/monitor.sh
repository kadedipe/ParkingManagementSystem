#!/bin/bash
# ============================================================================
# Monitoring Script - System Monitoring and Alerting
# ============================================================================

# parking-management-system/infra/scripts/monitor.sh

#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  System Monitoring${NC}"
echo -e "${YELLOW}========================================${NC}"

# Configuration
THRESHOLD_CPU=80
THRESHOLD_MEMORY=80
THRESHOLD_DISK=80

# Function to check CPU usage
check_cpu() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    echo -e "CPU Usage: $cpu_usage%"
    
    if (( $(echo "$cpu_usage > $THRESHOLD_CPU" | bc -l) )); then
        echo -e "${RED}⚠️ CPU usage is above threshold!${NC}"
        return 1
    fi
    return 0
}

# Function to check memory usage
check_memory() {
    local memory_usage=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
    echo -e "Memory Usage: ${memory_usage%.*}%"
    
    if (( $(echo "$memory_usage > $THRESHOLD_MEMORY" | bc -l) )); then
        echo -e "${RED}⚠️ Memory usage is above threshold!${NC}"
        return 1
    fi
    return 0
}

# Function to check disk usage
check_disk() {
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)
    echo -e "Disk Usage: $disk_usage%"
    
    if [ $disk_usage -gt $THRESHOLD_DISK ]; then
        echo -e "${RED}⚠️ Disk usage is above threshold!${NC}"
        return 1
    fi
    return 0
}

# Function to check service status
check_service_status() {
    local service=$1
    local status=$(systemctl is-active $service 2>/dev/null || echo "unknown")
    echo -e "Service $service: $status"
    
    if [ "$status" != "active" ]; then
        echo -e "${RED}⚠️ Service $service is not running!${NC}"
        return 1
    fi
    return 0
}

# Main monitoring
echo -e "${GREEN}Checking system resources...${NC}"
check_cpu
check_memory
check_disk

echo -e "\n${GREEN}Checking services...${NC}"
check_service_status "docker"
check_service_status "kubelet"

if command -v kubectl &> /dev/null; then
    echo -e "\n${GREEN}Checking Kubernetes resources...${NC}"
    
    # Check pods
    echo -e "Pod Status:"
    kubectl get pods -n parking-system
    
    # Check nodes
    echo -e "\nNode Status:"
    kubectl get nodes
    
    # Check HPA
    if kubectl get hpa -n parking-system &> /dev/null; then
        echo -e "\nHPA Status:"
        kubectl get hpa -n parking-system
    fi
fi

echo -e "\n${GREEN}Monitoring completed!${NC}"