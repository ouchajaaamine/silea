package com.example.silea.controller;

import com.example.silea.entity.Category;
import com.example.silea.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Public API for categories - no authentication required
 */
@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
@Tag(name = "Public Categories", description = "Public API for browsing categories")
public class PublicCategoryController {

    private final CategoryService categoryService;

    public PublicCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * Get all active categories for public display
     */
    @GetMapping
    @Operation(summary = "Get all active categories", description = "Retrieve all active categories for public browsing")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved categories",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "[{\"id\": 1, \"name\": \"Honey\", \"nameAr\": \"عسل\", \"slug\": \"honey\", \"description\": \"Pure mountain honey\", \"imageUrl\": \"/honey.jpg\", \"active\": true}]")))
    })
    public ResponseEntity<List<Category>> getActiveCategories() {
        List<Category> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get category by slug for public display
     */
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get category by slug", description = "Retrieve a category by its URL-friendly slug")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Category found"),
        @ApiResponse(responseCode = "404", description = "Category not found")
    })
    public ResponseEntity<?> getCategoryBySlug(@PathVariable String slug) {
        Optional<Category> category = categoryService.findActiveBySlug(slug);
        if (category.isPresent()) {
            return ResponseEntity.ok(category.get());
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get category by ID for public display
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Retrieve a category by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Category found"),
        @ApiResponse(responseCode = "404", description = "Category not found")
    })
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        Optional<Category> category = categoryService.findById(id);
        if (category.isPresent() && category.get().getIsActive()) {
            return ResponseEntity.ok(category.get());
        }
        return ResponseEntity.notFound().build();
    }
}
