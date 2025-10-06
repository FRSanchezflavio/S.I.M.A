/**
 * Índices para acelerar búsquedas por nombre/apellido y DNI/Comisaría.
 */

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  // Solo PostgreSQL soporta pg_trgm y GIN indexes
  if (knex.client.config.client === 'pg') {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm');
    await knex.raw(
      'CREATE INDEX IF NOT EXISTS idx_personas_apellido_trgm ON personas_registradas USING GIN (apellido gin_trgm_ops)'
    );
    await knex.raw(
      'CREATE INDEX IF NOT EXISTS idx_personas_nombre_trgm ON personas_registradas USING GIN (nombre gin_trgm_ops)'
    );
  } else {
    // SQLite: índices simples
    await knex.raw(
      'CREATE INDEX IF NOT EXISTS idx_personas_apellido ON personas_registradas (apellido)'
    );
    await knex.raw(
      'CREATE INDEX IF NOT EXISTS idx_personas_nombre ON personas_registradas (nombre)'
    );
  }

  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_personas_dni ON personas_registradas (dni)'
  );
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_personas_comisaria ON personas_registradas (comisaria)'
  );
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.raw('DROP INDEX IF EXISTS idx_personas_apellido_trgm');
  await knex.raw('DROP INDEX IF EXISTS idx_personas_nombre_trgm');
  await knex.raw('DROP INDEX IF EXISTS idx_personas_dni');
  await knex.raw('DROP INDEX IF EXISTS idx_personas_comisaria');
};
