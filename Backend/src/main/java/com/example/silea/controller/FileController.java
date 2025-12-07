package com.example.silea.controller;

import com.example.silea.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
@Tag(name = "Files", description = "File upload and management endpoints")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * Upload an image file
     */
    @PostMapping("/upload")
    @Operation(summary = "Upload image", description = "Upload an image file (supports JPG, PNG, GIF, WebP)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File uploaded successfully",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = "{\"success\": true, \"filename\": \"abc123.jpg\", \"url\": \"/api/files/images/abc123.jpg\"}"))),
        @ApiResponse(responseCode = "400", description = "Invalid file",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Only image files are allowed\"}")))
    })
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String filename = fileStorageService.storeFile(file);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("filename", filename);
            response.put("url", "/api/files/images/" + filename);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Upload a base64 encoded image
     */
    @PostMapping("/upload-base64")
    @Operation(summary = "Upload base64 image", description = "Upload an image as base64 encoded string")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Image uploaded successfully",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = "{\"success\": true, \"filename\": \"abc123.jpg\", \"url\": \"/api/files/images/abc123.jpg\"}"))),
        @ApiResponse(responseCode = "400", description = "Invalid image data",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = "{\"success\": false, \"message\": \"Cannot store empty image data\"}")))
    })
    public ResponseEntity<?> uploadBase64(@RequestBody Base64UploadRequest request) {
        try {
            String filename = fileStorageService.storeBase64Image(request.getImageData(), request.getMimeType());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("filename", filename);
            response.put("url", "/api/files/images/" + filename);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get an image file
     */
    @GetMapping("/images/{filename}")
    @Operation(summary = "Get image", description = "Retrieve an uploaded image by filename")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Image retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Image not found")
    })
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) {
        try {
            if (!fileStorageService.fileExists(filename)) {
                return ResponseEntity.notFound().build();
            }

            byte[] imageData = fileStorageService.loadFile(filename);
            
            // Determine content type from filename
            MediaType contentType = MediaType.IMAGE_JPEG;
            if (filename.endsWith(".png")) {
                contentType = MediaType.IMAGE_PNG;
            } else if (filename.endsWith(".gif")) {
                contentType = MediaType.IMAGE_GIF;
            } else if (filename.endsWith(".webp")) {
                contentType = MediaType.parseMediaType("image/webp");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(contentType);
            headers.setCacheControl("max-age=86400"); // Cache for 1 day
            
            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete an image file (admin only)
     */
    @DeleteMapping("/images/{filename}")
    @Operation(summary = "Delete image", description = "Delete an uploaded image (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Image deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Image not found")
    })
    public ResponseEntity<?> deleteImage(@PathVariable String filename) {
        try {
            if (!fileStorageService.fileExists(filename)) {
                return ResponseEntity.notFound().build();
            }

            fileStorageService.deleteFile(filename);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Request class for base64 upload
    public static class Base64UploadRequest {
        private String imageData;
        private String mimeType;

        public String getImageData() {
            return imageData;
        }

        public void setImageData(String imageData) {
            this.imageData = imageData;
        }

        public String getMimeType() {
            return mimeType;
        }

        public void setMimeType(String mimeType) {
            this.mimeType = mimeType;
        }
    }
}
