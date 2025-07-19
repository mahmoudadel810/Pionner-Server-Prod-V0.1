import Joi from "joi";

//==================================Cart Validation Schemas======================================

export const addToCartValidator = Joi.object({
   productId: Joi.string().hex().length(24).optional().messages({
      'string.hex': 'Invalid product ID format',
      'string.length': 'Product ID must be exactly 24 characters'
   })
});

export const updateQuantityValidator = Joi.object({
   quantity: Joi.number().required().min(0).max(100)
});

export const productIdValidator = Joi.object({
   id: Joi.string().required().hex().length(24).messages({
      'string.hex': 'Invalid product ID format',
      'string.length': 'Product ID must be exactly 24 characters'
   })
}); 