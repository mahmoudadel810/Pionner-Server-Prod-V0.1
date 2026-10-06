import Joi from "joi";

export const addToWishlistValidator = Joi.object({
	productId: Joi.string()
		.required()
		.messages({
			"string.empty": "Product ID is required",
			"any.required": "Product ID is required",
		}),
});

export const productIdValidator = Joi.object({
	productId: Joi.string()
		.required()
		.messages({
			"string.empty": "Product ID is required",
			"any.required": "Product ID is required",
		}),
}); 