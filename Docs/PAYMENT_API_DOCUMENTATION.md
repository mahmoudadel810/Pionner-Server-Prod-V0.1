# 💳 TheShop Payment API Documentation

## 📋 Table of Contents
- [Base URL & Headers](#base-url--headers)
- [Authentication](#authentication)
- [Payment Flow](#payment-flow)
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
Authorization:   <access_token> // REQUIRED for all payment routes
```

---

## 🔐 Authentication

**All payment routes require authentication.** Users must be logged in to process payments.

### Authentication Flow
```
Login → Get Access Token → Use Token in Authorization Header
```

---

## 🔄 Payment Flow

### Complete Payment Process
```
1. User adds products to cart
2. User applies coupon (optional)
3. Create checkout session → POST /payments/createCheckoutSession
4. Redirect to Stripe checkout
5. User completes payment on Stripe
6. Stripe redirects to success/cancel URL
7. Confirm payment success → POST /payments/checkoutSuccess
8. Order created and coupon deactivated
```

---

## 📡 API Endpoints

### 1. 🛒 Create Checkout Session
**POST** `/payments/createCheckoutSession`

**Headers Required:**
```javascript
Authorization:   <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Pro",
      "price": 999,
      "image": "https://cloudinary.com/iphone15.jpg",
      "quantity": 2
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "AirPods Pro",
      "price": 249,
      "image": "https://cloudinary.com/airpods.jpg",
      "quantity": 1
    }
  ],
  "couponCode": "SAVE20"
}
```

**Validation Rules:**
- `products`: Required array with at least 1 product
- `products[]._id`: Required, 24-character MongoDB ObjectId
- `products[].name`: Required string
- `products[].price`: Required number, minimum 0
- `products[].image`: Optional string (URL)
- `products[].quantity`: Required number, minimum 1
- `couponCode`: Optional string (can be empty or null)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Checkout session created successfully",
  "data": {
    "id": "cs_test_1234567890abcdef",
    "totalAmount": 2247.2
  }
}
```

**Error Responses:**
```json
// 400 - Invalid Products Array
{
  "success": false,
  "message": "Invalid or empty products array"
}

// 400 - Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "products": "Products array is required"
  }
}

// 401 - Unauthorized
{
  "success": false,
  "message": "Not authorized, no token"
}
```

**Frontend Integration:**
```javascript
// Redirect to Stripe checkout
const response = await createCheckoutSession(products, couponCode);
if (response.success) {
  // Redirect to Stripe checkout
  window.location.href = `https://checkout.stripe.com/pay/${response.data.id}`;
}
```

---

### 2. ✅ Checkout Success
**POST** `/payments/checkoutSuccess`

**Headers Required:**
```javascript
Authorization:   <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "cs_test_1234567890abcdef"
}
```

**Validation Rules:**
- `sessionId`: Required string (Stripe session ID)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment successful, order created, and coupon deactivated if used.",
  "data": {
    "orderId": "507f1f77bcf86cd799439013"
  }
}
```

**Error Responses:**
```json
// 400 - Payment Not Completed
{
  "success": false,
  "message": "Payment not completed"
}

// 400 - Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "sessionId": "Session ID is required"
  }
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
- `400` - Bad Request (Validation errors, payment issues)
- `401` - Unauthorized (Invalid/missing token)
- `500` - Internal Server Error

---

## 🧪 Testing Data

### Valid Product Data
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Pro",
      "price": 999,
      "image": "https://cloudinary.com/iphone15.jpg",
      "quantity": 2
    }
  ],
  "couponCode": "SAVE20"
}
```

### Multiple Products
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Pro",
      "price": 999,
      "image": "https://cloudinary.com/iphone15.jpg",
      "quantity": 1
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "AirPods Pro",
      "price": 249,
      "image": "https://cloudinary.com/airpods.jpg",
      "quantity": 2
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "MacBook Pro",
      "price": 1999,
      "image": "https://cloudinary.com/macbook.jpg",
      "quantity": 1
    }
  ],
  "couponCode": "WELCOME50"
}
```

### Without Coupon
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Pro",
      "price": 999,
      "image": "https://cloudinary.com/iphone15.jpg",
      "quantity": 1
    }
  ]
}
```

### Valid Session ID
```json
{
  "sessionId": "cs_test_1234567890abcdef"
}
```

---

## 🔧 Frontend Integration Examples

### JavaScript/Fetch Example
```javascript
// Create checkout session
const createCheckoutSession = async (products, couponCode = null) => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/payments/createCheckoutSession', {
      method: 'POST',
      headers: {
        'Authorization': `  ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ products, couponCode })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    throw error;
  }
};

// Confirm checkout success
const confirmCheckoutSuccess = async (sessionId) => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/payments/checkoutSuccess', {
      method: 'POST',
      headers: {
        'Authorization': `  ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to confirm checkout success:', error);
    throw error;
  }
};

// Complete payment flow
const processPayment = async (cartItems, couponCode = null) => {
  try {
    // 1. Create checkout session
    const sessionData = await createCheckoutSession(cartItems, couponCode);
    
    // 2. Redirect to Stripe checkout
    window.location.href = `https://checkout.stripe.com/pay/${sessionData.id}`;
    
  } catch (error) {
    console.error('Payment processing failed:', error);
    throw error;
  }
};
```

### React Hook Example
```javascript
import { useState } from 'react';

