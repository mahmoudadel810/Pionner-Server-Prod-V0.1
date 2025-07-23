import rateLimit from "express-rate-limit";

//==================================Rate Limiting Middleware======================================

// Custom key generator that handles proxy scenarios
const keyGenerator = (req) => {
   // Use X-Forwarded-For header if available (when behind proxy)
   const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
   return req.ip;
};

// API rate limiter - very permissive for production
// Note: In a production environment, you might want to set stricter limits
export const apiLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 1000, // 1000 requests per window per IP
   keyGenerator,
   message: {
      success: false,
      message: "Too many requests, please try again later."
   },
   standardHeaders: true,
   legacyHeaders: false,
   skipSuccessfulRequests: false,
   skipFailedRequests: true,
});

// Auth routes rate limiter (more strict)
export const authLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 1000, // limit each IP to 1000 auth attempts per windowMs
   keyGenerator,
   message: {
      success: false,
      message: "Too many authentication attempts, please try again later."
   },
   standardHeaders: true,
   legacyHeaders: false,
   skipSuccessfulRequests: true, // Don't count successful logins
   skipFailedRequests: false,
});

// Payment routes rate limiter (very strict)
export const paymentLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 1000, // limit each IP to 1000 payment attempts per windowMs
   keyGenerator,
   message: {
      success: false,
      message: "Too many payment attempts, please try again later."
   },
   standardHeaders: true,
   legacyHeaders: false,
   skipSuccessfulRequests: true, // Don't count successful payments
   skipFailedRequests: false,
}); 