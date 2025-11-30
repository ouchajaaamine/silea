package com.example.barakahstore.repository;

import com.example.barakahstore.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Find order items by order
    List<OrderItem> findByOrderId(Long orderId);

    // Find order items by product
    List<OrderItem> findByProductId(Long productId);

    // Find order items by order ordered by product name
    List<OrderItem> findByOrderIdOrderByProductNameAsc(Long orderId);

    // Find order items by product and order
    List<OrderItem> findByProductIdAndOrderId(Long productId, Long orderId);

    // Count order items by order
    long countByOrderId(Long orderId);

    // Count order items by product
    long countByProductId(Long productId);

    // Get total quantity for order
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.order.id = :orderId")
    Integer getTotalQuantityForOrder(@Param("orderId") Long orderId);

    // Get total value for order
    @Query("SELECT SUM(oi.unitPrice * oi.quantity) FROM OrderItem oi WHERE oi.order.id = :orderId")
    BigDecimal getTotalValueForOrder(@Param("orderId") Long orderId);

    // Find best selling products (by total quantity sold)
    @Query("SELECT oi.product.id, SUM(oi.quantity) as totalSold FROM OrderItem oi GROUP BY oi.product.id ORDER BY totalSold DESC")
    List<Object[]> findBestSellingProducts();

    // Find best selling products in date range
    @Query("SELECT oi.product.id, SUM(oi.quantity) as totalSold FROM OrderItem oi WHERE oi.order.orderDate BETWEEN :startDate AND :endDate GROUP BY oi.product.id ORDER BY totalSold DESC")
    List<Object[]> findBestSellingProductsInRange(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);

    // Get product sales statistics
    @Query("SELECT oi.product.id, SUM(oi.quantity), SUM(oi.unitPrice * oi.quantity) FROM OrderItem oi GROUP BY oi.product.id")
    List<Object[]> getProductSalesStatistics();

    // Find order items with low stock products
    @Query("SELECT oi FROM OrderItem oi WHERE oi.product.stock < :threshold")
    List<OrderItem> findOrderItemsWithLowStockProducts(@Param("threshold") Integer threshold);

    // Get average order item value
    @Query("SELECT AVG(oi.unitPrice * oi.quantity) FROM OrderItem oi")
    BigDecimal getAverageOrderItemValue();

    // Find most expensive order items
    @Query("SELECT oi FROM OrderItem oi ORDER BY (oi.unitPrice * oi.quantity) DESC")
    List<OrderItem> findMostExpensiveOrderItems();

    // Get total items sold for product
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.product.id = :productId")
    Integer getTotalItemsSoldForProduct(@Param("productId") Long productId);

    // Get total revenue for product
    @Query("SELECT SUM(oi.unitPrice * oi.quantity) FROM OrderItem oi WHERE oi.product.id = :productId")
    BigDecimal getTotalRevenueForProduct(@Param("productId") Long productId);

    // Find order items by product category
    @Query("SELECT oi FROM OrderItem oi JOIN oi.product p WHERE p.category.id = :categoryId")
    List<OrderItem> findOrderItemsByCategory(@Param("categoryId") Long categoryId);

    // Get category sales statistics
    @Query("SELECT p.category.id, SUM(oi.quantity), SUM(oi.unitPrice * oi.quantity) FROM OrderItem oi JOIN oi.product p GROUP BY p.category.id")
    List<Object[]> getCategorySalesStatistics();
}