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

   // Check Redis connectivity
   try {
      const { redis } = await import('./redis.js');
      if (redis && redis.status === 'ready') {
         healthData.services.redis = 'connected';
         // Test Redis with a ping
         const pingResult = await redis.ping();
         if (pingResult !== 'PONG') {
            healthData.services.redis = 'ping_failed';
            healthData.success = false;
         }
      } else if (redis && redis.status === 'connecting') {
         healthData.services.redis = 'connecting';
      } else {
         healthData.services.redis = 'disconnected';
         healthData.success = false;
      }
   } catch (error) {
      logger.error('Redis health check failed:', error.message);
      healthData.services.redis = 'error';
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