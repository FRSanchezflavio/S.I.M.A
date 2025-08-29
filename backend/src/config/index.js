const path = require('path');

/**
 * Centralized configuration management
 * Provides type-safe configuration access with defaults
 */

/**
 * Gets environment variable with type conversion and validation
 * @param {string} name - Environment variable name
 * @param {*} defaultValue - Default value if not set
 * @param {string} type - Expected type ('string', 'number', 'boolean', 'array')
 * @returns {*} - Converted value
 */
function getEnvVar(name, defaultValue, type = 'string') {
  const value = process.env[name];
  
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  
  switch (type) {
    case 'number':
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
      
    case 'boolean':
      return value.toLowerCase() === 'true' || value === '1';
      
    case 'array':
      return value.split(',').map(item => item.trim()).filter(Boolean);
      
    default:
      return value;
  }
}

/**
 * Application configuration object
 */
const config = {
  // Environment
  env: getEnvVar('NODE_ENV', 'development'),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Server
  server: {
    port: getEnvVar('PORT', 4000, 'number'),
    host: getEnvVar('HOST', 'localhost'),
    trustProxy: getEnvVar('TRUST_PROXY', true, 'boolean'),
  },
  
  // Database
  database: {
    host: getEnvVar('DB_HOST', '127.0.0.1'),
    port: getEnvVar('DB_PORT', 5432, 'number'),
    database: getEnvVar('DB_NAME', 'sima'),
    username: getEnvVar('DB_USER', 'postgres'),
    password: getEnvVar('DB_PASSWORD', 'postgres'),
    ssl: getEnvVar('DB_SSL', false, 'boolean'),
    pool: {
      min: getEnvVar('DB_POOL_MIN', 2, 'number'),
      max: getEnvVar('DB_POOL_MAX', 10, 'number'),
      acquireTimeoutMillis: getEnvVar('DB_POOL_ACQUIRE_TIMEOUT', 30000, 'number'),
      idleTimeoutMillis: getEnvVar('DB_POOL_IDLE_TIMEOUT', 30000, 'number'),
    },
  },
  
  // JWT
  jwt: {
    accessSecret: getEnvVar('JWT_ACCESS_SECRET', 'change_this_access_secret'),
    refreshSecret: getEnvVar('JWT_REFRESH_SECRET', 'change_this_refresh_secret'),
    accessExpiresIn: getEnvVar('JWT_ACCESS_EXPIRES', '15m'),
    refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES', '7d'),
  },
  
  // File uploads
  uploads: {
    directory: path.resolve(getEnvVar('UPLOAD_DIR', 'uploads')),
    maxFileSize: getEnvVar('UPLOAD_MAX_SIZE', 5 * 1024 * 1024, 'number'), // 5MB
    allowedMimeTypes: getEnvVar('UPLOAD_MIME_TYPES', 'image/jpeg,image/png,image/gif,image/webp', 'array'),
    maxFiles: getEnvVar('UPLOAD_MAX_FILES', 10, 'number'),
  },
  
  // CORS
  cors: {
    origin: getEnvVar('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173', 'array'),
    credentials: getEnvVar('CORS_CREDENTIALS', true, 'boolean'),
  },
  
  // Rate limiting
  rateLimit: {
    // Auth endpoints
    auth: {
      windowMs: getEnvVar('RATE_LIMIT_AUTH_WINDOW', 15 * 60 * 1000, 'number'),
      max: getEnvVar('RATE_LIMIT_AUTH_MAX', 20, 'number'),
    },
    
    // General API
    api: {
      windowMs: getEnvVar('RATE_LIMIT_API_WINDOW', 15 * 60 * 1000, 'number'),
      max: getEnvVar('RATE_LIMIT_API_MAX', 100, 'number'),
    },
    
    // Export operations
    export: {
      windowMs: getEnvVar('RATE_LIMIT_EXPORT_WINDOW', 10 * 60 * 1000, 'number'),
      max: getEnvVar('RATE_LIMIT_EXPORT_MAX', 5, 'number'),
    },
    
    // Password changes
    password: {
      windowMs: getEnvVar('RATE_LIMIT_PASSWORD_WINDOW', 60 * 60 * 1000, 'number'),
      max: getEnvVar('RATE_LIMIT_PASSWORD_MAX', 5, 'number'),
    },
  },
  
  // Security
  security: {
    bcryptRounds: getEnvVar('BCRYPT_ROUNDS', 12, 'number'),
    sessionTimeout: getEnvVar('SESSION_TIMEOUT', 30 * 60 * 1000, 'number'), // 30 minutes
    passwordMinLength: getEnvVar('PASSWORD_MIN_LENGTH', 8, 'number'),
    maxLoginAttempts: getEnvVar('MAX_LOGIN_ATTEMPTS', 5, 'number'),
    lockoutDuration: getEnvVar('LOCKOUT_DURATION', 30 * 60 * 1000, 'number'), // 30 minutes
  },
  
  // IP restrictions
  ipAllow: {
    enabled: getEnvVar('IP_ALLOW_ENABLED', false, 'boolean'),
    whitelist: getEnvVar('IP_WHITELIST', '', 'array'),
    lanCidr: getEnvVar('LAN_CIDR', '192.168.0.0/16'),
  },
  
  // Logging
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
    prettyPrint: getEnvVar('LOG_PRETTY_PRINT', false, 'boolean'),
    file: {
      enabled: getEnvVar('LOG_FILE_ENABLED', false, 'boolean'),
      path: getEnvVar('LOG_FILE_PATH', 'logs/app.log'),
      maxSize: getEnvVar('LOG_FILE_MAX_SIZE', 10 * 1024 * 1024, 'number'), // 10MB
      maxFiles: getEnvVar('LOG_FILE_MAX_FILES', 5, 'number'),
    },
  },
  
  // Application
  app: {
    name: getEnvVar('APP_NAME', 'S.I.M.A'),
    version: getEnvVar('APP_VERSION', '0.1.0'),
    description: getEnvVar('APP_DESCRIPTION', 'Sistema de Información de Mencionados y Aprehendidos'),
    timezone: getEnvVar('APP_TIMEZONE', 'America/Argentina/Buenos_Aires'),
  },
  
  // Pagination
  pagination: {
    defaultPageSize: getEnvVar('DEFAULT_PAGE_SIZE', 10, 'number'),
    maxPageSize: getEnvVar('MAX_PAGE_SIZE', 100, 'number'),
  },
  
  // Export
  export: {
    maxRecords: getEnvVar('EXPORT_MAX_RECORDS', 10000, 'number'),
    timeout: getEnvVar('EXPORT_TIMEOUT', 60000, 'number'), // 60 seconds
  },
  
  // Health check
  healthCheck: {
    enabled: getEnvVar('HEALTH_CHECK_ENABLED', true, 'boolean'),
    interval: getEnvVar('HEALTH_CHECK_INTERVAL', 30000, 'number'), // 30 seconds
  },
};

