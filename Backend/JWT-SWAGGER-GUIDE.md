# JWT Authentication in Swagger UI

## How to Test Protected Endpoints with JWT Token

The Barakah Store API now supports JWT authentication testing directly in Swagger UI. Here's how to use it:

### Step 1: Login to Get JWT Token

1. Open Swagger UI at: `http://localhost:8080/swagger-ui/index.html`
2. Find the **"Authentication"** section
3. Use the **POST `/api/admin/auth/login`** endpoint
4. Click "Try it out"
5. Enter the admin credentials:
   ```json
   {
     "email": "admin@barakahstore.ma",
     "password": "admin123"
   }
   ```
6. Click "Execute"
7. Copy the JWT token from the response (the `token` field)

### Step 2: Authorize Swagger with JWT Token

1. Look for the **"Authorize" button** 🔒 at the top right of the Swagger UI
2. Click the "Authorize" button
3. In the popup dialog, enter your JWT token in this format:
   ```
   Bearer YOUR_JWT_TOKEN_HERE
   ```
   ⚠️ **Important**: Include the word "Bearer" followed by a space, then your token
4. Click "Authorize"
5. Close the authorization dialog

### Step 3: Test Protected Endpoints

Now you can test any protected endpoint that shows a lock icon 🔒:

**Protected Endpoints (require JWT token):**
- All endpoints under `/api/admin/**`
- Product admin endpoints: `/api/products/admin/**`
- Order admin endpoints: `/api/orders/admin/**`
- Tracking admin endpoints: `/api/tracking/admin/**`

**Public Endpoints (no authentication needed):**
- `/api/products/**` (browsing products)
- `/api/orders/**` (placing orders)
- `/api/tracking/**` (tracking orders)
- `/api/cart/**` (shopping cart)

### Visual Indicators in Swagger

- 🔒 **Lock icon**: Indicates the endpoint requires JWT authentication
- ✅ **No lock icon**: Public endpoint, no authentication needed
- 📝 **Security note**: Protected endpoints show "bearerAuth" in their documentation

### Example JWT Token Format

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBiYXJha2Foc3RvcmUubWEiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE2MzI5ODk2MDAsImV4cCI6MTYzMzA3NjAwMH0.example_signature_here
```

### Token Expiration

- JWT tokens expire after **24 hours**
- When your token expires, you'll get a `401 Unauthorized` response
- Simply login again to get a new token

### Troubleshooting

**401 Unauthorized Error:**
- Check if you included "Bearer " prefix
- Verify the token hasn't expired (24 hours)
- Make sure you're using the correct token from the login response

**403 Forbidden Error:**
- Your token is valid but you don't have admin privileges
- Make sure you logged in with the admin account

### Admin Credentials

- **Email:** `admin@barakahstore.ma`
- **Password:** `admin123`

---

## API Endpoints

### Authentication Endpoints (`/api/admin/auth`)

#### 1. Admin Login

- **URL:** `/api/admin/auth/login`
- **Method:** `POST`
- **Description:** Authenticate an admin user and return user details along with a JWT token.
- **Authentication:** None (public endpoint for obtaining a token)
- **Request Body:**
  ```json
  {
    "email": "admin@barakahstore.ma",
    "password": "admin123"
  }
  ```
- **Responses:**
  - `200 OK`: Login successful.
    ```json
    {
      "success": true,
      "message": "Login successful",
      "token": "YOUR_JWT_TOKEN_HERE",
      "user": {
        "id": 1,
        "email": "admin@barakahstore.ma",
        "name": "Admin User"
      }
    }
    ```
  - `401 Unauthorized`: Invalid credentials.
    ```json
    {
      "success": false,
      "message": "Invalid credentials"
    }
    ```
  - `500 Internal Server Error`: Login failed due to server error.
    ```json
    {
      "success": false,
      "message": "Login failed: An unexpected error occurred"
    }
    ```

#### 2. Check Email Availability

- **URL:** `/api/admin/auth/check-email`
- **Method:** `GET`
- **Description:** Check if a user exists with the given email address.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `email` (string, required): The email address to check.
- **Responses:**
  - `200 OK`: Email check completed.
    ```json
    {
      "exists": true
    }
    ```
  - `401 Unauthorized`: JWT token required.

#### 3. Get User Profile

- **URL:** `/api/admin/auth/profile`
- **Method:** `GET`
- **Description:** Retrieve user profile information by user ID.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `userId` (long, required): The ID of the user to retrieve.
- **Responses:**
  - `200 OK`: Profile retrieved successfully.
    ```json
    {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name"
    }
    ```
  - `401 Unauthorized`: JWT token required.
  - `404 Not Found`: User not found.
  - `500 Internal Server Error`: Error retrieving profile.

---

#### 3. Get User Profile

- **URL:** `/api/admin/auth/profile`
- **Method:** `GET`
- **Description:** Retrieve user profile information by user ID.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `userId` (long, required): The ID of the user to retrieve.
- **Responses:**
  - `200 OK`: Profile retrieved successfully.
    ```json
    {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name"
    }
    ```
  - `401 Unauthorized`: JWT token required.
  - `404 Not Found`: User not found.
  - `500 Internal Server Error`: Error retrieving profile.

---

### Order Tracking Endpoints (`/api/tracking`)

#### Public Endpoints (No Authentication Required)

#### 1. Get Tracking History for an Order

- **URL:** `/api/tracking/order/{orderId}`
- **Method:** `GET`
- **Description:** Retrieve the full tracking history for a specific order.
- **Authentication:** None
- **Path Parameters:**
  - `orderId` (long, required): The ID of the order.
- **Responses:**
  - `200 OK`: Successfully retrieved tracking history.
    ```json
    [
      {
        "id": 1,
        "orderId": 123,
        "status": "PROCESSING",
        "location": "Warehouse A",
        "notes": "Order received and being processed.",
        "timestamp": "2023-10-27T10:00:00Z"
      },
      {
        "id": 2,
        "orderId": 123,
        "status": "SHIPPED",
        "location": "In Transit",
        "notes": "Package left warehouse.",
        "timestamp": "2023-10-27T14:30:00Z"
      }
    ]
    ```
  - `500 Internal Server Error`: Error retrieving tracking history.

#### 2. Get Latest Tracking Update for an Order

- **URL:** `/api/tracking/order/{orderId}/latest`
- **Method:** `GET`
- **Description:** Retrieve the most recent tracking update for a specific order.
- **Authentication:** None
- **Path Parameters:**
  - `orderId` (long, required): The ID of the order.
- **Responses:**
  - `200 OK`: Successfully retrieved the latest tracking update.
    ```json
    {
      "id": 2,
      "orderId": 123,
      "status": "SHIPPED",
      "location": "In Transit",
      "notes": "Package left warehouse.",
      "timestamp": "2023-10-27T14:30:00Z"
    }
    ```
  - `404 Not Found`: No tracking updates found for the order.
  - `500 Internal Server Error`: Error retrieving latest tracking.

#### 3. Track Order by Order Number

- **URL:** `/api/tracking/track/{orderNumber}`
- **Method:** `GET`
- **Description:** Track an order using its unique order number.
- **Authentication:** None
- **Path Parameters:**
  - `orderNumber` (string, required): The unique order number.
- **Responses:**
  - `200 OK`: Successfully retrieved order and tracking history.
    ```json
    {
      "order": {
        "id": 123,
        "orderNumber": "BS-2023-001",
        "customerName": "John Doe",
        "status": "SHIPPED"
      },
      "trackingHistory": [
        {
          "id": 1,
          "orderId": 123,
          "status": "PROCESSING",
          "location": "Warehouse A",
          "notes": "Order received and being processed.",
          "timestamp": "2023-10-27T10:00:00Z"
        }
      ]
    }
    ```
  - `404 Not Found`: Order not found.
  - `500 Internal Server Error`: Error tracking order.

#### Admin Endpoints (Authentication Required - JWT Token)

#### 1. Add Tracking Update

- **URL:** `/api/tracking/admin`
- **Method:** `POST`
- **Description:** Add a new tracking update for a specific order. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Request Body:**
  ```json
  {
    "orderId": 123,
    "status": "SHIPPED",
    "location": "In Transit",
    "notes": "Package left warehouse."
  }
  ```
- **Responses:**
  - `200 OK`: Tracking update added successfully.
    ```json
    {
      "success": true,
      "message": "Tracking update added successfully",
      "tracking": {
        "id": 3,
        "orderId": 123,
        "status": "SHIPPED",
        "location": "In Transit",
        "notes": "Package left warehouse.",
        "timestamp": "2023-10-27T18:00:00Z"
      }
    }
    ```
  - `400 Bad Request`: Order not found or invalid request.
  - `500 Internal Server Error`: Error adding tracking update.

#### 2. Get Tracking Records by Status

- **URL:** `/api/tracking/admin/status/{status}`
- **Method:** `GET`
- **Description:** Retrieve tracking records filtered by a specific status. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Path Parameters:**
  - `status` (enum: `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, etc., required): The tracking status to filter by.
