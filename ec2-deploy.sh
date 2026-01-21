#!/bin/bash
# ===============================================
# SILEA EC2 PRODUCTION DEPLOYMENT SCRIPT
# ===============================================
# This script sets up Silea on EC2 with proper security
# Run as: bash ec2-deploy.sh
# ===============================================

set -e

echo "🚀 Starting Silea Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ===== STEP 1: System Update =====
echo -e "${GREEN}[1/10] Updating system packages...${NC}"
sudo yum update -y

# ===== STEP 2: Install Docker =====
echo -e "${GREEN}[2/10] Installing Docker...${NC}"
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# ===== STEP 3: Install Docker Compose =====
echo -e "${GREEN}[3/10] Installing Docker Compose...${NC}"
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ===== STEP 4: Install Git =====
echo -e "${GREEN}[4/10] Installing Git...${NC}"
sudo yum install git -y

# ===== STEP 5: Create Application Directory =====
echo -e "${GREEN}[5/10] Creating application directory...${NC}"
sudo mkdir -p /opt/silea
sudo chown ec2-user:ec2-user /opt/silea
cd /opt/silea

# ===== STEP 6: Clone Repository =====
echo -e "${GREEN}[6/10] Cloning repository...${NC}"
echo -e "${YELLOW}Please enter your GitHub repository URL:${NC}"
read REPO_URL
git clone $REPO_URL .

# ===== STEP 7: Setup Environment Variables =====
echo -e "${GREEN}[7/10] Setting up environment variables...${NC}"
echo -e "${YELLOW}Copying .env.production template...${NC}"

if [ ! -f .env ]; then
    cp .env.production .env
    echo -e "${RED}⚠️  IMPORTANT: Edit .env file with actual credentials!${NC}"
    echo -e "${YELLOW}Run: nano .env${NC}"
    echo -e "${YELLOW}Press Enter when done editing...${NC}"
    read
fi

# ===== STEP 8: Set Proper Permissions =====
echo -e "${GREEN}[8/10] Setting file permissions...${NC}"
chmod 600 .env
sudo mkdir -p /var/log/silea
sudo chown -R ec2-user:ec2-user /var/log/silea

# ===== STEP 9: Build and Start Containers =====
echo -e "${GREEN}[9/10] Building and starting Docker containers...${NC}"
docker-compose up -d --build

# ===== STEP 10: Setup Systemd Service =====
echo -e "${GREEN}[10/10] Setting up systemd service for auto-start...${NC}"
sudo tee /etc/systemd/system/silea.service > /dev/null <<EOF
[Unit]
Description=Silea Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/silea
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=ec2-user

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable silea.service
sudo systemctl start silea.service

# ===== FINAL CHECKS =====
echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "🔍 Checking container status..."
docker-compose ps
echo ""
echo "📊 Checking logs..."
docker-compose logs --tail=50
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Silea is now running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. Configure your domain DNS to point to this EC2 instance"
echo "2. Set up SSL certificates (Let's Encrypt recommended)"
echo "3. Configure Nginx reverse proxy for HTTPS"
echo "4. Set up automated backups for MySQL database"
echo "5. Configure CloudWatch monitoring"
echo ""
echo "🔧 Useful Commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Restart services: docker-compose restart"
echo "  Stop services:    docker-compose down"
echo "  Start services:   docker-compose up -d"
echo "  Check status:     docker-compose ps"
echo ""
echo "📍 Application URLs:"
echo "  Frontend:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "  Backend:   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo "  - Keep your .env file secure (chmod 600)"
echo "  - Never commit .env to git"
echo "  - Regularly update passwords and API keys"
echo "  - Set up database backups"
echo "  - Monitor application logs"
echo ""
