import Joi from "joi";

//==================================Coupon Validation Schemas======================================

const objectId = Joi.string().hex().length(24);

export const validateCouponValidator = Joi.object({
   code: Joi.string().required().min(3).max(20).trim()
});

// The admin form sends `discountValue` + `discountType` and `valiedEmail`;
// `discountPercentage` and `email` are accepted as well.
export const createCouponValidator = Joi.object({
   code: Joi.string().required().min(3).max(20).trim(),
   discountPercentage: Joi.number().min(1).max(100),
   discountValue: Joi.number().min(1).max(100),
   discountType: Joi.string().valid("percentage").messages({
      "any.only": "Only percentage discounts are supported"
   }),
   expiryDate: Joi.date().greater("now").required(),
   email: Joi.string().email(),
   valiedEmail: Joi.string().email(),
   description: Joi.any().strip(),
   minimumAmount: Joi.any().strip(),
   maximumUsage: Joi.any().strip()
})
   .xor("discountPercentage", "discountValue")
   .xor("email", "valiedEmail");

export const updateCouponValidator = Joi.object({
   code: Joi.string().min(3).max(20).trim(),
   discountPercentage: Joi.number().min(1).max(100),
   discountValue: Joi.number().min(1).max(100),
   discountType: Joi.string().valid("percentage").messages({
      "any.only": "Only percentage discounts are supported"
   }),
   expiryDate: Joi.date(),
   isActive: Joi.boolean(),
   description: Joi.any().strip(),
   minimumAmount: Joi.any().strip(),
   maximumUsage: Joi.any().strip()
})
   .oxor("discountPercentage", "discountValue")
   .min(1);

export const couponIdValidator = Joi.object({
   id: objectId.required()
});
