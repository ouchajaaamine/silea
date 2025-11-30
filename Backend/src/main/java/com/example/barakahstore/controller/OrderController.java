package com.example.barakahstore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import com.example.barakahstore.entity.*;
import com.example.barakahstore.enums.OrderStatus;
import com.example.barakahstore.service.CustomerService;
import com.example.barakahstore.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;
    private final CustomerService customerService;

    public OrderController(OrderService orderService, CustomerService customerService) {
        this.orderService = orderService;
        this.customerService = customerService;
    }

    /**
     * Create new order (public endpoint for customers)
     */
    @PostMapping
    @Operation(summary = "Create new order", description = "Create a new order for a customer (public endpoint)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order created successfully",
            content = @Content(mediaType = "application/json", example = "{\"success\": true, \"message\": \"Order created successfully\", \"order\": {\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"customer\": {\"id\": 1, \"name\": \"John Doe\", \"email\": \"john.doe@example.com\"}, \"orderItems\": [{\"id\": 1, \"product\": null, \"quantity\": 2, \"unitPrice\": 10.00, \"totalPrice\": 20.00}], \"shippingAddress\": \"123 Main St\", \"orderDate\": \"2023-01-01T10:00:00\", \"estimatedDeliveryDate\": \"2023-01-05T10:00:00\", \"orderStatus\": \"PENDING\", \"totalAmount\": 20.00}} ")),
        @ApiResponse(responseCode = "400", description = "Invalid order data",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error creating order: Invalid customer email\"}")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error creating order: Internal Server Error\"}"))
    })
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            // Find or create customer
            Optional<Customer> existingCustomer = customerService.findByEmail(request.getCustomerEmail());
            Customer customer;

            if (existingCustomer.isPresent()) {
                customer = existingCustomer.get();
            } else {
                customer = customerService.createCustomer(
                    request.getCustomerName(),
                    request.getCustomerEmail(),
                    request.getCustomerPhone(),
                    request.getShippingAddress()
                );
            }

            // Convert request items to OrderItem entities
            List<OrderItem> orderItems = request.getItems().stream()
                .map(item -> {
                    // In a real implementation, you'd fetch the product from database
                    // For now, creating a basic OrderItem
                    OrderItem orderItem = new OrderItem();
                    orderItem.setProduct(null); // Would need ProductService to fetch
                    orderItem.setQuantity(item.getQuantity());
                    orderItem.setUnitPrice(item.getUnitPrice());
                    orderItem.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                    return orderItem;
                })
                .collect(Collectors.toList());

            // Create order
            Order order = orderService.createOrder(
                customer,
                orderItems,
                request.getShippingAddress(),
                request.getNotes(),
                request.getEstimatedDeliveryDate()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order created successfully");
            response.put("order", order);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error creating order: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get order by ID (public endpoint for tracking)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieve a specific order by its ID (public endpoint for tracking)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order retrieved successfully",
            content = @Content(mediaType = "application/json", example = "{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"customer\": {\"id\": 1, \"name\": \"John Doe\", \"email\": \"john.doe@example.com\"}, \"orderItems\": [{\"id\": 1, \"product\": null, \"quantity\": 2, \"unitPrice\": 10.00, \"totalPrice\": 20.00}], \"shippingAddress\": \"123 Main St\", \"orderDate\": \"2023-01-01T10:00:00\", \"estimatedDeliveryDate\": \"2023-01-05T10:00:00\", \"orderStatus\": \"PENDING\", \"totalAmount\": 20.00}")),
        @ApiResponse(responseCode = "404", description = "Order not found",
            content = @Content(mediaType = "application/json", example = "{}")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving order: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        try {
            Optional<Order> order = orderService.findById(id);
            if (order.isPresent()) {
                return ResponseEntity.ok(order.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving order: " + e.getMessage());
        }
    }

    /**
     * Get order by order number (public endpoint for tracking)
     */
    @GetMapping("/track/{orderNumber}")
    @Operation(summary = "Track order by order number", description = "Retrieve a specific order by its order number (public endpoint for tracking)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order retrieved successfully",
            content = @Content(mediaType = "application/json", example = "{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"customer\": {\"id\": 1, \"name\": \"John Doe\", \"email\": \"john.doe@example.com\"}, \"orderItems\": [{\"id\": 1, \"product\": null, \"quantity\": 2, \"unitPrice\": 10.00, \"totalPrice\": 20.00}], \"shippingAddress\": \"123 Main St\", \"orderDate\": \"2023-01-01T10:00:00\", \"estimatedDeliveryDate\": \"2023-01-05T10:00:00\", \"orderStatus\": \"PENDING\", \"totalAmount\": 20.00}")),
        @ApiResponse(responseCode = "404", description = "Order not found",
            content = @Content(mediaType = "application/json", example = "{}")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error tracking order: Internal Server Error\"}"))
    })
    public ResponseEntity<?> trackOrder(@PathVariable String orderNumber) {
        try {
            Optional<Order> order = orderService.findByOrderNumber(orderNumber);
            if (order.isPresent()) {
                return ResponseEntity.ok(order.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error tracking order: " + e.getMessage());
        }
    }

    /**
     * Get orders by customer email (public endpoint)
     */
    @GetMapping("/customer/{email}")
    @Operation(summary = "Get orders by customer email", description = "Retrieve all orders for a given customer email (public endpoint)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Orders retrieved successfully",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"customer\": {\"id\": 1, \"name\": \"John Doe\", \"email\": \"john.doe@example.com\"}, \"orderItems\": [{\"id\": 1, \"product\": null, \"quantity\": 2, \"unitPrice\": 10.00, \"totalPrice\": 20.00}], \"shippingAddress\": \"123 Main St\", \"orderDate\": \"2023-01-01T10:00:00\", \"estimatedDeliveryDate\": \"2023-01-05T10:00:00\", \"orderStatus\": \"PENDING\", \"totalAmount\": 20.00}] ")),
        @ApiResponse(responseCode = "404", description = "Customer not found",
            content = @Content(mediaType = "application/json", example = "{}")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving customer orders: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getOrdersByCustomer(@PathVariable String email) {
        try {
            Optional<Customer> customer = customerService.findByEmail(email);
            if (customer.isPresent()) {
                List<Order> orders = orderService.getOrdersByCustomer(customer.get().getId());
                return ResponseEntity.ok(orders);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving customer orders: " + e.getMessage());
        }
    }

    // Admin endpoints below

    /**
     * Get all orders with pagination (admin only)
     */
    @GetMapping("/admin")
    @Operation(summary = "Get all orders with pagination (admin only)", description = "Retrieve a paginated list of all orders")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved orders",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"customer\": {\"id\": 1, \"name\": \"John Doe\", \"email\": \"john.doe@example.com\"}, \"orderItems\": [{\"id\": 1, \"product\": null, \"quantity\": 2, \"unitPrice\": 10.00, \"totalPrice\": 20.00}], \"shippingAddress\": \"123 Main St\", \"orderDate\": \"2023-01-01T10:00:00\", \"estimatedDeliveryDate\": \"2023-01-05T10:00:00\", \"orderStatus\": \"PENDING\", \"totalAmount\": 20.00}] ")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving orders: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            // This would need a method in OrderService to get paginated orders
            // For now, returning recent orders
            List<Order> orders = orderService.getRecentOrders(30); // Last 30 days
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving orders: " + e.getMessage());
        }
    }

    /**
     * Update order status (admin only)
     */
    @PatchMapping("/admin/{id}/status")
    @Operation(summary = "Update order status (admin only)", description = "Update the status of a specific order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order status updated successfully",
            content = @Content(mediaType = "application/json", example = "{\"success\": true, \"message\": \"Order status updated successfully\", \"order\": {\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"orderStatus\": \"SHIPPED\"}}")),
        @ApiResponse(responseCode = "400", description = "Invalid status or order not found",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error updating order status: Order not found\"}")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error updating order status: Internal Server Error\"}"))
    })
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        try {
            Order order = orderService.updateOrderStatus(id, request.getStatus());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order status updated successfully");
            response.put("order", order);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating order status: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get orders by status (admin only)
     */
    @GetMapping("/admin/status/{status}")
    @Operation(summary = "Get orders by status (admin only)", description = "Retrieve a list of orders filtered by their status")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Orders retrieved successfully",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"orderStatus\": \"PENDING\"}] ")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving orders by status: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getOrdersByStatus(@PathVariable OrderStatus status) {
        try {
            List<Order> orders = orderService.getOrdersByStatus(status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving orders by status: " + e.getMessage());
        }
    }

    /**
     * Search orders (admin only)
     */
    @GetMapping("/admin/search")
    @Operation(summary = "Search orders (admin only)", description = "Search for orders based on a query string")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Orders retrieved successfully",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"customer\": {\"name\": \"John Doe\"}}] ")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error searching orders: Internal Server Error\"}"))
    })
    public ResponseEntity<?> searchOrders(@RequestParam String query) {
        try {
            List<Order> orders = orderService.searchOrders(query);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error searching orders: " + e.getMessage());
        }
    }

    /**
     * Get orders with delivery today (admin only)
     */
    @GetMapping("/admin/delivery-today")
    @Operation(summary = "Get orders with delivery today (admin only)", description = "Retrieve a list of orders scheduled for delivery today")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Orders retrieved successfully",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"estimatedDeliveryDate\": \"2023-01-01T10:00:00\"}] ")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving today's deliveries: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getOrdersWithDeliveryToday() {
        try {
            List<Order> orders = orderService.getOrdersWithDeliveryToday();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving today's deliveries: " + e.getMessage());
        }
    }

    /**
     * Get overdue orders (admin only)
     */
    @GetMapping("/admin/overdue")
    @Operation(summary = "Get overdue orders (admin only)", description = "Retrieve a list of orders that are past their estimated delivery date")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Overdue orders retrieved successfully",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"orderStatus\": \"PENDING\", \"estimatedDeliveryDate\": \"2023-01-01T10:00:00\"}] ")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving overdue orders: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getOverdueOrders() {
        try {
            List<Order> orders = orderService.getOverdueOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving overdue orders: " + e.getMessage());
        }
    }

    /**
     * Get high value orders (admin only)
     */
    @GetMapping("/admin/high-value")
    @Operation(summary = "Get high value orders (admin only)", description = "Retrieve a list of orders with a total amount exceeding a specified threshold")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "High value orders retrieved successfully",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"totalAmount\": 600.00}] ")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving high value orders: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getHighValueOrders(@RequestParam(defaultValue = "500") BigDecimal threshold) {
        try {
            List<Order> orders = orderService.getHighValueOrders(threshold);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving high value orders: " + e.getMessage());
        }
    }

    /**
     * Get order statistics (admin only)
     */
    @GetMapping("/admin/stats")
    @Operation(summary = "Get order statistics (admin only)", description = "Retrieve various statistics about orders")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order statistics retrieved successfully",
            content = @Content(mediaType = "application/json", example = "{\"totalOrders\": 100, \"pendingOrders\": 10, \"completedOrders\": 80, \"cancelledOrders\": 10}")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving order statistics: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getOrderStatistics() {
        try {
            OrderService.OrderStatistics stats = orderService.getOrderStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving order statistics: " + e.getMessage());
        }
    }

    /**
     * Get revenue in date range (admin only)
     */
    @GetMapping("/admin/revenue")
    @Operation(summary = "Get revenue in date range (admin only)", description = "Calculate total revenue within a specified date range")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Revenue calculated successfully",
            content = @Content(mediaType = "application/json", example = "{\"revenue\": 15000.00, \"startDate\": \"2023-01-01\", \"endDate\": \"2023-01-31\"}")),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error calculating revenue: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getRevenue(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            BigDecimal revenue = orderService.getTotalRevenue(start, end);

            Map<String, Object> response = new HashMap<>();
            response.put("revenue", revenue);
            response.put("startDate", startDate);
            response.put("endDate", endDate);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error calculating revenue: " + e.getMessage());
        }
    }

    // DTO classes
    public static class OrderRequest {
        private String customerName;
        private String customerEmail;
        private String customerPhone;
        private String shippingAddress;
        private String notes;
        private LocalDateTime estimatedDeliveryDate;
        private List<OrderItemRequest> items;

        public OrderRequest() {}

        // Getters and setters
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }

        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

        public String getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public LocalDateTime getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
        public void setEstimatedDeliveryDate(LocalDateTime estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }

        public List<OrderItemRequest> getItems() { return items; }
        public void setItems(List<OrderItemRequest> items) { this.items = items; }
    }

    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
        private BigDecimal unitPrice;

        public OrderItemRequest() {}

        // Getters and setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    }

    public static class StatusRequest {
        private OrderStatus status;

        public StatusRequest() {}

        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
    }
}