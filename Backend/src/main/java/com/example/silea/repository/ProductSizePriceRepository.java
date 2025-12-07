package com.example.silea.repository;

import com.example.silea.entity.ProductSizePrice;
import com.example.silea.enums.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductSizePriceRepository extends JpaRepository<ProductSizePrice, Long> {
    
    List<ProductSizePrice> findByProductId(Long productId);
    
    Optional<ProductSizePrice> findByProductIdAndSize(Long productId, ProductSize size);
    
    @Query("SELECT psp FROM ProductSizePrice psp WHERE psp.product.id = :productId AND psp.size = :size")
    Optional<ProductSizePrice> findPriceForProductAndSize(@Param("productId") Long productId, @Param("size") ProductSize size);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM ProductSizePrice psp WHERE psp.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
