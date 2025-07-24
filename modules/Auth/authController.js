import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { nanoid } from 'nanoid';
import userModel from "../../DB/models/userModel.js";
import { redis } from "../../utils/redis.js";
import sendEmail from "../../service/sendEmail.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { deleteFromCloudinary } from "../../utils/multer.js";
import { generateTokens, storeRefreshToken, setCookies, tokenFunction } from "../../utils/tokenFunction.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import logger from "../../utils/logger.js";


//==================================Signup======================================

export const signUp = asyncHandler(async (req, res, next) => {
	const { name, email, phone, password } = req.body;
	
	const userExists = await userModel.findOne({ email });

	if (userExists) {
		return next(new AppError('User already exists', 400));
	}

	const user = new userModel({
		name,
		email,
		phone,
		password
	});
	
	await user.save();

	// Generate confirmation token
	const confirmationToken = tokenFunction({ payload: user._id, generate: true });

	// Send confirmation email
	const confirmationLink = `${process.env.CLIENT_URL || 'https://pionner-v2.vercel.app/'}/confirm-email/${confirmationToken}`;

	const Send = await sendEmail({
		to: user.email,
		subject: "Confirm your email - Pioneer",
		message: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="text-align: center; margin-bottom: 30px;">
					<h1 style="color: #333; margin-bottom: 10px;">Welcome to Pioneer!</h1>
					<p style="color: #666; font-size: 16px;">Your shopping journey starts here</p>
				</div>
				
				<div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
					<h2 style="color: #333; margin-bottom: 15px;">Email Confirmation Required</h2>
					<p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
						Hi ${user.name},
					</p>
					<p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
						Thank you for registering with Pioneer! To complete your registration and start shopping, 
						please confirm your email address by clicking the button below.
					</p>
					
					<div style="text-align: center; margin: 30px 0;">
						<a href="${confirmationLink}" 
						   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; 
								  text-decoration: none; border-radius: 8px; font-weight: bold; 
								  display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
							Confirm Email Address
						</a>
					</div>
					
					<p style="color: #666; font-size: 14px; margin-bottom: 15px;">
						If the button doesn't work, you can copy and paste this link into your browser:
					</p>
					<p style="color: #667eea; font-size: 14px; word-break: break-all;">
						${confirmationLink}
					</p>
				</div>
				
				<div style="text-align: center; color: #666; font-size: 14px;">
					<p>This link will expire in 24 hours for security reasons.</p>
					<p>If you didn't create an account with Pioneer, please ignore this email.</p>
				</div>
				
				<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
					<p style="color: #999; font-size: 12px;">
						© 2024 Pioneer. All rights reserved.
					</p>
				</div>
			</div>
		`
	});

	if (!Send) {
		return next(new AppError('Failed to send confirmation email', 500));
	}

	res.status(201).json({
		success: true,
		message: "User registered successfully. Please verify your email.",
		data: {
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				isConfirmed: user.isConfirmed,
				status: user.status
			}
		}
	});
});

//==================================Confirm Email======================================

export const confirmEmail = asyncHandler(async (req, res, next) => {
	const { token } = req.params;

	const decode = tokenFunction({ payload: token, generate: false });

	if (!decode?._id) {
		return next(new AppError('Invalid or expired confirmation token', 400));
	}

	const user = await userModel.findOneAndUpdate(
		{ _id: decode._id, isConfirmed: false },
		{ $set: { isConfirmed: true } }
	);

	if (!user) {
		return res.status(200).json({
			success: true,
			message: "Email address has already been confirmed. You can now log in."
		});
	}

	res.status(200).json({
		success: true,
		message: "Email confirmed successfully! You can now log in to your account."
	});
});

//==================================Login======================================

export const login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	const user = await userModel.findOne({ email });
	
	// Check if user exists
	if (!user) {
		return next(new AppError('User not found', 400));
	}

	// Check if user has confirmed their email
	if (!user.isConfirmed) {
		return next(new AppError('Please verify your email address first', 401));
	}

	// Verify password
	const isPasswordValid = await user.comparePassword(password);
	if (!isPasswordValid) {
		return next(new AppError('Invalid email or password', 401));
	}

	// Update user status to active upon successful login
	await userModel.findByIdAndUpdate(user._id, { status: "active" });

	// Generate tokens and authenticate
	const { accessToken, refreshToken } = generateTokens(user._id);
	if (redis) {
		await storeRefreshToken(user._id, refreshToken);
	}
	setCookies(res, accessToken, refreshToken);

	res.json({
		success: true,
		message: "Login successful",
		data: {
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				profileImage: user.profileImage,
				isConfirmed: user.isConfirmed,
				status: "active",
				role: user.role
			}
		}
	});
});

//==================================Logout======================================

export const logout = async (req, res, next) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken && redis) {
			try {
				const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
				await redis.del(`refresh_token:${decoded.userId}`);
			} catch (error) {
				logger.error("Error deleting refresh token from Redis:", error.message);
			}
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ 
			success: true,
			message: "Logged out successfully" 
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Refresh Token======================================

export const refreshToken = async (req, res, next) => {
	try {
		// Check for refresh token in cookies first, then in Authorization header
		let refreshToken = req.cookies.refreshToken;
		
		// If no cookie token, check Authorization header
		if (!refreshToken) {
			const authHeader = req.headers.authorization;
			if (authHeader && authHeader.startsWith('Bearer ')) {
				refreshToken = authHeader.substring(7); // Remove 'Bearer ' prefix
			}
		}

		if (!refreshToken) {
			return res.status(401).json({ 
				success: false,
				message: "No refresh token provided" 
			});
		}

		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		
		// Check if Redis is available
		if (redis) {
			const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
			if (storedToken !== refreshToken) {
				return res.status(401).json({ 
					success: false,
					message: "Invalid refresh token" 
				});
			}
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

		// Set cookie for same-origin requests
		res.cookie("accessToken", accessToken, {
			httpOnly: false, // Allow frontend to access
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			maxAge: 60 * 60 * 1000, // 1 hour
			path: "/",
			domain: process.env.NODE_ENV === "production" ? undefined : undefined, // Let browser handle domain
		});

		// Also set token in header for cross-origin requests
		res.setHeader('X-Access-Token', accessToken);

		res.json({ 
			success: true,
			message: "Token refreshed successfully" 
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Profile======================================

export const getProfile = async (req, res, next) => {
	try
	{
		const user = await userModel.findById(req.user._id);
		if (!user) {
			return res.status(404).json({ 
				success: false,
				message: "User not found" 
			});
		}
		res.json({
			success: true,
			message: "Profile retrieved successfully",
			data: req.user
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Upload Profile Image======================================

export const uploadProfileImage = async (req, res, next) => {
	try {
		logger.info("Upload profile image request received");
		logger.debug("File:", req.file);
		logger.debug("Uploaded file:", req.uploadedFile);
		
		if (!req.file) {
			return res.status(400).json({ 
				success: false,
				message: "No image file provided" 
			});
		}

		const user = await userModel.findById(req.user._id);

		if (!user) {
			return res.status(404).json({ 
				success: false,
				message: "User not found" 
			});
		}

		logger.info("User found:", user._id);
		logger.debug("Current profile image:", user.profileImage);

		// Delete old profile image from Cloudinary if exists
		if (user.profileImage) {
			try {
				await deleteFromCloudinary(user.profileImage);
				logger.info("Successfully deleted old profile image from Cloudinary");
			} catch (error) {
				logger.error("Error deleting old profile image:", error);
			}
		}

		// Update user with new profile image from Cloudinary
		if (req.uploadedFile && req.uploadedFile.url) {
			logger.info("New profile image URL:", req.uploadedFile.url);
			user.profileImage = req.uploadedFile.url;
			await user.save();
			logger.info("Profile image saved to database");
		} else {
			logger.error("No uploaded file data found");
			return res.status(500).json({
				success: false,
				message: "Failed to upload image to Cloudinary"
			});
		}

		res.json({
			success: true,
			message: "Profile image uploaded successfully",
			data: {
				userId: user._id,
				profileImage: user.profileImage
			}
		});
	} catch (error) {
		logger.error("Error in uploadProfileImage:", error);
		errorHandler(error, req, res, next);
	}
};

//==================================Forgot Password======================================

export const forgotPassword = async (req, res, next) => {
	try {
		const { email } = req.body;

		const user = await userModel.findOne({ email });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found Check if your email is true"
			});
		}

		const resetPasswordToken = nanoid(6);
		const tokenExpiration = new Date(Date.now() + 15 * 60 * 1000);

		const emailed = await sendEmail({
			to: email,
			subject: 'Reset your Password',
			message: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="text-align: center; margin-bottom: 30px;">
						<h1 style="color: #333; margin-bottom: 10px;">Password Reset Request</h1>
						<p style="color: #666; font-size: 16px;">Secure your TheShop account</p>
					</div>
					
					<div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
						<h2 style="color: #333; margin-bottom: 15px;">Reset Your Password</h2>
						<p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
							Hi there,
						</p>
						<p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
							We received a request to reset your password for your TheShop account. 
							To complete the password reset process, please use the verification code below:
						</p>
						
						<div style="text-align: center; margin: 30px 0;">
							<div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">
								${resetPasswordToken}
							</div>
						</div>
						
						<p style="color: #555; line-height: 1.6; margin-bottom: 10px;">
							This code will expire in 15 minutes for security reasons.
						</p>
						
						<p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
							If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
						</p>
					</div>
					
					<div style="text-align: center; color: #666; font-size: 14px;">
						<p>For security reasons, never share this code with anyone.</p>
						<p>The TheShop team will never ask for this code via phone or message.</p>
					</div>
					
					<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
						<p style="color: #999; font-size: 12px;">
							© 2024 TheShop. All rights reserved.
						</p>
					</div>
				</div>
			`
		});

		if (!emailed) {
			return res.status(503).json({
				success: false,
				message: 'Failed to send password reset email. Please try again later.'
			});
		}

		try {
			user.resetPasswordToken = resetPasswordToken;
			user.resetPasswordTokenExpiresIn = tokenExpiration;
			await user.save();
		} catch (saveError) {
			logger.error("Failed to save reset password token to user, but email was sent:", saveError);
		}

		res.status(200).json({
			success: true,
			message: 'Password reset code sent successfully to your email.'
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Reset Password======================================

export const resetPassword = async (req, res, next) => {
	try {
		const { code, newPassword, confirmNewPassword } = req.body;

		if (!code || !newPassword || !confirmNewPassword) {
			return res.status(400).json({
				success: false,
				message: 'Code, new password, and confirm password are required'
			});
		}

		const user = await userModel.findOne({
			resetPasswordToken: code
		});

		if (!user) {
			return res.status(400).json({
				success: false,
				message: 'Invalid reset code'
			});
		}

		// Check if token has expired (15 minutes)
		if (user.resetPasswordTokenExpiresIn && new Date() > user.resetPasswordTokenExpiresIn) {
			return res.status(400).json({
				success: false,
				message: 'Reset code has expired. Please request a new password reset.'
			});
		}

		// Hash new password and update user
		const hashedPassword = await bcrypt.hash(newPassword, +(process.env.SALT_ROUNDS));
		const userEmail = user.email;

		await userModel.findByIdAndUpdate(
			user._id,
			{
				$set: {
					password: hashedPassword,
					resetPasswordToken: nanoid(),
					resetPasswordTokenExpiresIn: null
				}
			},
			{ new: true }
		);

		await sendEmail({
			to: userEmail,
			subject: 'Your Password Has Been Changed',
			message: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="text-align: center; margin-bottom: 30px;">
						<h1 style="color: #333; margin-bottom: 10px;">Password Change Confirmation</h1>
						<p style="color: #666; font-size: 16px;">Important Security Update</p>
					</div>
					
					<div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
						<h2 style="color: #333; margin-bottom: 15px;">Your Password Was Changed</h2>
						<p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
							Hi there,
						</p>
						<p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
							This email confirms that your password for your TheShop account has been successfully changed.
						</p>
						
						<div style="text-align: center; margin: 30px 0;">
							<p style="color: #d9534f; font-weight: bold;">If you did not make this change, please secure your account immediately!</p>
						</div>
						
						<div style="text-align: center; margin: 20px 0;">
							<a href="${process.env.CLIENT_URL}/resetPassword" style="background-color: #0275d8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset My Password</a>
						</div>
						
						<p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
							If you did make this change, you can safely ignore this email.
						</p>
					</div>
					
					<div style="text-align: center; color: #666; font-size: 14px;">
						<p>For security reasons, please ensure your account has a secure password.</p>
						<p>The TheShop team will never ask for your password via phone or message.</p>
					</div>
					
					<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
						<p style="color: #999; font-size: 12px;">
							© 2024 TheShop. All rights reserved.
						</p>
					</div>
				</div>
			`
		});

		res.status(200).json({
			success: true,
			message: 'Password has been reset successfully. You can now log in with your new password.'
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
}; 

//==================================Update Profile======================================

export const updateProfile = async (req, res, next) => {
	try {
		const { name, email, phone } = req.body;
		const userId = req.user._id;

		// Check if email is already taken by another user
		if (email) {
			const existingUser = await userModel.findOne({ email, _id: { $ne: userId } });
			if (existingUser) {
				return res.status(400).json({
					success: false,
					message: "Email is already taken by another user"
				});
			}
		}

		// Check if phone is already taken by another user
		if (phone) {
			const existingUser = await userModel.findOne({ phone, _id: { $ne: userId } });
			if (existingUser) {
				return res.status(400).json({
					success: false,
					message: "Phone number is already taken by another user"
				});
			}
		}

		const updatedUser = await userModel.findByIdAndUpdate(
			userId,
			{
				$set: {
					name: name || req.user.name,
					email: email || req.user.email,
					phone: phone || req.user.phone,
				}
			},
			{ new: true, select: '-password' }
		);

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			data: updatedUser
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Update Password======================================

export const updatePassword = async (req, res, next) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user._id;

		// Get user with password
		const user = await userModel.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found"
			});
		}

		// Verify current password
		const isCurrentPasswordValid = await user.comparePassword(currentPassword);
		if (!isCurrentPasswordValid) {
			return res.status(400).json({
				success: false,
				message: "Current password is incorrect"
			});
		}

		// Hash new password
		const saltRounds = +(process.env.SALT_ROUNDS);
		const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

		// Update password
		await userModel.findByIdAndUpdate(
			userId,
			{
				$set: {
					password: hashedPassword
				}
			}
		);

		res.status(200).json({
			success: true,
			message: "Password updated successfully"
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
}; 