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
import { checkRequiredEnvVars } from "../utils/envCheck.js";

export const initApp = () => {
   // Load environment variables
   dotenv.config({
      path: path.resolve('./config/.env'),
      debug: false,
      safe: true
   });

   const isProduction = process.env.NODE_ENV === 'production';
   
   // Check required environment variables in production
   if (isProduction) {
      checkRequiredEnvVars();
   }
   
   // Initialize services
   initCloudinary();
   connectDB();

   // Create Express app
   const app = express();
   const PORT = process.env.PORT || 3000;

   // Trust proxy configuration for production (needed for rate limiting behind load balancers)
   if (isProduction) {
      app.set('trust proxy', 1);
   }

   // Security middleware
   app.use(helmet({
      contentSecurityPolicy: isProduction ? {
         directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
         },
      } : false,
   }));

   // CORS configuration
   const corsOptions = {
      origin: isProduction 
         ? [process.env.CLIENT_URL].filter(Boolean)
         : ["http://localhost:5173", "http://localhost:3000"],
      credentials: true,
      optionsSuccessStatus: 200
   };
   app.use(cors(corsOptions));

   // Body parsing middleware
   app.use(express.json({ limit: "10mb" }));
   app.use(express.urlencoded({ extended: true, limit: "10mb" }));
   app.use(cookieParser());

   // Additional security headers for production
   if (isProduction) {
      app.use((req, res, next) => {
         res.setHeader('X-Content-Type-Options', 'nosniff');
         res.setHeader('X-Frame-Options', 'DENY');
         res.setHeader('X-XSS-Protection', '1; mode=block');
         res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
         next();
      });
   }

   // Compression middleware
   app.use(compression({ level: 6 }));

   // Rate limiting
   app.use('/api/v1/', apiLimiter);
   app.use('/api/v1/auth', authLimiter);
   app.use('/api/v1/payments', paymentLimiter);

   // Request logging middleware
   app.use((req, res, next) => {
      req.startTime = Date.now();
      const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
      logger.http(`${req.method} ${req.originalUrl} - ${clientIP}`);
      next();
   });

   // API Routes 
   app.use(`/api/v1/auth`, AllRoutes.authRoutes);
   app.use(`/api/v1/categories`, AllRoutes.categoryRoutes);
   app.use(`/api/v1/products`, AllRoutes.productRoutes);
   app.use(`/api/v1/cart`, AllRoutes.cartRoutes);
   app.use(`/api/v1/coupons`, AllRoutes.couponRoutes);
   app.use(`/api/v1/payments`, AllRoutes.paymentRoutes);
   app.use(`/api/v1/analytics`, AllRoutes.analyticsRoutes);
   app.use(`/api/v1/orders`, AllRoutes.orderRoutes);
   app.use(`/api/v1/contact`, AllRoutes.contactUsRoutes);
   app.use(`/api/v1/wishlist`, AllRoutes.wishlistRoutes);

   // Root endpoint for API information
   app.get('/', (req, res) => {
      res.status(200).json({
         success: true,
         message: 'TheShop API is running!',
         version: process.env.npm_package_version || '1.0.0',
         environment: process.env.NODE_ENV || 'development',
         timestamp: new Date().toISOString(),
         endpoints: {
            health: '/health',
            auth: '/api/v1/auth',
            products: '/api/v1/products',
            categories: '/api/v1/categories',
            orders: '/api/v1/orders',
            payments: '/api/v1/payments'
         }
      });
   });

   // Comprehensive health check endpoint - all health data in one place
   app.get('/health', async (req, res) => {
      try {
         const healthData = await getHealthStatus(req);
         
         // Set appropriate status code based on health
         if (!healthData.success) {
            res.status(503);
         } else {
            res.status(200);
         }
         
         res.json(healthData);
      } catch (error) {
         logger.error('Health check failed:', error.message);
         res.status(500).json({
            success: false,
            message: 'Health check failed',
         timestamp: new Date().toISOString(),
            error: error.message
      });
      }
   });

   // Error Handling 
   app.use(notFound);
   app.use(errorHandler);

   // Create HTTP server
   const server = createServer(app);

   // Start server
   server.listen(PORT, () => {
      logger.info(`Server is running on Port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
   });

   // Graceful shutdown
   process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
         logger.info('Process terminated');
         process.exit(0);
      });
   });

   return { app, server };
}; 