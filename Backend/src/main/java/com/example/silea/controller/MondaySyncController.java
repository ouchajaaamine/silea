package com.example.silea.controller;

import com.example.silea.entity.Order;
import com.example.silea.service.MondayService;
import com.example.silea.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/monday-sync")
@CrossOrigin(origins = "*")
public class MondaySyncController {

    private static final Logger logger = LoggerFactory.getLogger(MondaySyncController.class);

    private final OrderService orderService;
    private final MondayService mondayService;

    public MondaySyncController(OrderService orderService, MondayService mondayService) {
        this.orderService = orderService;
        this.mondayService = mondayService;
    }

    /**
     * Synchronize a specific order to Monday.com by order number
     */
    @PostMapping("/order/{orderNumber}")
    public ResponseEntity<Map<String, Object>> syncOrderByNumber(@PathVariable String orderNumber) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Manual sync requested for order: {}", orderNumber);
            
            // Find the order
            Order order = orderService.findByOrderNumber(orderNumber).orElse(null);
            
            if (order == null) {
                response.put("success", false);
                response.put("message", "Order not found: " + orderNumber);
                return ResponseEntity.notFound().build();
            }
            
            // Create item in Monday.com
            String mondayItemId = mondayService.createOrderItem(order);
            
            if (mondayItemId != null) {
                response.put("success", true);
                response.put("message", "Order synchronized successfully");
                response.put("orderNumber", orderNumber);
                response.put("mondayItemId", mondayItemId);
                logger.info("Successfully synced order {} to Monday.com with item ID: {}", orderNumber, mondayItemId);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Failed to create Monday.com item");
                return ResponseEntity.internalServerError().body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error syncing order {} to Monday.com: {}", orderNumber, e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Synchronize all orders to Monday.com
     */
    @PostMapping("/all-orders")
    public ResponseEntity<Map<String, Object>> syncAllOrders() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Manual sync requested for all orders");
            
            List<Order> orders = orderService.getAllOrders(0, 1000);
            int successCount = 0;
            int failCount = 0;
            
            for (Order order : orders) {
                try {
                    String mondayItemId = mondayService.createOrderItem(order);
                    if (mondayItemId != null) {
                        successCount++;
                        logger.info("Synced order {} to Monday.com", order.getOrderNumber());
                    } else {
                        failCount++;
                    }
                } catch (Exception e) {
                    failCount++;
                    logger.error("Failed to sync order {}: {}", order.getOrderNumber(), e.getMessage());
                }
            }
            
            response.put("success", true);
            response.put("totalOrders", orders.size());
            response.put("successCount", successCount);
            response.put("failCount", failCount);
            response.put("message", String.format("Synced %d/%d orders successfully", successCount, orders.size()));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error syncing all orders to Monday.com: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
