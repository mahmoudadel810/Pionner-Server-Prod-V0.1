import Redis from "ioredis";
import logger from "./logger.js";

// Redis is optional: it caches featured products/categories and stores
// refresh tokens. Without configuration the app runs without it.
const createClient = () => {
  const url = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  const options = { maxRetriesPerRequest: 3, connectTimeout: 15000, commandTimeout: 10000 };

  if (url) return new Redis(url, options);

  if (process.env.REDIS_HOST) {
    return new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      ...options,
    });
  }

  return null;
};

const redis = createClient();

if (redis) {
  redis.on("ready", () => logger.info("Redis connected"));
  redis.on("error", (err) => logger.error(`Redis error: ${err.message}`));
} else {
  logger.info("Redis not configured, caching disabled");
}

export { redis };
