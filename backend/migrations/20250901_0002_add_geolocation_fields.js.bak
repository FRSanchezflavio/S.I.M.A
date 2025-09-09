/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('personas_registradas', table => {
    table.decimal('latitud', 10, 8);
    table.decimal('longitud', 11, 8);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('personas_registradas', table => {
    table.dropColumn('latitud');
    table.dropColumn('longitud');
  });
};
