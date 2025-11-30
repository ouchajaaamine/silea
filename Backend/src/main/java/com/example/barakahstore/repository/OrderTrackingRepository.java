package com.example.barakahstore.repository;

import com.example.barakahstore.entity.OrderTracking;
import com.example.barakahstore.enums.TrackingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderTrackingRepository extends JpaRepository<OrderTracking, Long> {

    // Find tracking records by order
    List<OrderTracking> findByOrderId(Long orderId);

    // Find tracking records by order ordered by timestamp
    List<OrderTracking> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    // Find tracking records by status
    List<OrderTracking> findByStatus(TrackingStatus status);

    // Find tracking records by order and status
    List<OrderTracking> findByOrderIdAndStatus(Long orderId, TrackingStatus status);

    // Find latest tracking record for order
    Optional<OrderTracking> findFirstByOrderIdOrderByCreatedAtDesc(Long orderId);

    // Find tracking records in date range
    List<OrderTracking> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find tracking records by order and date range
    List<OrderTracking> findByOrderIdAndCreatedAtBetween(Long orderId, LocalDateTime startDate, LocalDateTime endDate);

    // Count tracking records by status
    long countByStatus(TrackingStatus status);

    // Count tracking records by order
    long countByOrderId(Long orderId);

    // Find orders with specific tracking status updates
    @Query("SELECT DISTINCT ot.order FROM OrderTracking ot WHERE ot.status = :status")
    List<com.example.barakahstore.entity.Order> findOrdersWithTrackingStatus(@Param("status") TrackingStatus status);

    // Find tracking records with location information
    @Query("SELECT ot FROM OrderTracking ot WHERE ot.location IS NOT NULL AND ot.location != ''")
    List<OrderTracking> findTrackingRecordsWithLocation();

    // Find tracking records by location
    List<OrderTracking> findByLocationContainingIgnoreCase(String location);

    // Find recent tracking updates (last N hours)
    @Query("SELECT ot FROM OrderTracking ot WHERE ot.createdAt >= :since ORDER BY ot.createdAt DESC")
    List<OrderTracking> findRecentTrackingUpdates(@Param("since") LocalDateTime since);

    // Find tracking records that need delivery confirmation
    @Query("SELECT ot FROM OrderTracking ot WHERE ot.status = 'OUT_FOR_DELIVERY' AND ot.createdAt < :cutoff")
    List<OrderTracking> findPendingDeliveryConfirmations(@Param("cutoff") LocalDateTime cutoff);

    // Get tracking statistics by status
    @Query("SELECT ot.status, COUNT(ot) FROM OrderTracking ot GROUP BY ot.status")
    List<Object[]> getTrackingStatisticsByStatus();

    // Find orders with delayed tracking updates
    @Query("SELECT DISTINCT ot.order FROM OrderTracking ot WHERE ot.order.status IN ('PROCESSING', 'SHIPPED') AND ot.createdAt < :threshold")
    List<com.example.barakahstore.entity.Order> findOrdersWithDelayedTracking(@Param("threshold") LocalDateTime threshold);

    // Find tracking records by carrier
    List<OrderTracking> findByCarrierContainingIgnoreCase(String carrier);

    // Get average delivery time for completed orders
    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, o.orderDate, ot.createdAt)) FROM OrderTracking ot JOIN ot.order o WHERE ot.status = 'DELIVERED' AND o.status = 'DELIVERED'")
    Double getAverageDeliveryTime();

    // Find tracking records with notes
    @Query("SELECT ot FROM OrderTracking ot WHERE ot.notes IS NOT NULL AND ot.notes != ''")
    List<OrderTracking> findTrackingRecordsWithNotes();

    // Search tracking records by notes
    List<OrderTracking> findByNotesContainingIgnoreCase(String notes);

    // Find tracking records for orders in specific status
    @Query("SELECT ot FROM OrderTracking ot WHERE ot.order.status = :orderStatus")
    List<OrderTracking> findTrackingByOrderStatus(@Param("orderStatus") com.example.barakahstore.enums.OrderStatus orderStatus);
}