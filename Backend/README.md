# silea Store Backend API

A comprehensive REST API for the Moroccan e-commerce platform silea Store, built with Spring Boot 3.5.6.

## Features

- **Bilingual Support**: French and Arabic product categories and descriptions
- **Complete E-commerce Functionality**: Products, orders, customers, inventory management
- **Admin Dashboard**: Statistics and analytics endpoints
- **Order Tracking**: Real-time delivery tracking system
- **Shopping Cart**: Cart calculations and validation
- **RESTful API**: Clean, documented endpoints with proper HTTP status codes
- **Swagger Documentation**: Interactive API documentation

## Technologies

- **Spring Boot 3.5.6** - Main framework
- **Spring Data JPA** - Database access
- **MySQL 8** - Database
- **SpringDoc OpenAPI** - API documentation
- **Java 17** - Programming language
- **Maven** - Build tool

## Getting Started

### Prerequisites

- Java 17 or higher
- MySQL 8
- Maven 3.6+

### Database Setup

1. Create a MySQL database named `sileadb`
2. Update `src/main/resources/application.yml` with your database credentials
3. The application will automatically create tables and populate initial data from `data.sql`

### Running the Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Documentation

### Swagger UI

Access the interactive API documentation at:
```
http://localhost:8080/swagger-ui/index.html
```

### OpenAPI Specification

Download the OpenAPI 3.0 specification at:
```
http://localhost:8080/v3/api-docs
```

## API Endpoints

### Authentication
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/check-email` - Check email availability
- `GET /api/admin/auth/profile` - Get user profile

### Products (Public)
- `GET /api/products` - Get paginated products
- `GET /api/products/{id}` - Get product details
- `GET /api/products/search` - Search products
- `GET /api/products/category/{categoryId}` - Get products by category

### Products (Admin)
- `POST /api/products/admin` - Create product
- `PUT /api/products/admin/{id}` - Update product
- `DELETE /api/products/admin/{id}` - Delete product
- `GET /api/products/admin/low-stock` - Get low stock products

### Categories
- `GET /api/categories/active` - Get active categories
- `POST /api/admin/categories` - Create category (Admin)
- `PUT /api/admin/categories/{id}` - Update category (Admin)
- `PATCH /api/admin/categories/{id}/status` - Update category status (Admin)

### Customers (Admin)
- `GET /api/admin/customers` - Get paginated customers
- `POST /api/admin/customers` - Create customer
- `GET /api/admin/customers/{id}` - Get customer details
- `PUT /api/admin/customers/{id}` - Update customer
- `GET /api/admin/customers/stats` - Get customer statistics

### Orders
- `POST /api/orders` - Create order (Public)
- `GET /api/orders/track/{orderNumber}` - Track order (Public)
- `GET /api/admin/orders` - Get orders (Admin)
- `PATCH /api/admin/orders/{id}/status` - Update order status (Admin)

### Order Tracking
- `GET /api/tracking/order/{orderId}` - Get tracking history
- `GET /api/tracking/order/{orderId}/latest` - Get latest tracking
- `GET /api/tracking/track/{orderNumber}` - Track by order number
- `POST /api/admin/tracking` - Add tracking update (Admin)

### Shopping Cart
- `POST /api/cart/calculate` - Calculate cart total
- `POST /api/cart/validate` - Validate cart items
- `POST /api/cart/summary` - Get cart summary
- `POST /api/cart/reserve-stock` - Reserve stock for checkout

### Dashboard (Admin)
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/dashboard/recent-orders` - Get recent orders
- `GET /api/admin/dashboard/delivery-performance` - Get delivery metrics
- `GET /api/admin/dashboard/inventory-alerts` - Get inventory alerts
- `GET /api/admin/dashboard/alerts` - Get real-time alerts

## Sample Data

The application includes comprehensive sample data:

- **1 Admin User**: admin@silea.ma / password (encrypted)
- **6 Product Categories**: Oils, Honey, Spices, Dried Fruits, Teas, Natural Cosmetics
- **18 Products**: Moroccan traditional products with bilingual descriptions
- **5 Sample Customers**: From different Moroccan cities
- **5 Sample Orders**: With various statuses and tracking information
- **Order Tracking Records**: Complete delivery tracking history

## Database Schema

The application uses the following main entities:
- `user` - Admin users
- `customer` - Customer information
- `category` - Product categories (bilingual)
- `product` - Product catalog
- `order` - Customer orders
- `order_item` - Order line items
- `order_tracking` - Delivery tracking records

## Security

- Admin endpoints are protected (authentication required in production)
- CORS enabled for frontend integration
- Input validation on all endpoints
- SQL injection prevention with JPA

## Development

### Project Structure
```
src/main/java/com/example/silea/
├── controller/     # REST controllers
├── entity/         # JPA entities
├── enums/          # Enumeration classes
├── repository/     # Data access layer
├── service/        # Business logic layer
└── sileaApplication.java

src/main/resources/
├── application.yml # Configuration
└── data.sql        # Initial data
```

### Building for Production

```bash
mvn clean package
java -jar target/silea-0.0.1-SNAPSHOT.jar
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@silea.ma or create an issue in the repository.