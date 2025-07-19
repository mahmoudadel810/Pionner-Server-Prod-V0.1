import orderModel from "../../DB/models/orderModel.js";
import userModel from "../../DB/models/userModel.js";
import productModel from "../../DB/models/productModel.js";
import categoryModel from "../../DB/models/categoryModel.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { paginationHelper, buildSearchQuery, buildPaginationResponse } from "../../utils/pagination.js";
import mongoose from "mongoose";

//==================================Create Order======================================

export const createOrder = async (req, res, next) => {
	try {
		const { products, shippingAddress, stripeSessionId } = req.body;
		const userId = req.user._id;

		// Validate products array
		if (!products || !Array.isArray(products) || products.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Products array is required and cannot be empty"
			});
		}

		// Fetch product details and calculate total
		let totalAmount = 0;
		const orderProducts = [];

		for (const item of products) {
			const product = await productModel.findById(item.productId)
				.populate('categoryId', 'name slug');

			if (!product) {
				return res.status(404).json({
					success: false,
					message: `Product with ID ${item.productId} not found`
				});
			}

			// Check if product is active
			if (!product.isActive) {
				return res.status(400).json({
					success: false,
					message: `Product ${product.name} is not available`
				});
			}

			// Check stock availability
			if (product.stockQuantity < item.quantity) {
				return res.status(400).json({
					success: false,
					message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
				});
			}

			if (item.quantity < 1) {
				return res.status(400).json({
					success: false,
					message: `Quantity must be at least 1 for product ${product.name}`
				});
			}

			const itemTotal = product.price * item.quantity;
			totalAmount += itemTotal;

			orderProducts.push({
				product: product._id,
				quantity: item.quantity,
				price: product.price,
				category: product.category,
				categoryId: product.categoryId._id,
				productName: product.name,
				productImage: product.image
			});

			// Update product stock and analytics
			await product.updateStockAfterOrder(item.quantity);
			await product.updateRevenue(itemTotal);
		}

		// Create order
		const order = await orderModel.create({
			user: userId,
			products: orderProducts,
			totalAmount,
			shippingAddress,
			stripeSessionId
		});

		// Populate the created order
		const populatedOrder = await orderModel.findById(order._id)
			.populate('user', 'name email')
			.populate('products.product', 'name image price description')
			.populate('categoryBreakdown.categoryId', 'name slug');

		res.status(201).json({
			success: true,
			message: "Order created successfully",
			data: populatedOrder
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get User Orders======================================

export const getUserOrders = async (req, res, next) => {
	try {
		const { page = 1, limit = 10, status } = req.query;
		const skip = (page - 1) * limit;

		let query = { user: req.user._id };
		if (status) {
			query.status = status;
		}

		const orders = await orderModel.find(query)
			.populate('products.product', 'name image price')
			.populate('categoryBreakdown.categoryId', 'name slug')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const totalOrders = await orderModel.countDocuments(query);

		res.json({
			success: true,
			message: "User orders retrieved successfully",
			data: orders,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(totalOrders / limit),
				totalOrders,
				hasNextPage: page * limit < totalOrders,
				hasPrevPage: page > 1
			}
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get All Orders (Admin)======================================

export const getAllOrders = async (req, res, next) => {
	try {
		const { page = 1, limit = 10, status, categoryId, paymentStatus } = req.query;
		const skip = (page - 1) * limit;

		let query = {};
		if (status) {
			query.status = status;
		}
		if (paymentStatus) {
			query.paymentStatus = paymentStatus;
		}
		if (categoryId) {
			query['categoryBreakdown.categoryId'] = categoryId;
		}

		const orders = await orderModel.find(query)
			.populate('user', 'name email')
			.populate('products.product', 'name image price')
			.populate('categoryBreakdown.categoryId', 'name slug')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const totalOrders = await orderModel.countDocuments(query);

		res.json({
			success: true,
			message: "All orders retrieved successfully",
			data: orders,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(totalOrders / limit),
				totalOrders,
				hasNextPage: page * limit < totalOrders,
				hasPrevPage: page > 1
			}
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Order By ID======================================

export const getOrderById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const order = await orderModel.findById(id)
			.populate('user', 'name email')
			.populate('products.product', 'name image price description')
			.populate('categoryBreakdown.categoryId', 'name slug');

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found"
			});
		}

		// Check if user can access this order
		if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				success: false,
				message: "Access denied. You can only view your own orders."
			});
		}

		res.json({
			success: true,
			message: "Order retrieved successfully",
			data: order
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Update Order Status (Admin)======================================

export const updateOrderStatus = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		const order = await orderModel.findByIdAndUpdate(
			id,
			{ status },
			{ new: true }
		)
		.populate('user', 'name email')
		.populate('categoryBreakdown.categoryId', 'name slug');

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found"
			});
		}

		res.json({
			success: true,
			message: "Order status updated successfully",
			data: order
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Update Payment Status======================================

export const updatePaymentStatus = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { paymentStatus } = req.body;

		const order = await orderModel.findByIdAndUpdate(
			id,
			{ paymentStatus },
			{ new: true }
		)
		.populate('user', 'name email')
		.populate('categoryBreakdown.categoryId', 'name slug');

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found"
			});
		}

		res.json({
			success: true,
			message: "Payment status updated successfully",
			data: order
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Delete Order (Admin)======================================

export const deleteOrder = async (req, res, next) => {
	try {
		const { id } = req.params;
		const order = await orderModel.findByIdAndDelete(id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found"
			});
		}

		res.json({
			success: true,
			message: "Order deleted successfully"
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Orders Analytics (Admin)======================================

export const getOrdersAnalytics = async (req, res, next) => {
	try {
		const { period = '30d' } = req.query;
		
		// Calculate date range
		const now = new Date();
		let startDate;
		
		switch (period) {
			case '7d':
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case '30d':
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case '90d':
				startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			default:
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		}

		// Get analytics data
		const analytics = await orderModel.aggregate([
			{
				$match: {
					createdAt: { $gte: startDate },
					paymentStatus: 'paid'
				}
			},
			{
				$group: {
					_id: null,
					totalOrders: { $sum: 1 },
					totalRevenue: { $sum: '$totalAmount' },
					averageOrderValue: { $avg: '$totalAmount' },
					totalItems: { $sum: '$totalItems' }
				}
			}
		]);

		// Get category-wise analytics
		const categoryAnalytics = await orderModel.aggregate([
			{
				$match: {
					createdAt: { $gte: startDate },
					paymentStatus: 'paid'
				}
			},
			{
				$unwind: '$categoryBreakdown'
			},
			{
				$group: {
					_id: '$categoryBreakdown.categoryId',
					categoryName: { $first: '$categoryBreakdown.categoryName' },
					totalOrders: { $sum: 1 },
					totalRevenue: { $sum: '$categoryBreakdown.totalAmount' },
					totalItems: { $sum: '$categoryBreakdown.itemCount' }
				}
			},
			{
				$sort: { totalRevenue: -1 }
			}
		]);

		// Get status distribution
		const statusDistribution = await orderModel.aggregate([
			{
				$match: {
					createdAt: { $gte: startDate }
				}
			},
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 }
				}
			}
		]);

		const result = {
			period,
			overview: analytics[0] || {
				totalOrders: 0,
				totalRevenue: 0,
				averageOrderValue: 0,
				totalItems: 0
			},
			categoryAnalytics,
			statusDistribution
		};

		res.json({
			success: true,
			message: "Orders analytics retrieved successfully",
			data: result
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Product Analytics (Admin)======================================

export const getProductAnalytics = async (req, res, next) => {
	try {
		const { period = '30d', categoryId } = req.query;
		
		// Calculate date range
		const now = new Date();
		let startDate;
		
		switch (period) {
			case '7d':
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case '30d':
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case '90d':
				startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			default:
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		}

		// Build match conditions
		let matchConditions = {
			createdAt: { $gte: startDate },
			paymentStatus: 'paid'
		};

		if (categoryId) {
			matchConditions['categoryBreakdown.categoryId'] = new mongoose.Types.ObjectId(categoryId);
		}

		// Get product performance analytics
		const productAnalytics = await orderModel.aggregate([
			{
				$match: matchConditions
			},
			{
				$unwind: '$products'
			},
			{
				$group: {
					_id: '$products.product',
					productName: { $first: '$products.productName' },
					productImage: { $first: '$products.productImage' },
					categoryName: { $first: '$products.category' },
					totalOrders: { $sum: 1 },
					totalQuantity: { $sum: '$products.quantity' },
					totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
					averageOrderValue: { $avg: { $multiply: ['$products.price', '$products.quantity'] } }
				}
			},
			{
				$sort: { totalRevenue: -1 }
			},
			{
				$limit: 20
			}
		]);

		// Get stock analytics
		const stockAnalytics = await productModel.aggregate([
			{
				$match: { isActive: true }
			},
			{
				$group: {
					_id: null,
					totalProducts: { $sum: 1 },
					inStockProducts: { $sum: { $cond: [{ $gt: ['$stockQuantity', 0] }, 1, 0] } },
					outOfStockProducts: { $sum: { $cond: [{ $eq: ['$stockQuantity', 0] }, 1, 0] } },
					lowStockProducts: { $sum: { $cond: [{ $lte: ['$stockQuantity', '$minimumStock'] }, 1, 0] } },
					totalStockValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } }
				}
			}
		]);

		// Get best selling products
		const bestSellingProducts = await productModel.getBestSellingProducts(10);

		// Get highest revenue products
		const highestRevenueProducts = await productModel.getHighestRevenueProducts(10);

		// Get low stock products
		const lowStockProducts = await productModel.getLowStockProducts();

		const result = {
			period,
			productPerformance: productAnalytics,
			stockOverview: stockAnalytics[0] || {
				totalProducts: 0,
				inStockProducts: 0,
				outOfStockProducts: 0,
				lowStockProducts: 0,
				totalStockValue: 0
			},
			bestSellingProducts,
			highestRevenueProducts,
			lowStockProducts
		};

		res.json({
			success: true,
			message: "Product analytics retrieved successfully",
			data: result
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Orders By Category (Admin)======================================

export const getOrdersByCategory = async (req, res, next) => {
	try {
		const { categoryId } = req.params;
		const { page = 1, limit = 10, status } = req.query;
		const skip = (page - 1) * limit;

		// Verify category exists
		const category = await categoryModel.findById(categoryId);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found"
			});
		}

		let query = { 'categoryBreakdown.categoryId': categoryId };
		if (status) {
			query.status = status;
		}

		const orders = await orderModel.find(query)
			.populate('user', 'name email')
			.populate('products.product', 'name image price')
			.populate('categoryBreakdown.categoryId', 'name slug')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const totalOrders = await orderModel.countDocuments(query);

		res.json({
			success: true,
			message: `Orders for category ${category.name} retrieved successfully`,
			data: orders,
			category: {
				id: category._id,
				name: category.name,
				slug: category.slug
			},
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(totalOrders / limit),
				totalOrders,
				hasNextPage: page * limit < totalOrders,
				hasPrevPage: page > 1
			}
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
}; 

//==================================Cancel Order (User)======================================

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the order and ensure it belongs to the user
    const order = await orderModel.findOne({ _id: id, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or access denied."
      });
    }

    // Only allow cancellation if status is pending or processing
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in its current status: ${order.status}`
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully.",
      data: order
    });
  } catch (error) {
    errorHandler(error, req, res, next);
  }
}; 