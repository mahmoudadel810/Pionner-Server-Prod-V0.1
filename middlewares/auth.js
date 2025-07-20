import jwt from "jsonwebtoken";
import userModel from "../DB/models/userModel.js";
import logger from "../utils/logger.js";

//==================================Authentication Middleware======================================

export const protect= async (req, res, next) => {
	try {
		const accessToken = req.cookies.accessToken;

		if (!accessToken) {
			return res.status(401).json({ 
				success: false,
				message: "Unauthorized - No access token provided" 
			});
		}

		try {
			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
			const user = await userModel.findById(decoded.userId).select("-password");

			if (!user) {
				return res.status(401).json({ 
					success: false,
					message: "User not found" 
				});
			}

			req.user = user;
			next();
		} catch (error) {
			if (error.name === "TokenExpiredError") {
				return res.status(401).json({ 
					success: false,
					message: "Unauthorized - Access token expired" 
				});
			}
			throw error;
		}
	} catch (error) {
		logger.error("Error in protect middleware", error.message);
		return res.status(401).json({ 
			success: false,
			message: "Unauthorized - Invalid access token" 
		});
	}
};

//==================================Authorization Middleware======================================

export const adminRoute = (req, res, next) => {
	if (req.user && req.user.role === "admin") {
		next();
	}
	else
	{
		return res.status(403).json({ 
			success: false,
			message: "Access denied - Admin only" 
		});
	}
};

export const authorize = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "Access denied."
			});
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				message: "Access denied not authorized"
			});
		}

		next();
	};
}; 