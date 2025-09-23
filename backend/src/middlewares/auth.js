const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Obtener encabezado Authorization y token (si existe)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Si estamos en modo demo o desarrollo, hacer un log y permitir todas las solicitudes
  if (
    process.env.DEMO_MODE === 'true' ||
    process.env.NODE_ENV === 'development'
  ) {
    // Logs de depuración sólo en desarrollo para evitar filtrar tokens en producción
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[auth] DEV bypass active. Authorization header:',
        authHeader
      );
      console.log('[auth] DEV bypass active. Extracted token:', token);
    }
    return next();
  }

  // Verificar si hay un token en el encabezado Authorization
  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[auth] No token provided in Authorization header');
    }
    return res
      .status(401)
      .json({ error: 'Acceso denegado: Token no proporcionado' });
  }

  try {
    // Validar el token usando JWT_SECRET
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado en el entorno');
    }

    const payload = jwt.verify(token, secret);
    req.user = payload; // Adjuntar el usuario decodificado a la solicitud

    if (process.env.NODE_ENV === 'development') {
      console.log('[auth] Token validado. Decoded payload:', payload);
    }

    next();
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[auth] Token inválido o expirado. Error:',
        err && err.message
      );
    }
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
