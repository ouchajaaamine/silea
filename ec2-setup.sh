#!/bin/bash
# EC2 Setup Script for Silea

set -e

echo "🚀 Setting up Silea on EC2..."

# Update system
sudo yum update -y

# Install Docker
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2 (already on Amazon Linux 2023)
# Configure ECR login
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 442147575154.dkr.ecr.eu-west-3.amazonaws.com

# Create app directory
sudo mkdir -p /opt/silea
cd /opt/silea

# Create .env file
echo "DB_PASSWORD=SileaDB2026!Secure" > .env

# Pull images
docker pull 442147575154.dkr.ecr.eu-west-3.amazonaws.com/silea-backend:latest
docker pull 442147575154.dkr.ecr.eu-west-3.amazonaws.com/silea-frontend:latest

# Start containers
docker-compose -f docker-compose.prod.yml up -d

# Setup auto-start service
sudo tee /etc/systemd/system/silea.service > /dev/null <<EOF
[Unit]
Description=Silea Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/silea
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable silea.service

echo "✅ Silea setup complete!"
echo "🌐 Access your site at: http://35.180.229.121"
