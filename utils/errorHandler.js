export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    
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
    
    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
}; 