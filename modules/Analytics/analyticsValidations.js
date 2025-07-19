import Joi from "joi";

//==================================Analytics Validation Schemas======================================

export const dateRangeValidator = Joi.object({
   startDate: Joi.date().required(),
   endDate: Joi.date().required().min(Joi.ref('startDate'))
}); 