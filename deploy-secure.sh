#!/bin/bash

# Silea Fully Automated Secure Deployment Script
# This script sets up security and deploys to EC2 automatically

set -e  # Exit on error

echo "🔐 Silea Automated Secure Deployment"
echo "===================================="
echo ""

# Default password (will be used if SILEA_ADMIN_PASSWORD not set)
# CHANGE THIS IN PRODUCTION or set SILEA_ADMIN_PASSWORD environment variable
DEFAULT_PASSWORD="SileaAdmin2026!Secure"

# Use environment variable if set, otherwise use default
ADMIN_PASSWORD="${SILEA_ADMIN_PASSWORD:-$DEFAULT_PASSWORD}"

# Navigate to deployment directory
cd ~/silea

echo "📥 Step 1/6: Pulling latest code from GitHub..."
git pull origin main

echo ""
echo "📁 Step 2/6: Creating nginx directories..."
mkdir -p nginx/phpmyadmin nginx/backend

echo ""
echo "🔑 Step 3/6: Generating authentication files..."

# Generate .htpasswd files automatically (no user input required)
if [ ! -f "nginx/phpmyadmin/.htpasswd" ]; then
    echo "   ├── Creating phpMyAdmin .htpasswd..."
    htpasswd -cb nginx/phpmyadmin/.htpasswd silea_admin "$ADMIN_PASSWORD"
else
    echo "   ├── phpMyAdmin .htpasswd already exists (skipping)"
fi

if [ ! -f "nginx/backend/.htpasswd" ]; then
    echo "   └── Creating Backend .htpasswd..."
    htpasswd -cb nginx/backend/.htpasswd silea_admin "$ADMIN_PASSWORD"
else
    echo "   └── Backend .htpasswd already exists (skipping)"
fi

echo ""
echo "📥 Step 4/6: Pulling latest Docker images from ECR..."
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 442147575154.dkr.ecr.eu-west-3.amazonaws.com
docker-compose pull

echo ""
echo "🛑 Step 5/6: Stopping existing containers..."
docker-compose down

echo ""
echo "🚀 Step 6/6: Starting secured containers..."
docker-compose up -d

# Wait for services to start
echo ""
echo "⏳ Waiting for services to initialize..."
sleep 15

# Show status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "✅ =================================="
echo "✅  DEPLOYMENT COMPLETED SUCCESSFULLY"
echo "✅ =================================="
echo ""
echo "🌐 Your Services:"
echo "  ├── Frontend:       http://51.44.37.35:3000 (public)"
echo "  ├── Backend API:    http://51.44.37.35:8080/api/* (public endpoints)"
echo "  ├── Backend Admin:  http://51.44.37.35:8080/api/admin/* (protected)"
echo "  └── phpMyAdmin:     http://51.44.37.35:8081 (protected)"
echo ""
echo "🔐 Admin Credentials:"
echo "  Username: silea_admin"
if [ "$ADMIN_PASSWORD" == "$DEFAULT_PASSWORD" ]; then
    echo "  Password: $ADMIN_PASSWORD"
    echo ""
    echo "⚠️  WARNING: Using default password!"
    echo "    Set SILEA_ADMIN_PASSWORD environment variable for custom password"
else
    echo "  Password: (from SILEA_ADMIN_PASSWORD env variable)"
fi
echo ""
