package com.example.barakahstore.controller;

import com.example.barakahstore.entity.Customer;
import com.example.barakahstore.enums.CustomerStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import com.example.barakahstore.service.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/customers")
@CrossOrigin(origins = "*")
@Tag(name = "Customer Management", description = "Admin endpoints for managing customers (requires JWT authentication)")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    /**
     * Get all customers with pagination
     */
    @GetMapping
    @Operation(summary = "Get all customers", description = "Retrieve paginated list of all customers",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Customers retrieved successfully",
            content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<?> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Customer> customers = customerService.getCustomers(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("customers", customers.getContent());
            response.put("totalElements", customers.getTotalElements());
            response.put("totalPages", customers.getTotalPages());
            response.put("currentPage", customers.getNumber());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving customers: " + e.getMessage());
        }
    }

    /**
     * Get customer by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID", description = "Retrieve a single customer by their ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved customer",
            content = @Content(mediaType = "application/json", example = "{\"id\": 1, \"name\": \"John Doe\", \"email\": \"john.doe@example.com\", \"phone\": \"123-456-7890\", \"address\": \"123 Main St\", \"status\": \"ACTIVE\"}")),
        @ApiResponse(responseCode = "404", description = "Customer not found",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Customer not found with ID: 1\"}")),
        @ApiResponse(responseCode = "500", description = "Error retrieving customer",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving customer: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getCustomer(@PathVariable Long id) {
        try {
            Optional<Customer> customer = customerService.findById(id);
            if (customer.isPresent()) {
                return ResponseEntity.ok(customer.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving customer: " + e.getMessage());
        }
    }

    /**
     * Create new customer
     */
    @PostMapping
    @Operation(summary = "Create new customer", description = "Create a new customer (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Customer created successfully",
            content = @Content(mediaType = "application/json", example = "{\"success\": true, \"message\": \"Customer created successfully\", \"customer\": {\"id\": 2, \"name\": \"Jane Doe\", \"email\": \"jane.doe@example.com\", \"phone\": \"098-765-4321\", \"address\": \"456 Oak Ave\", \"status\": \"ACTIVE\"}}")),
        @ApiResponse(responseCode = "400", description = "Invalid customer data",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error creating customer: Email already exists\"}")),
        @ApiResponse(responseCode = "500", description = "Error creating customer",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error creating customer: Internal Server Error\"}"))
    })
    public ResponseEntity<?> createCustomer(@RequestBody CustomerRequest request) {
        try {
            Customer customer = customerService.createCustomer(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Customer created successfully");
            response.put("customer", customer);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error creating customer: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update customer
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update customer", description = "Update an existing customer (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Customer updated successfully",
            content = @Content(mediaType = "application/json", example = "{\"success\": true, \"message\": \"Customer updated successfully\", \"customer\": {\"id\": 1, \"name\": \"John Doe Updated\", \"email\": \"john.doe.updated@example.com\", \"phone\": \"111-222-3333\", \"address\": \"456 New St\", \"status\": \"ACTIVE\"}}")),
        @ApiResponse(responseCode = "400", description = "Invalid customer data",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error updating customer: Email already exists\"}")),
        @ApiResponse(responseCode = "404", description = "Customer not found",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Customer not found with ID: 1\"}")),
        @ApiResponse(responseCode = "500", description = "Error updating customer",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error updating customer: Internal Server Error\"}"))
    })
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody CustomerRequest request) {
        try {
            Customer customer = customerService.updateCustomer(
                id,
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Customer updated successfully");
            response.put("customer", customer);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating customer: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update customer status
     */
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update customer status", description = "Update the status of an existing customer (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Customer status updated successfully",
            content = @Content(mediaType = "application/json", example = "{\"success\": true, \"message\": \"Customer status updated successfully\", \"customer\": {\"id\": 1, \"name\": \"John Doe\", \"email\": \"john.doe@example.com\", \"phone\": \"123-456-7890\", \"address\": \"123 Main St\", \"status\": \"INACTIVE\"}}")),
        @ApiResponse(responseCode = "400", description = "Invalid status provided",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error updating customer status: Invalid status\"}")),
        @ApiResponse(responseCode = "404", description = "Customer not found",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Customer not found with ID: 1\"}")),
        @ApiResponse(responseCode = "500", description = "Error updating customer status",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error updating customer status: Internal Server Error\"}"))
    })
    public ResponseEntity<?> updateCustomerStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        try {
            Customer customer = customerService.updateCustomerStatus(id, request.getStatus());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Customer status updated successfully");
            response.put("customer", customer);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating customer status: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Delete customer
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer", description = "Delete a customer (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Customer deleted successfully",
            content = @Content(mediaType = "application/json", example = "{\"success\": true, \"message\": \"Customer deleted successfully\"}")),
        @ApiResponse(responseCode = "404", description = "Customer not found",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Customer not found with ID: 1\"}")),
        @ApiResponse(responseCode = "500", description = "Error deleting customer",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error deleting customer: Internal Server Error\"}"))
    })
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        try {
            customerService.deleteCustomer(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Customer deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting customer: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Search customers
     */
    @GetMapping("/search")
    @Operation(summary = "Search customers", description = "Search for customers by name, email, phone, or address")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved matching customers",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 1, \"name\": \"John Doe\", \"email\": \"john.doe@example.com\", \"phone\": \"123-456-7890\", \"address\": \"123 Main St\", \"status\": \"ACTIVE\"}]")),
        @ApiResponse(responseCode = "500", description = "Error searching customers",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error searching customers: Internal Server Error\"}"))
    })
    public ResponseEntity<?> searchCustomers(@RequestParam String query) {
        try {
            List<Customer> customers = customerService.searchCustomers(query);
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error searching customers: " + e.getMessage());
        }
    }

    /**
     * Get customer statistics
     */
    @GetMapping("/stats")
    @Operation(summary = "Get customer statistics", description = "Retrieve statistics about customers")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved customer statistics",
            content = @Content(mediaType = "application/json", example = "{\"totalCustomers\": 10, \"activeCustomers\": 8, \"inactiveCustomers\": 2}")),
        @ApiResponse(responseCode = "500", description = "Error retrieving customer statistics",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving customer statistics: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getCustomerStatistics() {
        try {
            CustomerService.CustomerStatistics stats = customerService.getCustomerStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving customer statistics: " + e.getMessage());
        }
    }

    /**
     * Get VIP customers
     */
    @GetMapping("/vip")
    @Operation(summary = "Get VIP customers", description = "Retrieve a list of VIP customers based on a spending threshold")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved VIP customers",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 1, \"name\": \"John Doe\", \"email\": \"john.doe@example.com\", \"phone\": \"123-456-7890\", \"address\": \"123 Main St\", \"status\": \"ACTIVE\"}]")),
        @ApiResponse(responseCode = "500", description = "Error retrieving VIP customers",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving VIP customers: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getVipCustomers(@RequestParam(defaultValue = "1000") String threshold) {
        try {
            List<Customer> vipCustomers = customerService.getVipCustomers(java.math.BigDecimal.valueOf(Double.parseDouble(threshold)));
            return ResponseEntity.ok(vipCustomers);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving VIP customers: " + e.getMessage());
        }
    }

    // DTO classes
    public static class CustomerRequest {
        private String name;
        private String email;
        private String phone;
        private String address;

        public CustomerRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
    }

    public static class StatusRequest {
        private CustomerStatus status;

        public StatusRequest() {}

        public CustomerStatus getStatus() { return status; }
        public void setStatus(CustomerStatus status) { this.status = status; }
    }
}