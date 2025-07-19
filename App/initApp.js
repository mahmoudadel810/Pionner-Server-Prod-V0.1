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

export const initApp = () => {
   // Load environment variables
   dotenv.config({
      path: path.resolve('./config/.env'),
      debug: false,
      safe: true
   });

   const isProduction = process.env.NODE_ENV === 'production';
   
   // Initialize services
   initCloudinary();
   connectDB();

   // Create Express app
   const app = express();
   const PORT = process.env.PORT || 3000;

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

   // Compression middleware
   app.use(compression({ level: 6 }));

   // Rate limiting
   app.use('/api/v1/', apiLimiter);
   app.use('/api/v1/auth', authLimiter);
   app.use('/api/v1/payments', paymentLimiter);

   // Request logging middleware
   app.use((req, res, next) => {
      logger.http(`${req.method} ${req.originalUrl} - ${req.ip}`);
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

   // Health check endpoint
   app.get('/', (req, res) => {
      res.status(200).json({
         success: true,
         message: 'TheShop API is running!',
         environment: process.env.NODE_ENV || 'development',
         timestamp: new Date().toISOString()
      });
   });

   // Health check endpoint for monitoring
   app.get('/api/v1/health', (req, res) => {
      res.status(200).json({
         success: true,
         message: 'Server is running and healthy!',
         timestamp: new Date().toISOString(),
         environment: process.env.NODE_ENV || 'development',
         uptime: process.uptime()
      });
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