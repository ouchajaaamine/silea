package com.example.silea.controller;

import com.example.silea.entity.Product;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import com.example.silea.service.CartService;
import com.example.silea.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;
    private final ProductService productService;

    public CartController(CartService cartService, ProductService productService) {
        this.cartService = cartService;
        this.productService = productService;
    }

    /**
     * Calculate cart total
     */
    @PostMapping("/calculate")
    @Operation(summary = "Calculate cart total", description = "Calculates the total price of items in the cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully calculated cart total",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"total\": 150.75, \"itemCount\": 2}"))),
        @ApiResponse(responseCode = "500", description = "Error calculating cart total",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error calculating cart total: Internal Server Error\"}")))
    })
    public ResponseEntity<?> calculateTotal(@RequestBody List<CartItemRequest> items) {
        try {
            List<CartService.CartItem> cartItems = convertToCartItems(items);
            BigDecimal total = cartService.calculateTotal(cartItems);

            Map<String, Object> response = new HashMap<>();
            response.put("total", total);
            response.put("itemCount", items.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error calculating cart total: " + e.getMessage());
        }
    }

    /**
     * Validate cart items
     */
    @PostMapping("/validate")
    @Operation(summary = "Validate cart items", description = "Validates the items in the cart for availability and quantity")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart validation successful",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"valid\": true, \"errors\": [], \"warnings\": []}"))),
        @ApiResponse(responseCode = "500", description = "Error validating cart",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error validating cart: Internal Server Error\"}")))
    })
    public ResponseEntity<?> validateCart(@RequestBody List<CartItemRequest> items) {
        try {
            List<CartService.CartItem> cartItems = convertToCartItems(items);
            CartService.CartValidationResult validation = cartService.validateCart(cartItems, productService);

            Map<String, Object> response = new HashMap<>();
            response.put("valid", validation.isValid());
            response.put("errors", validation.getErrors());
            response.put("warnings", validation.getWarnings());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error validating cart: " + e.getMessage());
        }
    }

    /**
     * Get cart summary
     */
    @PostMapping("/summary")
    @Operation(summary = "Get cart summary", description = "Retrieves a detailed summary of the cart, including total, item count, and individual item details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved cart summary",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"subtotal\": 150.75, \"totalItems\": 2, \"items\": [{\"productId\": 1, \"productName\": \"Product A\", \"quantity\": 1, \"unitPrice\": 75.50, \"itemTotal\": 75.50}, {\"productId\": 2, \"productName\": \"Product B\", \"quantity\": 1, \"unitPrice\": 75.25, \"itemTotal\": 75.25}]}"))),
        @ApiResponse(responseCode = "500", description = "Error getting cart summary",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error getting cart summary: Internal Server Error\"}")))
    })
    public ResponseEntity<?> getCartSummary(@RequestBody List<CartItemRequest> items) {
        try {
            List<CartService.CartItem> cartItems = convertToCartItems(items);
            CartService.CartSummary summary = cartService.getCartSummary(cartItems);

            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error getting cart summary: " + e.getMessage());
        }
    }

    /**
     * Check minimum order value
     */
    @PostMapping("/check-minimum")
    @Operation(summary = "Check minimum order value", description = "Checks if the cart meets a specified minimum order value")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully checked minimum order value",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"hasMinimum\": true, \"minimumValue\": 50.00}"))),
        @ApiResponse(responseCode = "500", description = "Error checking minimum order",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error checking minimum order: Internal Server Error\"}")))
    })
    public ResponseEntity<?> checkMinimumOrder(@RequestBody MinimumOrderRequest request) {
        try {
            List<CartService.CartItem> cartItems = convertToCartItems(request.getItems());
            boolean hasMinimum = cartService.hasMinimumOrderValue(cartItems, request.getMinimumValue());

            Map<String, Object> response = new HashMap<>();
            response.put("hasMinimum", hasMinimum);
            response.put("minimumValue", request.getMinimumValue());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error checking minimum order: " + e.getMessage());
        }
    }

    /**
     * Process cart items for checkout
     */
    @PostMapping("/process")
    @Operation(summary = "Process cart items for checkout", description = "Validates and processes items in the cart for checkout")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart processed successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot process cart due to validation errors"),
        @ApiResponse(responseCode = "500", description = "Error processing cart")
    })
    public ResponseEntity<?> processCart(@RequestBody List<CartItemRequest> items) {
        try {
            List<CartService.CartItem> cartItems = convertToCartItems(items);
            CartService.CartValidationResult validation = cartService.validateCart(cartItems, productService);

            if (!validation.isValid()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cannot process cart: " + String.join(", ", validation.getErrors())
                ));
            }

            cartService.processCartItems(cartItems, productService);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cart processed successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error processing cart: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get shipping cost estimate
     */
    @PostMapping("/shipping")
    @Operation(summary = "Get shipping cost estimate", description = "Calculates the estimated shipping cost for the items in the cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully calculated shipping cost",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"subtotal\": 150.75, \"shipping\": 30.00, \"freeShippingThreshold\": 200.00}"))),
        @ApiResponse(responseCode = "500", description = "Error calculating shipping",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Error calculating shipping: Internal Server Error\"}")))
    })
    public ResponseEntity<?> calculateShipping(@RequestBody List<CartItemRequest> items) {
        try {
            List<CartService.CartItem> cartItems = convertToCartItems(items);
            BigDecimal subtotal = cartService.calculateTotal(cartItems);
            BigDecimal shipping = calculateShippingCost(cartItems);

            Map<String, Object> response = new HashMap<>();
            response.put("subtotal", subtotal);
            response.put("shipping", shipping);
            response.put("freeShippingThreshold", BigDecimal.valueOf(200));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error calculating shipping: " + e.getMessage());
        }
    }

    /**
     * Convert request items to CartService.CartItem objects
     */
    private List<CartService.CartItem> convertToCartItems(List<CartItemRequest> requests) {
        List<CartService.CartItem> cartItems = new ArrayList<>();
        for (CartItemRequest request : requests) {
            Optional<Product> product = productService.findById(request.getProductId());
            if (product.isPresent()) {
                com.example.silea.enums.ProductSize size = null;
                if (request.getSize() != null && !request.getSize().isEmpty()) {
                    try {
                        size = com.example.silea.enums.ProductSize.valueOf(request.getSize().toUpperCase());
                    } catch (IllegalArgumentException e) {
                        // Invalid size, will use null (base price)
                    }
                }
                cartItems.add(new CartService.CartItem(product.get(), request.getQuantity(), size));
            }
        }
        return cartItems;
    }

    /**
     * Calculate shipping cost (duplicate of CartService logic for API response)
     */
    private BigDecimal calculateShippingCost(List<CartService.CartItem> items) {
        BigDecimal subtotal = cartService.calculateTotal(items);
        // Free shipping over 200 DH
        return subtotal.compareTo(BigDecimal.valueOf(200)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(30);
    }

    // DTO classes
    public static class CartItemRequest {
        private Long productId;
        private int quantity;
        private String size; // e.g., "OIL_5L", "HONEY_1KG"

        public CartItemRequest() {}

        // Getters and setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        
        public String getSize() { return size; }
        public void setSize(String size) { this.size = size; }
    }

    public static class MinimumOrderRequest {
        private List<CartItemRequest> items;
        private BigDecimal minimumValue;

        public MinimumOrderRequest() {}

        // Getters and setters
        public List<CartItemRequest> getItems() { return items; }
        public void setItems(List<CartItemRequest> items) { this.items = items; }

        public BigDecimal getMinimumValue() { return minimumValue; }
        public void setMinimumValue(BigDecimal minimumValue) { this.minimumValue = minimumValue; }
    }
}