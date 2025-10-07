function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Recurso no encontrado' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log detallado del error
  console.error('❌ Error capturado en middleware:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
  });

  try {
    const logger = require('../utils/logger');
    logger.error(
      { err, url: req.originalUrl, method: req.method },
      'Unhandled error'
    );
  } catch (_) {
    // fallback
    // eslint-disable-next-line no-console
    console.error(err);
  }

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  // En desarrollo, enviar stack trace
  const response =
    process.env.NODE_ENV === 'development'
      ? { message, error: err.message, stack: err.stack }
      : { message };

  res.status(status).json(response);
}

module.exports = { notFoundHandler, errorHandler };
