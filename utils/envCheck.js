import logger from './logger.js';

export const checkRequiredEnvVars = () => {
    const requiredVars = [
        'NODE_ENV',
        'PORT',
        'MONGODB_URI',
        'ACCESS_TOKEN_SECRET',
        'REFRESH_TOKEN_SECRET',
        'CLIENT_URL',
        'EMAIL_SERVICE',
        'EMAIL_SMTP_PORT',
        'EMAIL_SMTP_USER',
        'EMAIL_SMTP_PASS',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        logger.error('Missing required environment variables:', missingVars);
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    logger.info('All required environment variables are set');
}; 