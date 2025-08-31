/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('personas_registradas', t => {
    t.integer('edad').nullable();
    t.string('tipo_delito').nullable();
    t.string('modalidad').nullable();
    t.string('categoria').nullable();
    t.date('fecha_carga').nullable();
    t.string('unidades_regionales').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('personas_registradas', t => {
    t.dropColumns([
      'edad',
      'tipo_delito',
      'modalidad',
      'categoria',
      'fecha_carga',
      'unidades_regionales',
    ]);
  });
};
