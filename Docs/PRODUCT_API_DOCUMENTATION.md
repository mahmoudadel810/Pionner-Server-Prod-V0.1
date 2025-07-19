# Product API Documentation

## Base URL
```
http://localhost:3000/api/v1/product
```

## Authentication
- **  Token**: Required for admin operations
- **Public Access**: Available for product viewing operations

---

## Endpoints

### 1. Get All Products
**GET** `/getProducts`

**Description**: Retrieve all products with pagination, filtering, and sorting options.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `sort` (optional): Sort field (name, price, createdAt, updatedAt)
- `order` (optional): Sort order (asc, desc, default: desc)
- `search` (optional): Search in product name and description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `category` (optional): Filter by category
- `inStock` (optional): Filter by stock availability (true/false)

**Response**:
```json
{
  "status": "success",
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "iPhone 15 Pro",
        "description": "Latest iPhone with advanced features",
        "price": 999.99,
        "category": "Electronics",
        "images": [
          "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro.jpg"
        ],
        "stock": 50,
        "isFeatured": true,
        "isRecommended": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Invalid query parameters",
  "errors": [
    {
      "field": "limit",
      "message": "Limit must be between 1 and 50"
    }
  ]
}
```

---

### 2. Get Featured Products
**GET** `/getFeaturedProducts`

**Description**: Retrieve all featured products.

**Response**:
```json
{
  "status": "success",
  "message": "Featured products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "iPhone 15 Pro",
        "description": "Latest iPhone with advanced features",
        "price": 999.99,
        "category": "Electronics",
        "images": [
          "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro.jpg"
        ],
        "stock": 50,
        "isFeatured": true,
        "isRecommended": false
      }
    ]
  }
}
```

---

### 3. Get Recommended Products
**GET** `/getRecommendedProducts`

**Description**: Retrieve all recommended products.

**Response**:
```json
{
  "status": "success",
  "message": "Recommended products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Samsung Galaxy S24",
        "description": "Premium Android smartphone",
        "price": 899.99,
        "category": "Electronics",
        "images": [
          "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/galaxys24.jpg"
        ],
        "stock": 30,
        "isFeatured": false,
        "isRecommended": true
      }
    ]
  }
}
```

---

### 4. Get Products by Category
**GET** `/getProductsByCategory/:category`

**Description**: Retrieve products filtered by specific category.

**Path Parameters**:
- `category` (required): Product category (string)

**Response**:
```json
{
  "status": "success",
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "iPhone 15 Pro",
        "description": "Latest iPhone with advanced features",
        "price": 999.99,
        "category": "Electronics",
        "images": [
          "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro.jpg"
        ],
        "stock": 50,
        "isFeatured": true,
        "isRecommended": false
      }
    ]
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Category is required"
}
```

---

### 5. Create Product (Single Image)
**POST** `/createProduct`

**Description**: Create a new product with single image upload (Admin only).

**Headers**:
```
Authorization:   <admin_token>
Content-Type: multipart/form-data
```

**Form Data**:
- `name` (required): Product name (string, 3-100 characters)
- `description` (required): Product description (string, 10-1000 characters)
- `price` (required): Product price (number, min: 0)
- `category` (required): Product category (string, 2-50 characters)
- `stock` (required): Stock quantity (number, min: 0)
- `image` (required): Product image file (jpeg, jpg, png, webp, max: 5MB)

**Response**:
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced features",
      "price": 999.99,
      "category": "Electronics",
      "images": [
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro.jpg"
      ],
      "stock": 50,
      "isFeatured": false,
      "isRecommended": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses**:
```json
{
  "status": "error",
  "message": "Unauthorized access",
  "error": "Only admins can create products"
}
```

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Product name is required and must be between 3 and 100 characters"
    },
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

---

### 6. Create Product (Multiple Images)
**POST** `/createProductWithImages`

**Description**: Create a new product with multiple image uploads (Admin only).

