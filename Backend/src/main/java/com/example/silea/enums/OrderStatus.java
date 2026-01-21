package com.example.silea.enums;

public enum OrderStatus {
    // Silea Website Statuses
    PENDING,              // en attente, pending, new
    CONFIRMED,            // confirmé, confirmed
    PROCESSING,           // en traitement, processing, in progress
    
    // Sendit Delivery Tracking Statuses
    PICKUP_REQUESTED,     // ramassage en cours
    PICKED_UP,            // ramassé
    IN_WAREHOUSE,         // entrepôt
    IN_TRANSIT,           // en transit
    SHIPPED,              // expédié
    OUT_FOR_DELIVERY,     // distribué, en cours de livraison
    DELIVERED,            // livré
    PARTIALLY_DELIVERED,  // livré partiellement
    UNREACHABLE,          // injoignable
    POSTPONED,            // reporté
    SCHEDULED,            // programmé
    REFUSED,              // refusés
    
    // Final Statuses
    CANCELLED,            // annulés
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
        return this == DELIVERED || this == PARTIALLY_DELIVERED || 
               this == CANCELLED || this == REFUNDED || this == REFUSED;
    }
    
    /**
     * Check if the order is actively being processed
     */
    public boolean isActive() {
        return this == PENDING || this == CONFIRMED || this == PROCESSING || 
               this == PICKUP_REQUESTED || this == PICKED_UP || this == IN_WAREHOUSE ||
               this == IN_TRANSIT || this == SHIPPED || this == OUT_FOR_DELIVERY || this == SCHEDULED;
    }
    
    /**
     * Check if this is a Sendit delivery status
     */
    public boolean isSenditStatus() {
        return this == PICKUP_REQUESTED || this == PICKED_UP || this == IN_WAREHOUSE ||
               this == IN_TRANSIT || this == SHIPPED || this == OUT_FOR_DELIVERY || this == DELIVERED ||
               this == PARTIALLY_DELIVERED || this == UNREACHABLE || this == POSTPONED ||
               this == SCHEDULED || this == REFUSED;
    }
}