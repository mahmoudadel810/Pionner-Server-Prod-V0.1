import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { errorHandler, notFound } from "../utils/errorHandler.js";
import connectDB from "../DB/connection.js";
import { initCloudinary } from "../service/cloudinary.js";
import * as AllRoutes from "../modules/indexRoutes.js";
import logger from "../utils/logger.js";
import { apiLimiter, authLimiter, paymentLimiter } from "../middlewares/rateLimit.js";
import { getHealthStatus } from "../utils/healthMonitor.js";

export const initApp = () =>
{
   // Load environment variables
   dotenv.config({
      path: path.resolve('./config/.env'),
      debug: false,
      safe: true
   });

   const app = express();
   const PORT = process.env.PORT || 3000;
   const isProduction = process.env.NODE_ENV === 'production';

   // Initialize critical services
   initializeServices();

   // Configure Express app
   configureSecurityMiddleware(app, isProduction);
   configureCORS(app, isProduction);
   configureBodyParsing(app);
   configureRateLimiting(app);
   configureRoutes(app);
   configureErrorHandling(app);

   // Start server
   const server = startServer(app, PORT);

   return { app, server };
};

// Service initialization
const initializeServices = () =>
{
   try
   {
      initCloudinary();
      logger.info('Cloudinary initialized successfully');
   } catch (error)
   {
      logger.warn('Cloudinary initialization failed:', error.message);
   }

   try
   {
      connectDB();
      logger.info('Database connected successfully');
   } catch (error)
   {
      logger.error('Database connection failed:', error.message);
      throw error;
   }
};

// Security middleware configuration
const configureSecurityMiddleware = (app, isProduction) =>
{
   // Trust proxy for production (needed for rate limiting behind load balancers)
   if (isProduction)
   {
      app.set('trust proxy', 1);
   }

   // Helmet security headers
   app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
   }));

   // Additional security headers for production
   if (isProduction)
   {
      app.use((req, res, next) =>
      {
         res.setHeader('X-Content-Type-Options', 'nosniff');
         res.setHeader('X-Frame-Options', 'DENY');
         res.setHeader('X-XSS-Protection', '1; mode=block');
         res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
         next();
      });
   }

   // Compression middleware
   app.use(compression({ level: 6 }));
};

// CORS configuration
const configureCORS = (app, isProduction) =>
{
   const allowedOrigins = isProduction
      ? [
         process.env.CLIENT_URL,
         'https://pionner-v-1.onrender.com',
         'https://5174-ihkfje5ha9ofr4jrb6vtx-7f1f3943.manusvm.computer',
         'http://localhost:5173',
         'http://localhost:5174',
         'http://localhost:3000',
         'http://localhost:3001',
         'http://localhost:4173',
         'http://localhost:4174'
      ]
      : [
         "http://localhost:5173",
         "http://localhost:5174",
         "http://localhost:3000",
         "http://localhost:3001",
         "http://localhost:4173",
         "http://localhost:4174",
         "https://5174-ihkfje5ha9ofr4jrb6vtx-7f1f3943.manusvm.computer"
      ];

   const corsOptions = {
      origin: (origin, callback) =>
      {
         // Allow requests with no origin (mobile apps, curl, postman, etc.)
         if (!origin) return callback(null, true);

         if (allowedOrigins.includes(origin))
         {
            callback(null, true);
         } else
         {
            logger.warn(`CORS blocked origin: ${origin}`);
            // Return a 403 Forbidden error for CORS, not a generic 500
            const corsError = new Error('Not allowed by CORS');
            corsError.statusCode = 403;
            callback(corsError);
         }
      },
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
         'Content-Type',
         'Authorization',
         'X-Requested-With',
         'Accept',
         'Origin'
      ],
      exposedHeaders: [
         'Content-Range',
         'X-Content-Range',
         'X-Access-Token',
         'X-Refresh-Token'
      ]
   };

   app.use(cors(corsOptions));
   app.options('*', cors(corsOptions));
};

// Body parsing middleware
const configureBodyParsing = (app) =>
{
   app.use(express.json({ limit: "10mb" }));
   app.use(express.urlencoded({ extended: true, limit: "10mb" }));
   app.use(cookieParser());

   // Request logging middleware
   app.use((req, res, next) =>
   {
      const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
      logger.http(`${req.method} ${req.originalUrl} - ${clientIP}`);
      next();
   });
};

// Rate limiting configuration
const configureRateLimiting = (app) =>
{
   app.use('/api/v1/', apiLimiter);
   app.use('/api/v1/auth/', authLimiter);
   app.use('/api/v1/payments/', paymentLimiter);
};

// Routes configuration
const configureRoutes = (app) =>
{
   // API Routes with consistent trailing slash handling
   app.use('/api/v1/auth/', AllRoutes.authRoutes);
   app.use('/api/v1/categories/', AllRoutes.categoryRoutes);
   app.use('/api/v1/products/', AllRoutes.productRoutes);
   app.use('/api/v1/cart/', AllRoutes.cartRoutes);
   app.use('/api/v1/coupons/', AllRoutes.couponRoutes);
   app.use('/api/v1/payments/', AllRoutes.paymentRoutes);
   app.use('/api/v1/analytics/', AllRoutes.analyticsRoutes);
   app.use('/api/v1/orders/', AllRoutes.orderRoutes);
   app.use('/api/v1/contact/', AllRoutes.contactUsRoutes);
   app.use('/api/v1/wishlist/', AllRoutes.wishlistRoutes);

   // Root endpoint
   app.get('/', (req, res) =>
   {
      res.status(200).json({
         success: true,
         message: 'TheShop API is running!',
         version: process.env.npm_package_version || '1.0.0',
         environment: process.env.NODE_ENV || 'development',
         timestamp: new Date().toISOString(),
         endpoints: {
            health: '/health',
            auth: '/api/v1/auth/',
            products: '/api/v1/products/',
            categories: '/api/v1/categories/',
            orders: '/api/v1/orders/',
            payments: '/api/v1/payments/',
            cart: '/api/v1/cart/',
            wishlist: '/api/v1/wishlist/',
            analytics: '/api/v1/analytics/',
            contact: '/api/v1/contact/',
            coupons: '/api/v1/coupons/'
         }
      });
   }); //latest

   // Health check endpoint
   app.get('/health', async (req, res) =>
   {
      try 
      {
         const healthData = await getHealthStatus(req);
         const statusCode = healthData.success ? 200 : 503;
         res.status(statusCode).json(healthData);
      } catch (error)
      {
         logger.error('Health check failed:', error.message);
         res.status(500).json({
            success: false,
            message: 'Health check failed',
            timestamp: new Date().toISOString(),
            error: error.message
         });
      }
   });
};

// Error handling configuration
const configureErrorHandling = (app) =>
{
   app.use(notFound);
   app.use(errorHandler);
};

// Server startup
const startServer = (app, PORT) =>
{
   const server = createServer(app);

   server.listen(PORT, () =>
   {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
   });

   // Graceful shutdown
   const gracefulShutdown = () =>
   {
      logger.info('Received shutdown signal, closing server gracefully...');
      server.close(() =>
      {
         logger.info('Server closed. Process terminated.');
         process.exit(0);
      });
   };

   process.on('SIGTERM', gracefulShutdown);
   process.on('SIGINT', gracefulShutdown);

   return server;
};