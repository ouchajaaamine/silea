# WhatsApp Business API Integration Guide

## Overview
This integration enables automatic WhatsApp notifications to customers for order updates using Twilio's WhatsApp Business API.

## Features
✅ Order confirmation messages (when order is created)
✅ Status update notifications (Confirmé, En traitement, Expédié, Livré)
✅ Shipping notifications with tracking
✅ Delivery confirmations
✅ Cancellation notifications
✅ French language templates
✅ Automatic phone number formatting for Morocco (+212)

## Setup Instructions

### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your email and phone number
4. You'll get **FREE $15 credit** to test WhatsApp messages!

### Step 2: Enable WhatsApp Sandbox (For Testing)
1. Login to Twilio Console: https://console.twilio.com
2. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Follow instructions to connect your WhatsApp:
   - Send `join <your-sandbox-code>` to the Twilio WhatsApp number
   - Example: Send `join abc-def` to `+1 415 523 8886`
4. Your WhatsApp is now connected to the sandbox!

### Step 3: Get Twilio Credentials
1. Go to Twilio Console Dashboard
2. Find your credentials:
   - **Account SID**: Example `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Click "Show" to reveal
   - **WhatsApp Number**: Found in WhatsApp Sandbox settings (format: `whatsapp:+14155238886`)

### Step 4: Configure Backend
Update `application.yml` with your Twilio credentials:

```yaml
whatsapp:
  enabled: true
  account-sid: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Your Account SID
  auth-token: your-auth-token-here              # Your Auth Token
  from-number: whatsapp:+14155238886            # Twilio WhatsApp number
  business-name: Silea
```

**OR** use environment variables (recommended for production):
```bash
WHATSAPP_ENABLED=true
WHATSAPP_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_AUTH_TOKEN=your-auth-token-here
WHATSAPP_FROM_NUMBER=whatsapp:+14155238886
```

### Step 5: Rebuild Backend
```bash
cd Backend
mvnw clean package
java -jar target/silea-0.0.1-SNAPSHOT.jar
```

### Step 6: Test WhatsApp Integration

#### Test 1: Create Test Order
1. Create an order through your API with a customer phone number
2. Customer phone should be the WhatsApp number you connected to sandbox
3. You should receive order confirmation message on WhatsApp!

#### Test 2: Change Order Status in Monday.com
1. Open your Monday.com board
2. Change an order status (e.g., En attente → Confirmé)
3. Customer should receive status update on WhatsApp!

## Message Templates

### Order Confirmation
```
Bonjour Ahmed! 👋

✅ Votre commande CMD023 a été confirmée avec succès!

📦 Articles commandés:
• 2x Produit A
• 1x Produit B

💰 Total: 450.00 MAD

Nous vous informerons dès que votre commande sera expédiée.

Merci de votre confiance! 🙏
- Équipe Silea
```

### Status Update
```
Bonjour Ahmed! 👋

✅ Mise à jour de votre commande CMD023

Nouveau statut: Confirmée

Votre commande a été confirmée et sera bientôt traitée.

Merci de votre confiance! 🙏
- Équipe Silea
```

### Shipping Notification
```
Excellente nouvelle Ahmed! 📦

Votre commande CMD023 a été expédiée! 🚚

📍 Numéro de suivi: TRK123456789

Votre colis est en route et sera livré dans les prochains jours.

Merci pour votre patience! 🙏
- Équipe Silea
```

### Delivery Confirmation
```
Bonjour Ahmed! 🎉

Votre commande CMD023 a été livrée avec succès! ✅

Nous espérons que vous apprécierez vos produits!

💬 Votre avis compte beaucoup pour nous.

