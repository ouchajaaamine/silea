# Sendit.ma Integration Guide

## Overview

This integration connects your Silea e-commerce platform with Sendit.ma delivery tracking service. When customers place orders, deliveries are automatically created in Sendit, and their status is synchronized every 5 minutes via WhatsApp notifications.

## Features

- ✅ Automatic delivery creation in Sendit.ma when orders are placed
- ✅ Automatic status synchronization every 5 minutes
- ✅ WhatsApp notifications for delivery status updates
- ✅ Support for all Sendit delivery statuses
- ✅ Dual tracking codes (Silea internal + Sendit tracking code)
- ✅ Monday.com integration maintained

## Order Status Flow

### Silea Website Statuses
1. **PENDING** → "en attente", "pending", "new"
2. **CONFIRMED** → "confirmé", "confirmed"
3. **PROCESSING** → "en traitement", "processing", "in progress"

### Sendit Delivery Tracking Statuses
4. **PICKUP_REQUESTED** → "ramassage en cours"
5. **PICKED_UP** → "ramassé"
6. **IN_WAREHOUSE** → "entrepôt"
7. **IN_TRANSIT** → "en transit"
8. **OUT_FOR_DELIVERY** → "distribué", "en cours de livraison"
9. **DELIVERED** → "livré"
10. **PARTIALLY_DELIVERED** → "livré partiellement"
11. **UNREACHABLE** → "injoignable"
12. **POSTPONED** → "reporté"
13. **SCHEDULED** → "programmé"
14. **REFUSED** → "refusés"
15. **CANCELLED** → "annulés"

## Configuration

### Environment Variables

Add these to your `application.yml` or set as environment variables:

```yaml
sendit:
  enabled: true
  api-url: https://api.sendit.ma/v1
  public-key: 8515520946c6be2c4ff16cb29849dc80
  private-key: 7zVc1UftuXhsdJ0HPUvYNY3lY7UQZF9D
  sync-interval-minutes: 5  # Sync frequency (default: 5 minutes)
```

### Database Migration

Run the migration script to add Sendit fields to your orders table:

```bash
mysql -u root -p silea_db < sendit-migration.sql
```

Or if using Hibernate auto-update, the fields will be created automatically on application startup.

## How It Works

### 1. Order Creation Flow

```
Customer places order
    ↓
Silea creates order with tracking code (CMD001)
    ↓
Order saved to database
    ↓
Monday.com item created (async)
    ↓
WhatsApp confirmation sent (async)
    ↓
Sendit delivery created (async)
    ↓
Sendit returns tracking code (SND12345)
    ↓
Order updated with Sendit tracking code
    ↓
WhatsApp notification sent with Sendit tracking
```

### 2. Status Synchronization Flow

```
Scheduler runs every 5 minutes
    ↓
Fetch all orders with Sendit tracking (not in final status)
    ↓
For each order:
    ├─ Query Sendit API for delivery status
    ├─ Compare with current order status
    ├─ If status changed:
    │   ├─ Update order status
    │   ├─ Update last_sendit_sync timestamp
    │   └─ Send WhatsApp notification
    └─ If no change:
        └─ Update last_sendit_sync timestamp only
```

## API Endpoints

### Sendit API Integration

The integration uses the following Sendit.ma endpoints:

#### Create Delivery
```http
POST /deliveries
Content-Type: application/json
X-Public-Key: {your-public-key}
X-Private-Key: {your-private-key}

{
  "customer_name": "John Doe",
  "customer_phone": "+212612345678",
  "customer_address": "123 Main St, Apt 4B",
  "customer_city": "Casablanca",
  "order_reference": "CMD001",
  "amount": 450.00,
  "notes": "Fragile - Handle with care"
}
```

#### Get Deliveries
```http
GET /deliveries?page=1&querystring=CMD001
X-Public-Key: {your-public-key}
X-Private-Key: {your-private-key}
```

## Code Structure

### New Files Created

```
Backend/
├── src/main/java/com/example/silea/
│   ├── config/
│   │   └── SenditProperties.java          # Configuration properties
│   ├── dto/sendit/
│   │   ├── SenditCreateDeliveryRequest.java
│   │   ├── SenditDeliveryResponse.java
│   │   └── SenditDeliveriesListResponse.java
│   ├── scheduler/
│   │   └── SenditSyncScheduler.java       # Scheduled sync task
│   └── service/
│       └── SenditService.java             # Sendit API client
└── sendit-migration.sql                   # Database migration
```

### Modified Files

