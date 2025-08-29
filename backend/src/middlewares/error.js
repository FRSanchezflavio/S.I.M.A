const { AppError } = require('../utils/errors');

/**
 * Handles 404 errors for unmatched routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
function notFoundHandler(req, res, next) {
  const error = new AppError('Recurso no encontrado', 404, 'ROUTE_NOT_FOUND');
  error.path = req.path;
  error.method = req.method;
  next(error);
}

/**
 * Central error handling middleware
 * Processes all application errors and sends appropriate responses
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  // Convert non-AppError instances to AppError
  if (!(error instanceof AppError)) {
    // Handle specific error types
    if (error.name === 'ValidationError') {
      error = new AppError(error.message, 400, 'VALIDATION_ERROR');
    } else if (error.name === 'CastError') {
      error = new AppError('Invalid data format', 400, 'CAST_ERROR');
    } else if (error.code === '23505') { // PostgreSQL unique violation
      error = new AppError('Resource already exists', 409, 'DUPLICATE_ERROR');
    } else if (error.code === '23503') { // PostgreSQL foreign key violation
      error = new AppError('Referenced resource not found', 400, 'REFERENCE_ERROR');
    } else if (error.code === '23502') { // PostgreSQL not null violation
      error = new AppError('Required field missing', 400, 'REQUIRED_FIELD_ERROR');
    } else {
      // Generic server error
      error = new AppError('Error interno del servidor', 500, 'INTERNAL_ERROR');
    }
  }

  // Log error details
  try {
    const logger = require('../utils/logger');
    const logLevel = error.statusCode >= 500 ? 'error' : 'warn';
    
    logger[logLevel]({
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
      },
      request: {
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        userId: req.user?.id,
      },
    }, 'Request error');
  } catch (logError) {
    // Fallback logging
    // eslint-disable-next-line no-console
    console.error('Error logging failed:', logError);
    // eslint-disable-next-line no-console
    console.error('Original error:', err);
  }

  // Prepare response
  const response = {
    error: true,
    message: error.message,
    code: error.code,
  };

  // Add additional details for non-production environments
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.details = error.details;
  }

  // Add validation details if available
  if (error.details) {
    response.details = error.details;
  }

  res.status(error.statusCode).json(response);
}

/**
 * Async error wrapper to handle promise rejections in route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped function with error handling
 */
function asyncErrorHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} target - Target to validate (body, params, query)
 * @returns {Function} - Validation middleware
 */
function validateRequest(schema, target = 'body') {
  return (req, res, next) => {
    const { value, error } = schema.validate(req[target]);
    
    if (error) {
      const validationError = new AppError(error.message, 400, 'VALIDATION_ERROR');
      validationError.details = error.details;
      return next(validationError);
    }
    
    req[target] = value;
    next();
  };
}

module.exports = { 
  notFoundHandler, 
  errorHandler, 
  asyncErrorHandler, 
  validateRequest 
};
