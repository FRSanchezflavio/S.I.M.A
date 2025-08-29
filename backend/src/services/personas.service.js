const Joi = require('joi');
const BaseService = require('./base.service');
const { sanitizeObject, sanitizeEmail, sanitizePhone } = require('../utils/sanitize');
const AuditService = require('./audit.service');

/**
 * Schema for persona validation
 */
const personaSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  apellido: Joi.string().min(2).max(100).required(),
  dni: Joi.string()
    .pattern(/^\d{7,9}$/)
    .required(),
  fecha_nacimiento: Joi.date().optional().allow(null),
  nacionalidad: Joi.string().max(100).optional().allow('', null),
  direccion: Joi.string().max(500).optional().allow('', null),
  telefono: Joi.string()
    .pattern(/^[+\d][\d\s\-()]{6,20}$/)
    .optional()
    .allow('', null),
  email: Joi.string().email().optional().allow('', null),
  observaciones: Joi.string().max(2000).optional().allow('', null),
  comisaria: Joi.string().max(200).optional().allow('', null),
});

/**
 * Service for managing personas (registered persons)
 * Handles business logic for person operations including photo management
 */
class PersonasService extends BaseService {
  constructor(db) {
    super(db, 'personas_registradas', personaSchema);
    this.auditService = new AuditService(db);
  }

  /**
   * Validates and sanitizes persona data
   * @param {Object} data - Persona data
   * @returns {Object} - Validated and sanitized data
   */
  validateData(data) {
    const sanitizedData = sanitizeObject(data, {
      htmlFields: ['observaciones'],
      skipFields: [],
      maxLength: 2000
    });

    // Specific sanitization for certain fields
    if (sanitizedData.email) {
      sanitizedData.email = sanitizeEmail(sanitizedData.email);
    }
    
    if (sanitizedData.telefono) {
      sanitizedData.telefono = sanitizePhone(sanitizedData.telefono);
    }

    return super.validateData(sanitizedData);
  }

  /**
   * Creates a new persona with photo handling and audit logging
   * @param {Object} data - Persona data
   * @param {Array} files - Uploaded photo files
   * @param {Object} user - User creating the record
   * @returns {Promise<number>} - ID of created record
   */
  async create(data, files = [], user) {
    const validatedData = this.validateData(data);
    
    // Check for existing DNI
    await this.checkDuplicateDNI(validatedData.dni);
    
    // Process photos
    const photos = this.processPhotos(files);
    
    const [result] = await this.db(this.tableName)
      .insert({
        ...validatedData,
        foto_principal: photos.principal,
        fotos_adicionales: JSON.stringify(photos.additional),
        created_by: user?.id || null,
        updated_by: user?.id || null,
      })
      .returning('id');
    
    const id = result?.id || result;
    
    // Log the creation for audit purposes
    await this.auditService.logAction(user?.id, 'create', 'persona', id, validatedData);
    
    return id;
  }

