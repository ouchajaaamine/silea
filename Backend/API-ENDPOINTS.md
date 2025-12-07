# Silea API Endpoints Documentation

This document describes all available API endpoints with their request/response schemas.

---

## 🔐 Authentication

### POST `/api/admin/auth/login`
**Description:** Admin login - authenticate and receive JWT token

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### GET `/api/admin/auth/check-email`
**Description:** Check if email exists

**Query Parameters:**
- `email` (string, required)

**Response (200 OK):**
```json
{
  "exists": true
}
```

---

### GET `/api/admin/auth/profile`
**Description:** Get user profile (requires JWT)

**Query Parameters:**
- `userId` (number, required)

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "admin@example.com",
  "name": "Admin User"
}
```

---

## 📂 Categories

### GET `/api/admin/categories`
**Description:** Get all categories

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Huiles d'olive",
    "nameAr": "زيوت الزيتون",
    "description": "Huiles d'olive extra vierge traditionnelles marocaines",
    "active": true,
    "createdAt": "2025-12-01T10:00:00",
    "updatedAt": "2025-12-01T10:00:00"
  },
  {
    "id": 2,
    "name": "Miels",
    "nameAr": "العسل",
    "description": "Miels naturels du Maroc",
    "active": true,
    "createdAt": "2025-12-01T10:00:00",
    "updatedAt": "2025-12-01T10:00:00"
  }
]
```

---

### GET `/api/admin/categories/active`
**Description:** Get only active categories

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Huiles d'olive",
    "nameAr": "زيوت الزيتون",
    "description": "Huiles d'olive extra vierge traditionnelles marocaines",
    "active": true,
    "createdAt": "2025-12-01T10:00:00",
    "updatedAt": "2025-12-01T10:00:00"
  }
]
```

---

### GET `/api/admin/categories/{id}`
**Description:** Get category by ID

**Path Parameters:**
- `id` (number, required)

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Huiles d'olive",
  "nameAr": "زيوت الزيتون",
  "description": "Huiles d'olive extra vierge traditionnelles marocaines",
  "active": true,
  "createdAt": "2025-12-01T10:00:00",
  "updatedAt": "2025-12-01T10:00:00"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Category not found with ID: 1"
}
```

---

### POST `/api/admin/categories`
**Description:** Create new category (Admin only)

**Request Body:**
```json
{
  "name": "string",
  "nameArabic": "string",
  "description": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "category": {
    "id": 3,
    "name": "New Category",
    "nameAr": "فئة جديدة",
    "description": "Description of new category",
    "active": true,
    "createdAt": "2025-12-01T10:00:00",
    "updatedAt": "2025-12-01T10:00:00"
  }
}
```

---

### PUT `/api/admin/categories/{id}`
**Description:** Update category (Admin only)

**Path Parameters:**
- `id` (number, required)

**Request Body:**
```json
{
  "name": "string",
  "nameArabic": "string",
  "description": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "category": {
    "id": 1,
    "name": "Updated Category",
    "nameAr": "فئة محدثة",
    "description": "Updated description",
    "active": true,
    "createdAt": "2025-12-01T10:00:00",
    "updatedAt": "2025-12-01T12:00:00"
  }
}
```

---

### PATCH `/api/admin/categories/{id}/status`
**Description:** Activate/deactivate category (Admin only)

**Path Parameters:**
- `id` (number, required)

**Request Body:**
```json
{
  "active": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category status updated successfully",
  "category": {
    "id": 1,
    "name": "Category Name",
    "nameAr": "اسم الفئة",
    "description": "Description",
    "active": true
  }
}
```

---

### DELETE `/api/admin/categories/{id}`
**Description:** Delete category (Admin only)

**Path Parameters:**
- `id` (number, required)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 🛍️ Products

### GET `/api/products`
**Description:** Get all active products with pagination (Public)

