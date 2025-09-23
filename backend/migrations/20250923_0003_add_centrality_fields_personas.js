/**
 * Agrega campos de centralidad a personas_registradas
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('personas_registradas', t => {
    t.decimal('centralidad_grado', 8, 4).defaultTo(0);
    t.timestamp('centralidad_actualizada_at').nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('personas_registradas', t => {
    t.dropColumn('centralidad_grado');
    t.dropColumn('centralidad_actualizada_at');
  });
};
