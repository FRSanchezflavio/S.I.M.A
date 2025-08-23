/**
 * Migración inicial: usuarios, personas_registradas, registros_delictuales
 */

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable('usuarios', t => {
    t.increments('id').primary();
    t.string('usuario').notNullable().unique();
    t.string('password_hash').notNullable();
    t.string('nombre').notNullable();
    t.string('apellido').notNullable();
    t.enu('rol', ['admin', 'usuario']).notNullable().defaultTo('usuario');
    t.boolean('activo').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('personas_registradas', t => {
    t.increments('id').primary();
    t.string('nombre').notNullable();
    t.string('apellido').notNullable();
    t.string('dni').notNullable().index();
    t.date('fecha_nacimiento');
    t.string('nacionalidad');
    t.string('direccion');
    t.string('telefono');
    t.string('email');
    t.text('observaciones');
    t.string('foto_principal');
    t.jsonb('fotos_adicionales').defaultTo(knex.raw("'[]'::jsonb"));
    t.string('comisaria').index();
    t.timestamps(true, true);
  });

  await knex.schema.createTable('registros_delictuales', t => {
    t.increments('id').primary();
    t.integer('persona_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('personas_registradas')
      .onDelete('CASCADE');
    t.string('tipo_delito').notNullable();
    t.string('lugar');
    t.string('estado');
    t.string('juzgado');
    t.text('detalle');
    t.timestamps(true, true);
  });

  await knex.schema.alterTable('personas_registradas', t => {
    t.index(['apellido', 'nombre']);
  });
  // Usuario admin por defecto (password: admin123) solo si no existe tabla aún (lo hace luego de crear tabla)
  const exists = await knex('usuarios')
    .where({ usuario: 'admin' })
    .first()
    .catch(() => null);
  if (!exists) {
    // hash precomputado para bcrypt 12 rounds de 'admin123' (generar en runtime en app si prefieres)
    const hash = '$2b$12$2qtE4j6hsTe2Qp2e5zN6Eeo6K0EwY00u7mSkdxkZ3b0m0JYyO9mwa';
    await knex('usuarios').insert({
      usuario: 'admin',
      password_hash: hash,
      nombre: 'Admin',
      apellido: 'SIMA',
      rol: 'admin',
      activo: true,
    });
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('registros_delictuales');
  await knex.schema.dropTableIfExists('personas_registradas');
  await knex.schema.dropTableIfExists('usuarios');
};
