const db = require('../db/knex');
const { comparePassword } = require('../utils/hash');
const { signTokens, verifyRefresh } = require('../utils/jwt');
const Joi = require('joi');

const loginSchema = Joi.object({
  usuario: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(100).required(),
});

exports.login = async (req, res, next) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const user = await db('usuarios')
      .where({ usuario: value.usuario, activo: true })
      .first();
    if (!user)
      return res.status(401).json({ message: 'Credenciales inválidas' });
    const ok = await comparePassword(value.password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const payload = {
      id: user.id,
      usuario: user.usuario,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
    };
    const tokens = signTokens(payload);
    res.json(tokens);
  } catch (e) {
    next(e);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken)
      return res.status(400).json({ message: 'Falta refreshToken' });
    const payload = verifyRefresh(refreshToken);
    const tokens = signTokens({
      id: payload.id,
      usuario: payload.usuario,
      rol: payload.rol,
      nombre: payload.nombre,
      apellido: payload.apellido,
    });
    res.json(tokens);
  } catch (e) {
    next(e);
  }
};

exports.logout = async (_req, res) => {
  // Stateless: el cliente borra tokens. Opcional: blacklist en DB si se requiere.
  res.json({ ok: true });
};
