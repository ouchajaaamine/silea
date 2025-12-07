package com.example.silea.enums;

import java.math.BigDecimal;

/**
 * Product sizes available for ordering
 * - For OIL products: 5L, 2L, 1L
 * - For HONEY products: 1KG, 500G, 250G
 */
public enum ProductSize {
    // Oil sizes
    OIL_5L("5L", "5 Litres", new BigDecimal("1.00")),      // Full price multiplier
    OIL_2L("2L", "2 Litres", new BigDecimal("0.42")),      // ~42% of 5L price
    OIL_1L("1L", "1 Litre", new BigDecimal("0.22")),       // ~22% of 5L price
    
    // Honey sizes
    HONEY_1KG("1kg", "1 Kilogram", new BigDecimal("1.00")), // Full price multiplier
    HONEY_500G("500g", "500 Grams", new BigDecimal("0.52")), // ~52% of 1kg price
    HONEY_250G("250g", "250 Grams", new BigDecimal("0.28")); // ~28% of 1kg price
    
    private final String code;
    private final String displayName;
    private final BigDecimal priceMultiplier;
    
    ProductSize(String code, String displayName, BigDecimal priceMultiplier) {
        this.code = code;
        this.displayName = displayName;
        this.priceMultiplier = priceMultiplier;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public BigDecimal getPriceMultiplier() {
        return priceMultiplier;
    }
    
    /**
     * Check if this size is for oil products
     */
    public boolean isOilSize() {
        return this == OIL_5L || this == OIL_2L || this == OIL_1L;
    }
    
    /**
     * Check if this size is for honey products
     */
    public boolean isHoneySize() {
        return this == HONEY_1KG || this == HONEY_500G || this == HONEY_250G;
    }
    
    /**
     * Get ProductSize from code string (e.g., "1kg", "5L")
     */
    public static ProductSize fromCode(String code) {
        for (ProductSize size : values()) {
            if (size.code.equalsIgnoreCase(code)) {
                return size;
            }
        }
        throw new IllegalArgumentException("Invalid size code: " + code + 
            ". Valid sizes are: 5L, 2L, 1L (for oil) or 1kg, 500g, 250g (for honey)");
    }
    
    /**
     * Get available sizes for a category type
     */
    public static ProductSize[] getOilSizes() {
        return new ProductSize[] { OIL_5L, OIL_2L, OIL_1L };
    }
    
    public static ProductSize[] getHoneySizes() {
        return new ProductSize[] { HONEY_1KG, HONEY_500G, HONEY_250G };
    }
}
