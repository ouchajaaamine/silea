package com.example.silea.service;

import com.example.silea.entity.Product;
import com.example.silea.entity.Category;
import com.example.silea.enums.ProductStatus;
import com.example.silea.repository.ProductRepository;
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
    private final CategoryService categoryService;

    public ProductService(ProductRepository productRepository, CategoryService categoryService) {
        this.productRepository = productRepository;
        this.categoryService = categoryService;
    }

    /**
     * Create a new product
     */
    public Product createProduct(String name, String nameArabic, String description,
                               BigDecimal price, Boolean available, Long categoryId,
                               String imageUrl) {
        Product product = new Product();
        product.setName(name);
        product.setNameAr(nameArabic);
        product.setDescription(description);
        product.setPrice(price);
        product.setAvailable(available != null ? available : true);
        product.setStatus(ProductStatus.ACTIVE);
        product.setImageUrl(imageUrl);

        // Set category if provided
        if (categoryId != null) {
            Category category = categoryService.findById(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            product.setCategory(category);
        }

        return productRepository.save(product);
    }

    /**
     * Update product information
     */
    public Product updateProduct(Long productId, String name, String nameArabic, String description,
                               BigDecimal price, Boolean available, String imageUrl) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        product.setName(name);
        product.setNameAr(nameArabic);
        product.setDescription(description);
        product.setPrice(price);
        product.setAvailable(available);
        product.setImageUrl(imageUrl);

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
     * Save product
     */
    public Product save(Product product) {
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
     * Get products by category (only ACTIVE products for public use)
     */
    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndStatus(categoryId, ProductStatus.ACTIVE);
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
        long unavailableProducts = productRepository.findByAvailable(false).size();

        return new ProductStatistics(totalProducts, activeProducts, inactiveProducts, unavailableProducts);
    }

    /**
     * Get unavailable products
     */
    public List<Product> getUnavailableProducts() {
        return productRepository.findByAvailable(false);
    }

    /**
     * Update product featured status
     */
    public Product updateFeatured(Long productId, Boolean featured) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        product.setFeatured(featured);
        return productRepository.save(product);
    }

    /**
     * Update product availability
     */
    public Product updateAvailable(Long productId, Boolean available) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        product.setAvailable(available);
        return productRepository.save(product);
    }

    /**
     * Check if product is available
     */
    public boolean isInStock(Long productId, Integer quantity) {
        Optional<Product> product = productRepository.findById(productId);
        return product.isPresent() &&
               product.get().getStatus() == ProductStatus.ACTIVE &&
               product.get().getAvailable();
    }

    // DTO class for statistics
    public static class ProductStatistics {
        private final long totalProducts;
        private final long activeProducts;
        private final long inactiveProducts;
        private final long unavailableProducts;

        public ProductStatistics(long totalProducts, long activeProducts, long inactiveProducts, long unavailableProducts) {
            this.totalProducts = totalProducts;
            this.activeProducts = activeProducts;
            this.inactiveProducts = inactiveProducts;
            this.unavailableProducts = unavailableProducts;
        }

        // Getters
        public long getTotalProducts() { return totalProducts; }
        public long getActiveProducts() { return activeProducts; }
        public long getInactiveProducts() { return inactiveProducts; }
        public long getUnavailableProducts() { return unavailableProducts; }
    }
}