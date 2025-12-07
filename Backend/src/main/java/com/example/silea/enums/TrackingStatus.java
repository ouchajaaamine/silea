package com.example.silea.enums;

public enum TrackingStatus {
    ORDER_PLACED,
    CONFIRMED,
    PROCESSING,
    PACKED,
    SHIPPED,
    IN_TRANSIT,
    OUT_FOR_DELIVERY,
    DELIVERED,
    DELIVERY_ATTEMPTED,
    CANCELLED,
    RETURNED;
    
    /**
     * Get display name for customer
     */
    public String getDisplayName() {
        switch (this) {
            case ORDER_PLACED: return "Order Placed";
            case CONFIRMED: return "Order Confirmed";
            case PROCESSING: return "Processing";
            case PACKED: return "Packed";
            case SHIPPED: return "Shipped";
            case IN_TRANSIT: return "In Transit";
            case OUT_FOR_DELIVERY: return "Out for Delivery";
            case DELIVERED: return "Delivered";
            case DELIVERY_ATTEMPTED: return "Delivery Attempted";
            case CANCELLED: return "Cancelled";
            case RETURNED: return "Returned";
            default: return this.name();
        }
    }
    
    /**
     * Get Arabic display name
     */
    public String getDisplayNameAr() {
        switch (this) {
            case ORDER_PLACED: return "تم تقديم الطلب";
            case CONFIRMED: return "تم تأكيد الطلب";
            case PROCESSING: return "قيد المعالجة";
            case PACKED: return "تم التغليف";
            case SHIPPED: return "تم الشحن";
            case IN_TRANSIT: return "في الطريق";
            case OUT_FOR_DELIVERY: return "خارج للتوصيل";
            case DELIVERED: return "تم التسليم";
            case DELIVERY_ATTEMPTED: return "محاولة تسليم";
            case CANCELLED: return "ملغى";
            case RETURNED: return "مرتجع";
            default: return this.name();
        }
    }
}