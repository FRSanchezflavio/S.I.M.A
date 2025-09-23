/**
 * Migración: Agregar columnas legadas para compatibilidad con controladores
 * Crea columnas: tipo_vinculacion (string), estado_vinculacion (string), nivel_confianza (decimal)
 */

exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('vinculaciones_criminales');
  if (!exists) return Promise.resolve();

  const hasTipo = await knex.schema.hasColumn(
    'vinculaciones_criminales',
    'tipo_vinculacion'
  );
  if (!hasTipo) {
    await knex.schema.alterTable('vinculaciones_criminales', table => {
      table.string('tipo_vinculacion').nullable();
    });
  }

  const hasEstado = await knex.schema.hasColumn(
    'vinculaciones_criminales',
    'estado_vinculacion'
  );
  if (!hasEstado) {
    await knex.schema.alterTable('vinculaciones_criminales', table => {
      table.string('estado_vinculacion').nullable();
    });
  }

  const hasNivel = await knex.schema.hasColumn(
    'vinculaciones_criminales',
    'nivel_confianza'
  );
  if (!hasNivel) {
    await knex.schema.alterTable('vinculaciones_criminales', table => {
      table.decimal('nivel_confianza', 3, 2).defaultTo(0.3);
    });
  }
};

exports.down = async function (knex) {
  const exists = await knex.schema.hasTable('vinculaciones_criminales');
  if (!exists) return Promise.resolve();

  const hasTipo = await knex.schema.hasColumn(
    'vinculaciones_criminales',
    'tipo_vinculacion'
  );
  if (hasTipo) {
    await knex.schema.alterTable('vinculaciones_criminales', table => {
      table.dropColumn('tipo_vinculacion');
    });
  }

  const hasEstado = await knex.schema.hasColumn(
    'vinculaciones_criminales',
    'estado_vinculacion'
  );
  if (hasEstado) {
    await knex.schema.alterTable('vinculaciones_criminales', table => {
      table.dropColumn('estado_vinculacion');
    });
  }

  const hasNivel = await knex.schema.hasColumn(
    'vinculaciones_criminales',
    'nivel_confianza'
  );
  if (hasNivel) {
    await knex.schema.alterTable('vinculaciones_criminales', table => {
      table.dropColumn('nivel_confianza');
    });
  }
};
