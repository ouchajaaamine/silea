package com.example.silea.scheduler;

import com.example.silea.config.SenditProperties;
import com.example.silea.dto.sendit.SenditDeliveriesListResponse;
import com.example.silea.dto.sendit.SenditDeliveryResponse;
import com.example.silea.entity.Order;
import com.example.silea.enums.OrderStatus;
import com.example.silea.repository.OrderRepository;
import com.example.silea.service.SenditService;
import com.example.silea.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Scheduled task to sync delivery statuses from Sendit.ma
 * Runs every 5 minutes by default
 */
@Component
public class SenditSyncScheduler {
    
    private static final Logger logger = LoggerFactory.getLogger(SenditSyncScheduler.class);
    
    private final SenditService senditService;
    private final OrderRepository orderRepository;
    private final SenditProperties senditProperties;
    private final EmailService emailService;
    
    public SenditSyncScheduler(SenditService senditService, 
                               OrderRepository orderRepository,
                               SenditProperties senditProperties,
                               EmailService emailService) {
        this.senditService = senditService;
        this.orderRepository = orderRepository;
        this.senditProperties = senditProperties;
        this.emailService = emailService;
    }
    
    /**
     * Sync delivery statuses from Sendit.ma every 5 minutes
     * Fixed delay ensures the next execution starts 5 minutes after the previous one completes
     * The interval is configurable via sendit.sync-interval-minutes property (default: 5 minutes)
     */
    @Scheduled(fixedDelayString = "#{${sendit.sync-interval-minutes:5} * 60 * 1000}", initialDelay = 60000)
    public void syncDeliveryStatuses() {
        if (!senditProperties.isEnabled()) {
            logger.debug("Sendit sync is disabled");
            return;
        }
        
        logger.info("Starting Sendit delivery status sync...");
        
        try {
            // Get all orders that have Sendit tracking codes and are not in final status
            List<Order> ordersToSync = orderRepository.findOrdersWithSenditTrackingNotFinal();
            
            if (ordersToSync.isEmpty()) {
                logger.info("No orders to sync with Sendit");
                return;
            }
            
            logger.info("Found {} orders to sync with Sendit", ordersToSync.size());
            
            int successCount = 0;
            int errorCount = 0;
            int statusChangedCount = 0;
            
            for (Order order : ordersToSync) {
                try {
                    // Get delivery info from Sendit
                    SenditDeliveryResponse delivery = senditService.getDeliveryByTrackingCode(
                        order.getSenditTrackingCode()
                    );
                    
                    if (delivery != null) {
                        // Map Sendit status to our OrderStatus
                        OrderStatus newStatus = senditService.mapSenditStatusToOrderStatus(delivery.getStatus());
                        
                        if (newStatus != null && newStatus != order.getStatus()) {
                            // Status has changed, update the order
                            OrderStatus oldStatus = order.getStatus();
                            order.setStatus(newStatus);
                            order.setLastSenditSync(LocalDateTime.now());
                            orderRepository.save(order);
                            
                            statusChangedCount++;
                            logger.info("Updated order {} status from {} to {}", 
                                order.getOrderNumber(), oldStatus, newStatus);
                            
                            // Send email notification about status change
                            try {
                                emailService.sendDeliveryStatusUpdate(order, oldStatus, newStatus);
                            } catch (Exception e) {
                                logger.error("Failed to send email notification for order {}: {}", 
                                    order.getOrderNumber(), e.getMessage());
                            }
                        } else {
                            // No status change, just update sync time
                            order.setLastSenditSync(LocalDateTime.now());
                            orderRepository.save(order);
                            logger.debug("No status change for order {}", order.getOrderNumber());
                        }
                        
                        successCount++;
                    } else {
                        logger.warn("Could not find delivery in Sendit for order {} with tracking code {}", 
                            order.getOrderNumber(), order.getSenditTrackingCode());
                        errorCount++;
                    }
                    
                } catch (Exception e) {
                    logger.error("Error syncing order {}: {}", order.getOrderNumber(), e.getMessage(), e);
                    errorCount++;
                }
                
                // Add a small delay between API calls to avoid rate limiting
                try {
                    Thread.sleep(500); // 500ms delay between requests
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
            
            logger.info("Sendit sync completed. Success: {}, Errors: {}, Status changes: {}", 
                successCount, errorCount, statusChangedCount);
            
        } catch (Exception e) {
            logger.error("Error during Sendit sync: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Alternative approach: Fetch all deliveries from Sendit and update matching orders
     * This can be more efficient if you have many orders
     */
    public void syncAllDeliveries() {
        if (!senditProperties.isEnabled()) {
            return;
        }
        
        logger.info("Starting bulk Sendit delivery sync...");
        
        try {
            int page = 1;
            boolean hasMorePages = true;
            int totalUpdated = 0;
            
            while (hasMorePages) {
                SenditDeliveriesListResponse response = senditService.getDeliveries(page, null);
                
                if (response == null || response.getData() == null || response.getData().isEmpty()) {
                    hasMorePages = false;
                    break;
                }
                
                for (SenditDeliveryResponse delivery : response.getData()) {
                    try {
                        // Find order by Sendit tracking code
                        Optional<Order> orderOpt = orderRepository.findBySenditTrackingCode(delivery.getTrackingCode());
                        
                        if (orderOpt.isPresent()) {
                            Order order = orderOpt.get();
                            OrderStatus newStatus = senditService.mapSenditStatusToOrderStatus(delivery.getStatus());
                            
                            if (newStatus != null && newStatus != order.getStatus()) {
                                OrderStatus oldStatus = order.getStatus();
                                order.setStatus(newStatus);
                                order.setLastSenditSync(LocalDateTime.now());
                                orderRepository.save(order);
                                totalUpdated++;
                                
                                logger.info("Bulk sync: Updated order {} status from {} to {}", 
                                    order.getOrderNumber(), oldStatus, newStatus);
                            }
                        }
                    } catch (Exception e) {
                        logger.error("Error processing delivery in bulk sync: {}", e.getMessage());
                    }
                }
                
                // Check if there are more pages
                hasMorePages = page < response.getTotalPages();
                page++;
            }
            
            logger.info("Bulk Sendit sync completed. Total orders updated: {}", totalUpdated);
            
        } catch (Exception e) {
            logger.error("Error during bulk Sendit sync: {}", e.getMessage(), e);
        }
    }
}
