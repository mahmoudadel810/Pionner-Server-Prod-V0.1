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

export const initApp = () => {
   dotenv.config({
      path: path.resolve('./config/.env'),
      debug: false,
      safe: true
   });

   initCloudinary();
   
   connectDB();

   // Create Express app
   const app = express();
   const PORT = process.env.PORT || 3000;

   // Security and performance middleware
   app.use(helmet());
   app.use(cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true
   }));
   app.use(express.json({ limit: "10mb" }));
   app.use(cookieParser());
   app.use(compression({ level: 6 }));

   // Main Routes 
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

   // Create HTTP server
   const server = createServer(app);

   // Health check
   app.get('/', (req, res) => {
      res.status(200).json({
         success: true,
         message: 'TheShop API is running!',
         timestamp: new Date().toISOString()
      });
   });

   // Health Check
   app.get('/api/v1/health', (req, res) => {
      res.status(200).json({
         success: true,
         message: 'Server is running and healthy!',
         timestamp: new Date().toISOString(),
         port: PORT,
         availableRoutes: [`/api/v1/auth`, `/api/v1/categories`, `/api/v1/products`, `/api/v1/cart`, `/api/v1/coupons`, `/api/v1/payments`, `/api/v1/analytics`, `/api/v1/orders`, `/api/v1/contact`, `/api/v1/wishlist`]
      });
   });

   // Error Handling 
   app.use(notFound);
   app.use(errorHandler);

   // Start server
   server.listen(PORT, () => {
      console.log(`Server is running on Port ${PORT} -----====!!!!`);
   });

   return { app, server };
}; 