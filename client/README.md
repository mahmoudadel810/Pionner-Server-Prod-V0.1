# ElectroShop Frontend

A modern React e-commerce frontend application built with Vite, Tailwind CSS, and Zustand for state management.

## 🚀 Features

- **Modern UI/UX**: Built with Tailwind CSS and shadcn/ui components
- **State Management**: Zustand for efficient state management
- **API Integration**: Centralized API service layer with axios
- **Authentication**: JWT-based authentication with automatic token refresh
- **Shopping Cart**: Real-time cart management with persistence
- **Wishlist**: Product wishlist functionality
- **Payment Integration**: Stripe payment processing
- **Responsive Design**: Mobile-first responsive design
- **Performance**: Lazy loading and code splitting

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd client
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # API Configuration
   VITE_API_URL=https://pionner-server-prod-v0-1.onrender.com/api/v1
   
   # App Configuration
   VITE_APP_NAME=ElectroShop
   VITE_APP_VERSION=1.0.0
   
   # Feature Flags
   VITE_ENABLE_ANALYTICS=true
   VITE_ENABLE_DEBUG_LOGGING=false
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

## 🔧 API Configuration

The application uses a centralized API service layer located in `src/lib/api.js`. All API calls are routed through this service, which provides:

### Base Configuration
- **Production URL**: `https://pionner-server-prod-v0-1.onrender.com/api/v1`
- **Development URL**: Configurable via `VITE_API_URL` environment variable
- **Timeout**: 10 seconds
- **Credentials**: Included for session management

### Authentication
- Automatic token refresh on 401 errors
- JWT token management
- Automatic logout on authentication failures

### API Endpoints

#### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset
- `POST /auth/confirm-email/:token` - Email confirmation
- `GET /auth/me` - Get current user
- `POST /auth/refresh-token` - Refresh access token

#### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products/createProduct` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/deleteProduct/:id` - Delete product (admin)
- `PATCH /products/toggleFeaturedProduct/:id` - Toggle featured status
- `GET /products/getFeaturedProducts` - Get featured products
- `GET /products/getBestsellerProducts` - Get bestseller products
- `GET /products/getNewProducts` - Get new products
- `GET /products/getSaleProducts` - Get sale products
- `GET /products/getProductsByCategory/:category` - Get products by category
- `GET /products/search/:query` - Search products

#### Categories
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `GET /categories/:id/products` - Get products by category

#### Cart
- `GET /cart` - Get cart items
- `POST /cart/add` - Add item to cart
- `PUT /cart/:id` - Update cart item
- `DELETE /cart/:id` - Remove item from cart
- `DELETE /cart` - Clear cart

#### Wishlist
- `GET /wishlist` - Get wishlist items
- `POST /wishlist/add` - Add item to wishlist
- `DELETE /wishlist/:id` - Remove item from wishlist
- `DELETE /wishlist` - Clear wishlist

#### Orders
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create order
- `PUT /orders/:id/cancel` - Cancel order

#### Payments
- `POST /payments/createCheckoutSession` - Create Stripe checkout session
- `POST /payments/checkoutSuccess` - Handle successful payment
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/confirm` - Confirm payment
- `POST /payments/webhook` - Stripe webhook handler

#### User Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /profile/change-password` - Change password

#### Contact
- `POST /contact` - Submit contact form

#### Coupons
- `GET /coupons/getCoupon` - Get available coupons
- `POST /coupons/validateCoupon` - Validate coupon code

#### Analytics (Admin)
- `GET /analytics/stats` - Get analytics statistics
- `GET /analytics/sales` - Get sales data
- `GET /analytics/products` - Get product analytics

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── lib/                # Utility libraries
│   ├── api.js          # Centralized API service
│   ├── axios.js        # Axios configuration
│   └── utils.js        # Utility functions
├── stores/             # Zustand stores
│   ├── useUserStore.js     # User authentication
│   ├── useProductStore.js  # Product management
│   ├── useCartStore.js     # Shopping cart
│   ├── useWishlistStore.js # Wishlist
│   └── usePaymentStore.js  # Payment processing
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── data/               # Static data and mock data
└── assets/             # Static assets
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://pionner-server-prod-v0-1.onrender.com/api/v1` |
| `VITE_APP_NAME` | Application name | `ElectroShop` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `true` |
| `VITE_ENABLE_DEBUG_LOGGING` | Enable debug logging | `false` |

## 🚀 Deployment

### Build for Production
```bash
pnpm build
```

### Preview Production Build
```bash
pnpm preview
```

### Deploy to Vercel
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify
1. Connect your repository to Netlify
2. Set build command: `pnpm build`
3. Set publish directory: `dist`
4. Set environment variables in Netlify dashboard

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### Code Style

- ESLint configuration in `eslint.config.js`
- Prettier configuration for code formatting
- Consistent import ordering
- TypeScript-like JSDoc comments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.