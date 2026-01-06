package com.example.silea.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import com.example.silea.entity.*;
import com.example.silea.enums.OrderStatus;
import com.example.silea.enums.ProductSize;
import com.example.silea.service.CartService;
import com.example.silea.service.CustomerService;
import com.example.silea.service.OrderService;
import com.example.silea.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;
    private final CustomerService customerService;
    private final ProductService productService;
    private final CartService cartService;

    public OrderController(OrderService orderService, CustomerService customerService, ProductService productService, CartService cartService) {
        this.orderService = orderService;
        this.customerService = customerService;
        this.productService = productService;
        this.cartService = cartService;
    }

    /**
     * Get available sizes for ordering
     */
    @GetMapping("/sizes")
    @Operation(summary = "Get available product sizes", description = "Returns the available sizes for oil and honey products")
    public ResponseEntity<?> getAvailableSizes() {
        Map<String, Object> sizes = new HashMap<>();
        
        // Oil sizes
        List<Map<String, Object>> oilSizes = new ArrayList<>();
        for (ProductSize size : ProductSize.getOilSizes()) {
            Map<String, Object> sizeInfo = new HashMap<>();
            sizeInfo.put("code", size.name());
            sizeInfo.put("displayName", size.getDisplayName());
            sizeInfo.put("priceMultiplier", size.getPriceMultiplier());
            oilSizes.add(sizeInfo);
        }
        sizes.put("oil", oilSizes);
        
        // Honey sizes
        List<Map<String, Object>> honeySizes = new ArrayList<>();
        for (ProductSize size : ProductSize.getHoneySizes()) {
            Map<String, Object> sizeInfo = new HashMap<>();
            sizeInfo.put("code", size.name());
            sizeInfo.put("displayName", size.getDisplayName());
            sizeInfo.put("priceMultiplier", size.getPriceMultiplier());
            honeySizes.add(sizeInfo);
        }
        sizes.put("honey", honeySizes);
        
        return ResponseEntity.ok(sizes);
    }
    
    /**
     * Calculate shipping cost for a city
     */
    @GetMapping("/shipping")
    @Operation(summary = "Calculate shipping cost", description = "Calculate shipping cost based on destination city. Tanger: 20 MAD, Other cities: 35 MAD. Delivery time: 24-72h")
    public ResponseEntity<?> calculateShipping(@RequestParam String city) {
        try {
            Map<String, Object> shippingInfo = cartService.getShippingInfo(city);
            return ResponseEntity.ok(shippingInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error calculating shipping: " + e.getMessage()
            ));
        }
    }

    /**
     * Create new order (public endpoint for customers)
     */
    @PostMapping
    @Operation(summary = "Create new order", description = "Create a new order for a customer. Price is calculated automatically based on product base price and selected size.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid order data")
    })
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            // Validate required fields
            List<String> validationErrors = validateOrderRequest(request);
            if (!validationErrors.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Validation failed",
                    "errors", validationErrors
                ));
            }
            
            // Validate items
            if (request.getItems() == null || request.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Order must have at least one item"
                ));
            }

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
                    request.getShippingAddress(),
                    request.getCustomerCity()
                );
            }

            // Calculate shipping cost based on city
            BigDecimal shippingCost = cartService.calculateShipping(request.getCustomerCity());

            // Convert request items to OrderItem entities with automatic pricing
            List<OrderItem> orderItems = new ArrayList<>();
            BigDecimal subtotal = BigDecimal.ZERO;
            List<Map<String, Object>> itemDetails = new ArrayList<>();

            for (OrderItemRequest item : request.getItems()) {
                // Fetch product from database
                Product product = productService.findById(item.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found: " + item.getProductId()));
                
                // Check if product is available
                if (!product.getAvailable()) {
                    throw new IllegalArgumentException("Product is not available: " + product.getName());
                }

                // Parse the size
                ProductSize size;
                try {
                    size = ProductSize.valueOf(item.getSize().toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Invalid size: " + item.getSize() + 
                        ". Valid sizes: OIL_5L, OIL_2L, OIL_1L, HONEY_1KG, HONEY_500G, HONEY_250G");
                }

                // Validate size matches product category
                String categoryName = product.getCategory().getName().toLowerCase();
                boolean isOilProduct = categoryName.contains("oil") || categoryName.contains("huile") || categoryName.contains("زيت");
                boolean isHoneyProduct = categoryName.contains("honey") || categoryName.contains("miel") || categoryName.contains("عسل");
                
                if (isOilProduct && !size.isOilSize()) {
                    throw new IllegalArgumentException("Product '" + product.getName() + "' is oil. Use sizes: OIL_5L, OIL_2L, or OIL_1L");
                }
                if (isHoneyProduct && !size.isHoneySize()) {
                    throw new IllegalArgumentException("Product '" + product.getName() + "' is honey. Use sizes: HONEY_1KG, HONEY_500G, or HONEY_250G");
                }

                // Calculate unit price based on product base price and size multiplier
                BigDecimal unitPrice = product.getPrice().multiply(size.getPriceMultiplier())
                        .setScale(2, RoundingMode.HALF_UP);
                
                // Calculate total for this item
                BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                subtotal = subtotal.add(itemTotal);
                
                // Create order item
                OrderItem orderItem = new OrderItem();
                orderItem.setProduct(product);
                orderItem.setQuantity(item.getQuantity());
                orderItem.setSize(size);
                orderItem.setUnitPrice(unitPrice);
                orderItem.setTotalPrice(itemTotal);
                orderItems.add(orderItem);
                
                // Build item details for response
                Map<String, Object> itemDetail = new HashMap<>();
                itemDetail.put("productId", product.getId());
                itemDetail.put("productName", product.getName());
                itemDetail.put("productNameAr", product.getNameAr());
                itemDetail.put("category", product.getCategory().getName());
                itemDetail.put("size", size.getDisplayName());
                itemDetail.put("sizeCode", size.name());
                itemDetail.put("quantity", item.getQuantity());
                itemDetail.put("basePrice", product.getPrice());
                itemDetail.put("unitPrice", unitPrice);
                itemDetail.put("itemTotal", itemTotal);
                itemDetails.add(itemDetail);
            }

            // Calculate total with shipping
            BigDecimal orderTotal = subtotal.add(shippingCost);

            // Create order
            Order order = orderService.createOrder(
                customer,
                orderItems,
                request.getShippingAddress(),
                request.getNotes(),
                request.getEstimatedDeliveryDate()
            );
            
            // Set shipping information
            order.setShippingCity(request.getCustomerCity());
            order.setShippingCost(shippingCost);
            order.setSubtotal(subtotal);

            // Build detailed response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order created successfully");
            
            // Order summary
            Map<String, Object> orderSummary = new HashMap<>();
            orderSummary.put("orderId", order.getId());
            orderSummary.put("orderNumber", order.getOrderNumber());
            orderSummary.put("trackingCode", order.getTrackingCode());
            orderSummary.put("status", order.getStatus().name());
            orderSummary.put("orderDate", order.getOrderDate());
            orderSummary.put("estimatedDeliveryDate", order.getEstimatedDeliveryDate());
            
            // Customer info
            Map<String, Object> customerInfo = new HashMap<>();
            customerInfo.put("id", customer.getId());
            customerInfo.put("name", customer.getName());
            customerInfo.put("email", customer.getEmail());
            customerInfo.put("phone", customer.getPhone());
            orderSummary.put("customer", customerInfo);
            
            orderSummary.put("shippingAddress", order.getShippingAddress());
            orderSummary.put("shippingCity", order.getShippingCity());
            orderSummary.put("notes", order.getNotes());
            
            // Items with full details
            orderSummary.put("items", itemDetails);
            orderSummary.put("itemCount", orderItems.size());
            orderSummary.put("subtotal", subtotal);
            orderSummary.put("shippingCost", shippingCost);
            orderSummary.put("deliveryTime", "24-72h");
            orderSummary.put("totalAmount", orderTotal);
            
            response.put("order", orderSummary);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error creating order: " + e.getMessage()
            ));
        }
    }

    /**
     * Get order by ID (public endpoint for tracking)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieve a specific order by its ID (public endpoint for tracking)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order retrieved successfully",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"customer\": {\"id\": 1, \"name\": \"John Doe\", \"email\": \"john.doe@example.com\"}, \"orderItems\": [{\"id\": 1, \"product\": null, \"quantity\": 2, \"unitPrice\": 10.00, \"totalPrice\": 20.00}], \"shippingAddress\": \"123 Main St\", \"orderDate\": \"2023-01-01T10:00:00\", \"estimatedDeliveryDate\": \"2023-01-05T10:00:00\", \"orderStatus\": \"PENDING\", \"totalAmount\": 20.00}"))),
        @ApiResponse(responseCode = "404", description = "Order not found",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{}"))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving order: Internal Server Error\"}")))
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
        @ApiResponse(responseCode = "200", description = "Order retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<?> trackOrder(@PathVariable String orderNumber) {
        try {
            Optional<Order> order = orderService.findByOrderNumber(orderNumber);
            if (order.isPresent()) {
                Order foundOrder = order.get();
                // Check if order is cancelled and provide helpful message
                if (foundOrder.getStatus() == OrderStatus.CANCELLED) {
                    return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "This order has been cancelled and is no longer available for tracking.",
                        "orderStatus", "CANCELLED"
                    ));
                }
                return ResponseEntity.ok(buildOrderResponse(foundOrder));
            } else {
                // Also check if it might be a tracking code instead
                Optional<Order> orderByTrackingCode = orderService.findByTrackingCode(orderNumber);
                if (orderByTrackingCode.isPresent()) {
                    // User entered tracking code but used order number endpoint
                    return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Please use the tracking code search option instead of order number.",
                        "hint", "This appears to be a tracking code, not an order number."
                    ));
                }
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "No order found with order number: " + orderNumber
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Error tracking order: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Track order by tracking code (public endpoint for customers)
     */
    @GetMapping("/track/code/{trackingCode}")
    @Operation(summary = "Track order by tracking code", description = "Retrieve order details using the tracking code sent to customer")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order found and retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "No order found with this tracking code")
    })
    public ResponseEntity<?> trackOrderByCode(@PathVariable String trackingCode) {
        try {
            Optional<Order> order = orderService.findByTrackingCodePublic(trackingCode);
            if (order.isPresent()) {
                Order foundOrder = order.get();
                // Check if order is cancelled and provide helpful message
                if (foundOrder.getStatus() == OrderStatus.CANCELLED) {
                    return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "This order has been cancelled and is no longer available for tracking.",
                        "orderStatus", "CANCELLED"
                    ));
                }
                return ResponseEntity.ok(buildOrderResponse(foundOrder));
            } else {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "No order found with tracking code: " + trackingCode
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Error tracking order: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Cancel order (public endpoint for customers - can cancel their own orders)
     */
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel order", description = "Customer can cancel their order if it hasn't been shipped yet")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order cancelled successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be cancelled (already shipped/delivered)"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<?> cancelOrderByCustomer(@PathVariable Long id, @RequestBody(required = false) CancelRequest request) {
        try {
            String reason = request != null && request.getReason() != null ? request.getReason() : "Customer request";
            Order order = orderService.cancelOrder(id, reason);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order cancelled successfully",
                "order", buildOrderResponse(order)
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error cancelling order: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Validate order request fields
     */
    private List<String> validateOrderRequest(OrderRequest request) {
        List<String> errors = new ArrayList<>();
        
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            errors.add("Customer name is required");
        }
        
        if (request.getCustomerEmail() == null || request.getCustomerEmail().trim().isEmpty()) {
            errors.add("Customer email is required");
        } else if (!isValidEmail(request.getCustomerEmail())) {
            errors.add("Invalid email format");
        }
        
        if (request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty()) {
            errors.add("Customer phone is required");
        }
        
        if (request.getShippingAddress() == null || request.getShippingAddress().trim().isEmpty()) {
            errors.add("Shipping address is required");
        }
        
        if (request.getCustomerCity() == null || request.getCustomerCity().trim().isEmpty()) {
            errors.add("Customer city is required");
        }
        
        if (request.getItems() != null) {
            for (int i = 0; i < request.getItems().size(); i++) {
                OrderItemRequest item = request.getItems().get(i);
                if (item.getProductId() == null) {
                    errors.add("Item " + (i + 1) + ": Product ID is required");
                }
                if (item.getQuantity() == null || item.getQuantity() <= 0) {
                    errors.add("Item " + (i + 1) + ": Quantity must be greater than 0");
                }
                if (item.getSize() == null || item.getSize().trim().isEmpty()) {
                    errors.add("Item " + (i + 1) + ": Size is required");
                }
            }
        }
        
        return errors;
    }
    
    /**
     * Simple email validation
     */
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    }
    
    /**
     * Build detailed order response with items
     */
    private Map<String, Object> buildOrderResponse(Order order) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", order.getId());
        response.put("orderNumber", order.getOrderNumber());
        response.put("trackingCode", order.getTrackingCode());
        response.put("status", order.getStatus().name());
        response.put("orderDate", order.getOrderDate());
        response.put("estimatedDeliveryDate", order.getEstimatedDeliveryDate());
        response.put("shippingAddress", order.getShippingAddress());
        response.put("notes", order.getNotes());
        response.put("total", order.getTotal());
        
        // Customer info (limited for privacy)
        Map<String, Object> customerInfo = new HashMap<>();
        customerInfo.put("name", order.getCustomer().getName());
        customerInfo.put("email", order.getCustomer().getEmail());
        customerInfo.put("phone", order.getCustomer().getPhone());
        response.put("customer", customerInfo);
        
        // Order items
        List<Map<String, Object>> items = new ArrayList<>();
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                Map<String, Object> itemInfo = new HashMap<>();
                itemInfo.put("id", item.getId());
                itemInfo.put("productId", item.getProduct().getId());
                itemInfo.put("productName", item.getProduct().getName());
                itemInfo.put("productNameAr", item.getProduct().getNameAr());
                itemInfo.put("size", item.getSize() != null ? item.getSize().getDisplayName() : null);
                itemInfo.put("sizeCode", item.getSize() != null ? item.getSize().name() : null);
                itemInfo.put("quantity", item.getQuantity());
                itemInfo.put("unitPrice", item.getUnitPrice());
                itemInfo.put("totalPrice", item.getTotalPrice());
                items.add(itemInfo);
            }
        }
        response.put("items", items);
        response.put("itemCount", items.size());
        
        return response;
    }

    /**
     * Get orders by customer email (public endpoint)
     */
    @GetMapping("/customer/{email}")
    @Operation(summary = "Get orders by customer email", description = "Retrieve all orders for a given customer email (public endpoint)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Orders retrieved successfully",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"customer\": {\"id\": 1, \"name\": \"John Doe\", \"email\": \"john.doe@example.com\"}, \"orderItems\": [{\"id\": 1, \"product\": null, \"quantity\": 2, \"unitPrice\": 10.00, \"totalPrice\": 20.00}], \"shippingAddress\": \"123 Main St\", \"orderDate\": \"2023-01-01T10:00:00\", \"estimatedDeliveryDate\": \"2023-01-05T10:00:00\", \"orderStatus\": \"PENDING\", \"totalAmount\": 20.00}] "))),
        @ApiResponse(responseCode = "404", description = "Customer not found",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{}"))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving customer orders: Internal Server Error\"}")))
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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"customer\": {\"id\": 1, \"name\": \"John Doe\", \"email\": \"john.doe@example.com\"}, \"orderItems\": [{\"id\": 1, \"product\": null, \"quantity\": 2, \"unitPrice\": 10.00, \"totalPrice\": 20.00}], \"shippingAddress\": \"123 Main St\", \"orderDate\": \"2023-01-01T10:00:00\", \"estimatedDeliveryDate\": \"2023-01-05T10:00:00\", \"orderStatus\": \"PENDING\", \"totalAmount\": 20.00}] "))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving orders: Internal Server Error\"}")))
    })
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            // Return paginated list of all orders
            List<Order> orders = orderService.getAllOrders(page, size);
            // Optionally include pagination metadata in a map, but frontend expects an array
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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": true, \"message\": \"Order status updated successfully\", \"order\": {\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"orderStatus\": \"SHIPPED\"}}"))),
        @ApiResponse(responseCode = "400", description = "Invalid status or order not found",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Error updating order status: Order not found\"}"))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Error updating order status: Internal Server Error\"}")))
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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"orderStatus\": \"PENDING\"}] "))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving orders by status: Internal Server Error\"}")))
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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"customer\": {\"name\": \"John Doe\"}}] "))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error searching orders: Internal Server Error\"}")))
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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"estimatedDeliveryDate\": \"2023-01-01T10:00:00\"}] "))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving today's deliveries: Internal Server Error\"}")))
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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"orderStatus\": \"PENDING\", \"estimatedDeliveryDate\": \"2023-01-01T10:00:00\"}] "))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving overdue orders: Internal Server Error\"}")))
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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"orderNumber\": \"ORD-20230101-0001\", \"totalAmount\": 600.00}] "))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving high value orders: Internal Server Error\"}")))
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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"totalOrders\": 100, \"pendingOrders\": 10, \"completedOrders\": 80, \"cancelledOrders\": 10}"))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving order statistics: Internal Server Error\"}")))
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
        @ApiResponse(responseCode = "200", description = "Revenue calculated successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getRevenue(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            BigDecimal revenue = orderService.getTotalRevenue(start, end);

            Map<String, Object> response = new HashMap<>();
            response.put("revenue", revenue != null ? revenue : BigDecimal.ZERO);
            response.put("startDate", startDate);
            response.put("endDate", endDate);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error calculating revenue: " + e.getMessage());
        }
    }
    
    /**
     * Get order details with items (admin only)
     */
    @GetMapping("/admin/{id}/details")
    @Operation(summary = "Get order details with items (admin only)", description = "Retrieve full order details including all items")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order details retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<?> getOrderDetails(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderWithItems(id);
            return ResponseEntity.ok(buildOrderResponse(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error retrieving order details: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Cancel order (admin only)
     */
    @PostMapping("/admin/{id}/cancel")
    @Operation(summary = "Cancel order (admin only)", description = "Admin can cancel any cancellable order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order cancelled successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be cancelled")
    })
    public ResponseEntity<?> cancelOrderByAdmin(@PathVariable Long id, @RequestBody(required = false) CancelRequest request) {
        try {
            String reason = request != null && request.getReason() != null ? request.getReason() : "Cancelled by admin";
            Order order = orderService.cancelOrder(id, reason);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order cancelled successfully",
                "order", buildOrderResponse(order)
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Confirm order (admin only) - move from PENDING to CONFIRMED
     */
    @PostMapping("/admin/{id}/confirm")
    @Operation(summary = "Confirm order (admin only)", description = "Confirm a pending order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order confirmed successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be confirmed")
    })
    public ResponseEntity<?> confirmOrder(@PathVariable Long id) {
        try {
            Order order = orderService.confirmOrder(id);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order confirmed successfully",
                "order", buildOrderResponse(order)
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Update order shipping address (admin only)
     */
    @PatchMapping("/admin/{id}/address")
    @Operation(summary = "Update shipping address (admin only)", description = "Update the shipping address of an order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Address updated successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot update address for this order")
    })
    public ResponseEntity<?> updateShippingAddress(@PathVariable Long id, @RequestBody AddressUpdateRequest request) {
        try {
            Order order = orderService.updateShippingAddress(id, request.getShippingAddress());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Shipping address updated successfully",
                "order", buildOrderResponse(order)
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Update order notes (admin only)
     */
    @PatchMapping("/admin/{id}/notes")
    @Operation(summary = "Update order notes (admin only)", description = "Update or add notes to an order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notes updated successfully")
    })
    public ResponseEntity<?> updateOrderNotes(@PathVariable Long id, @RequestBody NotesUpdateRequest request) {
        try {
            Order order = orderService.updateOrderNotes(id, request.getNotes());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order notes updated successfully",
                "order", buildOrderResponse(order)
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get recent orders for dashboard (admin only)
     */
    @GetMapping("/admin/recent")
    @Operation(summary = "Get recent orders (admin only)", description = "Get most recent orders for dashboard")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Recent orders retrieved successfully")
    })
    public ResponseEntity<?> getRecentOrders(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<Order> orders = orderService.getRecentOrdersForDashboard(limit);
            List<Map<String, Object>> orderResponses = new ArrayList<>();
            for (Order order : orders) {
                orderResponses.add(buildOrderResponse(order));
            }
            return ResponseEntity.ok(orderResponses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving recent orders: " + e.getMessage());
        }
    }
    
    /**
     * Get available order statuses
     */
    @GetMapping("/statuses")
    @Operation(summary = "Get available order statuses", description = "Returns all possible order status values")
    public ResponseEntity<?> getAvailableStatuses() {
        List<Map<String, Object>> statuses = new ArrayList<>();
        for (OrderStatus status : OrderStatus.values()) {
            Map<String, Object> statusInfo = new HashMap<>();
            statusInfo.put("code", status.name());
            statusInfo.put("isCancellable", status.isCancellable());
            statusInfo.put("isFinal", status.isFinal());
            statusInfo.put("isActive", status.isActive());
            statuses.add(statusInfo);
        }
        return ResponseEntity.ok(statuses);
    }

    // DTO classes
    public static class OrderRequest {
        private String customerName;
        private String customerEmail;
        private String customerPhone;
        private String customerCity;
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
        
        public String getCustomerCity() { return customerCity; }
        public void setCustomerCity(String customerCity) { this.customerCity = customerCity; }

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
        private String size; // e.g., "OIL_5L", "OIL_2L", "OIL_1L", "HONEY_1KG", "HONEY_500G", "HONEY_250G"

        public OrderItemRequest() {}

        // Getters and setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getSize() { return size; }
        public void setSize(String size) { this.size = size; }
    }

    public static class StatusRequest {
        private OrderStatus status;

        public StatusRequest() {}

        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
    }
    
    public static class CancelRequest {
        private String reason;

        public CancelRequest() {}

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
    
    public static class AddressUpdateRequest {
        private String shippingAddress;

        public AddressUpdateRequest() {}

        public String getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    }
    
    public static class NotesUpdateRequest {
        private String notes;

        public NotesUpdateRequest() {}

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}