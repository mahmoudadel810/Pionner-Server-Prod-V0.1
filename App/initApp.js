import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { errorHandler, notFound } from "../utils/errorHandler.js";
import connectDB from "../DB/connection.js";
import { initCloudinary } from "../service/cloudinary.js";
import * as AllRoutes from "../modules/indexRoutes.js";
import logger from "../utils/logger.js";
import { apiLimiter, authLimiter, paymentLimiter } from "../middlewares/rateLimit.js";
import { getHealthStatus } from "../utils/healthMonitor.js";

const DEV_ORIGINS = [
   "http://localhost:5173",
   "http://localhost:5174",
   "http://localhost:3000",
   "http://localhost:3001",
   "http://localhost:4173",
   "http://localhost:4174"
];

const PRODUCTION_ORIGINS = [
   "https://pionner-v21.vercel.app",
   "https://pionner-v2.vercel.app",
   "https://pionner.vercel.app"
];

export const createApp = () =>
{
   const app = express();
   const isProduction = process.env.NODE_ENV === "production";

   initCloudinary();

   configureSecurityMiddleware(app, isProduction);
   configureCORS(app, isProduction);
   configureBodyParsing(app);
   configureRateLimiting(app);
   configureDatabase(app);
   configureRoutes(app);

   app.use(notFound);
   app.use(errorHandler);

   return app;
};

const configureSecurityMiddleware = (app, isProduction) =>
{
   // Needed for correct client IPs (rate limiting) behind Vercel's proxy
   if (isProduction)
   {
      app.set("trust proxy", 1);
   }

   app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
   }));

   app.use(compression());
};

const configureCORS = (app, isProduction) =>
{
   const extraOrigins = (process.env.CORS_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

   const allowedOrigins = new Set([
      process.env.CLIENT_URL,
      process.env.SERVER_URL,
      ...extraOrigins,
      ...(isProduction ? PRODUCTION_ORIGINS : DEV_ORIGINS)
   ].filter(Boolean).map((origin) => origin.replace(/\/$/, "")));

   const corsOptions = {
      origin: (origin, callback) =>
      {
         // Requests without an Origin header (curl, server-to-server) are allowed
         if (!origin || allowedOrigins.has(origin))
         {
            return callback(null, true);
         }

         logger.warn(`CORS blocked origin: ${origin}`);
         const corsError = new Error("Not allowed by CORS");
         corsError.statusCode = 403;
         callback(corsError);
      },
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
      exposedHeaders: ["Content-Range", "X-Content-Range", "X-Access-Token", "X-Refresh-Token"]
   };

   app.use(cors(corsOptions));
   app.options("*", cors(corsOptions));
};

const configureBodyParsing = (app) =>
{
   const jsonParser = express.json({ limit: "10mb" });

   // The Stripe webhook needs the raw body for signature verification
   app.use((req, res, next) =>
      req.originalUrl.startsWith("/api/v2/payments/webhook") ? next() : jsonParser(req, res, next)
   );
   app.use(express.urlencoded({ extended: true, limit: "10mb" }));
   app.use(cookieParser());

   app.use((req, res, next) =>
   {
      const clientIP = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
      logger.http(`${req.method} ${req.originalUrl} - ${clientIP}`);
      next();
   });
};

const configureRateLimiting = (app) =>
{
   app.use("/api/v2/", apiLimiter);
   app.use("/api/v2/auth/", authLimiter);
   app.use("/api/v2/payments/", paymentLimiter);
};

// Every API request waits for the (cached) MongoDB connection, so a cold
// serverless start never runs a query before the connection is ready.
const configureDatabase = (app) =>
{
   app.use("/api", async (req, res, next) =>
   {
      try
      {
         await connectDB();
         next();
      } catch (error)
      {
         logger.error(`Database connection failed: ${error.message}`);
         res.status(503).json({ success: false, message: "Database unavailable" });
      }
   });
};

const configureRoutes = (app) =>
{
   app.use("/api/v2/auth/", AllRoutes.authRoutes);
   app.use("/api/v2/categories/", AllRoutes.categoryRoutes);
   app.use("/api/v2/products/", AllRoutes.productRoutes);
   app.use("/api/v2/cart/", AllRoutes.cartRoutes);
   app.use("/api/v2/coupons/", AllRoutes.couponRoutes);
   app.use("/api/v2/payments/", AllRoutes.paymentRoutes);
   app.use("/api/v2/analytics/", AllRoutes.analyticsRoutes);
   app.use("/api/v2/orders/", AllRoutes.orderRoutes);
   app.use("/api/v2/contact/", AllRoutes.contactUsRoutes);
   app.use("/api/v2/wishlist/", AllRoutes.wishlistRoutes);

   app.get("/", (req, res) =>
   {
      res.status(200).json({
         success: true,
         message: "Pionner API is running",
         environment: process.env.NODE_ENV || "development",
         endpoints: {
            health: "/health",
            auth: "/api/v2/auth/",
            products: "/api/v2/products/",
            categories: "/api/v2/categories/",
            orders: "/api/v2/orders/",
            payments: "/api/v2/payments/",
            cart: "/api/v2/cart/",
            wishlist: "/api/v2/wishlist/",
            analytics: "/api/v2/analytics/",
            contact: "/api/v2/contact/",
            coupons: "/api/v2/coupons/"
         }
      });
   });

   app.get("/health", async (req, res) =>
   {
      try
      {
         await connectDB().catch(() => null);
         const healthData = await getHealthStatus();
         res.status(healthData.success ? 200 : 503).json(healthData);
      } catch (error)
      {
         logger.error(`Health check failed: ${error.message}`);
         res.status(500).json({ success: false, message: "Health check failed" });
      }
   });
};
