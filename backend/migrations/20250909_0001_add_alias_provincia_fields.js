/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('personas_registradas', function (table) {
    table
      .string('alias', 100)
      .nullable()
      .comment('Alias o apodo conocido de la persona');
    table
      .string('provincia', 50)
      .nullable()
      .comment('Provincia de residencia o del hecho');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('personas_registradas', function (table) {
    table.dropColumn('alias');
    table.dropColumn('provincia');
  });
};
