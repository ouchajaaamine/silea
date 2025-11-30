package com.example.barakahstore.service;

import com.example.barakahstore.entity.Product;
import com.example.barakahstore.enums.ProductStatus;
import com.example.barakahstore.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Create a new product
     */
    public Product createProduct(String name, String nameArabic, String description,
                               BigDecimal price, Integer stockQuantity, Long categoryId,
                               String imageUrl, String weightVolume) {
        Product product = new Product();
        product.setName(name);
        product.setNameAr(nameArabic);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stockQuantity);
        product.setStatus(ProductStatus.ACTIVE);
        product.setImageUrl(imageUrl);
        product.setWeightVolume(weightVolume);

        // Set category if provided
        if (categoryId != null) {
            // This would need CategoryService or CategoryRepository injection
            // For now, we'll assume category is set separately
        }

        return productRepository.save(product);
    }

    /**
     * Update product information
     */
    public Product updateProduct(Long productId, String name, String nameArabic, String description,
                               BigDecimal price, Integer stockQuantity, String imageUrl,
                               String weightVolume) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        product.setName(name);
        product.setNameAr(nameArabic);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stockQuantity);
        product.setImageUrl(imageUrl);
        product.setWeightVolume(weightVolume);

        return productRepository.save(product);
    }

    /**
     * Update product stock
     */
    public Product updateStock(Long productId, Integer newStockQuantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        product.setStock(newStockQuantity);
        return productRepository.save(product);
    }

    /**
     * Update product status
     */
    public Product updateStatus(Long productId, ProductStatus status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        product.setStatus(status);
        return productRepository.save(product);
    }

    /**
     * Find product by ID
     */
    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    /**
     * Get all active products
     */
    public List<Product> getActiveProducts() {
        return productRepository.findByStatus(ProductStatus.ACTIVE);
    }

    /**
     * Search products
     */
    public List<Product> searchProducts(String searchTerm) {
        return productRepository.searchProducts(searchTerm);
    }

    /**
     * Get products by category
     */
    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    /**
     * Get low stock products
     */
    public List<Product> getLowStockProducts(Integer threshold) {
        return productRepository.findLowStockProducts(threshold);
    }

    /**
     * Get homepage featured products
     */
    public List<Product> getHomepageProducts() {
        return productRepository.findHomepageProducts();
    }

    /**
     * Get products with pagination
     */
    public Page<Product> getProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    /**
     * Get total inventory value
     */
    public BigDecimal getTotalInventoryValue() {
        return productRepository.getTotalInventoryValue();
    }

    /**
     * Delete product (soft delete by setting status to inactive)
     */
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
    }

    /**
     * Get product statistics
     */
    public ProductStatistics getProductStatistics() {
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.findByStatus(ProductStatus.ACTIVE).size();
        long inactiveProducts = productRepository.findByStatus(ProductStatus.INACTIVE).size();
        long lowStockProducts = productRepository.findLowStockProducts(10).size(); // Low stock threshold
        BigDecimal totalInventoryValue = productRepository.getTotalInventoryValue();

        return new ProductStatistics(totalProducts, activeProducts, inactiveProducts,
                                   lowStockProducts, totalInventoryValue);
    }

    /**
     * Check if product is in stock
     */
    public boolean isInStock(Long productId, Integer quantity) {
        Optional<Product> product = productRepository.findById(productId);
        return product.isPresent() &&
               product.get().getStatus() == ProductStatus.ACTIVE &&
               product.get().getStock() >= quantity;
    }

    /**
     * Reduce product stock (for order fulfillment)
     */
    public Product reduceStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getStock() < quantity) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        product.setStock(product.getStock() - quantity);
        return productRepository.save(product);
    }

    // DTO class for statistics
    public static class ProductStatistics {
        private final long totalProducts;
        private final long activeProducts;
        private final long inactiveProducts;
        private final long lowStockProducts;
        private final BigDecimal totalInventoryValue;

        public ProductStatistics(long totalProducts, long activeProducts, long inactiveProducts,
                               long lowStockProducts, BigDecimal totalInventoryValue) {
            this.totalProducts = totalProducts;
            this.activeProducts = activeProducts;
            this.inactiveProducts = inactiveProducts;
            this.lowStockProducts = lowStockProducts;
            this.totalInventoryValue = totalInventoryValue;
        }

        // Getters
        public long getTotalProducts() { return totalProducts; }
        public long getActiveProducts() { return activeProducts; }
        public long getInactiveProducts() { return inactiveProducts; }
        public long getLowStockProducts() { return lowStockProducts; }
        public BigDecimal getTotalInventoryValue() { return totalInventoryValue; }
    }
}