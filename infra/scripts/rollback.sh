#!/bin/bash
# ============================================================================
# Rollback Script - Quick Rollback to Previous Version
# ============================================================================

# parking-management-system/infra/scripts/rollback.sh

#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/deploy.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Quick Rollback Script${NC}"
echo -e "${YELLOW}========================================${NC}"

# Get environment from argument or prompt
ENVIRONMENT=${1:-}
if [ -z "$ENVIRONMENT" ]; then
    echo -e "Select environment:"
    echo "1) dev"
    echo "2) staging"
    echo "3) prod"
    read -p "Enter choice [1-3]: " choice
    case $choice in
        1) ENVIRONMENT="dev" ;;
        2) ENVIRONMENT="staging" ;;
        3) ENVIRONMENT="prod" ;;
        *) echo "Invalid choice"; exit 1 ;;
    esac
fi

echo -e "${GREEN}Rolling back $ENVIRONMENT environment...${NC}"

# Call deploy script with rollback action
"$SCRIPT_DIR/deploy.sh" -e "$ENVIRONMENT" -a rollback

echo -e "${GREEN}Rollback completed!${NC}"