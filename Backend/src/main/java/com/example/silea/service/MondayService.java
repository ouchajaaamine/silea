package com.example.silea.service;

import com.example.silea.config.MondayConfig;
import com.example.silea.entity.Order;
import com.example.silea.entity.OrderItem;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service to interact with Monday.com GraphQL API
 * Handles order creation and synchronization with Monday.com boards
 */
@Service
public class MondayService {

    private static final Logger logger = LoggerFactory.getLogger(MondayService.class);

    private final MondayConfig mondayConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public MondayService(MondayConfig mondayConfig, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.mondayConfig = mondayConfig;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Create a new item in Monday.com board for a placed order
     * @param order The order to create in Monday.com
     * @return The Monday.com item ID, or null if creation failed
     */
    public String createOrderItem(Order order) {
        if (!mondayConfig.isEnabled()) {
            logger.info("Monday.com integration is disabled, skipping order creation for order {}", order.getOrderNumber());
            return null;
        }

        try {
            logger.info("Creating Monday.com item for order: {}", order.getOrderNumber());

            // Build the GraphQL mutation
            String mutation = buildCreateItemMutation(order);

            // Execute the GraphQL request
            String response = executeGraphQLRequest(mutation);

            // Parse the response to get the item ID
            String itemId = parseItemIdFromResponse(response);

            logger.info("Successfully created Monday.com item {} for order {}", itemId, order.getOrderNumber());
            return itemId;

        } catch (Exception e) {
            logger.error("Failed to create Monday.com item for order {}: {}", order.getOrderNumber(), e.getMessage(), e);
            // Don't throw exception - we don't want to fail the order if Monday.com is down
            return null;
        }
    }

    /**
     * Update order status in Monday.com
     * @param mondayItemId The Monday.com item ID
     * @param status The new status
     * @return true if update was successful
     */
    public boolean updateOrderStatus(String mondayItemId, String status) {
        if (!mondayConfig.isEnabled()) {
            logger.info("Monday.com integration is disabled, skipping status update");
            return false;
        }

        try {
            logger.info("Updating Monday.com item {} status to {}", mondayItemId, status);

            String mutation = String.format(
                "mutation { change_simple_column_value (item_id: %s, board_id: %s, column_id: \"status\", value: \"%s\") { id } }",
                mondayItemId,
                mondayConfig.getBoardId(),
                status
            );

            executeGraphQLRequest(mutation);
            logger.info("Successfully updated Monday.com item {} status", mondayItemId);
            return true;

        } catch (Exception e) {
            logger.error("Failed to update Monday.com item {} status: {}", mondayItemId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Build GraphQL mutation to create an item with order details
     */
    private String buildCreateItemMutation(Order order) {
        // Format order items for display
        String itemsList = order.getOrderItems().stream()
            .map(item -> String.format("%s x%d (%.2f MAD)",
                item.getProduct().getName(),
                item.getQuantity(),
                item.getUnitPrice()))
            .collect(Collectors.joining("\\n"));

        // Escape special characters for GraphQL
        String customerName = escapeGraphQL(order.getCustomer().getName());
        String customerEmail = escapeGraphQL(order.getCustomer().getEmail());
        String customerPhone = escapeGraphQL(order.getCustomer().getPhone());
        String shippingAddress = escapeGraphQL(order.getShippingAddress());
        String itemsListEscaped = escapeGraphQL(itemsList);

        // Build column values JSON (adjust column IDs based on your Monday.com board structure)
        Map<String, Object> columnValues = new HashMap<>();
        columnValues.put("text", order.getOrderNumber()); // Order Number column
        columnValues.put("text4", customerName); // Customer Name column
        columnValues.put("email", Map.of("email", customerEmail, "text", customerEmail)); // Email column
        columnValues.put("phone", customerPhone); // Phone column
        columnValues.put("long_text", itemsListEscaped); // Items column
        columnValues.put("numbers", order.getTotal()); // Total column
        columnValues.put("status", mapOrderStatus(order.getStatus())); // Status column
        columnValues.put("text9", shippingAddress); // Address column

        String columnValuesJson;
        try {
            columnValuesJson = objectMapper.writeValueAsString(columnValues);
            // Escape the JSON string for GraphQL
            columnValuesJson = escapeGraphQL(columnValuesJson);
        } catch (Exception e) {
            logger.error("Failed to serialize column values", e);
            columnValuesJson = "{}";
        }

        // Build the mutation
        return String.format(
            "mutation { create_item (board_id: %s, item_name: \"%s\", column_values: \"%s\") { id } }",
            mondayConfig.getBoardId(),
            order.getOrderNumber(),
            columnValuesJson
        );
    }

    /**
     * Map internal order status to Monday.com status labels
     */
    private String mapOrderStatus(com.example.silea.enums.OrderStatus status) {
        switch (status) {
            case PENDING:
                return "Pending";
            case CONFIRMED:
                return "Confirmed";
            case PROCESSING:
                return "Processing";
            case SHIPPED:
                return "Shipped";
            case DELIVERED:
                return "Delivered";
            case CANCELLED:
                return "Cancelled";
            default:
                return "Pending";
        }
    }

    /**
     * Execute GraphQL request to Monday.com API
     */
    private String executeGraphQLRequest(String query) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", mondayConfig.getApiToken());
        headers.set("API-Version", "2023-10");

        Map<String, String> body = new HashMap<>();
        body.put("query", query);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        logger.debug("Sending GraphQL request to Monday.com: {}", query);

        ResponseEntity<String> response = restTemplate.exchange(
            mondayConfig.getApiUrl(),
            HttpMethod.POST,
            request,
            String.class
        );

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Monday.com API returned status: " + response.getStatusCode());
        }

        logger.debug("Monday.com API response: {}", response.getBody());
        return response.getBody();
    }

    /**
     * Parse item ID from Monday.com GraphQL response
     */
    private String parseItemIdFromResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode data = root.path("data");
            
            // Try create_item response
            if (data.has("create_item")) {
                return data.path("create_item").path("id").asText();
            }
            
            // Try change_simple_column_value response
            if (data.has("change_simple_column_value")) {
                return data.path("change_simple_column_value").path("id").asText();
            }

            throw new RuntimeException("Could not find item ID in response");
        } catch (Exception e) {
            logger.error("Failed to parse Monday.com response: {}", response, e);
            throw new RuntimeException("Failed to parse Monday.com response", e);
        }
    }

    /**
     * Escape special characters for GraphQL string
     */
    private String escapeGraphQL(String input) {
        if (input == null) {
            return "";
        }
        return input
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }
}
