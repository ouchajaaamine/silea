package com.example.barakahstore;

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
        title = "Barakah Store API",
        version = "1.0",
        description = "REST API for Barakah Store - Moroccan E-commerce Platform",
        contact = @Contact(
            name = "Barakah Store Support",
            email = "support@barakahstore.ma"
        ),
        license = @License(
            name = "MIT License",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Development server"),
        @Server(url = "https://api.barakahstore.ma", description = "Production server")
    }
)
public class BarakahStoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(BarakahStoreApplication.class, args);
	}

}
