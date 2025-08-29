const request = require('supertest');
const db = require('../src/db/knex');

// Create a test app instance
const app = require('../src/app');

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Ensure test database is clean
    await db.migrate.latest();
  });

  afterAll(async () => {
    // Clean up
    await db.destroy();
  });

  beforeEach(async () => {
    // Clean up data before each test
    await db('usuarios').del();
    await db('audit_logs').del();
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await db('usuarios').insert({
        usuario: 'testuser',
        password_hash: '$2b$10$7e0BvE.Hp8HZu2yQKNJ8P.ZgCEPyF5Bqyf4vK5w5d8pHuS4qD8aCe', // 'password123'
        nombre: 'Test',
        apellido: 'User',
        rol: 'usuario',
        activo: true,
        token_version: 0,
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'testuser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'nonexistent',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    it('should validate input data', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'ab', // Too short
          password: '123', // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });

    it('should reject inactive user', async () => {
      // Make user inactive
      await db('usuarios')
        .where({ usuario: 'testuser' })
        .update({ activo: false });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Credenciales inválidas');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      // Create a test user and get tokens
      await db('usuarios').insert({
        usuario: 'testuser',
        password_hash: '$2b$10$7e0BvE.Hp8HZu2yQKNJ8P.ZgCEPyF5Bqyf4vK5w5d8pHuS4qD8aCe',
        nombre: 'Test',
        apellido: 'User',
        rol: 'usuario',
        activo: true,
        token_version: 0,
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'testuser',
          password: 'password123',
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Falta refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token inválido');
    });

    it('should reject refresh token with invalid version', async () => {
      // Increment token version in database
      await db('usuarios')
        .where({ usuario: 'testuser' })
        .increment('token_version', 1);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token inválido');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
  });
});