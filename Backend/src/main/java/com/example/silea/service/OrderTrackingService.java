package com.example.silea.service;

import com.example.silea.entity.Order;
import com.example.silea.entity.OrderTracking;
import com.example.silea.enums.OrderStatus;
import com.example.silea.enums.TrackingStatus;
import com.example.silea.repository.OrderRepository;
import com.example.silea.repository.OrderTrackingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderTrackingService {

    private final OrderTrackingRepository orderTrackingRepository;
    private final OrderRepository orderRepository;

    public OrderTrackingService(OrderTrackingRepository orderTrackingRepository, OrderRepository orderRepository) {
        this.orderTrackingRepository = orderTrackingRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Add tracking update to order
     */
    public OrderTracking addTrackingUpdate(Order order, TrackingStatus status, String location, String notes) {
        OrderTracking tracking = new OrderTracking();
        tracking.setOrder(order);
        tracking.setStatus(status);
        tracking.setLocation(location);
        tracking.setNotes(notes);
        tracking.setStatusDate(LocalDateTime.now());

        return orderTrackingRepository.save(tracking);
    }
    
    /**
     * Add tracking update with carrier information
     */
    public OrderTracking addTrackingUpdateWithCarrier(Order order, TrackingStatus status, 
            String location, String carrier, String notes) {
        OrderTracking tracking = new OrderTracking();
        tracking.setOrder(order);
        tracking.setStatus(status);
        tracking.setLocation(location);
        tracking.setCarrier(carrier);
        tracking.setNotes(notes);
        tracking.setStatusDate(LocalDateTime.now());

        return orderTrackingRepository.save(tracking);
    }

    /**
     * Get tracking history for order
     */
    public List<OrderTracking> getTrackingHistory(Long orderId) {
        return orderTrackingRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }

    /**
     * Get latest tracking update for order
     */
    public Optional<OrderTracking> getLatestTrackingUpdate(Long orderId) {
        return orderTrackingRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId);
    }

    /**
     * Update order status based on tracking (now properly saves the order)
     */
    public void updateOrderStatusFromTracking(Order order, TrackingStatus trackingStatus) {
        OrderStatus newOrderStatus = mapTrackingToOrderStatus(trackingStatus);
        if (newOrderStatus != null && order.getStatus() != newOrderStatus) {
            // Don't downgrade status (e.g., from SHIPPED to PROCESSING)
            if (!shouldUpdateStatus(order.getStatus(), newOrderStatus)) {
                return;
            }
            order.setStatus(newOrderStatus);
            orderRepository.save(order); // Now properly saves the order
        }
    }
    
    /**
     * Check if we should update status (prevent downgrades)
     */
    private boolean shouldUpdateStatus(OrderStatus currentStatus, OrderStatus newStatus) {
        // Define status priority
        int currentPriority = getStatusPriority(currentStatus);
        int newPriority = getStatusPriority(newStatus);
        
        // Only update if new status is higher priority (or same but different - like CANCELLED)
        return newPriority >= currentPriority || newStatus == OrderStatus.CANCELLED;
    }
    
    private int getStatusPriority(OrderStatus status) {
        switch (status) {
            case PENDING: return 1;
            case CONFIRMED: return 2;
            case PROCESSING: return 3;
            case SHIPPED: return 4;
            case OUT_FOR_DELIVERY: return 5;
            case DELIVERED: return 6;
            case CANCELLED: return 0;
            case REFUNDED: return 0;
            default: return 0;
        }
    }

    /**
     * Get tracking records by status
     */
    public List<OrderTracking> getTrackingByStatus(TrackingStatus status) {
        return orderTrackingRepository.findByStatus(status);
    }

    /**
     * Get tracking records with location
     */
    public List<OrderTracking> getTrackingWithLocation() {
        return orderTrackingRepository.findTrackingRecordsWithLocation();
    }

    /**
     * Search tracking by location
     */
    public List<OrderTracking> searchTrackingByLocation(String location) {
        return orderTrackingRepository.findByLocationContainingIgnoreCase(location);
    }

    /**
     * Get recent tracking updates
     */
    public List<OrderTracking> getRecentTrackingUpdates(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return orderTrackingRepository.findRecentTrackingUpdates(since);
    }

    /**
     * Get pending delivery confirmations
     */
    public List<OrderTracking> getPendingDeliveryConfirmations() {
        return orderTrackingRepository.findPendingDeliveryConfirmations(LocalDateTime.now().minusHours(24));
    }

    /**
     * Get tracking statistics
     */
    public TrackingStatistics getTrackingStatistics() {
        List<Object[]> stats = orderTrackingRepository.getTrackingStatisticsByStatus();
        long totalTrackingRecords = orderTrackingRepository.count();
        long recordsWithLocation = orderTrackingRepository.findTrackingRecordsWithLocation().size();

        return new TrackingStatistics(stats, totalTrackingRecords, recordsWithLocation);
    }

    /**
     * Get orders with delayed tracking
     */
    public List<Order> getOrdersWithDelayedTracking(int hoursThreshold) {
        LocalDateTime threshold = LocalDateTime.now().minusHours(hoursThreshold);
        return orderTrackingRepository.findOrdersWithDelayedTracking(threshold);
    }

    /**
     * Search tracking by carrier
     */
    public List<OrderTracking> searchTrackingByCarrier(String carrier) {
        return orderTrackingRepository.findByCarrierContainingIgnoreCase(carrier);
    }

    /**
     * Get tracking records with notes
     */
    public List<OrderTracking> getTrackingWithNotes() {
        return orderTrackingRepository.findTrackingRecordsWithNotes();
    }

    /**
     * Search tracking by notes
     */
    public List<OrderTracking> searchTrackingByNotes(String notes) {
        return orderTrackingRepository.findByNotesContainingIgnoreCase(notes);
    }

    /**
     * Get average delivery time
     */
    public Double getAverageDeliveryTime() {
        return orderTrackingRepository.getAverageDeliveryTime();
    }

    /**
     * Map tracking status to order status
     */
    private OrderStatus mapTrackingToOrderStatus(TrackingStatus trackingStatus) {
        switch (trackingStatus) {
            case ORDER_PLACED:
                return OrderStatus.PENDING;
            case CONFIRMED:
                return OrderStatus.CONFIRMED;
            case PROCESSING:
            case PACKED:
                return OrderStatus.PROCESSING;
            case SHIPPED:
            case IN_TRANSIT:
                return OrderStatus.SHIPPED;
            case OUT_FOR_DELIVERY:
            case DELIVERY_ATTEMPTED:
                return OrderStatus.OUT_FOR_DELIVERY;
            case DELIVERED:
                return OrderStatus.DELIVERED;
            case CANCELLED:
                return OrderStatus.CANCELLED;
            case RETURNED:
                return OrderStatus.REFUNDED;
            default:
                return null;
        }
    }

    // DTO class for statistics
    public static class TrackingStatistics {
        private final List<Object[]> statusStats;
        private final long totalTrackingRecords;
        private final long recordsWithLocation;

        public TrackingStatistics(List<Object[]> statusStats, long totalTrackingRecords, long recordsWithLocation) {
            this.statusStats = statusStats;
            this.totalTrackingRecords = totalTrackingRecords;
            this.recordsWithLocation = recordsWithLocation;
        }

        // Getters
        public List<Object[]> getStatusStats() { return statusStats; }
        public long getTotalTrackingRecords() { return totalTrackingRecords; }
        public long getRecordsWithLocation() { return recordsWithLocation; }
    }
}