import wishlistModel from "../../DB/models/wishlistModel.js";
import productModel from "../../DB/models/productModel.js";
import { errorHandler } from "../../utils/errorHandler.js";

//==================================Get User Wishlist======================================

export const getUserWishlist = async (req, res, next) => {
	try {
		const userId = req.user._id;

		const wishlist = await wishlistModel.getOrCreateWishlist(userId);

		// Filter out inactive products
		const activeProducts = wishlist.products.filter(
			(item) => item.product && item.product.isActive
		);

		res.json({
			success: true,
			message: "Wishlist retrieved successfully",
			data: activeProducts.map((item) => ({
				...item.product.toObject(),
				addedAt: item.addedAt,
			})),
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Add Product to Wishlist======================================

export const addToWishlist = async (req, res, next) => {
	try {
		const { productId } = req.body;
		const userId = req.user._id;

		// Validate product exists and is active
		const product = await productModel.findOne({
			_id: productId,
			isActive: true,
		});

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found or inactive",
			});
		}

		// Get or create wishlist
		const wishlist = await wishlistModel.getOrCreateWishlist(userId);

		// Add product to wishlist
		const wasAdded = await wishlist.addProduct(productId);

		if (!wasAdded) {
			return res.status(400).json({
				success: false,
				message: "Product already in wishlist",
			});
		}

		// Fetch the updated wishlist with populated products
		const updatedWishlist = await wishlistModel.getOrCreateWishlist(userId);

		// Find the newly added product
		const addedProduct = updatedWishlist.products.find(
			(item) => item.product && item.product._id.toString() === productId
		);

		if (!addedProduct || !addedProduct.product) {
			return res.status(500).json({
				success: false,
				message: "Error retrieving added product",
			});
		}

		res.json({
			success: true,
			message: "Product added to wishlist successfully",
			data: {
				...addedProduct.product.toObject(),
				addedAt: addedProduct.addedAt,
			},
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Remove Product from Wishlist======================================

export const removeFromWishlist = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const userId = req.user._id;

		// Get wishlist
		const wishlist = await wishlistModel.getOrCreateWishlist(userId);

		// Remove product from wishlist
		const wasRemoved = await wishlist.removeProduct(productId);

		if (!wasRemoved) {
			return res.status(404).json({
				success: false,
				message: "Product not found in wishlist",
			});
		}

		res.json({
			success: true,
			message: "Product removed from wishlist successfully",
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Clear Wishlist======================================

export const clearWishlist = async (req, res, next) => {
	try {
		const userId = req.user._id;

		// Get wishlist
		const wishlist = await wishlistModel.getOrCreateWishlist(userId);

		// Clear wishlist
		await wishlist.clearWishlist();

		res.json({
			success: true,
			message: "Wishlist cleared successfully",
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Check if Product is in Wishlist======================================

export const checkWishlistStatus = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const userId = req.user._id;

		// Get wishlist
		const wishlist = await wishlistModel.getOrCreateWishlist(userId);

		// Check if product is in wishlist
		const isInWishlist = wishlist.hasProduct(productId);

		res.json({
			success: true,
			data: {
				isInWishlist,
			},
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Wishlist Count======================================

export const getWishlistCount = async (req, res, next) => {
	try {
		const userId = req.user._id;

		// Get wishlist
		const wishlist = await wishlistModel.getOrCreateWishlist(userId);

		// Count active products
		const activeCount = wishlist.products.filter(
			(item) => item.product && item.product.isActive
		).length;

		res.json({
			success: true,
			data: {
				count: activeCount,
			},
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
}; 