const path = require('path');

const backendPath = path.join(
  'C:',
  'Users',
  'flavi',
  'OneDrive',
  'Escritorio',
  'S.I.M.A',
  'backend'
);
process.chdir(backendPath);

require('dotenv').config();

const db = require('./backend/src/db/knex');

async function testConnection() {
  try {
    console.log('Probando conexión a la base de datos...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);

    await db.raw('SELECT 1');
    console.log('✓ Conexión exitosa a PostgreSQL');

    // Verificar si la tabla usuarios existe
    const tableExists = await db.schema.hasTable('usuarios');
    console.log('✓ Tabla usuarios existe:', tableExists);

    if (!tableExists) {
      console.log('⚠ Ejecutando migraciones...');
      // Aquí podrías ejecutar las migraciones si fuera necesario
    }

    await db.destroy();
  } catch (error) {
    console.error('✗ Error de conexión:', error.message);
    process.exit(1);
  }
}

testConnection();
