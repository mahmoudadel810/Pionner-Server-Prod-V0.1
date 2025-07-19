import logger from './logger.js';

export const getHealthStatus = async (req) => {
   const healthData = {
      success: true,
      message: 'Server is running and healthy!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      system: {
         platform: process.platform,
         nodeVersion: process.version,
         memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            external: Math.round(process.memoryUsage().external / 1024 / 1024),
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
         },
         cpu: process.cpuUsage(),
         pid: process.pid
      },
      services: {
         database: 'unknown',
         redis: 'unknown',
         cloudinary: 'unknown'
      },
      debug: {
         redis: {
            hasUrl: false,
            urlLength: 0,
            connectionStatus: 'unknown',
            error: null,
            environment: process.env.NODE_ENV || 'development'
         }
      },
      endpoints: {
         auth: '/api/v1/auth',
         products: '/api/v1/products',
         categories: '/api/v1/categories',
         orders: '/api/v1/orders',
         payments: '/api/v1/payments',
         analytics: '/api/v1/analytics',
         cart: '/api/v1/cart',
         coupons: '/api/v1/coupons',
         contact: '/api/v1/contact',
         wishlist: '/api/v1/wishlist'
      }
   };

   // Check database connectivity
   try {
      const mongoose = await import('mongoose');
      if (mongoose.default.connection.readyState === 1) {
         healthData.services.database = 'connected';
      } else {
         healthData.services.database = 'disconnected';
         healthData.success = false;
      }
   } catch (error) {
      logger.error('Database health check failed:', error.message);
      healthData.services.database = 'error';
      healthData.success = false;
   }

   // Enhanced Redis connectivity check with detailed debugging
   try {
      // Check if Redis URL exists
      const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
      healthData.debug.redis.hasUrl = !!redisUrl;
      healthData.debug.redis.urlLength = redisUrl ? redisUrl.length : 0;
      
      if (!redisUrl) {
         healthData.services.redis = 'no_url_configured';
         healthData.debug.redis.error = 'No Redis URL found in environment variables';
         healthData.success = false;
      } else {
         const { redis } = await import('./redis.js');
         
         if (!redis) {
            healthData.services.redis = 'not_initialized';
            healthData.debug.redis.error = 'Redis client not initialized';
            healthData.success = false;
         } else {
            healthData.debug.redis.connectionStatus = redis.status;
            
            if (redis.status === 'ready') {
               healthData.services.redis = 'connected';
               // Test Redis with a ping
               try {
                  const pingResult = await redis.ping();
                  if (pingResult !== 'PONG') {
                     healthData.services.redis = 'ping_failed';
                     healthData.debug.redis.error = `Ping returned: ${pingResult}`;
                     healthData.success = false;
                  }
               } catch (pingError) {
                  healthData.services.redis = 'ping_error';
                  healthData.debug.redis.error = `Ping failed: ${pingError.message}`;
                  healthData.success = false;
               }
            } else if (redis.status === 'connecting') {
               healthData.services.redis = 'connecting';
            } else if (redis.status === 'end') {
               healthData.services.redis = 'ended';
               healthData.debug.redis.error = 'Redis connection ended';
               healthData.success = false;
            } else {
               healthData.services.redis = 'disconnected';
               healthData.debug.redis.error = `Redis status: ${redis.status}`;
               healthData.success = false;
            }
         }
      }
   } catch (error) {
      logger.error('Redis health check failed:', error.message);
      healthData.services.redis = 'error';
      healthData.debug.redis.error = error.message;
      healthData.success = false;
   }

   // Check Cloudinary connectivity
   try {
      const cloudinary = await import('cloudinary');
      if (cloudinary.default.config().cloud_name) {
         healthData.services.cloudinary = 'configured';
      } else {
         healthData.services.cloudinary = 'not_configured';
      }
   } catch (error) {
      logger.error('Cloudinary health check failed:', error.message);
      healthData.services.cloudinary = 'error';
   }

   // Calculate memory usage percentage
   const memoryUsage = process.memoryUsage();
   const totalMemory = memoryUsage.heapTotal;
   const usedMemory = memoryUsage.heapUsed;
   healthData.system.memory.usagePercentage = Math.round((usedMemory / totalMemory) * 100);

   // Add response time if request object is provided
   if (req && req.startTime) {
      const responseTime = Date.now() - req.startTime;
      healthData.responseTime = `${responseTime}ms`;
   }

   // Determine overall health status
   const criticalServices = ['database', 'redis'];
   const criticalServicesStatus = criticalServices.map(service => healthData.services[service]);
   
   if (criticalServicesStatus.includes('error') || criticalServicesStatus.includes('disconnected')) {
      healthData.success = false;
      healthData.message = 'Server has connectivity issues';
   } else if (criticalServicesStatus.includes('connecting')) {
      healthData.success = true;
      healthData.message = 'Server is running but some services are connecting';
   } else {
      healthData.success = true;
      healthData.message = 'Server is running and healthy!';
   }

   return healthData;
}; 