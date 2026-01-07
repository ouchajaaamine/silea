#!/bin/bash
# Silea Deployment Script
# Works for both first-time setup AND regular updates
set -e

echo "🚀 Silea Deployment"
echo "==================="
echo ""

cd ~/silea

# Login to ECR
echo "🔑 Logging into AWS ECR..."
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 442147575154.dkr.ecr.eu-west-3.amazonaws.com

# Pull latest images
echo ""
echo "📥 Pulling latest Docker images..."
docker-compose pull

# Smart restart: only restart what's needed
echo ""
echo "🔄 Updating services..."
docker-compose up -d --remove-orphans

# Clean up old images
echo ""
echo "🧹 Cleaning up old images..."
docker image prune -f

echo ""
echo "⏳ Waiting for services..."
sleep 10

# Show status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Deployment Complete!"
echo ""

