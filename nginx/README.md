# 🔐 Silea Security Setup

This directory contains automated security configurations for phpMyAdmin and Backend admin endpoints.

## Security Features

✅ **phpMyAdmin Protection** - HTTP Basic Authentication on port 8081  
✅ **Backend Admin Protection** - Auth required for `/api/admin/*` endpoints  
✅ **Public Endpoints** - Products, orders, webhooks remain accessible  
✅ **Automated Deployment** - Security applies automatically on every deploy  

## Directory Structure

```
nginx/
├── phpmyadmin/
│   ├── default.conf      # Nginx config with auth
│   └── .htpasswd         # Password file (auto-generated, not in git)
└── backend/
    ├── default.conf      # Nginx config with selective auth
    └── .htpasswd         # Password file (auto-generated, not in git)
```

## Configuration Details

### phpMyAdmin (Port 8081)
- **All access protected** with HTTP Basic Auth
- Username: `silea_admin`
- Password: Set during deployment

### Backend (Port 8080)
- **Protected paths**: `/api/admin/*`
- **Public paths**: `/api/products`, `/api/categories`, `/api/orders`, `/api/webhooks`, `/api/auth`, `/api/customers`
- Same credentials as phpMyAdmin

## Files NOT in Git (Security)

❌ `.htpasswd` files - Generated on EC2, contain hashed passwords  
❌ `.env.security` - Actual credentials file  
✅ `.env.security.example` - Template (safe to commit)

## Deployment

Security is applied automatically through docker-compose.yml configuration.

**Note**: Config files (`.conf`) are version-controlled, but password files (`.htpasswd`) are generated on EC2 and excluded from git for security.
