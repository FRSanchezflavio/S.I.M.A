const Joi = require('joi');
const BaseService = require('./base.service');
const { sanitizeObject } = require('../utils/sanitize');
const AuditService = require('./audit.service');

/**
 * Schema for registro delictual validation
 */
const registroSchema = Joi.object({
  persona_id: Joi.number().integer().required(),
  tipo_delito: Joi.string().min(2).max(100).required(),
  lugar: Joi.string().max(200).allow('', null),
  estado: Joi.string().max(100).allow('', null),
  juzgado: Joi.string().max(100).allow('', null),
  detalle: Joi.string().max(2000).allow('', null),
});

/**
 * Service for managing registros delictuales (criminal records)
 * Handles business logic for criminal record operations
 */
class RegistrosService extends BaseService {
  constructor(db) {
    super(db, 'registros_delictuales', registroSchema);
    this.auditService = new AuditService(db);
  }

  /**
   * Creates a new registro delictual with audit logging
   * @param {Object} data - Registro data
   * @param {Object} user - User creating the record
   * @returns {Promise<number>} - ID of created record
   */
  async create(data, user) {
    const sanitizedData = sanitizeObject(data);
    const id = await super.create(sanitizedData, user);
    
    // Log the creation for audit purposes
    await this.auditService.logAction(user?.id, 'create', 'registro', id, sanitizedData);
    
    return id;
  }

  /**
   * Updates a registro delictual with audit logging
   * @param {number} id - Record ID
   * @param {Object} data - Updated data
   * @param {Object} user - User updating the record
   * @returns {Promise<boolean>} - Success status
   */
  async update(id, data, user) {
    const sanitizedData = sanitizeObject(data);
    const success = await super.update(id, sanitizedData, user);
    
    if (success) {
      await this.auditService.logAction(user?.id, 'update', 'registro', id, sanitizedData);
    }
    
    return success;
  }

  /**
   * Searches registros with advanced filtering
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} - Search results
   */
  async searchRegistros(searchParams) {
    const { persona_id, q, page, pageSize } = searchParams;
    
    const query = this.db(this.tableName).whereNull('deleted_at');
    
    // Apply persona filter
    if (persona_id) {
      query.where({ persona_id: Number(persona_id) });
    }
    
    // Apply text search across multiple fields
    if (q) {
      const searchTerm = q.trim();
      query.andWhere(builder => {
        builder
          .whereILike('tipo_delito', `%${searchTerm}%`)
          .orWhereILike('lugar', `%${searchTerm}%`)
          .orWhereILike('estado', `%${searchTerm}%`)
          .orWhereILike('juzgado', `%${searchTerm}%`);
      });
    }

    // Handle pagination
    if (page && pageSize) {
      const p = Math.max(1, parseInt(page));
      const ps = Math.min(100, Math.max(1, parseInt(pageSize)));
      
      const totalRow = await query.clone().count('* as c').first();
      const items = await query
        .clone()
        .limit(ps)
        .offset((p - 1) * ps)
        .orderBy('id', 'desc');

      return {
        items,
        total: Number(totalRow.c),
        page: p,
        pageSize: ps,
      };
    }

    return query.orderBy('id', 'desc');
  }

  /**
   * Gets registros for export (CSV/XLSX)
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} - Export data
   */
  async getForExport(searchParams) {
    const { persona_id, q } = searchParams;
    
    const query = this.db(this.tableName)
      .whereNull('deleted_at')
      .select(
        'id',
        'persona_id',
        'tipo_delito',
        'lugar',
        'estado',
        'juzgado',
        'detalle',
        'created_at'
      );
    
    // Apply filters
    if (persona_id) {
      query.where({ persona_id: Number(persona_id) });
    }
    
    if (q) {
      const searchTerm = q.trim();
      query.andWhere(builder => {
        builder
          .whereILike('tipo_delito', `%${searchTerm}%`)
          .orWhereILike('lugar', `%${searchTerm}%`)
          .orWhereILike('estado', `%${searchTerm}%`)
          .orWhereILike('juzgado', `%${searchTerm}%`);
      });
    }

    return query.orderBy('id', 'desc');
  }

  /**
   * Gets detailed registro information
   * @param {number} id - Registro ID
   * @returns {Promise<Object|null>} - Detailed registro information
   */
  async getDetails(id) {
    const registro = await this.findById(id);
    if (!registro) return null;

    // Get related persona information
    const persona = await this.db('personas_registradas')
      .where({ id: registro.persona_id })
      .whereNull('deleted_at')
      .first();

    return {
      ...registro,
      persona: persona || null,
    };
  }

  /**
   * Duplicates a registro delictual
   * @param {number} id - Original registro ID
   * @param {Object} user - User performing the duplication
   * @returns {Promise<number>} - ID of duplicated record
   */
  async duplicate(id, user) {
    const original = await this.findById(id);
    if (!original) {
      const error = new Error('Registro no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Remove ID and timestamps for duplication
    const { id: _, created_at, updated_at, created_by, updated_by, ...dataToClone } = original;
    
    return this.create(dataToClone, user);
  }
}

module.exports = RegistrosService;