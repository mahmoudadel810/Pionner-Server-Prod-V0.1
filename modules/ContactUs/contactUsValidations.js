import Joi from "joi";

//==================================Contact Validation Schemas======================================

export const contactValidator = Joi.object({
   name: Joi.string().required().min(2).max(50).trim().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must be less than 50 characters long'
   }),
   email: Joi.string().required().email().trim().messages({
      'string.empty': 'Email is required',
      'string.email': 'Invalid email address'
   }),
   subject: Joi.string().required().min(5).max(100).trim().messages({
      'string.empty': 'Subject is required',
      'string.min': 'Subject must be at least 5 characters long',
      'string.max': 'Subject must be less than 100 characters long'
   }),
   message: Joi.string().required().min(10).max(1000).trim().messages({
      'string.empty': 'Message is required',
      'string.min': 'Message must be at least 10 characters long',
      'string.max': 'Message must be less than 1000 characters long'
   })
});

export const contactIdValidator = Joi.object({
   id: Joi.string().required().hex().length(24).messages({
      'string.empty': 'Contact ID is required',
      'string.hex': 'Invalid contact ID format',
      'string.length': 'Invalid contact ID length',
      'any.required': 'Contact ID is required'
   })
});

