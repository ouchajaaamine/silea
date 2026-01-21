# Sendit.ma Integration - Final Workflow (Manual Registration)

## 📋 Complete Workflow

### Step 1: Customer Places Order
- Customer adds products to cart
- Completes checkout on website
- **Order created with code:** `CMD001`
- Customer receives WhatsApp confirmation with `CMD001`

### Step 2: You Confirm by Phone
- You call the customer
- Confirm order details (address, products, etc.)
- Customer confirms they want the order

### Step 3: You Register Order in Sendit.ma **MANUALLY**
- You go to Sendit.ma website/system
- You manually enter order information:
  - Customer name
  - Phone number  
  - Address
  - City
  - Order reference: `CMD001`
  - Amount
- **Sendit gives you tracking code:** `SND12345`

### Step 4: You Link Sendit Code in Admin Panel
**API Call:**
```bash
POST /api/orders/{orderId}/sendit-tracking
{
  "senditTrackingCode": "SND12345"
}
```

**What happens automatically:**
- ✅ Sendit code linked to order
- ✅ System fetches initial status from Sendit API
- ✅ Customer receives WhatsApp: "Your order is now with delivery company!"
- ✅ Both codes stored: `CMD001` + `SND12345`

### Step 5: Automatic Status Updates (Every 5 Minutes)
- Scheduler runs automatically
- Checks Sendit API for status of `SND12345`
- If status changed:
  - Updates order status in database
  - Sends WhatsApp to customer with new status
- Customer always updated automatically!

## 🔄 Status Flow

```
Your Website → PENDING → CONFIRMED → PROCESSING
                                         ↓
                         (You register in Sendit.ma manually)
                                         ↓
                         (You enter SND12345 in admin)
                                         ↓
Sendit API → PICKUP_REQUESTED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
             (All these updates happen automatically every 5 minutes)
```

## 💬 Customer Experience

### 1. After placing order:
```
🌟 Order Confirmed!
Order: CMD001
Track: http://yoursite.com/track-order?code=CMD001
```

### 2. After you link Sendit code:
```
🌟 Your order is now with delivery company!
Order: CMD001
Sendit Code: SND12345
```

### 3. Every status change (automatic):
```
🌟 Delivery Update!
Order: CMD001
New Status: Out for Delivery
Sendit Code: SND12345
```

## 🎯 Tracking Codes

**Customer has TWO codes but uses ONE:**

- **Your Website Code:** `CMD001`
  - Customer uses this on your website
  - Goes to: `yoursite.com/track-order?code=CMD001`
  - Shows all order info including Sendit status

- **Sendit Code:** `SND12345`
  - Automatically linked when you enter it
  - Used internally to fetch status from Sendit API
  - Customer also sees this code in WhatsApp messages
  - Customer could also track directly on Sendit.ma if they want

**Best practice:** Customer only needs `CMD001` for your website. The Sendit code is shown to them for reference but they don't need to use it.

## 🔧 Admin Process

### How to Link Sendit Code:

**Option 1: API Call (if you have admin interface)**
```bash
POST http://localhost:8080/api/orders/123/sendit-tracking
Content-Type: application/json

{
  "senditTrackingCode": "SND12345"
}
```

**Option 2: Add button in your admin panel**
- View order details
- Click "Link Sendit Tracking"
- Enter `SND12345`
- Submit

### What Happens:
1. ✅ Code validated (not empty, not already used)
2. ✅ Linked to order in database
3. ✅ Initial status fetched from Sendit API
4. ✅ WhatsApp sent to customer
5. ✅ Automatic sync starts (every 5 minutes)

## ⚙️ What's Automatic vs Manual

### ✅ Automatic (No work for you):
- Order creation in your system
- First WhatsApp confirmation to customer
- **Status updates every 5 minutes** ⭐
- WhatsApp notifications when status changes
- Database updates

### 👤 Manual (You do this):
- Confirm order with customer by phone
- Go to Sendit.ma and register delivery
- Get Sendit tracking code
- Enter tracking code in your admin panel

## 📊 Database

After linking, order looks like this:
```
order_number: CMD001
tracking_code: TRK12345 (your internal tracking)
sendit_tracking_code: SND12345 (Sendit's code)
sendit_delivery_id: DEL789 (Sendit's internal ID)
status: PICKED_UP (current status from Sendit)
last_sendit_sync: 2026-01-19 10:05:00 (last check time)
```

## 🔍 How Customer Tracks

**Option 1: Your Website (Recommended)**
- Go to: `yoursite.com/track-order`
- Enter: `CMD001`
- See: All order details + current Sendit status

**Option 2: Sendit Website (If they want)**
- Go to: `sendit.ma`
- Enter: `SND12345`
- See: Delivery status directly from Sendit

## 🎉 Benefits

✅ **For You:**
- No automatic Sendit calls that might fail
- Full control over when orders go to Sendit
- Confirm with customer before shipping

✅ **For Customer:**
- Real-time delivery tracking (once linked)
- WhatsApp notifications at every step
- One code to remember (`CMD001`)

✅ **System:**
- Reliable (you control when Sendit is involved)
- Automatic status sync (no manual checking)
- Error-proof (linking only happens when you want)

## 🚀 Quick Start

1. **Customer places order** → You get notification
2. **Call customer** → Confirm details
3. **Go to Sendit.ma** → Register delivery → Get `SND12345`
4. **In admin panel** → Link `SND12345` to order
5. **Done!** → Everything else automatic!

---

**Perfect workflow:** Manual registration (your control) + Automatic tracking (convenience)
