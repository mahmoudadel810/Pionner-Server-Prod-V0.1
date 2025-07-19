import logger from './logger.js';

export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    
    // Get client IP considering proxy
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    
    // Log error details
    logger.error(`Error ${statusCode}: ${message}`, {
        url: req.originalUrl,
        method: req.method,
        ip: clientIP,
        userAgent: req.get('User-Agent'),
        stack: err.stack
    });
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
        statusCode = 409; // Conflict
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate ${field}: ${err.keyValue[field]} already exists`;
        
        // Special handling for stripeSessionId duplicates
        if (field === 'stripeSessionId') {
            message = 'Order already exists for this payment session';
        }
    }
    
    // Handle MongoDB validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors).map(val => val.message);
        message = `Validation Error: ${errors.join(', ')}`;
    }
    
    // Handle MongoDB cast errors (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }
    
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    
    // Production error response
    const errorResponse = {
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    
    res.status(statusCode).json(errorResponse);
};

export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
}; 