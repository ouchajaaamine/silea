# 🔍 SILEA PRODUCTION ISSUES - COMPREHENSIVE DIAGNOSIS & SOLUTIONS

## 📋 Executive Summary

**Date**: January 21, 2026  
**Environment**: AWS EC2 (35.180.229.121) - Production  
**Status**: 🔴 Critical - Email & Monday.com Integration Failing

---

## 🚨 IDENTIFIED ISSUES

### 1. ❌ EMAIL AUTHENTICATION FAILURE (CRITICAL)

**Error**:
```
jakarta.mail.AuthenticationFailedException: 535-5.7.8 Username and Password not accepted
Authentication failed
```

**Root Cause**:
- Gmail SMTP is **rejecting** the authentication credentials
- Using regular Gmail password instead of App Password
- Gmail requires App Passwords when:
  - 2-Factor Authentication (2FA) is enabled
  - "Less secure app access" is disabled (default since 2022)

**Impact**:
- ❌ Order confirmation emails NOT being sent
- ❌ Status update emails NOT being sent  
- ❌ Customer communication completely broken
- 😡 Poor customer experience

---

### 2. ❌ MONDAY.COM API AUTHENTICATION FAILURE (HIGH)

**Error**:
```
401 Unauthorized on POST request for "https://api.monday.com/v2"
```

**Root Cause**:
- Monday.com API token is missing, invalid, or expired
- Incorrect authorization header format
- Token might not have proper permissions

**Impact**:
- ❌ Orders not being created in Monday.com board
- ❌ Team cannot track orders in Monday.com
- ⚠️ Manual order management required

---

## 🔧 ROOT CAUSE ANALYSIS

### Email Service Configuration Issues

**Current Configuration** (from logs):
```yaml
email:
  enabled: true
  host: smtp.gmail.com
  port: 587
  username: ${EMAIL_USERNAME}      # ← Environment variable
  password: ${EMAIL_PASSWORD}      # ← Environment variable (WRONG TYPE)
  from-address: official@xn--sila-dpa.com
```

**Problems Identified**:

1. **Missing App Password**: Using regular Gmail password instead of App Password
2. **Environment Variables**: Not properly set in EC2 Docker container
3. **Gmail Security**: Modern Gmail requires App Passwords for SMTP

---

### Monday.com Service Configuration Issues

**Current Configuration**:
```yaml
monday:
  enabled: true
  api-token: ${MONDAY_API_TOKEN}   # ← Missing or invalid
  board-id: ${MONDAY_BOARD_ID}      # ← Needs verification
```

**Problems Identified**:

1. **Missing API Token**: Environment variable not set or invalid
2. **Token Format**: Monday.com requires specific authorization header format
3. **Board Permissions**: Token might not have write access to the board

---

## ✅ SOLUTIONS

### Solution 1: Fix Gmail Email Authentication

#### Step 1A: Enable App Password in Gmail (RECOMMENDED)

**Instructions**:

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification" → Turn ON

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter: "Silea Production Server"
   - Click "Generate"
   - **COPY** the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Save for next step** - you'll use this as EMAIL_PASSWORD

#### Step 1B: ALTERNATIVE - Use SMTP Service (Better for Production)

For production environments, consider these alternatives:

**Option A: Amazon SES (Simple Email Service)** ⭐ RECOMMENDED
- **Cost**: $0.10 per 1,000 emails (~$1/month)
- **Benefits**: 
  - No Gmail restrictions
  - Better deliverability
  - Detailed analytics
  - No authentication issues

**Configuration**:
```yaml
email:
  host: email-smtp.eu-west-3.amazonaws.com
  port: 587
  username: ${SES_SMTP_USERNAME}
  password: ${SES_SMTP_PASSWORD}
  from-address: official@xn--sila-dpa.com
```

**Option B: SendGrid** (Free tier: 100 emails/day)
- Sign up: https://sendgrid.com
- Get API key
- Use SMTP relay

---

### Solution 2: Fix Monday.com Integration

