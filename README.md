# S.I.M.A — Sistema de Información de Mencionados y Aprehendidos

Aplicación full‑stack para gestión y consulta de personas mencionadas/aprehendidas y sus registros delictuales. Incluye API REST (Node/Express + PostgreSQL) y frontend React con autenticación JWT, exportación CSV/XLSX, auditoría y backups.

## Arquitectura

- Backend (carpeta `backend/`)
  - Node.js + Express
  - PostgreSQL + Knex (migraciones)
  - Autenticación JWT (access/refresh) con rotación segura y `token_version`.
  - Subida de archivos (Multer) para fotos.
  - Seguridad: CORS restringido, Helmet, HPP, rate‑limit en login, IP allow (prod), sanitización.
  - Auditoría: `created_by`, `updated_by`, `deleted_at` (soft delete) y `audit_logs`.
  - Documentación Swagger: `/api/docs` y `backend/docs/openapi.json`.
- Frontend (carpeta `sima-frontend/`)
  - React 18 + React Router v6 + MUI
  - Axios con interceptor de refresh token (single‑flight) y toasts globales.
  - Rutas protegidas, dashboard, búsqueda/exportación, CRUD de personas y registros.

## Funcionalidades clave

- Login con roles (admin/usuario). Usuario inicial: admin / admin123 (cambiar en primer uso).
- Personas: alta, búsqueda (nombre, DNI, comisaría), detalle con fotos, edición/eliminación (soft delete), exportación CSV/XLSX.
- Registros delictuales: listado con filtros, paginación server‑side, detalle, alta/edición/eliminación, duplicado, exportación CSV/XLSX.
- Auditoría: campos de usuario y tabla `audit_logs` para cambios.
- Backups: script que genera dump de DB y empaqueta `uploads/`.

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- Windows/Mac/Linux (probado en Windows)

## Instalación rápida (dev)

1. Backend

- Variables en `backend/.env` (puedes copiar de `.env.example` si existe).
- Crear DB `sima` en PostgreSQL.
- Instalar y migrar:
  - `cd backend`
  - `npm install`
  - `npm run migrate`
- Iniciar: `npm start` (http://localhost:4000)

2. Frontend

- `cd sima-frontend`
- `npm install`
- `npm start` (http://localhost:3000)
- El proxy del frontend apunta a `http://localhost:4000` para /api.

Credenciales por defecto

- Usuario: admin
- Contraseña: admin123
- Cambiar con `POST /api/usuarios/me/password`.

## Endpoints principales

- Salud: `GET /api/health`
- Auth: `POST /api/auth/login`, `POST /api/auth/refresh`
- Personas: `GET /api/personas` (filtros: `q|dni|comisaria`, paginación `page|pageSize`, export `format=csv|xlsx`), `POST /api/personas`, `GET/PUT/DELETE /api/personas/:id`
- Registros: `GET /api/registros` (filtros: `persona_id|q`, paginación `page|pageSize`, export `format=csv|xlsx`), `POST /api/registros`, `GET/PUT/DELETE /api/registros/:id`

Especificación completa en Swagger UI: `http://localhost:4000/api/docs`.

## Seguridad

- JWT de acceso + refresh con rotación y `token_version` (revocación de sesiones al cambiar contraseña/cerrar sesión globalmente).
- Validaciones Joi; sanitización de campos textuales; validación de MIME/extension para uploads.
- CORS controlado, Helmet, HPP, rate‑limit en login; filtro IP en producción.
- Soft delete (`deleted_at`) para evitar pérdida accidental.

## Datos y migraciones

Tablas: `usuarios`, `personas_registradas`, `registros_delictuales`, `audit_logs`.

- Índices de rendimiento (pg_trgm para búsquedas por texto, índices por DNI/comisaría/persona_id/estado, etc.).
- Migraciones en `backend/migrations/` (ejecutar con `npm run migrate`).

## Backups y restauración

- `cd backend && npm run backup` -> genera dump SQL y comprime `uploads/`.
- Requisitos: `pg_dump` disponible en el PATH; `zip`/`tar` recomendado.
- Restauración: `psql -d sima -f <dump.sql>` y restaurar carpeta `uploads/`.

## Pruebas

- Backend: Jest + Supertest; DB de test aislada (`.env.test`).
- Ejecutar: `cd backend && npm test`.

## Despliegue (resumen)

- PM2 para proceso Node, Nginx como proxy (ver `backend/deploy/nginx.conf.example`).
- Variables de entorno seguras; programar backups; logs con Pino/PM2.

## Recorrido de demo (5 minutos)

1. Login (admin/admin123) y cambio de contraseña.
2. Cargar persona (con foto), buscar por nombre/DNI, exportar CSV/XLSX.
3. Ver detalle, agregar registro delictual, editar y duplicar.
4. Listar registros con filtro por persona y búsqueda textual; exportar.
5. Mostrar auditoría (quién creó/actualizó) y explicar soft delete.

---

Para detalles de cada componente ver `backend/README.md` y `sima-frontend/README.md`.
