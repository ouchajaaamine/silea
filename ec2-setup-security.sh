#!/bin/bash

# Silea One-Time Security Setup for EC2
# Run this ONCE, then security is automatic forever
# Usage: curl -sSL https://raw.githubusercontent.com/ouchajaaamine/silea/main/ec2-setup-security.sh | bash

set -e

echo "🔐 Silea One-Time Security Setup"
echo "================================="
echo ""

# Default credentials
ADMIN_USER="silea_admin"
ADMIN_PASS="SileaAdmin2026!Secure"

cd ~/silea

echo "📁 Creating nginx directories..."
mkdir -p nginx/phpmyadmin nginx/backend

echo ""
echo "🔑 Generating authentication files..."
htpasswd -cb nginx/phpmyadmin/.htpasswd "$ADMIN_USER" "$ADMIN_PASS"
htpasswd -cb nginx/backend/.htpasswd "$ADMIN_USER" "$ADMIN_PASS"

echo ""
echo "📝 Creating phpMyAdmin nginx config..."
cat > nginx/phpmyadmin/default.conf << 'NGINX_PHPMYADMIN'
server {
    listen 80;
    server_name _;

    location / {
        auth_basic "Silea Database Admin Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
        
        proxy_pass http://phpmyadmin:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_PHPMYADMIN

echo ""
echo "📝 Creating backend nginx config..."
cat > nginx/backend/default.conf << 'NGINX_BACKEND'
server {
    listen 80;
    server_name _;

    # CORS headers for all responses
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin, X-Requested-With' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin, X-Requested-With';
        add_header 'Access-Control-Max-Age' 86400;
        add_header 'Content-Length' 0;
        add_header 'Content-Type' 'text/plain';
        return 204;
    }

    # All API endpoints
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Default
    location / {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_BACKEND

echo ""
echo "📝 Updating docker-compose.yml..."
cat > docker-compose.yml << 'DOCKERCOMPOSE'
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: silea-mysql
    environment:
      MYSQL_ROOT_PASSWORD: SileaDB2026!Secure
      MYSQL_DATABASE: silea_db
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: always
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: 442147575154.dkr.ecr.eu-west-3.amazonaws.com/silea-backend:latest
    container_name: silea-backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/silea_db
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: SileaDB2026!Secure
    expose:
      - "8080"
    depends_on:
      mysql:
        condition: service_healthy
    restart: always

  frontend:
    image: 442147575154.dkr.ecr.eu-west-3.amazonaws.com/silea-frontend:latest
    container_name: silea-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://51.44.37.35:8080
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: always

  phpmyadmin:
    image: phpmyadmin:latest
    container_name: silea-phpmyadmin
    environment:
      PMA_HOST: mysql
      PMA_USER: root
      PMA_PASSWORD: SileaDB2026!Secure
    depends_on:
      - mysql
    restart: always

  nginx-phpmyadmin:
    image: nginx:alpine
    container_name: silea-nginx-phpmyadmin
    ports:
      - "8081:80"
    volumes:
      - ./nginx/phpmyadmin/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/phpmyadmin/.htpasswd:/etc/nginx/.htpasswd:ro
    depends_on:
      - phpmyadmin
    restart: always

  nginx-backend:
    image: nginx:alpine
    container_name: silea-nginx-backend
    ports:
      - "8080:80"
    volumes:
      - ./nginx/backend/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/backend/.htpasswd:/etc/nginx/.htpasswd:ro
    depends_on:
      - backend
    restart: always

volumes:
  mysql_data:
DOCKERCOMPOSE

echo ""
echo "🛑 Stopping old containers..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker-compose down --remove-orphans 2>/dev/null || true

echo ""
echo "🚀 Starting secured containers..."
docker-compose up -d --remove-orphans

echo ""
echo "⏳ Waiting for services..."
sleep 15

echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "✅ =================================="
echo "✅  SECURITY SETUP COMPLETE!"
echo "✅ =================================="
echo ""
echo "🌐 Your Services:"
echo "  ├── Frontend:       http://51.44.37.35:3000"
echo "  ├── Backend API:    http://51.44.37.35:8080/api/*"
echo "  ├── Backend Admin:  http://51.44.37.35:8080/api/admin/* (🔒 protected)"
echo "  └── phpMyAdmin:     http://51.44.37.35:8081 (🔒 protected)"
echo ""
echo "🔐 Admin Credentials:"
echo "  Username: $ADMIN_USER"
echo "  Password: $ADMIN_PASS"
echo ""
echo "✨ Security is now AUTOMATIC - files persist between deployments!"
echo ""
