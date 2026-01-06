# 🚀 Silea EC2 Deployment Guide

## ✅ Infrastructure Created:

- **EC2 Instance**: t4g.micro (ARM) - `i-0c0f74fe367a6506d`
- **Public IP**: `35.180.229.121`
- **Region**: eu-west-3 (Paris)
- **SSH Key**: `silea-key.pem` (saved in project root)
- **Security Group**: Ports 80, 443, 22 open

## 💰 Monthly Cost: ~$10-15

- EC2 t4g.micro: ~$6/month
- 20GB GP3 storage: ~$2/month
- Data transfer: ~$2-5/month
- **Total: $10-15/month** (67% cheaper than ECS!)

---

## 📋 Deployment Steps:

### 1. Connect to EC2 Instance

Open PowerShell and run:

```powershell
# Set correct permissions for SSH key
icacls silea-key.pem /inheritance:r
icacls silea-key.pem /grant:r "$env:USERNAME:(R)"

# Connect via SSH
ssh -i silea-key.pem ec2-user@35.180.229.121
```

### 2. Transfer Files to EC2

From your local machine:

```powershell
# Transfer files
scp -i silea-key.pem docker-compose.prod.yml ec2-user@35.180.229.121:/home/ec2-user/
scp -i silea-key.pem nginx.conf ec2-user@35.180.229.121:/home/ec2-user/
scp -i silea-key.pem ec2-setup.sh ec2-user@35.180.229.121:/home/ec2-user/
```

### 3. Run Setup Script on EC2

Once connected via SSH:

```bash
chmod +x ec2-setup.sh
./ec2-setup.sh
```

This will:
- Install Docker & Docker Compose
- Login to ECR
- Pull your Docker images
- Start all containers (MySQL, Backend, Frontend, Nginx)
- Setup auto-start service

### 4. Verify Deployment

```bash
# Check running containers
docker ps

# Check logs
docker logs silea-backend
docker logs silea-frontend

# Test API
curl http://localhost/api/products
```

---

## 🌐 Access Your Application:

- **Website**: http://35.180.229.121
- **API**: http://35.180.229.121/api/products
- **SSH Access**: `ssh -i silea-key.pem ec2-user@35.180.229.121`

---

## 🔧 Useful Commands:

```bash
# View logs
docker-compose -f /opt/silea/docker-compose.prod.yml logs -f

# Restart services
sudo systemctl restart silea

# Pull latest images
cd /opt/silea
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 442147575154.dkr.ecr.eu-west-3.amazonaws.com
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Access MySQL
docker exec -it silea-mysql mysql -uroot -pSileaDB2026!Secure silea_db

# Stop everything
docker-compose -f /opt/silea/docker-compose.prod.yml down
```

---

## 🔒 Security Best Practices:

1. **Change SSH port** from 22 to custom port
2. **Restrict SSH access** to your IP only:
   ```bash
   aws ec2 authorize-security-group-ingress --group-id sg-0d31405c1043ac758 --protocol tcp --port 22 --cidr YOUR_IP/32 --region eu-west-3
   aws ec2 revoke-security-group-ingress --group-id sg-0d31405c1043ac758 --protocol tcp --port 22 --cidr 0.0.0.0/0 --region eu-west-3
   ```
3. **Setup CloudWatch alarms** for CPU/memory
4. **Enable auto-recovery**
5. **Setup automated backups** for MySQL data

---

## 📊 Monitoring:

```bash
# CPU/Memory usage
docker stats

# Disk usage
df -h

# System load
top

# View systemd service status
sudo systemctl status silea
```

---

## 🔄 CI/CD Integration:

Update your GitHub Actions workflow to deploy to EC2 instead of ECS:

1. Add SSH key as GitHub secret
2. Add deployment step to SSH into EC2 and pull/restart containers

---

## 🆘 Troubleshooting:

**Containers not starting?**
```bash
docker-compose -f /opt/silea/docker-compose.prod.yml logs
```

**Out of memory?**
```bash
free -h
docker system prune -a  # Clean up unused images
```

**MySQL data loss?**
- Data is stored in Docker volume `mysql-data`
- Backup: `docker exec silea-mysql mysqldump -uroot -pSileaDB2026!Secure silea_db > backup.sql`
- Restore: `docker exec -i silea-mysql mysql -uroot -pSileaDB2026!Secure silea_db < backup.sql`

---

## 🎯 Next Steps:

1. **Add Elastic IP** (static IP that doesn't change on restart)
2. **Setup domain name** from Namecheap
3. **Install SSL certificate** with Let's Encrypt
4. **Setup automated backups** to S3
5. **Add monitoring** with CloudWatch

---

## 💡 Cost Optimization Tips:

- Use **Reserved Instance** for 1-year commitment: Save 30%
- Use **Savings Plan**: Save 40%
- **Stop instance at night** if testing: Save 50%
- **Snapshot & stop** when not in use: Only pay storage (~$2/month)

**Your architecture is now production-ready for under $15/month!** 🎉