#### Step 2A: Generate New Monday.com API Token

**Instructions**:

1. **Login to Monday.com**: https://monday.com
2. **Go to Admin** → Developers → API
3. **Generate New Token**:
   - Click "Generate" or "API v2 Token"
   - Name: "Silea Production Server"
   - Scope: Full access (or at least: boards:write, items:write)
   - **COPY** the token (starts with `eyJ...`)

4. **Get Board ID**:
   - Open your orders board in Monday.com
   - Check the URL: `https://monday.com/boards/1234567890`
   - The number `1234567890` is your BOARD_ID

---

### Solution 3: Update Environment Variables on EC2

#### Step 3: SSH into EC2 and Configure Environment

**Connect to EC2**:
```powershell
# On your local machine
ssh -i silea-key.pem ec2-user@35.180.229.121
```

**Update Docker Compose Environment File**:
```bash
# Navigate to application directory
cd /opt/silea

# Create/Edit .env file
nano .env
```

**Add/Update these variables** (press `Ctrl+X`, then `Y` to save):
```env
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/silea_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=SileaDB2026!Secure

# Email Configuration (Gmail with App Password)
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # ← Replace with App Password from Step 1A
EMAIL_FROM=official@xn--sila-dpa.com
EMAIL_FROM_NAME=Silea

# Monday.com Configuration
MONDAY_ENABLED=true
MONDAY_API_TOKEN=eyJhbGc...your-actual-token-here  # ← Replace with token from Step 2A
MONDAY_BOARD_ID=1234567890  # ← Replace with your board ID

# Sendit Configuration
SENDIT_ENABLED=true
SENDIT_API_URL=https://api.sendit.ma/v1
SENDIT_PUBLIC_KEY=your-sendit-public-key
SENDIT_PRIVATE_KEY=your-sendit-private-key
SENDIT_SYNC_INTERVAL=5

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

**Secure the file**:
```bash
chmod 600 .env
```

---

### Solution 4: Restart Services

**Restart Docker containers with new environment variables**:

```bash
# Still on EC2
cd /opt/silea

# Stop all containers
docker-compose -f docker-compose.prod.yml down

# Start with new configuration
docker-compose -f docker-compose.prod.yml up -d

# Or use systemd service
sudo systemctl restart silea
```

**Monitor logs to verify**:
```bash
# Watch backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Look for these SUCCESS messages:
# ✓ "Email service initialized successfully with address: official@xn--sila-dpa.com"
# ✓ "Successfully created Monday.com item"
# ✓ "Email sent successfully to: customer@email.com"
```

---

## 🧪 TESTING & VERIFICATION

### Test 1: Verify Email Configuration

**Create a test order** via the frontend or API:

```bash
# Test order creation endpoint
curl -X POST http://35.180.229.121/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "Test Customer",
      "email": "your-test-email@gmail.com",
      "phone": "+212600000000"
    },
    "orderItems": [...],
    "total": 100.00
  }'
```

**Expected Result**:
- ✅ Email received at customer email
- ✅ Log shows: "✓ Email sent successfully"
- ✅ No "Authentication failed" errors

---

### Test 2: Verify Monday.com Integration

**Check logs after order creation**:
```bash
docker-compose -f docker-compose.prod.yml logs backend | grep -i monday

# Expected output:
# ✓ "Successfully created Monday.com item 1234567890 for order CMD001"
```

**Verify in Monday.com**:
- Open your Monday.com board
- Check if new order appeared with all details

---

## 📊 MONITORING & PREVENTION

### Setup Email Monitoring

**Add email test endpoint** to check health:

Create: `Backend/src/main/java/com/example/silea/controller/HealthController.java`

```java
@RestController
@RequestMapping("/api/health")
public class HealthController {
    
    @Autowired
    private EmailService emailService;
    
