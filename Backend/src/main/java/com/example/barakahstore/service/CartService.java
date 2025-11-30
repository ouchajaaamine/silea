package com.example.barakahstore.service;

import com.example.barakahstore.entity.Product;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    /**
     * Calculate cart total
     */
    public BigDecimal calculateTotal(List<CartItem> items) {
        return items.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Validate cart items (check stock availability)
     */
    public CartValidationResult validateCart(List<CartItem> items, ProductService productService) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        for (CartItem item : items) {
            Product product = item.getProduct();

            // Check if product exists and is active
            if (product.getStatus() != com.example.barakahstore.enums.ProductStatus.ACTIVE) {
                errors.add("Product '" + product.getName() + "' is not available");
                continue;
            }

            // Check stock availability
            if (product.getStock() < item.getQuantity()) {
                errors.add("Insufficient stock for '" + product.getName() + "'. Available: " + product.getStock());
            } else if (product.getStock() <= 5) { // Low stock warning
                warnings.add("Low stock for '" + product.getName() + "'. Only " + product.getStock() + " left");
            }
        }

        return new CartValidationResult(errors.isEmpty(), errors, warnings);
    }

    /**
     * Reserve stock for cart items (would be used during checkout)
     */
    public void reserveStock(List<CartItem> items, ProductService productService) {
        for (CartItem item : items) {
            productService.reduceStock(item.getProduct().getId(), item.getQuantity());
        }
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

        public CartItem(Product product, int quantity) {
            this.product = product;
            this.quantity = quantity;
        }

        public Product getProduct() { return product; }
        public int getQuantity() { return quantity; }
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