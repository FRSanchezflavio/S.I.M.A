/**
 * Enhanced sanitization utilities for preventing XSS and SQL injection
 * Provides comprehensive data cleaning functionality
 */

/**
 * Sanitizes a string by removing or replacing dangerous characters
 * @param {string} s - String to sanitize
 * @returns {string|*} - Sanitized string or original value if not string
 */
function sanitizeString(s) {
  if (typeof s !== 'string') return s;
  
  return s
    // Remove null bytes, backspace, tab, newline, carriage return, substitute
    .replace(/[\0\b\t\n\r\x1a]/g, ' ')
    // Remove or escape SQL injection characters
    .replace(/['"]/g, '')  // Remove quotes entirely for safety
    // Remove script tags and javascript
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove dangerous HTML attributes
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Clean up multiple spaces and trim
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deep sanitization for HTML content (more permissive than sanitizeString)
 * @param {string} html - HTML content to sanitize
 * @returns {string|*} - Sanitized HTML or original value
 */
function sanitizeHtml(html) {
  if (typeof html !== 'string') return html;
  
  return html
    // Remove dangerous script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Remove iframe, object, embed tags
    .replace(/<(iframe|object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
    // Clean form elements that could be dangerous
    .replace(/<(form|input|button|textarea|select|option)\b[^>]*>/gi, '')
    .trim();
}

/**
 * Sanitizes SQL LIKE pattern to prevent wildcard injection
 * @param {string} pattern - Search pattern
 * @returns {string} - Sanitized pattern
 */
function sanitizeLikePattern(pattern) {
  if (typeof pattern !== 'string') return pattern;
  
  return pattern
    .replace(/[%_]/g, '\\$&') // Escape SQL wildcards
    .replace(/[\0\b\t\n\r\x1a'"\\]/g, '') // Remove dangerous chars
    .trim()
    .slice(0, 100); // Limit length
}

/**
 * Sanitizes an object recursively, applying appropriate sanitization to each field
 * @param {Object} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Object|*} - Sanitized object or original value
 */
function sanitizeObject(obj, options = {}) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const { 
    htmlFields = [], // Fields that can contain HTML
    skipFields = [], // Fields to skip sanitization
    maxLength = 10000 // Max length for string fields
  } = options;
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip fields that shouldn't be sanitized
    if (skipFields.includes(key)) {
      sanitized[key] = value;
      continue;
    }
    
    // Handle nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value, options);
      continue;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'object' ? sanitizeObject(item, options) : 
        typeof item === 'string' ? sanitizeString(item).slice(0, maxLength) : 
        item
      );
      continue;
    }
    
    // Handle strings
    if (typeof value === 'string') {
      if (htmlFields.includes(key)) {
        sanitized[key] = sanitizeHtml(value).slice(0, maxLength);
      } else {
        sanitized[key] = sanitizeString(value).slice(0, maxLength);
      }
      continue;
    }
    
    // Pass through other types as-is
    sanitized[key] = value;
  }
  
  return sanitized;
}

/**
 * Validates and sanitizes email addresses
 * @param {string} email - Email to validate
 * @returns {string|null} - Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return null;
  
  const cleanEmail = email.toLowerCase().trim().slice(0, 254); // RFC limit
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailRegex.test(cleanEmail) ? cleanEmail : null;
}

/**
 * Sanitizes phone numbers
 * @param {string} phone - Phone number to sanitize
 * @returns {string|null} - Sanitized phone or null if invalid
 */
function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  
  // Remove all non-digit and non-plus characters, keep spaces and dashes for formatting
  const cleaned = phone.replace(/[^\d\s\-\+\(\)]/g, '').trim().slice(0, 20);
  
  // Basic validation - should have at least 7 digits
  const digitsOnly = cleaned.replace(/[^\d]/g, '');
  return digitsOnly.length >= 7 ? cleaned : null;
}

/**
 * Sanitizes numeric values with bounds checking
 * @param {*} value - Value to sanitize
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number|null} - Sanitized number or null if invalid
 */
function sanitizeNumber(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return null;
  
  return Math.min(Math.max(num, min), max);
}

/**
 * Creates a sanitization middleware for Express
 * @param {Object} options - Sanitization options
 * @returns {Function} - Express middleware function
 */
function sanitizationMiddleware(options = {}) {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, options);
    }
    
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query, { ...options, maxLength: 200 });
    }
    
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params, { ...options, maxLength: 100 });
    }
    
    next();
  };
}

module.exports = { 
  sanitizeString, 
  sanitizeHtml,
  sanitizeLikePattern,
  sanitizeObject,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumber,
  sanitizationMiddleware
};
