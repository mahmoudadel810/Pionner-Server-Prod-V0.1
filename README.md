# TheShop E-commerce Backend API

A robust Node.js/Express.js backend API for a comprehensive e-commerce platform with authentication, product management, order processing, payment integration, and analytics.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Usage](#usage)
- [Development](#development)
- [Deployment](#deployment)

## Overview

TheShop Backend API provides a complete e-commerce solution with secure authentication, product catalog management, shopping cart functionality, order processing, payment integration with Stripe, coupon system, contact management, and comprehensive analytics.

## Features

- **Authentication & Authorization**: JWT-based authentication with email confirmation
- **Product Management**: CRUD operations for products with image upload via Cloudinary
- **Shopping Cart**: Session-based cart management with Redis
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Stripe payment processing
- **Coupon System**: Discount and promotional code management
- **Contact Management**: Customer support and inquiry handling
- **Analytics**: Sales and performance metrics
- **Security**: Rate limiting, input validation, and security headers
- **Performance**: Compression, caching, and optimization

## Technology Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer with Cloudinary
- **Payment**: Stripe API
- **Email**: Nodemailer
- **Caching**: Redis with ioredis
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: Joi
- **Rate Limiting**: express-rate-limit
- **Development**: Nodemon

## Project Structure

```
Server/
├── App/
│   └── initApp.js              # Application initialization
├── config/                     # Configuration files
├── DB/
│   ├── connection.js           # Database connection
│   └── models/                 # MongoDB models
│       ├── userModel.js
│       ├── productModel.js
│       ├── orderModel.js
│       ├── couponModel.js
│       └── contactUs.js
├── middlewares/
│   ├── auth.js                 # Authentication middleware
│   ├── validation.js           # Input validation
│   └── rateLimit.js            # Rate limiting
├── modules/                    # Feature modules
│   ├── Auth/                   # Authentication routes & controllers
│   ├── Product/                # Product management
│   ├── Cart/                   # Shopping cart
│   ├── Order/                  # Order processing
│   ├── Payment/                # Payment integration
│   ├── Coupon/                 # Coupon system
│   ├── Analytics/              # Analytics & reporting
│   ├── ContactUs/              # Contact management
│   └── indexRoutes.js          # Route aggregation
├── service/
│   ├── cloudinary.js           # Cloudinary configuration
│   └── sendEmail.js            # Email service
├── utils/
│   ├── errorHandler.js         # Global error handling
│   ├── multer.js               # File upload configuration
│   ├── pagination.js           # Pagination utilities
│   ├── redis.js                # Redis configuration
│   ├── stripe.js               # Stripe configuration
│   └── tokenFunction.js        # JWT utilities
├── Docs/                       # API documentation
└── index.js                    # Application entry point
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp config/.env.example config/.env
   ```

4. **Configure environment variables** (see Environment Configuration section)

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Environment Configuration

Create a `.env` file in the `config/` directory with the following variables:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/theshop

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Client URL
CLIENT_URL=http://localhost:3000
```

## API Documentation

The API is organized into the following modules, each with comprehensive documentation:

### Base URL
```
Development: http://localhost:8000/api/v1
Production: https://your-domain.com/api/v1
```

### Available Modules

1. **Authentication** (`/auth`)
   - User registration and login
   - Email confirmation
   - Password reset
   - Profile management

2. **Products** (`/products`)
   - Product CRUD operations
   - Image upload and management
   - Product search and filtering
   - Category management

3. **Cart** (`/cart`)
   - Add/remove items
   - Update quantities
   - Cart retrieval and management

4. **Orders** (`/orders`)
   - Order creation and management
   - Order status tracking
   - Order history

5. **Payments** (`/payments`)
   - Stripe payment processing
   - Payment confirmation
   - Refund handling

6. **Coupons** (`/coupons`)
   - Coupon creation and validation
   - Discount application
   - Coupon management

7. **Analytics** (`/analytics`)
   - Sales reports
   - Performance metrics
   - Data visualization

8. **Contact** (`/contact`)
   - Customer inquiries
   - Support ticket management
   - Contact form processing

For detailed API documentation, see the individual documentation files in the `Docs/` folder:
- `AUTH_API_DOCUMENTATION.md`
- `PRODUCT_API_DOCUMENTATION.md`
- `ORDER_API_DOCUMENTATION.md`
- `PAYMENT_API_DOCUMENTATION.md`
- `COUPON_API_DOCUMENTATION.md`
- `ANALYTICS_API_DOCUMENTATION.md`
- `CONTACT_API_DOCUMENTATION.md`

## Usage

### Health Check

```bash
GET /api/v1/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running and healthy!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "port": 8000,
  "availableRoutes": ["/api/v1/auth", "/api/v1/products", ...]
}
```

### Authentication Example

```bash
# Register a new user
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}

# Login
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

## Development

### Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm run build`: Install dependencies for production

### Development Guidelines

1. **Code Style**: Follow existing patterns and naming conventions
2. **Validation**: Use Joi schemas for input validation
3. **Error Handling**: Use centralized error handling
4. **Security**: Implement proper authentication and authorization
5. **Testing**: Add tests for new features

### Database Models

The application uses MongoDB with Mongoose ODM. Key models include:
- User: Authentication and profile data
- Product: Product catalog and inventory
- Order: Order processing and tracking
- Coupon: Discount and promotional codes
- ContactUs: Customer inquiries and support

## Deployment

### Production Setup

1. **Environment Configuration**
   - Set `NODE_ENV=production`
   - Configure production database URLs
   - Set up production API keys

2. **Security Considerations**
   - Use strong JWT secrets
   - Configure CORS properly
   - Enable rate limiting
   - Set up SSL/TLS

3. **Performance Optimization**
   - Enable compression
   - Configure Redis caching
   - Set up CDN for static assets
   - Monitor application performance

### Deployment Options

- **Heroku**: Use Procfile and environment variables
- **AWS**: Deploy to EC2 or use Elastic Beanstalk
- **Docker**: Containerize the application
- **VPS**: Traditional server deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please refer to the API documentation in the `Docs/` folder or contact the development team.
