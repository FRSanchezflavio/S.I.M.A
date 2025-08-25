/**
 * Índices para acelerar listados/búsquedas de registros
 */

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm');
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_registros_tipo_trgm ON registros_delictuales USING GIN (tipo_delito gin_trgm_ops)'
  );
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_registros_lugar_trgm ON registros_delictuales USING GIN (lugar gin_trgm_ops)'
  );
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_registros_estado ON registros_delictuales (estado)'
  );
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_registros_juzgado ON registros_delictuales (juzgado)'
  );
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_registros_persona ON registros_delictuales (persona_id)'
  );
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_registros_deleted_at ON registros_delictuales (deleted_at)'
  );
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.raw('DROP INDEX IF EXISTS idx_registros_tipo_trgm');
  await knex.raw('DROP INDEX IF EXISTS idx_registros_lugar_trgm');
  await knex.raw('DROP INDEX IF EXISTS idx_registros_estado');
  await knex.raw('DROP INDEX IF EXISTS idx_registros_juzgado');
  await knex.raw('DROP INDEX IF EXISTS idx_registros_persona');
  await knex.raw('DROP INDEX IF EXISTS idx_registros_deleted_at');
};
