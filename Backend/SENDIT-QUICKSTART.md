# Sendit.ma Integration - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Run Database Migration

```bash
cd Backend
mysql -u root -p silea_db < sendit-migration.sql
```

Or let Hibernate auto-create the fields (recommended for development):
- The fields will be created automatically on application startup

### Step 2: Verify Configuration

Check `Backend/src/main/resources/application.yml`:

```yaml
sendit:
  enabled: true  # ✅ Must be true
  api-url: https://api.sendit.ma/v1
  public-key: 8515520946c6be2c4ff16cb29849dc80
  private-key: 7zVc1UftuXhsdJ0HPUvYNY3lY7UQZF9D
  sync-interval-minutes: 5
```

### Step 3: Start Application

```bash
cd Backend
./mvnw spring-boot:run
```

Or on Windows:
```bash
mvnw.cmd spring-boot:run
```

### Step 4: Test Integration

#### Create a Test Order via API:

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customerId": 1,
    "items": [
      {
        "productId": 1,
        "quantity": 2
      }
    ],
    "shippingAddress": "123 Rue Mohammed V, Apt 4",
    "shippingCity": "Casablanca",
    "notes": "Livraison avant 18h SVP"
  }'
```

#### Or use the Frontend:
1. Go to http://localhost:3000
2. Add products to cart
3. Complete checkout
4. Check order confirmation

### Step 5: Verify Integration

#### Check Logs
```bash
tail -f logs/application.log | grep -i sendit
```

Look for:
```
INFO: Creating Sendit delivery for order: CMD001
INFO: Successfully created Sendit delivery. Tracking code: SND12345
INFO: Starting Sendit delivery status sync...
INFO: Sendit sync completed. Success: 1, Errors: 0, Status changes: 0
```

#### Check Database
```sql
USE silea_db;

-- View orders with Sendit tracking
SELECT 
    order_number, 
    tracking_code, 
    sendit_tracking_code, 
    status, 
    last_sendit_sync
FROM orders 
WHERE sendit_tracking_code IS NOT NULL;
```

### Step 6: Monitor Automatic Sync

The scheduler runs every 5 minutes. Wait 5 minutes and check logs:

```bash
grep "Sendit sync completed" logs/application.log
```

You should see regular sync logs like:
```
2026-01-19 10:05:00 INFO: Sendit sync completed. Success: 3, Errors: 0, Status changes: 1
2026-01-19 10:10:00 INFO: Sendit sync completed. Success: 3, Errors: 0, Status changes: 0
2026-01-19 10:15:00 INFO: Sendit sync completed. Success: 3, Errors: 0, Status changes: 1
```

## 📊 What Happens Automatically

### When Customer Places Order:

1. ✅ Order created in Silea database (Status: PENDING)
2. ✅ Tracking code generated (e.g., CMD001)
3. ✅ Monday.com item created
4. ✅ WhatsApp confirmation sent
5. ✅ **Sendit delivery created** → Returns tracking code (e.g., SND12345)
6. ✅ Order updated with Sendit tracking code
7. ✅ Customer receives both tracking codes

### Every 5 Minutes:

1. 🔄 Scheduler wakes up
2. 🔍 Finds all orders with Sendit tracking
3. 🌐 Queries Sendit API for each order
4. 🔄 Updates order status if changed
5. 📱 Sends WhatsApp notification if status changed
6. ⏰ Records last sync time

## 🎯 Expected Behavior

### First Order
```
2026-01-19 09:00:00 - Order CMD001 created (PENDING)
2026-01-19 09:00:01 - Sendit delivery created (SND12345)
2026-01-19 09:00:02 - WhatsApp sent with both codes
2026-01-19 09:05:00 - First sync: No status change
2026-01-19 09:10:00 - Second sync: Status changed to PICKED_UP
2026-01-19 09:10:01 - WhatsApp sent: "Your order has been picked up!"
```

### Status Flow Example
```
PENDING (Silea) → Order created, waiting confirmation
    ↓
CONFIRMED (Silea) → Order confirmed by admin
    ↓
PROCESSING (Silea) → Preparing order
    ↓
PICKUP_REQUESTED (Sendit) → Sendit pickup requested
    ↓
PICKED_UP (Sendit) → Picked up by delivery agent
    ↓
IN_WAREHOUSE (Sendit) → In Sendit warehouse
    ↓
IN_TRANSIT (Sendit) → On the way
    ↓
OUT_FOR_DELIVERY (Sendit) → Delivery agent on the way
    ↓
DELIVERED (Sendit) → Successfully delivered
```

## 🔧 Common Issues & Solutions

### Issue: Sendit delivery not created

**Check:**
```bash
# 1. Verify Sendit is enabled
grep "sendit.enabled" src/main/resources/application.yml