const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCheckoutSession = async (products, couponCode = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/payments/createCheckoutSession', {
        method: 'POST',
        headers: {
          'Authorization': `  ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ products, couponCode })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        setError(data.message);
        return null;
      }
    } catch (error) {
      setError('Failed to create checkout session');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const confirmCheckoutSuccess = async (sessionId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/payments/checkoutSuccess', {
        method: 'POST',
        headers: {
          'Authorization': `  ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        setError(data.message);
        return null;
      }
    } catch (error) {
      setError('Failed to confirm checkout success');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (cartItems, couponCode = null) => {
    const sessionData = await createCheckoutSession(cartItems, couponCode);
    if (sessionData) {
      window.location.href = `https://checkout.stripe.com/pay/${sessionData.id}`;
    }
  };

  return { 
    loading, 
    error, 
    createCheckoutSession, 
    confirmCheckoutSuccess, 
    processPayment 
  };
};
```

### Vue.js Example
```javascript
// Composition API
import { ref } from 'vue';

export function usePayment() {
  const loading = ref(false);
  const error = ref(null);

  const createCheckoutSession = async (products, couponCode = null) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch('/api/v1/payments/createCheckoutSession', {
        method: 'POST',
        headers: {
          'Authorization': `  ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ products, couponCode })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        error.value = data.message;
        return null;
      }
    } catch (err) {
      error.value = 'Failed to create checkout session';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const confirmCheckoutSuccess = async (sessionId) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch('/api/v1/payments/checkoutSuccess', {
        method: 'POST',
        headers: {
          'Authorization': `  ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        error.value = data.message;
        return null;
      }
    } catch (err) {
      error.value = 'Failed to confirm checkout success';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const processPayment = async (cartItems, couponCode = null) => {
    const sessionData = await createCheckoutSession(cartItems, couponCode);
    if (sessionData) {
      window.location.href = `https://checkout.stripe.com/pay/${sessionData.id}`;
    }
  };

  return {
    loading,
    error,
    createCheckoutSession,
    confirmCheckoutSuccess,
    processPayment
  };
}
```

---

## 📝 Notes for Frontend Developers

1. **Authentication Required**: All payment endpoints require a valid access token
2. **Stripe Integration**: Uses Stripe Checkout for secure payment processing
3. **Currency**: All amounts are in SAR (Saudi Riyal)
4. **Amount Format**: Stripe expects amounts in cents (smallest currency unit)
5. **Coupon Integration**: Supports automatic coupon application and deactivation
6. **Order Creation**: Successful payments automatically create orders
7. **Bonus Coupons**: Orders over 200 SAR automatically generate new coupons

---

## 🎯 Use Cases

### 1. Shopping Cart Checkout
```javascript
// Process cart checkout with coupon
const cartItems = [
  { _id: "507f1f77bcf86cd799439011", name: "iPhone 15 Pro", price: 999, quantity: 1 }
];
const couponCode = "SAVE20";

await processPayment(cartItems, couponCode);
```

### 2. Success Page Handling
```javascript
// Handle payment success redirect
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

if (sessionId) {
  const result = await confirmCheckoutSuccess(sessionId);
  if (result) {
    showSuccessMessage(`Order created: ${result.orderId}`);
  }
}
```

### 3. Cancel Page Handling
```javascript
// Handle payment cancellation
if (window.location.pathname === '/purchase-cancel') {
  showCancelMessage('Payment was cancelled');
  redirectToCart();
}
```

---

## 🔄 Complete Payment Flow Example

### Step 1: User Adds Items to Cart
```javascript
const cartItems = [
  {
    _id: "507f1f77bcf86cd799439011",
    name: "iPhone 15 Pro",
    price: 999,
    image: "https://cloudinary.com/iphone15.jpg",
    quantity: 2
  }
];
```

### Step 2: User Applies Coupon
```javascript
const couponCode = "SAVE20"; // 20% discount
```

### Step 3: Create Checkout Session
```javascript
const sessionData = await createCheckoutSession(cartItems, couponCode);
// Returns: { id: "cs_test_1234567890abcdef", totalAmount: 1598.4 }
```

### Step 4: Redirect to Stripe
```javascript
window.location.href = `https://checkout.stripe.com/pay/${sessionData.id}`;
```

### Step 5: Handle Success Redirect
```javascript
// On success page (/purchase-success?session_id=cs_test_1234567890abcdef)
const sessionId = new URLSearchParams(window.location.search).get('session_id');
const result = await confirmCheckoutSuccess(sessionId);
// Returns: { orderId: "507f1f77bcf86cd799439013" }
```

---

## 🚀 Getting Started

1. **Ensure Authentication**: User must be logged in
2. **Prepare Cart Data**: Format products array correctly
3. **Create Checkout Session**: `POST /api/v1/payments/createCheckoutSession`
4. **Redirect to Stripe**: Use returned session ID
5. **Handle Success/Cancel**: Process redirect URLs
6. **Confirm Success**: `POST /api/v1/payments/checkoutSuccess`

---

## 🔄 Typical Flow

```
1. User adds products to cart
2. User applies coupon (optional)
3. User clicks "Checkout" → POST /payments/createCheckoutSession
4. Redirect to Stripe checkout page
5. User enters payment details on Stripe
6. Stripe processes payment
7. Stripe redirects to success/cancel URL
8. Frontend confirms success → POST /payments/checkoutSuccess
9. Order created, coupon deactivated
10. User sees success message with order ID
```

---

**Last Updated**: January 2024  
**API Version**: v1  
**Base URL**: `http://localhost:8000/api/v1`  
**Authentication**: Required for all endpoints  
**Payment Provider**: Stripe  
**Currency**: SAR (Saudi Riyal)  
**Available Routes**: `/api/v1/auth`, `/api/v1/products`, `/api/v1/cart`, `/api/v1/coupons`, `/api/v1/orders`, `/api/v1/payments`, `/api/v1/analytics`, `/api/v1/contact` 