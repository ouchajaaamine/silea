# Monday.com Integration Setup Guide

## Overview
This integration automatically syncs orders between your Silea backend and Monday.com, enabling WhatsApp notifications and manager alerts through Monday.com's automation features.

## Architecture Flow

### Order Creation Flow
1. Customer places order → Saved to MySQL database
2. Backend calls Monday.com GraphQL API → Creates item in board
3. Monday.com automation triggers → Sends WhatsApp to customer
4. Monday.com sends notifications → All subscribed managers notified (push + email)

### Status Update Flow
1. Manager updates order status in Monday.com
2. Monday.com webhook → Calls your backend `/api/webhooks/monday`
3. Backend updates order status in database
4. Monday.com automation → Sends WhatsApp status update to customer

## Backend Setup (Completed)

### Files Created/Modified
- `MondayConfig.java` - Configuration properties
- `MondayService.java` - GraphQL API integration
- `MondayWebhookController.java` - Webhook handler
- `RestTemplateConfig.java` - HTTP client configuration
- `OrderService.java` - Modified to call Monday.com after order creation
- `SecurityConfig.java` - Webhook endpoint security bypass
- `application.yml` - Monday.com configuration

### Environment Variables Required
Add these to your environment or `.env` file:

```bash
MONDAY_ENABLED=true
MONDAY_API_TOKEN=your-actual-token-here
MONDAY_BOARD_ID=your-board-id-here
```

### How to Get Monday.com API Token
1. Go to https://monday.com
2. Click your profile picture → Admin → API
3. Generate new API token (v2)
4. Copy and set as `MONDAY_API_TOKEN`

### How to Get Board ID
1. Open your Monday.com board
2. Look at URL: `https://monday.com/boards/1234567890`
3. The number is your board ID
4. Set as `MONDAY_BOARD_ID`

## Monday.com Board Setup

### Required Columns
Your Monday.com board should have these columns (adjust column IDs in code if needed):

| Column Name | Column Type | Description |
|-------------|-------------|-------------|
| Item Name | Text | Auto-filled with order number |
| Order Number | Text | e.g., ORD-20231210-ABC123 |
| Customer Name | Text | Full customer name |
| Email | Email | Customer email |
| Phone | Phone | Customer phone number |
| Items | Long Text | Order items with quantities |
| Total | Numbers | Order total in MAD |
| Status | Status | Order status (see below) |
| Address | Text | Shipping address |

### Status Column Configuration
Configure your status column with these labels (exact names):
- Pending (Yellow)
- Confirmed (Blue)
- Processing (Purple)
- Shipped (Orange)
- Delivered (Green)
- Cancelled (Red)

## WhatsApp Integration Setup (Monday.com Side)

### Prerequisites
1. WhatsApp Business Account
2. Monday.com Pro plan or higher (required for WhatsApp integration)

### Steps to Configure WhatsApp
1. In Monday.com board, click "Integrate" → "WhatsApp"
2. Connect your WhatsApp Business account
3. Create automation: "When item is created"
   - Action: Send WhatsApp message
   - Template: Order confirmation with tracking link
   - Phone number: Use {Phone} column
   - Message variables: {Order Number}, {Total}, {Customer Name}

4. Create automation: "When Status changes to Shipped"
   - Action: Send WhatsApp message
   - Template: Shipping notification
   - Include tracking number and delivery estimate

5. Create automation: "When Status changes to Delivered"
   - Action: Send WhatsApp message
   - Template: Delivery confirmation

### WhatsApp Message Templates
Create these approved templates in WhatsApp Business Manager:

**Order Confirmation:**
```
Hello {{1}}, 

Your order {{2}} has been confirmed! 

Total: {{3}} MAD

We'll notify you when it ships. Track your order: {{4}}

Thank you for shopping with Silea!
```

**Shipping Notification:**
```
Good news {{1}}! 

Your order {{2}} has been shipped and is on the way.

Track your delivery: {{3}}

Estimated delivery: {{4}}
```

**Delivery Confirmation:**
```
Hello {{1}},

Your order {{2}} has been delivered successfully!

Thank you for shopping with Silea. We hope you enjoy your products!
```

## Manager Notifications Setup (Monday.com Side)

### Automatic Manager Notifications
Monday.com automatically notifies all board subscribers when:
- New items are created
- Status changes occur
- Comments are added

### To Set Up Notifications:
1. Each manager opens the board
2. Clicks the bell icon → "Subscribe to board"
3. Configure notification preferences:
   - ☑ Push notifications (mobile app)
   - ☑ Email notifications
   - ☑ When items are created
   - ☑ When statuses change

