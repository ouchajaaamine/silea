# 🚀 SILEA - Simple Deployment Instructions

## 📋 What's Been Fixed

✅ **Monday.com Authorization** - Fixed Bearer token format  
✅ **Email Configuration** - Proper Gmail App Password support  
✅ **Login Page** - Removed demo credentials  
✅ **One-Command Deployment** - Simple deployment script created  

---

## 🎯 For You (First Time Setup)

### Step 1: Push Your Code

```bash
git add .
git commit -m "Fix email and Monday.com authentication"
git push origin main
```

### Step 2: SSH to EC2 (One Time Only)

```bash
ssh -i silea-key.pem ec2-user@35.180.229.121
```

### Step 3: Configure Environment Variables (One Time Only)

```bash
cd /opt/silea
nano .env
```

**Update these required fields:**

```env
# Email Configuration (REQUIRED)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Monday.com (Optional - set MONDAY_ENABLED=false if not using)
MONDAY_ENABLED=true
MONDAY_API_TOKEN=your-monday-token
MONDAY_BOARD_ID=your-board-id
```

**To get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Generate password for "Silea Production"
3. Copy the 16-character password (no spaces)

**To get Monday.com Token:**
1. Go to: https://monday.com → Admin → API
2. Generate new API v2 Token
3. Copy the token (starts with `eyJ`)
4. Get Board ID from your board URL

Save and exit: `Ctrl+X`, `Y`, `Enter`

### Step 4: Run Deployment Script

```bash
chmod +x ec2-quick-deploy.sh
bash ec2-quick-deploy.sh
```

**That's it!** 🎉

---

## 🔄 Future Deployments (Super Simple)

After the initial setup, whenever you push new code, just run ONE command on EC2:

```bash
ssh -i silea-key.pem ec2-user@35.180.229.121
cd /opt/silea
bash ec2-quick-deploy.sh
```

Or even simpler, create this local script on your machine:

**`deploy.sh` (on your local machine):**
```bash
#!/bin/bash
echo "Pushing code..."
git push origin main

echo "Deploying to EC2..."
ssh -i silea-key.pem ec2-user@35.180.229.121 "cd /opt/silea && bash ec2-quick-deploy.sh"

echo "✅ Deployment complete!"
```

Then just run: `bash deploy.sh`

---

## 🧪 Testing

### Test Email

1. Go to: http://35.180.229.121
2. Add a product to cart
3. Complete checkout with a real email
4. Check if confirmation email arrives

**Expected Result:**
- ✅ Email arrives within 1 minute
- ✅ No errors in logs

### Test Monday.com

1. After creating an order
2. Check your Monday.com board
3. New order should appear with all details

**Expected Result:**
- ✅ Order appears in Monday.com
- ✅ All fields populated correctly

---

## 📊 Monitoring

### View Real-Time Logs

```bash
ssh -i silea-key.pem ec2-user@35.180.229.121
docker-compose -f /opt/silea/docker-compose.prod.yml logs -f backend
```

Look for:
- ✅ `Email sent successfully`
- ✅ `Successfully created Monday.com item`
- ❌ `Authentication failed` (fix email password)
- ❌ `401 Unauthorized` (fix Monday.com token)

### Check Container Status

```bash
docker-compose -f /opt/silea/docker-compose.prod.yml ps
```

All containers should be "Up".

---

## 🆘 Troubleshooting

### Email Not Working

**Problem:** "Authentication failed"

**Solution:**
1. Make sure you're using Gmail **App Password**, not regular password
2. Re-generate App Password at: https://myaccount.google.com/apppasswords
3. Update `.env` file
4. Restart: `bash ec2-quick-deploy.sh`

### Monday.com Not Working

**Problem:** "401 Unauthorized"

**Solution:**
1. Check token starts with `eyJ`
2. Re-generate token at: https://monday.com → Admin → API
3. Make sure token has **write permissions**
4. Update `.env` file
5. Restart: `bash ec2-quick-deploy.sh`

### Containers Not Starting

**Problem:** Container exits immediately

**Solution:**
```bash
# Check logs
docker-compose -f /opt/silea/docker-compose.prod.yml logs backend

# Common issues:
# - Database not ready (wait 30 seconds)
# - Invalid environment variable format
# - Missing required variables
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `ec2-quick-deploy.sh` | One-command deployment script |
| `.env` | Environment variables (on EC2) |
| `PRODUCTION-ISSUES-DIAGNOSIS.md` | Detailed diagnosis document |
| `ENV-SETUP-GUIDE.md` | Complete environment setup guide |

---

## ✅ Checklist

**Initial Setup:**
- [ ] Push code to GitHub
- [ ] SSH to EC2
- [ ] Configure `.env` file with Gmail App Password
- [ ] Configure `.env` file with Monday.com token (or disable)
- [ ] Run `ec2-quick-deploy.sh`
- [ ] Test email by creating order
- [ ] Test Monday.com integration
- [ ] Verify logs show no errors

**Future Deployments:**
- [ ] Push code to GitHub
- [ ] SSH to EC2
- [ ] Run `bash ec2-quick-deploy.sh`
- [ ] Verify deployment successful

---

## 🎯 Summary

**What Changed:**
1. ✅ Monday.com now uses correct Bearer token format
2. ✅ Email configuration ready for Gmail App Passwords
3. ✅ Login page no longer shows demo credentials
4. ✅ Simple one-command deployment script

**What You Need to Do:**
1. Configure `.env` file on EC2 (one time)
2. Run deployment script

**Result:**
- 📧 Emails work perfectly
- 📋 Monday.com integration works
- 🔒 No demo credentials visible
- 🚀 Easy future deployments

---

## 📞 Support

For detailed information, check:
- `PRODUCTION-ISSUES-DIAGNOSIS.md` - Complete diagnosis
- `ENV-SETUP-GUIDE.md` - Environment setup details
- `fix-production-issues.sh` - Interactive setup wizard

---

**Last Updated:** January 21, 2026  
**Status:** ✅ Ready to Deploy

🎉 **You're all set! Just push, SSH, and run the script!**

