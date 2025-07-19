import jwt from "jsonwebtoken";
import { redis } from "./redis.js";


//generate tokens for access token and refresh token
export const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
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
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

//decode token function
export const tokenFunction = ({ payload, generate = true }) => {
    if (generate) {
        return jwt.sign({ _id: payload }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
        });
    } else {
        try {
            return jwt.verify(payload, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            return null;
        }
    }
};
