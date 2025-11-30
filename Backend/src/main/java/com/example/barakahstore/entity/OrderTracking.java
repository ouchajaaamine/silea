package com.example.barakahstore.entity;

import com.example.barakahstore.enums.TrackingStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_tracking")
public class OrderTracking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore  // Prevent circular reference - tracking doesn't need to expose its order
    private Order order;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrackingStatus status;
    
    @Column(name = "status_date", nullable = false)
    private LocalDateTime statusDate;
    
    @Column
    private String location;
    
    @Column
    private String carrier;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Default constructor
    public OrderTracking() {}
    
    // Constructor
    public OrderTracking(Order order, TrackingStatus status, String location, String carrier, String notes) {
        this.order = order;
        this.status = status;
        this.statusDate = LocalDateTime.now();
        this.location = location;
        this.carrier = carrier;
        this.notes = notes;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Order getOrder() {
        return order;
    }
    
    public void setOrder(Order order) {
        this.order = order;
    }
    
    public TrackingStatus getStatus() {
        return status;
    }
    
    public void setStatus(TrackingStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getStatusDate() {
        return statusDate;
    }
    
    public void setStatusDate(LocalDateTime statusDate) {
        this.statusDate = statusDate;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getCarrier() {
        return carrier;
    }
    
    public void setCarrier(String carrier) {
        this.carrier = carrier;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}