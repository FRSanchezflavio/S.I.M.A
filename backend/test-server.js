const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', message: 'Test server working' }));
});

server.on('error', err => {
  console.error('Server error:', err);
});

server.listen(4003, '127.0.0.1', () => {
  console.log('Test server running on http://127.0.0.1:4003');
  console.log('Server listening:', server.listening);
  console.log('Server address:', server.address());
});

// Mantener el proceso vivo
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close();
  process.exit(0);
});
