const db = require('../db/knex');
const Joi = require('joi');

// Función auxiliar para verificar conexión a la base de datos
async function verificarConexionDB() {
  try {
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error.message);
    return false;
  }
}

const personSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  apellido: Joi.string().min(2).max(100).required(),
  dni: Joi.string()
    .required()
    .custom((value, helpers) => {
      // Permitir valores como "NO", "NULO", "N/A", "SIN DNI", etc.
      const specialValues =
        /^(no|nulo|n\/a|sin\s*(dni|documento)|s\/d|extranjero|ext)$/i;
      // Permitir DNI válidos (7-9 dígitos)
      const dniPattern = /^\d{7,9}$/;

      if (!value || value === '') {
        return helpers.message('El DNI es requerido');
      }

      if (specialValues.test(value) || dniPattern.test(value)) {
        return value;
      }

      return helpers.message(
        'El DNI debe tener 7-9 dígitos o un valor como "NO", "NULO", "EXTRANJERO", etc.'
      );
    }),
  fecha_nacimiento: Joi.date().optional().allow(null, ''),
  edad: Joi.number().integer().min(0).max(120).optional().allow(null, ''),
  genero: Joi.string()
    .valid('masculino', 'femenino', 'otro')
    .optional()
    .allow('', null),
  nacionalidad: Joi.string().optional().allow('', null),
  direccion: Joi.string().optional().allow('', null),
  telefono: Joi.string()
    .optional()
    .allow('', null)
    .custom((value, helpers) => {
      // Permitir valores como "NO", "NULO", "N/A", "SIN TELEFONO", etc.
      const specialValues = /^(no|nulo|n\/a|sin\s*(telefono|tel)|s\/d|s\/t)$/i;
      // Permitir números de teléfono válidos
      const phonePattern = /^[+\d][\d\s\-()]{6,20}$/;

      if (
        !value ||
        value === '' ||
        specialValues.test(value) ||
        phonePattern.test(value)
      ) {
        return value;
      }

      return helpers.message(
        'El teléfono debe ser un número válido o un valor como "NO", "NULO", "N/A", etc.'
      );
    }),
  email: Joi.string()
    .optional()
    .allow('', null)
    .custom((value, helpers) => {
      // Permitir valores como "NO", "NULO", "N/A", "SIN EMAIL", etc.
      const specialValues =
        /^(no|nulo|n\/a|sin\s*(email|mail|correo)|s\/d|s\/e)$/i;
      // Permitir emails válidos
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !value ||
        value === '' ||
        specialValues.test(value) ||
        emailPattern.test(value)
      ) {
        return value;
      }

      return helpers.message(
        'El email debe ser una dirección válida o un valor como "NO", "NULO", "N/A", etc.'
      );
    }),
  observaciones: Joi.string().optional().allow('', null),
  descripcion_fisica: Joi.string().max(500).optional().allow('', null),
  comisaria: Joi.string().optional().allow('', null),
  comisaria_hecho: Joi.string().optional().allow('', null),
  // Campos nuevos agregados
  alias: Joi.string().optional().allow('', null),
  provincia: Joi.string().optional().allow('', null),
  // Campos adicionales del frontend
  tipo_delito: Joi.string().optional().allow('', null),
  modalidad: Joi.string().optional().allow('', null),
  categoria: Joi.string().optional().allow('', null),
  fecha_carga: Joi.date().optional().allow('', null),
  unidades_regionales: Joi.string().optional().allow('', null),
  UnidadesRegionales: Joi.string().optional().allow('', null), // Alias para compatibilidad con frontend
  // Campos de georeferenciación
  latitud: Joi.number().min(-90).max(90).optional().allow('', null),
  longitud: Joi.number().min(-180).max(180).optional().allow('', null),
  // Campos de georeferenciación del hecho
  direccion_hecho: Joi.string().optional().allow('', null),
  latitud_hecho: Joi.number().min(-90).max(90).optional().allow('', null),
  longitud_hecho: Joi.number().min(-180).max(180).optional().allow('', null),
});

