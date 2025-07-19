import Joi from "joi";

//==================================Payment Validation Schemas======================================

export const createCheckoutSessionValidator = Joi.object({
   products: Joi.array().items(
      Joi.object({
         _id: Joi.string().required().hex().length(24),
         name: Joi.string().required(),
         price: Joi.number().required().min(0),
         image: Joi.string().optional(),
         quantity: Joi.number().required().min(1)
      })
   ).required().min(1),
   couponCode: Joi.string().optional().allow('', null)
});

export const checkoutSuccessValidator = Joi.object({
   sessionId: Joi.string().required()
}); 