- **Responses:**
  - `200 OK`: Successfully retrieved tracking records.
    ```json
    [
      {
        "id": 1,
        "orderId": 123,
        "status": "PROCESSING",
        "location": "Warehouse A",
        "notes": "Order received and being processed.",
        "timestamp": "2023-10-27T10:00:00Z"
      }
    ]
    ```
  - `500 Internal Server Error`: Error retrieving tracking records.

#### 3. Get Tracking Records with Location

- **URL:** `/api/tracking/admin/with-location`
- **Method:** `GET`
- **Description:** Retrieve all tracking records that have a location specified. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved tracking records with location.
    ```json
    [
      {
        "id": 1,
        "orderId": 123,
        "status": "PROCESSING",
        "location": "Warehouse A",
        "notes": "Order received and being processed.",
        "timestamp": "2023-10-27T10:00:00Z"
      }
    ]
    ```
  - `500 Internal Server Error`: Error retrieving tracking records.

#### 4. Search Tracking by Location

- **URL:** `/api/tracking/admin/search/location`
- **Method:** `GET`
- **Description:** Search tracking records by a partial or full location string. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `location` (string, required): The location string to search for.
- **Responses:**
  - `200 OK`: Successfully retrieved matching tracking records.
    ```json
    [
      {
        "id": 1,
        "orderId": 123,
        "status": "PROCESSING",
        "location": "Warehouse A",
        "notes": "Order received and being processed.",
        "timestamp": "2023-10-27T10:00:00Z"
      }
    ]
    ```
  - `500 Internal Server Error`: Error searching tracking records.

#### 5. Get Recent Tracking Updates

- **URL:** `/api/tracking/admin/recent`
- **Method:** `GET`
- **Description:** Retrieve tracking updates that occurred within a specified number of hours. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `hours` (integer, optional, default: 24): The number of hours to look back for recent updates.
- **Responses:**
  - `200 OK`: Successfully retrieved recent tracking updates.
    ```json
    [
      {
        "id": 1,
        "orderId": 123,
        "status": "PROCESSING",
        "location": "Warehouse A",
        "notes": "Order received and being processed.",
        "timestamp": "2023-10-27T10:00:00Z"
      }
    ]
    ```
  - `500 Internal Server Error`: Error retrieving recent tracking updates.

#### 6. Get Pending Delivery Confirmations

- **URL:** `/api/tracking/admin/pending-deliveries`
- **Method:** `GET`
- **Description:** Retrieve tracking records for orders awaiting delivery confirmation. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved pending delivery confirmations.
    ```json
    [
      {
        "id": 1,
        "orderId": 123,
        "status": "OUT_FOR_DELIVERY",
        "location": "City X",
        "notes": "Driver en route.",
        "timestamp": "2023-10-27T10:00:00Z"
      }
    ]
    ```
  - `500 Internal Server Error`: Error retrieving pending deliveries.

#### 7. Get Tracking Statistics

- **URL:** `/api/tracking/admin/stats`
- **Method:** `GET`
- **Description:** Retrieve various statistics related to order tracking. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved tracking statistics.
    ```json
    {
      "totalOrders": 100,
      "ordersInTransit": 50,
      "ordersDelivered": 40,
      "ordersProcessing": 10
    }
    ```
  - `500 Internal Server Error`: Error retrieving tracking statistics.

#### 8. Get Orders with Delayed Tracking

