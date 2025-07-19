import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redis;

if (process.env.UPSTASH_REDIS_URL) {
   redis = new Redis(process.env.UPSTASH_REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
   });

   redis.on('error', (error) => {
      console.error('Redis connection error:', error.message);
   });

   redis.on('connect', () => {
      console.log('Connected to Redis successfully');
   });
} else {
   // console.warn('Redis environment variable not found - Caching features will be disabled');
   redis = null;
}

export { redis }; 