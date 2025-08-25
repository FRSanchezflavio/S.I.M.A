/**
 * Índices para acelerar búsquedas por nombre/apellido y DNI/Comisaría.
 */

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm');
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_personas_apellido_trgm ON personas_registradas USING GIN (apellido gin_trgm_ops)'
  );
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_personas_nombre_trgm ON personas_registradas USING GIN (nombre gin_trgm_ops)'
  );
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
