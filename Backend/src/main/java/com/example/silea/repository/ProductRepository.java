package com.example.silea.repository;

import com.example.silea.entity.Product;
import com.example.silea.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find active products only
    List<Product> findByStatus(ProductStatus status);

    // Find featured products
    List<Product> findByFeaturedTrue();

    // Find products by category
    List<Product> findByCategoryId(Long categoryId);

    // Find products by category and status
    List<Product> findByCategoryIdAndStatus(Long categoryId, ProductStatus status);

    // Find products in price range
    List<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    // Search products by name (French or Arabic)
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.nameAr) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Product> searchProducts(@Param("search") String search);

    // Search products by name or description
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.nameAr) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Product> searchProductsInNameAndDescription(@Param("search") String search);

    // Find products by category with search
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.nameAr) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> searchProductsByCategory(@Param("categoryId") Long categoryId, @Param("search") String search);

    // Find featured products by category
    List<Product> findByCategoryIdAndFeaturedTrue(Long categoryId);

    // Count products by status
    long countByStatus(ProductStatus status);

    // Count products by category
    long countByCategoryId(Long categoryId);

    // Find products ordered by price (ascending)
    List<Product> findAllByOrderByPriceAsc();

    // Find products ordered by price (descending)
    List<Product> findAllByOrderByPriceDesc();

    // Find products ordered by name
    List<Product> findAllByOrderByNameAsc();

    // Find products ordered by Arabic name
    List<Product> findAllByOrderByNameArAsc();

    // Get products for homepage (featured + active)
    @Query("SELECT p FROM Product p WHERE p.featured = true AND p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
    List<Product> findHomepageProducts();

    // Find products by availability
    List<Product> findByAvailable(Boolean available);

    // Find available products
    @Query("SELECT p FROM Product p WHERE p.available = true AND p.status = 'ACTIVE'")
    List<Product> findAvailableProducts();
}