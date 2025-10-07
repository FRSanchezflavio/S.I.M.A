const app = require('./app');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 4000;
// Permitir sobreescribir el host (útil para Docker/WSL). Por defecto escucha en todas las interfaces.
const HOST = process.env.HOST || '0.0.0.0';

console.log('Starting SIMA API server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);
console.log('Demo mode:', process.env.DEMO_MODE);

const server = http.createServer(app);

// Reintentos automáticos si el puerto está en uso (EADDRINUSE).
const basePort = parseInt(process.env.PORT || PORT, 10) || 4000;
let currentPort = basePort;
const MAX_RETRIES = parseInt(process.env.PORT_RETRY_MAX || '10', 10);
let attempts = 0;

function logListening(port) {
  const address = server.address();
  const hostForLog = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(
    `SIMA API corriendo en http://${hostForLog}:${port} (bind: ${HOST})`
  );
  console.log('Server listening:', server.listening);
  console.log('Server address:', address);
}

server.on('error', err => {
  if (err && err.code === 'EADDRINUSE') {
    console.warn(`Port ${currentPort} in use (EADDRINUSE).`);
    if (attempts >= MAX_RETRIES) {
      console.error(
        `Máximo de reintentos alcanzado (${MAX_RETRIES}). No se pudo bindear.`
      );
      console.error('Error final:', err);
      process.exit(1);
    }
    attempts += 1;
    currentPort = basePort + attempts; // intenta el siguiente puerto
    console.warn(
      `Intentando puerto alternativo ${currentPort} (intento ${attempts}/${MAX_RETRIES})...`
    );
    // Intentarlo de nuevo tras un pequeño retardo
    setTimeout(() => {
      try {
        server.listen(currentPort, HOST);
      } catch (e) {
        // En algunos entornos server.listen puede lanzar sincronamente
        console.error('Error al reintentar listen:', e);
      }
    }, 200);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Iniciar escucha por primera vez
try {
  server.listen(currentPort, HOST, () => logListening(currentPort));
} catch (e) {
  // server.listen puede lanzar si el puerto está en uso en algunos entornos
  console.error('Error al iniciar server.listen:', e);
}

// Mantener el proceso vivo - REMOVER PARA DEBUG
// process.on('SIGINT', () => {
//   console.log('Shutting down server...');
//   server.close();
//   process.exit(0);
// });
