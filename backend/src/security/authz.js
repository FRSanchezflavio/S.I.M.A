const { verifyAccess } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No autorizado' });
  try {
    const payload = verifyAccess(token);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.rol === 'admin') return next();
  return res.status(403).json({ message: 'Requiere rol admin' });
}

module.exports = { requireAuth, requireAdmin };
