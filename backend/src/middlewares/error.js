function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Recurso no encontrado' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  try {
    const logger = require('../utils/logger');
    logger.error({ err }, 'Unhandled error');
  } catch (_) {
    // fallback
    // eslint-disable-next-line no-console
    console.error(err);
  }
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