**Query Parameters:**
- `page` (number, default: 0)
- `size` (number, default: 12)

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Huile d'olive extra vierge - Picholine",
      "nameAr": "زيت زيتون بيشولين ممتاز",
      "description": "Huile d'olive extra vierge de Picholine...",
      "price": 45.00,
      "stock": 150,
      "imageUrl": "premium-moroccan-olive-oil-bottle.jpg",
      "weightVolume": "1L",
      "status": "ACTIVE",
      "featured": true,
      "category": {
        "id": 1,
        "name": "Huiles d'olive",
        "nameAr": "زيوت الزيتون"
      },
      "createdAt": "2025-12-01T10:00:00",
      "updatedAt": "2025-12-01T10:00:00"
    }
  ],
  "totalElements": 6,
  "totalPages": 1,
  "currentPage": 0
}
```

---

### GET `/api/products/{id}`
**Description:** Get product by ID (Public)

**Path Parameters:**
- `id` (number, required)

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Huile d'olive extra vierge - Picholine",
  "nameAr": "زيت زيتون بيشولين ممتاز",
  "description": "Huile d'olive extra vierge de Picholine...",
  "price": 45.00,
  "stock": 150,
  "imageUrl": "premium-moroccan-olive-oil-bottle.jpg",
  "weightVolume": "1L",
  "status": "ACTIVE",
  "featured": true,
  "category": {
    "id": 1,
    "name": "Huiles d'olive",
    "nameAr": "زيوت الزيتون"
  },
  "createdAt": "2025-12-01T10:00:00",
  "updatedAt": "2025-12-01T10:00:00"
}
```

---

### GET `/api/products/search`
**Description:** Search products (Public)

**Query Parameters:**
- `query` (string, required)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Huile d'olive extra vierge - Picholine",
    "nameAr": "زيت زيتون بيشولين ممتاز",
    "description": "Huile d'olive extra vierge...",
    "price": 45.00,
    "stock": 150,
    "imageUrl": "premium-moroccan-olive-oil-bottle.jpg",
    "weightVolume": "1L",
    "status": "ACTIVE",
    "featured": true,
    "category": {
      "id": 1,
      "name": "Huiles d'olive"
    }
  }
]
```

---

### GET `/api/products/category/{categoryId}`
**Description:** Get products by category (Public)

**Path Parameters:**
- `categoryId` (number, required)

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "name": "Miel de thym pur",
    "nameAr": "عسل الزعتر الخالص",
    "description": "Miel de thym sauvage...",
    "price": 35.00,
    "stock": 80,
    "imageUrl": "moroccan-thyme-honey.jpg",
    "weightVolume": "500g",
    "status": "ACTIVE",
    "featured": true,
    "category": {
      "id": 2,
      "name": "Miels",
      "nameAr": "العسل"
    }
  }
]
```

---

### GET `/api/products/featured`
**Description:** Get homepage featured products (Public)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Huile d'olive extra vierge - Picholine",
    "nameAr": "زيت زيتون بيشولين ممتاز",
    "description": "Huile d'olive extra vierge...",
    "price": 45.00,
    "stock": 150,
    "imageUrl": "premium-moroccan-olive-oil-bottle.jpg",
    "weightVolume": "1L",
    "status": "ACTIVE",
    "featured": true,
    "category": {
      "id": 1,
      "name": "Huiles d'olive"
    }
  }
]
```

---

### POST `/api/products/admin`
**Description:** Create new product (Admin only, requires JWT)

**Request Body:**
```json
{
  "name": "string",
  "nameArabic": "string",
  "description": "string",
  "price": 0,
  "stockQuantity": 0,
  "categoryId": 0,
  "imageUrl": "string",
  "weightVolume": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": 7,
    "name": "New Product",
    "nameAr": "منتج جديد",
    "description": "Detailed description",
    "price": 29.99,
    "stock": 150,
    "imageUrl": "new_product.jpg",
    "weightVolume": "2kg",
    "status": "ACTIVE",
    "featured": false,
    "category": {
      "id": 1,
      "name": "Huiles d'olive"
    }
  }
}
```

---

### PUT `/api/products/admin/{id}`
**Description:** Update product (Admin only, requires JWT)

**Path Parameters:**
- `id` (number, required)

**Request Body:**
```json
{
  "name": "string",
  "nameArabic": "string",
  "description": "string",
  "price": 0,
  "stockQuantity": 0,
  "imageUrl": "string",
  "weightVolume": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "id": 1,
    "name": "Updated Product",
    "nameAr": "منتج محدث",
    "description": "Updated description",
    "price": 12.50,
    "stock": 90,
    "imageUrl": "updated_image.jpg",
    "weightVolume": "1.5kg",
    "status": "ACTIVE",
    "category": {
      "id": 1,
      "name": "Huiles d'olive"
    }
  }
}
```

---

### PATCH `/api/products/admin/{id}/status`
**Description:** Update product status (Admin only)

**Path Parameters:**
- `id` (number, required)

**Request Body:**
```json
{
  "status": "ACTIVE"
}
```
*Valid values: `ACTIVE`, `INACTIVE`, `LOW_STOCK`*

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product status updated successfully",
  "product": {
    "id": 1,
    "name": "Product Name",
    "status": "ACTIVE"
  }
}
```

