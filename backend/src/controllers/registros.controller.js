const db = require('../db/knex');
const Joi = require('joi');

const schema = Joi.object({
  persona_id: Joi.number().integer().required(),
  tipo_delito: Joi.string().min(2).max(100).required(),
  lugar: Joi.string().max(200).allow('', null),
  estado: Joi.string().max(100).allow('', null),
  juzgado: Joi.string().max(100).allow('', null),
  detalle: Joi.string().max(2000).allow('', null),
});

exports.list = async (req, res, next) => {
  try {
    const { persona_id, q, page = 1, pageSize = 10, format } = req.query;
    const p = Math.max(1, parseInt(page));
    const ps = Math.min(100, Math.max(1, parseInt(pageSize)));
    const qb = db('registros_delictuales').whereNull('deleted_at');
    if (persona_id) qb.where({ persona_id: Number(persona_id) });
    if (q) {
      qb.andWhere(b =>
        b
          .whereILike('tipo_delito', `%${q}%`)
          .orWhereILike('lugar', `%${q}%`)
          .orWhereILike('estado', `%${q}%`)
          .orWhereILike('juzgado', `%${q}%`)
      );
    }

    const totalRow = await qb.clone().count('* as c').first();

    // Exportación completa
    if (format === 'csv' || format === 'xlsx') {
      const rows = await qb
        .clone()
        .select(
          'id',
          'persona_id',
          'tipo_delito',
          'lugar',
          'estado',
          'juzgado',
          'detalle',
          'created_at'
        )
        .orderBy('id', 'desc');

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="registros.csv"'
        );
        // BOM para Excel
        res.write('\uFEFF');
        const headers = [
          'ID',
          'Persona ID',
          'Tipo de delito',
          'Lugar',
          'Estado',
          'Juzgado',
          'Detalle',
          'Creado',
        ];
        res.write(headers.join(';') + '\n');
        for (const r of rows) {
          const line = [
            r.id,
            r.persona_id,
            r.tipo_delito || '',
            r.lugar || '',
            r.estado || '',
            r.juzgado || '',
            (r.detalle || '').replace(/[\r\n]+/g, ' '),
            r.created_at || '',
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
        const ws = wb.addWorksheet('Registros');
        ws.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Persona ID', key: 'persona_id', width: 12 },
          { header: 'Tipo de delito', key: 'tipo_delito', width: 25 },
          { header: 'Lugar', key: 'lugar', width: 20 },
          { header: 'Estado', key: 'estado', width: 18 },
          { header: 'Juzgado', key: 'juzgado', width: 20 },
          { header: 'Detalle', key: 'detalle', width: 40 },
          { header: 'Creado', key: 'created_at', width: 20 },
        ];
        ws.addRows(rows);
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="registros.xlsx"'
        );
        await wb.xlsx.write(res);
        return res.end();
      }
    }

    const items = await qb
      .select('*')
      .orderBy('id', 'desc')
      .limit(ps)
      .offset((p - 1) * ps);
    res.json({ items, total: Number(totalRow.c), page: p, pageSize: ps });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { value, error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const [id] = await db('registros_delictuales')
      .insert({
        ...value,
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
    const item = await db('registros_delictuales')
      .where({ id: req.params.id })
      .whereNull('deleted_at')
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
      .update({ ...value, updated_by: req.user?.id || null });
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    try {
      await db('audit_logs').insert({
        user_id: req.user?.id || null,
        action: 'update',
        entity: 'registro',
        entity_id: Number(req.params.id),
        payload: value,
      });
    } catch (_) {}
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const del = await db('registros_delictuales')
      .where({ id: req.params.id })
      .update({ deleted_at: db.fn.now(), updated_by: req.user?.id || null });
    if (!del) return res.status(404).json({ message: 'No encontrado' });
    try {
      await db('audit_logs').insert({
        user_id: req.user?.id || null,
        action: 'delete',
        entity: 'registro',
        entity_id: Number(req.params.id),
      });
    } catch (_) {}
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
