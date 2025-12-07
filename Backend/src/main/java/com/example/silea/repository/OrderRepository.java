package com.example.silea.repository;

import com.example.silea.entity.Order;
import com.example.silea.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find order by order number
    Optional<Order> findByOrderNumber(String orderNumber);

    // Find order by tracking code
    Optional<Order> findByTrackingCode(String trackingCode);

    // Find orders by customer
    List<Order> findByCustomerId(Long customerId);

    // Find orders by customer ordered by date (newest first)
    List<Order> findByCustomerIdOrderByOrderDateDesc(Long customerId);

    // Find orders by status
    List<Order> findByStatus(OrderStatus status);

    // Find orders by status ordered by date
    List<Order> findByStatusOrderByOrderDateDesc(OrderStatus status);

    // Find orders in date range
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find orders by customer and status
    List<Order> findByCustomerIdAndStatus(Long customerId, OrderStatus status);

    // Find orders by customer and date range
    List<Order> findByCustomerIdAndOrderDateBetween(Long customerId, LocalDateTime startDate, LocalDateTime endDate);

    // Count orders by status
    long countByStatus(OrderStatus status);

    // Count orders by customer
    long countByCustomerId(Long customerId);

    // Find recent orders (last N days)
    @Query("SELECT o FROM Order o WHERE o.orderDate >= :date ORDER BY o.orderDate DESC")
    List<Order> findRecentOrders(@Param("date") LocalDateTime date);

    // Find orders with estimated delivery today
    @Query("SELECT o FROM Order o WHERE DATE(o.estimatedDeliveryDate) = DATE(:today) AND o.status != 'DELIVERED'")
    List<Order> findOrdersWithDeliveryToday(@Param("today") LocalDateTime today);

    // Find overdue orders (past estimated delivery date)
    @Query("SELECT o FROM Order o WHERE o.estimatedDeliveryDate < :today AND o.status != 'DELIVERED'")
    List<Order> findOverdueOrders(@Param("today") LocalDateTime today);

    // Get total revenue in date range
    @Query("SELECT SUM(o.total) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate AND o.status = 'DELIVERED'")
    BigDecimal getTotalRevenueBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Get total revenue for customer
    @Query("SELECT SUM(o.total) FROM Order o WHERE o.customer.id = :customerId AND o.status = 'DELIVERED'")
    BigDecimal getTotalRevenueByCustomer(@Param("customerId") Long customerId);

    // Find orders with high value
    @Query("SELECT o FROM Order o WHERE o.total >= :threshold ORDER BY o.total DESC")
    List<Order> findHighValueOrders(@Param("threshold") BigDecimal threshold);

    // Search orders by order number or tracking code
    @Query("SELECT o FROM Order o WHERE o.orderNumber LIKE CONCAT('%', :search, '%') OR o.trackingCode LIKE CONCAT('%', :search, '%')")
    List<Order> searchOrders(@Param("search") String search);

    // Find orders by customer name (join with customer)
    @Query("SELECT o FROM Order o JOIN o.customer c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :customerName, '%'))")
    List<Order> findOrdersByCustomerName(@Param("customerName") String customerName);

    // Get order statistics
    @Query("SELECT COUNT(o), SUM(o.total) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    Object[] getOrderStatistics(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Find orders that need tracking updates
    @Query("SELECT o FROM Order o WHERE o.status IN ('PROCESSING', 'SHIPPED') AND o.updatedAt < :date")
    List<Order> findOrdersNeedingTrackingUpdate(@Param("date") LocalDateTime date);
    
    // Find orders by multiple statuses
    List<Order> findByStatusIn(List<OrderStatus> statuses);
    
    // Find orders by status ordered by date (most recent first)
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    
    // Find recent orders
    List<Order> findTop10ByOrderByOrderDateDesc();
    
    // Count orders by customer and status
    long countByCustomerIdAndStatus(Long customerId, OrderStatus status);
    
    // Find orders by shipping address containing
    @Query("SELECT o FROM Order o WHERE LOWER(o.shippingAddress) LIKE LOWER(CONCAT('%', :address, '%'))")
    List<Order> findByShippingAddressContaining(@Param("address") String address);
    
    // Get daily order counts for last N days
    @Query("SELECT DATE(o.orderDate), COUNT(o) FROM Order o WHERE o.orderDate >= :startDate GROUP BY DATE(o.orderDate) ORDER BY DATE(o.orderDate)")
    List<Object[]> getDailyOrderCounts(@Param("startDate") LocalDateTime startDate);
    
    // Get revenue by status
    @Query("SELECT o.status, SUM(o.total) FROM Order o GROUP BY o.status")
    List<Object[]> getRevenueByStatus();
}