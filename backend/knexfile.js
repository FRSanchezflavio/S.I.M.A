// Cargar variables de entorno: .env base y si corresponde, .env.test
require('dotenv').config();
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test', override: true });
}

// Configuración para PostgreSQL
const pgConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sima',
  },
  pool: { min: 2, max: 10 },
  migrations: { tableName: 'knex_migrations', directory: './migrations' },
};

// Configuración para SQLite (desarrollo)
const sqliteConfig = {
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3',
  },
  useNullAsDefault: true,
  migrations: { tableName: 'knex_migrations', directory: './migrations' },
};

// Usar SQLite en desarrollo si DATABASE_URL no está definido o DB_PASSWORD está vacío
const useSqlite =
  process.env.NODE_ENV === 'development' &&
  (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === '');

module.exports = {
  development: useSqlite ? sqliteConfig : pgConfig,
  test: { ...pgConfig },
  production: { ...pgConfig },
};
