const db = require('../db/knex');
const { hashPassword } = require('../utils/hash');
const Joi = require('joi');
const changeOwnPasswordSchema = Joi.object({
  actual: Joi.string().min(8).max(100).required(),
  nueva: Joi.string().min(8).max(100).required(),
});

exports.changeOwnPassword = async (req, res, next) => {
  try {
    const { value, error } = changeOwnPasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const user = await db('usuarios').where({ id: req.user.id }).first();
    if (!user) return res.status(404).json({ message: 'No encontrado' });
    const { comparePassword } = require('../utils/hash');
    const ok = await comparePassword(value.actual, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });
    const password_hash = await hashPassword(value.nueva);
    await db('usuarios')
      .where({ id: req.user.id })
      .update({
        password_hash,
        token_version: user.token_version + 1,
        updated_by: req.user.id,
      });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

const adminChangePasswordSchema = Joi.object({
  nueva: Joi.string().min(8).max(100).required(),
});

exports.adminChangePassword = async (req, res, next) => {
  try {
    const { value, error } = adminChangePasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const user = await db('usuarios').where({ id: req.params.id }).first();
    if (!user) return res.status(404).json({ message: 'No encontrado' });
    const password_hash = await hashPassword(value.nueva);
    await db('usuarios')
      .where({ id: req.params.id })
      .update({
        password_hash,
        token_version: user.token_version + 1,
        updated_by: req.user.id,
      });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

const baseSchema = Joi.object({
  usuario: Joi.string().alphanum().min(3).max(50).required(),
  password: Joi.string().min(8).max(100).optional(),
  nombre: Joi.string().min(2).max(100).required(),
  apellido: Joi.string().min(2).max(100).required(),
  rol: Joi.string().valid('admin', 'usuario').required(),
  activo: Joi.boolean().optional(),
});

exports.list = async (_req, res, next) => {
  try {
    const rows = await db('usuarios').select(
      'id',
      'usuario',
      'nombre',
      'apellido',
      'rol',
      'activo',
      'created_at',
      'updated_at'
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { value, error } = baseSchema
      .requiredKeys('password')
      .validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const exists = await db('usuarios')
      .where({ usuario: value.usuario })
      .first();
    if (exists) return res.status(409).json({ message: 'Usuario ya existe' });
    const password_hash = await hashPassword(value.password);
    const [id] = await db('usuarios')
      .insert({
        usuario: value.usuario,
        password_hash,
        nombre: value.nombre,
        apellido: value.apellido,
        rol: value.rol,
        activo: value.activo ?? true,
        created_by: req.user?.id || null,
        updated_by: req.user?.id || null,
      })
      .returning('id');
    res.status(201).json({ id: id?.id || id });
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const user = await db('usuarios').where({ id: req.params.id }).first();
    if (!user) return res.status(404).json({ message: 'No encontrado' });
    delete user.password_hash;
    res.json(user);
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { value, error } = baseSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const patch = {
      usuario: value.usuario,
      nombre: value.nombre,
      apellido: value.apellido,
      rol: value.rol,
      activo: value.activo ?? true,
    };
    if (value.password)
      patch.password_hash = await hashPassword(value.password);
    const updated = await db('usuarios')
      .where({ id: req.params.id })
      .update({ ...patch, updated_by: req.user?.id || null });
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const del = await db('usuarios').where({ id: req.params.id }).del();
    if (!del) return res.status(404).json({ message: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