/**
 * Validates required configuration
 * @throws {Error} - If required configuration is missing
 */
function validateConfig() {
  const requiredConfigs = [
    'jwt.accessSecret',
    'jwt.refreshSecret',
    'database.host',
    'database.database',
    'database.username',
  ];
  
  const missing = [];
  
  requiredConfigs.forEach(configPath => {
    const keys = configPath.split('.');
    let value = config;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined || value === null || value === '') {
        missing.push(configPath);
        break;
      }
    }
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
  
  // Validate secrets are not defaults in production
  if (config.isProduction) {
    if (config.jwt.accessSecret === 'change_this_access_secret') {
      throw new Error('JWT_ACCESS_SECRET must be changed in production');
    }
    
    if (config.jwt.refreshSecret === 'change_this_refresh_secret') {
      throw new Error('JWT_REFRESH_SECRET must be changed in production');
    }
  }
}

/**
 * Gets configuration value by dot-notation path
 * @param {string} path - Configuration path (e.g., 'database.host')
 * @param {*} defaultValue - Default value if not found
 * @returns {*} - Configuration value
 */
function get(path, defaultValue = undefined) {
  const keys = path.split('.');
  let value = config;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      return defaultValue;
    }
  }
  
  return value;
}

/**
 * Checks if a feature is enabled
 * @param {string} feature - Feature name
 * @returns {boolean} - True if enabled
 */
function isEnabled(feature) {
  return get(feature, false) === true;
}

module.exports = {
  config,
  validateConfig,
  get,
  isEnabled,
  getEnvVar,
};