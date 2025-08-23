# SIMA - Backend API

Requisitos

- Node 18+
- PostgreSQL 14+

Configuración

1. Copia `.env.example` a `.env` y ajusta variables.
2. Crea la base de datos `sima` en PostgreSQL.
3. Instala dependencias y ejecuta migraciones.

Scripts

- `npm run dev` -> inicia servidor con nodemon (http://localhost:4000)
- `npm run migrate` -> aplica migraciones

Endpoints importantes

- `GET /api/health` -> healthcheck
- `POST /api/auth/login` -> login (usuario, password)
- `POST /api/auth/refresh` -> refresh token

Notas

- Usuario inicial: usuario `admin`, password `admin123` (cambia tras primer login).
- Subidas en `/uploads` (configurable).
