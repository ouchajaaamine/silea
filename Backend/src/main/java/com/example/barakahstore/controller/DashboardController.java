package com.example.barakahstore.controller;

import com.example.barakahstore.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final OrderService orderService;
    private final CustomerService customerService;
    private final ProductService productService;
    private final OrderTrackingService orderTrackingService;

    public DashboardController(OrderService orderService, CustomerService customerService,
                             ProductService productService, OrderTrackingService orderTrackingService) {
        this.orderService = orderService;
        this.customerService = customerService;
        this.productService = productService;
        this.orderTrackingService = orderTrackingService;
    }

    /**
     * Get main dashboard statistics
     */
    @GetMapping("/stats")
    @Operation(summary = "Get main dashboard statistics", description = "Retrieve various statistics for the dashboard")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved dashboard statistics",
            content = @Content(mediaType = "application/json", example = "{\"orders\": {\"totalOrders\": 100, \"pendingOrders\": 10, \"completedOrders\": 80, \"cancelledOrders\": 10},\"customers\": {\"totalCustomers\": 50, \"activeCustomers\": 40, \"inactiveCustomers\": 10},\"products\": {\"totalProducts\": 200, \"activeProducts\": 180, \"inactiveProducts\": 20, \"lowStockProducts\": 5},\"tracking\": {\"totalTrackings\": 90, \"inTransit\": 30, \"delivered\": 50, \"pending\": 10}}")),
        @ApiResponse(responseCode = "500", description = "Error retrieving dashboard statistics",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving dashboard statistics: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // Order statistics
            OrderService.OrderStatistics orderStats = orderService.getOrderStatistics();
            stats.put("orders", orderStats);

            // Customer statistics
            CustomerService.CustomerStatistics customerStats = customerService.getCustomerStatistics();
            stats.put("customers", customerStats);

            // Product statistics
            ProductService.ProductStatistics productStats = productService.getProductStatistics();
            stats.put("products", productStats);

            // Tracking statistics
            OrderTrackingService.TrackingStatistics trackingStats = orderTrackingService.getTrackingStatistics();
            stats.put("tracking", trackingStats);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving dashboard statistics: " + e.getMessage());
        }
    }

    /**
     * Get recent orders for dashboard
     */
    @GetMapping("/recent-orders")
    @Operation(summary = "Get recent orders", description = "Retrieve a list of recent orders for the dashboard")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved recent orders",
            content = @Content(mediaType = "application/json", example = "{\"orders\": [], \"message\": \"Recent orders feature not yet implemented\"}")),
        @ApiResponse(responseCode = "500", description = "Error retrieving recent orders",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving recent orders: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getRecentOrders(@RequestParam(defaultValue = "10") int limit) {
        try {
            // For now, return empty list - would need to implement in OrderService
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("orders", new java.util.ArrayList<>());
                put("message", "Recent orders feature not yet implemented");
            }});
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving recent orders: " + e.getMessage());
        }
    }

    /**
     * Get delivery performance metrics
     */
    @GetMapping("/delivery-performance")
    @Operation(summary = "Get delivery performance metrics", description = "Retrieve metrics related to delivery performance")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved delivery performance metrics",
            content = @Content(mediaType = "application/json", example = "{\"averageDeliveryTime\": 24.5, \"delayedOrdersCount\": 5}")),
        @ApiResponse(responseCode = "500", description = "Error retrieving delivery performance metrics",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving delivery performance: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getDeliveryPerformance() {
        try {
            Map<String, Object> performance = new HashMap<>();
            performance.put("averageDeliveryTime", orderTrackingService.getAverageDeliveryTime());
            performance.put("delayedOrdersCount", orderTrackingService.getOrdersWithDelayedTracking(48).size());

            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving delivery performance: " + e.getMessage());
        }
    }

    /**
     * Get inventory alerts
     */
    @GetMapping("/inventory-alerts")
    @Operation(summary = "Get inventory alerts", description = "Retrieve alerts related to product inventory")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved inventory alerts",
            content = @Content(mediaType = "application/json", example = "{\"lowStockProducts\": [\"Product A\", \"Product B\"], \"totalProducts\": 200}")),
        @ApiResponse(responseCode = "500", description = "Error retrieving inventory alerts",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving inventory alerts: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getInventoryAlerts() {
        try {
            Map<String, Object> alerts = new HashMap<>();
            alerts.put("lowStockProducts", productService.getProductStatistics().getLowStockProducts());
            alerts.put("totalProducts", productService.getProductStatistics().getTotalProducts());

            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving inventory alerts: " + e.getMessage());
        }
    }

    /**
     * Get real-time alerts and notifications
     */
    @GetMapping("/alerts")
    @Operation(summary = "Get real-time alerts and notifications", description = "Retrieve various real-time alerts for the dashboard")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved dashboard alerts",
            content = @Content(mediaType = "application/json", example = "{\"lowStockCount\": 5, \"pendingOrdersCount\": 3, \"delayedDeliveriesCount\": 2}")),
        @ApiResponse(responseCode = "500", description = "Error retrieving dashboard alerts",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving dashboard alerts: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getDashboardAlerts() {
        try {
            Map<String, Object> alerts = new HashMap<>();

            // Low stock alerts
            alerts.put("lowStockCount", productService.getProductStatistics().getLowStockProducts());

            // Pending orders
            alerts.put("pendingOrdersCount", orderService.getOrderStatistics().getPendingOrders());

            // Delayed deliveries
            alerts.put("delayedDeliveriesCount", orderTrackingService.getOrdersWithDelayedTracking(48).size());

            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving dashboard alerts: " + e.getMessage());
        }
    }
}