package com.example.silea.enums;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    REFUNDED;
    
    /**
     * Check if this status allows cancellation
     */
    public boolean isCancellable() {
        return this == PENDING || this == CONFIRMED || this == PROCESSING;
    }
    
    /**
     * Check if this is a final status (no more transitions)
     */
    public boolean isFinal() {
        return this == DELIVERED || this == CANCELLED || this == REFUNDED;
    }
    
    /**
     * Check if the order is actively being processed
     */
    public boolean isActive() {
        return this == PENDING || this == CONFIRMED || this == PROCESSING || 
               this == SHIPPED || this == OUT_FOR_DELIVERY;
    }
}