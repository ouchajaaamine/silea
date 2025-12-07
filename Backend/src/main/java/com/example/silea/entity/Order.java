package com.example.silea.entity;

import com.example.silea.enums.OrderStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber; // Format: CMD001, CMD002, etc.
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;
    
    @Column(name = "shipping_address", nullable = false)
    private String shippingAddress;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "tracking_code", unique = true)
    private String trackingCode;
    
    @Column(name = "estimated_delivery_date")
    private LocalDateTime estimatedDeliveryDate;
    
    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // Prevent circular reference - orders don't need to expose their items in basic queries
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // Prevent circular reference - orders don't need to expose tracking info in basic queries
    private List<OrderTracking> orderTrackings;    // Default constructor
    public Order() {}
    
    // Constructor
    public Order(String orderNumber, Customer customer, BigDecimal total, String shippingAddress) {
        this.orderNumber = orderNumber;
        this.customer = customer;
        this.total = total;
        this.shippingAddress = shippingAddress;
        this.orderDate = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
    
    public Customer getCustomer() {
        return customer;
    }
    
    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
    
    public BigDecimal getTotal() {
        return total;
    }
    
    public void setTotal(BigDecimal total) {
        this.total = total;
    }
    
    public OrderStatus getStatus() {
        return status;
    }
    
    public void setStatus(OrderStatus status) {
        this.status = status;
    }
    
    public String getShippingAddress() {
        return shippingAddress;
    }
    
    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getTrackingCode() {
        return trackingCode;
    }
    
    public void setTrackingCode(String trackingCode) {
        this.trackingCode = trackingCode;
    }
    
    public LocalDateTime getEstimatedDeliveryDate() {
        return estimatedDeliveryDate;
    }
    
    public void setEstimatedDeliveryDate(LocalDateTime estimatedDeliveryDate) {
        this.estimatedDeliveryDate = estimatedDeliveryDate;
    }
    
    public LocalDateTime getOrderDate() {
        return orderDate;
    }
    
    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<OrderItem> getOrderItems() {
        return orderItems;
    }
    
    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }
    
    public List<OrderTracking> getOrderTrackings() {
        return orderTrackings;
    }
    
    public void setOrderTrackings(List<OrderTracking> orderTrackings) {
        this.orderTrackings = orderTrackings;
    }
}