# 2. Check API credentials
grep "sendit.public-key" src/main/resources/application.yml

# 3. Look for errors in logs
grep "ERROR.*Sendit" logs/application.log
```

**Solution:**
- Ensure `sendit.enabled: true`
- Verify API credentials are correct
- Check internet connectivity to api.sendit.ma

### Issue: Status not updating

**Check:**
```sql
-- Check last sync time
SELECT order_number, status, last_sendit_sync 
FROM orders 
WHERE sendit_tracking_code IS NOT NULL;
```

**Solution:**
- Wait 5 minutes for next sync
- Check scheduler is running in logs
- Verify orders are not in final status (DELIVERED, CANCELLED, etc.)

### Issue: WhatsApp not sending

**Check:**
```yaml
# In application.yml
whatsapp:
  enabled: true  # ← Must be true
  account-sid: ACxxxxx  # ← Valid Twilio SID
  auth-token: xxxxx  # ← Valid Twilio token
```

**Solution:**
- Set `whatsapp.enabled: true`
- Configure Twilio credentials
- Check phone number format (+212...)

## 📱 WhatsApp Message Preview

After order creation, customer receives:

```
🌟 السلام عليكم ورحمة الله وبركاته 🌟

عزيزنا Ahmed،
نشكرك على ثقتك الغالية في سيليا! ✨

✅ تم تأكيد طلبك بنجاح
🔖 رقم الطلب: CMD001

📦 المنتجات المطلوبة:
• 2x Product Name

💰 المبلغ الإجمالي: 450.00 درهم

🔍 تتبع طلبك:
http://51.44.37.35:3000/track-order?code=TRK12345

سنبقيك على اطلاع بكل مستجدات طلبك 📲
شكراً لاختيارك سيليا 🙏🌿
```

When status changes to OUT_FOR_DELIVERY:

```
🌟 السلام عليكم ورحمة الله وبركاته 🌟

عزيزنا Ahmed،

🚚 تحديث توصيل طلبك CMD001

الحالة الجديدة: في التوصيل

المندوب في طريقه إليك الآن! 🏃‍♂️📦

🔍 رمز التتبع Sendit: SND12345

نحن دائماً في خدمتك! 🙏🌿
```

## 📈 Monitoring Dashboard

### Key Metrics to Track

```sql
-- Total orders with Sendit tracking
SELECT COUNT(*) FROM orders WHERE sendit_tracking_code IS NOT NULL;

-- Orders by Sendit status
SELECT status, COUNT(*) 
FROM orders 
WHERE sendit_tracking_code IS NOT NULL 
GROUP BY status;

-- Recent syncs
SELECT order_number, status, last_sendit_sync 
FROM orders 
WHERE last_sendit_sync IS NOT NULL 
ORDER BY last_sendit_sync DESC 
LIMIT 10;

-- Orders needing sync (not synced in last 10 minutes)
SELECT COUNT(*) 
FROM orders 
WHERE sendit_tracking_code IS NOT NULL 
AND (last_sendit_sync IS NULL OR last_sendit_sync < NOW() - INTERVAL 10 MINUTE)
AND status NOT IN ('DELIVERED', 'CANCELLED', 'REFUSED');
```

## 🎉 Success Indicators

You'll know it's working when:

✅ Orders have `sendit_tracking_code` populated  
✅ Logs show "Successfully created Sendit delivery"  
✅ Sync runs every 5 minutes  
✅ Status changes are detected  
✅ WhatsApp notifications are sent  
✅ `last_sendit_sync` timestamps update  
✅ No errors in application logs  

## 🛠️ Advanced Configuration

### Change Sync Interval

Edit `application.yml`:
```yaml
sendit:
  sync-interval-minutes: 10  # Sync every 10 minutes
```

### Disable for Testing

```yaml
sendit:
  enabled: false  # Temporarily disable
```

### Use Staging API

```yaml
sendit:
  api-url: https://staging-api.sendit.ma/v1  # Test environment
```

## 📚 Next Steps

1. ✅ Test with real orders
2. ✅ Monitor for 24 hours
3. ✅ Enable WhatsApp notifications
4. ✅ Train team on new statuses
5. ✅ Update customer documentation
6. ✅ Set up monitoring alerts

## 🆘 Need Help?

- **Logs Location:** `logs/application.log`
- **Documentation:** `SENDIT-INTEGRATION.md`
- **Implementation Details:** `SENDIT-IMPLEMENTATION-SUMMARY.md`
- **Code Examples:** Check service classes in `src/main/java/com/example/silea/service/`

## 🎊 Congratulations!

Your Sendit.ma integration is now active! Orders will automatically:
- Create deliveries in Sendit
- Sync status every 5 minutes
- Notify customers via WhatsApp
- Track deliveries end-to-end

Enjoy your automated delivery management! 🚀📦✨
