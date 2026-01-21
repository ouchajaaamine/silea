package com.example.silea.dto.sendit;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request DTO for creating a delivery in Sendit.ma
 */
public class SenditCreateDeliveryRequest {
    
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
    private Double amount;  // Cash on delivery amount
    
    @JsonProperty("notes")
    private String notes;
    
    // Constructors
    public SenditCreateDeliveryRequest() {}
    
    // Getters and Setters
    
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
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
