# 🔧 Environment Variables Setup Guide

## Quick Setup (One-Time Configuration)

After deploying to EC2 for the first time, you need to configure your environment variables.

### Step 1: SSH into EC2

```bash
ssh -i silea-key.pem ec2-user@35.180.229.121
```

### Step 2: Edit .env File

```bash
cd /opt/silea
nano .env
```

### Step 3: Configure Required Variables

#### 📧 **EMAIL CONFIGURATION** (REQUIRED)

**Option A: Gmail with App Password** (Easiest)

1. Go to: https://myaccount.google.com/apppasswords
2. Generate an App Password for "Silea Production"
3. Update .env:

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Your 16-char App Password
EMAIL_FROM=official@xn--sila-dpa.com
EMAIL_FROM_NAME=Silea
```

**Option B: Amazon SES** (Recommended for Production)

1. Go to AWS SES Console
2. Verify your domain
3. Create SMTP credentials
4. Update .env:

```env
EMAIL_ENABLED=true
EMAIL_HOST=email-smtp.eu-west-3.amazonaws.com
EMAIL_PORT=587
EMAIL_USERNAME=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
EMAIL_FROM=official@xn--sila-dpa.com
EMAIL_FROM_NAME=Silea
```

---

#### 📋 **MONDAY.COM CONFIGURATION** (Optional)

1. Go to: https://monday.com
2. Click Avatar → Admin → API
3. Generate API v2 Token
4. Get Board ID from URL: `https://monday.com/boards/1234567890`
5. Update .env:

```env
MONDAY_ENABLED=true
MONDAY_API_TOKEN=eyJhbGc...your-token-here
MONDAY_BOARD_ID=1234567890
```

If you don't use Monday.com, set:
```env
MONDAY_ENABLED=false
```

---

#### 📦 **SENDIT.MA CONFIGURATION** (Optional)

If you use Sendit.ma for delivery:

```env
SENDIT_ENABLED=true
SENDIT_API_URL=https://api.sendit.ma/v1
SENDIT_PUBLIC_KEY=your-public-key
SENDIT_PRIVATE_KEY=your-private-key
SENDIT_SYNC_INTERVAL=5
```

---

### Step 4: Save and Restart

```bash
# Save in nano: Ctrl+X, then Y, then Enter

# Restart services
cd /opt/silea
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Watch logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## ✅ Verification

### Test Email

1. Create a test order on your website
2. Check if confirmation email arrives
3. Check logs for:
   - ✓ "Email sent successfully"
   - ✗ "Authentication failed" (means wrong password)

### Test Monday.com

1. Create an order
2. Check Monday.com board for new item
3. Check logs for:
   - ✓ "Successfully created Monday.com item"
   - ✗ "401 Unauthorized" (means wrong token)

---

## 🚀 After Configuration

Once .env is configured, you only need to run ONE command for future deployments:

```bash
bash ec2-quick-deploy.sh
```

This will:
1. Pull latest code
2. Pull latest Docker images
3. Restart services
4. Clean up old images

---

## 🆘 Troubleshooting

### Email Not Working

**Check 1: Verify App Password**
```bash
# View current config (password will show partially)
cat .env | grep EMAIL
```

**Check 2: Check Gmail Account**
- Go to: https://myaccount.google.com/notifications
- Look for "Blocked sign-in" alerts

**Check 3: View Logs**
```bash
docker-compose -f docker-compose.prod.yml logs backend | grep -i email
```

### Monday.com Not Working

**Check 1: Verify Token Format**
```bash
# Token should start with "eyJ"
cat .env | grep MONDAY_API_TOKEN
```

**Check 2: Test Token Directly**
```bash
TOKEN="your-token-here"
curl -X POST https://api.monday.com/v2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ me { name } }"}'
```

---

## 📝 Security Notes

✅ **.env file is secured** (chmod 600)
✅ **Never commit .env to git** (in .gitignore)
✅ **Rotate passwords every 90 days**
✅ **Use AWS Secrets Manager for production** (optional)

---

## 📞 Need Help?

Check the full diagnosis document: `PRODUCTION-ISSUES-DIAGNOSIS.md`

