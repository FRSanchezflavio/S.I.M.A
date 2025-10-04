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

console.log('Creando usuario admin...');
console.log('Directorio:', backendPath);

process.chdir(backendPath);

// Importar y ejecutar directamente el script
require('./backend/create-admin.js');
