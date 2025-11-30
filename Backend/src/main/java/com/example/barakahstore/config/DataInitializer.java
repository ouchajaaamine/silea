package com.example.barakahstore.config;

import com.example.barakahstore.entity.User;
import com.example.barakahstore.enums.UserRole;
import com.example.barakahstore.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            // Only create admin user if no users exist
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setEmail("admin@barakahstore.ma");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setName("Admin Barakah");
                admin.setRole(UserRole.ADMIN);
                
                userRepository.save(admin);
                System.out.println("Admin user created: admin@barakahstore.ma / admin123");
            }
        };
    }
}