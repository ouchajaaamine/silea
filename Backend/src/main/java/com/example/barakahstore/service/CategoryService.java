package com.example.barakahstore.service;

import com.example.barakahstore.entity.Category;
import com.example.barakahstore.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * Create a new category
     */
    public Category createCategory(String name, String nameArabic, String description) {
        if (categoryRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Category with this name already exists");
        }

        Category category = new Category();
        category.setName(name);
        category.setNameAr(nameArabic);
        category.setDescription(description);
        category.setIsActive(true);

        return categoryRepository.save(category);
    }

    /**
     * Update category information
     */
    public Category updateCategory(Long categoryId, String name, String nameArabic, String description) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        // Check if name is already taken by another category
        Optional<Category> existingCategory = categoryRepository.findByName(name);
        if (existingCategory.isPresent() && !existingCategory.get().getId().equals(categoryId)) {
            throw new IllegalArgumentException("Category name is already taken");
        }

        category.setName(name);
        category.setNameAr(nameArabic);
        category.setDescription(description);

        return categoryRepository.save(category);
    }

    /**
     * Activate/deactivate category
     */
    public Category setCategoryActive(Long categoryId, boolean isActive) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        category.setIsActive(isActive);
        return categoryRepository.save(category);
    }

    /**
     * Find category by ID
     */
    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id);
    }

    /**
     * Find category by name
     */
    public Optional<Category> findByName(String name) {
        return categoryRepository.findByName(name);
    }

    /**
     * Get all active categories
     */
    public List<Category> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue();
    }

    /**
     * Get all categories
     */
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    /**
     * Search categories
     */
    public List<Category> searchCategories(String searchTerm) {
        return categoryRepository.searchCategories(searchTerm);
    }

    /**
     * Get categories with product count
     */
    public List<Category> getCategoriesWithProducts() {
        return categoryRepository.findCategoriesWithProducts();
    }

    /**
     * Delete category (only if no products are associated)
     */
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        // Check if category has products
        if (!category.getProducts().isEmpty()) {
            throw new IllegalArgumentException("Cannot delete category that has associated products");
        }

        categoryRepository.deleteById(categoryId);
    }

    /**
     * Get category statistics
     */
    public CategoryStatistics getCategoryStatistics() {
        List<Category> allCategories = categoryRepository.findAll();
        List<Category> activeCategories = categoryRepository.findByIsActiveTrue();
        List<Category> categoriesWithProducts = categoryRepository.findCategoriesWithProducts();

        return new CategoryStatistics(
            allCategories.size(),
            activeCategories.size(),
            categoriesWithProducts.size()
        );
    }

    // DTO class for statistics
    public static class CategoryStatistics {
        private final long totalCategories;
        private final long activeCategories;
        private final long categoriesWithProducts;

        public CategoryStatistics(long totalCategories, long activeCategories, long categoriesWithProducts) {
            this.totalCategories = totalCategories;
            this.activeCategories = activeCategories;
            this.categoriesWithProducts = categoriesWithProducts;
        }

        // Getters
        public long getTotalCategories() { return totalCategories; }
        public long getActiveCategories() { return activeCategories; }
        public long getCategoriesWithProducts() { return categoriesWithProducts; }
    }
}