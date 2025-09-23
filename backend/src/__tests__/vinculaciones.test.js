const request = require('supertest');
const app = require('../app');
const db = require('../db/knex');
const { hashPassword } =
  require('../../scripts/../src/utils/hash') || require('../utils/hash');

describe('Vinculaciones - centralidad', () => {
  let token;

  beforeAll(async () => {
    // Asegurar base limpia
    await db.raw(
      'TRUNCATE TABLE vinculaciones_criminales RESTART IDENTITY CASCADE'
    );
    await db.raw(
      'TRUNCATE TABLE personas_registradas RESTART IDENTITY CASCADE'
    );
    await db.raw('TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE');

    const hash = await hashPassword('admin123');
    await db('usuarios').insert({
      usuario: 'admin',
      password_hash: hash,
      nombre: 'Admin',
      apellido: 'SIMA',
      rol: 'admin',
      activo: true,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'admin', password: 'admin123' });
    expect(res.statusCode).toBe(200);
    token = res.body.accessToken;
  });

  afterAll(async () => {
    await db.raw(
      'TRUNCATE TABLE vinculaciones_criminales RESTART IDENTITY CASCADE'
    );
    await db.raw(
      'TRUNCATE TABLE personas_registradas RESTART IDENTITY CASCADE'
    );
    await db.destroy();
  });

  test('crear vinculo actualiza centralidad de grado', async () => {
    // Crear dos personas
    const p1 = await request(app)
      .post('/api/personas')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Persona', apellido: 'Uno', dni: '40000001' });
    expect([200, 201]).toContain(p1.statusCode);
    const id1 = p1.body.id;

    const p2 = await request(app)
      .post('/api/personas')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Persona', apellido: 'Dos', dni: '40000002' });
    expect([200, 201]).toContain(p2.statusCode);
    const id2 = p2.body.id;

    // Verificar centralidad inicial = 0
    const before1 = await db('personas_registradas').where('id', id1).first();
    const before2 = await db('personas_registradas').where('id', id2).first();
    expect(parseFloat(before1.centralidad_grado || 0)).toBe(0);
    expect(parseFloat(before2.centralidad_grado || 0)).toBe(0);

    // Crear vinculación entre ambas
    const payload = {
      persona_origen_id: id1,
      persona_destino_id: id2,
      tipo_vinculacion: 'amistad_personal',
      nivel_confianza: 0.7,
    };

    const res = await request(app)
      .post('/api/inteligencia/vinculaciones')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.statusCode).toBe(201);

    // Leer personas y verificar centralidad actualizada
    const after1 = await db('personas_registradas').where('id', id1).first();
    const after2 = await db('personas_registradas').where('id', id2).first();

    expect(parseInt(after1.centralidad_grado, 10)).toBeGreaterThanOrEqual(1);
    expect(parseInt(after2.centralidad_grado, 10)).toBeGreaterThanOrEqual(1);
  }, 20000);
});
