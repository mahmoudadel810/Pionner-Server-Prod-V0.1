# Category Feature Documentation

## Overview

The Category feature provides a comprehensive system for organizing products into categories with full CRUD operations, search, filtering, and pagination capabilities.

## Backend Implementation

### Database Models

#### Category Model (`Server/DB/models/categoryModel.js`)

```javascript
{
  name: String (required, unique, 2-50 chars),
  description: String (required, 10-500 chars),
  image: String (required, Cloudinary URL),
  slug: String (auto-generated, unique),
  isActive: Boolean (default: true),
  productCount: Number (default: 0),
  featured: Boolean (default: false),
  order: Number (default: 0),
  timestamps: true
}
```

#### Product Model Updates

Added `categoryId` field to link products to categories:
```javascript
categoryId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category',
  required: true
}
```

### API Endpoints

#### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories` | Get all categories with pagination, search, filtering |
| GET | `/api/v1/categories/featured` | Get featured categories |
| GET | `/api/v1/categories/:id` | Get category by ID |
| GET | `/api/v1/categories/slug/:slug` | Get category by slug |
| GET | `/api/v1/categories/:id/products` | Get products by category ID |
| GET | `/api/v1/categories/slug/:slug/products` | Get products by category slug |

#### Admin Routes (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/categories` | Create new category |
| PUT | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete category |
| PATCH | `/api/v1/categories/:id/toggle-status` | Toggle category status |

### Query Parameters

#### Categories Endpoint
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in name and description
- `featured`: Filter by featured status ("true"/"false")
- `sortBy`: Sort field (name, order, createdAt, productCount)
- `sortOrder`: Sort direction (asc/desc)

#### Products by Category Endpoint
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Sort field (name, price, createdAt)
- `sortOrder`: Sort direction (asc/desc)

### Features

1. **Redis Caching**: Categories are cached for 1 hour
2. **Image Upload**: Cloudinary integration for category images
3. **Slug Generation**: Auto-generated SEO-friendly URLs
4. **Product Count**: Automatic aggregation of products per category
5. **Soft Delete**: Categories can be deactivated instead of deleted
6. **Validation**: Comprehensive input validation
7. **Error Handling**: Proper error responses with status codes

## Frontend Implementation

### Pages

#### CategoriesPage (`Client/src/pages/CategoriesPage.jsx`)

Features:
- Grid and list view modes
- Search functionality
- Sorting options (name, product count, date)
- Featured filter
- Responsive design
- Loading states and error handling
- Smooth animations with Framer Motion

#### CategoryProductsPage (`Client/src/pages/CategoryProductsPage.jsx`)

Features:
- Display products for specific category
- Product cards with category badges
- Add to cart functionality
- Wishlist integration
- Search and sorting
- Pagination
- Grid and list view modes

### Components

#### ProductCard Updates
- Shows category name as badge
- Displays category information prominently
- Maintains existing functionality (cart, wishlist, etc.)

### Routing

```javascript
// App.jsx routes
<Route path="/categories" element={<CategoriesPage />} />
<Route path="/categories/:id/products" element={<CategoryProductsPage />} />
```

### Navigation

Updated Navbar to include "Categories" link in the main navigation.

## User Journey & Lifecycle

### 1. Category Discovery
1. User visits `/categories` from navbar
2. Views all available categories in grid/list format
3. Can search, sort, and filter categories
4. Sees product count and featured status for each category

### 2. Category Exploration
1. User clicks on a category card
2. Navigates to `/categories/:id/products`
3. Views category details and all products in that category
4. Can search and sort products within the category
5. Products display their category information

### 3. Product Interaction
1. User can add products to cart from category page
2. User can add/remove products from wishlist
3. User can click on products to view details
4. Category information is visible on product cards

### 4. Admin Management (Backend)
1. Admin creates categories via API
2. Uploads category images to Cloudinary
3. Manages category status (active/inactive)
4. Sets featured status and display order
5. Can delete categories (with product count validation)

## API Response Examples

### Get All Categories
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Electronics",
        "description": "Latest electronic devices and gadgets",
        "image": "https://res.cloudinary.com/...",
        "slug": "electronics",
        "isActive": true,
        "productCount": 25,
        "featured": true,
        "order": 1
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "limit": 10
    }
  }
}
```

### Get Products by Category
```json
{
  "success": true,
  "message": "25 products found in Electronics category",
  "data": {
    "data": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "iPhone 15 Pro",
        "description": "Latest iPhone with advanced features",
        "price": 999.99,
        "image": "https://res.cloudinary.com/...",
        "category": "Electronics",
        "categoryId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "name": "Electronics",
          "slug": "electronics"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "limit": 12
    }
  },
  "category": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Electronics",
    "description": "Latest electronic devices and gadgets",
    "image": "https://res.cloudinary.com/...",
    "slug": "electronics"
  }
}
```

## Security & Validation

### Input Validation
- Category name: 2-50 characters, unique
- Description: 10-500 characters
- Image: Required, Cloudinary URL
- Featured: Boolean
- Order: Number >= 0

### Authorization
- Public routes: No authentication required
- Admin routes: Admin role required
- JWT token validation for protected routes

### Data Protection
- SQL injection prevention via Mongoose
- XSS protection via input sanitization
- File upload validation for images
- Rate limiting on all endpoints

## Performance Optimizations

1. **Redis Caching**: Categories cached for 1 hour
2. **Pagination**: Efficient data loading
3. **Image Optimization**: Cloudinary CDN
4. **Database Indexing**: On name, slug, featured fields
5. **Lazy Loading**: React components loaded on demand
6. **Debounced Search**: Prevents excessive API calls

## Error Handling

### Common Error Responses
- 400: Validation errors
- 401: Unauthorized access
- 403: Forbidden (admin only)
- 404: Category/Product not found
- 409: Category name already exists
- 500: Server errors

### Frontend Error States
- Loading skeletons
- Error messages with retry options
- Empty state handling
- Network error recovery

## Testing Considerations

### Backend Testing
- Unit tests for controllers
- Integration tests for routes
- Database operation tests
- Image upload tests
- Cache functionality tests

### Frontend Testing
- Component rendering tests
- User interaction tests
- API integration tests
- Error handling tests
- Responsive design tests

## Deployment Notes

1. **Environment Variables**: Ensure Cloudinary and Redis configs
2. **Database Migration**: Update existing products with categoryId
3. **Image Assets**: Upload default category images
4. **Cache Warming**: Pre-populate Redis with categories
5. **Monitoring**: Set up logging for category operations

## Future Enhancements

1. **Category Hierarchy**: Parent-child category relationships
2. **Category Analytics**: View counts, conversion rates
3. **Bulk Operations**: Mass category updates
4. **Category Templates**: Predefined category structures
5. **SEO Optimization**: Meta tags, structured data
6. **Category Recommendations**: AI-powered suggestions 