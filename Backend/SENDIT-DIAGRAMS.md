# Sendit.ma Integration - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Silea E-Commerce                          │
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Frontend   │─────▶│   Backend    │─────▶│   Database   │  │
│  │  (Next.js)   │      │  (Spring)    │      │   (MySQL)    │  │
│  └──────────────┘      └──────┬───────┘      └──────────────┘  │
│                                │                                 │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
          ┌────────────┐  ┌────────────┐  ┌────────────┐
          │  Monday.com│  │ Sendit.ma  │  │  WhatsApp  │
          │    API     │  │    API     │  │   (Twilio) │
          └────────────┘  └────────────┘  └────────────┘
```

## Order Creation Flow

```
Customer                Frontend              Backend                 Sendit.ma           WhatsApp
   │                       │                     │                        │                  │
   │  1. Place Order       │                     │                        │                  │
   ├──────────────────────▶│                     │                        │                  │
   │                       │  2. Submit Order    │                        │                  │
   │                       ├────────────────────▶│                        │                  │
   │                       │                     │  3. Create Order       │                  │
   │                       │                     │     (CMD001)           │                  │
   │                       │                     │────┐                   │                  │
   │                       │                     │    │ Save to DB        │                  │
   │                       │                     │◀───┘                   │                  │
   │                       │                     │                        │                  │
   │                       │                     │  4. Create Monday Item │                  │
   │                       │                     ├──────────────▶         │                  │
   │                       │                     │                        │                  │
   │                       │                     │  5. Create Delivery    │                  │
   │                       │                     ├───────────────────────▶│                  │
   │                       │                     │                        │  (SND12345)      │
   │                       │                     │◀───────────────────────┤                  │
   │                       │                     │                        │                  │
   │                       │                     │  6. Update Order       │                  │
   │                       │                     │     with Sendit Code   │                  │
   │                       │                     │────┐                   │                  │
   │                       │                     │◀───┘                   │                  │
   │                       │                     │                        │                  │
   │                       │                     │  7. Send Confirmation  │                  │
   │                       │                     ├─────────────────────────────────────────▶│
   │                       │                     │                        │                  │
   │  8. Confirmation      │                     │                        │                  │
   │◀──────────────────────┤                     │                        │                  │
   │     (CMD001 +         │                     │                        │                  │
   │      SND12345)        │                     │                        │                  │
```

## Status Sync Flow (Every 5 Minutes)

```
Scheduler              Backend             Sendit.ma           Database           WhatsApp
   │                      │                     │                   │                 │
   │  Every 5 minutes     │                     │                   │                 │
   ├─────────────────────▶│                     │                   │                 │
   │                      │  1. Find Orders     │                   │                 │
   │                      │     with Sendit     │                   │                 │
   │                      ├────────────────────▶│                   │                 │
   │                      │                     │                   │                 │
   │                      │  2. Get Orders      │                   │                 │
   │                      │     [CMD001, CMD002]│                   │                 │
   │                      │◀────────────────────┤                   │                 │
   │                      │                     │                   │                 │
   │  For each order:     │                     │                   │                 │
   │                      │                     │                   │                 │
   │                      │  3. Query Status    │                   │                 │
   │                      ├────────────────────▶│                   │                 │
   │                      │                     │  (SND12345 →      │                 │
   │                      │◀────────────────────┤   OUT_FOR_DELIVERY)│                │
   │                      │                     │                   │                 │
   │                      │  4. Compare Status  │                   │                 │
   │                      │     IN_TRANSIT →    │                   │                 │
   │                      │     OUT_FOR_DELIVERY│                   │                 │
   │                      │────┐                │                   │                 │
   │                      │    │ Status Changed!│                   │                 │
   │                      │◀───┘                │                   │                 │
   │                      │                     │                   │                 │
   │                      │  5. Update Order    │                   │                 │
   │                      ├─────────────────────────────────────────▶│                 │
   │                      │                     │                   │                 │
   │                      │  6. Send Notification                   │                 │
   │                      ├────────────────────────────────────────────────────────────▶│
   │                      │                     │                   │                 │
   │  7. Log Results      │                     │                   │                 │
   │◀─────────────────────┤                     │                   │                 │
   │  (Success: 2,        │                     │                   │                 │
   │   Changes: 1)        │                     │                   │                 │
