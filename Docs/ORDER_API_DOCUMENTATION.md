# 📦 TheShop Order API Documentation

## 📋 Table of Contents
- [Base URL & Headers](#base-url--headers)
- [Authentication & Authorization](#authentication--authorization)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Testing Data](#testing-data)

---

## 🌐 Base URL & Headers

### Base URL
```
Development: http://localhost:8000/api/v1
Production: https://your-domain.com/api/v1
```

### Required Headers
```javascript
Content-Type: application/json
Authorization:   <access_token> // REQUIRED for all order routes
```

---

## 🔐 Authentication & Authorization

**All order routes require authentication.** Different endpoints have different authorization levels:

### User Routes (Regular Users)
- Get user's orders
- Get specific order (own orders only)

### Admin Routes (Admin Users Only)
- Get all orders
- Update order status
- Delete orders

### Authorization Levels
```
Regular User: Can view own orders only
Admin User: Can view, update, and delete all orders
```

---

## 📡 API Endpoints

### 1. 📋 Get User's Orders
**GET** `/orders/getUserOrders`

**Headers Required:**
```javascript
Authorization:   <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User orders retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439012",
      "products": [
        {
          "product": {
            "_id": "507f1f77bcf86cd799439013",
            "name": "iPhone 15 Pro",
            "image": "https://cloudinary.com/iphone15.jpg",
            "price": 999
          },
          "quantity": 2,
          "price": 999
        }
      ],
      "totalAmount": 1998,
      "status": "pending",
      "shippingAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "stripeSessionId": "cs_test_123456789",
      "paymentStatus": "paid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

---

### 2. 🔍 Get Order by ID
**GET** `/orders/getOrder/:id`

**Headers Required:**
```javascript
Authorization:   <access_token>
```

**URL Parameters:**
- `id`: Order ID (24-character MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "products": [
      {
        "product": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "iPhone 15 Pro",
          "image": "https://cloudinary.com/iphone15.jpg",
          "price": 999,
          "description": "Latest iPhone model"
        },
        "quantity": 2,
        "price": 999
      }
    ],
    "totalAmount": 1998,
    "status": "pending",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "stripeSessionId": "cs_test_123456789",
    "paymentStatus": "paid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
```json
// 400 - Invalid Order ID
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "id": "Invalid order ID format"
  }
}

// 404 - Order Not Found
{
  "success": false,
  "message": "Order not found"
}

// 403 - Access Denied
{
  "success": false,
  "message": "Access denied. You can only view your own orders."
}
```

---

### 3. 📊 Get All Orders (Admin Only)
**GET** `/orders/getAllOrders`

**Headers Required:**
```javascript
Authorization:   <access_token> // Admin token required
```

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 50)
- `status` (optional): Filter by status

**Example Request:**
```
GET /orders/getAllOrders?page=1&limit=10&status=pending
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "All orders retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "products": [
        {
          "product": {
            "_id": "507f1f77bcf86cd799439013",
            "name": "iPhone 15 Pro",
            "image": "https://cloudinary.com/iphone15.jpg",
            "price": 999
          },
          "quantity": 2,
          "price": 999
        }
      ],
      "totalAmount": 1998,
      "status": "pending",
      "paymentStatus": "paid",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalOrders": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error Responses:**
```json
// 401 - Not Admin
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}

// 400 - Invalid Query Parameters
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "limit": "Limit must be between 1 and 50"
  }
}
```

---

### 4. ✏️ Update Order Status (Admin Only)
**PUT** `/orders/updateOrderStatus/:id`

**Headers Required:**
```javascript
Authorization:   <access_token> // Admin token required
Content-Type: application/json
```

**URL Parameters:**
- `id`: Order ID (24-character MongoDB ObjectId)

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Valid Status Values:**
- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "products": [...],
    "totalAmount": 1998,
    "status": "shipped",
    "paymentStatus": "paid",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
```json
// 400 - Invalid Status
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "status": "Status must be one of: pending, processing, shipped, delivered, cancelled"
  }
}

// 404 - Order Not Found
{
  "success": false,
  "message": "Order not found"
}

// 401 - Not Admin
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

---

### 5. 🗑️ Delete Order (Admin Only)
**DELETE** `/orders/deleteOrder/:id`

**Headers Required:**
```javascript
Authorization:   <access_token> // Admin token required
```

**URL Parameters:**
- `id`: Order ID (24-character MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

**Error Responses:**
```json
// 404 - Order Not Found
{
  "success": false,
  "message": "Order not found"
}

// 401 - Not Admin
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

---

## ⚠️ Error Handling

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "field-specific error"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Invalid/missing token)
- `403` - Forbidden (Insufficient privileges)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Testing Data

### Valid Order IDs
```
507f1f77bcf86cd799439011
507f1f77bcf86cd799439012
507f1f77bcf86cd799439013
```

### Valid Order Statuses
```json
{
  "status": "pending"
}
```

```json
{
  "status": "processing"
}
```

