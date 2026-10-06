# Pionner Server

REST API for the Pionner online store: accounts, catalog, cart, wishlist, coupons, orders and Stripe payments.
The React client lives in a separate repository.

## Features

- Sign up with email confirmation, login with JWT access/refresh tokens (cookies or `Authorization` header)
- Password reset by emailed code, profile and profile-image updates
- Categories and products with search, pagination, featured items and Cloudinary image uploads
- Cart, wishlist and per-user coupons
- Orders with stock checks, status updates and admin analytics (sales, categories, top products)
- Stripe Checkout and Payment Intents, with a webhook for completed sessions
- Contact form stored in MongoDB with admin endpoints
- Role-based admin routes, rate limiting, Helmet and a CORS allow-list
- Optional Redis cache for featured products and categories

## Stack

Node.js 22, Express 4, MongoDB with Mongoose 8, Joi, JSON Web Tokens, Stripe, Cloudinary, Nodemailer, ioredis, Winston.

## Requirements

- Node.js 22
- A MongoDB database (local or Atlas)
- Optional: SMTP account, Cloudinary account, Stripe account, Redis

## Getting started

```bash
npm install
cp config/.env.example config/.env   # then fill in the values
npm run dev
```

The API listens on `PORT` (default 8000). `GET /health` reports the database, Redis and Cloudinary status.

Without SMTP settings in development, emails are not sent: the confirmation link and password reset code are
written to the server log so you can still finish the flow locally.

## Configuration

All variables are listed in [`config/.env.example`](config/.env.example).

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string (required) |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | JWT signing secrets (required) |
| `SALT_ROUNDS` | bcrypt cost factor |
| `CLIENT_URL`, `SERVER_URL` | Allowed CORS origins and links in emails |
| `CORS_ORIGINS` | Extra allowed origins, comma separated |
| `EMAIL_SERVICE`, `EMAIL_SMTP_PORT`, `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASS` | Outgoing email |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image uploads |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Payments |
| `UPSTASH_REDIS_URL` / `REDIS_URL` / `REDIS_HOST` | Optional cache |

## API overview

All routes are under `/api/v2`.

| Prefix | Description |
| --- | --- |
| `/auth` | signup, confirm-email, login, logout, refresh-token, profile, password reset, admin user management |
| `/categories` | list, featured, details, products of a category; admin create/update/delete |
| `/products` | list and search, suggestions, featured, recommended; admin create/update/stock/price/images |
| `/cart` | get, add, remove, update quantity |
| `/wishlist` | get, add, remove, clear, check, count |
| `/coupons` | current user's coupon and validation; admin create/update/delete/toggle |
| `/orders` | create, user orders, order details, cancel; admin status updates and analytics |
| `/payments` | Stripe checkout session, payment intent, success callbacks, webhook, status |
| `/analytics` | admin dashboard data and daily sales |
| `/contact` | public contact form; admin inbox |

## Project structure

```
App/          Express app setup (middleware, CORS, routes)
config/       environment loading and .env.example
DB/           Mongoose connection and models
middlewares/  auth, validation, rate limiting
modules/      one folder per feature: routes, controller, Joi validations
service/      email and Cloudinary helpers
utils/        logger, errors, Redis, Stripe, pagination, uploads
index.js      entry point (exports the app; listens when run locally)
```

## Deployment

The project deploys to Vercel as a single serverless function (`vercel.json` routes every path to `index.js`).
`index.js` exports the Express app and only calls `listen()` outside Vercel; the MongoDB connection is opened
lazily and reused between invocations. Set the variables from `config/.env.example` in the Vercel project
settings, with `NODE_ENV=production`, and point the Stripe webhook at `/api/v2/payments/webhook`.

## License

[MIT](LICENSE)
