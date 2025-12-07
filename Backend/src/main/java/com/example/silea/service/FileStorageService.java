package com.example.silea.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads/images}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
            System.out.println("Created upload directory: " + this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    /**
     * Store a file and return the generated filename
     */
    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Cannot store empty file");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String newFilename = UUID.randomUUID().toString() + extension;

        try {
            // Copy file to upload directory
            Path targetLocation = this.uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            System.out.println("Stored file: " + newFilename + " at " + targetLocation);
            return newFilename;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + newFilename, e);
        }
    }

    /**
     * Store a base64 encoded image
     */
    public String storeBase64Image(String base64Data, String mimeType) {
        if (base64Data == null || base64Data.isEmpty()) {
            throw new RuntimeException("Cannot store empty image data");
        }

        // Remove data URL prefix if present
        String imageData = base64Data;
        if (base64Data.contains(",")) {
            imageData = base64Data.substring(base64Data.indexOf(",") + 1);
        }

        // Determine extension from mime type
        String extension = ".jpg";
        if (mimeType != null) {
            if (mimeType.contains("png")) {
                extension = ".png";
            } else if (mimeType.contains("gif")) {
                extension = ".gif";
            } else if (mimeType.contains("webp")) {
                extension = ".webp";
            }
        } else if (base64Data.startsWith("data:image/")) {
            String typeStr = base64Data.substring(11, base64Data.indexOf(";"));
            extension = "." + typeStr;
        }

        String newFilename = UUID.randomUUID().toString() + extension;

        try {
            byte[] imageBytes = java.util.Base64.getDecoder().decode(imageData);
            Path targetLocation = this.uploadPath.resolve(newFilename);
            Files.write(targetLocation, imageBytes);
            
            System.out.println("Stored base64 image: " + newFilename + " at " + targetLocation);
            return newFilename;
        } catch (IOException e) {
            throw new RuntimeException("Could not store image", e);
        }
    }

    /**
     * Load file as bytes
     */
    public byte[] loadFile(String filename) {
        try {
            Path filePath = this.uploadPath.resolve(filename).normalize();
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not load file: " + filename, e);
        }
    }

    /**
     * Check if file exists
     */
    public boolean fileExists(String filename) {
        Path filePath = this.uploadPath.resolve(filename).normalize();
        return Files.exists(filePath);
    }

    /**
     * Delete a file
     */
    public void deleteFile(String filename) {
        try {
            Path filePath = this.uploadPath.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
            System.out.println("Deleted file: " + filename);
        } catch (IOException e) {
            System.err.println("Could not delete file: " + filename);
        }
    }

    /**
     * Get the upload path
     */
    public Path getUploadPath() {
        return uploadPath;
    }
}
