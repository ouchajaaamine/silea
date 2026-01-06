package com.example.silea.service;

import com.example.silea.entity.Customer;
import com.example.silea.enums.CustomerStatus;
import com.example.silea.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    /**
     * Create a new customer
     */
    public Customer createCustomer(String name, String email, String phone, String address, String city) {
        if (customerRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Customer with this email already exists");
        }

        Customer customer = new Customer();
        customer.setName(name);
        customer.setEmail(email);
        customer.setPhone(phone);
        customer.setAddress(address);
        customer.setCity(city);
        customer.setStatus(CustomerStatus.ACTIVE);

        return customerRepository.save(customer);
    }

    /**
     * Update customer information
     */
    public Customer updateCustomer(Long customerId, String name, String email, String phone, String address) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        // Check if email is already taken by another customer
        if (!customer.getEmail().equals(email) && customerRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already taken by another customer");
        }

        customer.setName(name);
        customer.setEmail(email);
        customer.setPhone(phone);
        customer.setAddress(address);

        return customerRepository.save(customer);
    }

    /**
     * Update customer status
     */
    public Customer updateCustomerStatus(Long customerId, CustomerStatus status) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        customer.setStatus(status);
        return customerRepository.save(customer);
    }

    /**
     * Find customer by ID
     */
    public Optional<Customer> findById(Long id) {
        return customerRepository.findById(id);
    }

    /**
     * Find customer by email
     */
    public Optional<Customer> findByEmail(String email) {
        return customerRepository.findByEmail(email);
    }

    /**
     * Search customers with pagination
     */
    public List<Customer> searchCustomers(String searchTerm) {
        return customerRepository.searchCustomers(searchTerm);
    }

    /**
     * Get customers by status
     */
    public List<Customer> getCustomersByStatus(CustomerStatus status) {
        return customerRepository.findByStatus(status);
    }

    /**
     * Get all active customers
     */
    public List<Customer> getActiveCustomers() {
        return customerRepository.findByStatus(CustomerStatus.ACTIVE);
    }

    /**
     * Get VIP customers (top spenders)
     */
    public List<Customer> getVipCustomers(BigDecimal threshold) {
        return customerRepository.findVipCustomers(threshold);
    }

    /**
     * Get top spending customers
     */
    public List<Customer> getTopSpendingCustomers() {
        return customerRepository.findTopSpendingCustomers();
    }

    /**
     * Get customer statistics
     */
    public CustomerStatistics getCustomerStatistics() {
        long totalCustomers = customerRepository.count();
        long activeCustomers = customerRepository.countByStatus(CustomerStatus.ACTIVE);
        long newCustomers = customerRepository.countByStatus(CustomerStatus.NEW);

        List<Customer> vipCustomers = customerRepository.findVipCustomers(BigDecimal.valueOf(1000)); // VIP threshold
        BigDecimal totalRevenue = BigDecimal.ZERO; // Will need to be calculated from orders

        return new CustomerStatistics(totalCustomers, activeCustomers, newCustomers, vipCustomers.size(), totalRevenue);
    }

    /**
     * Delete customer (soft delete by setting status to inactive - using NEW as inactive for now)
     */
    public void deleteCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        customer.setStatus(CustomerStatus.NEW); // Using NEW as inactive status
        customerRepository.save(customer);
    }

    /**
     * Get inactive customers (haven't ordered recently)
     */
    public List<Customer> getInactiveCustomers(int daysSinceLastOrder) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysSinceLastOrder);
        return customerRepository.findInactiveCustomers(cutoffDate);
    }

    /**
     * Get customer order history summary
     */
    public CustomerOrderSummary getCustomerOrderSummary(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        // Note: These would need to be implemented in repository with order joins
        long totalOrders = 0; // Placeholder
        BigDecimal totalSpent = customer.getTotalSpent() != null ? customer.getTotalSpent() : BigDecimal.ZERO;
        LocalDateTime lastOrderDate = customer.getLastOrderDate();

        return new CustomerOrderSummary(customer, totalOrders, totalSpent, lastOrderDate);
    }

    /**
     * Get customers with pagination
     */
    public Page<Customer> getCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable);
    }

    /**
     * Get all customers with at least one order (for retargeting)
     */
    public List<Customer> getCustomersWithOrders() {
        return customerRepository.findCustomersWithOrders();
    }

    /**
     * Get customers with orders by status
     */
    public List<Customer> getCustomersWithOrdersByStatus(CustomerStatus status) {
        return customerRepository.findCustomersWithOrdersByStatus(status);
    }

    /**
     * Get customers by spending range
     */
    public List<Customer> getCustomersBySpendingRange(BigDecimal minSpent, BigDecimal maxSpent) {
        return customerRepository.findCustomersBySpendingRange(minSpent, maxSpent);
    }

    /**
     * Get customers by order count range
     */
    public List<Customer> getCustomersByOrderCountRange(Integer minOrders, Integer maxOrders) {
        return customerRepository.findCustomersByOrderCountRange(minOrders, maxOrders);
    }

    /**
     * Get at-risk customers (haven't ordered in X days but have order history)
     */
    public List<Customer> getAtRiskCustomers(int daysSinceLastOrder) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysSinceLastOrder);
        return customerRepository.findAtRiskCustomers(cutoffDate);
    }

    /**
     * Get repeat customers (X or more orders)
     */
    public List<Customer> getRepeatCustomers(int minOrders) {
        return customerRepository.findRepeatCustomers(minOrders);
    }

    /**
     * Get new customers (first order within X days)
     */
    public List<Customer> getNewCustomersSince(int daysAgo) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(daysAgo);
        return customerRepository.findNewCustomers(startDate);
    }

    /**
     * Get customer segments for retargeting
     */
    public CustomerSegmentStats getCustomerSegments() {
        List<Customer> allCustomers = customerRepository.findAll();
        List<Customer> withOrders = customerRepository.findCustomersWithOrders();
        List<Customer> atRisk = getAtRiskCustomers(60); // 60 days
        List<Customer> repeat = getRepeatCustomers(3); // 3+ orders
        List<Customer> newCustomers = getNewCustomersSince(30); // Last 30 days
        
        return new CustomerSegmentStats(
            allCustomers.size(),
            withOrders.size(),
            atRisk.size(),
            repeat.size(),
            newCustomers.size()
        );
    }

    // DTO classes for statistics
    public static class CustomerSegmentStats {
        private final long totalCustomers;
        private final long customersWithOrders;
        private final long atRiskCustomers;
        private final long repeatCustomers;
        private final long newCustomers;

        public CustomerSegmentStats(long totalCustomers, long customersWithOrders, long atRiskCustomers,
                                   long repeatCustomers, long newCustomers) {
            this.totalCustomers = totalCustomers;
            this.customersWithOrders = customersWithOrders;
            this.atRiskCustomers = atRiskCustomers;
            this.repeatCustomers = repeatCustomers;
            this.newCustomers = newCustomers;
        }

        public long getTotalCustomers() { return totalCustomers; }
        public long getCustomersWithOrders() { return customersWithOrders; }
        public long getAtRiskCustomers() { return atRiskCustomers; }
        public long getRepeatCustomers() { return repeatCustomers; }
        public long getNewCustomers() { return newCustomers; }
    }

    public static class CustomerStatistics {
        private final long totalCustomers;
        private final long activeCustomers;
        private final long newCustomers;
        private final long vipCustomers;
        private final BigDecimal totalRevenue;

        public CustomerStatistics(long totalCustomers, long activeCustomers, long newCustomers,
                                long vipCustomers, BigDecimal totalRevenue) {
            this.totalCustomers = totalCustomers;
            this.activeCustomers = activeCustomers;
            this.newCustomers = newCustomers;
            this.vipCustomers = vipCustomers;
            this.totalRevenue = totalRevenue;
        }

        // Getters
        public long getTotalCustomers() { return totalCustomers; }
        public long getActiveCustomers() { return activeCustomers; }
        public long getNewCustomers() { return newCustomers; }
        public long getVipCustomers() { return vipCustomers; }
        public BigDecimal getTotalRevenue() { return totalRevenue; }
    }

    public static class CustomerOrderSummary {
        private final Customer customer;
        private final long totalOrders;
        private final BigDecimal totalSpent;
        private final LocalDateTime lastOrderDate;

        public CustomerOrderSummary(Customer customer, long totalOrders, BigDecimal totalSpent, LocalDateTime lastOrderDate) {
            this.customer = customer;
            this.totalOrders = totalOrders;
            this.totalSpent = totalSpent;
            this.lastOrderDate = lastOrderDate;
        }

        // Getters
        public Customer getCustomer() { return customer; }
        public long getTotalOrders() { return totalOrders; }
        public BigDecimal getTotalSpent() { return totalSpent; }
        public LocalDateTime getLastOrderDate() { return lastOrderDate; }
    }
}