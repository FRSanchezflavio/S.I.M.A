# SIMA — Frontend

Aplicación React (CRA) para consultar y gestionar personas y registros.

## Scripts

- `npm start` — entorno de desarrollo en http://localhost:3000
- `npm run build` — build de producción en `build/`

Proxy de desarrollo: `package.json` define `"proxy": "http://localhost:4000"`, por lo que todas las llamadas a `/api` se redirigen al backend local.

## Estructura

- `src/App.jsx`, `src/routes.js` — enrutamiento y protección de rutas.
- `src/services/api.js` — Axios con baseURL `/api`, interceptor de refresh token y toasts de error homogéneos.
- `src/components/` — Header, Footer, FormInput, ProtectedRoute, ToastProvider, etc.
- `src/pages/` — Login, Dashboard, Buscar, Cargar, PersonaDetalle, Registros, RegistroDetalle, RegistroNuevo.

## Autenticación

- Login obtiene `accessToken` y `refreshToken`.
- Interceptor intenta `POST /api/auth/refresh` automáticamente ante 401 y reintenta la solicitud.
- Si falla refresh, limpia tokens y redirige a `/login`.

## Funcionalidades

- Buscar personas por nombre/DNI/comisaría; exportar CSV/XLSX.
- Ver/editar detalle de persona; subir fotos; agregar registro.
- Registros con filtros (`persona_id`, texto), paginación server‑side y export CSV/XLSX.
- Duplicar registro desde su detalle; soft delete para admin.

## Notificaciones

- `ToastProvider` brinda toasts globales; `utils/toastBus` expone una función `toast(msg, type)`.

## Variables relevantes

- Los tokens se guardan en `localStorage` (`accessToken`, `refreshToken`).
- El rol (`admin`|`usuario`) se deriva del JWT de acceso para mostrar/ocultar botones de administración.

## Conexión con backend

- BaseURL `/api` + proxy CRA a `http://localhost:4000`.
- Asegurar que el backend esté corriendo en el puerto 4000.
