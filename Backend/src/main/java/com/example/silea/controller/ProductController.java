package com.example.silea.controller;

import com.example.silea.entity.Product;
import com.example.silea.entity.ProductImage;
import com.example.silea.entity.ProductSizePrice;
import com.example.silea.enums.ProductSize;
import com.example.silea.enums.ProductStatus;
import com.example.silea.repository.ProductImageRepository;
import com.example.silea.repository.ProductSizePriceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import com.example.silea.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
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
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
@Tag(name = "Products", description = "Product catalog and inventory management endpoints")
public class ProductController {

    private final ProductService productService;
    private final ProductSizePriceRepository sizePriceRepository;
    private final ProductImageRepository productImageRepository;

    public ProductController(ProductService productService, ProductSizePriceRepository sizePriceRepository, ProductImageRepository productImageRepository) {
        this.productService = productService;
        this.sizePriceRepository = sizePriceRepository;
        this.productImageRepository = productImageRepository;
    }

    /**
     * Get all active products with pagination (public endpoint)
     */
    @GetMapping
    @Operation(summary = "Get products", description = "Retrieve paginated list of active products for the public catalog")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Products retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Page.class),
                examples = @ExampleObject(value = "{\"products\": [{\"id\": 1, \"name\": \"Product A\", \"nameArabic\": \"المنتج أ\", \"description\": \"Description of Product A\", \"price\": 10.99, \"stockQuantity\": 100, \"imageUrl\": \"http://example.com/imageA.jpg\", \"weightVolume\": \"1kg\", \"status\": \"ACTIVE\", \"category\": {\"id\": 1, \"name\": \"Category 1\"}}], \"totalElements\": 1, \"totalPages\": 1, \"currentPage\": 0}")
            )
        )
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
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class), examples = @ExampleObject(value = "{\"id\": 1, \"name\": \"Product A\", \"nameArabic\": \"المنتج أ\", \"description\": \"Description of Product A\", \"price\": 10.99, \"stockQuantity\": 100, \"imageUrl\": \"http://example.com/imageA.jpg\", \"weightVolume\": \"1kg\", \"status\": \"ACTIVE\", \"category\": {\"id\": 1, \"name\": \"Category 1\"}}"))),
        @ApiResponse(responseCode = "404", description = "Product with the specified ID does not exist.",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Product not found\"}"))),
        @ApiResponse(responseCode = "500", description = "Error retrieving product.",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving product: Internal Server Error\"}")))
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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"name\": \"Product A\", \"nameArabic\": \"المنتج أ\", \"description\": \"Description of Product A\", \"price\": 10.99, \"stockQuantity\": 100, \"imageUrl\": \"http://example.com/imageA.jpg\", \"weightVolume\": \"1kg\", \"status\": \"ACTIVE\", \"category\": {\"id\": 1, \"name\": \"Category 1\"}}]"))),
        @ApiResponse(responseCode = "500", description = "Error searching products.",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error searching products: Internal Server Error\"}")))
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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"name\": \"Product A\", \"nameArabic\": \"المنتج أ\", \"description\": \"Description of Product A\", \"price\": 10.99, \"stockQuantity\": 100, \"imageUrl\": \"http://example.com/imageA.jpg\", \"weightVolume\": \"1kg\", \"status\": \"ACTIVE\", \"category\": {\"id\": 1, \"name\": \"Category 1\"}}]"))),
        @ApiResponse(responseCode = "500", description = "Error retrieving products by category.",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving products by category: Internal Server Error\"}")))
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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"name\": \"Featured Product 1\", \"nameArabic\": \"منتج مميز 1\", \"description\": \"Description of Featured Product 1\", \"price\": 25.00, \"stockQuantity\": 50, \"imageUrl\": \"http://example.com/featured1.jpg\", \"weightVolume\": \"500g\", \"status\": \"ACTIVE\", \"category\": {\"id\": 2, \"name\": \"Category 2\"}}]"))),
        @ApiResponse(responseCode = "500", description = "Error retrieving featured products.",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving featured products: Internal Server Error\"}")))
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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": true, \"message\": \"Product created successfully\", \"product\": {\"id\": 2, \"name\": \"New Product\", \"nameArabic\": \"منتج جديد\", \"description\": \"Detailed description of the new product.\", \"price\": 29.99, \"stockQuantity\": 150, \"imageUrl\": \"http://example.com/new_product.jpg\", \"weightVolume\": \"2kg\", \"status\": \"ACTIVE\", \"category\": {\"id\": 1, \"name\": \"Category 1\"}}}"))),
        @ApiResponse(responseCode = "400", description = "Invalid product data",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Error creating product: Invalid data\"}"))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Unauthorized\"}"))),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Forbidden\"}")))
    })
    @Transactional
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request) {
        try {
            Product product = productService.createProduct(
                request.getName(),
                request.getNameArabic(),
                request.getDescription(),
                request.getDescriptionFr(),
                request.getDescriptionAr(),
                request.getPrice(),
                request.getAvailable(),
                request.getCategoryId(),
                request.getImageUrl()
            );

            // Save size prices if provided
            if (request.getSizePrices() != null && !request.getSizePrices().isEmpty()) {
                List<ProductSizePrice> sizePrices = new ArrayList<>();
                for (SizePriceRequest sizePrice : request.getSizePrices()) {
                    ProductSize size = ProductSize.fromCode(sizePrice.getSizeCode());
                    if (size != null && sizePrice.getPrice() != null) {
                        ProductSizePrice psp = new ProductSizePrice(product, size, sizePrice.getPrice());
                        sizePrices.add(psp);
                    }
                }
                sizePriceRepository.saveAll(sizePrices);
                product.setSizePrices(sizePrices);
            }

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
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": true, \"message\": \"Product updated successfully\", \"product\": {\"id\": 1, \"name\": \"Updated Product\", \"nameArabic\": \"منتج محدث\", \"description\": \"Updated description of Product A\", \"price\": 12.50, \"stockQuantity\": 90, \"imageUrl\": \"http://example.com/imageA_updated.jpg\", \"weightVolume\": \"1.5kg\", \"status\": \"ACTIVE\", \"category\": {\"id\": 1, \"name\": \"Category 1\"}}}\n"))),
        @ApiResponse(responseCode = "400", description = "Invalid product data",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Error updating product: Invalid data\"}"))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Unauthorized\"}"))),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Forbidden\"}"))),
        @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Product not found with ID: 1\"}")))
    })
    @Transactional
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        try {
            Product product = productService.updateProduct(
                id,
                request.getName(),
                request.getNameArabic(),
                request.getDescription(),
                request.getDescriptionFr(),
                request.getDescriptionAr(),
                request.getPrice(),
                request.getAvailable(),
                request.getImageUrl()
            );

            // Update size prices if provided
            if (request.getSizePrices() != null) {
                updateProductSizePrices(product, request.getSizePrices());
            }

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
     * Update product status (admin only)
     */
    @PatchMapping("/admin/{id}/status")
    @Operation(summary = "Update product status", description = "Update the status of an existing product (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product status updated successfully",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": true, \"message\": \"Product status updated successfully\", \"newStatus\": \"INACTIVE\"}"))),
        @ApiResponse(responseCode = "400", description = "Invalid status provided",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Error updating status: Invalid status\"}"))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Unauthorized\"}"))),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Forbidden\"}"))),
        @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Product not found with ID: 1\"}")))
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
     * Update product featured status (admin only)
     */
    @PatchMapping("/admin/{id}/featured")
    @Operation(summary = "Update product featured", description = "Toggle product featured status (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product featured status updated successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<?> updateFeatured(@PathVariable Long id, @RequestBody FeaturedRequest request) {
        try {
            Product product = productService.updateFeatured(id, request.getFeatured());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product featured status updated successfully");
            response.put("product", product);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating product featured status: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update product availability (admin only)
     */
    @PatchMapping("/admin/{id}/available")
    @Operation(summary = "Update product availability", description = "Toggle product availability (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product availability updated successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<?> updateAvailable(@PathVariable Long id, @RequestBody AvailableRequest request) {
        try {
            Product product = productService.updateAvailable(id, request.getAvailable());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product availability updated successfully");
            response.put("product", product);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating product availability: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Soft delete product - deactivates instead of deleting (admin only)
     */
    @DeleteMapping("/admin/{id}")
    @Operation(summary = "Deactivate product", description = "Soft delete a product by setting its status to INACTIVE (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product deactivated successfully",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": true, \"message\": \"Product deactivated successfully\"}"))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Unauthorized\"}"))),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Forbidden\"}"))),
        @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Product not found with ID: 1\"}")))
    })
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            // Soft delete: set status to INACTIVE instead of actually deleting
            Product product = productService.updateStatus(id, ProductStatus.INACTIVE);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product deactivated successfully");
            response.put("product", product);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deactivating product: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get unavailable products (admin only)
     */
    @Operation(summary = "Get unavailable products", description = "Retrieve products that are currently unavailable (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Unavailable products retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    @GetMapping("/admin/unavailable")
    public ResponseEntity<?> getUnavailableProducts() {
        try {
            List<Product> products = productService.getUnavailableProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving unavailable products: " + e.getMessage());
        }
    }

    /**
     * Get product statistics (admin only)
     */
    @Operation(summary = "Get product statistics", description = "Retrieve various product statistics (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product statistics retrieved successfully",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"totalProducts\": 100, \"activeProducts\": 80, \"inactiveProducts\": 20, \"averagePrice\": 50.25}"))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Unauthorized\"}"))),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Forbidden\"}")))
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

    // ============================================
    // PRODUCT IMAGES MANAGEMENT
    // ============================================

    /**
     * Add images to a product (admin only)
     */
    @PostMapping("/admin/{id}/images")
    @Operation(summary = "Add product images", description = "Add one or more images to a product (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @Transactional
    public ResponseEntity<?> addProductImages(@PathVariable Long id, @RequestBody ImageRequest request) {
        try {
            Optional<Product> productOpt = productService.findById(id);
            if (productOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Product product = productOpt.get();
            
            List<ProductImage> savedImages = new ArrayList<>();
            int currentCount = (int) productImageRepository.countByProductId(id);
            
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                String imageUrl = request.getImageUrls().get(i);
                boolean isPrimary = (currentCount == 0 && i == 0); // First image is primary if none exist
                
                ProductImage image = new ProductImage(imageUrl, product, currentCount + i, isPrimary);
                savedImages.add(productImageRepository.save(image));
            }
            
            // Also update the legacy imageUrl field with the first/primary image
            if (currentCount == 0 && !savedImages.isEmpty()) {
                product.setImageUrl(savedImages.get(0).getImageUrl());
                productService.save(product);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Images added successfully");
            response.put("images", savedImages);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error adding images: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get all images for a product
     */
    @GetMapping("/{id}/images")
    @Operation(summary = "Get product images", description = "Retrieve all images for a product")
    public ResponseEntity<?> getProductImages(@PathVariable Long id) {
        try {
            List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(id);
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving images: " + e.getMessage());
        }
    }

    /**
     * Delete a product image (admin only)
     */
    @DeleteMapping("/admin/{productId}/images/{imageId}")
    @Operation(summary = "Delete product image", description = "Delete a specific image from a product (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @Transactional
    public ResponseEntity<?> deleteProductImage(@PathVariable Long productId, @PathVariable Long imageId) {
        try {
            Optional<ProductImage> imageOpt = productImageRepository.findById(imageId);
            if (imageOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProductImage image = imageOpt.get();
            if (!image.getProduct().getId().equals(productId)) {
                return ResponseEntity.badRequest().body("Image does not belong to this product");
            }
            
            boolean wasPrimary = image.getIsPrimary();
            productImageRepository.delete(image);
            
            // If deleted image was primary, set next available as primary
            if (wasPrimary) {
                List<ProductImage> remainingImages = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
                if (!remainingImages.isEmpty()) {
                    ProductImage newPrimary = remainingImages.get(0);
                    newPrimary.setIsPrimary(true);
                    productImageRepository.save(newPrimary);
                    
                    // Update legacy imageUrl
                    Optional<Product> productOpt = productService.findById(productId);
                    if (productOpt.isPresent()) {
                        productOpt.get().setImageUrl(newPrimary.getImageUrl());
                        productService.save(productOpt.get());
                    }
                } else {
                    // No more images, clear legacy field
                    Optional<Product> productOpt = productService.findById(productId);
                    if (productOpt.isPresent()) {
                        productOpt.get().setImageUrl(null);
                        productService.save(productOpt.get());
                    }
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting image: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Set an image as primary (admin only)
     */
    @PatchMapping("/admin/{productId}/images/{imageId}/primary")
    @Operation(summary = "Set primary image", description = "Set a specific image as the primary product image (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @Transactional
    public ResponseEntity<?> setPrimaryImage(@PathVariable Long productId, @PathVariable Long imageId) {
        try {
            Optional<ProductImage> imageOpt = productImageRepository.findById(imageId);
            if (imageOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProductImage image = imageOpt.get();
            if (!image.getProduct().getId().equals(productId)) {
                return ResponseEntity.badRequest().body("Image does not belong to this product");
            }
            
            // Clear all primary flags for this product
            productImageRepository.clearPrimaryForProduct(productId);
            
            // Set this image as primary
            image.setIsPrimary(true);
            productImageRepository.save(image);
            
            // Update legacy imageUrl field
            Optional<Product> productOpt = productService.findById(productId);
            if (productOpt.isPresent()) {
                productOpt.get().setImageUrl(image.getImageUrl());
                productService.save(productOpt.get());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Primary image updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error setting primary image: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Reorder product images (admin only)
     */
    @PutMapping("/admin/{productId}/images/reorder")
    @Operation(summary = "Reorder product images", description = "Update the display order of product images (Admin only)",
        security = @SecurityRequirement(name = "bearerAuth"))
    @Transactional
    public ResponseEntity<?> reorderProductImages(@PathVariable Long productId, @RequestBody ReorderImagesRequest request) {
        try {
            for (int i = 0; i < request.getImageIds().size(); i++) {
                Long imageId = request.getImageIds().get(i);
                Optional<ProductImage> imageOpt = productImageRepository.findById(imageId);
                if (imageOpt.isPresent() && imageOpt.get().getProduct().getId().equals(productId)) {
                    ProductImage image = imageOpt.get();
                    image.setDisplayOrder(i);
                    productImageRepository.save(image);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Images reordered successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error reordering images: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // DTO classes
    public static class ProductRequest {
        private String name;
        private String nameArabic;
        private String description;
        private String descriptionFr;
        private String descriptionAr;
        private BigDecimal price;
        private Boolean available;
        private Long categoryId;
        private String imageUrl;
        private List<SizePriceRequest> sizePrices;

        public ProductRequest() {}

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getNameArabic() { return nameArabic; }
        public void setNameArabic(String nameArabic) { this.nameArabic = nameArabic; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getDescriptionFr() { return descriptionFr; }
        public void setDescriptionFr(String descriptionFr) { this.descriptionFr = descriptionFr; }

        public String getDescriptionAr() { return descriptionAr; }
        public void setDescriptionAr(String descriptionAr) { this.descriptionAr = descriptionAr; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public Boolean getAvailable() { return available; }
        public void setAvailable(Boolean available) { this.available = available; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public List<SizePriceRequest> getSizePrices() { return sizePrices; }
        public void setSizePrices(List<SizePriceRequest> sizePrices) { this.sizePrices = sizePrices; }
    }

    public static class SizePriceRequest {
        private String sizeCode;
        private BigDecimal price;

        public SizePriceRequest() {}

        public String getSizeCode() { return sizeCode; }
        public void setSizeCode(String sizeCode) { this.sizeCode = sizeCode; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }

    public static class StatusRequest {
        private ProductStatus status;

        public StatusRequest() {}

        public ProductStatus getStatus() { return status; }
        public void setStatus(ProductStatus status) { this.status = status; }
    }

    public static class FeaturedRequest {
        private Boolean featured;

        public FeaturedRequest() {}

        public Boolean getFeatured() { return featured; }
        public void setFeatured(Boolean featured) { this.featured = featured; }
    }

    public static class AvailableRequest {
        private Boolean available;

        public AvailableRequest() {}

        public Boolean getAvailable() { return available; }
        public void setAvailable(Boolean available) { this.available = available; }
    }

    public static class ImageRequest {
        private List<String> imageUrls;

        public ImageRequest() {}

        public List<String> getImageUrls() { return imageUrls; }
        public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    }

    public static class ReorderImagesRequest {
        private List<Long> imageIds;

        public ReorderImagesRequest() {}

        public List<Long> getImageIds() { return imageIds; }
        public void setImageIds(List<Long> imageIds) { this.imageIds = imageIds; }
    }

    private void updateProductSizePrices(Product product, List<SizePriceRequest> sizePriceRequests) {
        // Step 1: Delete all existing size prices from database
        sizePriceRepository.deleteByProductId(product.getId());
        sizePriceRepository.flush(); // Force immediate execution of DELETE
        
        // Step 2: Clear the in-memory collection
        List<ProductSizePrice> currentPrices = product.getSizePrices();
        if (currentPrices != null) {
            currentPrices.clear();
        } else {
            currentPrices = new ArrayList<>();
            product.setSizePrices(currentPrices);
        }

        // Step 3: Build and save new size prices
        for (SizePriceRequest sizePrice : sizePriceRequests) {
            if (sizePrice == null || sizePrice.getPrice() == null) {
                continue;
            }
            ProductSize size = ProductSize.fromCode(sizePrice.getSizeCode());
            if (size != null) {
                ProductSizePrice psp = new ProductSizePrice(product, size, sizePrice.getPrice());
                currentPrices.add(psp);
            }
        }
        
        // Step 4: Save all new prices
        if (!currentPrices.isEmpty()) {
            sizePriceRepository.saveAll(currentPrices);
        }
    }
}