/**
 * Agrega campos de auditoría created_by y updated_by.
 */

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  // personas_registradas
  await knex.schema.alterTable('personas_registradas', t => {
    t.integer('created_by')
      .unsigned()
      .references('id')
      .inTable('usuarios')
      .onDelete('SET NULL');
    t.integer('updated_by')
      .unsigned()
      .references('id')
      .inTable('usuarios')
      .onDelete('SET NULL');
  });

  // registros_delictuales
  await knex.schema.alterTable('registros_delictuales', t => {
    t.integer('created_by')
      .unsigned()
      .references('id')
      .inTable('usuarios')
      .onDelete('SET NULL');
    t.integer('updated_by')
      .unsigned()
      .references('id')
      .inTable('usuarios')
      .onDelete('SET NULL');
  });

  // usuarios (self-reference)
  await knex.schema.alterTable('usuarios', t => {
    t.integer('created_by')
      .unsigned()
      .references('id')
      .inTable('usuarios')
      .onDelete('SET NULL');
    t.integer('updated_by')
      .unsigned()
      .references('id')
      .inTable('usuarios')
      .onDelete('SET NULL');
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable('personas_registradas', t => {
    t.dropColumns('created_by', 'updated_by');
  });
  await knex.schema.alterTable('registros_delictuales', t => {
    t.dropColumns('created_by', 'updated_by');
  });
  await knex.schema.alterTable('usuarios', t => {
    t.dropColumns('created_by', 'updated_by');
  });
};