---

### PATCH `/api/products/admin/{id}/featured`
**Description:** Toggle product featured status (Admin only)

**Path Parameters:**
- `id` (number, required)

**Request Body:**
```json
{
  "featured": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product featured status updated successfully",
  "product": {
    "id": 1,
    "name": "Product Name",
    "featured": true
  }
}
```

---

### DELETE `/api/products/admin/{id}`
**Description:** Delete product (Admin only)

**Path Parameters:**
- `id` (number, required)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 👥 Customers

### GET `/api/admin/customers`
**Description:** Get all customers with pagination (Admin only)

**Query Parameters:**
- `page` (number, default: 0)
- `size` (number, default: 10)

**Response (200 OK):**
```json
{
  "customers": [
    {
      "id": 1,
      "name": "Ahmed Benali",
      "email": "ahmed.benali@email.com",
      "phone": "+212600000001",
      "address": "123 Rue de la Kasbah, Marrakech",
      "status": "ACTIVE",
      "totalOrders": 5,
      "totalSpent": 425.50,
      "createdAt": "2025-12-01T10:00:00",
      "updatedAt": "2025-12-01T10:00:00"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "currentPage": 0
}
```

---

### GET `/api/admin/customers/{id}`
**Description:** Get customer by ID (Admin only)

**Path Parameters:**
- `id` (number, required)

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Ahmed Benali",
  "email": "ahmed.benali@email.com",
  "phone": "+212600000001",
  "address": "123 Rue de la Kasbah, Marrakech",
  "status": "ACTIVE",
  "totalOrders": 5,
  "totalSpent": 425.50,
  "createdAt": "2025-12-01T10:00:00",
  "updatedAt": "2025-12-01T10:00:00"
}
```

---

### POST `/api/admin/customers`
**Description:** Create new customer (Admin only)

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "customer": {
    "id": 6,
    "name": "New Customer",
    "email": "new.customer@email.com",
    "phone": "+212600000006",
    "address": "New Address",
    "status": "ACTIVE",
    "totalOrders": 0,
    "totalSpent": 0.00
  }
}
```

---

### PUT `/api/admin/customers/{id}`
**Description:** Update customer (Admin only)

**Path Parameters:**
- `id` (number, required)

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "customer": {
    "id": 1,
    "name": "Updated Name",
    "email": "updated.email@example.com",
    "phone": "+212600000001",
    "address": "Updated Address",
    "status": "ACTIVE"
  }
}
```

---

### PATCH `/api/admin/customers/{id}/status`
**Description:** Update customer status (Admin only)

**Path Parameters:**
- `id` (number, required)

**Request Body:**
```json
{
  "status": "ACTIVE"
}
```
*Valid values: `ACTIVE`, `NEW`, `VIP`*

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer status updated successfully",
  "customer": {
    "id": 1,
    "name": "Customer Name",
    "status": "VIP"
  }
}
```

---

### DELETE `/api/admin/customers/{id}`
**Description:** Delete customer (Admin only)

**Path Parameters:**
- `id` (number, required)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

### GET `/api/admin/customers/search`
**Description:** Search customers (Admin only)

