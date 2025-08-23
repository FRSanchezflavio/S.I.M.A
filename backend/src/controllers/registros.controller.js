const db = require('../db/knex');
const Joi = require('joi');

const schema = Joi.object({
  persona_id: Joi.number().integer().required(),
  tipo_delito: Joi.string().required(),
  lugar: Joi.string().allow('', null),
  estado: Joi.string().allow('', null),
  juzgado: Joi.string().allow('', null),
  detalle: Joi.string().allow('', null),
});

exports.list = async (req, res, next) => {
  try {
    const { persona_id } = req.query;
    const qb = db('registros_delictuales');
    if (persona_id) qb.where({ persona_id });
    const items = await qb.orderBy('id', 'desc');
    res.json(items);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { value, error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const [id] = await db('registros_delictuales')
      .insert(value)
      .returning('id');
    res.status(201).json({ id: id?.id || id });
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await db('registros_delictuales')
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
    const { value, error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const updated = await db('registros_delictuales')
      .where({ id: req.params.id })
      .update(value);
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const del = await db('registros_delictuales')
      .where({ id: req.params.id })
      .del();
    if (!del) return res.status(404).json({ message: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
