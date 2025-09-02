/**
 * Migración: Habilitar PostGIS
 * Agregar extensión PostGIS para soporte geoespacial
 * NOTA: PostGIS debe estar instalado en el sistema antes de ejecutar esta migración
 */

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  try {
    // Verificar si PostGIS ya está habilitado
    const result = await knex.raw(`
      SELECT EXISTS(
        SELECT 1 FROM pg_extension WHERE extname = 'postgis'
      ) as exists
    `);

    if (result.rows[0].exists) {
      console.log('✅ PostGIS ya está habilitado');
      return;
    }

    // Intentar habilitar PostGIS
    await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ Extensión PostGIS habilitada correctamente');
  } catch (error) {
    console.error('❌ Error habilitando PostGIS:', error.message);
    console.log(`
📋 INSTRUCCIONES PARA INSTALAR POSTGIS:

Windows:
1. Descargar PostGIS desde: https://postgis.net/windows_downloads/
2. O usar Application Stack Builder de PostgreSQL
3. Reiniciar PostgreSQL después de la instalación

Ubuntu/Debian:
sudo apt update
sudo apt install postgis postgresql-16-postgis-3

CentOS/RHEL:
sudo yum install postgis34_16

Después de instalar PostGIS, ejecute nuevamente:
npm run migrate

NOTA: Sin PostGIS, las funcionalidades de geolocalización tendrán
funcionalidad limitada pero el sistema seguirá funcionando.
    `);

    // No falla la migración para permitir que el sistema funcione sin PostGIS
    console.log(
      '⚠️  Continuando sin PostGIS. Algunas funciones geoespaciales estarán limitadas.'
    );
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  // Nota: No eliminamos PostGIS en rollback por seguridad
  // ya que podría afectar otras aplicaciones
  console.log('⚠️  PostGIS no se elimina en rollback por seguridad');
};
