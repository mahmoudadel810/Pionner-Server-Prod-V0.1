import jwt from "jsonwebtoken";
import { redis } from "./redis.js";
import logger from "./logger.js";


//generate tokens for access token and refresh token
export const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });

    return { accessToken, refreshToken };
};

//store refresh token in redis
export const storeRefreshToken = async (userId, refreshToken) => {
    if (redis) {
        try {
            await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
        } catch (error) {
            logger.error('Error storing refresh token in Redis:', error.message);
        }
    }
};




//set cookies for access token and refresh token
export const setCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === "production";
    
    // Set cookies for same-origin requests
    res.cookie("accessToken", accessToken, {
        httpOnly: false, // Allow frontend to access
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 60 * 60 * 1000, // 1 hour
        path: "/",
        domain: isProduction ? undefined : undefined, // Let browser handle domain
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: false, // Allow frontend to access
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
        domain: isProduction ? undefined : undefined, // Let browser handle domain
    });

    // Always set tokens in headers for cross-origin frontend access
    res.setHeader('X-Access-Token', accessToken);
    res.setHeader('X-Refresh-Token', refreshToken);
};

//decode token function
export const tokenFunction = ({ payload, generate = true }) => {
    if (generate) {
        return jwt.sign({ _id: payload }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "1h",
        });
    } else {
        try {
            return jwt.verify(payload, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            return null;
        }
    }
};
