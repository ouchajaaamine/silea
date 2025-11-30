package com.example.barakahstore.repository;

import com.example.barakahstore.entity.Customer;
import com.example.barakahstore.enums.CustomerStatus;
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
    @Query("SELECT DISTINCT c FROM Customer c JOIN c.orders o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    List<Customer> findCustomersWithOrdersBetween(@Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);

    // Search customers by name or email
    @Query("SELECT c FROM Customer c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Customer> searchCustomers(@Param("search") String search);
}