**Query Parameters:**
- `query` (string, required)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Ahmed Benali",
    "email": "ahmed.benali@email.com",
    "phone": "+212600000001",
    "address": "123 Rue de la Kasbah, Marrakech",
    "status": "ACTIVE"
  }
]
```

---

### GET `/api/admin/customers/stats`
**Description:** Get customer statistics (Admin only)

**Response (200 OK):**
```json
{
  "totalCustomers": 10,
  "activeCustomers": 8,
  "newCustomers": 2,
  "vipCustomers": 1
}
```

---

### GET `/api/admin/customers/vip`
**Description:** Get VIP customers (Admin only)

**Query Parameters:**
- `threshold` (number, default: 1000)

**Response (200 OK):**
```json
[
  {
    "id": 5,
    "name": "Karim El Amrani",
    "email": "karim.amrani@email.com",
    "totalSpent": 1125.80,
    "status": "VIP"
  }
]
```

---

## 📦 Orders

### POST `/api/orders`
**Description:** Create new order (Public)

**Request Body:**
```json
{
  "customerName": "string",
  "customerEmail": "string",
  "customerPhone": "string",
  "shippingAddress": "string",
  "notes": "string",
  "estimatedDeliveryDate": "2025-12-05T10:00:00",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 45.00
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": 6,
    "orderNumber": "ORD-2025006",
    "customer": {
      "id": 1,
      "name": "Customer Name",
      "email": "customer@email.com"
    },
    "orderItems": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Product Name"
        },
        "quantity": 2,
        "unitPrice": 45.00,
        "totalPrice": 90.00
      }
    ],
    "shippingAddress": "123 Main St",
    "orderDate": "2025-12-01T10:00:00",
    "estimatedDeliveryDate": "2025-12-05T10:00:00",
    "status": "PENDING",
    "total": 90.00
  }
}
```

---

### GET `/api/orders/{id}`
**Description:** Get order by ID (Public)

**Path Parameters:**
- `id` (number, required)

**Response (200 OK):**
```json
{
  "id": 1,
  "orderNumber": "ORD-2025001",
  "customer": {
    "id": 1,
    "name": "Ahmed Benali",
    "email": "ahmed.benali@email.com"
  },
  "orderItems": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Huile d'olive extra vierge"
      },
      "quantity": 2,
      "unitPrice": 45.00,
      "totalPrice": 90.00
    }
  ],
  "shippingAddress": "123 Rue de la Kasbah, Marrakech",
  "orderDate": "2025-09-15T10:30:00",
  "estimatedDeliveryDate": "2025-09-18T14:00:00",
  "status": "DELIVERED",
  "total": 125.00
}
```

---

### GET `/api/orders/track/{orderNumber}`
**Description:** Track order by order number (Public)

**Path Parameters:**
- `orderNumber` (string, required)

**Response (200 OK):**
```json
{
  "id": 1,
  "orderNumber": "ORD-2025001",
  "customer": {
    "id": 1,
    "name": "Ahmed Benali"
  },
  "status": "DELIVERED",
  "total": 125.00,
  "shippingAddress": "123 Rue de la Kasbah, Marrakech",
  "orderDate": "2025-09-15T10:30:00",
  "estimatedDeliveryDate": "2025-09-18T14:00:00"
}
```

---

### GET `/api/orders/customer/{email}`
**Description:** Get orders by customer email (Public)

**Path Parameters:**
- `email` (string, required)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-2025001",
    "status": "DELIVERED",
    "total": 125.00,
    "orderDate": "2025-09-15T10:30:00"
  }
]
```

---

### GET `/api/orders/admin`
**Description:** Get all orders with pagination (Admin only)

**Query Parameters:**
- `page` (number, default: 0)
- `size` (number, default: 10)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-2025001",
    "customer": {
      "id": 1,
      "name": "Ahmed Benali"
    },
    "status": "DELIVERED",
    "total": 125.00,
    "orderDate": "2025-09-15T10:30:00"
  }
]
```

---

### PATCH `/api/orders/admin/{id}/status`
**Description:** Update order status (Admin only)

**Path Parameters:**
- `id` (number, required)

**Request Body:**
```json
{
  "status": "SHIPPED"
}
```
*Valid values: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`*

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "id": 1,
    "orderNumber": "ORD-2025001",
    "status": "SHIPPED"
  }
}
```

---

### GET `/api/orders/admin/status/{status}`
**Description:** Get orders by status (Admin only)

**Path Parameters:**
- `status` (string, required) - `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`

**Response (200 OK):**
```json
[
  {
    "id": 3,
    "orderNumber": "ORD-2025003",
    "status": "PROCESSING",
    "total": 117.00
  }
]
```

---

### GET `/api/orders/admin/search`
**Description:** Search orders (Admin only)

**Query Parameters:**
- `query` (string, required)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-2025001",
    "customer": {
      "name": "Ahmed Benali"
    },
    "status": "DELIVERED"
  }
]
```

