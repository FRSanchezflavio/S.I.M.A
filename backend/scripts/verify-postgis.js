/**
 * Script para verificar que PostGIS esté instalado y disponible
 */

const knex = require('../src/db/knex');

async function verifyPostGIS() {
  try {
    console.log('🔍 Verificando disponibilidad de PostGIS...\n');

    // Verificar si PostGIS está disponible para instalar
    const availableExtensions = await knex.raw(`
      SELECT name, default_version, installed_version 
      FROM pg_available_extensions 
      WHERE name = 'postgis'
    `);

    if (availableExtensions.rows.length === 0) {
      console.log('❌ PostGIS NO está disponible en el servidor PostgreSQL');
      console.log(
        '📝 Necesitas instalar PostGIS usando Stack Builder o descarga manual'
      );
      console.log('🔗 Descarga: https://postgis.net/windows_downloads/');
      return false;
    }

    const postgis = availableExtensions.rows[0];

    if (postgis.installed_version) {
      console.log('✅ PostGIS está instalado y disponible');
      console.log(`   Versión instalada: ${postgis.installed_version}`);

      // Verificar funciones PostGIS
      const functionsTest = await knex.raw('SELECT PostGIS_Version()');
      console.log(
        `   Versión PostGIS: ${functionsTest.rows[0].postgis_version}`
      );

      return true;
    } else {
      console.log(
        '⚠️  PostGIS está disponible pero NO instalado en esta base de datos'
      );
      console.log(`   Versión disponible: ${postgis.default_version}`);
      console.log(
        '🔧 Ejecuta las migraciones para habilitarlo automáticamente'
      );
      return false;
    }
  } catch (error) {
    console.log('❌ Error verificando PostGIS:', error.message);
    return false;
  } finally {
    await knex.destroy();
  }
}

if (require.main === module) {
  verifyPostGIS().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { verifyPostGIS };