- **URL:** `/api/tracking/admin/delayed`
- **Method:** `GET`
- **Description:** Retrieve orders that have not had a tracking update within a specified time threshold. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `hoursThreshold` (integer, optional, default: 48): The number of hours after which an order is considered delayed.
- **Responses:**
  - `200 OK`: Successfully retrieved delayed orders.
    ```json
    [
      {
        "id": 123,
        "orderNumber": "BS-2023-001",
        "customerName": "John Doe",
        "status": "SHIPPED"
      }
    ]
    ```
  - `500 Internal Server Error`: Error retrieving delayed orders.

#### 9. Get Tracking Records with Notes

- **URL:** `/api/tracking/admin/with-notes`
- **Method:** `GET`
- **Description:** Retrieve all tracking records that include additional notes. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved tracking records with notes.
    ```json
    [
      {
        "id": 1,
        "orderId": 123,
        "status": "PROCESSING",
        "location": "Warehouse A",
        "notes": "Order received and being processed.",
        "timestamp": "2023-10-27T10:00:00Z"
      }
    ]
    ```
  - `500 Internal Server Error`: Error retrieving tracking records.

#### 10. Search Tracking by Notes

- **URL:** `/api/tracking/admin/search/notes`
- **Method:** `GET`
- **Description:** Search tracking records by a partial or full string within their notes. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `notes` (string, required): The notes string to search for.
- **Responses:**
  - `200 OK`: Successfully retrieved matching tracking records.
    ```json
    [
      {
        "id": 1,
        "orderId": 123,
        "status": "PROCESSING",
        "location": "Warehouse A",
        "notes": "Order received and being processed.",
        "timestamp": "2023-10-27T10:00:00Z"
      }
    ]
    ```
  - `500 Internal Server Error`: Error searching tracking records.

#### 11. Get Average Delivery Time

- **URL:** `/api/tracking/admin/average-delivery-time`
- **Method:** `GET`
- **Description:** Calculate and retrieve the average delivery time for all orders. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved average delivery time.
    ```json
    {
      "averageDeliveryTimeHours": 48.5
    }
    ```
  - `500 Internal Server Error`: Error calculating average delivery time.

---

#### 11. Get Average Delivery Time

- **URL:** `/api/tracking/admin/average-delivery-time`
- **Method:** `GET`
- **Description:** Calculate and retrieve the average delivery time for all orders. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved average delivery time.
    ```json
    {
      "averageDeliveryTimeHours": 48.5
    }
    ```
  - `500 Internal Server Error`: Error calculating average delivery time.

---

### Dashboard Endpoints (`/api/admin/dashboard`)

#### Admin Endpoints (Authentication Required - JWT Token)

#### 1. Get Dashboard Statistics

- **URL:** `/api/admin/dashboard/stats`
- **Method:** `GET`
- **Description:** Retrieve various statistics for the admin dashboard, including order, customer, product, and tracking statistics.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved dashboard statistics.
    ```json
    {
      "orders": {
        "totalOrders": 100,
        "pendingOrders": 10,
        "completedOrders": 80,
        "cancelledOrders": 10
      },
      "customers": {
        "totalCustomers": 500,
        "newCustomersLast30Days": 50
      },
      "products": {
        "totalProducts": 200,
        "lowStockProducts": 15,
        "outOfStockProducts": 5
      },
      "tracking": {
        "totalOrders": 100,
        "ordersInTransit": 50,
        "ordersDelivered": 40,
        "ordersProcessing": 10
      }
    }
    ```
  - `500 Internal Server Error`: Error retrieving dashboard statistics.

#### 2. Get Recent Orders

- **URL:** `/api/admin/dashboard/recent-orders`
- **Method:** `GET`
- **Description:** Retrieve a list of recent orders for the dashboard. (Currently returns an empty list as feature is not fully implemented).
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `limit` (integer, optional, default: 10): The maximum number of recent orders to retrieve.
- **Responses:**
  - `200 OK`: Successfully retrieved recent orders.
    ```json
    {
      "orders": [],
      "message": "Recent orders feature not yet implemented"
    }
    ```
  - `500 Internal Server Error`: Error retrieving recent orders.

#### 3. Get Delivery Performance Metrics

- **URL:** `/api/admin/dashboard/delivery-performance`
- **Method:** `GET`
- **Description:** Retrieve metrics related to delivery performance, such as average delivery time and count of delayed orders.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved delivery performance metrics.
    ```json
    {
      "averageDeliveryTime": 48.5,
      "delayedOrdersCount": 5
    }
    ```
  - `500 Internal Server Error`: Error retrieving delivery performance.

#### 4. Get Inventory Alerts

- **URL:** `/api/admin/dashboard/inventory-alerts`
- **Method:** `GET`
- **Description:** Retrieve alerts related to product inventory, such as low stock products.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved inventory alerts.
    ```json
    {
      "lowStockProducts": [
        {
          "id": 1,
          "name": "Product A",
          "stock": 5
        }
      ],
      "totalProducts": 200
    }
    ```
  - `500 Internal Server Error`: Error retrieving inventory alerts.

#### 5. Get Real-time Alerts and Notifications

- **URL:** `/api/admin/dashboard/alerts`
- **Method:** `GET`
- **Description:** Retrieve various real-time alerts and notifications for the dashboard, including low stock, pending orders, and delayed deliveries.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved dashboard alerts.
    ```json
    {
      "lowStockCount": 15,
      "pendingOrdersCount": 10,
      "delayedDeliveriesCount": 5
    }
    ```
  - `500 Internal Server Error`: Error retrieving dashboard alerts.

---

### Product Endpoints (`/api/products`)

#### Public Endpoints (No Authentication Required)

#### 1. Get All Products

- **URL:** `/api/products`
- **Method:** `GET`
- **Description:** Retrieve a paginated list of all active products available in the catalog.
- **Authentication:** None
- **Query Parameters:**
  - `page` (integer, optional, default: 0): The page number (0-based) to retrieve.
  - `size` (integer, optional, default: 12): The number of products per page.
- **Responses:**
  - `200 OK`: Successfully retrieved products.
    ```json
    {
      "products": [
        {
          "id": 1,
          "name": "Product A",
          "nameArabic": "المنتج أ",
          "description": "Description of Product A",
          "price": 10.99,
          "stockQuantity": 100,
          "imageUrl": "http://example.com/imageA.jpg",
          "weightVolume": "1kg",
          "status": "ACTIVE",
          "category": {
            "id": 1,
            "name": "Category 1"
          }
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "currentPage": 0
    }
    ```
  - `500 Internal Server Error`: Error retrieving products.

