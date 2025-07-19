import Joi from "joi";

//==================================Order Validation Schemas======================================

export const orderIdValidator = Joi.object({
   id: Joi.string().required().hex().length(24).messages({
      'string.hex': 'Invalid order ID format',
      'string.length': 'Order ID must be exactly 24 characters'
   })
});

export const updateOrderStatusValidator = Joi.object({
   status: Joi.string().required().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
});

export const updatePaymentStatusValidator = Joi.object({
   paymentStatus: Joi.string().required().valid('pending', 'paid', 'failed', 'refunded')
});

export const orderQueryValidator = Joi.object({
   page: Joi.number().optional().min(1).default(1),
   limit: Joi.number().optional().min(1).max(50).default(10),
   status: Joi.string().optional().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
   paymentStatus: Joi.string().optional().valid('pending', 'paid', 'failed', 'refunded'),
   categoryId: Joi.string().optional().hex().length(24)
});

export const createOrderValidator = Joi.object({
   products: Joi.array().items(
      Joi.object({
         productId: Joi.string().required().hex().length(24).messages({
            'string.hex': 'Invalid product ID format',
            'string.length': 'Product ID must be exactly 24 characters'
         }),
         quantity: Joi.number().required().min(1).max(100).messages({
            'number.min': 'Quantity must be at least 1',
            'number.max': 'Quantity cannot exceed 100'
         })
      })
   ).min(1).required().messages({
      'array.min': 'At least one product is required',
      'array.base': 'Products must be an array'
   }),
   shippingAddress: Joi.object({
      street: Joi.string().required().min(5).max(200).messages({
         'string.min': 'Street address must be at least 5 characters',
         'string.max': 'Street address cannot exceed 200 characters'
      }),
      city: Joi.string().required().min(2).max(50).messages({
         'string.min': 'City must be at least 2 characters',
         'string.max': 'City cannot exceed 50 characters'
      }),
      state: Joi.string().required().min(2).max(50).messages({
         'string.min': 'State must be at least 2 characters',
         'string.max': 'State cannot exceed 50 characters'
      }),
      zipCode: Joi.string().required().min(3).max(20).messages({
         'string.min': 'Zip code must be at least 3 characters',
         'string.max': 'Zip code cannot exceed 20 characters'
      }),
      country: Joi.string().required().min(2).max(50).messages({
         'string.min': 'Country must be at least 2 characters',
         'string.max': 'Country cannot exceed 50 characters'
      })
   }).required(),
   stripeSessionId: Joi.string().optional().max(255)
}); 