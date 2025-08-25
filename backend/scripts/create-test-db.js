// Crea la base de datos de pruebas si no existe, usando credenciales de .env + .env.test
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Cargar .env base y luego .env.test
require('dotenv').config();
const envTest = path.join(process.cwd(), '.env.test');
if (fs.existsSync(envTest)) {
  require('dotenv').config({ path: envTest, override: true });
}

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '5432',
  DB_USER = 'postgres',
  DB_PASSWORD = '',
  DB_NAME = 'sima_test',
} = process.env;

async function ensureTestDb() {
  const admin = new Client({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'postgres',
  });
  await admin.connect();
  try {
    const { rows } = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [DB_NAME]
    );
    if (rows.length === 0) {
      await admin.query(`CREATE DATABASE ${DB_NAME.replace(/"/g, '')}`);
      console.log(`Created database ${DB_NAME}`);
    } else {
      console.log(`Database ${DB_NAME} already exists`);
    }
  } finally {
    await admin.end();
  }
}

ensureTestDb().catch(err => {
  console.error('Failed to ensure test DB:', err.message);
  process.exit(1);
});