#### 2. Get Product by ID

- **URL:** `/api/products/{id}`
- **Method:** `GET`
- **Description:** Retrieve a single product by its unique ID.
- **Authentication:** None
- **Path Parameters:**
  - `id` (long, required): The ID of the product to retrieve.
- **Responses:**
  - `200 OK`: Successfully retrieved the product.
    ```json
    {
      "id": 1,
      "name": "Product A",
      "nameArabic": "المنتج أ",
      "description": "Description of Product A",
      "price": 10.99,
      "stockQuantity": 100,
      "imageUrl": "http://example.com/imageA.jpg",
      "weightVolume": "1kg",
      "status": "ACTIVE",
      "category": {
        "id": 1,
        "name": "Category 1"
      }
    }
    ```
  - `404 Not Found`: Product with the specified ID does not exist.
  - `500 Internal Server Error`: Error retrieving product.

#### 3. Search Products

- **URL:** `/api/products/search`
- **Method:** `GET`
- **Description:** Search for products based on a query string.
- **Authentication:** None
- **Query Parameters:**
  - `query` (string, required): The search query string.
- **Responses:**
  - `200 OK`: Successfully retrieved matching products.
    ```json
    [
      {
        "id": 1,
        "name": "Product A",
        "nameArabic": "المنتج أ",
        "description": "Description of Product A",
        "price": 10.99,
        "stockQuantity": 100,
        "imageUrl": "http://example.com/imageA.jpg",
        "weightVolume": "1kg",
        "status": "ACTIVE",
        "category": {
          "id": 1,
          "name": "Category 1"
        }
      }
    ]
    ```
  - `500 Internal Server Error`: Error searching products.

#### 4. Get Products by Category

- **URL:** `/api/products/category/{categoryId}`
- **Method:** `GET`
- **Description:** Retrieve all products belonging to a specific category.
- **Authentication:** None
- **Path Parameters:**
  - `categoryId` (long, required): The ID of the category.
- **Responses:**
  - `200 OK`: Successfully retrieved products by category.
    ```json
    [
      {
        "id": 1,
        "name": "Product A",
        "nameArabic": "المنتج أ",
        "description": "Description of Product A",
        "price": 10.99,
        "stockQuantity": 100,
        "imageUrl": "http://example.com/imageA.jpg",
        "weightVolume": "1kg",
        "status": "ACTIVE",
        "category": {
          "id": 1,
          "name": "Category 1"
        }
      }
    ]
    ```
  - `500 Internal Server Error`: Error retrieving products by category.

#### 5. Get Featured Products

- **URL:** `/api/products/featured`
- **Method:** `GET`
- **Description:** Retrieve products designated as featured for the homepage.
- **Authentication:** None
- **Responses:**
  - `200 OK`: Successfully retrieved featured products.
    ```json
    [
      {
        "id": 1,
        "name": "Featured Product 1",
        "nameArabic": "منتج مميز 1",
        "description": "Description of Featured Product 1",
        "price": 25.00,
        "stockQuantity": 50,
        "imageUrl": "http://example.com/featured1.jpg",
        "weightVolume": "500g",
        "status": "ACTIVE",
        "category": {
          "id": 2,
          "name": "Category 2"
        }
      }
    ]
    ```
  - `500 Internal Server Error`: Error retrieving featured products.

#### Admin Endpoints (`/api/admin/products`) (Authentication Required - JWT Token)

#### 1. Create New Product

- **URL:** `/api/products/admin`
- **Method:** `POST`
- **Description:** Create a new product. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Request Body:** `application/json`
  ```json
  {
    "name": "New Product",
    "nameArabic": "منتج جديد",
    "description": "Detailed description of the new product.",
    "price": 29.99,
    "stockQuantity": 150,
    "categoryId": 1,
    "imageUrl": "http://example.com/new_product.jpg",
    "weightVolume": "2kg"
  }
  ```
- **Responses:**
  - `200 OK`: Product created successfully.
    ```json
    {
      "success": true,
      "message": "Product created successfully",
      "product": {
        "id": 2,
        "name": "New Product",
        "nameArabic": "منتج جديد",
        "description": "Detailed description of the new product.",
        "price": 29.99,
        "stockQuantity": 150,
        "imageUrl": "http://example.com/new_product.jpg",
        "weightVolume": "2kg",
        "status": "ACTIVE",
        "category": {
          "id": 1,
          "name": "Category 1"
        }
      }
    }
    ```
  - `400 Bad Request`: Invalid product data.
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.

#### 2. Update Product

- **URL:** `/api/products/admin/{id}`
- **Method:** `PUT`
- **Description:** Update an existing product by its ID. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Path Parameters:**
  - `id` (long, required): The ID of the product to update.
- **Request Body:** `application/json`
  ```json
  {
    "name": "Updated Product Name",
    "nameArabic": "اسم المنتج المحدث",
    "description": "Updated description of the product.",
    "price": 35.50,
    "stockQuantity": 120,
    "imageUrl": "http://example.com/updated_product.jpg",
    "weightVolume": "2.5kg"
  }
  ```
- **Responses:**
  - `200 OK`: Product updated successfully.
    ```json
    {
      "success": true,
      "message": "Product updated successfully",
      "product": {
        "id": 2,
        "name": "Updated Product Name",
        "nameArabic": "اسم المنتج المحدث",
        "description": "Updated description of the product.",
        "price": 35.50,
        "stockQuantity": 120,
        "imageUrl": "http://example.com/updated_product.jpg",
        "weightVolume": "2.5kg",
        "status": "ACTIVE",
        "category": {
          "id": 1,
          "name": "Category 1"
        }
      }
    }
    ```
  - `400 Bad Request`: Invalid product data.
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error updating product.

#### 3. Update Product Stock

- **URL:** `/api/products/admin/{id}/stock`
- **Method:** `PATCH`
- **Description:** Update the stock quantity of a product. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Path Parameters:**
  - `id` (long, required): The ID of the product to update stock for.
- **Request Body:** `application/json`
  ```json
  {
    "stockQuantity": 80
  }
  ```
- **Responses:**
  - `200 OK`: Product stock updated successfully.
    ```json
    {
      "success": true,
      "message": "Product stock updated successfully",
      "product": {
        "id": 2,
        "name": "Updated Product Name",
        "stockQuantity": 80
      }
    }
    ```
  - `400 Bad Request`: Invalid stock quantity.
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error updating product stock.

