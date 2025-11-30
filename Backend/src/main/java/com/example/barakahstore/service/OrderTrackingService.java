package com.example.barakahstore.service;

import com.example.barakahstore.entity.Order;
import com.example.barakahstore.entity.OrderTracking;
import com.example.barakahstore.enums.OrderStatus;
import com.example.barakahstore.enums.TrackingStatus;
import com.example.barakahstore.repository.OrderTrackingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderTrackingService {

    private final OrderTrackingRepository orderTrackingRepository;

    public OrderTrackingService(OrderTrackingRepository orderTrackingRepository) {
        this.orderTrackingRepository = orderTrackingRepository;
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
     * Update order status based on tracking
     */
    public void updateOrderStatusFromTracking(Order order, TrackingStatus trackingStatus) {
        OrderStatus newOrderStatus = mapTrackingToOrderStatus(trackingStatus);
        if (newOrderStatus != null && order.getStatus() != newOrderStatus) {
            order.setStatus(newOrderStatus);
            // Note: This would need OrderService or OrderRepository to save the order
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
            case CONFIRMED:
                return OrderStatus.PROCESSING;
            case PROCESSING:
                return OrderStatus.PROCESSING;
            case SHIPPED:
                return OrderStatus.SHIPPED;
            case OUT_FOR_DELIVERY:
                return OrderStatus.SHIPPED;
            case DELIVERED:
                return OrderStatus.DELIVERED;
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