---

### GET `/api/orders/admin/delivery-today`
**Description:** Get orders with delivery scheduled for today (Admin only)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-2025001",
    "estimatedDeliveryDate": "2025-12-02T10:00:00",
    "status": "SHIPPED"
  }
]
```

---

## 📍 Order Tracking

### GET `/api/tracking/order/{orderId}`
**Description:** Get tracking history for an order (Public)

**Path Parameters:**
- `orderId` (number, required)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "status": "PROCESSING",
    "location": "Marrakech Warehouse",
    "carrier": "Internal",
    "notes": "Order received and being prepared",
    "statusDate": "2025-09-15T10:30:00",
    "createdAt": "2025-09-15T10:30:00"
  },
  {
    "id": 2,
    "orderId": 1,
    "status": "SHIPPED",
    "location": "Marrakech Post Office",
    "carrier": "Poste Maroc",
    "notes": "Order shipped via local courier",
    "statusDate": "2025-09-16T09:00:00",
    "createdAt": "2025-09-16T09:00:00"
  }
]
```

---

### GET `/api/tracking/order/{orderId}/latest`
**Description:** Get latest tracking update (Public)

**Path Parameters:**
- `orderId` (number, required)

**Response (200 OK):**
```json
{
  "id": 4,
  "orderId": 1,
  "status": "DELIVERED",
  "location": "Customer Address",
  "carrier": "Poste Maroc",
  "notes": "Order delivered successfully",
  "statusDate": "2025-09-18T14:00:00"
}
```

---

### GET `/api/tracking/track/{orderNumber}`
**Description:** Track order by order number (Public)

**Path Parameters:**
- `orderNumber` (string, required)

**Response (200 OK):**
```json
{
  "order": {
    "id": 1,
    "orderNumber": "ORD-2025001",
    "status": "DELIVERED",
    "total": 125.00
  },
  "trackingHistory": [
    {
      "id": 1,
      "status": "PROCESSING",
      "location": "Marrakech Warehouse",
      "statusDate": "2025-09-15T10:30:00"
    },
    {
      "id": 2,
      "status": "SHIPPED",
      "location": "Marrakech Post Office",
      "statusDate": "2025-09-16T09:00:00"
    },
    {
      "id": 3,
      "status": "DELIVERED",
      "location": "Customer Address",
      "statusDate": "2025-09-18T14:00:00"
    }
  ]
}
```

---

### POST `/api/tracking/admin`
**Description:** Add tracking update (Admin only)