#### 4. Update Product Status

- **URL:** `/api/products/admin/{id}/status`
- **Method:** `PATCH`
- **Description:** Update the status of a product (e.g., ACTIVE, INACTIVE, ARCHIVED). Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Path Parameters:**
  - `id` (long, required): The ID of the product to update status for.
- **Request Body:** `application/json`
  ```json
  {
    "status": "INACTIVE"
  }
  ```
- **Responses:**
  - `200 OK`: Product status updated successfully.
    ```json
    {
      "success": true,
      "message": "Product status updated successfully",
      "product": {
        "id": 2,
        "name": "Updated Product Name",
        "status": "INACTIVE"
      }
    }
    ```
  - `400 Bad Request`: Invalid status.
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error updating product status.

#### 5. Delete Product

- **URL:** `/api/products/admin/{id}`
- **Method:** `DELETE`
- **Description:** Delete a product by its ID. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Path Parameters:**
  - `id` (long, required): The ID of the product to delete.
- **Responses:**
  - `200 OK`: Product deleted successfully.
    ```json
    {
      "success": true,
      "message": "Product deleted successfully"
    }
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error deleting product.

#### 6. Get Low Stock Products

- **URL:** `/api/products/admin/low-stock`
- **Method:** `GET`
- **Description:** Retrieve a list of products with stock quantities below a specified threshold. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `threshold` (integer, optional, default: 10): The stock quantity threshold to consider a product "low stock".
- **Responses:**
  - `200 OK`: Successfully retrieved low stock products.
    ```json
    [
      {
        "id": 3,
        "name": "Low Stock Item",
        "stockQuantity": 5,
        "status": "ACTIVE"
      }
    ]
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error retrieving low stock products.

#### 7. Get Product Statistics

- **URL:** `/api/products/admin/stats`
- **Method:** `GET`
- **Description:** Retrieve various statistics related to products, such as total products, active products, etc. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved product statistics.
    ```json
    {
      "totalProducts": 200,
      "activeProducts": 180,
      "inactiveProducts": 20,
      "outOfStockProducts": 5
    }
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error retrieving product statistics.

#### 8. Get Total Inventory Value

- **URL:** `/api/products/admin/inventory-value`
- **Method:** `GET`
- **Description:** Calculate and retrieve the total monetary value of all products in inventory. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved total inventory value.
    ```json
    {
      "totalInventoryValue": 15000.75
    }
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error calculating inventory value.

---

### Customer Endpoints (`/api/admin/customers`)

#### Admin Endpoints (Authentication Required - JWT Token)

#### 1. Get All Customers (Paginated)

- **URL:** `/api/admin/customers`
- **Method:** `GET`
- **Description:** Retrieve a paginated list of all customers. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `page` (integer, optional, default: 0): The page number (0-based) to retrieve.
  - `size` (integer, optional, default: 10): The number of customers per page.
- **Responses:**
  - `200 OK`: Customers retrieved successfully.
    ```json
    {
      "customers": [
        {
          "id": 1,
          "name": "John Doe",
          "email": "john.doe@example.com",
          "phone": "+1234567890",
          "address": "123 Main St",
          "status": "ACTIVE"
        }
      ],
      "totalElements": 100,
      "totalPages": 10,
      "currentPage": 0
    }
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error retrieving customers.

#### 2. Get Customer by ID

- **URL:** `/api/admin/customers/{id}`
- **Method:** `GET`
- **Description:** Retrieve a single customer by their unique ID. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Path Parameters:**
  - `id` (long, required): The ID of the customer to retrieve.
- **Responses:**
  - `200 OK`: Successfully retrieved the customer.
    ```json
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "status": "ACTIVE"
    }
    ```
  - `404 Not Found`: Customer with the specified ID does not exist.
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error retrieving customer.

#### 3. Create New Customer

- **URL:** `/api/admin/customers`
- **Method:** `POST`
- **Description:** Create a new customer. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Request Body:** `application/json`
  ```json
  {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1987654321",
    "address": "456 Oak Ave"
  }
  ```
- **Responses:**
  - `200 OK`: Customer created successfully.
    ```json
    {
      "success": true,
      "message": "Customer created successfully",
      "customer": {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+1987654321",
        "address": "456 Oak Ave",
        "status": "ACTIVE"
      }
    }
    ```
  - `400 Bad Request`: Invalid customer data.
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error creating customer.

#### 4. Update Customer

- **URL:** `/api/admin/customers/{id}`
- **Method:** `PUT`
- **Description:** Update an existing customer by their ID. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Path Parameters:**
  - `id` (long, required): The ID of the customer to update.
- **Request Body:** `application/json`
  ```json
  {
    "name": "Jane Smith Updated",
    "email": "jane.smith.updated@example.com",
    "phone": "+1122334455",
    "address": "789 Pine St"
  }
  ```
- **Responses:**
  - `200 OK`: Customer updated successfully.
    ```json
    {
      "success": true,
      "message": "Customer updated successfully",
      "customer": {
        "id": 2,
        "name": "Jane Smith Updated",
        "email": "jane.smith.updated@example.com",
        "phone": "+1122334455",
        "address": "789 Pine St",
        "status": "ACTIVE"
      }
    }
    ```
  - `400 Bad Request`: Invalid customer data.
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error updating customer.

#### 5. Update Customer Status

- **URL:** `/api/admin/customers/{id}/status`
- **Method:** `PATCH`
- **Description:** Update the status of a customer (e.g., ACTIVE, INACTIVE, SUSPENDED). Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Path Parameters:**
  - `id` (long, required): The ID of the customer to update status for.
- **Request Body:** `application/json`
  ```json
  {
    "status": "INACTIVE"
  }
  ```
- **Responses:**
  - `200 OK`: Customer status updated successfully.
    ```json
    {
      "success": true,
      "message": "Customer status updated successfully",
      "customer": {
        "id": 2,
        "name": "Jane Smith Updated",
        "status": "INACTIVE"
      }
    }
    ```
  - `400 Bad Request`: Invalid status.
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error updating customer status.

#### 6. Delete Customer

- **URL:** `/api/admin/customers/{id}`
- **Method:** `DELETE`
- **Description:** Delete a customer by their ID. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Path Parameters:**
  - `id` (long, required): The ID of the customer to delete.
- **Responses:**
  - `200 OK`: Customer deleted successfully.
    ```json
    {
      "success": true,
      "message": "Customer deleted successfully"
    }
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error deleting customer.

