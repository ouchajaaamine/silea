package com.example.silea.controller;

import com.example.silea.entity.Order;
import com.example.silea.enums.OrderStatus;
import com.example.silea.repository.OrderRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Controller to handle webhooks from Monday.com
 * Receives status updates and synchronizes with local database
 */
@RestController
@RequestMapping("/api/webhooks/monday")
@CrossOrigin(origins = "*")
public class MondayWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(MondayWebhookController.class);

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    public MondayWebhookController(OrderRepository orderRepository, ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Handle webhook challenge verification from Monday.com
     * When first setting up the webhook, Monday.com sends a challenge that must be echoed back
     */
    @PostMapping
    public ResponseEntity<?> handleWebhook(@RequestBody String payload, @RequestHeader Map<String, String> headers) {
        try {
            logger.info("Received Monday.com webhook");
            logger.debug("Webhook payload: {}", payload);
            logger.debug("Webhook headers: {}", headers);

            // Parse the webhook payload
            JsonNode webhookData = objectMapper.readTree(payload);

            // Handle challenge verification
            if (webhookData.has("challenge")) {
                String challenge = webhookData.get("challenge").asText();
                logger.info("Responding to Monday.com webhook challenge: {}", challenge);
                return ResponseEntity.ok(Map.of("challenge", challenge));
            }

            // Handle webhook event
            if (webhookData.has("event")) {
                JsonNode event = webhookData.get("event");
                String eventType = event.path("type").asText();

                logger.info("Processing Monday.com event type: {}", eventType);

                // Handle item column value change (status update)
                if ("update_column_value".equals(eventType) || "change_column_value".equals(eventType)) {
                    handleStatusUpdate(event);
                }

                return ResponseEntity.ok(Map.of("status", "received"));
            }

            logger.warn("Unknown webhook format received");
            return ResponseEntity.ok(Map.of("status", "unknown_format"));

        } catch (Exception e) {
            logger.error("Error processing Monday.com webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to process webhook"));
        }
    }

    /**
     * Handle status update from Monday.com
     */
    private void handleStatusUpdate(JsonNode event) {
        try {
            // Extract relevant data from the webhook event
            String itemName = event.path("pulseId").asText(); // Item name (our order number)
            String columnId = event.path("columnId").asText();
            JsonNode value = event.path("value");

            logger.info("Status update for item: {}, column: {}, value: {}", itemName, columnId, value);

            // Only process if it's the status column
            if (!"status".equals(columnId)) {
                logger.debug("Ignoring non-status column update: {}", columnId);
                return;
            }

            // Extract the new status label
            String statusLabel = extractStatusLabel(value);
            if (statusLabel == null) {
                logger.warn("Could not extract status label from value: {}", value);
                return;
            }

            // Map Monday.com status to internal OrderStatus
            OrderStatus newStatus = mapMondayStatusToOrderStatus(statusLabel);
            if (newStatus == null) {
                logger.warn("Could not map Monday.com status '{}' to internal status", statusLabel);
                return;
            }

            // Find the order by order number (item name in Monday.com)
            // The item name should be the order number
            Optional<Order> orderOpt = orderRepository.findByOrderNumber(itemName);
            
            if (orderOpt.isEmpty()) {
                // Try to extract order number from item name if it contains additional text
                String orderNumber = extractOrderNumber(itemName);
                orderOpt = orderRepository.findByOrderNumber(orderNumber);
            }

            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                OrderStatus oldStatus = order.getStatus();

                // Update the order status
                order.setStatus(newStatus);
                orderRepository.save(order);

                logger.info("Successfully updated order {} status from {} to {} based on Monday.com webhook",
                    order.getOrderNumber(), oldStatus, newStatus);
            } else {
                logger.warn("Could not find order with number: {}", itemName);
            }

        } catch (Exception e) {
            logger.error("Error handling status update: {}", e.getMessage(), e);
        }
    }

    /**
     * Extract status label from Monday.com webhook value
     */
    private String extractStatusLabel(JsonNode value) {
        try {
            // Monday.com sends status as JSON object with label
            if (value.isObject() && value.has("label")) {
                return value.get("label").path("text").asText();
            }
            // Or as simple text
            if (value.isTextual()) {
                return value.asText();
            }
            // Or parse from JSON string
            if (value.isObject() && value.has("index")) {
                // Status index mapping (adjust based on your board configuration)
                int index = value.get("index").asInt();
                return getStatusByIndex(index);
            }
        } catch (Exception e) {
            logger.error("Error extracting status label", e);
        }
        return null;
    }

    /**
     * Get status label by index (Monday.com uses indices for status values)
     */
    private String getStatusByIndex(int index) {
        // These mappings depend on your Monday.com board status column configuration
        // Adjust these based on your actual status labels
        switch (index) {
            case 0: return "Pending";
            case 1: return "Confirmed";
            case 2: return "Processing";
            case 3: return "Shipped";
            case 4: return "Delivered";
            case 5: return "Cancelled";
            default: return "Pending";
        }
    }

    /**
     * Map Monday.com status label to internal OrderStatus enum
     */
    private OrderStatus mapMondayStatusToOrderStatus(String mondayStatus) {
        if (mondayStatus == null) {
            return null;
        }

        String status = mondayStatus.toLowerCase().trim();

        switch (status) {
            case "pending":
            case "new":
                return OrderStatus.PENDING;
            case "confirmed":
                return OrderStatus.CONFIRMED;
            case "processing":
            case "in progress":
                return OrderStatus.PROCESSING;
            case "shipped":
            case "out for delivery":
                return OrderStatus.SHIPPED;
            case "delivered":
            case "completed":
                return OrderStatus.DELIVERED;
            case "cancelled":
            case "canceled":
                return OrderStatus.CANCELLED;
            default:
                logger.warn("Unknown Monday.com status: {}", mondayStatus);
                return null;
        }
    }

    /**
     * Extract order number from item name (in case it has additional text)
     */
    private String extractOrderNumber(String itemName) {
        // Order numbers typically start with ORD- or similar pattern
        // Extract the pattern that matches your order number format
        if (itemName != null && itemName.contains("ORD-")) {
            int start = itemName.indexOf("ORD-");
            int end = itemName.indexOf(" ", start);
            if (end == -1) {
                end = itemName.length();
            }
            return itemName.substring(start, end);
        }
        return itemName;
    }

    /**
     * Health check endpoint for webhook configuration
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "monday-webhook",
            "timestamp", String.valueOf(System.currentTimeMillis())
        ));
    }
}
