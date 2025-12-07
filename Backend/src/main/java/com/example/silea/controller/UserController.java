package com.example.silea.controller;

import com.example.silea.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import com.example.silea.service.UserService;
import com.example.silea.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Authentication", description = "Admin authentication and user management endpoints")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    /**
     * Admin login
     */
    @PostMapping("/login")
    @Operation(summary = "Admin login", description = "Authenticate admin user and return user details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class), examples = @ExampleObject(value = "{\"success\": true, \"message\": \"Login successful\", \"token\": \"eyJhbGciOiJIUzI1NiJ9...\", \"user\": {\"id\": 1, \"email\": \"admin@example.com\", \"name\": \"Admin User\"}}"))),
        @ApiResponse(responseCode = "401", description = "Invalid credentials",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Invalid email or password\"}")))
    })
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Map<String, Object> authResult = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
            
            if ((Boolean) authResult.get("success")) {
                return ResponseEntity.ok(authResult);
            } else {
                return ResponseEntity.badRequest().body(authResult);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Check if user exists by email
     */
    @GetMapping("/check-email")
    @Operation(summary = "Check email availability", description = "Check if a user exists with the given email address",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Email check completed",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"exists\": true}"))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Unauthorized\"}")))
    })
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    /**
     * Get current user profile (would be used with JWT token in production)
     */
    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Retrieve user profile information by user ID",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"id\": 1, \"email\": \"admin@example.com\", \"name\": \"Admin User\"}"))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"Unauthorized\"}"))),
        @ApiResponse(responseCode = "404", description = "User not found",
            content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\": \"User not found\"}")))
    })
    public ResponseEntity<?> getProfile(@RequestParam Long userId) {
        try {
            Optional<User> user = userService.findById(userId);
            if (user.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.get().getId());
                response.put("email", user.get().getEmail());
                response.put("name", user.get().getName());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error retrieving profile: " + e.getMessage());
        }
    }

    // DTO classes
    public static class LoginRequest {
        private String email;
        private String password;

        public LoginRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}