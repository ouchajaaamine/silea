package com.example.silea.service;

import com.example.silea.entity.Product;
import com.example.silea.enums.ProductSize;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

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
     * Calculate shipping cost (simple implementation)
     */
    private BigDecimal calculateShipping(List<CartItem> items) {
        BigDecimal subtotal = calculateTotal(items);
        // Free shipping over 200 DH
        return subtotal.compareTo(BigDecimal.valueOf(200)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(30);
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