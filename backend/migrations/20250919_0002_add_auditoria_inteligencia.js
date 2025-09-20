/**
 * Migración para crear tabla de auditoría específica para inteligencia criminal
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('auditoria_inteligencia', function (table) {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().notNullable();
    table.string('accion', 100).notNullable(); // CREAR_VINCULACION, ELIMINAR_BANDA, etc.
    table.string('entidad_tipo', 50).notNullable(); // vinculacion, banda, territorio
    table.integer('entidad_id').unsigned().nullable();
    table.json('datos_anteriores').nullable();
    table.json('datos_nuevos').nullable();
    table.string('ip_origen', 45).nullable();
    table.text('user_agent').nullable();
    table.text('justificacion').nullable();
    table.timestamp('timestamp').defaultTo(knex.fn.now());
    table.timestamps(true, true);

    // Índices para búsquedas frecuentes
    table.index('usuario_id');
    table.index('accion');
    table.index('entidad_tipo');
    table.index('timestamp');
    table.index(['entidad_tipo', 'entidad_id']);

    // Foreign key
    table.foreign('usuario_id').references('id').inTable('usuarios');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('auditoria_inteligencia');
};
