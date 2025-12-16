# 🚀 Silea Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Domain & Hosting Setup
```
✅ Buy domain (e.g., silea.ma)
✅ Get SSL certificate (Let's Encrypt - free)
✅ Choose hosting:
   - Backend: VPS (DigitalOcean/AWS/Azure) or Heroku
   - Frontend: Vercel (recommended - free) or Netlify
   - Database: MySQL on VPS or managed service
```

### 2. Backend Configuration (Spring Boot)

**Update `application.yml`:**
```yaml
# Production settings
spring:
  datasource:
    url: jdbc:mysql://YOUR_DB_HOST:3306/sileadb?useSSL=true
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

# Monday.com webhook
monday:
  api-token: ${MONDAY_API_TOKEN}
  board-id: 5088829162

# WhatsApp (Twilio Production)
whatsapp:
  enabled: true
  account-sid: ${TWILIO_ACCOUNT_SID}
  auth-token: ${TWILIO_AUTH_TOKEN}
  from-number: whatsapp:+YOUR_BUSINESS_NUMBER  # Your verified WhatsApp Business number
  business-name: Silea
```

**Set environment variables (NOT in code):**
```bash
export DB_USERNAME=prod_user
export DB_PASSWORD=strong_password
export MONDAY_API_TOKEN=your_token
export TWILIO_ACCOUNT_SID=ACxxxx
export TWILIO_AUTH_TOKEN=xxxxx
```

### 3. Frontend Configuration (Next.js)

**Update `lib/api.ts`:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.silea.ma';
```

**Set Vercel environment variable:**
```
NEXT_PUBLIC_API_URL=https://api.silea.ma
```

## 🔧 Deployment Steps

### Backend Deployment (VPS)

**1. Server Setup (Ubuntu)**
```bash
# Install Java 17
sudo apt update
sudo apt install openjdk-17-jdk nginx mysql-server

# Create app user
sudo useradd -m -s /bin/bash silea
```

**2. Build & Deploy**
```bash
# On your machine
./mvnw clean package -DskipTests

# Upload to server (use scp or git)
scp target/silea-0.0.1-SNAPSHOT.jar user@your-server:/home/silea/

# On server - create systemd service
sudo nano /etc/systemd/system/silea.service
```

```ini
[Unit]
Description=Silea Backend
After=network.target

[Service]
Type=simple
User=silea
WorkingDirectory=/home/silea
ExecStart=/usr/bin/java -jar /home/silea/silea-0.0.1-SNAPSHOT.jar
Restart=always
Environment="DB_USERNAME=prod_user"
Environment="DB_PASSWORD=strong_password"
Environment="MONDAY_API_TOKEN=your_token"
Environment="TWILIO_ACCOUNT_SID=ACxxxx"
Environment="TWILIO_AUTH_TOKEN=xxxxx"

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl enable silea
sudo systemctl start silea

# Configure Nginx
sudo nano /etc/nginx/sites-available/silea
```

```nginx
server {
    listen 80;
    server_name api.silea.ma;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/silea /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# Get SSL certificate
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.silea.ma
```

### Frontend Deployment (Vercel)

**1. Push to GitHub**
```bash
cd Frontend
git add .
git commit -m "Production ready"
git push origin main
```

**2. Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repo
- Add environment variable: `NEXT_PUBLIC_API_URL=https://api.silea.ma`
- Deploy!

**3. Add custom domain**
- In Vercel: Settings → Domains → Add `silea.ma`
- Update DNS records (provided by Vercel)

## 🔗 Monday.com + WhatsApp Setup

### Monday.com Webhook Update

**1. Delete old webhook:**
```powershell
cd Backend
.\delete-webhook.ps1
```

**2. Create production webhook:**
```powershell
# Edit create-webhook.ps1
$webhookUrl = "https://api.silea.ma/api/webhooks/monday"  # Update this line
.\create-webhook.ps1
```

### Twilio WhatsApp Production

**1. Upgrade Twilio Account**
- Go to console.twilio.com
- Upgrade to paid account
- Request WhatsApp Business Profile

**2. Get Business Number**
- Buy phone number or use existing
- Request WhatsApp enablement (takes 2-3 days)
- Verify business details

**3. Update Backend**
```yaml
whatsapp:
  from-number: whatsapp:+212XXXXXXXXX  # Your verified number
```

## 🔒 Security Checklist

```
✅ Use environment variables (never commit secrets)
✅ Enable HTTPS (SSL certificates)
✅ Use strong database passwords
✅ Enable CORS only for your domain
✅ Keep dependencies updated
✅ Enable database backups
```

## 📊 Monitoring

**Backend logs:**
```bash
# On server
sudo journalctl -u silea -f
```

**Health check:**
```bash
curl https://api.silea.ma/actuator/health
```

## 🚨 Troubleshooting

**Backend not starting:**
- Check logs: `sudo journalctl -u silea -n 100`
- Verify Java version: `java -version`
- Check port 8080 available: `sudo lsof -i :8080`

**Monday webhook failing:**
- Test ngrok first: `ngrok http 8080`
- Update webhook URL to ngrok temporarily
- Check logs for errors

**WhatsApp not sending:**
- Verify Twilio credentials
- Check sandbox still active (if testing)
- Check logs: `grep WhatsApp /var/log/syslog`

## 📝 Quick Commands

```bash
# Restart backend
sudo systemctl restart silea

# View logs
sudo journalctl -u silea -f

# Check status
sudo systemctl status silea

# Rebuild & deploy
./mvnw clean package && scp target/*.jar user@server:/home/silea/
sudo systemctl restart silea
```

## 🎯 Production URLs

- **Frontend:** https://silea.ma
- **Backend API:** https://api.silea.ma
- **Monday Webhook:** https://api.silea.ma/api/webhooks/monday
- **Admin Dashboard:** https://silea.ma/admin

---

**Estimated Setup Time:** 2-3 hours
**Monthly Cost:** ~$15-30 (VPS + Twilio + Domain)
