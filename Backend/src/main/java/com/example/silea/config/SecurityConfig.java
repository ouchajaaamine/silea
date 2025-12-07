package com.example.silea.config;

import com.example.silea.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // =====================================================
                // PUBLIC ENDPOINTS - No authentication required
                // =====================================================
                
                // Authentication - login is public
                .requestMatchers("/api/admin/auth/login").permitAll()
                
                // Swagger/OpenAPI
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**", "/webjars/**").permitAll()
                
                // Products - GET is public
                .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                
                // Public Categories API - fully public for browsing
                .requestMatchers(HttpMethod.GET, "/api/categories").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                
                // Categories - GET is public, other methods require ADMIN
                .requestMatchers(HttpMethod.GET, "/api/admin/categories").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/admin/categories/active").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/admin/categories/*").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/admin/categories").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/admin/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/admin/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/admin/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/admin/categories/**").hasRole("ADMIN")
                
                // Orders - public endpoints for customers
                .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orders/sizes").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orders/statuses").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orders/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orders/track/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orders/customer/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/orders/*/cancel").permitAll()
                
                // Tracking - public endpoints for customers
                .requestMatchers(HttpMethod.GET, "/api/tracking/order/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/tracking/track/**").permitAll()
                
                // Cart - all public
                .requestMatchers("/api/cart/**").permitAll()
                
                // Files - GET is public (for images), POST/DELETE require admin
                .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/files/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/files/**").hasRole("ADMIN")
                
                // =====================================================
                // ADMIN ENDPOINTS - Require ADMIN role with JWT
                // =====================================================
                
                // Products admin operations
                .requestMatchers("/api/products/admin/**").hasRole("ADMIN")
                
                // Orders admin operations  
                .requestMatchers("/api/orders/admin/**").hasRole("ADMIN")
                
                // Tracking admin operations
                .requestMatchers("/api/tracking/admin/**").hasRole("ADMIN")
                
                // All other /api/admin/** endpoints require ADMIN role
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