**Headers**:
```
Authorization:   <admin_token>
Content-Type: multipart/form-data
```

**Form Data**:
- `name` (required): Product name (string, 3-100 characters)
- `description` (required): Product description (string, 10-1000 characters)
- `price` (required): Product price (number, min: 0)
- `category` (required): Product category (string, 2-50 characters)
- `stock` (required): Stock quantity (number, min: 0)
- `images` (required): Product image files (jpeg, jpg, png, webp, max: 10 files, 5MB each)

**Response**:
```json
{
  "status": "success",
  "message": "Product created successfully with multiple images",
  "data": {
    "product": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced features",
      "price": 999.99,
      "category": "Electronics",
      "images": [
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro_1.jpg",
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro_2.jpg",
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro_3.jpg"
      ],
      "stock": 50,
      "isFeatured": false,
      "isRecommended": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 7. Upload Product Image
**POST** `/uploadProductImage/:id`

**Description**: Upload a single image for an existing product (Admin only).

**Headers**:
```
Authorization:   <admin_token>
Content-Type: multipart/form-data
```

**Path Parameters**:
- `id` (required): Product ID (valid MongoDB ObjectId)

**Form Data**:
- `image` (required): Product image file (jpeg, jpg, png, webp, max: 5MB)

**Response**:
```json
{
  "status": "success",
  "message": "Product image uploaded successfully",
  "data": {
    "product": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced features",
      "price": 999.99,
      "category": "Electronics",
      "images": [
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro.jpg",
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro_new.jpg"
      ],
      "stock": 50,
      "isFeatured": false,
      "isRecommended": false,
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Product not found",
  "error": "No product found with this ID"
}
```

---

### 8. Upload Multiple Product Images
**POST** `/uploadProductImages/:id`

**Description**: Upload multiple images for an existing product (Admin only).

**Headers**:
```
Authorization:   <admin_token>
Content-Type: multipart/form-data
```

**Path Parameters**:
- `id` (required): Product ID (valid MongoDB ObjectId)

**Form Data**:
- `images` (required): Product image files (jpeg, jpg, png, webp, max: 10 files, 5MB each)

**Response**:
```json
{
  "status": "success",
  "message": "Product images uploaded successfully",
  "data": {
    "product": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced features",
      "price": 999.99,
      "category": "Electronics",
      "images": [
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro.jpg",
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro_1.jpg",
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro_2.jpg"
      ],
      "stock": 50,
      "isFeatured": false,
      "isRecommended": false,
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  }
}
```

---

### 9. Delete Product
**DELETE** `/deleteProduct/:id`

**Description**: Delete a product (Admin only).

**Headers**:
```
Authorization:   <admin_token>
```

**Path Parameters**:
- `id` (required): Product ID (valid MongoDB ObjectId)

**Response**:
```json
{
  "status": "success",
  "message": "Product deleted successfully",
  "data": {
    "product": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced features",
      "price": 999.99,
      "category": "Electronics",
      "images": [
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro.jpg"
      ],
      "stock": 50,
      "isFeatured": false,
      "isRecommended": false
    }
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Product not found",
  "error": "No product found with this ID"
}
```

---

### 10. Toggle Featured Product
**PATCH** `/toggleFeaturedProduct/:id`

**Description**: Toggle the featured status of a product (Admin only).

**Headers**:
```
Authorization:   <admin_token>
```

**Path Parameters**:
- `id` (required): Product ID (valid MongoDB ObjectId)

**Response**:
```json
{
  "status": "success",
  "message": "Product featured status updated successfully",
  "data": {
    "product": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced features",
      "price": 999.99,
      "category": "Electronics",
      "images": [
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/iphone15pro.jpg"
      ],
      "stock": 50,
      "isFeatured": true,
      "isRecommended": false,
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  }
}
```

---

## Validation Rules

### Product Creation/Update Validation
```javascript
{
  name: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 100,
    trim: true
  },
  description: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 1000,
    trim: true
  },
  price: {
    type: 'number',
    required: true,
    min: 0
  },
  category: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 50,
    trim: true
  },
  stock: {
    type: 'number',
    required: true,
    min: 0
  }
}
```

### Query Parameters Validation
```javascript
{
  page: {
    type: 'number',
    optional: true,
    min: 1,
    default: 1
  },
  limit: {
    type: 'number',
    optional: true,
    min: 1,
    max: 50,
    default: 10
  },
  sort: {
    type: 'string',
    optional: true,
    enum: ['name', 'price', 'createdAt', 'updatedAt'],
    default: 'createdAt'
  },
  order: {
    type: 'string',
    optional: true,
    enum: ['asc', 'desc'],
    default: 'desc'
  },
  search: {
    type: 'string',
    optional: true,
    minLength: 1,
    maxLength: 100
  },
  minPrice: {
    type: 'number',
    optional: true,
    min: 0
  },
  maxPrice: {
    type: 'number',
    optional: true,
    min: 0
  },
  category: {
    type: 'string',
    optional: true,
    minLength: 2,
    maxLength: 50
  },
  inStock: {
    type: 'boolean',
    optional: true
  }
}
```

### Image Upload Validation
- **File Types**: jpeg, jpg, png, webp
- **Max File Size**: 5MB per image
- **Max Files**: 10 images for multiple upload
- **Required**: At least one image for product creation

---

## Error Handling

### Common Error Codes
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (product not found)
- `413`: Payload Too Large (file too large)
- `415`: Unsupported Media Type (invalid file type)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

---

## Testing with Postman

### Environment Variables
```
BASE_URL: http://localhost:3000/api/v1
ADMIN_TOKEN: <your_admin_jwt_token>
USER_TOKEN: <your_user_jwt_token>
```

### Test Data

#### Sample Product Data
```json
{
  "name": "iPhone 15 Pro Max",
  "description": "The most advanced iPhone ever with titanium design, A17 Pro chip, and pro camera system",
  "price": 1199.99,
  "category": "Electronics",
  "stock": 25
}
```

#### Sample Search Queries
```
# Basic search
?search=iphone

