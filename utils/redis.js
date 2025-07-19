import Redis from 'ioredis';
import logger from './logger.js';

let redis = null;

try {
   // Use Upstash Redis URL if available, otherwise fall back to individual config
   const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
   
   logger.info(`Redis initialization - Environment: ${process.env.NODE_ENV || 'development'}`);
   logger.info(`Redis URL exists: ${!!redisUrl}`);
   logger.info(`Redis URL length: ${redisUrl ? redisUrl.length : 0}`);
   
   if (redisUrl) {
      // Use URL connection for Upstash Redis
      logger.info('Attempting to connect to Redis using URL');
      redis = new Redis(redisUrl, {
         retryDelayOnFailover: 100,
         maxRetriesPerRequest: 3,
         lazyConnect: false, // Connect immediately
         tls: {
            rejectUnauthorized: false
         },
         connectTimeout: 15000, // 15 seconds
         commandTimeout: 10000, // 10 seconds
         retryDelayOnClusterDown: 300,
         retryDelayOnFailover: 100,
         maxRetriesPerRequest: 3,
         enableReadyCheck: true,
         maxLoadingTimeout: 10000
      });
   } else {
      // Fallback to individual config (for local development)
      logger.info('Attempting to connect to Redis using individual config');
   redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
         lazyConnect: false, // Connect immediately
         connectTimeout: 15000,
         commandTimeout: 10000
   });
   }

   redis.on('connect', () => {
      logger.info('Connected to Redis successfully');
   });

   redis.on('ready', () => {
      logger.info('Redis is ready to accept commands');
   });

   redis.on('error', (err) => {
      logger.error('Redis connection error:', err.message);
      logger.error('Redis error details:', {
         code: err.code,
         syscall: err.syscall,
         address: err.address,
         port: err.port
      });
   });

   redis.on('close', () => {
      logger.warn('Redis connection closed');
   });

   redis.on('reconnecting', (delay) => {
      logger.info(`Redis reconnecting in ${delay}ms...`);
   });

   redis.on('end', () => {
      logger.warn('Redis connection ended');
   });

} catch (error) {
   logger.error('Failed to initialize Redis:', error.message);
   logger.error('Redis initialization error details:', {
      name: error.name,
      stack: error.stack
   });
   redis = null;
}

export { redis }; 