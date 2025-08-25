process.env.NODE_ENV = process.env.NODE_ENV || 'test';
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const envTestPath = path.join(root, '.env.test');
// Cargar primero .env base
require('dotenv').config();
// Si existe .env.test, sobreescribe solo lo que defina
if (fs.existsSync(envTestPath)) {
  require('dotenv').config({ path: envTestPath, override: true });
}
