package com.example.silea.repository;

import com.example.silea.entity.Customer;
import com.example.silea.enums.CustomerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Find customer by email
    Optional<Customer> findByEmail(String email);

    // Check if email exists
    boolean existsByEmail(String email);

    // Find customers by status
    List<Customer> findByStatus(CustomerStatus status);

    // Find customers by name (case insensitive search)
    List<Customer> findByNameContainingIgnoreCase(String name);

    // Find customers by phone
    List<Customer> findByPhone(String phone);

    // Find top spending customers
    @Query("SELECT c FROM Customer c ORDER BY c.totalSpent DESC")
    List<Customer> findTopSpendingCustomers();

    // Find customers who haven't ordered in a while
    @Query("SELECT c FROM Customer c WHERE c.lastOrderDate < :date OR c.lastOrderDate IS NULL")
    List<Customer> findInactiveCustomers(@Param("date") LocalDateTime date);

    // Find VIP customers (high spenders)
    @Query("SELECT c FROM Customer c WHERE c.totalSpent >= :threshold")
    List<Customer> findVipCustomers(@Param("threshold") BigDecimal threshold);

    // Count customers by status
    long countByStatus(CustomerStatus status);

    // Find customers with orders in date range
    @Query("SELECT DISTINCT c FROM Customer c JOIN c.orders o WHERE o.status = 'DELIVERED' AND o.orderDate BETWEEN :startDate AND :endDate")
    List<Customer> findCustomersWithOrdersBetween(@Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);

    // Search customers by name or email
    @Query("SELECT c FROM Customer c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Customer> searchCustomers(@Param("search") String search);

    // Find customers with at least one order (for retargeting)
    @Query("SELECT DISTINCT c FROM Customer c JOIN c.orders o WHERE o.status = 'DELIVERED' ORDER BY c.lastOrderDate DESC")
    List<Customer> findCustomersWithOrders();

    // Find customers with orders in specific status
    @Query("SELECT DISTINCT c FROM Customer c JOIN c.orders o WHERE c.status = :status AND o.status = 'DELIVERED' ORDER BY c.totalSpent DESC")
    List<Customer> findCustomersWithOrdersByStatus(@Param("status") CustomerStatus status);

    // Find customers by spending range
    @Query("SELECT c FROM Customer c WHERE c.totalSpent BETWEEN :minSpent AND :maxSpent AND EXISTS (SELECT 1 FROM com.example.silea.entity.Order o WHERE o.customer = c AND o.status = 'DELIVERED') ORDER BY c.totalSpent DESC")
    List<Customer> findCustomersBySpendingRange(@Param("minSpent") BigDecimal minSpent, @Param("maxSpent") BigDecimal maxSpent);

    // Find customers by order count range
    @Query("SELECT c FROM Customer c WHERE c.totalOrders BETWEEN :minOrders AND :maxOrders AND EXISTS (SELECT 1 FROM com.example.silea.entity.Order o WHERE o.customer = c AND o.status = 'DELIVERED') ORDER BY c.totalOrders DESC")
    List<Customer> findCustomersByOrderCountRange(@Param("minOrders") Integer minOrders, @Param("maxOrders") Integer maxOrders);

    // Find at-risk customers (haven't ordered recently but have history)
    @Query("SELECT c FROM Customer c WHERE c.totalOrders > 0 AND c.lastOrderDate < :cutoffDate AND EXISTS (SELECT 1 FROM com.example.silea.entity.Order o WHERE o.customer = c AND o.status = 'DELIVERED') ORDER BY c.lastOrderDate ASC")
    List<Customer> findAtRiskCustomers(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Find repeat customers (more than X orders)
    @Query("SELECT c FROM Customer c WHERE c.totalOrders >= :minOrders AND EXISTS (SELECT 1 FROM com.example.silea.entity.Order o WHERE o.customer = c AND o.status = 'DELIVERED') ORDER BY c.totalOrders DESC")
    List<Customer> findRepeatCustomers(@Param("minOrders") Integer minOrders);

    // Find new customers (first order within date range)
    @Query("SELECT c FROM Customer c WHERE c.totalOrders = 1 AND c.lastOrderDate >= :startDate AND EXISTS (SELECT 1 FROM com.example.silea.entity.Order o WHERE o.customer = c AND o.status = 'DELIVERED' AND o.orderDate >= :startDate) ORDER BY c.lastOrderDate DESC")
    List<Customer> findNewCustomers(@Param("startDate") LocalDateTime startDate);
}