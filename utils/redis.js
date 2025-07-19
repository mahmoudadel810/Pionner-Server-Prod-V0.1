import Redis from 'ioredis';
import logger from './logger.js';

let redis = null;

try {
   redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
   });

   redis.on('connect', () => {
      logger.info('Connected to Redis successfully');
   });

   redis.on('error', (err) => {
      logger.error('Redis connection error:', err);
   });

   redis.on('close', () => {
      logger.warn('Redis connection closed');
   });

   redis.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
   });

} catch (error) {
   logger.error('Failed to initialize Redis:', error.message);
   redis = null;
}

export { redis }; 