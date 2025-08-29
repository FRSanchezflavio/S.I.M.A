const Joi = require('joi');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signTokens, verifyRefresh } = require('../utils/jwt');
const { sanitizeObject } = require('../utils/sanitize');
const BaseService = require('./base.service');

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
  usuario: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(100).required(),
});

/**
 * Password change validation schemas
 */
const changeOwnPasswordSchema = Joi.object({
  actual: Joi.string().min(8).max(100).required(),
  nueva: Joi.string().min(8).max(100).required(),
});

const adminChangePasswordSchema = Joi.object({
  nueva: Joi.string().min(8).max(100).required(),
});

/**
 * User validation schema  
 */
const userSchema = Joi.object({
  usuario: Joi.string().min(3).max(50).required(),
  nombre: Joi.string().min(2).max(100).required(),
  apellido: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().optional().allow('', null),
  rol: Joi.string().valid('admin', 'usuario').required(),
  activo: Joi.boolean().optional().default(true),
});

/**
 * Authentication and User Management Service
 * Handles login, token management, and user CRUD operations
 */
class AuthService extends BaseService {
  constructor(db) {
    super(db, 'usuarios', userSchema);
  }

  /**
   * Authenticates user and returns tokens
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} - Auth tokens
   * @throws {Error} - If authentication fails
   */
  async login(credentials) {
    const { value, error } = loginSchema.validate(credentials);
    if (error) {
      const authError = new Error('Credenciales inválidas');
      authError.statusCode = 400;
      throw authError;
    }

    const user = await this.db('usuarios')
      .where({ usuario: value.usuario, activo: true })
      .first();

    if (!user) {
      const authError = new Error('Credenciales inválidas');
      authError.statusCode = 401;
      throw authError;
    }

    const passwordValid = await comparePassword(value.password, user.password_hash);
    if (!passwordValid) {
      const authError = new Error('Credenciales inválidas');
      authError.statusCode = 401;
      throw authError;
    }

    const payload = {
      id: user.id,
      usuario: user.usuario,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
      token_version: user.token_version || 0,
    };

    return signTokens(payload);
  }

  /**
   * Refreshes access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - New tokens
   * @throws {Error} - If refresh fails
   */
  async refreshTokens(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Falta refreshToken');
      error.statusCode = 400;
      throw error;
    }

    let payload;
    try {
      payload = verifyRefresh(refreshToken);
    } catch (err) {
      const error = new Error('Token inválido');
      error.statusCode = 401;
      throw error;
    }

    // Validate token version against database
    const user = await this.db('usuarios').where({ id: payload.id }).first();
    if (!user || !user.activo) {
      const error = new Error('Token inválido');
      error.statusCode = 401;
      throw error;
    }

    if ((payload.token_version || 0) !== (user.token_version || 0)) {
      const error = new Error('Token inválido');
      error.statusCode = 401;
      throw error;
    }

    const newPayload = {
      id: user.id,
      usuario: user.usuario,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
      token_version: user.token_version || 0,
    };

    return signTokens(newPayload);
  }

  /**
   * Changes user's own password
   * @param {number} userId - User ID
   * @param {Object} passwordData - Old and new passwords
   * @returns {Promise<boolean>} - Success status
   */
  async changeOwnPassword(userId, passwordData) {
    const { value, error } = changeOwnPasswordSchema.validate(passwordData);
    if (error) {
      const validationError = new Error(error.message);
      validationError.statusCode = 400;
      throw validationError;
    }

    const user = await this.db('usuarios').where({ id: userId }).first();
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const passwordValid = await comparePassword(value.actual, user.password_hash);
    if (!passwordValid) {
      const error = new Error('Contraseña actual incorrecta');
      error.statusCode = 401;
      throw error;
    }

    const newPasswordHash = await hashPassword(value.nueva);
    
    await this.db('usuarios')
      .where({ id: userId })
      .update({
        password_hash: newPasswordHash,
        token_version: (user.token_version || 0) + 1,
        updated_by: userId,
      });

    return true;
  }

  /**
   * Admin changes another user's password
   * @param {number} targetUserId - Target user ID
   * @param {number} adminUserId - Admin user ID
   * @param {Object} passwordData - New password
   * @returns {Promise<boolean>} - Success status
   */
  async adminChangePassword(targetUserId, adminUserId, passwordData) {
    const { value, error } = adminChangePasswordSchema.validate(passwordData);
    if (error) {
      const validationError = new Error(error.message);
      validationError.statusCode = 400;
      throw validationError;
    }

    const user = await this.db('usuarios').where({ id: targetUserId }).first();
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const newPasswordHash = await hashPassword(value.nueva);
    
    await this.db('usuarios')
      .where({ id: targetUserId })
      .update({
        password_hash: newPasswordHash,
        token_version: (user.token_version || 0) + 1,
        updated_by: adminUserId,
      });

    return true;
  }

  /**
   * Creates a new user with hashed password
   * @param {Object} userData - User data
   * @param {Object} adminUser - Admin creating the user
   * @returns {Promise<number>} - New user ID
   */
  async createUser(userData, adminUser) {
    const sanitizedData = sanitizeObject(userData);
    const validatedData = this.validateData(sanitizedData);
    
    // Check if username already exists
    const existingUser = await this.db('usuarios')
      .where({ usuario: validatedData.usuario })
      .first();
    
    if (existingUser) {
      const error = new Error('El nombre de usuario ya existe');
      error.statusCode = 409;
      throw error;
    }

    // Generate temporary password (should be changed on first login)
    const tempPassword = this.generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const [result] = await this.db('usuarios')
      .insert({
        ...validatedData,
        password_hash: passwordHash,
        token_version: 0,
        created_by: adminUser?.id || null,
        updated_by: adminUser?.id || null,
      })
      .returning('id');

    return { 
      id: result?.id || result, 
      tempPassword 
    };
  }

  /**
   * Generates a temporary password for new users
   * @returns {string} - Temporary password
   * @private
   */
  generateTempPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Gets user by username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} - User object or null
   */
  async getUserByUsername(username) {
    return this.db('usuarios')
      .where({ usuario: username })
      .whereNull('deleted_at')
      .first();
  }

  /**
   * Revokes all tokens for a user (useful for logout all sessions)
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async revokeAllTokens(userId) {
    await this.db('usuarios')
      .where({ id: userId })
      .increment('token_version', 1);
  }
}

module.exports = AuthService;