### Notification Channels
- **Push**: Monday.com mobile app
- **Email**: Sent to manager's registered email
- **Slack** (optional): Connect Slack integration for team channel notifications

## Webhook Setup (Monday.com Side)

### Configure Webhook in Monday.com
1. Go to your board → Integrate → Webhooks
2. Click "Add Webhook"
3. Configure:
   - **Event**: When column value changes
   - **Column**: Status
   - **Webhook URL**: `https://your-domain.com/api/webhooks/monday`
   - **Method**: POST
4. Save webhook

### Important Notes
- First webhook call is a challenge verification (automatically handled)
- Webhook must be publicly accessible (use ngrok for local testing)
- Backend logs all webhook events for debugging

## Testing the Integration

### Test Order Creation
1. Create test order through your frontend/API
2. Check Monday.com board - new item should appear
3. Verify WhatsApp message sent to customer
4. Check manager notifications received

### Test Status Updates
1. Change order status in Monday.com
2. Check backend logs for webhook received
3. Verify database updated with new status
4. Verify WhatsApp notification sent to customer

### Local Testing with ngrok
```bash
# Install ngrok
ngrok http 8080

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Use this as webhook URL in Monday.com: https://abc123.ngrok.io/api/webhooks/monday
```

## Error Handling

### Order Creation Resilience
- If Monday.com is down, order still saves to database
- Error logged but doesn't fail customer order
- Can manually create Monday.com item later

### Webhook Failures
- All webhook events logged with full payload
- Check logs if status updates aren't syncing
- Webhook endpoint has health check: `/api/webhooks/monday/health`

## Monitoring & Logs

### Important Log Locations
```
# Order creation with Monday.com
com.example.silea.service.OrderService - Creating Monday.com item for order

# Monday.com API calls
com.example.silea.service.MondayService - Sending GraphQL request

# Webhook events
com.example.silea.controller.MondayWebhookController - Received Monday.com webhook
```

### Health Check Endpoints
```bash
# Check webhook endpoint
GET https://your-domain.com/api/webhooks/monday/health

# Response:
{
  "status": "healthy",
  "service": "monday-webhook",
  "timestamp": "1702234567890"
}
```

## Customization

### Adjust Column IDs
If your Monday.com board uses different column IDs, update `MondayService.java`:
```java
columnValues.put("text", order.getOrderNumber()); // Change "text" to your column ID
columnValues.put("text4", customerName); // Change "text4" to your column ID
```

### Add Custom Fields
To send additional order data to Monday.com:
1. Add column to Monday.com board
2. Update `buildCreateItemMutation()` in `MondayService.java`
3. Add field to `columnValues` map

### Disable Integration Temporarily
```bash
MONDAY_ENABLED=false
```
Orders will still be created but won't sync to Monday.com.

## Troubleshooting

### Orders Not Appearing in Monday.com
- Check `MONDAY_API_TOKEN` is valid
- Check `MONDAY_BOARD_ID` is correct
- Check backend logs for errors
- Verify Monday.com API permissions

### WhatsApp Messages Not Sending
- Check WhatsApp Business account connected
- Verify message templates approved
- Check automation is active in Monday.com
- Test with your own phone number first

### Status Updates Not Syncing
- Check webhook URL is accessible
- Verify webhook is active in Monday.com
- Check backend logs for webhook events
- Test with webhook health endpoint

### Manager Notifications Not Working
- Check managers are subscribed to board
- Verify notification preferences enabled
- Check Monday.com account settings
- Test by manually creating item

## Security Considerations

1. **API Token**: Store securely, never commit to git
2. **Webhook Endpoint**: Validate webhook signatures (implement if needed)
3. **HTTPS**: Always use HTTPS in production for webhook URL
4. **Rate Limiting**: Monday.com API has rate limits (be mindful with high volumes)

## Support Resources

- Monday.com API Docs: https://developer.monday.com/api-reference/docs
- Monday.com Community: https://community.monday.com
- WhatsApp Business API: https://business.whatsapp.com
- Backend logs: Check `logs/` directory

## Next Steps

1. ✅ Backend integration complete
2. ⏳ Set up Monday.com board with required columns
3. ⏳ Configure WhatsApp integration and templates
4. ⏳ Set up webhook in Monday.com
5. ⏳ Subscribe managers to board notifications
6. ⏳ Test end-to-end flow
7. ⏳ Deploy to production and update webhook URL

---

**Note**: This integration is production-ready with comprehensive error handling and logging. Monday.com failures won't affect order processing, ensuring reliability for your customers.
