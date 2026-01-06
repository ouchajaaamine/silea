#!/bin/bash
# Deployment script for Silea on EC2
set -e

echo "🚀 Deploying Silea..."

# Navigate to app directory
cd /opt/silea

# Login to ECR
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 442147575154.dkr.ecr.eu-west-3.amazonaws.com

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull backend frontend

# Restart services with zero downtime
echo "🔄 Restarting services..."
docker-compose -f docker-compose.prod.yml up -d --no-deps backend frontend

# Clean up old images
echo "🧹 Cleaning up..."
docker image prune -f

echo "✅ Deployment complete!"
docker-compose -f docker-compose.prod.yml ps
