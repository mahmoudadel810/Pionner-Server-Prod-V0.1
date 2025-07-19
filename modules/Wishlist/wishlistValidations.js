import Joi from "joi";

// Validation for adding product to wishlist
export const addToWishlistValidator = Joi.object({
	productId: Joi.string()
		.required()
		.messages({
			"string.empty": "Product ID is required",
			"any.required": "Product ID is required",
		}),
});

// Validation for product ID parameter
export const productIdValidator = Joi.object({
	productId: Joi.string()
		.required()
		.messages({
			"string.empty": "Product ID is required",
			"any.required": "Product ID is required",
		}),
}); 