const rateLimit = require('express-rate-limit');

/**
 * Rate limiting configurations for different types of operations
 * Provides centralized rate limiting setup for security
 */

/**
 * Strict rate limiting for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    error: true,
    message: 'Demasiados intentos de autenticación, intente más tarde.',
    retryAfter: '15 minutos'
  },
  // Custom key generator for better tracking
  keyGenerator: (req) => {
    return req.ip + ':' + (req.headers['user-agent'] || 'unknown');
  },
  // Skip successful requests from counting against limit
  skipSuccessfulRequests: true,
});

/**
 * Moderate rate limiting for API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiadas solicitudes, intente más tarde.',
    retryAfter: '15 minutos'
  },
});

/**
 * Stricter rate limiting for resource creation endpoints
 */
const createLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Max 20 creates per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiadas operaciones de creación, intente más tarde.',
    retryAfter: '5 minutos'
  },
});

/**
 * Very strict rate limiting for export/download operations
 */
const exportLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Max 5 exports per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiadas exportaciones, intente más tarde.',
    retryAfter: '10 minutos'
  },
});

/**
 * Rate limiting for password change operations
 */
const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 password changes per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiados cambios de contraseña, intente más tarde.',
    retryAfter: '1 hora'
  },
});

/**
 * Custom rate limiter factory for specific needs
 * @param {Object} options - Rate limiting options
 * @returns {Function} - Rate limiting middleware
 */
function createCustomLimiter(options) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests',
    skipSuccessfulRequests = false,
    keyGenerator = null
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: true,
      message,
      retryAfter: `${Math.ceil(windowMs / (60 * 1000))} minutos`
    },
    skipSuccessfulRequests,
    keyGenerator,
  });
}

/**
 * Rate limiter for search operations with different limits for authenticated users
 * @param {Object} req - Express request
 * @returns {string} - Rate limiting key
 */
const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: (req) => {
    // Authenticated users get higher limits
    return req.user ? 50 : 20;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiadas búsquedas, intente más tarde.',
    retryAfter: '5 minutos'
  },
  keyGenerator: (req) => {
    // Use user ID for authenticated users, IP for others
    return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
  createLimiter,
  exportLimiter,
  passwordLimiter,
  searchLimiter,
  createCustomLimiter,
};