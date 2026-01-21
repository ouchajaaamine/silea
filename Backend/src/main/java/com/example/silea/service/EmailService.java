package com.example.silea.service;

import com.example.silea.config.EmailConfig;
import com.example.silea.entity.Order;
import com.example.silea.enums.OrderStatus;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    private final EmailConfig emailConfig;
    private final EmailMessageTemplates messageTemplates;
    private final JavaMailSender mailSender;
    
    public EmailService(EmailConfig emailConfig, EmailMessageTemplates messageTemplates, JavaMailSender mailSender) {
        this.emailConfig = emailConfig;
        this.messageTemplates = messageTemplates;
        this.mailSender = mailSender;
        
        if (emailConfig.isEnabled()) {
            logger.info("Email service initialized successfully with address: {}", emailConfig.getFromAddress());
        } else {
            logger.info("Email service is disabled");
        }
    }
    
    /**
     * Send order confirmation email to customer
     */
    public void sendOrderConfirmation(Order order) {
        if (!emailConfig.isEnabled()) {
            logger.debug("Email is disabled, skipping order confirmation");
            return;
        }
        
        try {
            String customerEmail = order.getCustomer().getEmail();
            if (customerEmail == null || customerEmail.isEmpty()) {
                logger.warn("Customer email is empty for order: {}", order.getOrderNumber());
                return;
            }
            
            String trackingCode = order.getTrackingCode() != null ? order.getTrackingCode() : "N/A";
            String subject = messageTemplates.getOrderConfirmationSubject(order.getOrderNumber());
            String message = messageTemplates.getOrderConfirmationMessage(
                order.getCustomer().getName(),
                order.getOrderNumber(),
                order.getTotal().doubleValue(),
                getOrderItemsSummary(order),
                trackingCode
            );
            
            sendEmail(customerEmail, subject, message);
            logger.info("Order confirmation sent via email for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            logger.error("Failed to send order confirmation via email for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }
    
    /**
     * Send status update email to customer
     */
    public void sendStatusUpdate(Order order, OrderStatus newStatus) {
        if (!emailConfig.isEnabled()) {
            logger.debug("Email is disabled, skipping status update");
            return;
        }
        
        try {
            String customerEmail = order.getCustomer().getEmail();
            if (customerEmail == null || customerEmail.isEmpty()) {
                logger.warn("Customer email is empty for order: {}", order.getOrderNumber());
                return;
            }
            
            String trackingCode = order.getTrackingCode() != null ? order.getTrackingCode() : "N/A";
            
            logger.info("Attempting to send email status update: Order={}, Status={}, Customer={}, Email={}",
                order.getOrderNumber(), newStatus, order.getCustomer().getName(), customerEmail);
            
            String subject = messageTemplates.getStatusUpdateSubject(order.getOrderNumber(), newStatus);
            String message = messageTemplates.getStatusUpdateMessage(
                order.getCustomer().getName(),
                order.getOrderNumber(),
                newStatus,
                trackingCode
            );
            
            sendEmail(customerEmail, subject, message);
            logger.info("✓ Status update sent via email for order: {} - Status: {}", 
                order.getOrderNumber(), newStatus);
        } catch (Exception e) {
            logger.error("✗ Failed to send status update via email for order {}: {}", 
                order.getOrderNumber(), e.getMessage(), e);
        }
    }
    
    /**
     * Send delivery confirmation email
     */
    public void sendDeliveryConfirmation(Order order) {
        if (!emailConfig.isEnabled()) {
            logger.debug("Email is disabled, skipping delivery confirmation");
            return;
        }
        
        try {
            String customerEmail = order.getCustomer().getEmail();
            if (customerEmail == null || customerEmail.isEmpty()) {
                logger.warn("Customer email is empty for order: {}", order.getOrderNumber());
                return;
            }
            
            String trackingCode = order.getTrackingCode() != null ? order.getTrackingCode() : "N/A";
            String subject = messageTemplates.getStatusUpdateSubject(order.getOrderNumber(), OrderStatus.DELIVERED);
            String message = messageTemplates.getStatusUpdateMessage(
                order.getCustomer().getName(),
                order.getOrderNumber(),
                OrderStatus.DELIVERED,
                trackingCode
            );
            
            sendEmail(customerEmail, subject, message);
            logger.info("Delivery confirmation sent via email for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            logger.error("Failed to send delivery confirmation via email for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }
    
    /**
     * Send delivery status update email (for Sendit tracking updates)
     */
    public void sendDeliveryStatusUpdate(Order order, OrderStatus oldStatus, OrderStatus newStatus) {
        if (!emailConfig.isEnabled()) {
            logger.debug("Email is disabled, skipping delivery status update");
            return;
        }
        
        try {
            String customerEmail = order.getCustomer().getEmail();
            if (customerEmail == null || customerEmail.isEmpty()) {
                logger.warn("Customer email is empty for order: {}", order.getOrderNumber());
                return;
            }
            
            String senditTrackingCode = order.getSenditTrackingCode() != null ? order.getSenditTrackingCode() : "N/A";
            
            String subject = messageTemplates.getDeliveryStatusUpdateSubject(order.getOrderNumber(), newStatus);
            String message = messageTemplates.getDeliveryStatusUpdateMessage(
                order.getCustomer().getName(),
                order.getOrderNumber(),
                oldStatus,
                newStatus,
                senditTrackingCode
            );
            
            sendEmail(customerEmail, subject, message);
            logger.info("Delivery status update sent via email for order: {} - {} -> {}", 
                order.getOrderNumber(), oldStatus, newStatus);
        } catch (Exception e) {
            logger.error("Failed to send delivery status update via email for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }
    
    /**
     * Send email when Sendit tracking code is linked to order
     */
    public void sendSenditTrackingLinked(Order order) {
        if (!emailConfig.isEnabled()) {
            logger.debug("Email is disabled, skipping Sendit tracking notification");
            return;
        }
        
        try {
            String customerEmail = order.getCustomer().getEmail();
            if (customerEmail == null || customerEmail.isEmpty()) {
                logger.warn("Customer email is empty for order: {}", order.getOrderNumber());
                return;
            }
            
            String sileaTrackingCode = order.getTrackingCode() != null ? order.getTrackingCode() : "N/A";
            String senditTrackingCode = order.getSenditTrackingCode() != null ? order.getSenditTrackingCode() : "N/A";
            
            String subject = messageTemplates.getSenditTrackingLinkedSubject(order.getOrderNumber());
            String message = messageTemplates.getSenditTrackingLinkedMessage(
                order.getCustomer().getName(),
                order.getOrderNumber(),
                sileaTrackingCode,
                senditTrackingCode
            );
            
            sendEmail(customerEmail, subject, message);
            logger.info("Sendit tracking linked notification sent via email for order: {}", 
                order.getOrderNumber());
        } catch (Exception e) {
            logger.error("Failed to send Sendit tracking linked notification via email for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }
    
    /**
     * Send cancellation email
     */
    public void sendCancellationNotification(Order order, String reason) {
        if (!emailConfig.isEnabled()) {
            logger.debug("Email is disabled, skipping cancellation notification");
            return;
        }
        
        try {
            String customerEmail = order.getCustomer().getEmail();
            if (customerEmail == null || customerEmail.isEmpty()) {
                logger.warn("Customer email is empty for order: {}", order.getOrderNumber());
                return;
            }
            
            String subject = messageTemplates.getCancellationSubject(order.getOrderNumber());
            String message = messageTemplates.getCancellationMessage(
                order.getCustomer().getName(),
                order.getOrderNumber(),
                reason
            );
            
            sendEmail(customerEmail, subject, message);
            logger.info("Cancellation notification sent via email for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            logger.error("Failed to send cancellation notification via email for order {}: {}", 
                order.getOrderNumber(), e.getMessage());
        }
    }
    
    /**
     * Send HTML email
     */
    private void sendEmail(String toEmail, String subject, String htmlBody) {
        try {
            logger.info("Sending email: To={}, Subject={}", toEmail, subject);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(emailConfig.getFromAddress(), emailConfig.getFromName());
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML format
            
            mailSender.send(message);
            
            logger.info("✓ Email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("✗ Failed to send email to {}: {} - {}", 
                toEmail, e.getClass().getSimpleName(), e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    /**
     * Get order items summary for emails
     */
    private String getOrderItemsSummary(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return "<p>Aucun article / لا توجد منتجات</p>";
        }
        
        StringBuilder summary = new StringBuilder();
        summary.append("<ul style='list-style: none; padding: 0;'>");
        order.getOrderItems().forEach(item -> {
            summary.append(String.format(
                "<li style='padding: 8px; background: white; margin: 5px 0; border-radius: 5px;'>" +
                "• <strong>%dx</strong> %s</li>", 
                item.getQuantity(), 
                item.getProduct().getName()));
        });
        summary.append("</ul>");
        
        return summary.toString();
    }
}