#### 7. Search Customers

- **URL:** `/api/admin/customers/search`
- **Method:** `GET`
- **Description:** Search for customers based on a query string (e.g., name, email, phone). Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `query` (string, required): The search query string.
- **Responses:**
  - `200 OK`: Successfully retrieved matching customers.
    ```json
    [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    ]
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error searching customers.

#### 8. Get Customer Statistics

- **URL:** `/api/admin/customers/stats`
- **Method:** `GET`
- **Description:** Retrieve various statistics related to customers, such as total customers, active customers, etc. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved customer statistics.
    ```json
    {
      "totalCustomers": 100,
      "activeCustomers": 90,
      "inactiveCustomers": 10
    }
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error retrieving customer statistics.

#### 9. Get VIP Customers

- **URL:** `/api/admin/customers/vip`
- **Method:** `GET`
- **Description:** Retrieve a list of VIP customers based on a spending threshold. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `threshold` (BigDecimal, optional, default: 1000): The minimum total spending for a customer to be considered VIP.
- **Responses:**
  - `200 OK`: Successfully retrieved VIP customers.
    ```json
    [
      {
        "id": 3,
        "name": "VIP Customer",
        "email": "vip.customer@example.com",
        "totalSpending": 1500.00
      }
    ]
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error retrieving VIP customers.

---

### Order Endpoints (`/api/orders`)

#### Public Endpoints (No Authentication Required)

#### 1. Create New Order

- **URL:** `/api/orders`
- **Method:** `POST`
- **Description:** Create a new order. This endpoint handles customer creation/lookup and order item processing.
- **Authentication:** None
- **Request Body:** `application/json`
  ```json
  {
    "customerName": "Jane Doe",
    "customerEmail": "jane.doe@example.com",
    "customerPhone": "+1234567890",
    "shippingAddress": "123 Main St, Anytown, USA",
    "notes": "Deliver after 5 PM",
    "estimatedDeliveryDate": "2023-11-15T18:00:00",
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "unitPrice": 10.99
      },
      {
        "productId": 3,
        "quantity": 1,
        "unitPrice": 25.00
      }
    ]
  }
  ```
- **Responses:**
  - `200 OK`: Order created successfully.
    ```json
    {
      "success": true,
      "message": "Order created successfully",
      "order": {
        "id": 1,
        "orderNumber": "BS-2023-001",
        "customer": {
          "id": 1,
          "name": "Jane Doe"
        },
        "orderItems": [...],
        "totalAmount": 46.98,
        "status": "PENDING",
        "shippingAddress": "123 Main St, Anytown, USA",
        "notes": "Deliver after 5 PM",
        "orderDate": "2023-11-10T10:00:00",
        "estimatedDeliveryDate": "2023-11-15T18:00:00"
      }
    }
    ```
  - `400 Bad Request`: Invalid order data.
  - `500 Internal Server Error`: Error creating order.

#### 2. Get Order by ID

- **URL:** `/api/orders/{id}`
- **Method:** `GET`
- **Description:** Retrieve a single order by its unique ID. Useful for public tracking.
- **Authentication:** None
- **Path Parameters:**
  - `id` (long, required): The ID of the order to retrieve.
- **Responses:**
  - `200 OK`: Successfully retrieved the order.
    ```json
    {
      "id": 1,
      "orderNumber": "BS-2023-001",
      "customer": {
        "id": 1,
        "name": "Jane Doe"
      },
      "orderItems": [...],
      "totalAmount": 46.98,
      "status": "PENDING",
      "shippingAddress": "123 Main St, Anytown, USA",
      "notes": "Deliver after 5 PM",
      "orderDate": "2023-11-10T10:00:00",
      "estimatedDeliveryDate": "2023-11-15T18:00:00"
    }
    ```
  - `404 Not Found`: Order with the specified ID does not exist.
  - `500 Internal Server Error`: Error retrieving order.

#### 3. Track Order by Order Number

- **URL:** `/api/orders/track/{orderNumber}`
- **Method:** `GET`
- **Description:** Retrieve an order by its unique order number. Useful for public tracking.
- **Authentication:** None
- **Path Parameters:**
  - `orderNumber` (string, required): The order number to track.
- **Responses:**
  - `200 OK`: Successfully retrieved the order.
    ```json
    {
      "id": 1,
      "orderNumber": "BS-2023-001",
      "customer": {
        "id": 1,
        "name": "Jane Doe"
      },
      "orderItems": [...],
      "totalAmount": 46.98,
      "status": "PENDING",
      "shippingAddress": "123 Main St, Anytown, USA",
      "notes": "Deliver after 5 PM",
      "orderDate": "2023-11-10T10:00:00",
      "estimatedDeliveryDate": "2023-11-15T18:00:00"
    }
    ```
  - `404 Not Found`: Order with the specified order number does not exist.
  - `500 Internal Server Error`: Error tracking order.

#### 4. Get Orders by Customer Email

- **URL:** `/api/orders/customer/{email}`
- **Method:** `GET`
- **Description:** Retrieve all orders associated with a specific customer email address.
- **Authentication:** None
- **Path Parameters:**
  - `email` (string, required): The email address of the customer.
- **Responses:**
  - `200 OK`: Successfully retrieved customer's orders.
    ```json
    [
      {
        "id": 1,
        "orderNumber": "BS-2023-001",
        "customer": {
          "id": 1,
          "name": "Jane Doe"
        },
        "totalAmount": 46.98,
        "status": "PENDING"
      }
    ]
    ```
  - `404 Not Found`: Customer with the specified email does not exist.
  - `500 Internal Server Error`: Error retrieving customer orders.

#### Admin Endpoints (`/api/admin/orders`) (Authentication Required - JWT Token)

#### 1. Get All Orders (Paginated)

- **URL:** `/api/orders/admin`
- **Method:** `GET`
- **Description:** Retrieve a paginated list of all orders. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `page` (integer, optional, default: 0): The page number (0-based) to retrieve.
  - `size` (integer, optional, default: 10): The number of orders per page.
- **Responses:**
  - `200 OK`: Successfully retrieved orders.
    ```json
    [
      {
        "id": 1,
        "orderNumber": "BS-2023-001",
        "customer": {
          "id": 1,
          "name": "Jane Doe"
        },
        "totalAmount": 46.98,
        "status": "PENDING"
      }
    ]
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error retrieving orders.

