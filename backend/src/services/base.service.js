/**
 * Base service class providing common CRUD operations and error handling
 * Implements the Repository pattern for data access abstraction
 */
class BaseService {
  /**
   * @param {Object} db - Knex database instance
   * @param {string} tableName - Name of the database table
   * @param {Object} schema - Joi validation schema
   */
  constructor(db, tableName, schema) {
    this.db = db;
    this.tableName = tableName;
    this.schema = schema;
  }

  /**
   * Validates data using the service's schema
   * @param {Object} data - Data to validate
   * @returns {Object} - Validation result
   * @throws {ValidationError} - If validation fails
   */
  validateData(data) {
    const { value, error } = this.schema.validate(data);
    if (error) {
      const validationError = new Error(error.message);
      validationError.name = 'ValidationError';
      validationError.statusCode = 400;
      throw validationError;
    }
    return value;
  }

  /**
   * Creates a new record
   * @param {Object} data - Data to create
   * @param {Object} user - User performing the action
   * @returns {Promise<number>} - ID of created record
   */
  async create(data, user) {
    const validatedData = this.validateData(data);
    const [result] = await this.db(this.tableName)
      .insert({
        ...validatedData,
        created_by: user?.id || null,
        updated_by: user?.id || null,
      })
      .returning('id');
    
    return result?.id || result;
  }

  /**
   * Finds a record by ID
   * @param {number} id - Record ID
   * @returns {Promise<Object|null>} - Found record or null
   */
  async findById(id) {
    return this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
  }

  /**
   * Updates a record by ID
   * @param {number} id - Record ID
   * @param {Object} data - Data to update
   * @param {Object} user - User performing the action
   * @returns {Promise<boolean>} - True if updated, false if not found
   */
  async update(id, data, user) {
    const validatedData = this.validateData(data);
    const updated = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        ...validatedData,
        updated_by: user?.id || null,
      });
    
    return updated > 0;
  }

  /**
   * Soft deletes a record by ID
   * @param {number} id - Record ID
   * @param {Object} user - User performing the action
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async softDelete(id, user) {
    const deleted = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: new Date(),
        updated_by: user?.id || null,
      });
    
    return deleted > 0;
  }

  /**
   * Gets paginated list of records
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Paginated results
   */
  async list(options = {}) {
    const { page = 1, pageSize = 10, filters = {} } = options;
    const p = Math.max(1, parseInt(page));
    const ps = Math.min(100, Math.max(1, parseInt(pageSize)));

    const query = this.db(this.tableName).whereNull('deleted_at');
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query.where(key, value);
      }
    });

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

  /**
   * Searches records with text-based criteria
   * @param {string} searchTerm - Search term
   * @param {Array} searchColumns - Columns to search in
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} - Search results
   */
  async search(searchTerm, searchColumns, options = {}) {
    if (!searchTerm || searchColumns.length === 0) {
      return this.list(options);
    }

    const query = this.db(this.tableName).whereNull('deleted_at');
    
    query.andWhere(builder => {
      searchColumns.forEach((column, index) => {
        const method = index === 0 ? 'whereILike' : 'orWhereILike';
        builder[method](column, `%${searchTerm}%`);
      });
    });

    if (options.page && options.pageSize) {
      const p = Math.max(1, parseInt(options.page));
      const ps = Math.min(100, Math.max(1, parseInt(options.pageSize)));
      
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
}

module.exports = BaseService;