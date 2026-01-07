# 🚀 Silea Automated Deployment Guide

## One-Command Deployment on EC2

### First Time Setup

1. **Connect to EC2** via AWS Console → EC2 Instance Connect

2. **Run the automated deployment script:**

```bash
cd ~/silea
chmod +x deploy-secure.sh
./deploy-secure.sh
```

That's it! The script automatically:
- ✅ Pulls latest code from GitHub
- ✅ Creates nginx security directories
- ✅ Generates authentication files with default password
- ✅ Pulls latest Docker images from ECR
- ✅ Restarts all containers with security enabled
- ✅ Shows deployment status

### Default Credentials

- **Username**: `silea_admin`
- **Password**: `SileaAdmin2026!Secure`

### Custom Password (Recommended)

To use a custom password instead of the default:

```bash
export SILEA_ADMIN_PASSWORD="YourStrongPasswordHere"
./deploy-secure.sh
```

Or add to `~/.bashrc` for permanent setting:

```bash
echo 'export SILEA_ADMIN_PASSWORD="YourStrongPasswordHere"' >> ~/.bashrc
source ~/.bashrc
./deploy-secure.sh
```

## Future Deployments

Every time you push code changes:

```bash
cd ~/silea
./deploy-secure.sh
```

The script will:
- Pull latest code
- Keep existing passwords (won't regenerate if `.htpasswd` files exist)
- Deploy updated containers
- Maintain security settings

## Access Your Services

After deployment:

| Service | URL | Access |
|---------|-----|--------|
| Frontend | http://51.44.37.35:3000 | Public |
| Backend API | http://51.44.37.35:8080/api/* | Public |
| Backend Admin | http://51.44.37.35:8080/api/admin/* | **Protected** 🔒 |
| phpMyAdmin | http://51.44.37.35:8081 | **Protected** 🔒 |

## Protected Endpoints

### phpMyAdmin (Port 8081)
- All access requires authentication
- Use browser's HTTP Basic Auth prompt

### Backend Admin (Port 8080)
- Protected: `/api/admin/*`
- Public: `/api/products`, `/api/categories`, `/api/orders`, `/api/webhooks`, `/api/auth`, `/api/customers`

## Troubleshooting

### Check container status:
```bash
cd ~/silea
docker-compose ps
```

### View container logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx-phpmyadmin
```

### Restart a specific service:
```bash
docker-compose restart backend
```

### Full reset:
```bash
cd ~/silea
docker-compose down
./deploy-secure.sh
```

## Security Notes

✅ Passwords are stored only on EC2 (not in git)  
✅ `.htpasswd` files are excluded from version control  
✅ Default password is secure but should be changed in production  
✅ All admin endpoints protected with HTTP Basic Authentication  

## GitHub Actions (Optional - Future Enhancement)

You can automate deployment on every push by setting up GitHub Actions. The workflow would:
1. Build Docker images
2. Push to ECR
3. SSH to EC2
4. Run `deploy-secure.sh` automatically

This makes deployment completely hands-off!
