package com.example.barakahstore.service;

import com.example.barakahstore.entity.*;
import com.example.barakahstore.enums.OrderStatus;
import com.example.barakahstore.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Create a new order
     */
    public Order createOrder(Customer customer, List<OrderItem> items, String shippingAddress,
                           String notes, LocalDateTime estimatedDelivery) {
        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(shippingAddress);
        order.setNotes(notes);
        order.setEstimatedDeliveryDate(estimatedDelivery);

        // Calculate total
        BigDecimal total = items.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotal(total);

        // Set order reference in items
        items.forEach(item -> item.setOrder(order));
        order.setOrderItems(items);

        return orderRepository.save(order);
    }

    /**
     * Update order status
     */
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        order.setStatus(status);
        return orderRepository.save(order);
    }

    /**
     * Find order by ID
     */
    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id);
    }

    /**
     * Find order by order number
     */
    public Optional<Order> findByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    /**
     * Find order by tracking code
     */
    public Optional<Order> findByTrackingCode(String trackingCode) {
        return orderRepository.findByTrackingCode(trackingCode);
    }

    /**
     * Get orders by customer
     */
    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    /**
     * Get orders by status
     */
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    /**
     * Get recent orders
     */
    public List<Order> getRecentOrders(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return orderRepository.findRecentOrders(since);
    }

    /**
     * Get orders with delivery today
     */
    public List<Order> getOrdersWithDeliveryToday() {
        return orderRepository.findOrdersWithDeliveryToday(LocalDateTime.now());
    }

    /**
     * Get overdue orders
     */
    public List<Order> getOverdueOrders() {
        return orderRepository.findOverdueOrders(LocalDateTime.now());
    }

    /**
     * Search orders
     */
    public List<Order> searchOrders(String searchTerm) {
        return orderRepository.searchOrders(searchTerm);
    }

    /**
     * Get orders by date range
     */
    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByOrderDateBetween(startDate, endDate);
    }

    /**
     * Get total revenue in date range
     */
    public BigDecimal getTotalRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.getTotalRevenueBetween(startDate, endDate);
    }

    /**
     * Get high value orders
     */
    public List<Order> getHighValueOrders(BigDecimal threshold) {
        return orderRepository.findHighValueOrders(threshold);
    }

    /**
     * Get order statistics
     */
    public OrderStatistics getOrderStatistics() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long processingOrders = orderRepository.countByStatus(OrderStatus.PROCESSING);
        long shippedOrders = orderRepository.countByStatus(OrderStatus.SHIPPED);
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);

        LocalDateTime monthStart = LocalDateTime.now().minusDays(30);
        LocalDateTime now = LocalDateTime.now();
        BigDecimal monthlyRevenue = orderRepository.getTotalRevenueBetween(monthStart, now);

        return new OrderStatistics(totalOrders, pendingOrders, processingOrders,
                                 shippedOrders, deliveredOrders, monthlyRevenue);
    }

    /**
     * Cancel order (only if not shipped)
     */
    public Order cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("Cannot cancel order that has been shipped or delivered");
        }

        order.setStatus(OrderStatus.PENDING); // Or create a CANCELLED status
        return orderRepository.save(order);
    }

    /**
     * Generate unique order number
     */
    private String generateOrderNumber() {
        // Simple order number generation - in production, use a more robust method
        return "ORD-" + System.currentTimeMillis();
    }

    // DTO class for statistics
    public static class OrderStatistics {
        private final long totalOrders;
        private final long pendingOrders;
        private final long processingOrders;
        private final long shippedOrders;
        private final long deliveredOrders;
        private final BigDecimal monthlyRevenue;

        public OrderStatistics(long totalOrders, long pendingOrders, long processingOrders,
                             long shippedOrders, long deliveredOrders, BigDecimal monthlyRevenue) {
            this.totalOrders = totalOrders;
            this.pendingOrders = pendingOrders;
            this.processingOrders = processingOrders;
            this.shippedOrders = shippedOrders;
            this.deliveredOrders = deliveredOrders;
            this.monthlyRevenue = monthlyRevenue;
        }

        // Getters
        public long getTotalOrders() { return totalOrders; }
        public long getPendingOrders() { return pendingOrders; }
        public long getProcessingOrders() { return processingOrders; }
        public long getShippedOrders() { return shippedOrders; }
        public long getDeliveredOrders() { return deliveredOrders; }
        public BigDecimal getMonthlyRevenue() { return monthlyRevenue; }
    }
}