  /**
   * Updates a persona with photo handling and audit logging
   * @param {number} id - Record ID
   * @param {Object} data - Updated data
   * @param {Array} files - New uploaded photo files
   * @param {Object} user - User updating the record
   * @returns {Promise<boolean>} - Success status
   */
  async update(id, data, files = [], user) {
    const validatedData = this.validateData(data);
    
    // Check if DNI is changing and if the new DNI already exists
    const existing = await this.findById(id);
    if (!existing) {
      return false;
    }
    
    if (validatedData.dni !== existing.dni) {
      await this.checkDuplicateDNI(validatedData.dni, id);
    }
    
    // Process photos if provided
    const updateData = { ...validatedData };
    if (files && files.length > 0) {
      const photos = this.processPhotos(files);
      updateData.foto_principal = photos.principal;
      updateData.fotos_adicionales = JSON.stringify(photos.additional);
    }
    
    const updated = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        ...updateData,
        updated_by: user?.id || null,
      });
    
    if (updated > 0) {
      await this.auditService.logAction(user?.id, 'update', 'persona', id, updateData);
    }
    
    return updated > 0;
  }

  /**
   * Searches personas with advanced filtering
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} - Search results
   */
  async searchPersonas(searchParams) {
    const { q, dni, comisaria, page, pageSize } = searchParams;
    
    const query = this.db(this.tableName).whereNull('deleted_at');
    
    // Apply text search across name fields
    if (q) {
      const searchTerm = q.trim();
      query.andWhere(builder => {
        builder
          .whereILike('nombre', `%${searchTerm}%`)
          .orWhereILike('apellido', `%${searchTerm}%`)
          .orWhereILike('dni', `%${searchTerm}%`);
      });
    }
    
    // Apply exact filters
    if (dni) {
      query.where('dni', dni);
    }
    
    if (comisaria) {
      query.whereILike('comisaria', `%${comisaria}%`);
    }

    // Handle pagination
    if (page && pageSize) {
      const p = Math.max(1, parseInt(page));
      const ps = Math.min(100, Math.max(1, parseInt(pageSize)));
      
      const totalRow = await query.clone().count('* as c').first();
      const items = await query
        .clone()
        .select('*')
        .orderBy('apellido', 'asc')
        .limit(ps)
        .offset((p - 1) * ps);

      return {
        items,
        total: Number(totalRow.c),
        page: p,
        pageSize: ps,
      };
    }

    return query.orderBy('apellido', 'asc');
  }

  /**
   * Gets personas data for export (CSV/XLSX)
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} - Export data
   */
  async getForExport(searchParams) {
    const { q, dni, comisaria } = searchParams;
    
    const query = this.db(this.tableName)
      .whereNull('deleted_at')
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
        'observaciones',
        'created_at'
      );
    
    // Apply the same filters as search
    if (q) {
      const searchTerm = q.trim();
      query.andWhere(builder => {
        builder
          .whereILike('nombre', `%${searchTerm}%`)
          .orWhereILike('apellido', `%${searchTerm}%`)
          .orWhereILike('dni', `%${searchTerm}%`);
      });
    }
    
    if (dni) {
      query.where('dni', dni);
    }
    
    if (comisaria) {
      query.whereILike('comisaria', `%${comisaria}%`);
    }

    return query.orderBy('apellido', 'asc');
  }

  /**
   * Gets detailed persona information with related registros
   * @param {number} id - Persona ID
   * @returns {Promise<Object|null>} - Detailed persona information
   */
  async getDetailsWithRegistros(id) {
    const persona = await this.findById(id);
    if (!persona) return null;

    // Get related registros delictuales
    const registros = await this.db('registros_delictuales')
      .where({ persona_id: id })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc');

    return {
      ...persona,
      registros_delictuales: registros,
      total_registros: registros.length,
    };
  }

  /**
   * Checks for duplicate DNI
   * @param {string} dni - DNI to check
   * @param {number} excludeId - ID to exclude from check (for updates)
   * @throws {Error} - If DNI already exists
   * @private
   */
  async checkDuplicateDNI(dni, excludeId = null) {
    const query = this.db(this.tableName)
      .where({ dni })
      .whereNull('deleted_at');
    
    if (excludeId) {
      query.whereNot({ id: excludeId });
    }
    
    const existing = await query.first();
    
    if (existing) {
      const error = new Error('Ya existe una persona con este DNI');
      error.statusCode = 409;
      throw error;
    }
  }

  /**
   * Processes uploaded photo files
   * @param {Array} files - Uploaded files
   * @returns {Object} - Processed photo paths
   * @private
   */
  processPhotos(files) {
    if (!files || files.length === 0) {
      return { principal: null, additional: [] };
    }

    const photoPaths = files.map(file => `/uploads/${file.filename}`);
    
    return {
      principal: photoPaths[0],
      additional: photoPaths,
    };
  }

  /**
   * Gets personas by comisaria for reporting
   * @param {string} comisaria - Comisaria name
   * @returns {Promise<Array>} - Personas list
   */
  async getByComisaria(comisaria) {
    return this.db(this.tableName)
      .where({ comisaria })
      .whereNull('deleted_at')
      .orderBy('apellido', 'asc');
  }

  /**
   * Gets statistics for personas
   * @returns {Promise<Object>} - Statistics data
   */
  async getStatistics() {
    const totalPersonas = await this.db(this.tableName)
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    const personasPorComisaria = await this.db(this.tableName)
      .whereNull('deleted_at')
      .select('comisaria')
      .count('* as count')
      .groupBy('comisaria')
      .orderBy('count', 'desc');

    const registrosRecientes = await this.db(this.tableName)
      .whereNull('deleted_at')
      .where('created_at', '>=', this.db.raw('NOW() - INTERVAL 30 DAY'))
      .count('* as count')
      .first();

    return {
      total_personas: Number(totalPersonas.count),
      personas_por_comisaria: personasPorComisaria,
      registros_ultimos_30_dias: Number(registrosRecientes.count),
    };
  }
}

module.exports = PersonasService;