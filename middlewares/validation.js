export const validation = (schema) => {  
   return (req, res, next) => {
      let validationErrorsArr = [];
      const requestKeys = ["body", "params", "query", "headers"];

      for (const key of requestKeys) {
         if (schema[key]) {
            const validationResult = schema[key].validate(req[key], {
               abortEarly: false
            });

            if (validationResult?.error?.details) {
               validationErrorsArr.push(...validationResult.error.details);
            }
         }
      }

      if (validationErrorsArr.length > 0) {
         // Format error messages to be more user-friendly
         const formattedErrors = validationErrorsArr.map(error => ({
            field: error.path.join('.'),
            message: error.message
         }));

         return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: formattedErrors
         });
      }
      return next();
   };
}; 