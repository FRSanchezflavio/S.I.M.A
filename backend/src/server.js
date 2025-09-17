const app = require('./app');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

server.on('error', err => {
  console.error('Server error:', err);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`SIMA API corriendo en http://localhost:${PORT}`);
  console.log('Server listening:', server.listening);
  console.log('Server address:', server.address());
});

// Mantener el proceso vivo
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close();
  process.exit(0);
});
