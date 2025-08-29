const AuthService = require('../services/auth.service');
const db = require('../db/knex');
const { asyncErrorHandler } = require('../middlewares/error');
const { NotFoundError } = require('../utils/errors');
const { passwordLimiter } = require('../middlewares/rate-limit');

// Initialize auth service
const authService = new AuthService(db);

/**
 * Changes user's own password
 */
const changeOwnPassword = asyncErrorHandler(async (req, res) => {
  await authService.changeOwnPassword(req.user.id, req.body);
  res.json({ ok: true });
});

/**
 * Admin changes another user's password
 */
const adminChangePassword = asyncErrorHandler(async (req, res) => {
  await authService.adminChangePassword(req.params.id, req.user.id, req.body);
  res.json({ ok: true });
});

/**
 * Lists all users (admin only)
 */
const list = asyncErrorHandler(async (req, res) => {
  const { page = 1, pageSize = 50 } = req.query;
  const options = {
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  };
  
  const result = await authService.list(options);
  
  // Remove sensitive data from response
  result.items = result.items.map(user => {
    const { password_hash, token_version, ...safeUser } = user;
    return safeUser;
  });
  
  res.json(result);
});

/**
 * Creates a new user (admin only)
 */
const create = asyncErrorHandler(async (req, res) => {
  const result = await authService.createUser(req.body, req.user);
  
  res.status(201).json({
    id: result.id,
    tempPassword: result.tempPassword,
    message: 'Usuario creado exitosamente. La contraseña temporal debe ser cambiada en el primer login.'
  });
});

/**
 * Gets a specific user by ID (admin only)
 */
const get = asyncErrorHandler(async (req, res) => {
  const user = await authService.findById(req.params.id);
  
  if (!user) {
    throw new NotFoundError('Usuario');
  }
  
  // Remove sensitive data
  const { password_hash, token_version, ...safeUser } = user;
  res.json(safeUser);
});

/**
 * Updates a user (admin only)
 */
const update = asyncErrorHandler(async (req, res) => {
  const success = await authService.update(req.params.id, req.body, req.user);
  
  if (!success) {
    throw new NotFoundError('Usuario');
  }
  
  res.json({ ok: true });
});

/**
 * Soft deletes a user (admin only)
 */
const remove = asyncErrorHandler(async (req, res) => {
  // Prevent admin from deleting themselves
  if (req.params.id == req.user.id) {
    const error = new Error('No puedes eliminar tu propia cuenta');
    error.statusCode = 400;
    throw error;
  }
  
  const success = await authService.softDelete(req.params.id, req.user);
  
  if (!success) {
    throw new NotFoundError('Usuario');
  }
  
  res.json({ ok: true });
});

/**
 * Revokes all tokens for a user (admin only)
 */
const revokeTokens = asyncErrorHandler(async (req, res) => {
  await authService.revokeAllTokens(req.params.id);
  res.json({ ok: true, message: 'Tokens revocados exitosamente' });
});

/**
 * Gets current user's profile
 */
const getProfile = asyncErrorHandler(async (req, res) => {
  const user = await authService.findById(req.user.id);
  
  if (!user) {
    throw new NotFoundError('Usuario');
  }
  
  const { password_hash, token_version, ...profile } = user;
  res.json(profile);
});

/**
 * Updates current user's profile (name, email, etc. but not password)
 */
const updateProfile = asyncErrorHandler(async (req, res) => {
  const { password, ...profileData } = req.body;
  const success = await authService.update(req.user.id, profileData, req.user);
  
  if (!success) {
    throw new NotFoundError('Usuario');
  }
  
  res.json({ ok: true });
});

module.exports = {
  changeOwnPassword,
  adminChangePassword,
  list,
  create,
  get,
  update,
  remove,
  revokeTokens,
  getProfile,
  updateProfile,
};
