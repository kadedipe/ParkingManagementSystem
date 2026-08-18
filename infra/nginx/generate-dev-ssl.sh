#!/bin/bash
# ============================================================================
# SSL Certificate Generation - Development Self-Signed Certificates
# ============================================================================

# parking-management-system/infra/nginx/generate-dev-ssl.sh

#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Generating Development SSL Certificates${NC}"
echo -e "${GREEN}========================================${NC}"

# Create SSL directory
mkdir -p ./ssl

# Generate self-signed certificate
echo -e "${YELLOW}Generating self-signed SSL certificates...${NC}"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ./ssl/dev-privkey.pem \
    -out ./ssl/dev-fullchain.pem \
    -subj "/CN=dev.parkingapp.com" \
    -addext "subjectAltName=DNS:dev.parkingapp.com,DNS:localhost,IP:127.0.0.1,IP:192.168.0.0/16"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSL certificates generated successfully${NC}"
    echo -e "${GREEN}  - Certificate: ./ssl/dev-fullchain.pem${NC}"
    echo -e "${GREEN}  - Private Key: ./ssl/dev-privkey.pem${NC}"
else
    echo -e "${RED}✗ SSL certificate generation failed${NC}"
    exit 1
fi

# Set proper permissions
chmod 600 ./ssl/dev-privkey.pem
chmod 644 ./ssl/dev-fullchain.pem

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SSL certificates ready for development${NC}"
echo -e "${GREEN}========================================${NC}"

# Output certificate information
echo -e "${YELLOW}Certificate Information:${NC}"
openssl x509 -in ./ssl/dev-fullchain.pem -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After|DNS:|IP Address:)"

echo -e "${GREEN}========================================${NC}"
echo -e "${YELLOW}To trust this certificate in your browser:${NC}"
echo -e "1. Open Chrome and go to chrome://settings/certificates"
echo -e "2. Import the certificate as a trusted root certificate"
echo -e "3. Restart your browser"
echo -e ""
echo -e "${YELLOW}For development, you can also use the HTTP endpoint:${NC}"
echo -e "http://localhost"
echo -e "${GREEN}========================================${NC}"