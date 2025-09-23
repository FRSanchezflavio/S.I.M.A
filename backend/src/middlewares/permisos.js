const permisos = {
  'bandas:leer': ['admin', 'investigador', 'supervisor'],
  'bandas:crear': ['admin', 'supervisor'],
  'bandas:editar': ['admin', 'supervisor'],
  'bandas:eliminar': ['admin'],
  'bandas:analizar': ['admin', 'investigador', 'supervisor'],
  'vinculaciones:leer': ['admin', 'investigador', 'supervisor'],
  'vinculaciones:crear': ['admin', 'supervisor'],
  'vinculaciones:editar': ['admin', 'supervisor'],
  'vinculaciones:eliminar': ['admin'],
  'vinculaciones:analizar': ['admin', 'investigador', 'supervisor'],
};

function validarPermisos(permisosRequeridos) {
  return (req, res, next) => {
    // Si estamos en modo demo o en desarrollo, permitir todas las operaciones
    // (en desarrollo el middleware `auth` puede hacer `next()` sin poblar `req.user`)
    if (
      process.env.DEMO_MODE === 'true' ||
      process.env.NODE_ENV === 'development'
    ) {
      return next();
    }

    // Verificar si el usuario tiene los permisos requeridos
    if (!req.user || !req.user.rol) {
      return res
        .status(403)
        .json({ error: 'Usuario no autenticado o sin rol asignado' });
    }

    const rolUsuario = req.user.rol;
    const tienePermiso = permisosRequeridos.some(permiso => {
      return permisos[permiso] && permisos[permiso].includes(rolUsuario);
    });

    if (!tienePermiso) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta acción',
        permisos_requeridos: permisosRequeridos,
        rol_actual: rolUsuario,
      });
    }

    next();
  };
}

module.exports = { validarPermisos };
