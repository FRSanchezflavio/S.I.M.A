const db = require('../db/knex');
const Joi = require('joi');
const geocodingService = require('../services/geocoding');

const personSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  apellido: Joi.string().min(2).max(100).required(),
  dni: Joi.string()
    .pattern(/^\d{7,9}$/)
    .required(),
  fecha_nacimiento: Joi.date().optional().allow(null, ''),
  edad: Joi.number().integer().min(0).max(120).optional().allow(null, ''),
  genero: Joi.string()
    .valid('masculino', 'femenino', 'otro')
    .optional()
    .allow('', null),
  nacionalidad: Joi.string().optional().allow('', null),
  direccion: Joi.string().optional().allow('', null),
  direccion_completa: Joi.string().optional().allow('', null),
  telefono: Joi.string()
    .pattern(/^[+\d][\d\s\-()]{6,20}$/)
    .optional()
    .allow('', null),
  email: Joi.string().email().optional().allow('', null),
  observaciones: Joi.string().optional().allow('', null),
  comisaria: Joi.string().optional().allow('', null),
  comisaria_hecho: Joi.string().optional().allow('', null),
  // Campos adicionales del frontend
  tipo_delito: Joi.string().optional().allow('', null),
  modalidad: Joi.string().optional().allow('', null),
  categoria: Joi.string().optional().allow('', null),
  fecha_carga: Joi.date().optional().allow('', null),
  unidades_regionales: Joi.string().optional().allow('', null),
  // Campos de geolocalización
  domicilio_latitud: Joi.number().min(-90).max(90).optional().allow(null),
  domicilio_longitud: Joi.number().min(-180).max(180).optional().allow(null),
  barrio: Joi.string().optional().allow('', null),
  localidad: Joi.string().optional().allow('', null),
  codigo_postal: Joi.string().optional().allow('', null),
  direccion_verificada: Joi.boolean().optional().default(false),
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
          'genero',
          'nacionalidad',
          'direccion',
          'telefono',
          'email',
          'comisaria',
          'comisaria_hecho',
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
          'Género',
          'Nacionalidad',
          'Dirección',
          'Teléfono',
          'Email',
          'Comisaría',
          'Comisaría del Hecho',
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
            r.genero || '',
            r.nacionalidad || '',
            r.direccion || '',
            r.telefono || '',
            r.email || '',
            r.comisaria || '',
            r.comisaria_hecho || '',
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
          { header: 'Género', key: 'genero', width: 12 },
          { header: 'Nacionalidad', key: 'nacionalidad', width: 15 },
          { header: 'Dirección', key: 'direccion', width: 25 },
          { header: 'Teléfono', key: 'telefono', width: 15 },
          { header: 'Email', key: 'email', width: 25 },
          { header: 'Comisaría', key: 'comisaria', width: 15 },
          { header: 'Comisaría del Hecho', key: 'comisaria_hecho', width: 20 },
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

    // Procesar geolocalización si se proporciona dirección
    let geoData = {};
    const direccionParaGeolocalizar =
      value.direccion_completa || value.direccion;

    if (direccionParaGeolocalizar && direccionParaGeolocalizar.trim() !== '') {
      try {
        const geoResult = await geocodingService.geocodeAddress(
          direccionParaGeolocalizar,
          {
            localidad: value.localidad,
            codigo_postal: value.codigo_postal,
          }
        );

        if (geoResult.success) {
          geoData = {
            domicilio_latitud: geoResult.latitude,
            domicilio_longitud: geoResult.longitude,
            direccion_completa: geoResult.formatted_address,
            barrio: geoResult.neighborhood || value.barrio,
            localidad: geoResult.city || value.localidad,
            codigo_postal: geoResult.zipcode || value.codigo_postal,
            direccion_verificada: true,
          };
        }
      } catch (geoError) {
        // Si falla la geocodificación, continuar sin coordenadas pero registrar el error
        console.warn(
          'Error en geocodificación al crear persona:',
          geoError.message
        );
        geoData = {
          direccion_completa: direccionParaGeolocalizar,
          direccion_verificada: false,
        };
      }
    }

    const personData = {
      ...value,
      ...geoData,
      foto_principal: fotos[0] || null,
      fotos_adicionales: JSON.stringify(fotos),
      created_by: req.user?.id || null,
      updated_by: req.user?.id || null,
    };

    const [id] = await db('personas_registradas')
      .insert(personData)
      .returning('id');

    const newId = id?.id || id;

    // Actualizar geometría PostGIS si se tienen coordenadas
    if (geoData.domicilio_latitud && geoData.domicilio_longitud) {
      try {
        await geocodingService.updatePostGISGeometry(
          db,
          'personas_registradas',
          'domicilio_geoposicion',
          'domicilio_latitud',
          'domicilio_longitud',
          newId
        );
      } catch (postgisError) {
        console.warn(
          'Error actualizando geometría PostGIS:',
          postgisError.message
        );
      }
    }

    try {
      await db('audit_logs').insert({
        user_id: req.user?.id || null,
        action: 'create',
        entity: 'persona',
        entity_id: newId,
        payload: { ...value, geocoding_applied: !!geoData.domicilio_latitud },
      });
    } catch (_) {}

    res.status(201).json({
      id: newId,
      geocoding_success: !!geoData.domicilio_latitud,
      coordinates: geoData.domicilio_latitud
        ? {
            latitude: geoData.domicilio_latitud,
            longitude: geoData.domicilio_longitud,
          }
        : null,
    });
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

    // Procesar geolocalización si hay cambios en la dirección
    const direccionParaGeolocalizar =
      value.direccion_completa || value.direccion;

    if (direccionParaGeolocalizar && direccionParaGeolocalizar.trim() !== '') {
      // Verificar si la dirección cambió comparando con la BD
      const current = await db('personas_registradas')
        .select('direccion_completa', 'domicilio_latitud', 'domicilio_longitud')
        .where({ id: req.params.id })
        .first();

      const direccionCambio =
        current && current.direccion_completa !== direccionParaGeolocalizar;

      // Solo geocodificar si la dirección es nueva o cambió
      if (
        !current ||
        direccionCambio ||
        (!current.domicilio_latitud && !current.domicilio_longitud)
      ) {
        try {
          const geoResult = await geocodingService.geocodeAddress(
            direccionParaGeolocalizar,
            {
              localidad: value.localidad,
              codigo_postal: value.codigo_postal,
            }
          );

          if (geoResult.success) {
            patch.domicilio_latitud = geoResult.latitude;
            patch.domicilio_longitud = geoResult.longitude;
            patch.direccion_completa = geoResult.formatted_address;
            patch.barrio = geoResult.neighborhood || value.barrio;
            patch.localidad = geoResult.city || value.localidad;
            patch.codigo_postal = geoResult.zipcode || value.codigo_postal;
            patch.direccion_verificada = true;
          }
        } catch (geoError) {
          console.warn(
            'Error en geocodificación al actualizar persona:',
            geoError.message
          );
          patch.direccion_completa = direccionParaGeolocalizar;
          patch.direccion_verificada = false;
        }
      }
    }

    const updated = await db('personas_registradas')
      .where({ id: req.params.id })
      .update({ ...patch, updated_by: req.user?.id || null });

    if (!updated) return res.status(404).json({ message: 'No encontrado' });

    // Actualizar geometría PostGIS si hay nuevas coordenadas
    if (patch.domicilio_latitud && patch.domicilio_longitud) {
      try {
        await geocodingService.updatePostGISGeometry(
          db,
          'personas_registradas',
          'domicilio_geoposicion',
          'domicilio_latitud',
          'domicilio_longitud',
          req.params.id
        );
      } catch (postgisError) {
        console.warn(
          'Error actualizando geometría PostGIS:',
          postgisError.message
        );
      }
    }

    try {
      await db('audit_logs').insert({
        user_id: req.user?.id || null,
        action: 'update',
        entity: 'persona',
        entity_id: Number(req.params.id),
        payload: { ...patch, geocoding_applied: !!patch.domicilio_latitud },
      });
    } catch (_) {}

    res.json({
      ok: true,
      geocoding_success: !!patch.domicilio_latitud,
      coordinates: patch.domicilio_latitud
        ? {
            latitude: patch.domicilio_latitud,
            longitude: patch.domicilio_longitud,
          }
        : null,
    });
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
