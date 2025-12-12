package com.example.silea.service;

import com.example.silea.config.WhatsAppConfig;
import com.example.silea.entity.Order;
import com.example.silea.enums.OrderStatus;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppService {
    
    private static final Logger logger = LoggerFactory.getLogger(WhatsAppService.class);
    
    private final WhatsAppConfig whatsAppConfig;
    private final WhatsAppMessageTemplates messageTemplates;
    
    public WhatsAppService(WhatsAppConfig whatsAppConfig, WhatsAppMessageTemplates messageTemplates) {
        this.whatsAppConfig = whatsAppConfig;
        this.messageTemplates = messageTemplates;
        
        // Initialize Twilio client
        if (whatsAppConfig.isEnabled() && 
            whatsAppConfig.getAccountSid() != null && 
            !whatsAppConfig.getAccountSid().equals("your-twilio-account-sid")) {
            try {
                Twilio.init(whatsAppConfig.getAccountSid(), whatsAppConfig.getAuthToken());
                logger.info("WhatsApp service initialized successfully");
            } catch (Exception e) {
                logger.error("Failed to initialize WhatsApp service: {}", e.getMessage());
            }
        } else {
            logger.info("WhatsApp service is disabled or not configured");
        }
    }
    
    /**
     * Send order confirmation message to customer
     */
    public void sendOrderConfirmation(Order order) {
        if (!whatsAppConfig.isEnabled()) {
            logger.debug("WhatsApp is disabled, skipping order confirmation");
            return;
        }
        
        try {
            String customerPhone = formatPhoneNumber(order.getCustomer().getPhone());
            String trackingCode = order.getTrackingCode() != null ? order.getTrackingCode() : "N/A";
            String message = messageTemplates.getOrderConfirmationMessage(
                order.getCustomer().getName(),
                order.getOrderNumber(),
                order.getTotal().doubleValue(),
                getOrderItemsSummary(order),
                trackingCode
            );
            
            sendMessage(customerPhone, message);
            logger.info("Order confirmation sent via WhatsApp for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            logger.error("Failed to send order confirmation via WhatsApp for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }
    
    /**
     * Send status update message to customer
     */
    public void sendStatusUpdate(Order order, OrderStatus newStatus) {
        if (!whatsAppConfig.isEnabled()) {
            logger.debug("WhatsApp is disabled, skipping status update");
            return;
        }
        
        try {
            String customerPhone = formatPhoneNumber(order.getCustomer().getPhone());
            String trackingCode = order.getTrackingCode() != null ? order.getTrackingCode() : "N/A";
            String message = messageTemplates.getStatusUpdateMessage(
                order.getCustomer().getName(),
                order.getOrderNumber(),
                newStatus,
                trackingCode
            );
            
            sendMessage(customerPhone, message);
            logger.info("Status update sent via WhatsApp for order: {} - Status: {}", 
                order.getOrderNumber(), newStatus);
        } catch (Exception e) {
            logger.error("Failed to send status update via WhatsApp for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }
    
    /**
     * Send shipping notification with tracking info
     */
    public void sendShippingNotification(Order order, String trackingNumber) {
        if (!whatsAppConfig.isEnabled()) {
            logger.debug("WhatsApp is disabled, skipping shipping notification");
            return;
        }
        
        try {
            String customerPhone = formatPhoneNumber(order.getCustomer().getPhone());
            String message = messageTemplates.getShippingNotificationMessage(
                order.getCustomer().getName(),
                order.getOrderNumber(),
                trackingNumber
            );
            
            sendMessage(customerPhone, message);
            logger.info("Shipping notification sent via WhatsApp for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            logger.error("Failed to send shipping notification via WhatsApp for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }
    
    /**
     * Send delivery confirmation message
     */
    public void sendDeliveryConfirmation(Order order) {
        if (!whatsAppConfig.isEnabled()) {
            logger.debug("WhatsApp is disabled, skipping delivery confirmation");
            return;
        }
        
        try {
            String customerPhone = formatPhoneNumber(order.getCustomer().getPhone());
            String message = messageTemplates.getDeliveryConfirmationMessage(
                order.getCustomer().getName(),
                order.getOrderNumber()
            );
            
            sendMessage(customerPhone, message);
            logger.info("Delivery confirmation sent via WhatsApp for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            logger.error("Failed to send delivery confirmation via WhatsApp for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }
    
    /**
     * Send cancellation notification
     */
    public void sendCancellationNotification(Order order, String reason) {
        if (!whatsAppConfig.isEnabled()) {
            logger.debug("WhatsApp is disabled, skipping cancellation notification");
            return;
        }
        
        try {
            String customerPhone = formatPhoneNumber(order.getCustomer().getPhone());
            String message = messageTemplates.getCancellationMessage(
                order.getCustomer().getName(),
                order.getOrderNumber(),
                reason
            );
            
            sendMessage(customerPhone, message);
            logger.info("Cancellation notification sent via WhatsApp for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            logger.error("Failed to send cancellation notification via WhatsApp for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }
    
    /**
     * Send WhatsApp message using Twilio API
     */
    private void sendMessage(String toPhoneNumber, String messageBody) {
        try {
            Message message = Message.creator(
                new PhoneNumber(toPhoneNumber),
                new PhoneNumber(whatsAppConfig.getFromNumber()),
                messageBody
            ).create();
            
            logger.debug("WhatsApp message sent successfully. SID: {}", message.getSid());
        } catch (Exception e) {
            logger.error("Failed to send WhatsApp message to {}: {}", toPhoneNumber, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Format phone number to WhatsApp format (whatsapp:+212...)
     */
    private String formatPhoneNumber(String phone) {
        if (phone == null || phone.isEmpty()) {
            throw new IllegalArgumentException("Phone number cannot be empty");
        }
        
        // Remove all non-digit characters
        String cleaned = phone.replaceAll("[^0-9+]", "");
        
        // Add + if not present
        if (!cleaned.startsWith("+")) {
            // Assume Moroccan number if no country code
            if (cleaned.startsWith("0")) {
                cleaned = "+212" + cleaned.substring(1);
            } else if (cleaned.startsWith("212")) {
                cleaned = "+" + cleaned;
            } else {
                cleaned = "+212" + cleaned;
            }
        }
        
        return "whatsapp:" + cleaned;
    }
    
    /**
     * Get order items summary for messages
     */
    private String getOrderItemsSummary(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return "Aucun article";
        }
        
        StringBuilder summary = new StringBuilder();
        order.getOrderItems().forEach(item -> {
            summary.append(String.format("• %dx %s\n", 
                item.getQuantity(), 
                item.getProduct().getName()));
        });
        
        return summary.toString().trim();
    }
}