#### 2. Update Order Status

- **URL:** `/api/orders/admin/{id}/status`
- **Method:** `PATCH`
- **Description:** Update the status of an order (e.g., PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED). Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Path Parameters:**
  - `id` (long, required): The ID of the order to update.
- **Request Body:** `application/json`
  ```json
  {
    "status": "SHIPPED"
  }
  ```
- **Responses:**
  - `200 OK`: Order status updated successfully.
    ```json
    {
      "success": true,
      "message": "Order status updated successfully",
      "order": {
        "id": 1,
        "orderNumber": "BS-2023-001",
        "status": "SHIPPED"
      }
    }
    ```
  - `400 Bad Request`: Invalid status.
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error updating order status.

#### 3. Get Orders by Status

- **URL:** `/api/orders/admin/status/{status}`
- **Method:** `GET`
- **Description:** Retrieve a list of orders filtered by their current status. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Path Parameters:**
  - `status` (string, required): The status of the orders to retrieve (e.g., PENDING, SHIPPED).
- **Responses:**
  - `200 OK`: Successfully retrieved orders by status.
    ```json
    [
      {
        "id": 1,
        "orderNumber": "BS-2023-001",
        "status": "SHIPPED"
      }
    ]
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error retrieving orders by status.

#### 4. Search Orders

- **URL:** `/api/orders/admin/search`
- **Method:** `GET`
- **Description:** Search for orders based on a query string (e.g., order number, customer name). Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `query` (string, required): The search query string.
- **Responses:**
  - `200 OK`: Successfully retrieved matching orders.
    ```json
    [
      {
        "id": 1,
        "orderNumber": "BS-2023-001",
        "customer": {
          "name": "Jane Doe"
        }
      }
    ]
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error searching orders.

#### 5. Get Orders with Delivery Today

- **URL:** `/api/orders/admin/delivery-today`
- **Method:** `GET`
- **Description:** Retrieve orders scheduled for delivery today. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved today's deliveries.
    ```json
    [
      {
        "id": 2,
        "orderNumber": "BS-2023-002",
        "estimatedDeliveryDate": "2023-11-10T18:00:00"
      }
    ]
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error retrieving today's deliveries.

#### 6. Get Overdue Orders

- **URL:** `/api/orders/admin/overdue`
- **Method:** `GET`
- **Description:** Retrieve orders that are past their estimated delivery date and not yet delivered. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved overdue orders.
    ```json
    [
      {
        "id": 3,
        "orderNumber": "BS-2023-003",
        "status": "SHIPPED",
        "estimatedDeliveryDate": "2023-11-01T10:00:00"
      }
    ]
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error retrieving overdue orders.

#### 7. Get High Value Orders

- **URL:** `/api/orders/admin/high-value`
- **Method:** `GET`
- **Description:** Retrieve orders with a total amount exceeding a specified threshold. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `threshold` (BigDecimal, optional, default: 500): The minimum total amount for an order to be considered high value.
- **Responses:**
  - `200 OK`: Successfully retrieved high value orders.
    ```json
    [
      {
        "id": 4,
        "orderNumber": "BS-2023-004",
        "totalAmount": 750.00
      }
    ]
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error retrieving high value orders.

#### 8. Get Order Statistics

- **URL:** `/api/orders/admin/stats`
- **Method:** `GET`
- **Description:** Retrieve various statistics related to orders, such as total orders, pending orders, etc. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Responses:**
  - `200 OK`: Successfully retrieved order statistics.
    ```json
    {
      "totalOrders": 100,
      "pendingOrders": 10,
      "completedOrders": 80,
      "cancelledOrders": 10
    }
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error retrieving order statistics.

#### 9. Get Revenue in Date Range

- **URL:** `/api/orders/admin/revenue`
- **Method:** `GET`
- **Description:** Calculate and retrieve the total revenue within a specified date range. Requires admin privileges.
- **Authentication:** Required (JWT Token)
- **Query Parameters:**
  - `startDate` (string, required): The start date of the range (e.g., "2023-01-01T00:00:00").
  - `endDate` (string, required): The end date of the range (e.g., "2023-01-31T23:59:59").
- **Responses:**
  - `200 OK`: Successfully retrieved revenue for the specified date range.
    ```json
    {
      "revenue": 12500.50,
      "startDate": "2023-01-01T00:00:00",
      "endDate": "2023-01-31T23:59:59"
    }
    ```
  - `401 Unauthorized`: JWT token required.
  - `403 Forbidden`: Admin role required.
  - `500 Internal Server Error`: Error calculating revenue.

---

### Category Endpoints (`/api/admin/categories`)

All endpoints in this section require **Admin Authentication (JWT Token)**.

- **GET `/api/admin/categories`**
  - **Description**: Retrieves a list of all product categories.
  - **Security**: Admin-only (JWT required).
  - **Responses**:
    - `200 OK`: Returns a list of `Category` objects.
    - `401 Unauthorized`: If no valid JWT token is provided.
    - `403 Forbidden`: If the authenticated user is not an admin.
    - `500 Internal Server Error`: If an error occurs during retrieval.

- **GET `/api/admin/categories/active`**
  - **Description**: Retrieves a list of all active product categories.
  - **Security**: Admin-only (JWT required).
  - **Responses**:
    - `200 OK`: Returns a list of active `Category` objects.
    - `401 Unauthorized`: If no valid JWT token is provided.
    - `403 Forbidden`: If the authenticated user is not an admin.
    - `500 Internal Server Error`: If an error occurs during retrieval.

- **GET `/api/admin/categories/{id}`**
  - **Description**: Retrieves a single category by its ID.
  - **Security**: Admin-only (JWT required).
  - **Path Parameters**:
    - `id` (long, required): The ID of the category to retrieve.
  - **Responses**:
    - `200 OK`: Returns the `Category` object.
    - `404 Not Found`: If no category with the given ID is found.
    - `401 Unauthorized`: If no valid JWT token is provided.
    - `403 Forbidden`: If the authenticated user is not an admin.
    - `500 Internal Server Error`: If an error occurs during retrieval.

