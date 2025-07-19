import orderModel from "../../DB/models/orderModel.js";
import productModel from "../../DB/models/productModel.js";
import userModel from "../../DB/models/userModel.js";
import { errorHandler } from "../../utils/errorHandler.js";

//==================================Get Analytics Data======================================

export const getAnalyticsData = async (req, res, next) => {
	try {
		// Basic counts
		const totalUsers = await userModel.countDocuments();
		const totalProducts = await productModel.countDocuments();
		const featuredProducts = await productModel.countDocuments({ isFeatured: true });
		const recommendedProducts = await productModel.countDocuments({ isRecommended: true });

		// Sales and revenue analytics
		const salesData = await orderModel.aggregate([
			{
				$group: {
					_id: null,
					totalSales: { $sum: 1 },
					totalRevenue: { $sum: "$totalAmount" },
					avgOrderValue: { $avg: "$totalAmount" },
				},
			},
		]);

		const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

		const analyticsData = {
			users: totalUsers,
			products: totalProducts,
			totalSales,
			totalRevenue,
		};

		res.json({
			success: true,
			message: "Analytics data retrieved successfully",
			data: analyticsData
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Daily Sales Data======================================

export const getDailySalesData = async (req, res, next) => {
	try {
		const { startDate, endDate } = req.query;

		if (!startDate || !endDate) {
			return res.status(400).json({
				success: false,
				message: "Start date and end date are required"
			});
		}

		const start = new Date(startDate);
		const end = new Date(endDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			return res.status(400).json({
				success: false,
				message: "Invalid date format"
			});
		}

		const dailySalesData = await orderModel.aggregate([
			{
				$match: {
					createdAt: {
						$gte: start,
						$lte: end,
					},
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					sales: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		const dateArray = getDatesInRange(start, end);

		const result = dateArray.map((date) => {
			const foundData = dailySalesData.find((item) => item._id === date);

			return {
				date,
				sales: foundData?.sales || 0,
				revenue: foundData?.revenue || 0,
			};
		});

		res.json({
			success: true,
			message: "Daily sales data retrieved successfully",
			data: result
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Helper Functions======================================

function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		dates.push(currentDate.toISOString().split("T")[0]);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
} 