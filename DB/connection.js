import mongoose from "mongoose";
import logger from "../utils/logger.js";

let connection = null;

mongoose.connection.on("error", (err) => logger.error(`MongoDB error: ${err.message}`));
mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));

// Returns a cached connection promise so serverless invocations reuse the
// same connection. A failed attempt is cleared so the next request retries.
const connectDB = () => {
    if (connection) return connection;

    const uri = process.env.MONGO_URI;
    if (!uri) {
        return Promise.reject(new Error("MONGO_URI is not set"));
    }

    connection = mongoose
        .connect(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        .then((conn) => {
            logger.info(`MongoDB connected: ${conn.connection.host}`);
            return conn;
        })
        .catch((error) => {
            connection = null;
            throw error;
        });

    return connection;
};

export default connectDB;
