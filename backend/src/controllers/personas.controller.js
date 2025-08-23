const db = require('../db/knex');
const Joi = require('joi');

const personSchema = Joi.object({
  nombre: Joi.string().required(),
  apellido: Joi.string().required(),
  dni: Joi.string().required(),
  fecha_nacimiento: Joi.date().optional().allow(null),
  nacionalidad: Joi.string().optional().allow('', null),
  direccion: Joi.string().optional().allow('', null),
  telefono: Joi.string().optional().allow('', null),
  email: Joi.string().email().optional().allow('', null),
  observaciones: Joi.string().optional().allow('', null),
  comisaria: Joi.string().optional().allow('', null),
});

exports.search = async (req, res, next) => {
  try {
    const { q, dni, comisaria, page = 1, pageSize = 10 } = req.query;
    const p = Math.max(1, parseInt(page));
    const ps = Math.min(100, Math.max(1, parseInt(pageSize)));
    const qb = db('personas_registradas');
    if (q) qb.whereILike('nombre', `%${q}%`).orWhereILike('apellido', `%${q}%`);
    if (dni) qb.where('dni', dni);
    if (comisaria) qb.where('comisaria', comisaria);
    const total = await qb.clone().count('* as c').first();
    const items = await qb
      .select('*')
      .orderBy('apellido', 'asc')
      .limit(ps)
      .offset((p - 1) * ps);
    res.json({ items, total: Number(total.c), page: p, pageSize: ps });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { value, error } = personSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const fotos = (req.files || []).map(f => `/uploads/${f.filename}`);
    const [id] = await db('personas_registradas')
      .insert({
        ...value,
        foto_principal: fotos[0] || null,
        fotos_adicionales: JSON.stringify(fotos),
      })
      .returning('id');
    res.status(201).json({ id: id?.id || id });
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await db('personas_registradas')
      .where({ id: req.params.id })
      .first();
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { value, error } = personSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const fotos = (req.files || []).map(f => `/uploads/${f.filename}`);
    const patch = { ...value };
    if (fotos.length) {
      patch.foto_principal = fotos[0];
      patch.fotos_adicionales = JSON.stringify(fotos);
    }
    const updated = await db('personas_registradas')
      .where({ id: req.params.id })
      .update(patch);
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const del = await db('personas_registradas')
      .where({ id: req.params.id })
      .del();
    if (!del) return res.status(404).json({ message: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
