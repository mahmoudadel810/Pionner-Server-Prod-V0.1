import rateLimit from "express-rate-limit";

//==================================Rate Limiting Middleware======================================

// Custom key generator that handles proxy scenarios
const keyGenerator = (req) => {
   // Use X-Forwarded-For header if available (when behind proxy)
   const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
   return clientIP;
};

// General API rate limiter
export const apiLimiter = rateLimit({
   windowMs: 3 * 60 * 1000, // 3 minutes
   max: 4000, // limit each IP to 1500 requests per windowMs
   keyGenerator,
   message: {
      success: false,
      message: "Too many requests from this IP, please try again later."
   },
   standardHeaders: true,
   legacyHeaders: false,
   skipSuccessfulRequests: false,
   skipFailedRequests: false,
});

// Auth routes rate limiter (more strict)
export const authLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 20, // limit each IP to 20 auth attempts per windowMs
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
   max: 3, // limit each IP to 3 payment attempts per windowMs
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