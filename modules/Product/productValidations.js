import Joi from "joi";

//==================================Product Validation Schemas======================================

export const createProductValidator = Joi.object({
   name: Joi.string().required().min(2).max(100).trim(),
   description: Joi.string().required().min(10).max(1000).trim(),
   price: Joi.number().required().min(0),
   stockQuantity: Joi.number().required().min(0),
   image: Joi.string().optional().allow('').trim(), // Optional since images will be uploaded via files
   category: Joi.string().required().min(2).max(50).trim()
});

export const productIdValidator = Joi.object({
   id: Joi.string().required().hex().length(24).messages({
      'string.hex': 'Invalid product ID format',
      'string.length': 'Product ID must be exactly 24 characters'
   })
});

export const categoryValidator = Joi.object({
   category: Joi.string().required().min(2).max(50).trim()
}); 

export const productQueryValidator = Joi.object({
   page: Joi.number().optional().min(1).default(1),
   limit: Joi.number().optional().min(1).max(50).default(10),
   search: Joi.string().optional().max(100).trim().allow(''),
   category: Joi.string().optional().max(50).trim().allow(''),
   sortBy: Joi.string().optional().valid('name', 'price', 'createdAt').default('createdAt'),
   sortOrder: Joi.string().optional().valid('asc', 'desc').default('desc')
}); 