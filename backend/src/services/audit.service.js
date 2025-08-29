/**
 * Audit Service - Handles audit logging for system actions
 * Provides centralized audit trail functionality
 */
class AuditService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Logs an action to the audit trail
   * @param {number|null} userId - ID of user performing action
   * @param {string} action - Action performed (create, update, delete, etc.)
   * @param {string} entity - Entity type (registro, persona, usuario)
   * @param {number} entityId - ID of the affected entity
   * @param {Object} payload - Data payload of the action
   * @returns {Promise<void>}
   */
  async logAction(userId, action, entity, entityId, payload = {}) {
    try {
      await this.db('audit_logs').insert({
        user_id: userId || null,
        action,
        entity,
        entity_id: Number(entityId),
        payload: typeof payload === 'object' ? payload : {},
        created_at: new Date(),
      });
    } catch (error) {
      // Log audit failures but don't break the main flow
      const logger = require('../utils/logger');
      logger.error({ error, userId, action, entity, entityId }, 'Audit log failed');
    }
  }

  /**
   * Gets audit logs for a specific entity
   * @param {string} entity - Entity type
   * @param {number} entityId - Entity ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Audit logs
   */
  async getLogsForEntity(entity, entityId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    return this.db('audit_logs')
      .where({ entity, entity_id: entityId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  /**
   * Gets audit logs for a specific user
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Audit logs
   */
  async getLogsForUser(userId, options = {}) {
    const { limit = 50, offset = 0, startDate, endDate } = options;
    
    const query = this.db('audit_logs')
      .where({ user_id: userId });
    
    if (startDate) {
      query.where('created_at', '>=', startDate);
    }
    
    if (endDate) {
      query.where('created_at', '<=', endDate);
    }
    
    return query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  /**
   * Gets recent audit activity
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Recent audit logs
   */
  async getRecentActivity(options = {}) {
    const { limit = 20, entity, action } = options;
    
    const query = this.db('audit_logs');
    
    if (entity) {
      query.where({ entity });
    }
    
    if (action) {
      query.where({ action });
    }
    
    return query
      .orderBy('created_at', 'desc')
      .limit(limit);
  }
}

module.exports = AuditService;