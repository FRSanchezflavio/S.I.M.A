const knex = require('knex');
const config = require('../../knexfile');

const env = process.env.NODE_ENV || 'development';
console.log('🗄️  Configurando conexión a base de datos...');
console.log('📍 Entorno:', env);
console.log('📍 DB Host:', process.env.DB_HOST || '127.0.0.1');
console.log('📍 DB Name:', process.env.DB_NAME || 'sima');

const db = knex(config[env]);

// Verificar conexión al inicializar
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Conexión a base de datos establecida correctamente');
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos:', err.message);
    console.error(
      '⚠️  La aplicación seguirá ejecutándose, pero las rutas que requieran DB fallarán'
    );
    console.error(
      '💡 Verifica que PostgreSQL esté corriendo y que las credenciales en .env sean correctas'
    );
  });

module.exports = db;
