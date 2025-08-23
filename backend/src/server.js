const app = require('./app');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`SIMA API corriendo en http://localhost:${PORT}`);
});
