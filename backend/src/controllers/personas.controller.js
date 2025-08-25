const db = require('../db/knex');
const Joi = require('joi');

const personSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  apellido: Joi.string().min(2).max(100).required(),
  dni: Joi.string()
    .pattern(/^\d{7,9}$/)
    .required(),
  fecha_nacimiento: Joi.date().optional().allow(null),
  nacionalidad: Joi.string().optional().allow('', null),
  direccion: Joi.string().optional().allow('', null),
  telefono: Joi.string()
    .pattern(/^[+\d][\d\s\-()]{6,20}$/)
    .optional()
    .allow('', null),
  email: Joi.string().email().optional().allow('', null),
  observaciones: Joi.string().optional().allow('', null),
  comisaria: Joi.string().optional().allow('', null),
});

exports.search = async (req, res, next) => {
  try {
    const { q, dni, comisaria, page = 1, pageSize = 10, format } = req.query;
    const p = Math.max(1, parseInt(page));
    const ps = Math.min(100, Math.max(1, parseInt(pageSize)));
    const qb = db('personas_registradas').whereNull('deleted_at');
    if (q) qb.whereILike('nombre', `%${q}%`).orWhereILike('apellido', `%${q}%`);
    if (dni) qb.where('dni', dni);
    if (comisaria) qb.where('comisaria', comisaria);
    const total = await qb.clone().count('* as c').first();

    // Exportación: si se pide format=csv|xlsx, devolver archivo completo (sin paginación)
    if (format === 'csv' || format === 'xlsx') {
      const rows = await qb
        .clone()
        .select(
          'id',
          'apellido',
          'nombre',
          'dni',
          'fecha_nacimiento',
          'nacionalidad',
          'direccion',
          'telefono',
          'email',
          'comisaria',
          'observaciones'
        )
        .orderBy('apellido', 'asc');

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="personas.csv"'
        );
        // BOM para Excel en Windows
        res.write('\uFEFF');
        const headers = [
          'ID',
          'Apellido',
          'Nombre',
          'DNI',
          'Fecha de nacimiento',
          'Nacionalidad',
          'Dirección',
          'Teléfono',
          'Email',
          'Comisaría',
          'Observaciones',
        ];
        res.write(headers.join(';') + '\n');
        for (const r of rows) {
          const line = [
            r.id,
            r.apellido || '',
            r.nombre || '',
            r.dni || '',
            r.fecha_nacimiento || '',
            r.nacionalidad || '',
            r.direccion || '',
            r.telefono || '',
            r.email || '',
            r.comisaria || '',
            (r.observaciones || '').replace(/[\r\n]+/g, ' '),
          ]
            .map(v => `${v}`.replace(/;/g, ','))
            .join(';');
          res.write(line + '\n');
        }
        return res.end();
      }

      if (format === 'xlsx') {
        const Excel = require('exceljs');
        const wb = new Excel.Workbook();
        const ws = wb.addWorksheet('Personas');
        ws.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Apellido', key: 'apellido', width: 20 },
          { header: 'Nombre', key: 'nombre', width: 20 },
          { header: 'DNI', key: 'dni', width: 15 },
          { header: 'Fecha de nacimiento', key: 'fecha_nacimiento', width: 18 },
          { header: 'Nacionalidad', key: 'nacionalidad', width: 15 },
          { header: 'Dirección', key: 'direccion', width: 25 },
          { header: 'Teléfono', key: 'telefono', width: 15 },
          { header: 'Email', key: 'email', width: 25 },
          { header: 'Comisaría', key: 'comisaria', width: 15 },
          { header: 'Observaciones', key: 'observaciones', width: 40 },
        ];
        ws.addRows(rows);
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="personas.xlsx"'
        );
        await wb.xlsx.write(res);
        return res.end();
      }
    }

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
        created_by: req.user?.id || null,
        updated_by: req.user?.id || null,
      })
      .returning('id');
    const newId = id?.id || id;
    try {
      await db('audit_logs').insert({
        user_id: req.user?.id || null,
        action: 'create',
        entity: 'persona',
        entity_id: newId,
        payload: value,
      });
    } catch (_) {}
    res.status(201).json({ id: newId });
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
      .update({ ...patch, updated_by: req.user?.id || null });
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    try {
      await db('audit_logs').insert({
        user_id: req.user?.id || null,
        action: 'update',
        entity: 'persona',
        entity_id: Number(req.params.id),
        payload: patch,
      });
    } catch (_) {}
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const del = await db('personas_registradas')
      .where({ id: req.params.id })
      .update({ deleted_at: db.fn.now(), updated_by: req.user?.id || null });
    if (!del) return res.status(404).json({ message: 'No encontrado' });
    try {
      await db('audit_logs').insert({
        user_id: req.user?.id || null,
        action: 'delete',
        entity: 'persona',
        entity_id: Number(req.params.id),
      });
    } catch (_) {}
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
