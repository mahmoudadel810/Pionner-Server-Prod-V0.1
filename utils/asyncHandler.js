/**
 * Wraps async route handlers to automatically catch and forward errors to Express error handling middleware
 * @param {Function} fn - The async function to wrap
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 