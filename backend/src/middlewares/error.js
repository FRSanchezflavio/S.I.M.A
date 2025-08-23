function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Recurso no encontrado' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
