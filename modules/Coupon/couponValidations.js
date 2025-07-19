import Joi from "joi";

//==================================Coupon Validation Schemas======================================

export const validateCouponValidator = Joi.object({
   code: Joi.string().required().min(3).max(20).trim()
}); 