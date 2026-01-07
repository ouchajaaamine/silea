package com.example.silea.service;

import com.example.silea.entity.Product;
import com.example.silea.enums.ProductSize;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CartService {

    /**
     * Calculate cart total with size support
     */
    public BigDecimal calculateTotal(List<CartItem> items) {
        return items.stream()
                .map(item -> {
                    BigDecimal unitPrice = calculateUnitPrice(item.getProduct(), item.getSize());
                    return unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Calculate unit price based on product base price and size
     */
    public BigDecimal calculateUnitPrice(Product product, ProductSize size) {
        if (size == null) {
            return product.getPrice();
        }
        return product.getPrice()
                .multiply(size.getPriceMultiplier())
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Validate cart items (check product availability)
     */
    public CartValidationResult validateCart(List<CartItem> items, ProductService productService) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        for (CartItem item : items) {
            Product product = item.getProduct();

            // Check if product exists and is active
            if (product.getStatus() != com.example.silea.enums.ProductStatus.ACTIVE) {
                errors.add("Product '" + product.getName() + "' is not available");
                continue;
            }

            // Check product availability
            if (!product.getAvailable()) {
                errors.add("Product '" + product.getName() + "' is currently unavailable");
            }
        }

        return new CartValidationResult(errors.isEmpty(), errors, warnings);
    }

    /**
     * Process cart items (would be used during checkout)
     */
    public void processCartItems(List<CartItem> items, ProductService productService) {
        // Products are sold by size, no stock tracking needed
        // This method can be used for any checkout processing logic
    }

    /**
     * Check if cart has minimum order value
     */
    public boolean hasMinimumOrderValue(List<CartItem> items, BigDecimal minimumValue) {
        BigDecimal total = calculateTotal(items);
        return total.compareTo(minimumValue) >= 0;
    }

    /**
     * Get cart summary
     */
    public CartSummary getCartSummary(List<CartItem> items) {
        BigDecimal subtotal = calculateTotal(items);
        int totalItems = items.stream().mapToInt(CartItem::getQuantity).sum();
        BigDecimal shipping = calculateShipping(items);
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.20)); // 20% tax
        BigDecimal total = subtotal.add(shipping).add(tax);

        return new CartSummary(subtotal, shipping, tax, total, totalItems);
    }

    /**
     * Calculate shipping cost based on city and product category
     * 
     * FREE SHIPPING CONDITIONS:
     *   - Cart total >= 700 MAD (any products)
     *   - Oil products: 10L or more
     * 
     * For HONEY products:
     *   - Tanger: 20 MAD
     *   - Other cities: 35 MAD
     * 
     * For OIL products:
     *   - Tanger, Casablanca, Beni Mellal, Mohammedia: 30 MAD
     *   - Other cities: NOT AVAILABLE
     * 
     * Delivery time: 24-72h
     */
    public BigDecimal calculateShipping(String city, List<CartItem> items) {
        if (city == null || city.trim().isEmpty()) {
            return BigDecimal.valueOf(35); // Default
        }
        
        // Calculate cart subtotal
        BigDecimal subtotal = calculateTotal(items);
        
        // FREE SHIPPING: Cart total >= 700 MAD
        if (subtotal.compareTo(BigDecimal.valueOf(700)) >= 0) {
            return BigDecimal.ZERO;
        }
        
        String normalizedCity = city.trim().toLowerCase();
        
        // Check if cart contains oil products and calculate total oil volume
        double totalOilVolume = 0.0;
        boolean hasOilProducts = false;
        boolean hasHoneyProducts = false;
        
        for (CartItem item : items) {
            String categoryName = item.getProduct().getCategory().getName().toLowerCase();
            
            if (categoryName.contains("oil") || categoryName.contains("huile") || categoryName.contains("زيت")) {
                hasOilProducts = true;
                
                // Calculate oil volume from size
                if (item.getSize() != null) {
                    String sizeCode = item.getSize().getCode();
                    double liters = 0.0;
                    
                    // Extract liters from size code (e.g., "OIL_250ML" = 0.25L, "OIL_5L" = 5L)
                    if (sizeCode.contains("5L")) liters = 5.0;
                    else if (sizeCode.contains("3L")) liters = 3.0;
                    else if (sizeCode.contains("2L")) liters = 2.0;
                    else if (sizeCode.contains("1L")) liters = 1.0;
                    else if (sizeCode.contains("750ML")) liters = 0.75;
                    else if (sizeCode.contains("500ML")) liters = 0.5;
                    else if (sizeCode.contains("250ML")) liters = 0.25;
                    
                    totalOilVolume += liters * item.getQuantity();
                }
            }
            
            if (categoryName.contains("honey") || categoryName.contains("miel") || categoryName.contains("عسل")) {
                hasHoneyProducts = true;
            }
        }
        
        // FREE SHIPPING: 10L or more of oil
        if (hasOilProducts && totalOilVolume >= 10.0) {
            return BigDecimal.ZERO;
        }
        
        // Oil delivery cities (Tanger, Casablanca, Beni Mellal, Mohammedia)
        boolean isOilDeliveryCity = normalizedCity.equals("tanger") || 
                                   normalizedCity.equals("tangier") ||
                                   normalizedCity.equals("طنجة") ||
                                   normalizedCity.equals("casablanca") ||
                                   normalizedCity.equals("الدار البيضاء") ||
                                   normalizedCity.equals("beni mellal") ||
                                   normalizedCity.equals("béni mellal") ||
                                   normalizedCity.equals("بني ملال") ||
                                   normalizedCity.equals("mohammedia") ||
                                   normalizedCity.equals("المحمدية");
        
        // If cart has oil products and city is not in delivery list, return error indicator
        if (hasOilProducts && !isOilDeliveryCity) {
            return BigDecimal.valueOf(-1); // Error indicator: oil not deliverable
        }
        
        // If only oil products or mixed cart in valid city
        if (hasOilProducts && isOilDeliveryCity) {
            return BigDecimal.valueOf(30); // 30 MAD for all oil delivery cities
        }
        
        // Honey-only products: original logic
        if (hasHoneyProducts && !hasOilProducts) {
            // Tanger: 20 MAD
            if (normalizedCity.equals("tanger") || 
                normalizedCity.equals("tangier") || 
                normalizedCity.equals("طنجة")) {
                return BigDecimal.valueOf(20);
            }
            // Other cities: 35 MAD
            return BigDecimal.valueOf(35);
        }
        
        // Default
        return BigDecimal.valueOf(35);
    }
    
    /**
     * Calculate shipping cost based on city only (for backward compatibility)
     * Tanger: 20 MAD
     * Other cities: 35 MAD
     * Delivery time: 24-72h
     */
    public BigDecimal calculateShipping(String city) {
        if (city == null || city.trim().isEmpty()) {
            return BigDecimal.valueOf(35); // Default to other cities
        }
        
        String normalizedCity = city.trim().toLowerCase();
        // Check if city is Tanger (handle various spellings)
        if (normalizedCity.equals("tanger") || 
            normalizedCity.equals("tangier") || 
            normalizedCity.equals("طنجة")) {
            return BigDecimal.valueOf(20);
        }
        
        // All other cities
        return BigDecimal.valueOf(35);
    }
    
    /**
     * Get shipping info for a city
     */
    public Map<String, Object> getShippingInfo(String city) {
        BigDecimal cost = calculateShipping(city);
        Map<String, Object> info = new HashMap<>();
        info.put("cost", cost);
        info.put("deliveryTime", "24-72h");
        info.put("city", city);
        return info;
    }

    /**
     * Calculate shipping cost (simple implementation - deprecated, use calculateShipping(city) instead)
     */
    @Deprecated
    private BigDecimal calculateShipping(List<CartItem> items) {
        // Default shipping cost for other cities
        return BigDecimal.valueOf(35);
    }

    // DTO classes
    public static class CartItem {
        private final Product product;
        private final int quantity;
        private final ProductSize size;

        public CartItem(Product product, int quantity) {
            this.product = product;
            this.quantity = quantity;
            this.size = null;
        }
        
        public CartItem(Product product, int quantity, ProductSize size) {
            this.product = product;
            this.quantity = quantity;
            this.size = size;
        }

        public Product getProduct() { return product; }
        public int getQuantity() { return quantity; }
        public ProductSize getSize() { return size; }
    }

    public static class CartValidationResult {
        private final boolean valid;
        private final List<String> errors;
        private final List<String> warnings;

        public CartValidationResult(boolean valid, List<String> errors, List<String> warnings) {
            this.valid = valid;
            this.errors = errors;
            this.warnings = warnings;
        }

        public boolean isValid() { return valid; }
        public List<String> getErrors() { return errors; }
        public List<String> getWarnings() { return warnings; }
    }

    public static class CartSummary {
        private final BigDecimal subtotal;
        private final BigDecimal shipping;
        private final BigDecimal tax;
        private final BigDecimal total;
        private final int totalItems;

        public CartSummary(BigDecimal subtotal, BigDecimal shipping, BigDecimal tax,
                          BigDecimal total, int totalItems) {
            this.subtotal = subtotal;
            this.shipping = shipping;
            this.tax = tax;
            this.total = total;
            this.totalItems = totalItems;
        }

        public BigDecimal getSubtotal() { return subtotal; }
        public BigDecimal getShipping() { return shipping; }
        public BigDecimal getTax() { return tax; }
        public BigDecimal getTotal() { return total; }
        public int getTotalItems() { return totalItems; }
    }
}