#!/bin/bash
set -e

echo "🚀 Deploying Silea..."

# Install Docker if needed
if ! command -v docker &> /dev/null; then
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ec2-user
fi

# Install Docker Compose if needed
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Build and start everything
docker-compose up -d --build

echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend:    http://35.180.229.121:3000"
echo "   Backend:     http://35.180.229.121:8080/api"
echo "   phpMyAdmin:  http://35.180.229.121:8081"
echo ""
echo "📊 Check status: docker-compose ps"
echo "📋 View logs:    docker-compose logs -f"
