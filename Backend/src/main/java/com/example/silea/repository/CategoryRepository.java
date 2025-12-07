package com.example.silea.repository;

import com.example.silea.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Find active categories only
    List<Category> findByIsActiveTrue();

    // Find inactive categories
    List<Category> findByIsActiveFalse();

    // Find category by name (French)
    Optional<Category> findByName(String name);

    // Find category by Arabic name
    Optional<Category> findByNameAr(String nameAr);
    
    // Find category by slug
    Optional<Category> findBySlug(String slug);
    
    // Find active category by slug
    Optional<Category> findBySlugAndIsActiveTrue(String slug);

    // Search categories by name (French or Arabic)
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.nameAr) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Category> searchCategories(@Param("search") String search);

    // Find categories with products
    @Query("SELECT DISTINCT c FROM Category c JOIN c.products p WHERE c.isActive = true")
    List<Category> findCategoriesWithProducts();

    // Count active categories
    long countByIsActiveTrue();

    // Find categories ordered by name
    List<Category> findAllByOrderByNameAsc();

    // Find categories ordered by Arabic name
    List<Category> findAllByOrderByNameArAsc();
}