import couponModel from "../../DB/models/couponModel.js";
import { errorHandler } from "../../utils/errorHandler.js";

//==================================Get Coupon======================================

export const getCoupon = async (req, res, next) => {
	try {
		const coupon = await couponModel.findOne({ userId: req.user._id, isActive: true });
		
		res.json({
			success: true,
			message: coupon ? "Coupon retrieved successfully" : "No active coupon found",
			data: coupon || null
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Validate Coupon======================================

export const validateCoupon = async (req, res, next) => {
	try {
		const { code } = req.body;
		const coupon = await couponModel.findOne({ code: code, userId: req.user._id, isActive: true });

		if (!coupon) {
			return res.status(404).json({ 
				success: false,
				message: "Coupon not found" 
			});
		}

		if (coupon.expirationDate < new Date()) {
			coupon.isActive = false;
			await coupon.save();
			return res.status(404).json({ 
				success: false,
				message: "Coupon expired" 
			});
		}

		res.json({
			success: true,
			message: "Coupon is valid",
			data: {
				code: coupon.code,
				discountPercentage: coupon.discountPercentage,
			}
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
}; 