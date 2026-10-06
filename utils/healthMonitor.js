import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { redis } from "./redis.js";

const redisStatus = async () => {
   if (!redis) return "not_configured";
   if (redis.status !== "ready") return redis.status;
   try {
      return (await redis.ping()) === "PONG" ? "connected" : "ping_failed";
   } catch {
      return "ping_failed";
   }
};

export const getHealthStatus = async () => {
   const database = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
   const memory = process.memoryUsage();

   return {
      success: database === "connected",
      message: database === "connected" ? "Server is healthy" : "Database is not connected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptime: Math.round(process.uptime()),
      nodeVersion: process.version,
      memoryMb: {
         heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
         rss: Math.round(memory.rss / 1024 / 1024)
      },
      services: {
         database,
         redis: await redisStatus(),
         cloudinary: cloudinary.config().cloud_name ? "configured" : "not_configured"
      }
   };
};