# Price range
?minPrice=500&maxPrice=1500

# Category filter
?category=Electronics

# Stock filter
?inStock=true

# Combined filters
?search=phone&category=Electronics&minPrice=500&maxPrice=1500&inStock=true&sort=price&order=asc&page=1&limit=20
```

### Postman Collection Setup

#### 1. Get All Products
```
GET {{BASE_URL}}/product/getProducts
```

#### 2. Create Product (Single Image)
```
POST {{BASE_URL}}/product/createProduct
Headers:
  Authorization:   {{ADMIN_TOKEN}}
Body: form-data
  name: iPhone 15 Pro
  description: Latest iPhone with advanced features
  price: 999.99
  category: Electronics
  stock: 50
  image: [file]
```

#### 3. Create Product (Multiple Images)
```
POST {{BASE_URL}}/product/createProductWithImages
Headers:
  Authorization:   {{ADMIN_TOKEN}}
Body: form-data
  name: iPhone 15 Pro
  description: Latest iPhone with advanced features
  price: 999.99
  category: Electronics
  stock: 50
  images: [files]
```

#### 4. Upload Product Image
```
POST {{BASE_URL}}/product/uploadProductImage/{{PRODUCT_ID}}
Headers:
  Authorization:   {{ADMIN_TOKEN}}
Body: form-data
  image: [file]
```

#### 5. Delete Product
```
DELETE {{BASE_URL}}/product/deleteProduct/{{PRODUCT_ID}}
Headers:
  Authorization:   {{ADMIN_TOKEN}}
```

#### 6. Toggle Featured Product
```
PATCH {{BASE_URL}}/product/toggleFeaturedProduct/{{PRODUCT_ID}}
Headers:
  Authorization:   {{ADMIN_TOKEN}}
