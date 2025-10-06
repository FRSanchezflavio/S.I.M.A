/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Verificar si la columna direccion_hecho ya existe
  const hasColumn = await knex.schema.hasColumn(
    'personas_registradas',
    'direccion_hecho'
  );

  if (!hasColumn) {
    await knex.schema.table('personas_registradas', table => {
      table.text('direccion_hecho').nullable();
      console.log('✅ Columna direccion_hecho agregada');
    });
  } else {
    console.log('⚠️ Columna direccion_hecho ya existe, omitiendo');
  }

  // Verificar si las columnas de geolocalización del hecho ya existen
  const hasLatitudHecho = await knex.schema.hasColumn(
    'personas_registradas',
    'latitud_hecho'
  );
  const hasLongitudHecho = await knex.schema.hasColumn(
    'personas_registradas',
    'longitud_hecho'
  );

  if (!hasLatitudHecho || !hasLongitudHecho) {
    await knex.schema.table('personas_registradas', table => {
      if (!hasLatitudHecho) {
        table.decimal('latitud_hecho', 10, 8).nullable();
        console.log('✅ Columna latitud_hecho agregada');
      }
      if (!hasLongitudHecho) {
        table.decimal('longitud_hecho', 11, 8).nullable();
        console.log('✅ Columna longitud_hecho agregada');
      }
    });
  } else {
    console.log(
      '⚠️ Columnas de geolocalización del hecho ya existen, omitiendo'
    );
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.table('personas_registradas', table => {
    table.dropColumn('direccion_hecho');
    table.dropColumn('latitud_hecho');
    table.dropColumn('longitud_hecho');
  });
};
