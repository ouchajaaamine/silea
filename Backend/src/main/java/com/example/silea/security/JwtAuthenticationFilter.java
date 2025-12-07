package com.example.silea.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String authorizationHeader = request.getHeader("Authorization");
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        
        System.out.println("=== JWT Filter Debug ===");
        System.out.println("Request: " + method + " " + requestURI);
        System.out.println("Authorization header present: " + (authorizationHeader != null));

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            
            try {
                if (jwtUtil.validateToken(token)) {
                    String email = jwtUtil.getEmailFromToken(token);
                    String role = jwtUtil.getRoleFromToken(token);
                    
                    System.out.println("Token valid! Email: " + email + ", Role: " + role);
                    
                    // Create authentication object
                    List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_" + role)
                    );
                    
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("Authentication set successfully with role: ROLE_" + role);
                } else {
                    System.out.println("Token validation failed!");
                }
            } catch (Exception e) {
                // Invalid token, continue without authentication
                System.out.println("JWT Token error: " + e.getMessage());
                logger.debug("Invalid JWT token: " + e.getMessage());
            }
        } else {
            System.out.println("No Bearer token found in request");
        }

        filterChain.doFilter(request, response);
    }
}