# 🔐 TheShop Authentication API Documentation

## 📋 Table of Contents
- [Base URL & Headers](#base-url--headers)
- [Authentication Flow](#authentication-flow)
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

### Common Headers
```javascript
Content-Type: application/json
Authorization:   <access_token> // For protected routes
```

---

## 🔄 Authentication Flow

```
1. Signup → Email Confirmation → Login → Access Protected Routes
2. Forgot Password → Reset Password → Login
```

---

## 📡 API Endpoints

### 1. 🔍 Health Check
**GET** `/health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running and healthy!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "port": 8000,
  "availableRoutes": ["/api/v1/auth", "/api/v1/products", ...]
}
```

---

### 2. 📝 User Registration
**POST** `/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Validation Rules:**
- `name`: 2-50 characters
- `email`: Valid email format
- `phone`: Valid phone number
- `password`: Min 8 chars, uppercase, lowercase, number, symbol
- `confirmPassword`: Must match password

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user"
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
    "email": "Invalid email format",
    "password": "Password must contain at least one uppercase letter"
  }
}

// 400 - User Already Exists
{
  "success": false,
  "message": "User already exists"
}
```

---

### 3. ✅ Email Confirmation
**GET** `/auth/confirm-email/:token`

**URL Parameters:**
- `token`: JWT token from signup email

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email confirmed successfully, you can now logIn"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

---

### 4. 🔑 User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

**Cookies Set:**
- `accessToken`: 15 minutes expiration
- `refreshToken`: 7 days expiration

**Error Responses:**
```json
// 400 - Invalid Credentials
{
  "success": false,
  "message": "Invalid email or password"
}

// 400 - Email Not Confirmed
{
  "success": false,
  "message": "Please confirm your email before logging in"
}

// 400 - User Inactive
{
  "success": false,
  "message": "User not found or inactive"
}
```

---

### 5. 👤 Get User Profile
**GET** `/auth/profile`

**Headers Required:**
```javascript
Authorization:   <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "user",
    "profileImage": "https://cloudinary.com/image.jpg",
    "isConfirmed": true,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
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

### 6. 📸 Upload Profile Image
**POST** `/auth/upload-profile-image`

**Headers Required:**
```javascript
Authorization:   <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `image`: File (jpg, jpeg, png, gif, webp)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "profileImage": "https://cloudinary.com/new-image.jpg"
  }
}
```

**Error Responses:**
```json
// 400 - No File
{
  "success": false,
  "message": "No image file provided"
}

// 400 - Invalid File Type
{
  "success": false,
  "error": "Invalid file format. Allowed types: image/jpeg, image/png, image/gif, image/webp"
}
```

---

### 7. 🔄 Refresh Token
**POST** `/auth/refresh-token`

**Cookies Required:**
- `refreshToken`: Valid refresh token

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

**New Cookie Set:**
- `accessToken`: New 15-minute token

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

---

### 8. 🚪 User Logout
**POST** `/auth/logout`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
- `accessToken`
- `refreshToken`

---

### 9. 🔒 Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset code sent successfully to your email."
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found Check if your email is true"
}
```

---

### 10. 🔐 Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "code": "123456",
  "newPassword": "NewSecurePass123!",
  "confirmNewPassword": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

**Error Responses:**
```json
// 400 - Invalid Code
{
  "success": false,
  "message": "Invalid reset code"
}

// 400 - Expired Code
{
  "success": false,
  "message": "Reset code has expired. Please request a new password reset."
}

// 400 - Validation Error
{
  "success": false,
  "message": "Code, new password, and confirm password are required"
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
- `201` - Created
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Testing Data

### Valid Test Users
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+1234567890",
  "password": "TestPass123!",
  "confirmPassword": "TestPass123!"
}
```

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "phone": "+1987654321",
  "password": "AdminPass456!",
  "confirmPassword": "AdminPass456!"
}
```

### Password Examples
```javascript
// Valid passwords (8+ chars, uppercase, lowercase, number, symbol)
"SecurePass123!"
"AdminPass456!"
"MyPassword789@"

// Invalid passwords
"short"           // Too short
"nouppercase123!" // No uppercase
"NOLOWERCASE123!" // No lowercase
"NoNumbers!"      // No numbers
"NoSymbols123"    // No symbols
```

---

## 🔧 Frontend Integration Examples

### JavaScript/Fetch Example
```javascript
// Login example
const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store user data
      localStorage.setItem('user', JSON.stringify(data.data));
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Protected request example
const getProfile = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `  ${localStorage.getItem('accessToken')}`,
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Profile fetch failed:', error);
    throw error;
  }
};
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    // Implementation
  };

  const logout = async () => {
    // Implementation
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/v1/auth/profile', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, loading, login, logout };
};
```

---

## 📝 Notes for Frontend Developers

1. **Cookies**: All tokens are stored in HTTP-only cookies for security
2. **CORS**: Ensure `credentials: 'include'` is set for cookie handling
3. **Token Refresh**: Implement automatic token refresh using the refresh endpoint
4. **Error Handling**: Always check `success` field in responses
5. **Validation**: Client-side validation should match server-side rules
6. **File Upload**: Use `FormData` for image uploads
7. **Password Requirements**: Enforce password rules on frontend for better UX

---

## 🚀 Getting Started

1. **Test Health Check**: `GET /api/v1/health`
2. **Register User**: `POST /api/v1/auth/signup`
3. **Confirm Email**: Check email and click confirmation link
4. **Login**: `POST /api/v1/auth/login`
5. **Access Protected Routes**: Use returned access token

---

**Last Updated**: January 2024  
**API Version**: v1  
**Base URL**: `http://localhost:8000/api/v1`  
**Available Routes**: `/api/v1/auth`, `/api/v1/products`, `/api/v1/cart`, `/api/v1/coupons`, `/api/v1/orders`, `/api/v1/payments`, `/api/v1/analytics`, `/api/v1/contact` 