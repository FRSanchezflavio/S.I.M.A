/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('personas_registradas', table => {
    // Agregar campos de análisis de centralidad y grado de influencia
    table.decimal('centralidad_grado', 8, 4).defaultTo(0);
    table.decimal('indice_influencia', 8, 4).defaultTo(0);
    table.integer('conexiones_directas').defaultTo(0);
    table.integer('conexiones_indirectas').defaultTo(0);
    table.timestamp('ultimo_calculo_centralidad').nullable();
  });
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
