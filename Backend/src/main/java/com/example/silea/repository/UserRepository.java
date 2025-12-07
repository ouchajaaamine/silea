package com.example.silea.repository;

import com.example.silea.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email for authentication
    Optional<User> findByEmail(String email);

    // Check if email exists
    boolean existsByEmail(String email);
}