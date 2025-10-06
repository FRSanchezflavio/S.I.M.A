/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const columns = [
    'centralidad_grado',
    'indice_influencia',
    'conexiones_directas',
    'conexiones_indirectas',
    'ultimo_calculo_centralidad',
  ];

  const existingColumns = await Promise.all(
    columns.map(col =>
      knex.schema
        .hasColumn('personas_registradas', col)
        .then(has => ({ col, has }))
    )
  );

  const missing = existingColumns
    .filter(item => !item.has)
    .map(item => item.col);

  if (missing.length > 0) {
    return knex.schema.alterTable('personas_registradas', table => {
      // Agregar campos de análisis de centralidad y grado de influencia
      if (missing.includes('centralidad_grado')) {
        table.decimal('centralidad_grado', 8, 4).defaultTo(0);
      }
      if (missing.includes('indice_influencia')) {
        table.decimal('indice_influencia', 8, 4).defaultTo(0);
      }
      if (missing.includes('conexiones_directas')) {
        table.integer('conexiones_directas').defaultTo(0);
      }
      if (missing.includes('conexiones_indirectas')) {
        table.integer('conexiones_indirectas').defaultTo(0);
      }
      if (missing.includes('ultimo_calculo_centralidad')) {
        table.timestamp('ultimo_calculo_centralidad').nullable();
      }
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('personas_registradas', table => {
    table.dropColumn('centralidad_grado');
    table.dropColumn('indice_influencia');
    table.dropColumn('conexiones_directas');
    table.dropColumn('conexiones_indirectas');
    table.dropColumn('ultimo_calculo_centralidad');
  });
};