Merci d'avoir choisi Silea! 🙏
À très bientôt! ✨
```

## Production Setup (WhatsApp Business API)

### For Production Use:
Once you're ready for production, you need to upgrade from sandbox to official WhatsApp Business API:

#### Option 1: Twilio WhatsApp Business Profile (Recommended)
1. In Twilio Console, go to **Messaging** → **Senders** → **WhatsApp senders**
2. Click **Request to enable your Twilio number**
3. Submit your business information:
   - Business name: Silea
   - Business website
   - Business description
   - Business category: E-commerce
4. Approval takes 1-3 business days
5. Once approved, you get your own WhatsApp number!

#### Option 2: Meta WhatsApp Business API (Advanced)
1. Go to https://business.facebook.com
2. Create a Business Manager account
3. Apply for WhatsApp Business API access
4. Connect to Twilio or use Meta's Cloud API
5. Requires business verification
6. Get official green checkmark ✓

### Message Templates for Production
For production, you must create approved message templates:

1. Go to Twilio Console → **Messaging** → **Content Editor**
2. Create templates for:
   - Order confirmation
   - Status updates
   - Shipping notifications
   - Delivery confirmations
3. Submit for WhatsApp approval (takes 24-48 hours)
4. Update backend to use approved template IDs

## Phone Number Formatting

The system automatically formats Moroccan phone numbers:
- Input: `0612345678` → Output: `whatsapp:+212612345678`
- Input: `+212612345678` → Output: `whatsapp:+212612345678`
- Input: `212612345678` → Output: `whatsapp:+212612345678`

For international numbers, include country code with +.

## Cost & Pricing

### Sandbox (Free for Testing)
- $15 FREE credit when you sign up
- ~1500-3000 test messages
- Perfect for development

### Production Pricing
- **Conversation-based pricing**: ~$0.005-0.01 per conversation
- **Business-initiated**: $0.006 per conversation
- **User-initiated**: $0.003 per conversation
- Very affordable! 1000 notifications = ~$5-10

**Example monthly cost for 100 orders:**
- 100 order confirmations
- 200 status updates (2 per order average)
- Total: ~$1.50-3.00/month

## Troubleshooting

### Issue: Messages not sending
**Solution:**
1. Check Twilio credentials in `application.yml`
2. Verify customer phone number is connected to sandbox
3. Check backend logs for errors
4. Test with your own WhatsApp number first

### Issue: "Phone number not verified"
**Solution:**
1. Customer must send `join <code>` to Twilio WhatsApp number
2. In production, this step is not needed

### Issue: "Authentication failed"
**Solution:**
1. Verify Account SID and Auth Token are correct
2. Check for extra spaces in configuration
3. Regenerate Auth Token if needed

### Issue: Customer not receiving messages
**Solution:**
1. Verify phone number format (+212...)
2. Check customer has WhatsApp installed
3. Check Twilio message logs in console
4. Verify WhatsApp sandbox is active

## Advanced Features

### Custom Messages
You can customize message templates in `WhatsAppMessageTemplates.java`:

```java
public String getOrderConfirmationMessage(String customerName, ...) {
    return String.format(
        "Your custom message template here\n" +
        "Order: %s\n" +
        "...",
        orderNumber
    );
}
```

### Disable WhatsApp Temporarily
Set in `application.yml`:
```yaml
whatsapp:
  enabled: false
```

### Add Media Messages
Twilio supports sending images, documents, and location:

```java
Message message = Message.creator(
    new PhoneNumber(toPhoneNumber),
    new PhoneNumber(whatsAppConfig.getFromNumber()),
    messageBody
)
.setMediaUrl(List.of(URI.create("https://yoursite.com/invoice.pdf")))
.create();
```

## Monitoring & Logs

### Check Backend Logs
```bash
# Order confirmation sent
INFO: Sending WhatsApp confirmation for order: CMD023

# Status update sent
INFO: Status update sent via WhatsApp for order: CMD023 - Status: CONFIRMED

# Errors
ERROR: Failed to send WhatsApp message to whatsapp:+212612345678: ...
```

### Check Twilio Console
1. Go to **Monitor** → **Logs** → **WhatsApp**
2. See all sent messages, delivery status, and errors
3. Filter by date, status, phone number

## Security Best Practices

1. **Never commit credentials to git**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Rotate Auth Token regularly**
   - Change every 90 days
   - Immediately if compromised

3. **Validate phone numbers**
   - System automatically validates format
   - Rejects invalid numbers

4. **Rate limiting**
   - Twilio has automatic rate limits
   - Don't spam customers

## Support & Resources

- **Twilio Documentation**: https://www.twilio.com/docs/whatsapp
- **Twilio Console**: https://console.twilio.com
- **WhatsApp Business API**: https://business.whatsapp.com
- **Message Templates**: https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates

## Next Steps After Testing

1. ✅ Test with sandbox (FREE)
2. ⏳ Get business approval
3. ⏳ Create message templates
4. ⏳ Get WhatsApp Business number
5. ⏳ Deploy to production
6. ⏳ Monitor and optimize

---

**Congratulations!** 🎉 Your WhatsApp integration is ready. Customers will now receive automatic notifications for their orders, improving communication and customer satisfaction!
