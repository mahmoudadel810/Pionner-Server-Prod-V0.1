import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI;
        
        if (!mongoUri) {
            throw new Error('MongoDB connection string not found. Please set MONGO_URI environment variable.');
        }
        
        const conn = await mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
        });
        
    } catch (error) {
        logger.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB; 