    @GetMapping("/email-test")
    public ResponseEntity<String> testEmail(@RequestParam String to) {
        try {
            emailService.sendTestEmail(to);
            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed: " + e.getMessage());
        }
    }
}
```

### Setup CloudWatch Alarms

**Monitor for errors**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name silea-email-failures \
  --alarm-description "Alert on email authentication failures" \
  --metric-name Errors \
  --namespace AWS/Logs \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

---

## 🔐 SECURITY BEST PRACTICES

### ✅ Implemented:
- [x] Environment variables for secrets
- [x] .env file with restricted permissions (chmod 600)
- [x] HTTPS/TLS for SMTP connection
- [x] IAM roles for AWS services

### ⚠️ Recommendations:

1. **Migrate from Gmail to Amazon SES**:
   - More reliable for production
   - Better deliverability
   - Lower risk of account suspension

2. **Use AWS Secrets Manager**:
   ```bash
   # Store secrets securely
   aws secretsmanager create-secret \
     --name silea/email/password \
     --secret-string "your-app-password"
   ```

3. **Rotate API Keys Regularly**:
   - Monday.com token: Every 90 days
   - Email passwords: Every 180 days
   - Database passwords: Every 90 days

4. **Enable Audit Logging**:
   - Log all email send attempts
   - Log all Monday.com API calls
   - Set up alerts for repeated failures

---

## 📝 CHECKLIST

### Immediate Actions (Do Now):

- [ ] Step 1A: Generate Gmail App Password
- [ ] Step 2A: Generate Monday.com API token
- [ ] Step 2A: Get Monday.com Board ID
- [ ] Step 3: SSH to EC2 and update .env file
- [ ] Step 4: Restart Docker containers
- [ ] Test 1: Create test order and verify email
- [ ] Test 2: Check Monday.com board for new item

### Follow-up Actions (This Week):

- [ ] Migrate from Gmail to Amazon SES
- [ ] Set up email monitoring endpoint
- [ ] Configure CloudWatch alarms
- [ ] Document all API keys in password manager
- [ ] Set calendar reminders for key rotation

### Long-term Improvements:

- [ ] Implement AWS Secrets Manager
- [ ] Add retry logic for email sending
- [ ] Add fallback email service
- [ ] Implement better error handling
- [ ] Add customer notification status in admin panel

---

## 🆘 TROUBLESHOOTING GUIDE

### Email Still Not Working?

**Check 1**: Verify App Password is correct
```bash
# Test SMTP connection manually
openssl s_client -starttls smtp -connect smtp.gmail.com:587
# Then type: EHLO localhost
# AUTH PLAIN should be listed
```

**Check 2**: Check Gmail account status
- Go to: https://myaccount.google.com/notifications
- Look for "Suspicious activity" or "Blocked sign-in"

**Check 3**: Check email logs
```bash
docker logs silea-backend 2>&1 | grep -A 10 "EmailService"
```

### Monday.com Still 401?

**Check 1**: Verify token format
```bash
# Token should start with "eyJ"
echo $MONDAY_API_TOKEN
```

**Check 2**: Test API token directly
```bash
curl -X POST https://api.monday.com/v2 \
  -H "Authorization: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ me { name } }"}'
```

**Check 3**: Verify board permissions
- Token must have write access to the board
- Board must be in the same workspace as token

---

## 📞 SUPPORT CONTACTS

- **AWS Support**: https://console.aws.amazon.com/support
- **Monday.com Support**: https://support.monday.com
- **Gmail Help**: https://support.google.com/mail

---

## 🎯 SUCCESS CRITERIA

Your configuration is successful when:

✅ **Email Service**:
- Order confirmation emails arrive within 1 minute
- Status update emails send successfully
- No authentication errors in logs
- Email delivery rate > 95%

✅ **Monday.com Integration**:
- All new orders appear in Monday.com board
- Order details populate correctly
- Status updates sync properly
- No 401 errors in logs

---

**Last Updated**: January 21, 2026  
**Version**: 1.0  
**Prepared by**: AI Assistant

---

🎉 **Once all steps are complete, your production issues will be resolved!**

