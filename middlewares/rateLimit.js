import rateLimit from "express-rate-limit";

//==================================Rate Limiting Middleware======================================

export const apiLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 1000,
   message: {
      success: false,
      message: "Too many requests, please try again later."
   },
   standardHeaders: true,
   legacyHeaders: false,
   skipSuccessfulRequests: false,
   skipFailedRequests: true,
});

export const authLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 1000,
   message: {
      success: false,
      message: "Too many authentication attempts, please try again later."
   },
   standardHeaders: true,
   legacyHeaders: false,
   skipSuccessfulRequests: true, // Don't count successful logins
   skipFailedRequests: false,
});

export const paymentLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 1000,
   message: {
      success: false,
      message: "Too many payment attempts, please try again later."
   },
   standardHeaders: true,
   legacyHeaders: false,
   skipSuccessfulRequests: true, // Don't count successful payments
   skipFailedRequests: false,
}); 