```

---

## Frontend Integration Examples

### JavaScript (Fetch API)

#### Get All Products
```javascript
const getProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = `http://localhost:3000/api/v1/product/getProducts?${queryString}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Usage examples
const products = await getProducts();
const filteredProducts = await getProducts({
  category: 'Electronics',
  minPrice: 500,
  maxPrice: 1500,
  sort: 'price',
  order: 'asc'
});
```

#### Create Product
```javascript
const createProduct = async (productData, imageFile) => {
  const formData = new FormData();
  
  // Add product data
  Object.keys(productData).forEach(key => {
    formData.append(key, productData[key]);
  });
  
  // Add image file
  formData.append('image', imageFile);
  
  try {
    const response = await fetch('http://localhost:3000/api/v1/product/createProduct', {
      method: 'POST',
      headers: {
        'Authorization': `  ${localStorage.getItem('adminToken')}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data.product;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Usage
const newProduct = await createProduct({
  name: 'iPhone 15 Pro',
  description: 'Latest iPhone with advanced features',
  price: 999.99,
  category: 'Electronics',
  stock: 50
}, imageFile);
```

#### Upload Multiple Images
```javascript
const createProductWithImages = async (productData, imageFiles) => {
  const formData = new FormData();
  
  // Add product data
  Object.keys(productData).forEach(key => {
    formData.append(key, productData[key]);
  });
  
  // Add multiple image files
  imageFiles.forEach(file => {
    formData.append('images', file);
  });
  
  try {
    const response = await fetch('http://localhost:3000/api/v1/product/createProductWithImages', {
      method: 'POST',
      headers: {
        'Authorization': `  ${localStorage.getItem('adminToken')}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data.product;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error creating product with images:', error);
    throw error;
  }
};
```

### React Integration

#### Product List Component
```jsx
import React, { useState, useEffect } from 'react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'createdAt',
    order: 'desc'
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = Object.entries(filters)
        .filter(([_, value]) => value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      const response = await fetch(`http://localhost:3000/api/v1/product/getProducts?${queryParams}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setProducts(data.data.products);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Books">Books</option>
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
        />
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <img src={product.images[0]} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="price">${product.price}</p>
            <p className="stock">Stock: {product.stock}</p>
            {product.isFeatured && <span className="featured">Featured</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
```

#### Product Creation Form
```jsx
import React, { useState } from 'react';

const CreateProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // Add product data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Add image
      if (image) {
        formDataToSend.append('image', image);
      }

      const response = await fetch('http://localhost:3000/api/v1/product/createProduct', {
        method: 'POST',
        headers: {
          'Authorization': `  ${localStorage.getItem('adminToken')}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert('Product created successfully!');
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: ''
        });
        setImage(null);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-product-form">
      <h2>Create New Product</h2>
      
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="name">Product Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          minLength={3}
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          minLength={10}
          maxLength={1000}
          rows={4}
        />
      </div>

      <div className="form-group">
        <label htmlFor="price">Price</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          required
          min={0}
          step={0.01}
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
          minLength={2}
          maxLength={50}
        />
      </div>

      <div className="form-group">
        <label htmlFor="stock">Stock</label>
        <input
          type="number"
          id="stock"
          name="stock"
          value={formData.stock}
          onChange={handleInputChange}
          required
          min={0}
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Product Image</label>
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleImageChange}
          required
          accept="image/jpeg,image/jpg,image/png,image/webp"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
};

export default CreateProductForm;
```

### Vue.js Integration

#### Product List Component
```vue
<template>
  <div class="product-list">
    <div class="filters">
      <input
        v-model="filters.search"
        type="text"
        placeholder="Search products..."
        @input="handleFilterChange"
      />
      <select v-model="filters.category" @change="handleFilterChange">
        <option value="">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Clothing">Clothing</option>
        <option value="Books">Books</option>
      </select>
      <input
        v-model="filters.minPrice"
        type="number"
        placeholder="Min Price"
        @input="handleFilterChange"
      />
      <input
        v-model="filters.maxPrice"
        type="number"
        placeholder="Max Price"
        @input="handleFilterChange"
      />
    </div>

    <div v-if="loading" class="loading">Loading products...</div>
    <div v-else-if="error" class="error">Error: {{ error }}</div>
    <div v-else class="products-grid">
      <div
        v-for="product in products"
        :key="product._id"
        class="product-card"
      >
        <img :src="product.images[0]" :alt="product.name" />
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <p class="price">${{ product.price }}</p>
        <p class="stock">Stock: {{ product.stock }}</p>
        <span v-if="product.isFeatured" class="featured">Featured</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductList',
  data() {
    return {
      products: [],
      loading: true,
      error: null,
      filters: {
        page: 1,
        limit: 10,
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        sort: 'createdAt',
        order: 'desc'
      }
    };
  },
  async mounted() {
    await this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        this.loading = true;
        const queryParams = Object.entries(this.filters)
          .filter(([_, value]) => value !== '')
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&');
        
        const response = await fetch(`http://localhost:3000/api/v1/product/getProducts?${queryParams}`);
        const data = await response.json();
        
        if (data.status === 'success') {
          this.products = data.data.products;
        } else {
          this.error = data.message;
        }
      } catch (error) {
        this.error = 'Failed to fetch products';
      } finally {
        this.loading = false;
      }
    },
    
    handleFilterChange() {
      this.filters.page = 1; // Reset to first page
      this.fetchProducts();
    }
  }
};
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.filters input,
.filters select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.product-card h3 {
  margin: 10px 0;
  color: #333;
}

.product-card .price {
  font-weight: bold;
  color: #e74c3c;
  font-size: 1.2em;
}

.product-card .stock {
  color: #666;
  font-size: 0.9em;
}

.product-card .featured {
  background-color: #f39c12;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

.loading,
.error {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
}

.error {
  color: #e74c3c;
}
</style>
```

---

## Notes for Frontend Developers

### Image Handling
1. **File Validation**: Ensure uploaded images are jpeg, jpg, png, or webp format
2. **File Size**: Maximum 5MB per image
3. **Multiple Images**: Use `createProductWithImages` endpoint for multiple image uploads
4. **Image Display**: Always check if `product.images` array exists and has items before displaying

### Error Handling
1. **Network Errors**: Implement proper error handling for network failures
2. **Validation Errors**: Display field-specific validation errors to users
3. **Authentication**: Handle 401/403 errors by redirecting to login
4. **File Upload Errors**: Show specific error messages for file size/type issues

### Performance Optimization
1. **Pagination**: Implement proper pagination controls
2. **Image Optimization**: Use Cloudinary's transformation parameters for responsive images
3. **Caching**: Cache product data where appropriate
4. **Lazy Loading**: Implement lazy loading for product images

### Security Considerations
1. **Token Storage**: Store JWT tokens securely (httpOnly cookies recommended)
2. **File Upload**: Validate file types and sizes on frontend before upload
3. **Input Sanitization**: Sanitize user inputs before sending to API
4. **HTTPS**: Use HTTPS in production for secure data transmission

### Best Practices
1. **Loading States**: Show loading indicators during API calls
2. **Error Boundaries**: Implement error boundaries for React components
3. **Form Validation**: Validate forms on frontend before submission
4. **Responsive Design**: Ensure product cards work well on all screen sizes
5. **Accessibility**: Add proper ARIA labels and keyboard navigation

---

**Last Updated**: January 2024  
**API Version**: v1  
**Base URL**: `http://localhost:3000/api/v1`  
**Available Routes**: `/api/v1/auth`, `/api/v1/products`, `/api/v1/cart`, `/api/v1/coupons`, `/api/v1/orders`, `/api/v1/payments`, `/api/v1/analytics`, `/api/v1/contact` 