- **POST `/api/admin/categories`**
  - **Description**: Creates a new product category.
  - **Security**: Admin-only (JWT required).
  - **Request Body**:
    ```json
    {
      "name": "Electronics",
      "nameArabic": "إلكترونيات",
      "description": "Electronic gadgets and devices."
    }
    ```
  - **Responses**:
    - `200 OK`: Returns a success message and the created `Category` object.
    - `400 Bad Request`: If the request body is invalid or category creation fails.
    - `401 Unauthorized`: If no valid JWT token is provided.
    - `403 Forbidden`: If the authenticated user is not an admin.
    - `500 Internal Server Error`: If an error occurs during creation.

- **PUT `/api/admin/categories/{id}`**
  - **Description**: Updates an existing product category by its ID.
  - **Security**: Admin-only (JWT required).
  - **Path Parameters**:
    - `id` (long, required): The ID of the category to update.
  - **Request Body**:
    ```json
    {
      "name": "Updated Electronics",
      "nameArabic": "إلكترونيات محدثة",
      "description": "Updated description for electronic gadgets."
    }
    ```
  - **Responses**:
    - `200 OK`: Returns a success message and the updated `Category` object.
    - `400 Bad Request`: If the request body is invalid or category update fails.
    - `401 Unauthorized`: If no valid JWT token is provided.
    - `403 Forbidden`: If the authenticated user is not an admin.
    - `500 Internal Server Error`: If an error occurs during update.

- **PATCH `/api/admin/categories/{id}/status`**
  - **Description**: Activates or deactivates a product category by its ID.
  - **Security**: Admin-only (JWT required).
  - **Path Parameters**:
    - `id` (long, required): The ID of the category to update its status.
  - **Request Body**:
    ```json
    {
      "active": true
    }
    ```
  - **Responses**:
    - `200 OK`: Returns a success message and the updated `Category` object.
    - `400 Bad Request`: If the request body is invalid or status update fails.
    - `401 Unauthorized`: If no valid JWT token is provided.
    - `403 Forbidden`: If the authenticated user is not an admin.
    - `500 Internal Server Error`: If an error occurs during status update.

- **DELETE `/api/admin/categories/{id}`**
  - **Description**: Deletes a product category by its ID.
  - **Security**: Admin-only (JWT required).
  - **Path Parameters**:
    - `id` (long, required): The ID of the category to delete.
  - **Responses**:
    - `200 OK`: Returns a success message.
    - `400 Bad Request`: If category deletion fails (e.g., category has associated products).
    - `401 Unauthorized`: If no valid JWT token is provided.
    - `403 Forbidden`: If the authenticated user is not an admin.
    - `500 Internal Server Error`: If an error occurs during deletion.

- **GET `/api/admin/categories/search`**
  - **Description**: Searches for product categories based on a query string.
  - **Security**: Admin-only (JWT required).
  - **Query Parameters**:
    - `query` (string, required): The search query string.
  - **Responses**:
    - `200 OK`: Returns a list of matching `Category` objects.
    - `401 Unauthorized`: If no valid JWT token is provided.
    - `403 Forbidden`: If the authenticated user is not an admin.
    - `500 Internal Server Error`: If an error occurs during search.

- **GET `/api/admin/categories/stats`**
  - **Description**: Retrieves statistics related to product categories.
  - **Security**: Admin-only (JWT required).
  - **Responses**:
    - `200 OK`: Returns a `CategoryStatistics` object.
    - `401 Unauthorized`: If no valid JWT token is provided.
    - `403 Forbidden`: If the authenticated user is not an admin.
    - `500 Internal Server Error`: If an error occurs during retrieval.

---

### Cart Endpoints

- **POST `/api/cart/calculate`**
  - **Description**: Calculates the total price of items in the cart.
  - **Security**: Public (No JWT required).
  - **Request Body**: `List<CartItemRequest>` (JSON array of objects with `productId` and `quantity`).
  - **Responses**:
    - `200 OK`: Returns a JSON object with `total` (BigDecimal) and `itemCount` (int).
    - `500 Internal Server Error`: If an error occurs during calculation.

- **POST `/api/cart/validate`**
  - **Description**: Validates the items in the cart, checking for issues like stock availability.
  - **Security**: Public (No JWT required).
  - **Request Body**: `List<CartItemRequest>` (JSON array of objects with `productId` and `quantity`).
  - **Responses**:
    - `200 OK`: Returns a JSON object with `valid` (boolean), `errors` (List<String>), and `warnings` (List<String>).
    - `500 Internal Server Error`: If an error occurs during validation.

- **POST `/api/cart/summary`**
  - **Description**: Retrieves a summary of the cart, including details about items and totals.
  - **Security**: Public (No JWT required).
  - **Request Body**: `List<CartItemRequest>` (JSON array of objects with `productId` and `quantity`).
  - **Responses**:
    - `200 OK`: Returns a `CartSummary` object (JSON).
    - `500 Internal Server Error`: If an error occurs while getting the summary.

- **POST `/api/cart/check-minimum`**
  - **Description**: Checks if the current cart value meets a specified minimum order value.
  - **Security**: Public (No JWT required).
  - **Request Body**: `MinimumOrderRequest` (JSON object with `items` (List<CartItemRequest>) and `minimumValue` (BigDecimal)).
  - **Responses**:
    - `200 OK`: Returns a JSON object with `hasMinimum` (boolean) and `minimumValue` (BigDecimal).
    - `500 Internal Server Error`: If an error occurs during the check.

- **POST `/api/cart/reserve-stock`**
  - **Description**: Reserves stock for the items in the cart, typically called during the checkout process.
  - **Security**: Public (No JWT required).
  - **Request Body**: `List<CartItemRequest>` (JSON array of objects with `productId` and `quantity`).
  - **Responses**:
    - `200 OK`: Returns a JSON object with `success` (boolean) and `message` (String) if stock is reserved.
    - `400 Bad Request`: If validation fails or stock cannot be reserved, with an error message.
    - `500 Internal Server Error`: If an unexpected error occurs.

- **POST `/api/cart/shipping`**
  - **Description**: Calculates the estimated shipping cost for the items in the cart.
  - **Security**: Public (No JWT required).
  - **Request Body**: `List<CartItemRequest>` (JSON array of objects with `productId` and `quantity`).
  - **Responses**:
    - `200 OK`: Returns a JSON object with `subtotal` (BigDecimal), `shipping` (BigDecimal), and `freeShippingThreshold` (BigDecimal).
    - `500 Internal Server Error`: If an error occurs during shipping calculation.