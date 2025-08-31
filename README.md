# TheShop Backend API - Production Ready

A robust, scalable Node.js + Express backend API for e-commerce applications, optimized for production deployment on Render.

## 🚀 Production Features

- **Security Hardened**: Helmet, CORS, rate limiting, input validation
- **Performance Optimized**: Compression, caching, efficient database queries
- **Production Logging**: Winston logger with structured logging
- **Error Handling**: Comprehensive error handling with no sensitive data leakage
- **Database Optimization**: Connection pooling, proper indexing
- **File Upload**: Secure Cloudinary integration
- **Payment Processing**: Stripe integration with webhook handling
- **Email Services**: Nodemailer integration
- **Caching**: Redis integration for improved performance

## 🛠️ Tech Stack

- **Runtime**: Node.js 22+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Caching**: Redis (optional)
- **File Storage**: Cloudinary
- **Payment**: Stripe
- **Email**: Nodemailer
- **Authentication**: JWT with refresh tokens
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- Redis (optional, for caching)
- Cloudinary account
- Stripe account
- Email service (Gmail, SendGrid, etc.)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd theshop-backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   ```bash
   cp config/production.env.example config/.env
   # Edit config/.env with your production values
   ```

4. **Start the server**
   ```bash
   # Development
   pnpm dev
   
   # Production
   pnpm start
   ```

## 🌐 Deployment on Render

### 1. Connect Your Repository
- Connect your GitHub repository to Render
- Select "Web Service" as the service type

### 2. Configure Environment Variables
Add these environment variables in Render dashboard:

```env
NODE_ENV=production
PORT=3000
MONGO_URI=your-mongodb-connection-string
ACCESS_TOKEN_SECRET=your-jwt-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-app-password
CLIENT_URL=https://your-frontend-domain.com
```

### 3. Build Configuration
- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`
- **Node Version**: 22.x

### 4. Auto-Deploy
- Enable auto-deploy from your main branch
- Render will automatically deploy on every push

## 📚 API Documentation

### Base URL
```
https://your-app-name.onrender.com/api/v1
```

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Product Endpoints
- `GET /products` - Get all products (with pagination)
- `GET /products/:id` - Get single product
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)

### Category Endpoints
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get single category
- `POST /categories` - Create category (admin only)
- `PUT /categories/:id` - Update category (admin only)
- `DELETE /categories/:id` - Delete category (admin only)

### Order Endpoints
- `GET /orders` - Get user orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get single order
- `PUT /orders/:id` - Update order status (admin only)

### Payment Endpoints
- `POST /payments/create-checkout-session` - Create Stripe checkout session
- `POST /payments/webhook` - Stripe webhook handler
- `GET /payments/status/:sessionId` - Get payment status

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: All inputs validated and sanitized
- **CORS Protection**: Configured for production domains
- **Helmet Security**: HTTP headers security
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Error Handling**: No sensitive data in error responses

## 📊 Monitoring & Logging

- **Structured Logging**: Winston logger with different levels
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Request/response logging
- **Health Checks**: `/api/v1/health` endpoint for monitoring

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "stack": "Stack trace (development only)"
}
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Server port | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `ACCESS_TOKEN_SECRET` | JWT access token secret | Yes |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `EMAIL_HOST` | SMTP host | Yes |
| `EMAIL_USER` | Email username | Yes |
| `EMAIL_PASS` | Email password | Yes |
| `CLIENT_URL` | Frontend URL | Yes |
| `REDIS_HOST` | Redis host (optional) | No |
| `REDIS_PORT` | Redis port (optional) | No |
| `REDIS_PASSWORD` | Redis password (optional) | No |

## 🧪 Testing

```bash
# Run tests (if configured)
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Production Ready** ✅ | **Security Hardened** ✅ | **Performance Optimized** ✅
