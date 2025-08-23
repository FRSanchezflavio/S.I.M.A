require('dotenv').config();

const base = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sima',
  },
  pool: { min: 2, max: 10 },
  migrations: { tableName: 'knex_migrations', directory: './migrations' },
};

module.exports = {
  development: { ...base },
  production: { ...base },
};
