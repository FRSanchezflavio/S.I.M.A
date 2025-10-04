const { exec } = require('child_process');
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

console.log('Iniciando servidor SIMA...');
console.log('Directorio:', backendPath);

process.chdir(backendPath);

// Ejecutar el servidor
const server = exec('node src/server.js', (error, stdout, stderr) => {
  if (error) {
    console.error('Error al ejecutar servidor:', error);
    return;
  }
  if (stderr) {
    console.error('stderr:', stderr);
    return;
  }
  console.log('stdout:', stdout);
});

server.stdout.on('data', data => {
  console.log('Server:', data.toString());
});

server.stderr.on('data', data => {
  console.error('Server Error:', data.toString());
});
