import Joi from "joi";

//==================================Base Validation Schemas======================================

const emailSchema = Joi.string().required().email().trim().messages({
   'string.empty': 'Email is required',
   'string.email': 'Please enter a valid email address',
   'any.required': 'Email is required'
});

const passwordSchema = Joi.string()
   .required()
   .min(8)
   .max(50)
   .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
   .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must be less than 50 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
      
   });

const nameSchema = Joi.string().required().min(2).max(50).trim().messages({
   'string.empty': 'Name is required',
   'string.min': 'Name must be at least 2 characters long',
   'string.max': 'Name must be less than 50 characters',
   'any.required': 'Name is required'
});

//==================================Auth Validation Schemas======================================

export const signUpValidator = Joi.object({
   name: nameSchema,
   email: emailSchema,
   phone: Joi.string().required().trim().messages({
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
   }),
   password: passwordSchema,
   confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
      
      'string.empty': 'Please confirm your password',
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password'

   })
});

export const loginValidator = Joi.object({
   email: emailSchema,
   password: Joi.string().required().messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
   })
});

export const forgotPasswordValidator = Joi.object({
   email: emailSchema
});

export const resetPasswordValidator = Joi.object({
   code: Joi.string().required().length(6).messages({
      'string.empty': 'Reset code is required',
      'string.length': 'Reset code must be exactly 6 characters',
      'any.required': 'Reset code is required'
   }),
   newPassword: passwordSchema,
   confirmNewPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({
      'string.empty': 'Please confirm your new password',
      'any.only': 'Passwords do not match must start upper case and includ symbols and number',
      'any.required': 'Please confirm your new password'
   })
});

export const tokenValidator = Joi.object({
   token: Joi.string().required().messages({
      'string.empty': 'Token is required',
      'any.required': 'Token is required'
   })
});

export const updateProfileValidator = Joi.object({
   name: nameSchema.optional(),
   email: emailSchema.optional(),
   phone: Joi.string().optional().trim().messages({
      'string.empty': 'Phone number cannot be empty'
   })
});

export const updatePasswordValidator = Joi.object({
   currentPassword: Joi.string().required().messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required'
   }),
   newPassword: passwordSchema
}); 