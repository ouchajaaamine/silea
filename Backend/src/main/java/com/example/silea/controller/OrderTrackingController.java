package com.example.silea.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import com.example.silea.entity.Order;
import com.example.silea.entity.OrderTracking;
import com.example.silea.enums.TrackingStatus;
import com.example.silea.service.OrderService;
import com.example.silea.service.OrderTrackingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "*")
public class OrderTrackingController {

    private final OrderTrackingService orderTrackingService;
    private final OrderService orderService;

    public OrderTrackingController(OrderTrackingService orderTrackingService, OrderService orderService) {
        this.orderTrackingService = orderTrackingService;
        this.orderService = orderService;
    }

    /**
     * Get tracking history for an order (public endpoint)
     */
    @Operation(summary = "Get tracking history for an order", description = "Retrieves the complete tracking history for a specific order ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved tracking history",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "[{\"id\": 1, \"orderId\": 101, \"status\": \"SHIPPED\", \"location\": \"Warehouse A\", \"notes\": \"Item shipped from warehouse\", \"timestamp\": \"2023-01-01T10:00:00Z\"}, {\"id\": 2, \"orderId\": 101, \"status\": \"IN_TRANSIT\", \"location\": \"Shipping Hub B\", \"notes\": \"Package en route to destination\", \"timestamp\": \"2023-01-01T14:30:00Z\"}]"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error retrieving tracking history: An unexpected error occurred\"}")))
    })
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getTrackingHistory(@PathVariable Long orderId) {
        try {
            List<OrderTracking> trackingHistory = orderTrackingService.getTrackingHistory(orderId);
            return ResponseEntity.ok(trackingHistory);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving tracking history: " + e.getMessage());
        }
    }

    /**
     * Get latest tracking update for an order (public endpoint)
     */
    @Operation(summary = "Get latest tracking update for an order", description = "Retrieves the most recent tracking update for a specific order ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved latest tracking update",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"id\": 2, \"orderId\": 101, \"status\": \"IN_TRANSIT\", \"location\": \"Shipping Hub B\", \"notes\": \"Package en route to destination\", \"timestamp\": \"2023-01-01T14:30:00Z\"}"))),
            @ApiResponse(responseCode = "404", description = "No tracking updates found for the order",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{}"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error retrieving latest tracking: An unexpected error occurred\"}")))
    })
    @GetMapping("/order/{orderId}/latest")
    public ResponseEntity<?> getLatestTracking(@PathVariable Long orderId) {
        try {
            Optional<OrderTracking> latestTracking = orderTrackingService.getLatestTrackingUpdate(orderId);
            if (latestTracking.isPresent()) {
                return ResponseEntity.ok(latestTracking.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving latest tracking: " + e.getMessage());
        }
    }

    /**
     * Track order by order number (public endpoint)
     */
    @Operation(summary = "Track order by order number", description = "Retrieves order details and its complete tracking history using the order number.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved order and tracking history",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"order\": {\"id\": 101, \"orderNumber\": \"ORD-2023-001\", \"customerEmail\": \"customer@example.com\", \"orderDate\": \"2023-01-01T09:00:00Z\", \"status\": \"DELIVERED\", \"totalAmount\": 150.75},\"trackingHistory\": [{\"id\": 1, \"orderId\": 101, \"status\": \"SHIPPED\", \"location\": \"Warehouse A\", \"notes\": \"Item shipped from warehouse\", \"timestamp\": \"2023-01-01T10:00:00Z\"}, {\"id\": 2, \"orderId\": 101, \"status\": \"DELIVERED\", \"location\": \"Customer Address\", \"notes\": \"Delivered to front door\", \"timestamp\": \"2023-01-02T11:00:00Z\"}]}"))),
            @ApiResponse(responseCode = "404", description = "Order not found",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{}"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error tracking order: An unexpected error occurred\"}")))
    })
    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<?> trackOrderByNumber(@PathVariable String orderNumber) {
        try {
            Optional<Order> order = orderService.findByOrderNumber(orderNumber);
            if (order.isPresent()) {
                List<OrderTracking> trackingHistory = orderTrackingService.getTrackingHistory(order.get().getId());
                Map<String, Object> response = new HashMap<>();
                response.put("order", order.get());
                response.put("trackingHistory", trackingHistory);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error tracking order: " + e.getMessage());
        }
    }

    // Admin endpoints below

    /**
     * Add tracking update (admin only)
     */
    @Operation(summary = "Add tracking update (admin only)", description = "Adds a new tracking update for a specific order. Admin access required.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tracking update added successfully",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"success\": true, \"message\": \"Tracking update added successfully\", \"tracking\": {\"id\": 3, \"orderId\": 101, \"status\": \"OUT_FOR_DELIVERY\", \"location\": \"Local Delivery Hub\", \"notes\": \"Package out for delivery\", \"timestamp\": \"2023-01-02T09:00:00Z\"}}"))),
            @ApiResponse(responseCode = "400", description = "Invalid request or order not found",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Order not found\"}"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Error adding tracking update: An unexpected error occurred\"}")))
    })
    @PostMapping("/admin")
    public ResponseEntity<?> addTrackingUpdate(@RequestBody TrackingRequest request) {
        try {
            Optional<Order> order = orderService.findById(request.getOrderId());
            if (!order.isPresent()) {
                return ResponseEntity.badRequest().body("Order not found");
            }

            OrderTracking tracking = orderTrackingService.addTrackingUpdate(
                order.get(),
                request.getStatus(),
                request.getLocation(),
                request.getNotes()
            );

            // Update order status based on tracking
            orderTrackingService.updateOrderStatusFromTracking(order.get(), request.getStatus());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tracking update added successfully");
            response.put("tracking", tracking);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error adding tracking update: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get tracking records by status (admin only)
     */
    @Operation(summary = "Get tracking records by status (admin only)", description = "Retrieves a list of tracking records filtered by a specific tracking status. Admin access required.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved tracking records",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "[{\"id\": 1, \"orderId\": 101, \"status\": \"SHIPPED\", \"location\": \"Warehouse A\", \"notes\": \"Item shipped from warehouse\", \"timestamp\": \"2023-01-01T10:00:00Z\"}]"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error retrieving tracking records: An unexpected error occurred\"}")))
    })
    @GetMapping("/admin/status/{status}")
    public ResponseEntity<?> getTrackingByStatus(@PathVariable TrackingStatus status) {
        try {
            List<OrderTracking> trackingRecords = orderTrackingService.getTrackingByStatus(status);
            return ResponseEntity.ok(trackingRecords);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving tracking records: " + e.getMessage());
        }
    }

    /**
     * Get tracking records with location (admin only)
     */
    @Operation(summary = "Get tracking records with location (admin only)", description = "Retrieves all tracking records that have a location specified. Admin access required.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved tracking records with location",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "[{\"id\": 1, \"orderId\": 101, \"status\": \"SHIPPED\", \"location\": \"Warehouse A\", \"notes\": \"Item shipped from warehouse\", \"timestamp\": \"2023-01-01T10:00:00Z\"}, {\"id\": 2, \"orderId\": 101, \"status\": \"IN_TRANSIT\", \"location\": \"Shipping Hub B\", \"notes\": \"Package en route to destination\", \"timestamp\": \"2023-01-01T14:30:00Z\"}]"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error retrieving tracking records with location: An unexpected error occurred\"}")))
    })
    @GetMapping("/admin/with-location")
    public ResponseEntity<?> getTrackingWithLocation() {
        try {
            List<OrderTracking> trackingRecords = orderTrackingService.getTrackingWithLocation();
            return ResponseEntity.ok(trackingRecords);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving tracking records with location: " + e.getMessage());
        }
    }

    /**
     * Search tracking by location (admin only)
     */
    @Operation(summary = "Search tracking by location (admin only)", description = "Searches for tracking records based on a partial or full location string. Admin access required.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved tracking records by location",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "[{\"id\": 1, \"orderId\": 101, \"status\": \"SHIPPED\", \"location\": \"Warehouse A\", \"notes\": \"Item shipped from warehouse\", \"timestamp\": \"2023-01-01T10:00:00Z\"}]"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error searching tracking by location: An unexpected error occurred\"}")))
    })
    @GetMapping("/admin/search/location")
    public ResponseEntity<?> searchTrackingByLocation(@RequestParam String location) {
        try {
            List<OrderTracking> trackingRecords = orderTrackingService.searchTrackingByLocation(location);
            return ResponseEntity.ok(trackingRecords);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error searching tracking by location: " + e.getMessage());
        }
    }

    /**
     * Get recent tracking updates (admin only)
     */
    @Operation(summary = "Get recent tracking updates (admin only)", description = "Retrieves tracking updates from the last specified number of hours. Admin access required.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved recent tracking updates",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "[{\"id\": 1, \"orderId\": 101, \"status\": \"SHIPPED\", \"location\": \"Warehouse A\", \"notes\": \"Item shipped from warehouse\", \"timestamp\": \"2023-01-01T10:00:00Z\"}]"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error retrieving recent tracking updates: An unexpected error occurred\"}")))
    })
    @GetMapping("/admin/recent")
    public ResponseEntity<?> getRecentTrackingUpdates(@RequestParam(defaultValue = "24") int hours) {
        try {
            List<OrderTracking> trackingRecords = orderTrackingService.getRecentTrackingUpdates(hours);
            return ResponseEntity.ok(trackingRecords);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving recent tracking updates: " + e.getMessage());
        }
    }

    /**
     * Get pending delivery confirmations (admin only)
     */
    @Operation(summary = "Get pending delivery confirmations (admin only)", description = "Retrieves a list of orders that are awaiting delivery confirmation. Admin access required.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved pending delivery confirmations",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "[{\"id\": 1, \"orderId\": 101, \"status\": \"OUT_FOR_DELIVERY\", \"location\": \"Local Delivery Hub\", \"notes\": \"Package out for delivery\", \"timestamp\": \"2023-01-02T09:00:00Z\"}]"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error retrieving pending deliveries: An unexpected error occurred\"}")))
    })
    @GetMapping("/admin/pending-deliveries")
    public ResponseEntity<?> getPendingDeliveryConfirmations() {
        try {
            List<OrderTracking> pendingDeliveries = orderTrackingService.getPendingDeliveryConfirmations();
            return ResponseEntity.ok(pendingDeliveries);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving pending deliveries: " + e.getMessage());
        }
    }

    /**
     * Get tracking statistics (admin only)
     */
    @Operation(summary = "Get tracking statistics (admin only)", description = "Retrieves various statistics related to order tracking, such as total tracked orders, delivered orders, etc. Admin access required.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved tracking statistics",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"totalTrackedOrders\": 100, \"deliveredOrders\": 80, \"inTransitOrders\": 15, \"pendingOrders\": 5, \"averageDeliveryTimeDays\": 2.5}"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error retrieving tracking statistics: An unexpected error occurred\"}")))
    })
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getTrackingStatistics() {
        try {
            OrderTrackingService.TrackingStatistics stats = orderTrackingService.getTrackingStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving tracking statistics: " + e.getMessage());
        }
    }

    /**
     * Get orders with delayed tracking (admin only)
     */
    @Operation(summary = "Get orders with delayed tracking (admin only)", description = "Retrieves orders that have not received a tracking update within a specified number of hours. Admin access required.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved delayed orders",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "[{\"id\": 101, \"orderNumber\": \"ORD-2023-001\", \"customerEmail\": \"customer@example.com\", \"orderDate\": \"2023-01-01T09:00:00Z\", \"status\": \"SHIPPED\", \"totalAmount\": 150.75}]"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error retrieving delayed orders: An unexpected error occurred\"}")))
    })
    @GetMapping("/admin/delayed")
    public ResponseEntity<?> getOrdersWithDelayedTracking(@RequestParam(defaultValue = "48") int hoursThreshold) {
        try {
            List<Order> delayedOrders = orderTrackingService.getOrdersWithDelayedTracking(hoursThreshold);
            return ResponseEntity.ok(delayedOrders);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving delayed orders: " + e.getMessage());
        }
    }

    /**
     * Get tracking records with notes (admin only)
     */
    @Operation(summary = "Get tracking records with notes (admin only)", description = "Retrieves all tracking records that include additional notes. Admin access required.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved tracking records with notes",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "[{\"id\": 1, \"orderId\": 101, \"status\": \"SHIPPED\", \"location\": \"Warehouse A\", \"notes\": \"Item shipped from warehouse\", \"timestamp\": \"2023-01-01T10:00:00Z\"}]"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error retrieving tracking records with notes: An unexpected error occurred\"}")))
    })
    @GetMapping("/admin/with-notes")
    public ResponseEntity<?> getTrackingWithNotes() {
        try {
            List<OrderTracking> trackingRecords = orderTrackingService.getTrackingWithNotes();
            return ResponseEntity.ok(trackingRecords);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving tracking records with notes: " + e.getMessage());
        }
    }

    /**
     * Search tracking by notes (admin only)
     */
    @Operation(summary = "Search tracking by notes (admin only)", description = "Searches for tracking records based on keywords present in the notes field. Admin access required.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved tracking records by notes",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "[{\"id\": 1, \"orderId\": 101, \"status\": \"SHIPPED\", \"location\": \"Warehouse A\", \"notes\": \"Item shipped from warehouse\", \"timestamp\": \"2023-01-01T10:00:00Z\"}]"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error searching tracking by notes: An unexpected error occurred\"}")))
    })
    @GetMapping("/admin/search/notes")
    public ResponseEntity<?> searchTrackingByNotes(@RequestParam String notes) {
        try {
            List<OrderTracking> trackingRecords = orderTrackingService.searchTrackingByNotes(notes);
            return ResponseEntity.ok(trackingRecords);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error searching tracking by notes: " + e.getMessage());
        }
    }

    /**
     * Get average delivery time (admin only)
     */
    @Operation(summary = "Get average delivery time (admin only)", description = "Calculates and retrieves the average delivery time for all orders. Admin access required.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully calculated average delivery time",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"averageDeliveryTimeHours\": 48.5}"))),
            @ApiResponse(responseCode = "500", description = "Internal Server Error",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Error calculating average delivery time: An unexpected error occurred\"}")))
    })
    @GetMapping("/admin/average-delivery-time")
    public ResponseEntity<?> getAverageDeliveryTime() {
        try {
            Double averageTime = orderTrackingService.getAverageDeliveryTime();
            Map<String, Object> response = new HashMap<>();
            response.put("averageDeliveryTimeHours", averageTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error calculating average delivery time: " + e.getMessage());
        }
    }

    // DTO classes
    public static class TrackingRequest {
        private Long orderId;
        private TrackingStatus status;
        private String location;
        private String notes;

        public TrackingRequest() {}

        // Getters and setters
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }

        public TrackingStatus getStatus() { return status; }
        public void setStatus(TrackingStatus status) { this.status = status; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}