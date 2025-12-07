package com.example.silea.service;

import com.example.silea.entity.User;
import com.example.silea.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public Map<String, Object> authenticate(String email, String password) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<User> userOptional = userService.findByEmail(email);
            
            if (userOptional.isEmpty()) {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return response;
            }
            
            User user = userOptional.get();
            
            // Check password
            if (!passwordEncoder.matches(password, user.getPassword())) {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return response;
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().toString());
            
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().toString()
            ));
            
            return response;
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Authentication failed: " + e.getMessage());
            return response;
        }
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    public String getEmailFromToken(String token) {
        return jwtUtil.getEmailFromToken(token);
    }

    public String getRoleFromToken(String token) {
        return jwtUtil.getRoleFromToken(token);
    }
}