package com.example.silea.entity;

import com.example.silea.enums.ProductSize;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_size_prices", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "size"})
})
public class ProductSizePrice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductSize size;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    // Default constructor
    public ProductSizePrice() {}
    
    // Constructor
    public ProductSizePrice(Product product, ProductSize size, BigDecimal price) {
        this.product = product;
        this.size = size;
        this.price = price;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Product getProduct() {
        return product;
    }
    
    public void setProduct(Product product) {
        this.product = product;
    }
    
    public ProductSize getSize() {
        return size;
    }
    
    public void setSize(ProductSize size) {
        this.size = size;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    // Helper method to get size code
    public String getSizeCode() {
        return size != null ? size.getCode() : null;
    }
    
    // Helper method to get size display name
    public String getSizeDisplayName() {
        return size != null ? size.getDisplayName() : null;
    }
}
