/**
 * Migración: Agregar campo género a personas_registradas
 */

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable('personas_registradas', t => {
    t.enu('genero', ['masculino', 'femenino', 'otro'])
      .nullable()
      .after('fecha_nacimiento');
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable('personas_registradas', t => {
    t.dropColumn('genero');
  });
};
