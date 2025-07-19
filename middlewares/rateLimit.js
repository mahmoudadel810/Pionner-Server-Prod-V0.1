import rateLimit from "express-rate-limit";

//==================================Rate Limiting Middleware======================================

// General API rate limiter
export const apiLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, 
   max: 100, 
   message: {
      success: false,
      message: "Too many requests from this IP, please try again later."
   },
   standardHeaders: true,
   legacyHeaders: false,
});

// Auth routes rate limiter (more strict)
export const authLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, 
   max: 5, 
   message: {
      success: false,
      message: "Too many authentication attempts, please try again later."
   },
   standardHeaders: true,
   legacyHeaders: false,
});

// Payment routes rate limiter (very strict)
export const paymentLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, 
   max: 3, 
   message: {
      success: false,
      message: "Too many payment attempts, please try again later."
   },
   standardHeaders: true,
   legacyHeaders: false,
}); 