exports.search = async (req, res, next) => {
  try {
    const {
      q,
      dni,
      comisaria,
      comisaria_hecho,
      page = 1,
      pageSize = 10,
      format,
    } = req.query;
    const p = Math.max(1, parseInt(page));
    const ps = Math.min(100, Math.max(1, parseInt(pageSize)));
    const qb = db('personas_registradas').whereNull('deleted_at');

    // Búsqueda general por nombre/apellido
    if (q) qb.whereILike('nombre', `%${q}%`).orWhereILike('apellido', `%${q}%`);

    // Búsquedas específicas por campo
    if (dni) qb.where('dni', dni);
    if (comisaria) qb.where('comisaria', comisaria);
    if (comisaria_hecho) qb.where('comisaria_hecho', comisaria_hecho);

    // Soporte para búsquedas por campos específicos del frontend
    const allowedFields = [
      'tipo_delito',
      'modalidad',
      'nombre',
      'apellido',
      'dni',
      'edad',
      'genero',
      'nacionalidad',
      'direccion',
      'telefono',
      'comisaria',
      'comisaria_hecho',
      'unidades_regionales',
      'fecha_carga',
      'observaciones',
      'descripcion_fisica',
    ];

    for (const field of allowedFields) {
      if (
        req.query[field] &&
        field !== 'q' &&
        field !== 'page' &&
        field !== 'pageSize' &&
        field !== 'format'
      ) {
        if (
          field === 'nombre' ||
          field === 'apellido' ||
          field === 'observaciones'
        ) {
          qb.whereILike(field, `%${req.query[field]}%`);
        } else {
          qb.where(field, req.query[field]);
        }
      }
    }

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
          'observaciones',
          'descripcion_fisica'
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
          'Descripción Física',
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
            (r.descripcion_fisica || '').replace(/[\r\n]+/g, ' '),
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
          {
            header: 'Descripción Física',
            key: 'descripcion_fisica',
            width: 30,
          },
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
    console.log('📥 Datos recibidos en el backend:', {
      body: req.body,
      files: req.files ? req.files.length : 0,
    });

    // Verificar conexión a la base de datos
    const dbConectada = await verificarConexionDB();
    if (!dbConectada) {
      console.error('❌ Base de datos no disponible');
      return res.status(503).json({
        message: 'Servicio temporalmente no disponible',
        details: ['Error de conexión a la base de datos'],
        error: 'database_connection_failed',
      });
    }

    // Validar que se hayan subido archivos
    if (!req.files || req.files.length === 0) {
      console.error('❌ No se recibieron archivos');
      return res.status(400).json({
        message: 'Debe incluir al menos una fotografía',
        details: ['No se recibieron archivos'],
        error: 'no_files_uploaded',
      });
    }

    const { value, error } = personSchema.validate(req.body);
    if (error) {
      console.error('❌ Error de validación:', error.message);
      console.error('Detalles:', error.details);
      return res
        .status(400)
        .json({ message: error.message, details: error.details });
    }

    const fotos = (req.files || []).map(f => `/uploads/${f.filename}`);
    console.log('✅ Datos validados correctamente');
    console.log('📸 Fotos procesadas:', fotos.length);

    // Verificar si la tabla existe
    let tablaExiste = false;
    try {
      tablaExiste = await db.schema.hasTable('personas_registradas');
    } catch (schemaError) {
      console.error('Error verificando esquema:', schemaError);
      return res.status(503).json({
        message: 'Error de configuración de base de datos',
        details: ['Esquema de base de datos no disponible'],
        error: 'database_schema_error',
      });
    }

    if (!tablaExiste) {
      return res.status(503).json({
        message: 'Servicio no configurado',
        details: ['Tabla de personas no existe en la base de datos'],
        error: 'table_not_exists',
      });
    }

    // Preparar datos para inserción, convirtiendo UnidadesRegionales a unidades_regionales
    const dataToInsert = { ...value };
    if (dataToInsert.UnidadesRegionales) {
      dataToInsert.unidades_regionales = dataToInsert.UnidadesRegionales;
      delete dataToInsert.UnidadesRegionales;
    }

    const [id] = await db('personas_registradas')
      .insert({
        ...dataToInsert,
        foto_principal: fotos[0] || null,
        fotos_adicionales: JSON.stringify(fotos),
        created_by: req.user?.id || null,
        updated_by: req.user?.id || null,
      })
      .returning('id');

    const newId = id?.id || id;
    console.log('✅ Persona creada exitosamente con ID:', newId);

    // Intentar crear log de auditoría (no crítico)
    try {
      const auditTablaExiste = await db.schema.hasTable('audit_logs');
      if (auditTablaExiste) {
        await db('audit_logs').insert({
          user_id: req.user?.id || null,
          action: 'create',
          entity: 'persona',
          entity_id: newId,
          payload: value,
        });
      }
    } catch (auditError) {
      console.warn('⚠️ No se pudo crear log de auditoría:', auditError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Persona creada exitosamente',
      id: newId,
      data: {
        id: newId,
        nombre: value.nombre,
        apellido: value.apellido,
        dni: value.dni,
      },
    });
  } catch (e) {
    console.error('❌ Error en create persona:', {
      message: e.message,
      code: e.code,
      stack: e.stack,
    });

    // Manejo específico de errores de base de datos
    if (e.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Error de conexión a la base de datos',
        details: ['No se puede conectar al servidor de base de datos'],
        error: 'database_connection_refused',
      });
    }

    if (e.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una persona con ese DNI',
        details: ['Registro duplicado'],
        error: 'duplicate_entry',
      });
    }

    if (e.code === '22P02') {
      return res.status(400).json({
        success: false,
        message: 'Formato de datos inválido',
        details: [e.message],
        error: 'invalid_input_syntax',
      });
    }

    // Error genérico del servidor
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear persona',
      details: [e.message],
      error: 'internal_server_error',
    });
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
