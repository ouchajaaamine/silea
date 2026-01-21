# 🚀 DEPLOY NOW - Quick Start

## ✅ What's Been Fixed

1. **Email Authentication** - Ready for Gmail App Passwords
2. **Monday.com Integration** - Fixed Bearer token authorization
3. **Login Page** - Demo credentials removed

---

## 🎯 What You Need to Do

### 1️⃣ Push Your Code (Do This Now)

```bash
git add .
git commit -m "Fix email and Monday.com authentication, remove demo credentials"
git push origin main
```

### 2️⃣ SSH to EC2 and Configure (One Time Only)

```bash
# SSH to EC2
ssh -i silea-key.pem ec2-user@35.180.229.121

# Navigate to app directory
cd /opt/silea

# Edit environment file
nano .env
```

**Add these values in the .env file:**

```env
# Email Configuration (REQUIRED)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # ← Get from https://myaccount.google.com/apppasswords

# Monday.com (Optional - or set MONDAY_ENABLED=false)
MONDAY_ENABLED=true
MONDAY_API_TOKEN=eyJhbGc...  # ← Get from https://monday.com → Admin → API
MONDAY_BOARD_ID=1234567890
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### 3️⃣ Run ONE Command to Deploy

```bash
bash ec2-quick-deploy.sh
```

**Done!** 🎉

---

## 🧪 Test It Works

### Test Email
1. Go to http://35.180.229.121
2. Create an order with your email
3. Check if confirmation email arrives ✅

### Test Monday.com
1. After creating order
2. Check Monday.com board
3. New order should appear ✅

### Check Logs
```bash
docker-compose -f /opt/silea/docker-compose.prod.yml logs -f backend
```

Look for:
- ✅ "Email sent successfully"
- ✅ "Successfully created Monday.com item"

---

## 🔄 Future Deployments (Super Easy)

Whenever you want to deploy new changes:

```bash
# On your local machine
git push origin main

# On EC2
ssh -i silea-key.pem ec2-user@35.180.229.121
cd /opt/silea
bash ec2-quick-deploy.sh
```

That's it!

---

## 📚 Documentation

| Document | Use When |
|----------|----------|
| `DEPLOYMENT-INSTRUCTIONS.md` | 📖 Full deployment guide |
| `ENV-SETUP-GUIDE.md` | ⚙️ Configuring environment variables |
| `PRODUCTION-ISSUES-DIAGNOSIS.md` | 🔍 Deep troubleshooting |
| `CHANGES-SUMMARY.md` | 📝 What changed and why |

---

## 🆘 Quick Troubleshooting

**Email not working?**
- Make sure you're using Gmail **App Password** (16 characters)
- Get it from: https://myaccount.google.com/apppasswords

**Monday.com not working?**
- Make sure token starts with `eyJ`
- Get new token from: https://monday.com → Admin → API
- Or set `MONDAY_ENABLED=false` to disable

**Containers not starting?**
```bash
docker-compose -f /opt/silea/docker-compose.prod.yml logs backend
```

---

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] SSH'd to EC2
- [ ] Configured `.env` file with email & Monday.com
- [ ] Ran `ec2-quick-deploy.sh`
- [ ] Tested email (order confirmation arrives)
- [ ] Tested Monday.com (order appears in board)
- [ ] No errors in logs

---

## 🎉 You're Done!

Your application is now fully functional with:
- ✅ Working email notifications
- ✅ Monday.com integration
- ✅ Clean login page (no demo credentials)
- ✅ Easy deployment process

**Just push, configure once, and deploy!**

