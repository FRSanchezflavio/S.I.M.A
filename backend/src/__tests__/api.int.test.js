const request = require('supertest');
const app = require('../app');
const db = require('../db/knex');
const { hashPassword } = require('../utils/hash');

describe('SIMA API integración', () => {
  let token;
  let trx;

  beforeAll(async () => {
    // Limpiar tablas antes de la suite en DB de test
    await db.raw(
      'TRUNCATE TABLE registros_delictuales RESTART IDENTITY CASCADE'
    );
    await db.raw(
      'TRUNCATE TABLE personas_registradas RESTART IDENTITY CASCADE'
    );
    await db.raw('TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE');
    // Volver a insertar admin
    const hash = await hashPassword('admin123');
    await db('usuarios').insert({
      usuario: 'admin',
      password_hash: hash,
      nombre: 'Admin',
      apellido: 'SIMA',
      rol: 'admin',
      activo: true,
    });
  });

  beforeEach(async () => {
    trx = await db.transaction();
  });

  afterEach(async () => {
    if (trx) await trx.rollback();
  });

  afterAll(async () => {
    // Limpieza de datos creados durante la suite
    await db.raw(
      'TRUNCATE TABLE registros_delictuales RESTART IDENTITY CASCADE'
    );
    await db.raw(
      'TRUNCATE TABLE personas_registradas RESTART IDENTITY CASCADE'
    );
    await db.destroy();
  });

  test('login admin obtiene tokens', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'admin', password: 'admin123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    token = res.body.accessToken;
  });

  test('crear persona y luego buscarla', async () => {
    const payload = {
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '30123456',
      nacionalidad: 'Argentina',
      telefono: '+54 381 5555555',
      email: 'juan@example.com',
      comisaria: 'Comisaría 1',
    };
    const create = await request(app)
      .post('/api/personas')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect([200, 201]).toContain(create.statusCode);
    const id = create.body.id;
    expect(id).toBeTruthy();

    const search = await request(app)
      .get('/api/personas?q=Juan')
      .set('Authorization', `Bearer ${token}`);
    expect(search.statusCode).toBe(200);
    expect(Array.isArray(search.body.items)).toBe(true);
  });

  test('export CSV', async () => {
    const res = await request(app)
      .get('/api/personas?format=csv')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
  });

  test('rechaza crear persona con DNI inválido (400)', async () => {
    const bad = {
      nombre: 'Ana',
      apellido: 'Prueba',
      dni: 'ABC123', // inválido
    };
    const res = await request(app)
      .post('/api/personas')
      .set('Authorization', `Bearer ${token}`)
      .send(bad);
    expect(res.statusCode).toBe(400);
  });

  test('requiere auth para acceder a /api/personas (401)', async () => {
    const res = await request(app).get('/api/personas');
    expect(res.statusCode).toBe(401);
  });

  test('login con credenciales inválidas -> 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'admin', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });
});
