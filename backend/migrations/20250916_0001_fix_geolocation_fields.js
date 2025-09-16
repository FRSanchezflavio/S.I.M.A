/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Verificar si las columnas ya existen antes de agregarlas
  const hasLatitud = await knex.schema.hasColumn(
    'personas_registradas',
    'latitud'
  );
  const hasLongitud = await knex.schema.hasColumn(
    'personas_registradas',
    'longitud'
  );

  return knex.schema.alterTable('personas_registradas', table => {
    if (!hasLatitud) {
      table.decimal('latitud', 10, 8);
    }
    if (!hasLongitud) {
      table.decimal('longitud', 11, 8);
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('personas_registradas', table => {
    table.dropColumn('latitud');
    table.dropColumn('longitud');
  });
};