- `Order.java` - Added sendit_tracking_code, sendit_delivery_id, last_sendit_sync fields
- `OrderStatus.java` - Added all Sendit delivery statuses
- `OrderService.java` - Integrated Sendit delivery creation
- `OrderRepository.java` - Added queries for Sendit sync
- `WhatsAppService.java` - Added delivery status update notification
- `WhatsAppMessageTemplates.java` - Added Sendit status messages (Arabic & French)
- `SileaApplication.java` - Enabled scheduling with @EnableScheduling
- `application.yml` - Added Sendit configuration

## WhatsApp Notifications

### Status Update Message Format

Messages are sent in both Arabic and French:

```
🌟 السلام عليكم ورحمة الله وبركاته 🌟

عزيزنا John Doe،

🚚 تحديث توصيل طلبك CMD001

الحالة الجديدة: في الطريق

طلبك في الطريق إليك! سيصلك قريباً إن شاء الله 🚚💨

🔍 رمز التتبع Sendit: SND12345

نحن دائماً في خدمتك! 🙏🌿

━━━━━━━━━━━━━━━━━━━━

🌟 Bonjour John Doe! 🌟

🚚 Mise à jour de livraison CMD001

Nouveau statut: En transit

Votre colis est en route vers vous! 🚚💨

🔍 Code de suivi Sendit: SND12345

Nous sommes toujours à votre service! 🙏🌿
```

## Monitoring and Logs

### Key Log Messages

```
INFO: Creating Sendit delivery for order: CMD001
INFO: Successfully created Sendit delivery. Tracking code: SND12345
INFO: Starting Sendit delivery status sync...
INFO: Found 15 orders to sync with Sendit
INFO: Updated order CMD001 status from IN_TRANSIT to OUT_FOR_DELIVERY
INFO: Sendit sync completed. Success: 15, Errors: 0, Status changes: 3
```

### Error Handling

The integration is designed to be resilient:
- Sendit API errors won't prevent order creation
- Sync errors are logged but don't stop other orders from syncing
- WhatsApp notification failures are logged but don't affect sync
- 500ms delay between API calls to avoid rate limiting

## Configuration Options

### Sync Interval

Change the sync frequency in `application.yml`:

```yaml
sendit:
  sync-interval-minutes: 10  # Sync every 10 minutes instead of 5
```

### Disable Sendit Integration

To temporarily disable Sendit:

```yaml
sendit:
  enabled: false
```

### Custom API URL

For testing or different environments:

```yaml
sendit:
  api-url: https://staging-api.sendit.ma/v1
```

## Testing

### Manual Testing

1. **Create Test Order**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{...order data...}'
```

2. **Check Order Status**
```bash
curl http://localhost:8080/api/orders/CMD001
```

3. **Trigger Manual Sync**
Call the scheduler method directly or wait for the next scheduled run.

### Verify Integration

1. Check logs for Sendit API calls
2. Verify `sendit_tracking_code` is populated in database
3. Check `last_sendit_sync` timestamp updates
4. Monitor WhatsApp notifications

## Troubleshooting

### Issue: Orders not syncing with Sendit

**Solution:**
- Check `sendit.enabled` is `true` in application.yml
- Verify API credentials are correct
- Check logs for API errors
- Ensure scheduler is running (`@EnableScheduling` annotation present)

### Issue: Status not updating

**Solution:**
- Check `findOrdersWithSenditTrackingNotFinal()` query returns orders
- Verify Sendit API is returning valid status
- Check status mapping in `mapSenditStatusToOrderStatus()`
- Look for exceptions in logs

### Issue: WhatsApp notifications not sending

**Solution:**
- Check `whatsapp.enabled` is `true`
- Verify Twilio credentials
- Check phone number formatting
- Review WhatsApp service logs

## Performance Considerations

### Optimization Tips

1. **Sync Interval**: Adjust based on order volume
   - Low volume: 5 minutes
   - High volume: 10-15 minutes

2. **Rate Limiting**: Current implementation includes 500ms delay between API calls

3. **Database Indexes**: Migration script includes indexes for faster queries

4. **Async Processing**: Sendit calls are async and won't block order creation

## Future Enhancements

Potential improvements:
- [ ] Webhook support from Sendit (push instead of pull)
- [ ] Retry mechanism for failed Sendit API calls
- [ ] Admin dashboard for Sendit delivery management
- [ ] Batch API calls for better performance
- [ ] Sendit delivery cost calculation
- [ ] Return/refund handling through Sendit
- [ ] Delivery time predictions

## Support

For issues or questions:
- Check application logs
- Review Sendit.ma API documentation
- Contact Sendit support for API issues
- Raise issues in project repository

## License

MIT License - See project LICENSE file
