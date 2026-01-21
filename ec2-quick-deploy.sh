#!/bin/bash
# ===============================================
# SILEA EC2 QUICK DEPLOYMENT SCRIPT
# ===============================================
# Run this ONE command after pushing: bash ec2-quick-deploy.sh
# ===============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     SILEA QUICK DEPLOYMENT                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running on EC2
if [ ! -d "/opt/silea" ]; then
    echo -e "${RED}❌ Error: /opt/silea directory not found${NC}"
    echo -e "${YELLOW}This script should be run on the EC2 instance${NC}"
    exit 1
fi

cd /opt/silea

echo -e "${GREEN}[1/6]${NC} Pulling latest code from GitHub..."
git pull origin main

echo ""
echo -e "${GREEN}[2/6]${NC} Checking .env file..."
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Creating template .env file...${NC}"
    
    cat > .env << 'EOF'
# ===============================================
# SILEA PRODUCTION ENVIRONMENT VARIABLES
# PLEASE CONFIGURE THESE VALUES
# ===============================================

# Database Configuration
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/silea_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=SileaDB2026!Secure

# Email Configuration (REQUIRED - Use Gmail App Password)
# Generate at: https://myaccount.google.com/apppasswords
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM=official@xn--sila-dpa.com
EMAIL_FROM_NAME=Silea

# Monday.com Configuration (Optional)
# Get token at: https://monday.com → Admin → API
MONDAY_ENABLED=false
MONDAY_API_TOKEN=your-monday-token-here
MONDAY_BOARD_ID=your-board-id-here

# Sendit Configuration (Optional)
SENDIT_ENABLED=true
SENDIT_API_URL=https://api.sendit.ma/v1
SENDIT_PUBLIC_KEY=
SENDIT_PRIVATE_KEY=
SENDIT_SYNC_INTERVAL=5

# Spring Profile
SPRING_PROFILES_ACTIVE=prod

# MySQL Configuration
MYSQL_ROOT_PASSWORD=SileaDB2026!Secure
MYSQL_DATABASE=silea_db

# phpMyAdmin
PMA_HOST=mysql
PMA_USER=root
PMA_PASSWORD=SileaDB2026!Secure
EOF
    
    chmod 600 .env
    
    echo -e "${YELLOW}⚠️  IMPORTANT: Please edit .env file with your credentials${NC}"
    echo -e "${YELLOW}Run: nano .env${NC}"
    echo -e "${YELLOW}Then run this script again${NC}"
    exit 1
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

echo ""
echo -e "${GREEN}[3/6]${NC} Logging into AWS ECR..."
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 442147575154.dkr.ecr.eu-west-3.amazonaws.com

echo ""
echo -e "${GREEN}[4/6]${NC} Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

echo ""
echo -e "${GREEN}[5/6]${NC} Restarting containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo -e "${GREEN}[6/6]${NC} Cleaning up old images..."
docker image prune -f

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Waiting for services to start (20 seconds)...${NC}"
sleep 20

echo ""
echo -e "${BLUE}Container Status:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${BLUE}Recent Backend Logs:${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=20 backend

echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo ""
echo -e "${BLUE}Your application is now running:${NC}"
echo -e "  Frontend: ${GREEN}http://35.180.229.121${NC}"
echo -e "  Backend:  ${GREEN}http://35.180.229.121/api${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:   ${BLUE}docker-compose -f docker-compose.prod.yml logs -f backend${NC}"
echo -e "  Restart:     ${BLUE}sudo systemctl restart silea${NC}"
echo -e "  Check status:${BLUE}docker-compose -f docker-compose.prod.yml ps${NC}"
echo ""