```json
{
  "status": "shipped"
}
```

```json
{
  "status": "delivered"
}
```

```json
{
  "status": "cancelled"
}
```

### Query Parameters Examples
```
// Basic pagination
GET /orders/getAllOrders?page=1&limit=10

// Filter by status
GET /orders/getAllOrders?status=pending

// Combined
GET /orders/getAllOrders?page=2&limit=20&status=shipped
```

---

## 🔧 Frontend Integration Examples

### JavaScript/Fetch Example
```javascript
// Get user's orders
const getUserOrders = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/orders/getUserOrders', {
      method: 'GET',
      headers: {
        'Authorization': `  ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to get orders:', error);
    throw error;
  }
};

// Get specific order
const getOrderById = async (orderId) => {
  try {
    const response = await fetch(`http://localhost:8000/api/v1/orders/getOrder/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `  ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to get order:', error);
    throw error;
  }
};

// Admin: Get all orders with pagination
const getAllOrders = async (page = 1, limit = 10, status = null) => {
  try {
    let url = `http://localhost:8000/api/v1/orders/getAllOrders?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `  ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to get all orders:', error);
    throw error;
  }
};

// Admin: Update order status
const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(`http://localhost:8000/api/v1/orders/updateOrderStatus/${orderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `  ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
};
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/orders/getUserOrders', {
        headers: {
          'Authorization': `  ${localStorage.getItem('accessToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/orders/getOrder/${orderId}`, {
        headers: {
          'Authorization': `  ${localStorage.getItem('accessToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        setError(data.message);
        return null;
      }
    } catch (error) {
      setError('Failed to fetch order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserOrders();
  }, []);

  return { orders, loading, error, getUserOrders, getOrderById };
};
```

### Admin Hook Example
```javascript
import { useState, useEffect } from 'react';

const useAdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllOrders = async (page = 1, limit = 10, status = null) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/v1/orders/getAllOrders?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `  ${localStorage.getItem('accessToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`/api/v1/orders/updateOrderStatus/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `  ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh orders list
        getAllOrders();
        return data.data;
      } else {
        setError(data.message);
        return null;
      }
    } catch (error) {
      setError('Failed to update order status');
      return null;
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  return { 
    orders, 
    pagination, 
    loading, 
    error, 
    getAllOrders, 
    updateOrderStatus 
  };
};
```

---

## 📝 Notes for Frontend Developers

1. **Authentication Required**: All order endpoints require a valid access token
2. **Authorization Levels**: Different endpoints require different user roles
3. **Pagination**: Admin getAllOrders endpoint supports pagination
4. **Filtering**: Orders can be filtered by status
5. **Access Control**: Users can only view their own orders (unless admin)
6. **Real-time Updates**: Order status can be updated by admins

---

## 🎯 Use Cases

### 1. User Order History
```javascript
// Display user's order history
const userOrders = await getUserOrders();
userOrders.forEach(order => {
  displayOrder(order);
});
```

### 2. Order Details Page
```javascript
// Show detailed order information
const orderDetails = await getOrderById('507f1f77bcf86cd799439011');
if (orderDetails) {
  showOrderDetails(orderDetails);
}
```

### 3. Admin Order Management
```javascript
// Admin dashboard with pagination
const { orders, pagination } = await getAllOrders(1, 20, 'pending');
displayAdminOrders(orders, pagination);
```

### 4. Status Updates
```javascript
// Admin updates order status
const updatedOrder = await updateOrderStatus('507f1f77bcf86cd799439011', 'shipped');
if (updatedOrder) {
  showSuccessMessage('Order status updated');
}
```

---

## 🚀 Getting Started

1. **Ensure Authentication**: User must be logged in
2. **Check Authorization**: Verify user role for admin endpoints
3. **Get User Orders**: `GET /api/v1/orders/getUserOrders`
4. **Get Specific Order**: `GET /api/v1/orders/getOrder/:id`
5. **Admin Functions**: Use admin endpoints with proper authorization

---

## 🔄 Typical Flows

### User Flow
```
1. User logs in → Gets access token
2. User visits orders page → GET /orders/getUserOrders
3. User clicks on order → GET /orders/getOrder/:id
4. User views order details
```

### Admin Flow
```
1. Admin logs in → Gets admin access token
2. Admin visits dashboard → GET /orders/getAllOrders
3. Admin filters orders → GET /orders/getAllOrders?status=pending
4. Admin updates status → PUT /orders/updateOrderStatus/:id
5. Admin deletes order → DELETE /orders/deleteOrder/:id
```

---

**Last Updated**: January 2024  
**API Version**: v1  
**Base URL**: `http://localhost:8000/api/v1`  
**Authentication**: Required for all endpoints  
**Authorization**: Role-based access control  
**Available Routes**: `/api/v1/auth`, `/api/v1/products`, `/api/v1/cart`, `/api/v1/coupons`, `/api/v1/orders`, `/api/v1/payments`, `/api/v1/analytics`, `/api/v1/contact` 