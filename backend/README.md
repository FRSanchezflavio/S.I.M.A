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
- `npm test` -> crea DB de test si hace falta, migra y ejecuta Jest
- `npm run backup` -> genera dump de la DB y empaqueta uploads

Endpoints importantes

- `GET /api/health` -> healthcheck
- `POST /api/auth/login` -> login (usuario, password)
- `POST /api/auth/refresh` -> refresh token
- `GET /api/personas` -> filtros `q|dni|comisaria`, paginación `page|pageSize`, export `format=csv|xlsx`
- `GET /api/registros` -> filtros `persona_id|q`, paginación `page|pageSize`, export `format=csv|xlsx`

Notas

- Usuario inicial: usuario `admin`, password `admin123` (cambia tras primer login).
- Subidas en `/uploads` (configurable).

## Documentación de API (Swagger)

- Navegar a `http://localhost:4000/api/docs` para Swagger UI.
- Especificación en `backend/docs/openapi.json`.

## Backups

- Script: `npm run backup`. Requiere `pg_dump` en PATH y preferentemente `zip` o `tar`.
- Directorio destino configurable via `BACKUP_DIR` (por defecto `backend/backups/`).
- Se crean: `sima_YYYY-MM-DDTHH-MM-SS.sql` y `uploads_*.zip` o `.tar.gz`.

## Entorno de pruebas

- Variables en `.env` para desarrollo y `.env.test` para tests. `.env.test` sólo sobreescribe lo necesario (por defecto `DB_NAME=sima_test`, `UPLOAD_DIR=uploads_test`, secretos JWT de test).
- `npm test` ejecuta:
  1.  `scripts/create-test-db.js` que crea `sima_test` si no existe.
  2.  Migraciones en `NODE_ENV=test`.
  3.  Tests con Jest + Supertest.

## Despliegue (PM2 + Nginx)

1. Copiar `.env` al servidor con credenciales de producción y `NODE_ENV=production`.
2. `npm install --production` en `backend/`.
3. Iniciar con PM2: `pm2 start ecosystem.config.js --only sima-backend`.
4. Nginx: ver `deploy/nginx.conf.example` y ajustar `server_name`/`proxy_pass`.
5. Logs: `pm2 logs sima-backend`.

Backups: programar `pg_dump` periódico de la base de datos y resguardo del directorio `uploads/`.

## Uso rápido en Windows

1. PostgreSQL instalado y servicio activo. Crear DB `sima`.
2. `cd backend && npm install && npm run migrate && npm start`.
3. `cd ../sima-frontend && npm install && npm start`.
4. Abrir `http://localhost:3000` y loguear con `admin/admin123` (cambiar password).
