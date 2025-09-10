/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('personas_registradas', function (table) {
    table
      .decimal('latitud', 10, 8)
      .nullable()
      .comment('Latitud de la dirección (georeferenciación)');
    table
      .decimal('longitud', 11, 8)
      .nullable()
      .comment('Longitud de la dirección (georeferenciación)');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('personas_registradas', function (table) {
    table.dropColumn('latitud');
    table.dropColumn('longitud');
  });
};
