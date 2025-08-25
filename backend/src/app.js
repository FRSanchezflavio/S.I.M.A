const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const path = require('path');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
dotenv.config();

const { errorHandler, notFoundHandler } = require('./middlewares/error');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const corsOptions = require('./middlewares/cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const personasRoutes = require('./routes/personas.routes');
const registrosRoutes = require('./routes/registros.routes');
const db = require('./db/knex');
const swaggerUi = require('swagger-ui-express');
const apiSpec = require('../docs/openapi.json');

const app = express();

// Seguridad básica
app.use(helmet());
app.use(hpp());
app.use(require('./middlewares/ip-allow'));
app.use(pinoHttp({ logger }));

// CORS restringido a LAN/orígenes permitidos
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limit específicamente para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos, intente más tarde.' },
});

app.set('trust proxy', 1); // detrás de Nginx

// Archivos estáticos (fotos)
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

// Rutas
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/personas', personasRoutes);
app.use('/api/registros', registrosRoutes);

// API Docs (Swagger UI)
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(apiSpec, { explorer: true })
);
app.get('/api/openapi.json', (_req, res) => res.json(apiSpec));

app.get('/api/health', async (_req, res) => {
  try {
    await db.raw('select 1');
    return res.json({ ok: true, db: true });
  } catch (e) {
    return res.status(500).json({ ok: false, db: false });
  }
});

// Not found y errores
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
