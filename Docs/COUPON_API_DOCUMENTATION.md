# 🎫 TheShop Coupon API Documentation

## 📋 Table of Contents
- [Base URL & Headers](#base-url--headers)
- [Authentication](#authentication)
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
Authorization:   <access_token> // REQUIRED for all coupon routes
```

---

## 🔐 Authentication

**All coupon routes require authentication.** Users must be logged in to access coupon functionality.

### Authentication Flow
```
Login → Get Access Token → Use Token in Authorization Header
```

---

## 📡 API Endpoints

### 1. 🎫 Get User's Coupon
**GET** `/coupons/getCoupon`

**Headers Required:**
```javascript
Authorization:   <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Coupon retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "code": "SAVE20",
    "discountPercentage": 20,
    "expirationDate": "2024-12-31T23:59:59.000Z",
    "isActive": true,
    "userId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**No Coupon Response (200):**
```json
{
  "success": true,
  "message": "No active coupon found",
  "data": null
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

### 2. ✅ Validate Coupon
**POST** `/coupons/validateCoupon`

**Headers Required:**
```javascript
Authorization:   <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "SAVE20"
}
```

**Validation Rules:**
- `code`: Required, 3-20 characters, trimmed

**Success Response (200):**
```json
{
  "success": true,
  "message": "Coupon is valid",
  "data": {
    "code": "SAVE20",
    "discountPercentage": 20
  }
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "code": "Code is required"
  }
}

// 404 - Coupon Not Found
{
  "success": false,
  "message": "Coupon not found"
}

// 404 - Coupon Expired
{
  "success": false,
  "message": "Coupon expired"
}

// 401 - Unauthorized
{
  "success": false,
  "message": "Not authorized, no token"
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
- `404` - Not Found (Coupon not found/expired)
- `500` - Internal Server Error

---

## 🧪 Testing Data

### Valid Coupon Codes
```json
{
  "code": "SAVE20"
}
```

```json
{
  "code": "WELCOME50"
}
```

```json
{
  "code": "FLASH25"
}
```

### Invalid Coupon Codes
```json
// Too short
{
  "code": "AB"
}

// Too long
{
  "code": "VERYLONGCOUPONCODE12345"
}

// Empty
{
  "code": ""
}

// Non-existent
{
  "code": "INVALID123"
}
```

---

## 🔧 Frontend Integration Examples

### JavaScript/Fetch Example
```javascript
// Get user's coupon
const getCoupon = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/coupons/getCoupon', {
      method: 'GET',
      headers: {
        'Authorization': `  ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data; // Returns coupon object or null
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to get coupon:', error);
    throw error;
  }
};

// Validate coupon
const validateCoupon = async (code) => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/coupons/validateCoupon', {
      method: 'POST',
      headers: {
        'Authorization': `  ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data; // Returns { code, discountPercentage }
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Coupon validation failed:', error);
    throw error;
  }
};
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useCoupon = () => {
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCoupon = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/coupons/getCoupon', {
        headers: {
          'Authorization': `  ${localStorage.getItem('accessToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCoupon(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch coupon');
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = async (code) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/coupons/validateCoupon', {
        method: 'POST',
        headers: {
          'Authorization': `  ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        setError(data.message);
        return null;
      }
    } catch (error) {
      setError('Failed to validate coupon');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCoupon();
  }, []);

  return { coupon, loading, error, getCoupon, validateCoupon };
};
```

### Vue.js Example
```javascript
// Composition API
import { ref, onMounted } from 'vue';

export function useCoupon() {
  const coupon = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const getCoupon = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch('/api/v1/coupons/getCoupon', {
        headers: {
          'Authorization': `  ${localStorage.getItem('accessToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        coupon.value = data.data;
      } else {
        error.value = data.message;
      }
    } catch (err) {
      error.value = 'Failed to fetch coupon';
    } finally {
      loading.value = false;
    }
  };

  const validateCoupon = async (code) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch('/api/v1/coupons/validateCoupon', {
        method: 'POST',
        headers: {
          'Authorization': `  ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        error.value = data.message;
        return null;
      }
    } catch (err) {
      error.value = 'Failed to validate coupon';
      return null;
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    getCoupon();
  });

  return {
    coupon,
    loading,
    error,
    getCoupon,
    validateCoupon
  };
}
```

---

## 📝 Notes for Frontend Developers

1. **Authentication Required**: All coupon endpoints require a valid access token
2. **User-Specific**: Coupons are tied to specific users (userId field)
3. **Expiration Handling**: Coupons automatically become inactive when expired
4. **Validation**: Always validate coupon codes before applying discounts
5. **Error Handling**: Handle different error scenarios (not found, expired, invalid)
6. **Real-time Updates**: Coupon status can change (expiration, deactivation)

---

## 🎯 Use Cases

### 1. Display User's Active Coupon
```javascript
// Show user's available coupon on dashboard
const userCoupon = await getCoupon();
if (userCoupon) {
  displayCoupon(userCoupon.code, userCoupon.discountPercentage);
}
```

### 2. Apply Coupon to Cart
```javascript
// Validate coupon before applying to cart
const couponData = await validateCoupon('SAVE20');
if (couponData) {
  applyDiscount(couponData.discountPercentage);
}
```

### 3. Coupon Input Field
```javascript
// Real-time coupon validation
const handleCouponSubmit = async (code) => {
  const result = await validateCoupon(code);
  if (result) {
    setDiscount(result.discountPercentage);
    setCouponCode(result.code);
  }
};
```

---

## 🚀 Getting Started

1. **Ensure Authentication**: User must be logged in
2. **Get User's Coupon**: `GET /api/v1/coupons/getCoupon`
3. **Validate Coupon**: `POST /api/v1/coupons/validateCoupon`
4. **Handle Responses**: Check success field and handle errors

---

## 🔄 Typical Flow

```
1. User logs in → Gets access token
2. User visits coupon page → GET /coupons/getCoupon
3. User enters coupon code → POST /coupons/validateCoupon
4. If valid → Apply discount to cart/order
5. If invalid → Show error message
```

---

**Last Updated**: January 2024  
**API Version**: v1  
**Base URL**: `http://localhost:8000/api/v1`  
**Authentication**: Required for all endpoints  
**Available Routes**: `/api/v1/auth`, `/api/v1/products`, `/api/v1/cart`, `/api/v1/coupons`, `/api/v1/orders`, `/api/v1/payments`, `/api/v1/analytics`, `/api/v1/contact` 