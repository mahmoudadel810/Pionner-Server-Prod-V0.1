import productModel from "../../DB/models/productModel.js";
import { errorHandler } from "../../utils/errorHandler.js";

//==================================Get Cart Products======================================

export const getCartProducts = async (req, res, next) => {
	try {
		const products = await productModel.find({ _id: { $in: req.user.cartItems } });

		// add quantity for each product
		const cartItems = products.map((product) => {
			const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
			return { ...product.toJSON(), quantity: item.quantity };
		});

		res.json({
			success: true,
			message: "Cart products retrieved successfully",
			data: cartItems
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Add To Cart======================================

export const addToCart = async (req, res, next) => {
	try {
		const { productId } = req.body;
		const user = req.user;

		const existingItem = user.cartItems.find((item) => item.id === productId);
		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			user.cartItems.push(productId);
		}

		await user.save();
		res.json({
			success: true,
			message: "Product added to cart successfully",
			data: user.cartItems
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Remove All From Cart======================================

export const removeAllFromCart = async (req, res, next) => {
	try {
		const { productId } = req.body;
		const user = req.user;
		
		// If no productId is provided, clear the entire cart
		if (!productId) {
			user.cartItems = [];
		} else {
			// Remove specific product from cart
			user.cartItems = user.cartItems.filter((item) => item.id !== productId);
		}
		
		await user.save();
		res.json({
			success: true,
			message: productId ? "Product removed from cart" : "Cart cleared successfully",
			data: user.cartItems
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Update Quantity======================================

export const updateQuantity = async (req, res, next) => {
	try {
		const { id: productId } = req.params;
		const { quantity } = req.body;
		const user = req.user;
		const existingItem = user.cartItems.find((item) => item.id === productId);

		if (existingItem) {
			if (quantity === 0) {
				user.cartItems = user.cartItems.filter((item) => item.id !== productId);
				await user.save();
				return res.json({
					success: true,
					message: "Product removed from cart",
					data: user.cartItems
				});
			}

			existingItem.quantity = quantity;
			await user.save();
			res.json({
				success: true,
				message: "Cart quantity updated successfully",
				data: user.cartItems
			});
		} else {
			res.status(404).json({ 
				success: false,
				message: "Product not found in cart" 
			});
		}
	} catch (error) {
		errorHandler(error, req, res, next);
	}
}; 