package com.example.silea.controller;

import com.example.silea.entity.Category;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import com.example.silea.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * Get all categories
     */
    @GetMapping
    @Operation(summary = "Get all categories", description = "Retrieve a list of all product categories")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved all categories",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"name\": \"Electronics\", \"nameArabic\": \"إلكترونيات\", \"description\": \"Electronic gadgets and devices\", \"active\": true}, {\"id\": 2, \"name\": \"Books\", \"nameArabic\": \"كتب\", \"description\": \"Various genres of books\", \"active\": true}]"))),
        @ApiResponse(responseCode = "500", description = "Error retrieving categories",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving categories: Internal Server Error\"}")))
    })
    public ResponseEntity<?> getAllCategories() {
        try {
            List<Category> categories = categoryService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving categories: " + e.getMessage());
        }
    }

    /**
     * Get active categories
     */
    @GetMapping("/active")
    @Operation(summary = "Get active categories", description = "Retrieve a list of all active product categories")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved active categories",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"name\": \"Electronics\", \"nameArabic\": \"إلكترونيات\", \"description\": \"Electronic gadgets and devices\", \"active\": true}, {\"id\": 2, \"name\": \"Books\", \"nameArabic\": \"كتب\", \"description\": \"Various genres of books\", \"active\": true}]"))),
        @ApiResponse(responseCode = "500", description = "Error retrieving active categories",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving active categories: Internal Server Error\"}")))
    })
    public ResponseEntity<?> getActiveCategories() {
        try {
            List<Category> categories = categoryService.getActiveCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving active categories: " + e.getMessage());
        }
    }

    /**
     * Get category by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Retrieve a single category by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved category",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"id\": 1, \"name\": \"Electronics\", \"nameArabic\": \"إلكترونيات\", \"description\": \"Electronic gadgets and devices\", \"active\": true}"))),
        @ApiResponse(responseCode = "404", description = "Category not found",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Category not found with ID: 1\"}"))),
        @ApiResponse(responseCode = "500", description = "Error retrieving category",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving category: Internal Server Error\"}")))
    })
    public ResponseEntity<?> getCategory(@PathVariable Long id) {
        try {
            Optional<Category> category = categoryService.findById(id);
            if (category.isPresent()) {
                return ResponseEntity.ok(category.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving category: " + e.getMessage());
        }
    }

    /**
     * Create new category
     */
    @PostMapping
    @Operation(summary = "Create new category", description = "Create a new product category (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Category created successfully",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": true, \"message\": \"Category created successfully\", \"category\": {\"id\": 3, \"name\": \"New Category\", \"nameArabic\": \"فئة جديدة\", \"description\": \"Description of new category\", \"active\": true}}"))),
        @ApiResponse(responseCode = "400", description = "Invalid category data",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Error creating category: Name cannot be empty\"}"))),
        @ApiResponse(responseCode = "500", description = "Error creating category",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Error creating category: Internal Server Error\"}")))
    })
    public ResponseEntity<?> createCategory(@RequestBody CategoryRequest request) {
        try {
            Category category = categoryService.createCategory(
                request.getName(),
                request.getNameArabic(),
                request.getDescription()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Category created successfully");
            response.put("category", category);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error creating category: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update category
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Update an existing product category (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Category updated successfully",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": true, \"message\": \"Category updated successfully\", \"category\": {\"id\": 1, \"name\": \"Updated Electronics\", \"nameArabic\": \"إلكترونيات محدثة\", \"description\": \"Updated description\", \"active\": true}}"))),
        @ApiResponse(responseCode = "400", description = "Invalid category data",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Error updating category: Name cannot be empty\"}"))),
        @ApiResponse(responseCode = "404", description = "Category not found",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Category not found with ID: 1\"}"))),
        @ApiResponse(responseCode = "500", description = "Error updating category",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Error updating category: Internal Server Error\"}")))
    })
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        try {
            Category category = categoryService.updateCategory(
                id,
                request.getName(),
                request.getNameArabic(),
                request.getDescription()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Category updated successfully");
            response.put("category", category);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating category: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Activate/deactivate category
     */
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update category status", description = "Activate or deactivate an existing product category (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Category status updated successfully",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": true, \"message\": \"Category status updated successfully\", \"category\": {\"id\": 1, \"name\": \"Electronics\", \"nameArabic\": \"إلكترونيات\", \"description\": \"Description\", \"active\": true}}"))),
        @ApiResponse(responseCode = "404", description = "Category not found",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Category not found with ID: 1\"}"))),
        @ApiResponse(responseCode = "500", description = "Error updating category status",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Error updating category status: Internal Server Error\"}")))
    })
    public ResponseEntity<?> updateCategoryStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        try {
            Category category = categoryService.setCategoryActive(id, request.isActive());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Category status updated successfully");
            response.put("category", category);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating category status: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Delete category
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Delete a product category (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Category deleted successfully",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": true, \"message\": \"Category deleted successfully\"}"))),
        @ApiResponse(responseCode = "404", description = "Category not found",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Category not found with ID: 1\"}"))),
        @ApiResponse(responseCode = "500", description = "Error deleting category",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Error deleting category: Internal Server Error\"}")))
    })
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Category deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting category: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Search categories
     */
    @GetMapping("/search")
    @Operation(summary = "Search categories", description = "Search for product categories by name or description")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved matching categories",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"name\": \"Electronics\", \"nameArabic\": \"إلكترونيات\", \"description\": \"Electronic gadgets and devices\", \"active\": true}]"))),
        @ApiResponse(responseCode = "500", description = "Error searching categories",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error searching categories: Internal Server Error\"}")))
    })
    public ResponseEntity<?> searchCategories(@RequestParam String query) {
        try {
            List<Category> categories = categoryService.searchCategories(query);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error searching categories: " + e.getMessage());
        }
    }

    /**
     * Get category statistics
     */
    @GetMapping("/stats")
    @Operation(summary = "Get category statistics", description = "Retrieve statistics about product categories")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved category statistics",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"totalCategories\": 5, \"activeCategories\": 3, \"inactiveCategories\": 2}"))),
        @ApiResponse(responseCode = "500", description = "Error retrieving category statistics",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error retrieving category statistics: Internal Server Error\"}")))
    })
    public ResponseEntity<?> getCategoryStatistics() {
        try {
            CategoryService.CategoryStatistics stats = categoryService.getCategoryStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving category statistics: " + e.getMessage());
        }
    }

    /**
     * Update category image
     */
    @PatchMapping("/{id}/image")
    @Operation(summary = "Update category image", description = "Update the image URL of a category (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Category image updated successfully"),
        @ApiResponse(responseCode = "404", description = "Category not found"),
        @ApiResponse(responseCode = "500", description = "Error updating category image")
    })
    public ResponseEntity<?> updateCategoryImage(@PathVariable Long id, @RequestBody ImageRequest request) {
        try {
            Category category = categoryService.updateCategoryImage(id, request.getImageUrl());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Category image updated successfully");
            response.put("category", category);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating category image: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // DTO classes
    public static class CategoryRequest {
        private String name;
        private String nameArabic;
        private String description;
        private String imageUrl;
        private String slug;

        public CategoryRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getNameArabic() { return nameArabic; }
        public void setNameArabic(String nameArabic) { this.nameArabic = nameArabic; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        
        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }
    }

    public static class StatusRequest {
        private boolean active;

        public StatusRequest() {}

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
    }
    
    public static class ImageRequest {
        private String imageUrl;

        public ImageRequest() {}

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
}