**Request Body:**
```json
{
  "orderId": 1,
  "status": "SHIPPED",
  "location": "string",
  "notes": "string"
}
```
*Valid status values: `PROCESSING`, `CONFIRMED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`*

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tracking update added successfully",
  "tracking": {
    "id": 5,
    "orderId": 1,
    "status": "SHIPPED",
    "location": "Shipping Hub",
    "notes": "Package shipped",
    "statusDate": "2025-12-02T10:00:00"
  }
}
```

---

### GET `/api/tracking/admin/status/{status}`
**Description:** Get tracking records by status (Admin only)

**Path Parameters:**
- `status` (string, required) - `PROCESSING`, `CONFIRMED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "status": "SHIPPED",
    "location": "Marrakech Post Office",
    "carrier": "Poste Maroc"
  }
]
```

---

## 🛒 Cart

### POST `/api/cart/calculate`
**Description:** Calculate cart total

**Request Body:**
```json
[
  {
    "productId": 1,
    "quantity": 2,
    "unitPrice": 45.00
  },
  {
    "productId": 2,
    "quantity": 1,
    "unitPrice": 35.00
  }
]
```

**Response (200 OK):**
```json
{
  "total": 125.00,
  "itemCount": 2
}
```

---

### POST `/api/cart/validate`
**Description:** Validate cart items for availability

**Request Body:**
```json
[
  {
    "productId": 1,
    "quantity": 2,
    "unitPrice": 45.00
  }
]
```

**Response (200 OK):**
```json
{
  "valid": true,
  "errors": [],
  "warnings": []
}
```

---

### POST `/api/cart/summary`
**Description:** Get detailed cart summary

**Request Body:**
```json
[
  {
    "productId": 1,
    "quantity": 2,
    "unitPrice": 45.00
  }
]
```

**Response (200 OK):**
```json
{
  "subtotal": 90.00,
  "totalItems": 2,
  "items": [
    {
      "productId": 1,
      "productName": "Huile d'olive extra vierge",
      "quantity": 2,
      "unitPrice": 45.00,
      "itemTotal": 90.00
    }
  ]
}
```

---

### POST `/api/cart/check-minimum`
**Description:** Check if cart meets minimum order value

**Request Body:**
```json
{
  "minimumValue": 50.00,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 45.00
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "hasMinimum": true,
  "minimumValue": 50.00
}
```

---

### POST `/api/cart/reserve-stock`
**Description:** Reserve stock for cart items during checkout

**Request Body:**
```json
[
  {
    "productId": 1,
    "quantity": 2,
    "unitPrice": 45.00
  }
]
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stock reserved successfully"
}
```

---

### POST `/api/cart/shipping`
**Description:** Calculate shipping cost estimate

**Request Body:**
```json
[
  {
    "productId": 1,
    "quantity": 2,
    "unitPrice": 45.00
  }
]
```

**Response (200 OK):**
```json
{
  "subtotal": 90.00,
  "shipping": 30.00,
  "freeShippingThreshold": 200.00
}
```

---

## 📊 Dashboard

### GET `/api/admin/dashboard/stats`
**Description:** Get main dashboard statistics (Admin only)

**Response (200 OK):**
```json
{
  "orders": {
    "totalOrders": 100,
    "pendingOrders": 10,
    "processingOrders": 15,
    "shippedOrders": 25,
    "deliveredOrders": 50
  },
  "customers": {
    "totalCustomers": 50,
    "activeCustomers": 40,
    "newCustomers": 5,
    "vipCustomers": 5
  },
  "products": {
    "totalProducts": 6,
    "activeProducts": 6,
    "inactiveProducts": 0,
    "lowStockProducts": 0
  },
  "tracking": {
    "totalTrackings": 90,
    "inTransit": 30,
    "delivered": 50,
    "pending": 10
  }
}
```

---

### GET `/api/admin/dashboard/recent-orders`
**Description:** Get recent orders for dashboard (Admin only)

**Query Parameters:**
- `limit` (number, default: 10)

**Response (200 OK):**
```json
{
  "orders": [],
  "message": "Recent orders feature not yet implemented"
}
```

---

### GET `/api/admin/dashboard/delivery-performance`
**Description:** Get delivery performance metrics (Admin only)

**Response (200 OK):**
```json
{
  "averageDeliveryTime": 24.5,
  "delayedOrdersCount": 5
}
```

---

### GET `/api/admin/dashboard/inventory-alerts`
**Description:** Get inventory alerts (Admin only)

**Response (200 OK):**
```json
{
  "lowStockProducts": 0,
  "totalProducts": 6
}
```

---

### GET `/api/admin/dashboard/alerts`
**Description:** Get real-time dashboard alerts (Admin only)

**Response (200 OK):**
```json
{
  "lowStockCount": 0,
  "pendingOrdersCount": 1,
  "delayedDeliveriesCount": 0
}
```

---

## 📋 Enums Reference

### Order Status
- `PENDING`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`

### Product Status
- `ACTIVE`
- `INACTIVE`
- `LOW_STOCK`

### Customer Status
- `ACTIVE`
- `NEW`
- `VIP`

### Tracking Status
- `PROCESSING`
- `CONFIRMED`
- `SHIPPED`
- `OUT_FOR_DELIVERY`
- `DELIVERED`

---

## 🔒 Authentication

All admin endpoints require JWT Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

Obtain the token via the `/api/admin/auth/login` endpoint.

---

## 📝 Notes

- All dates are in ISO 8601 format
- Prices are in MAD (Moroccan Dirham)
- Arabic text fields use UTF-8 encoding
- Pagination is 0-indexed
