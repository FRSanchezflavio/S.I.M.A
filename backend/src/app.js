const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const { errorHandler, notFoundHandler } = require('./middlewares/error');
const { sanitizationMiddleware } = require('./utils/sanitize');
const { authLimiter, apiLimiter, exportLimiter } = require('./middlewares/rate-limit');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const corsOptions = require('./middlewares/cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const personasRoutes = require('./routes/personas.routes');
const registrosRoutes = require('./routes/registros.routes');
const db = require('./db/knex');
const swaggerUi = require('swagger-ui-express');
const apiSpec = require('../docs/openapi.json');

const app = express();

// Security middleware - order matters
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(hpp());
app.use(require('./middlewares/ip-allow'));
app.use(pinoHttp({ logger }));

// CORS configuration
app.use(cors(corsOptions));

// Body parsing with size limits and validation
app.use(express.json({ 
  limit: '5mb',
  verify: (req, res, buf) => {
    // Verify JSON structure to prevent malformed payloads
    try {
      JSON.parse(buf);
    } catch (e) {
      const error = new Error('Invalid JSON payload');
      error.statusCode = 400;
      throw error;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Global rate limiting for all API routes
app.use('/api', apiLimiter);

// Input sanitization middleware
app.use('/api', sanitizationMiddleware({
  htmlFields: ['detalle', 'observaciones'], // Fields that can contain basic HTML
  skipFields: ['password', 'password_hash'], // Don't sanitize passwords
  maxLength: 5000
}));

// Trust proxy for proper IP detection
app.set('trust proxy', 1);

// Static file serving for uploads with security headers
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
  }
}));

// Route-specific rate limiting and routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/personas', personasRoutes);
app.use('/api/registros', registrosRoutes);

// Export endpoints need special rate limiting
app.use('/api/*/export', exportLimiter);

// API documentation
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(apiSpec, { 
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'S.I.M.A API Documentation'
  })
);

// OpenAPI JSON endpoint with caching
app.get('/api/openapi.json', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
  res.json(apiSpec);
});

// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
  const healthData = {
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.1.0',
  };

  try {
    // Test database connection
    await db.raw('select 1 as health_check');
    healthData.database = 'connected';
  } catch (error) {
    healthData.ok = false;
    healthData.database = 'disconnected';
    healthData.error = error.message;
    logger.error({ error }, 'Health check database error');
    return res.status(503).json(healthData);
  }

  res.json(healthData);
});

// Security headers for all responses
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  try {
    await db.destroy();
    logger.info('Database connections closed');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  try {
    await db.destroy();
    logger.info('Database connections closed');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
});

module.exports = app;
