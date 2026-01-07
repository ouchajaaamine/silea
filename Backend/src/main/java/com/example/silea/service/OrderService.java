package com.example.silea.service;

import com.example.silea.entity.*;
import com.example.silea.enums.OrderStatus;
import com.example.silea.repository.CustomerRepository;
import com.example.silea.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final MondayService mondayService;
    private final WhatsAppService whatsAppService;
    
    // For generating unique tracking codes
    private static final SecureRandom secureRandom = new SecureRandom();

    public OrderService(OrderRepository orderRepository, CustomerRepository customerRepository,
                       MondayService mondayService, WhatsAppService whatsAppService) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.mondayService = mondayService;
        this.whatsAppService = whatsAppService;
    }

    /**
     * Create a new order with full tracking initialization
     */
    public Order createOrder(Customer customer, List<OrderItem> items, String shippingAddress,
                           String notes, LocalDateTime estimatedDelivery,
                           String shippingCity, BigDecimal shippingCost, BigDecimal subtotal) {
        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderNumber(generateOrderNumber());
        order.setTrackingCode(generateTrackingCode());
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(shippingAddress);
        order.setShippingCity(shippingCity);
        order.setShippingCost(shippingCost);
        order.setSubtotal(subtotal);
        order.setNotes(notes);
        order.setEstimatedDeliveryDate(estimatedDelivery != null ? estimatedDelivery : 
            LocalDateTime.now().plusDays(5)); // Default 5 days delivery

        // Calculate total (subtotal + shipping)
        BigDecimal total = subtotal.add(shippingCost != null ? shippingCost : BigDecimal.ZERO);
        order.setTotal(total);

        // Set order reference in items
        items.forEach(item -> item.setOrder(order));
        order.setOrderItems(items);

        Order savedOrder = orderRepository.save(order);
        
        // Update customer statistics
        updateCustomerOrderStats(customer, total);
        
        // Create item in Monday.com (async, won't fail order if Monday.com is down)
        try {
            logger.info("Creating Monday.com item for order: {}", savedOrder.getOrderNumber());
            String mondayItemId = mondayService.createOrderItem(savedOrder);
            if (mondayItemId != null) {
                logger.info("Successfully created Monday.com item {} for order {}", 
                    mondayItemId, savedOrder.getOrderNumber());
                // Optionally store mondayItemId in order entity if you add that field
            } else {
                logger.warn("Monday.com item creation returned null for order {}", 
                    savedOrder.getOrderNumber());
            }
        } catch (Exception e) {
            // Log error but don't fail the order
            logger.error("Failed to create Monday.com item for order {}: {}", 
                savedOrder.getOrderNumber(), e.getMessage(), e);
        }
        
        // Send WhatsApp confirmation (async, won't fail order if WhatsApp is down)
        try {
            logger.info("Sending WhatsApp confirmation for order: {}", savedOrder.getOrderNumber());
            whatsAppService.sendOrderConfirmation(savedOrder);
        } catch (Exception e) {
            logger.error("Failed to send WhatsApp confirmation for order {}: {}", 
                savedOrder.getOrderNumber(), e.getMessage());
        }
        
        return savedOrder;
    }
    
    /**
     * Update customer statistics after order creation
     */
    private void updateCustomerOrderStats(Customer customer, BigDecimal orderTotal) {
        customer.setTotalOrders(customer.getTotalOrders() + 1);
        customer.setTotalSpent(customer.getTotalSpent().add(orderTotal));
        customer.setLastOrderDate(LocalDateTime.now());
        customerRepository.save(customer);
    }

    /**
     * Update order status with validation
     */
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Validate status transition
        validateStatusTransition(order.getStatus(), status);
        
        OrderStatus previousStatus = order.getStatus();
        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);
        
        // Handle status-specific actions
        handleStatusChange(savedOrder, previousStatus, status);
        
        return savedOrder;
    }
    
    /**
     * Validate that the status transition is allowed
     */
    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus.isFinal() && newStatus != currentStatus) {
            throw new IllegalArgumentException("Cannot change status of a " + currentStatus + " order");
        }
        
        // Allow any transition for admin, but log warning for unusual transitions
        // In production, you might want stricter validation
    }
    
    /**
     * Handle status-specific actions
     */
    private void handleStatusChange(Order order, OrderStatus previousStatus, OrderStatus newStatus) {
        if (newStatus == OrderStatus.CANCELLED && previousStatus != OrderStatus.CANCELLED) {
            // Refund customer stats when order is cancelled
            Customer customer = order.getCustomer();
            customer.setTotalOrders(Math.max(0, customer.getTotalOrders() - 1));
            customer.setTotalSpent(customer.getTotalSpent().subtract(order.getTotal()).max(BigDecimal.ZERO));
            customerRepository.save(customer);
        }
        
        // You can add email notifications here
        // sendOrderStatusEmail(order, newStatus);
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
     * Get all orders with pagination (sorted by most recent first)
     */
    public List<Order> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));
        return orderRepository.findAll(pageable).getContent();
    }
    
    /**
     * Get order by ID with items (for detailed view)
     */
    public Order getOrderWithItems(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }
    
    /**
     * Get orders count
     */
    public long getTotalOrdersCount() {
        return orderRepository.count();
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
        long confirmedOrders = orderRepository.countByStatus(OrderStatus.CONFIRMED);
        long processingOrders = orderRepository.countByStatus(OrderStatus.PROCESSING);
        long shippedOrders = orderRepository.countByStatus(OrderStatus.SHIPPED);
        long outForDeliveryOrders = orderRepository.countByStatus(OrderStatus.OUT_FOR_DELIVERY);
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);
        long refundedOrders = orderRepository.countByStatus(OrderStatus.REFUNDED);

        LocalDateTime monthStart = LocalDateTime.now().minusDays(30);
        LocalDateTime now = LocalDateTime.now();
        BigDecimal monthlyRevenue = orderRepository.getTotalRevenueBetween(monthStart, now);
        if (monthlyRevenue == null) {
            monthlyRevenue = BigDecimal.ZERO;
        }
        
        // Calculate today's orders
        LocalDateTime todayStart = LocalDateTime.now().toLocalDate().atStartOfDay();
        long todaysOrders = orderRepository.findByOrderDateBetween(todayStart, now).size();

        return new OrderStatistics(totalOrders, pendingOrders, confirmedOrders, processingOrders,
                                 shippedOrders, outForDeliveryOrders, deliveredOrders, 
                                 cancelledOrders, refundedOrders, monthlyRevenue, todaysOrders);
    }

    /**
     * Cancel order (only if not shipped/delivered)
     */
    public Order cancelOrder(Long orderId, String cancellationReason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getStatus().isCancellable()) {
            throw new IllegalArgumentException("Cannot cancel order with status: " + order.getStatus() + 
                ". Only PENDING, CONFIRMED, or PROCESSING orders can be cancelled.");
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.CANCELLED);
        
        // Add cancellation reason to notes
        String existingNotes = order.getNotes() != null ? order.getNotes() + "\n" : "";
        order.setNotes(existingNotes + "[CANCELLED] Reason: " + 
            (cancellationReason != null ? cancellationReason : "Customer request"));
        
        Order savedOrder = orderRepository.save(order);
        
        // Update customer stats
        handleStatusChange(savedOrder, previousStatus, OrderStatus.CANCELLED);
        
        return savedOrder;
    }
    
    /**
     * Cancel order without reason (backward compatibility)
     */
    public Order cancelOrder(Long orderId) {
        return cancelOrder(orderId, "No reason provided");
    }

    /**
     * Generate unique order number (format: CMD001, CMD002, etc.)
     */
    private String generateOrderNumber() {
        // Get count of existing orders to generate sequential number
        long count = orderRepository.count() + 1;
        return String.format("CMD%03d", count);
    }
    
    /**
     * Generate unique tracking code for customers
     */
    private String generateTrackingCode() {
        // Format: SL-YYMMDD-XXXX where XXXX is random alphanumeric
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String randomPart = generateRandomAlphanumeric(4);
        return "SL-" + datePart + "-" + randomPart;
    }
    
    /**
     * Generate random alphanumeric string
     */
    private String generateRandomAlphanumeric(int length) {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars like 0,O,1,I
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < length; i++) {
            result.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        return result.toString();
    }

    /**
     * Find order by tracking code
     */
    public Optional<Order> findByTrackingCodePublic(String trackingCode) {
        return orderRepository.findByTrackingCode(trackingCode);
    }
    
    /**
     * Get recent orders for dashboard
     */
    public List<Order> getRecentOrdersForDashboard(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "orderDate"));
        return orderRepository.findAll(pageable).getContent();
    }
    
    /**
     * Confirm an order (move from PENDING to CONFIRMED)
     */
    public Order confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING orders can be confirmed");
        }
        
        order.setStatus(OrderStatus.CONFIRMED);
        return orderRepository.save(order);
    }
    
    /**
     * Update order shipping address
     */
    public Order updateShippingAddress(Long orderId, String newAddress) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        if (order.getStatus().isFinal() || order.getStatus() == OrderStatus.SHIPPED || 
            order.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
            throw new IllegalArgumentException("Cannot update address for orders that have been shipped or completed");
        }
        
        order.setShippingAddress(newAddress);
        return orderRepository.save(order);
    }
    
    /**
     * Update order notes
     */
    public Order updateOrderNotes(Long orderId, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        order.setNotes(notes);
        return orderRepository.save(order);
    }
    
    /**
     * Get orders by multiple statuses
     */
    public List<Order> getOrdersByStatuses(List<OrderStatus> statuses) {
        return orderRepository.findByStatusIn(statuses);
    }

    // DTO class for statistics
    public static class OrderStatistics {
        private final long totalOrders;
        private final long pendingOrders;
        private final long confirmedOrders;
        private final long processingOrders;
        private final long shippedOrders;
        private final long outForDeliveryOrders;
        private final long deliveredOrders;
        private final long cancelledOrders;
        private final long refundedOrders;
        private final BigDecimal monthlyRevenue;
        private final long todaysOrders;

        public OrderStatistics(long totalOrders, long pendingOrders, long confirmedOrders,
                             long processingOrders, long shippedOrders, long outForDeliveryOrders,
                             long deliveredOrders, long cancelledOrders, long refundedOrders,
                             BigDecimal monthlyRevenue, long todaysOrders) {
            this.totalOrders = totalOrders;
            this.pendingOrders = pendingOrders;
            this.confirmedOrders = confirmedOrders;
            this.processingOrders = processingOrders;
            this.shippedOrders = shippedOrders;
            this.outForDeliveryOrders = outForDeliveryOrders;
            this.deliveredOrders = deliveredOrders;
            this.cancelledOrders = cancelledOrders;
            this.refundedOrders = refundedOrders;
            this.monthlyRevenue = monthlyRevenue;
            this.todaysOrders = todaysOrders;
        }

        // Getters
        public long getTotalOrders() { return totalOrders; }
        public long getPendingOrders() { return pendingOrders; }
        public long getConfirmedOrders() { return confirmedOrders; }
        public long getProcessingOrders() { return processingOrders; }
        public long getShippedOrders() { return shippedOrders; }
        public long getOutForDeliveryOrders() { return outForDeliveryOrders; }
        public long getDeliveredOrders() { return deliveredOrders; }
        public long getCancelledOrders() { return cancelledOrders; }
        public long getRefundedOrders() { return refundedOrders; }
        public BigDecimal getMonthlyRevenue() { return monthlyRevenue; }
        public long getTodaysOrders() { return todaysOrders; }
        
        // Calculated getters
        public long getActiveOrders() { 
            return pendingOrders + confirmedOrders + processingOrders + shippedOrders + outForDeliveryOrders; 
        }
        public double getCompletionRate() {
            if (totalOrders == 0) return 0;
            return (double) deliveredOrders / totalOrders * 100;
        }
        public double getCancellationRate() {
            if (totalOrders == 0) return 0;
            return (double) cancelledOrders / totalOrders * 100;
        }
    }
}