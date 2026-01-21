#!/bin/bash
# ===============================================
# SILEA PRODUCTION ISSUE FIX SCRIPT
# ===============================================
# This script helps you fix the email and Monday.com issues
# Run on EC2: bash fix-production-issues.sh
# ===============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     SILEA PRODUCTION ISSUE FIX WIZARD                 ║${NC}"
echo -e "${BLUE}║     Email & Monday.com Configuration                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running on EC2
if [ ! -d "/opt/silea" ]; then
    echo -e "${RED}❌ Error: /opt/silea directory not found${NC}"
    echo -e "${YELLOW}This script should be run on the EC2 instance${NC}"
    exit 1
fi

cd /opt/silea

# Backup existing .env file
if [ -f ".env" ]; then
    echo -e "${YELLOW}📦 Backing up existing .env file...${NC}"
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✓ Backup created${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}STEP 1: EMAIL CONFIGURATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Gmail requires App Password, not regular password${NC}"
echo ""
echo -e "To get Gmail App Password:"
echo -e "1. Go to: ${BLUE}https://myaccount.google.com/apppasswords${NC}"
echo -e "2. Select 'Mail' and 'Other (Custom name)'"
echo -e "3. Enter: 'Silea Production Server'"
echo -e "4. Click 'Generate' and copy the 16-character password"
echo ""
read -p "$(echo -e ${YELLOW}Have you generated an App Password? [y/N]:${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Please generate an App Password first and run this script again${NC}"
    exit 1
fi

echo ""
read -p "Enter your Gmail address: " EMAIL_USERNAME
read -p "Enter your Gmail App Password (16 chars, no spaces): " EMAIL_PASSWORD

# Validate email
if [[ ! $EMAIL_USERNAME =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo -e "${RED}❌ Invalid email format${NC}"
    exit 1
fi

# Remove spaces from App Password
EMAIL_PASSWORD=$(echo "$EMAIL_PASSWORD" | tr -d ' ')

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}STEP 2: MONDAY.COM CONFIGURATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "To get Monday.com API Token:"
echo -e "1. Go to: ${BLUE}https://monday.com${NC}"
echo -e "2. Click your avatar → Admin → API"
echo -e "3. Generate new API v2 Token"
echo -e "4. Name it 'Silea Production'"
echo -e "5. Copy the token (starts with 'eyJ...')"
echo ""
echo -e "To get Board ID:"
echo -e "1. Open your orders board in Monday.com"
echo -e "2. Check the URL: ${BLUE}https://monday.com/boards/1234567890${NC}"
echo -e "3. The number is your Board ID"
echo ""
read -p "$(echo -e ${YELLOW}Do you have Monday.com token & board ID? [y/N]:${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Skipping Monday.com configuration${NC}"
    MONDAY_ENABLED="false"
    MONDAY_API_TOKEN=""
    MONDAY_BOARD_ID=""
else
    MONDAY_ENABLED="true"
    echo ""
    read -p "Enter your Monday.com API token: " MONDAY_API_TOKEN
    read -p "Enter your Monday.com Board ID: " MONDAY_BOARD_ID

    # Validate token format
    if [[ ! $MONDAY_API_TOKEN =~ ^eyJ ]]; then
        echo -e "${RED}❌ Invalid token format (should start with 'eyJ')${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}STEP 3: CREATING .env FILE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Create .env file
cat > .env << EOF
# ===============================================
# SILEA PRODUCTION ENVIRONMENT VARIABLES
# Generated: $(date)
# ===============================================

# Database Configuration
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/silea_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=SileaDB2026!Secure

# Email Configuration (Gmail with App Password)
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=${EMAIL_USERNAME}
EMAIL_PASSWORD=${EMAIL_PASSWORD}
EMAIL_FROM=official@xn--sila-dpa.com
EMAIL_FROM_NAME=Silea

# Monday.com Configuration
MONDAY_ENABLED=${MONDAY_ENABLED}
MONDAY_API_TOKEN=${MONDAY_API_TOKEN}
MONDAY_BOARD_ID=${MONDAY_BOARD_ID}

# Sendit Configuration (if you have these, add them)
SENDIT_ENABLED=true
SENDIT_API_URL=https://api.sendit.ma/v1
SENDIT_PUBLIC_KEY=
SENDIT_PRIVATE_KEY=
SENDIT_SYNC_INTERVAL=5

# Spring Profile
SPRING_PROFILES_ACTIVE=prod

# MySQL Configuration (for docker-compose)
MYSQL_ROOT_PASSWORD=SileaDB2026!Secure
MYSQL_DATABASE=silea_db

# phpMyAdmin
PMA_HOST=mysql
PMA_USER=root
PMA_PASSWORD=SileaDB2026!Secure
EOF

# Secure the file
chmod 600 .env

echo -e "${GREEN}✓ .env file created successfully${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}STEP 4: RESTARTING SERVICES${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Stopping containers...${NC}"
docker-compose -f docker-compose.prod.yml down

echo ""
echo -e "${YELLOW}Starting containers with new configuration...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo -e "${YELLOW}Waiting for services to start (30 seconds)...${NC}"
sleep 30

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}STEP 5: VERIFYING CONFIGURATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Checking container status...${NC}"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${YELLOW}Checking backend logs...${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=50 backend | grep -E "(Email|Monday|Error|Started)"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ CONFIGURATION COMPLETE!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}Next Steps:${NC}"
echo -e "1. Test email by creating an order on the website"
echo -e "2. Check if email arrives at customer's inbox"
echo -e "3. Check Monday.com board for new order item"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  View logs:        ${YELLOW}docker-compose -f docker-compose.prod.yml logs -f backend${NC}"
echo -e "  Restart:          ${YELLOW}sudo systemctl restart silea${NC}"
echo -e "  Check status:     ${YELLOW}docker-compose -f docker-compose.prod.yml ps${NC}"
echo ""

echo -e "${GREEN}🎉 All done! Your email and Monday.com should now be working!${NC}"
echo ""

# Show important info
echo -e "${YELLOW}📝 IMPORTANT NOTES:${NC}"
echo -e "  - Your .env file is backed up as: ${BLUE}.env.backup.*${NC}"
echo -e "  - File permissions set to 600 (secure)"
echo -e "  - Keep this file safe and never commit to git"
echo ""

# Offer to view logs
read -p "$(echo -e ${YELLOW}Would you like to view real-time logs now? [y/N]:${NC} )" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Showing backend logs (Ctrl+C to exit)...${NC}"
    echo ""
    docker-compose -f docker-compose.prod.yml logs -f backend
fi

