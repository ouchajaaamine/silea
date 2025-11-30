package com.example.barakahstore.controller;

import com.example.barakahstore.entity.Product;
import com.example.barakahstore.enums.ProductStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import com.example.barakahstore.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
@Tag(name = "Products", description = "Product catalog and inventory management endpoints")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Get all active products with pagination (public endpoint)
     */
    @GetMapping
    @Operation(summary = "Get products", description = "Retrieve paginated list of active products for the public catalog")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Products retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class), example = "{\"products\": [{\"id\": 1, \"name\": \"Product A\", \"nameArabic\": \"المنتج أ\", \"description\": \"Description of Product A\", \"price\": 10.99, \"stockQuantity\": 100, \"imageUrl\": \"http://example.com/imageA.jpg\", \"weightVolume\": \"1kg\", \"status\": \"ACTIVE\", \"category\": {\"id\": 1, \"name\": \"Category 1\"}}], \"totalElements\": 1, \"totalPages\": 1, \"currentPage\": 0}"))
    })
    public ResponseEntity<?> getProducts(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of products per page") @RequestParam(defaultValue = "12") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Product> products = productService.getProducts(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("products", products.getContent());
            response.put("totalElements", products.getTotalElements());
            response.put("totalPages", products.getTotalPages());
            response.put("currentPage", products.getNumber());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving products: " + e.getMessage());
        }
    }

    /**
     * Get product by ID (public endpoint)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve a single product by its unique ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved the product.",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class), example = "{\"id\": 1, \"name\": \"Product A\", \"nameArabic\": \"المنتج أ\", \"description\": \"Description of Product A\", \"price\": 10.99, \"stockQuantity\": 100, \"imageUrl\": \"http://example.com/imageA.jpg\", \"weightVolume\": \"1kg\", \"status\": \"ACTIVE\", \"category\": {\"id\": 1, \"name\": \"Category 1\"}}")),
        @ApiResponse(responseCode = "404", description = "Product with the specified ID does not exist.",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Product not found\"}")),
        @ApiResponse(responseCode = "500", description = "Error retrieving product.",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving product: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getProduct(@PathVariable Long id) {
        try {
            Optional<Product> product = productService.findById(id);
            if (product.isPresent()) {
                return ResponseEntity.ok(product.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving product: " + e.getMessage());
        }
    }

    /**
     * Search products (public endpoint)
     */
    @GetMapping("/search")
    @Operation(summary = "Search products", description = "Search for products based on a query string")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved matching products.",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 1, \"name\": \"Product A\", \"nameArabic\": \"المنتج أ\", \"description\": \"Description of Product A\", \"price\": 10.99, \"stockQuantity\": 100, \"imageUrl\": \"http://example.com/imageA.jpg\", \"weightVolume\": \"1kg\", \"status\": \"ACTIVE\", \"category\": {\"id\": 1, \"name\": \"Category 1\"}}]")),
        @ApiResponse(responseCode = "500", description = "Error searching products.",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error searching products: Internal Server Error\"}"))
    })
    public ResponseEntity<?> searchProducts(@RequestParam String query) {
        try {
            List<Product> products = productService.searchProducts(query);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error searching products: " + e.getMessage());
        }
    }

    /**
     * Get products by category (public endpoint)
     */
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get products by category", description = "Retrieve all products belonging to a specific category")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved products by category.",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 1, \"name\": \"Product A\", \"nameArabic\": \"المنتج أ\", \"description\": \"Description of Product A\", \"price\": 10.99, \"stockQuantity\": 100, \"imageUrl\": \"http://example.com/imageA.jpg\", \"weightVolume\": \"1kg\", \"status\": \"ACTIVE\", \"category\": {\"id\": 1, \"name\": \"Category 1\"}}]")),
        @ApiResponse(responseCode = "500", description = "Error retrieving products by category.",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving products by category: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getProductsByCategory(@PathVariable Long categoryId) {
        try {
            List<Product> products = productService.getProductsByCategory(categoryId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving products by category: " + e.getMessage());
        }
    }

    /**
     * Get homepage featured products (public endpoint)
     */
    @GetMapping("/featured")
    @Operation(summary = "Get featured products", description = "Retrieve products designated as featured for the homepage")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved featured products.",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 1, \"name\": \"Featured Product 1\", \"nameArabic\": \"منتج مميز 1\", \"description\": \"Description of Featured Product 1\", \"price\": 25.00, \"stockQuantity\": 50, \"imageUrl\": \"http://example.com/featured1.jpg\", \"weightVolume\": \"500g\", \"status\": \"ACTIVE\", \"category\": {\"id\": 2, \"name\": \"Category 2\"}}]")),
        @ApiResponse(responseCode = "500", description = "Error retrieving featured products.",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Error retrieving featured products: Internal Server Error\"}"))
    })
    public ResponseEntity<?> getFeaturedProducts() {
        try {
            List<Product> products = productService.getHomepageProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving featured products: " + e.getMessage());
        }
    }

    // Admin endpoints below

    /**
     * Create new product (admin only)
     */
    @PostMapping("/admin")
    @Operation(summary = "Create product", description = "Create a new product (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product created successfully",
            content = @Content(mediaType = "application/json", example = "{\"success\": true, \"message\": \"Product created successfully\", \"product\": {\"id\": 2, \"name\": \"New Product\", \"nameArabic\": \"منتج جديد\", \"description\": \"Detailed description of the new product.\", \"price\": 29.99, \"stockQuantity\": 150, \"imageUrl\": \"http://example.com/new_product.jpg\", \"weightVolume\": \"2kg\", \"status\": \"ACTIVE\", \"category\": {\"id\": 1, \"name\": \"Category 1\"}}}")),
        @ApiResponse(responseCode = "400", description = "Invalid product data",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error creating product: Invalid data\"}")),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Unauthorized\"}")),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Forbidden\"}"))
    })
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request) {
        try {
            Product product = productService.createProduct(
                request.getName(),
                request.getNameArabic(),
                request.getDescription(),
                request.getPrice(),
                request.getStockQuantity(),
                request.getCategoryId(),
                request.getImageUrl(),
                request.getWeightVolume()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product created successfully");
            response.put("product", product);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error creating product: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update product (admin only)
     */
    @PutMapping("/admin/{id}")
    @Operation(summary = "Update product", description = "Update an existing product (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product updated successfully",
            content = @Content(mediaType = "application/json", example = "{\"success\": true, \"message\": \"Product updated successfully\", \"product\": {\"id\": 1, \"name\": \"Updated Product\", \"nameArabic\": \"منتج محدث\", \"description\": \"Updated description of Product A\", \"price\": 12.50, \"stockQuantity\": 90, \"imageUrl\": \"http://example.com/imageA_updated.jpg\", \"weightVolume\": \"1.5kg\", \"status\": \"ACTIVE\", \"category\": {\"id\": 1, \"name\": \"Category 1\"}}}\n")),
        @ApiResponse(responseCode = "400", description = "Invalid product data",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error updating product: Invalid data\"}")),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Unauthorized\"}")),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Forbidden\"}")),
        @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Product not found with ID: 1\"}"))
    })
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        try {
            Product product = productService.updateProduct(
                id,
                request.getName(),
                request.getNameArabic(),
                request.getDescription(),
                request.getPrice(),
                request.getStockQuantity(),
                request.getImageUrl(),
                request.getWeightVolume()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product updated successfully");
            response.put("product", product);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating product: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update product stock (admin only)
     */
    @PatchMapping("/admin/{id}/stock")
    @Operation(summary = "Update product stock", description = "Update the stock quantity of an existing product (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product stock updated successfully",
            content = @Content(mediaType = "application/json", example = "{\"success\": true, \"message\": \"Product stock updated successfully\", \"newStockQuantity\": 120}")),
        @ApiResponse(responseCode = "400", description = "Invalid stock quantity",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error updating stock: Invalid quantity\"}")),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Unauthorized\"}")),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Forbidden\"}")),
        @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Product not found with ID: 1\"}"))
    })
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody StockRequest request) {
        try {
            Product product = productService.updateStock(id, request.getStockQuantity());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product stock updated successfully");
            response.put("product", product);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating product stock: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update product status (admin only)
     */
    @PatchMapping("/admin/{id}/status")
    @Operation(summary = "Update product status", description = "Update the status of an existing product (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product status updated successfully",
            content = @Content(mediaType = "application/json", example = "{\"success\": true, \"message\": \"Product status updated successfully\", \"newStatus\": \"INACTIVE\"}")),
        @ApiResponse(responseCode = "400", description = "Invalid status provided",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Error updating status: Invalid status\"}")),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Unauthorized\"}")),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Forbidden\"}")),
        @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Product not found with ID: 1\"}"))
    })
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        try {
            Product product = productService.updateStatus(id, request.getStatus());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product status updated successfully");
            response.put("product", product);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating product status: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Delete product (admin only)
     */
    @DeleteMapping("/admin/{id}")
    @Operation(summary = "Delete product", description = "Delete a product by ID (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product deleted successfully",
            content = @Content(mediaType = "application/json", example = "{\"success\": true, \"message\": \"Product deleted successfully\"}")),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Unauthorized\"}")),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Forbidden\"}")),
        @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(mediaType = "application/json", example = "{\"success\": false, \"message\": \"Product not found with ID: 1\"}"))
    })
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting product: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get low stock products (admin only)
     */
    @Operation(summary = "Get low stock products", description = "Retrieve products with stock quantity below a specified threshold (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Low stock products retrieved successfully",
            content = @Content(mediaType = "application/json", example = "[{\"id\": 5, \"name\": \"Product E\", \"nameArabic\": \"المنتج ه\", \"stockQuantity\": 5}, {\"id\": 8, \"name\": \"Product H\", \"nameArabic\": \"المنتج ح\", \"stockQuantity\": 3}]")),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Unauthorized\"}")),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Forbidden\"}"))
    })
    @GetMapping("/admin/low-stock")
    public ResponseEntity<?> getLowStockProducts(@RequestParam(defaultValue = "10") Integer threshold) {
        try {
            List<Product> products = productService.getLowStockProducts(threshold);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving low stock products: " + e.getMessage());
        }
    }

    /**
     * Get product statistics (admin only)
     */
    @Operation(summary = "Get product statistics", description = "Retrieve various product statistics (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product statistics retrieved successfully",
            content = @Content(mediaType = "application/json", example = "{\"totalProducts\": 100, \"activeProducts\": 80, \"inactiveProducts\": 20, \"averagePrice\": 50.25}")),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Unauthorized\"}")),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json", example = "{\"message\": \"Forbidden\"}"))
    })
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getProductStatistics() {
        try {
            ProductService.ProductStatistics stats = productService.getProductStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving product statistics: " + e.getMessage());
        }
    }

    /**
     * Get total inventory value (admin only)
     */
    @GetMapping("/admin/inventory-value")
    public ResponseEntity<?> getInventoryValue() {
        try {
            BigDecimal value = productService.getTotalInventoryValue();
            Map<String, Object> response = new HashMap<>();
            response.put("totalInventoryValue", value);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error calculating inventory value: " + e.getMessage());
        }
    }

    // DTO classes
    public static class ProductRequest {
        private String name;
        private String nameArabic;
        private String description;
        private BigDecimal price;
        private Integer stockQuantity;
        private Long categoryId;
        private String imageUrl;
        private String weightVolume;

        public ProductRequest() {}

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getNameArabic() { return nameArabic; }
        public void setNameArabic(String nameArabic) { this.nameArabic = nameArabic; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public Integer getStockQuantity() { return stockQuantity; }
        public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public String getWeightVolume() { return weightVolume; }
        public void setWeightVolume(String weightVolume) { this.weightVolume = weightVolume; }
    }

    public static class StockRequest {
        private Integer stockQuantity;

        public StockRequest() {}

        public Integer getStockQuantity() { return stockQuantity; }
        public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    }

    public static class StatusRequest {
        private ProductStatus status;

        public StatusRequest() {}

        public ProductStatus getStatus() { return status; }
        public void setStatus(ProductStatus status) { this.status = status; }
    }
}