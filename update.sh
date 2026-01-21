#!/bin/bash
# Quick update script for EC2
# Run: bash update.sh

echo "🔄 Updating Silea..."

# Login to ECR
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 442147575154.dkr.ecr.eu-west-3.amazonaws.com

# Pull latest images
docker pull 442147575154.dkr.ecr.eu-west-3.amazonaws.com/silea-backend:latest
docker pull 442147575154.dkr.ecr.eu-west-3.amazonaws.com/silea-frontend:latest

# Restart containers
docker-compose restart backend frontend

echo "✅ Update complete!"
docker ps
