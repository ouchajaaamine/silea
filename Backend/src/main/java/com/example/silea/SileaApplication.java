package com.example.silea;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;

@SpringBootApplication
@OpenAPIDefinition(
    info = @Info(
        title = "silea Store API",
        version = "1.0",
        description = "REST API for silea Store - Moroccan E-commerce Platform",
        contact = @Contact(
            name = "silea Store Support",
            email = "support@silea.ma"
        ),
        license = @License(
            name = "MIT License",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Development server"),
        @Server(url = "https://api.silea.ma", description = "Production server")
    }
)
public class SileaApplication {

    public static void main(String[] args) {
        SpringApplication.run(SileaApplication.class, args);
    }

}
