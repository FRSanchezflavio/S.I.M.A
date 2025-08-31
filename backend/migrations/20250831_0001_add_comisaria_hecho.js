/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('personas_registradas', t => {
    t.string('comisaria_hecho')
      .nullable()
      .comment('Comisaría donde sucedió el hecho');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('personas_registradas', t => {
    t.dropColumn('comisaria_hecho');
  });
};
