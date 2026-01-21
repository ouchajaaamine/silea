package com.example.silea.dto.sendit;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response DTO for Sendit.ma delivery creation
 */
public class SenditDeliveryResponse {
    
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("tracking_code")
    private String trackingCode;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("customer_name")
    private String customerName;
    
    @JsonProperty("customer_phone")
    private String customerPhone;
    
    @JsonProperty("customer_address")
    private String customerAddress;
    
    @JsonProperty("customer_city")
    private String customerCity;
    
    @JsonProperty("order_reference")
    private String orderReference;
    
    @JsonProperty("amount")
    private Double amount;
    
    @JsonProperty("created_at")
    private String createdAt;
    
    @JsonProperty("updated_at")
    private String updatedAt;
    
    // Constructors
    public SenditDeliveryResponse() {}
    
    // Getters and Setters
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTrackingCode() {
        return trackingCode;
    }
    
    public void setTrackingCode(String trackingCode) {
        this.trackingCode = trackingCode;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public String getCustomerPhone() {
        return customerPhone;
    }
    
    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }
    
    public String getCustomerAddress() {
        return customerAddress;
    }
    
    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }
    
    public String getCustomerCity() {
        return customerCity;
    }
    
    public void setCustomerCity(String customerCity) {
        this.customerCity = customerCity;
    }
    
    public String getOrderReference() {
        return orderReference;
    }
    
    public void setOrderReference(String orderReference) {
        this.orderReference = orderReference;
    }
    
    public Double getAmount() {
        return amount;
    }
    
    public void setAmount(Double amount) {
        this.amount = amount;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
