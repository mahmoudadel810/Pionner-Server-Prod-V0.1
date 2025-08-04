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

//==================================Get All Coupons (Admin)======================================

export const getAllCoupons = async (req, res, next) => {
	try {
		const { page = 1, limit = 10, isActive, search } = req.query;
		const skip = (page - 1) * limit;

		// Build query
		let query = {};
		if (isActive !== undefined) {
			query.isActive = isActive === 'true';
		}
		if (search) {
			query.$or = [
				{ code: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } }
			];
		}

		const coupons = await couponModel.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const totalCoupons = await couponModel.countDocuments(query);

		res.json({
			success: true,
			message: "Coupons retrieved successfully",
			data: coupons,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(totalCoupons / limit),
				totalCoupons,
				hasNextPage: page * limit < totalCoupons,
				hasPrevPage: page > 1
			}
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Create Coupon (Admin)======================================

export const createCoupon = async (req, res, next) => {
	try {
		const { 
			code, 
			description, 
			discountType, 
			discountValue, 
			minimumAmount, 
			maximumUsage, 
			expiryDate 
		} = req.body;

		// Check if coupon code already exists
		const existingCoupon = await couponModel.findOne({ code });
		if (existingCoupon) {
			return res.status(400).json({
				success: false,
				message: "Coupon code already exists"
			});
		}

		const coupon = await couponModel.create({
			code,
			description,
			discountType,
			discountValue,
			minimumAmount,
			maxUsage: maximumUsage,
			expiryDate: new Date(expiryDate),
			isActive: true
		});

		res.status(201).json({
			success: true,
			message: "Coupon created successfully",
			data: coupon
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Update Coupon (Admin)======================================

export const updateCoupon = async (req, res, next) => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		// If updating code, check if it already exists
		if (updateData.code) {
			const existingCoupon = await couponModel.findOne({ 
				code: updateData.code, 
				_id: { $ne: id } 
			});
			if (existingCoupon) {
				return res.status(400).json({
					success: false,
					message: "Coupon code already exists"
				});
			}
		}

		// Convert expiryDate to Date if provided
		if (updateData.expiryDate) {
			updateData.expiryDate = new Date(updateData.expiryDate);
		}

		const coupon = await couponModel.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		);

		if (!coupon) {
			return res.status(404).json({
				success: false,
				message: "Coupon not found"
			});
		}

		res.json({
			success: true,
			message: "Coupon updated successfully",
			data: coupon
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Delete Coupon (Admin)======================================

export const deleteCoupon = async (req, res, next) => {
	try {
		const { id } = req.params;

		const coupon = await couponModel.findByIdAndDelete(id);

		if (!coupon) {
			return res.status(404).json({
				success: false,
				message: "Coupon not found"
			});
		}

		res.json({
			success: true,
			message: "Coupon deleted successfully"
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Toggle Coupon Status (Admin)======================================

export const toggleCouponStatus = async (req, res, next) => {
	try {
		const { id } = req.params;

		const coupon = await couponModel.findById(id);

		if (!coupon) {
			return res.status(404).json({
				success: false,
				message: "Coupon not found"
			});
		}

		coupon.isActive = !coupon.isActive;
		await coupon.save();

		res.json({
			success: true,
			message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
			data: coupon
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
}; 