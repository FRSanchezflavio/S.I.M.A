const AuthService = require('../services/auth.service');
const db = require('../db/knex');
const { asyncErrorHandler } = require('../middlewares/error');

// Initialize auth service
const authService = new AuthService(db);

/**
 * User login endpoint
 * Authenticates user credentials and returns JWT tokens
 */
const login = asyncErrorHandler(async (req, res) => {
  const tokens = await authService.login(req.body);
  res.json(tokens);
});

/**
 * Token refresh endpoint  
 * Refreshes access token using valid refresh token
 */
const refresh = asyncErrorHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  const tokens = await authService.refreshTokens(refreshToken);
  res.json(tokens);
});

/**
 * User logout endpoint
 * For stateless JWT, client handles token removal
 * Could implement token blacklisting here if needed
 */
const logout = asyncErrorHandler(async (req, res) => {
  // Optional: revoke all tokens for user
  // await authService.revokeAllTokens(req.user.id);
  res.json({ ok: true });
});

module.exports = {
  login,
  refresh,
  logout,
};
