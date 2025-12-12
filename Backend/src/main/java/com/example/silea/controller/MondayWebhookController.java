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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Controller to handle webhooks from Monday.com
 * Receives status updates and synchronizes with local database
 */
@RestController
@RequestMapping("/api/webhooks/monday")
@CrossOrigin(origins = "*")
public class MondayWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(MondayWebhookController.class);
    
    // Cache to track processed webhook UUIDs (prevents duplicate processing)
    private final ConcurrentHashMap<String, Long> processedWebhooks = new ConcurrentHashMap<>();
    private static final long CACHE_EXPIRY_MS = TimeUnit.MINUTES.toMillis(5);

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;
    private final com.example.silea.service.WhatsAppService whatsAppService;

    public MondayWebhookController(OrderRepository orderRepository, ObjectMapper objectMapper,
                                  com.example.silea.service.WhatsAppService whatsAppService) {
        this.orderRepository = orderRepository;
        this.objectMapper = objectMapper;
        this.whatsAppService = whatsAppService;
    }

    /**
     * Handle webhook challenge verification from Monday.com
     * When first setting up the webhook, Monday.com sends a challenge that must be echoed back
     */
    @PostMapping
    public ResponseEntity<?> handleWebhook(@RequestBody String payload, @RequestHeader Map<String, String> headers) {
        logger.info("=== MONDAY WEBHOOK RECEIVED ===");
        logger.info("Raw payload: {}", payload);
        logger.info("Headers: {}", headers);
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
            // Check for duplicate webhook using triggerUuid
            String triggerUuid = event.path("triggerUuid").asText();
            if (triggerUuid != null && !triggerUuid.isBlank()) {
                // Clean up expired entries
                long currentTime = System.currentTimeMillis();
                processedWebhooks.entrySet().removeIf(entry -> 
                    currentTime - entry.getValue() > CACHE_EXPIRY_MS);
                
                // Check if we've already processed this webhook
                if (processedWebhooks.containsKey(triggerUuid)) {
                    logger.debug("Skipping duplicate webhook with triggerUuid: {}", triggerUuid);
                    return;
                }
                
                // Mark this webhook as processed
                processedWebhooks.put(triggerUuid, currentTime);
            }
            
            // Extract relevant data from the webhook event
            // Monday sends both pulseId (numeric) and pulseName (item name). Our order number is stored in the item name.
            String pulseName = event.path("pulseName").asText();
            String itemName = pulseName != null && !pulseName.isBlank()
                ? pulseName
                : event.path("itemName").asText();
            if (itemName == null || itemName.isBlank()) {
                itemName = event.path("pulseId").asText(); // fallback to id
            }
            String columnId = event.path("columnId").asText();
            JsonNode value = event.path("value");

            logger.info("Webhook: type=change_column_value pulseId={} pulseName={} itemName={} columnId={} value={} rawEvent={}",
                event.path("pulseId").asText(), pulseName, itemName, columnId, value, event);

            // Only process if it's the status column (main or color column)
            if (!"status".equals(columnId) && !"color_mkyg7e83".equals(columnId)) {
                logger.debug("Ignoring non-status column update: {}", columnId);
                return;
            }

            // Extract the new status label
            String statusLabel = extractStatusLabel(value);
            logger.info("Webhook: extracted statusLabel={} from value={} columnId={}", statusLabel, value, columnId);
            if (statusLabel == null) {
                logger.warn("Could not extract status label from value: {}", value);
                return;
            }

            // Map Monday.com status to internal OrderStatus
            OrderStatus newStatus = mapMondayStatusToOrderStatus(statusLabel);
            logger.info("Webhook: mapped statusLabel={} to internal status={}", statusLabel, newStatus);
            if (newStatus == null) {
                logger.warn("Could not map Monday.com status '{}' to internal status", statusLabel);
                return;
            }

            // Find the order by order number (item name in Monday.com)
            // The item name should be the order number, but we normalize just in case
            Optional<Order> orderOpt = orderRepository.findByOrderNumber(itemName);

            if (orderOpt.isEmpty()) {
                // Try to extract order number from item name if it contains additional text
                String orderNumber = extractOrderNumber(itemName);
                if (orderNumber != null && !orderNumber.isBlank()) {
                    orderOpt = orderRepository.findByOrderNumber(orderNumber);
                }
            }

            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                OrderStatus oldStatus = order.getStatus();

                // Update the order status
                order.setStatus(newStatus);
                orderRepository.save(order);

                logger.info("Successfully updated order {} status from {} to {} based on Monday.com webhook",
                    order.getOrderNumber(), oldStatus, newStatus);
                
                // Send WhatsApp notification ONLY if status actually changed
                if (oldStatus != newStatus) {
                    try {
                        logger.info("Sending WhatsApp notification for status change: {} -> {}", 
                            oldStatus, newStatus);
                        whatsAppService.sendStatusUpdate(order, newStatus);
                    } catch (Exception e) {
                        logger.error("Failed to send WhatsApp notification for order {}: {}", 
                            order.getOrderNumber(), e.getMessage());
                    }
                } else {
                    logger.debug("Skipping WhatsApp notification - status unchanged: {}", newStatus);
                }
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
                // sometimes label is a plain string, sometimes nested text
                JsonNode label = value.get("label");
                if (label.isTextual()) return label.asText();
                if (label.has("text")) return label.get("text").asText();
            }

            // Status index mapping as object
            if (value.isObject() && value.has("index")) {
                int index = value.get("index").asInt();
                return getStatusByIndex(index);
            }

            // Or as simple text (may already be the label, or a JSON string)
            if (value.isTextual()) {
                String txt = value.asText();
                // Try to parse if it's a JSON string containing label/index
                if (txt.trim().startsWith("{") && txt.contains("label")) {
                    JsonNode parsed = objectMapper.readTree(txt);
                    if (parsed.has("label")) {
                        JsonNode label = parsed.get("label");
                        if (label.isTextual()) return label.asText();
                        if (label.has("text")) return label.get("text").asText();
                    }
                    if (parsed.has("index")) {
                        int index = parsed.get("index").asInt();
                        return getStatusByIndex(index);
                    }
                }
                return txt;
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
            case 1: return "En attente";
            case 2: return "Confirmé";
            case 3: return "En traitement";
            case 4: return "Expédié";
            case 5: return "Livré";
            case 6: return "Annulé";
            default: return "En attente";
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
            case "en attente":
            case "new":
                return OrderStatus.PENDING;
            case "confirmed":
            case "confirmé":
                return OrderStatus.CONFIRMED;
            case "processing":
            case "en traitement":
            case "in progress":
                return OrderStatus.PROCESSING;
            case "shipped":
            case "expédié":
            case "out for delivery":
                return OrderStatus.SHIPPED;
            case "delivered":
            case "livré":
            case "completed":
                return OrderStatus.DELIVERED;
            case "cancelled":
            case "canceled":
            case "annulé":
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
        if (itemName == null || itemName.isBlank()) {
            return null;
        }

        // Match common order number patterns, e.g., CMD001, CMD019, ORD-2025001, etc.
        String upper = itemName.toUpperCase();

        // CMD### pattern
        java.util.regex.Matcher cmdMatcher = java.util.regex.Pattern.compile("CMD\\d+").matcher(upper);
        if (cmdMatcher.find()) {
            return cmdMatcher.group();
        }

        // ORD-... pattern
        int ordIdx = upper.indexOf("ORD-");
        if (ordIdx >= 0) {
            int end = upper.indexOf(" ", ordIdx);
            if (end == -1) end = upper.length();
            return itemName.substring(ordIdx, end);
        }

        // Fallback: trimmed original name
        return itemName.trim();
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
