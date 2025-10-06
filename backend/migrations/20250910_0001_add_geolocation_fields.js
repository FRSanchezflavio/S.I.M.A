/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasLatitud = await knex.schema.hasColumn(
    'personas_registradas',
    'latitud'
  );
  const hasLongitud = await knex.schema.hasColumn(
    'personas_registradas',
    'longitud'
  );

  if (!hasLatitud || !hasLongitud) {
    return knex.schema.alterTable('personas_registradas', function (table) {
      if (!hasLatitud) {
        table
          .decimal('latitud', 10, 8)
          .nullable()
          .comment('Latitud de la dirección (georeferenciación)');
      }
      if (!hasLongitud) {
        table
          .decimal('longitud', 11, 8)
          .nullable()
          .comment('Longitud de la dirección (georeferenciación)');
      }
    });
  }
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
