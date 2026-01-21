package com.example.silea.service;

import com.example.silea.config.SenditProperties;
import com.example.silea.dto.sendit.SenditCreateDeliveryRequest;
import com.example.silea.dto.sendit.SenditDeliveriesListResponse;
import com.example.silea.dto.sendit.SenditDeliveryResponse;
import com.example.silea.entity.Customer;
import com.example.silea.entity.Order;
import com.example.silea.enums.OrderStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for integrating with Sendit.ma delivery API
 */
@Service
public class SenditService {
    
    private static final Logger logger = LoggerFactory.getLogger(SenditService.class);
    
    private final SenditProperties senditProperties;
    private final RestTemplate restTemplate;
    
    public SenditService(SenditProperties senditProperties) {
        this.senditProperties = senditProperties;
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Create a delivery in Sendit.ma for the given order
     */
    public SenditDeliveryResponse createDelivery(Order order) {
        if (!senditProperties.isEnabled()) {
            logger.info("Sendit integration is disabled");
            return null;
        }
        
        try {
            Customer customer = order.getCustomer();
            
            // Prepare the request
            SenditCreateDeliveryRequest request = new SenditCreateDeliveryRequest();
            request.setCustomerName(customer.getName());
            request.setCustomerPhone(customer.getPhone());
            request.setCustomerAddress(order.getShippingAddress());
            request.setCustomerCity(order.getShippingCity());
            request.setOrderReference(order.getOrderNumber());
            request.setAmount(order.getTotal().doubleValue());
            request.setNotes(order.getNotes());
            
            // Make API call
            String url = senditProperties.getApiUrl() + "/deliveries";
            HttpHeaders headers = createHeaders();
            HttpEntity<SenditCreateDeliveryRequest> entity = new HttpEntity<>(request, headers);
            
            logger.info("Creating Sendit delivery for order: {}", order.getOrderNumber());
            ResponseEntity<SenditDeliveryResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                SenditDeliveryResponse.class
            );
            
            if (response.getStatusCode() == HttpStatus.CREATED || response.getStatusCode() == HttpStatus.OK) {
                SenditDeliveryResponse deliveryResponse = response.getBody();
                logger.info("Successfully created Sendit delivery. Tracking code: {}", 
                    deliveryResponse != null ? deliveryResponse.getTrackingCode() : "null");
                return deliveryResponse;
            } else {
                logger.error("Failed to create Sendit delivery. Status: {}", response.getStatusCode());
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error creating Sendit delivery for order {}: {}", 
                order.getOrderNumber(), e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Get deliveries from Sendit.ma with optional search query
     * This is used for syncing delivery statuses
     */
    public SenditDeliveriesListResponse getDeliveries(int page, String query) {
        if (!senditProperties.isEnabled()) {
            logger.debug("Sendit integration is disabled");
            return null;
        }
        
        try {
            // Build URL with query parameters
            UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl(senditProperties.getApiUrl() + "/deliveries")
                .queryParam("page", page);
            
            if (query != null && !query.isEmpty()) {
                builder.queryParam("querystring", query);
            }
            
            String url = builder.toUriString();
            HttpHeaders headers = createHeaders();
            HttpEntity<?> entity = new HttpEntity<>(headers);
            
            logger.debug("Fetching Sendit deliveries from: {}", url);
            ResponseEntity<SenditDeliveriesListResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                SenditDeliveriesListResponse.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                logger.error("Failed to fetch Sendit deliveries. Status: {}", response.getStatusCode());
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error fetching Sendit deliveries: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Get a specific delivery by tracking code
     */
    public SenditDeliveryResponse getDeliveryByTrackingCode(String trackingCode) {
        if (!senditProperties.isEnabled()) {
            logger.debug("Sendit integration is disabled");
            return null;
        }
        
        try {
            SenditDeliveriesListResponse response = getDeliveries(1, trackingCode);
            if (response != null && response.getData() != null && !response.getData().isEmpty()) {
                return response.getData().get(0);
            }
            return null;
        } catch (Exception e) {
            logger.error("Error fetching delivery by tracking code {}: {}", trackingCode, e.getMessage());
            return null;
        }
    }
    
    /**
     * Map Sendit status string to OrderStatus enum
     */
    public OrderStatus mapSenditStatusToOrderStatus(String senditStatus) {
        if (senditStatus == null) {
            return null;
        }
        
        // Normalize the status string
        String status = senditStatus.toLowerCase().trim();
        
        // Map Sendit statuses to our OrderStatus enum
        Map<String, OrderStatus> statusMap = new HashMap<>();
        statusMap.put("ramassage en cours", OrderStatus.PICKUP_REQUESTED);
        statusMap.put("ramassé", OrderStatus.PICKED_UP);
        statusMap.put("entrepôt", OrderStatus.IN_WAREHOUSE);
        statusMap.put("en transit", OrderStatus.IN_TRANSIT);
        statusMap.put("distribué", OrderStatus.OUT_FOR_DELIVERY);
        statusMap.put("en cours de livraison", OrderStatus.OUT_FOR_DELIVERY);
        statusMap.put("livré", OrderStatus.DELIVERED);
        statusMap.put("livré partiellement", OrderStatus.PARTIALLY_DELIVERED);
        statusMap.put("injoignable", OrderStatus.UNREACHABLE);
        statusMap.put("reporté", OrderStatus.POSTPONED);
        statusMap.put("programmé", OrderStatus.SCHEDULED);
        statusMap.put("refusés", OrderStatus.REFUSED);
        statusMap.put("annulés", OrderStatus.CANCELLED);
        
        OrderStatus mappedStatus = statusMap.get(status);
        if (mappedStatus == null) {
            logger.warn("Unknown Sendit status: {}", senditStatus);
        }
        
        return mappedStatus;
    }
    
    /**
     * Create HTTP headers with authentication
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Add authentication headers (adjust based on Sendit.ma API documentation)
        // This might need to be adjusted based on actual API requirements
        headers.set("X-Public-Key", senditProperties.getPublicKey());
        headers.set("X-Private-Key", senditProperties.getPrivateKey());
        
        // Alternative: if they use Bearer token authentication
        // headers.set("Authorization", "Bearer " + senditProperties.getPrivateKey());
        
        return headers;
    }
}
