# 🔐 Add GitHub Secrets (One Time Only)

## Go to GitHub Secrets Page

👉 **https://github.com/ouchajaaamine/silea/settings/secrets/actions**

---

## Add These 4 Secrets:

### 1️⃣ EMAIL_USERNAME
**Name:** `EMAIL_USERNAME`  
**Value:** Your Gmail address (e.g., `your-email@gmail.com`)

### 2️⃣ EMAIL_PASSWORD
**Name:** `EMAIL_PASSWORD`  
**Value:** Your Gmail App Password (16 characters)

📌 Get it from: https://myaccount.google.com/apppasswords
- Select "Mail" and "Other (Custom name)"
- Enter: "Silea Production"
- Copy the 16-character password

### 3️⃣ MONDAY_API_TOKEN
**Name:** `MONDAY_API_TOKEN`  
**Value:** Your Monday.com API token (starts with `eyJ`)

📌 Get it from: https://monday.com → Admin → API
- Generate new API v2 Token
- Copy the token

### 4️⃣ MONDAY_BOARD_ID
**Name:** `MONDAY_BOARD_ID`  
**Value:** Your Monday.com board ID (just the number)

📌 Get it from your board URL: `https://monday.com/boards/1234567890`
- The number `1234567890` is your board ID

---

## ✅ After Adding Secrets

**Just push code - everything deploys automatically!**

```bash
git push origin main
```

Watch deployment: https://github.com/ouchajaaamine/silea/actions

---

## 🎯 That's It!

**No SSH needed!**  
**No EC2 commands!**  
**No manual configuration!**  

Just add secrets once and push! 🚀

