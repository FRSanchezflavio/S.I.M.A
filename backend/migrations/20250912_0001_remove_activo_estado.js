/**
 * Migración para eliminar el estado 'activo' de delitos/causas
 * y reemplazarlo por 'en_proceso' donde sea necesario
 */

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  // Actualizar registros que tengan estado 'activo' a 'en_proceso'
  await knex('registros_delictuales')
    .where('estado', 'activo')
    .update('estado', 'en_proceso');

  console.log(
    'Migración completada: estados "activo" cambiados a "en_proceso"'
  );
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  // En el rollback, podríamos cambiar 'en_proceso' de vuelta a 'activo'
  // pero solo si sabemos que era 'activo' originalmente
  console.log(
    'Rollback: no se puede determinar qué registros eran originalmente "activo"'
  );
};
