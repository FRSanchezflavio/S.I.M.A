const BaseService = require('../src/services/base.service');
const RegistrosService = require('../src/services/registros.service');
const AuthService = require('../src/services/auth.service');
const AuditService = require('../src/services/audit.service');
const db = require('../src/db/knex');

describe('Services', () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    // Clean up data before each test
    await db('registros_delictuales').del();
    await db('personas_registradas').del();
    await db('usuarios').del();
    await db('audit_logs').del();
  });

  describe('BaseService', () => {
    let service;
    let testUser;

    beforeEach(async () => {
      const Joi = require('joi');
      const testSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().optional(),
      });

      service = new BaseService(db, 'usuarios', testSchema);
      
      testUser = { id: 1, usuario: 'testuser' };
    });

    it('should validate data correctly', () => {
      const validData = { name: 'Test', email: 'test@example.com' };
      expect(() => service.validateData(validData)).not.toThrow();

      const invalidData = { name: '', email: 'invalid-email' };
      expect(() => service.validateData(invalidData)).toThrow();
    });

    it('should handle list operations with filters', async () => {
      // Insert test data
      await db('usuarios').insert([
        { usuario: 'user1', nombre: 'User', apellido: 'One', rol: 'usuario', activo: true, password_hash: 'hash1' },
        { usuario: 'user2', nombre: 'User', apellido: 'Two', rol: 'admin', activo: true, password_hash: 'hash2' },
      ]);

      const result = await service.list({
        page: 1,
        pageSize: 10,
        filters: { rol: 'usuario' }
      });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('AuthService', () => {
    let authService;

    beforeEach(() => {
      authService = new AuthService(db);
    });

    it('should hash passwords when creating users', async () => {
      const userData = {
        usuario: 'newuser',
        nombre: 'New',
        apellido: 'User',
        rol: 'usuario',
        activo: true,
      };

      const adminUser = { id: 1 };
      const result = await authService.createUser(userData, adminUser);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('tempPassword');

      const user = await db('usuarios').where({ id: result.id }).first();
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe(result.tempPassword);
    });

    it('should prevent duplicate usernames', async () => {
      // Insert first user
      await db('usuarios').insert({
        usuario: 'testuser',
        nombre: 'Test',
        apellido: 'User',
        rol: 'usuario',
        password_hash: 'hash',
        activo: true,
      });

      const userData = {
        usuario: 'testuser', // Same username
        nombre: 'Another',
        apellido: 'User',
        rol: 'usuario',
      };

      await expect(authService.createUser(userData, { id: 1 }))
        .rejects.toThrow('El nombre de usuario ya existe');
    });

    it('should generate temporary passwords with correct format', () => {
      const tempPassword = authService.generateTempPassword();
      
      expect(tempPassword).toHaveLength(12);
      expect(tempPassword).toMatch(/^[A-Za-z0-9]+$/);
      expect(tempPassword).not.toContain('0'); // Should not contain confusing chars
      expect(tempPassword).not.toContain('1');
    });
  });

  describe('RegistrosService', () => {
    let registrosService;
    let testUser;
    let testPersona;

    beforeEach(async () => {
      registrosService = new RegistrosService(db);
      testUser = { id: 1 };

      // Insert test user
      await db('usuarios').insert({
        id: 1,
        usuario: 'testuser',
        nombre: 'Test',
        apellido: 'User',
        rol: 'usuario',
        password_hash: 'hash',
        activo: true,
      });

      // Insert test persona
      const [personaId] = await db('personas_registradas').insert({
        nombre: 'Test',
        apellido: 'Person',
        dni: '12345678',
        created_by: 1,
      }).returning('id');
      
      testPersona = { id: personaId?.id || personaId };
    });

    it('should create registro with audit logging', async () => {
      const registroData = {
        persona_id: testPersona.id,
        tipo_delito: 'Test Delito',
        lugar: 'Test Place',
        estado: 'Activo',
      };

      const id = await registrosService.create(registroData, testUser);

      expect(id).toBeDefined();

      // Verify registro was created
      const registro = await db('registros_delictuales').where({ id }).first();
      expect(registro).toBeDefined();
      expect(registro.tipo_delito).toBe('Test Delito');

      // Verify audit log was created
      const auditLog = await db('audit_logs')
        .where({ entity: 'registro', entity_id: id })
        .first();
      expect(auditLog).toBeDefined();
      expect(auditLog.action).toBe('create');
    });

    it('should update registro with audit logging', async () => {
      // First create a registro
      const [id] = await db('registros_delictuales').insert({
        persona_id: testPersona.id,
        tipo_delito: 'Original Delito',
        created_by: 1,
      }).returning('id');

      const registroId = id?.id || id;

      // Update the registro
      const updateData = {
        persona_id: testPersona.id,
        tipo_delito: 'Updated Delito',
        estado: 'Cerrado',
      };

      const success = await registrosService.update(registroId, updateData, testUser);

      expect(success).toBe(true);

      // Verify update
      const updated = await db('registros_delictuales').where({ id: registroId }).first();
      expect(updated.tipo_delito).toBe('Updated Delito');

      // Verify audit log
      const auditLog = await db('audit_logs')
        .where({ entity: 'registro', entity_id: registroId, action: 'update' })
        .first();
      expect(auditLog).toBeDefined();
    });

    it('should duplicate registro correctly', async () => {
      // Create original registro
      const [id] = await db('registros_delictuales').insert({
        persona_id: testPersona.id,
        tipo_delito: 'Original Delito',
        lugar: 'Original Place',
        estado: 'Activo',
        created_by: 1,
      }).returning('id');

      const originalId = id?.id || id;

      // Duplicate the registro
      const newId = await registrosService.duplicate(originalId, testUser);

      expect(newId).toBeDefined();
      expect(newId).not.toBe(originalId);

      // Verify both registros exist and have same data
      const original = await db('registros_delictuales').where({ id: originalId }).first();
      const duplicate = await db('registros_delictuales').where({ id: newId }).first();

      expect(duplicate.tipo_delito).toBe(original.tipo_delito);
      expect(duplicate.lugar).toBe(original.lugar);
      expect(duplicate.estado).toBe(original.estado);
      expect(duplicate.persona_id).toBe(original.persona_id);
    });

    it('should search registros with filters', async () => {
      // Create test registros
      await db('registros_delictuales').insert([
        { persona_id: testPersona.id, tipo_delito: 'Robo', lugar: 'Buenos Aires', created_by: 1 },
        { persona_id: testPersona.id, tipo_delito: 'Hurto', lugar: 'Córdoba', created_by: 1 },
        { persona_id: testPersona.id, tipo_delito: 'Robo Agravado', lugar: 'Rosario', created_by: 1 },
      ]);

      // Search by text
      const results = await registrosService.searchRegistros({
        q: 'robo',
        page: 1,
        pageSize: 10
      });

      expect(results.items).toHaveLength(2); // Should match 'Robo' and 'Robo Agravado'
      expect(results.total).toBe(2);
    });
  });

  describe('AuditService', () => {
    let auditService;

    beforeEach(() => {
      auditService = new AuditService(db);
    });

    it('should log actions correctly', async () => {
      await auditService.logAction(1, 'create', 'registro', 123, { test: 'data' });

      const log = await db('audit_logs').first();
      expect(log.user_id).toBe(1);
      expect(log.action).toBe('create');
      expect(log.entity).toBe('registro');
      expect(log.entity_id).toBe(123);
      expect(log.payload).toEqual({ test: 'data' });
    });

    it('should handle failed audit logging gracefully', async () => {
      // This should not throw even if the audit log fails
      await expect(auditService.logAction(null, 'test', 'invalid', 'not_number', {}))
        .resolves.not.toThrow();
    });

    it('should get logs for entity', async () => {
      // Create multiple logs
      await auditService.logAction(1, 'create', 'registro', 123, {});
      await auditService.logAction(2, 'update', 'registro', 123, {});
      await auditService.logAction(1, 'create', 'persona', 456, {});

      const logs = await auditService.getLogsForEntity('registro', 123);
      
      expect(logs).toHaveLength(2);
      expect(logs[0].action).toBe('update'); // Should be ordered by created_at desc
      expect(logs[1].action).toBe('create');
    });
  });
});