```

## Status Lifecycle

```
┌────────────────────────────────────────────────────────────────────┐
│                        Order Lifecycle                              │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Silea Statuses │
└─────────────────┘
        │
        ▼
   PENDING ────▶ Order created, awaiting confirmation
        │
        ▼
  CONFIRMED ───▶ Order confirmed, ready for processing
        │
        ▼
  PROCESSING ──▶ Preparing order for shipment
        │
        │        ┌──────────────────────────────────┐
        └───────▶│  Sendit Integration Starts Here  │
                 └──────────────────────────────────┘
                                │
                                ▼
                        PICKUP_REQUESTED
                                │
                                ▼
                          PICKED_UP ───▶ Driver collected package
                                │
                                ▼
                         IN_WAREHOUSE ▶ Package at Sendit warehouse
                                │
                                ▼
                          IN_TRANSIT ──▶ Package on the way
                                │
                                ▼
                      OUT_FOR_DELIVERY ▶ Driver delivering now
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
          DELIVERED      PARTIALLY_      UNREACHABLE
                         DELIVERED            │
                                              ▼
                                         POSTPONED
                                              │
                                              ▼
                                         SCHEDULED
                                              │
                        ┌─────────────────────┼──────────┐
                        │                     │          │
                        ▼                     ▼          ▼
                    REFUSED              CANCELLED   Back to
                                                    OUT_FOR_DELIVERY
```

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                          Database Schema                        │
├────────────────────────────────────────────────────────────────┤
│  orders                                                         │
│  ├── id (PK)                                                    │
│  ├── order_number         ────▶  "CMD001" (Silea code)         │
│  ├── tracking_code        ────▶  "TRK12345" (Customer tracking)│
│  ├── sendit_tracking_code ────▶  "SND12345" (Sendit code) ◀┐   │
│  ├── sendit_delivery_id   ────▶  "DEL789" (Sendit ID)      │   │
│  ├── last_sendit_sync     ────▶  "2026-01-19 10:05:00"     │   │
│  ├── status              ────▶  "OUT_FOR_DELIVERY"         │   │
│  ├── customer_id                                            │   │
│  ├── total                                                  │   │
│  └── ...                                                    │   │
└─────────────────────────────────────────────────────────────┼───┘
                                                              │
                        Synced every 5 minutes                │
                                                              │
┌─────────────────────────────────────────────────────────────┼───┐
│                        Sendit.ma API                        │   │
├─────────────────────────────────────────────────────────────┼───┤
│  GET /deliveries?querystring=SND12345                       │   │
│                                                             │   │
│  Response:                                                  │   │
│  {                                                          │   │
│    "tracking_code": "SND12345", ───────────────────────────┘   │
│    "status": "en cours de livraison",                          │
│    "customer_name": "Ahmed Hassan",                            │
│    "order_reference": "CMD001"                                 │
│  }                                                             │
└────────────────────────────────────────────────────────────────┘
```

## Component Interaction

