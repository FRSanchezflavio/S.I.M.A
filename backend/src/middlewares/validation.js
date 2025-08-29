const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

/**
 * Common validation patterns and utilities
 */
const patterns = {
  dni: /^\d{7,9}$/,
  phone: /^[+\d][\d\s\-()]{6,20}$/,
  username: /^[a-zA-Z0-9_]{3,30}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

/**
 * Common validation schemas
 */
const commonSchemas = {
  id: Joi.number().integer().positive(),
  
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10),
  }),

  search: Joi.object({
    q: Joi.string().max(200).optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10),
    format: Joi.string().valid('json', 'csv', 'xlsx').default('json'),
  }),

  dateRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
  }),
};

/**
 * Validation schemas for different entities
 */
const schemas = {
  // Auth schemas
  login: Joi.object({
    usuario: Joi.string().pattern(patterns.username).required(),
    password: Joi.string().min(6).max(100).required(),
  }),

  changePassword: Joi.object({
    actual: Joi.string().min(8).max(100).required(),
    nueva: Joi.string().min(8).max(100).required(),
  }),

  adminChangePassword: Joi.object({
    nueva: Joi.string().min(8).max(100).required(),
  }),

  // User schemas
  createUser: Joi.object({
    usuario: Joi.string().pattern(patterns.username).required(),
    nombre: Joi.string().min(2).max(100).required(),
    apellido: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().optional().allow('', null),
    rol: Joi.string().valid('admin', 'usuario').required(),
    activo: Joi.boolean().default(true),
  }),

  updateUser: Joi.object({
    usuario: Joi.string().pattern(patterns.username).optional(),
    nombre: Joi.string().min(2).max(100).optional(),
    apellido: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional().allow('', null),
    rol: Joi.string().valid('admin', 'usuario').optional(),
    activo: Joi.boolean().optional(),
  }),

  // Persona schemas
  createPersona: Joi.object({
    nombre: Joi.string().min(2).max(100).required(),
    apellido: Joi.string().min(2).max(100).required(),
    dni: Joi.string().pattern(patterns.dni).required(),
    fecha_nacimiento: Joi.date().max('now').optional().allow(null),
    nacionalidad: Joi.string().max(100).optional().allow('', null),
    direccion: Joi.string().max(500).optional().allow('', null),
    telefono: Joi.string().pattern(patterns.phone).optional().allow('', null),
    email: Joi.string().email().optional().allow('', null),
    observaciones: Joi.string().max(2000).optional().allow('', null),
    comisaria: Joi.string().max(200).optional().allow('', null),
  }),

  updatePersona: Joi.object({
    nombre: Joi.string().min(2).max(100).optional(),
    apellido: Joi.string().min(2).max(100).optional(),
    dni: Joi.string().pattern(patterns.dni).optional(),
    fecha_nacimiento: Joi.date().max('now').optional().allow(null),
    nacionalidad: Joi.string().max(100).optional().allow('', null),
    direccion: Joi.string().max(500).optional().allow('', null),
    telefono: Joi.string().pattern(patterns.phone).optional().allow('', null),
    email: Joi.string().email().optional().allow('', null),
    observaciones: Joi.string().max(2000).optional().allow('', null),
    comisaria: Joi.string().max(200).optional().allow('', null),
  }),

  searchPersonas: commonSchemas.search.keys({
    dni: Joi.string().pattern(patterns.dni).optional(),
    comisaria: Joi.string().max(200).optional(),
  }),

  // Registro schemas
  createRegistro: Joi.object({
    persona_id: Joi.number().integer().positive().required(),
    tipo_delito: Joi.string().min(2).max(100).required(),
    lugar: Joi.string().max(200).optional().allow('', null),
    estado: Joi.string().max(100).optional().allow('', null),
    juzgado: Joi.string().max(100).optional().allow('', null),
    detalle: Joi.string().max(2000).optional().allow('', null),
  }),

  updateRegistro: Joi.object({
    persona_id: Joi.number().integer().positive().optional(),
    tipo_delito: Joi.string().min(2).max(100).optional(),
    lugar: Joi.string().max(200).optional().allow('', null),
    estado: Joi.string().max(100).optional().allow('', null),
    juzgado: Joi.string().max(100).optional().allow('', null),
    detalle: Joi.string().max(2000).optional().allow('', null),
  }),

  searchRegistros: commonSchemas.search.keys({
    persona_id: Joi.number().integer().positive().optional(),
  }),
};

/**
 * Creates a validation middleware for a specific schema
 * @param {Object} schema - Joi schema to validate against
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @param {Object} options - Validation options
 * @returns {Function} - Express middleware function
 */
function validate(schema, property = 'body', options = {}) {
  const defaultOptions = {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
    ...options
  };

  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], defaultOptions);
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));
      
      throw new ValidationError('Datos de entrada inválidos', details);
    }
    
    req[property] = value;
    next();
  };
}

/**
 * Validates request parameters (usually IDs)
 * @param {Object} paramSchema - Schema for parameters
 * @returns {Function} - Express middleware function
 */
function validateParams(paramSchema) {
  return validate(paramSchema, 'params');
}

/**
 * Validates query parameters
 * @param {Object} querySchema - Schema for query parameters
 * @returns {Function} - Express middleware function
 */
function validateQuery(querySchema) {
  return validate(querySchema, 'query', { allowUnknown: true });
}

/**
 * Validates request body
 * @param {Object} bodySchema - Schema for request body
 * @returns {Function} - Express middleware function
 */
function validateBody(bodySchema) {
  return validate(bodySchema, 'body');
}

/**
 * Common parameter validation for ID
 */
const validateId = validateParams(Joi.object({
  id: commonSchemas.id.required(),
}));

/**
 * Common query validation for pagination
 */
const validatePagination = validateQuery(commonSchemas.pagination);

/**
 * Common query validation for search
 */
const validateSearch = validateQuery(commonSchemas.search);

/**
 * Validation middleware factory that combines multiple validations
 * @param {Object} validations - Object with validation configurations
 * @returns {Array} - Array of middleware functions
 */
function multiValidate(validations) {
  const middlewares = [];
  
  if (validations.params) {
    middlewares.push(validateParams(validations.params));
  }
  
  if (validations.query) {
    middlewares.push(validateQuery(validations.query));
  }
  
  if (validations.body) {
    middlewares.push(validateBody(validations.body));
  }
  
  return middlewares;
}

module.exports = {
  patterns,
  schemas,
  validate,
  validateParams,
  validateQuery,
  validateBody,
  validateId,
  validatePagination,
  validateSearch,
  multiValidate,
};