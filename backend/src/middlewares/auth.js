const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Si estamos en modo demo o desarrollo, permitir todas las solicitudes
  if (
    process.env.DEMO_MODE === 'true' ||
    process.env.NODE_ENV === 'development'
  ) {
    return next();
  }

  // Verificar si hay un token en el encabezado Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
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
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