```
┌───────────────────────────────────────────────────────────────────┐
│                      Spring Boot Components                        │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────┐                                             │
│  │ OrderController  │  ◀── REST API endpoints                     │
│  └────────┬─────────┘                                             │
│           │                                                        │
│           ▼                                                        │
│  ┌──────────────────┐       ┌──────────────────┐                 │
│  │  OrderService    │──────▶│  SenditService   │                 │
│  └────────┬─────────┘       └────────┬─────────┘                 │
│           │                           │                            │
│           │                           │  Create Delivery           │
│           │                           │  Get Status                │
│           │                           │  Map Status                │
│           │                           │                            │
│           ▼                           ▼                            │
│  ┌──────────────────┐       ┌──────────────────┐                 │
│  │OrderRepository   │       │ RestTemplate     │                 │
│  └──────────────────┘       └──────────────────┘                 │
│           │                           │                            │
│           ▼                           ▼                            │
│     MySQL Database              Sendit.ma API                     │
│                                                                    │
│                    ┌──────────────────────┐                       │
│                    │SenditSyncScheduler   │                       │
│                    │ @Scheduled(...)      │                       │
│                    └──────────┬───────────┘                       │
│                               │                                    │
│                    Runs every 5 minutes                           │
│                               │                                    │
│           ┌───────────────────┼────────────────┐                  │
│           ▼                   ▼                ▼                  │
│  ┌──────────────┐   ┌──────────────┐  ┌──────────────┐          │
│  │OrderService  │   │SenditService │  │WhatsAppService│          │
│  └──────────────┘   └──────────────┘  └──────────────┘          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Notification Flow

```
Status Change Event
        │
        ▼
┌───────────────────┐
│ Status detected   │
│ by sync scheduler │
└────────┬──────────┘
         │
         ▼
┌───────────────────────────────┐
│ Order status updated in DB    │
│ PROCESSING → PICKED_UP         │
└────────┬──────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ WhatsAppService.               │
│ sendDeliveryStatusUpdate()     │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ WhatsAppMessageTemplates       │
│ getDeliveryStatusUpdateMessage│
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Generate bilingual message:    │
│ - Arabic status + description  │
│ - French status + description  │
│ - Both tracking codes          │
│ - Emojis for visual appeal     │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Twilio API sends WhatsApp msg  │
└────────┬───────────────────────┘
         │
         ▼
    Customer's Phone
```

## Error Handling Flow

```
┌────────────────────┐
│  Order Creation    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Try create Sendit  │
│ delivery           │
└────────┬───────────┘
         │
    ┌────┴────┐
    │         │
Success      Failure
    │         │
    ▼         ▼
┌──────┐  ┌──────────────────┐
│Store │  │ Log error        │
│code  │  │ DON'T fail order │
└──────┘  │ Retry next sync  │
          └──────────────────┘
               │
               ▼
          Order still
          created ✓
          
          
┌────────────────────┐
│  Sync Scheduler    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ For each order:    │
│ Try get status     │
└────────┬───────────┘
         │
    ┌────┴────┐
    │         │
Success      Failure
    │         │
    ▼         ▼
┌──────┐  ┌──────────────────┐
│Update│  │ Log error        │
│status│  │ Continue to next │
└──────┘  │ Retry in 5 min   │
          └──────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Production Server                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐          ┌────────────────┐            │
│  │   Nginx        │          │   Spring Boot  │            │
│  │   (Port 80)    │─────────▶│   (Port 8080)  │            │
│  └────────────────┘          └────────┬───────┘            │
│                                        │                     │
│                              ┌─────────┴─────────┐          │
│                              │                   │          │
│                              ▼                   ▼          │
│                     ┌────────────────┐  ┌──────────────┐   │
│                     │  MySQL DB      │  │  Scheduler   │   │
│                     │  (Port 3306)   │  │  (5 min)     │   │
│                     └────────────────┘  └──────────────┘   │
│                                                              │
└──────────────────────┬──────────────────┬────────────────────┘
                       │                  │
              External │ APIs             │ External APIs
                       │                  │
            ┌──────────┴──────────┐  ┌────┴────────────┐
            │   Sendit.ma API     │  │  Monday.com     │
            │   api.sendit.ma     │  │  WhatsApp       │
            └─────────────────────┘  └─────────────────┘
```

## Legend

```
───▶  Data Flow
────  Component Connection
┌──┐  Component/Service
│  │  
└──┘  
```

---

**Pro Tips:**
- Async operations prevent blocking
- Errors are logged but don't fail orders
- Scheduler is resilient to failures
- WhatsApp notifications are optional
- All external APIs are isolated
- Database indexes optimize performance

