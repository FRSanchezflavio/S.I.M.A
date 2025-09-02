# Instalación y Configuración del Módulo de Geolocalización - S.I.M.A.

Este documento describe el proceso de instalación y configuración del nuevo módulo de geolocalización para el Sistema de Identificación de Mencionados y/o Aprehendidos (S.I.M.A.).

## Requisitos Previos

### Base de Datos

- PostgreSQL 12 o superior
- Extensión PostGIS 3.0 o superior

### Backend

- Node.js 18.0 o superior
- npm o yarn

### Frontend

- React 18.0 o superior
- Navegador moderno con soporte para geolocalización HTML5

## Instalación

### 1. Configurar Base de Datos

#### Instalar PostGIS en PostgreSQL

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgis postgresql-15-postgis-3
```

**CentOS/RHEL:**

```bash
sudo yum install postgis33_15
```

**Windows:**

- Descargar e instalar PostGIS desde: https://postgis.net/windows_downloads/
- O usar el Stack Builder de PostgreSQL

#### Ejecutar Migraciones

```bash
cd backend
npm run migrate
```

Las migraciones incluirán:

- `20250901_0001_enable_postgis.js` - Habilita la extensión PostGIS
- `20250901_0002_add_geolocation_fields.js` - Agrega campos de geolocalización

### 2. Configurar Backend

#### Instalar Dependencias

```bash
cd backend
npm install
```

Las nuevas dependencias incluyen:

- `node-geocoder` - Servicio de geocodificación
- `axios` - Cliente HTTP para servicios externos
- `geolib` - Cálculos geográficos
- `archiver` - Generación de archivos ZIP para exportación

#### Variables de Entorno

Agregar al archivo `.env`:

```bash
# Configuración de geocodificación (opcional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
GEOCODING_API_KEY=your_api_key_here
```

**Nota:** La geocodificación funcionará con OpenStreetMap sin API key, pero Google Maps proporciona mayor precisión.

### 3. Configurar Frontend

#### Instalar Dependencias

```bash
cd sima-frontend
npm install
```

Las nuevas dependencias incluyen:

- `leaflet` - Biblioteca de mapas
- `react-leaflet` - Componentes React para Leaflet
- `leaflet-defaulticon-compatibility` - Compatibilidad de iconos

#### CSS de Leaflet

El CSS de Leaflet se importa automáticamente en los componentes, no se requiere configuración adicional.

## Estructura de Archivos Nuevos

### Backend

```
backend/src/
├── services/
│   ├── geocoding.js          # Servicio de geocodificación
│   └── geoData.js           # Servicio de datos geoespaciales
├── controllers/
│   └── geo.controller.js    # Controlador de geolocalización
├── routes/
│   └── geo.routes.js        # Rutas de geolocalización
└── migrations/
    ├── 20250901_0001_enable_postgis.js
    └── 20250901_0002_add_geolocation_fields.js
```

### Frontend

```
sima-frontend/src/
├── services/
│   └── geoService.js        # Servicio de geolocalización frontend
├── components/
│   ├── MapComponent.jsx     # Componente de mapa principal
│   └── LocationSelector.jsx # Selector de ubicación
└── pages/
    └── MapasPage.jsx        # Página de visualización geográfica
```

## Configuración

### 1. Servicios de Geocodificación

#### OpenStreetMap (Gratuito)

- Se usa por defecto
- No requiere API key
- Límites de uso razonables
- Buena cobertura para Argentina

#### Google Maps (Opcional)

- Mayor precisión y cobertura
- Requiere API key y facturación
- Para obtener API key: https://console.cloud.google.com/

```bash
# .env
GOOGLE_MAPS_API_KEY=AIzaSyC...
```

### 2. Configuración PostGIS

Las migraciones crean automáticamente:

- Extensión PostGIS habilitada
- Campos de coordenadas (latitud/longitud)
- Campos de geometría PostGIS (GEOGRAPHY POINT)
- Índices espaciales para optimización

### 3. Permisos y Seguridad

#### Geolocalización del Navegador

- Los usuarios deben permitir acceso a ubicación
- Solo funciona en HTTPS en producción
- Configurar certificados SSL válidos

#### Filtrado de Coordenadas

- Las coordenadas se validan para estar en Argentina
- Rangos aproximados:
  - Latitud: -55° a -21°
  - Longitud: -73° a -53°

## Uso

### 1. Cargar Personas con Geolocalización

1. Ir a **Cargar Mencionado/Aprehendido**
2. Completar datos personales
3. Ingresar dirección
4. Hacer clic en el ícono 📍 para geocodificar
5. O hacer clic en el ícono 🗺️ para seleccionar en mapa
6. Verificar ubicación en vista previa
7. Guardar normalmente

### 2. Visualización Geográfica

1. Ir a **Visualización Geográfica** desde el Dashboard
2. El mapa muestra:
   - 🔵 Personas registradas (domicilios)
   - 🔴 Registros delictuales (lugares de hechos)
3. Usar filtros para refinar visualización
4. Exportar datos para QGIS si es necesario

### 3. Búsqueda por Proximidad

1. En la visualización geográfica
2. Hacer clic en **Buscar por ubicación**
3. Seleccionar punto en el mapa o ingresar dirección
4. Ajustar radio de búsqueda
5. Ver resultados filtrados

## Integración con QGIS

### 1. Exportar Datos

1. Ir a **Visualización Geográfica**
2. Aplicar filtros deseados
3. Hacer clic en **Exportar**
4. Seleccionar formato:
   - **GeoJSON**: Archivo único, más simple
   - **Shapefile**: ZIP con todos los componentes

### 2. Importar en QGIS

#### Para GeoJSON:

1. Abrir QGIS
2. **Capa** > **Agregar capa** > **Agregar capa vectorial**
3. Seleccionar archivo `.geojson`
4. Configurar simbología según campo `tipo`

#### Para Shapefile:

1. Extraer archivo ZIP
2. Abrir archivo `.geojson` (incluido en ZIP)
3. Leer `metadata.json` para información adicional

### 3. Conexión Directa (Avanzado)

Para conexión directa a la base de datos:

1. En QGIS: **Navegador** > **PostGIS**
2. **Nueva conexión**:

   - **Host**: Dirección del servidor
   - **Puerto**: 5432
   - **Base de datos**: sima
   - **Usuario/contraseña**: credenciales de BD

3. Consultas SQL para capas:

```sql
-- Personas con domicilio
SELECT
    id, nombre, apellido, dni, tipo_delito,
    ST_AsText(domicilio_geoposicion) as geom
FROM personas_registradas
WHERE domicilio_geoposicion IS NOT NULL;

-- Registros delictuales
SELECT
    r.id, r.tipo_delito, p.nombre, p.apellido,
    ST_AsText(r.hecho_geoposicion) as geom
FROM registros_delictuales r
JOIN personas_registradas p ON r.persona_id = p.id
WHERE r.hecho_geoposicion IS NOT NULL;
```

## Solución de Problemas

### 1. Error: "PostGIS not enabled"

```bash
# Conectar a la base de datos
psql -U postgres -d sima

# Verificar extensiones
\dx

# Si PostGIS no está instalado:
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 2. Error de Geocodificación

- Verificar conexión a internet
- Para Google Maps: verificar API key válida y billing habilitado
- Para OpenStreetMap: verificar que no se excedan límites de uso

### 3. Mapa No Carga

- Verificar que el navegador soporte JavaScript
- Verificar conexión a OpenStreetMap tiles
- Revisar consola del navegador para errores

### 4. Permisos de Ubicación

- En Chrome: Configuración > Privacidad y seguridad > Configuración del sitio > Ubicación
- En Firefox: about:preferences#privacy > Permisos > Ubicación

### 5. Performance en Base de Datos

```sql
-- Verificar índices espaciales
SELECT indexname, tablename
FROM pg_indexes
WHERE indexname LIKE '%geo%';

-- Recrear índices si es necesario
REINDEX INDEX idx_personas_domicilio_geo;
REINDEX INDEX idx_registros_hecho_geo;
```

## Mantenimiento

### 1. Limpieza de Datos

```sql
-- Encontrar registros con coordenadas inválidas
SELECT id, domicilio_latitud, domicilio_longitud
FROM personas_registradas
WHERE domicilio_latitud < -90 OR domicilio_latitud > 90
   OR domicilio_longitud < -180 OR domicilio_longitud > 180;

-- Limpiar geometrías inconsistentes
UPDATE personas_registradas
SET domicilio_geoposicion = ST_SetSRID(ST_MakePoint(domicilio_longitud, domicilio_latitud), 4326)
WHERE domicilio_latitud IS NOT NULL
  AND domicilio_longitud IS NOT NULL
  AND domicilio_geoposicion IS NULL;
```

### 2. Monitoreo

- Revisar logs de geocodificación en `/var/log/sima/`
- Monitorear uso de API de Google Maps si está configurado
- Verificar rendimiento de consultas espaciales

### 3. Backup

Los campos de geolocalización se incluyen automáticamente en los backups estándar de PostgreSQL. Para backup específico de datos geoespaciales:

```bash
# Backup solo de datos geoespaciales
pg_dump -U postgres -d sima \
  -t personas_registradas \
  -t registros_delictuales \
  --data-only > geo_backup.sql
```

## Actualizaciones Futuras

### Funcionalidades Planeadas

1. **Análisis Espacial Avanzado**

   - Clustering de eventos
   - Análisis de patrones temporales
   - Mapas de calor

2. **Integración con Servicios Externos**

   - Catastro municipal
   - Servicios de emergencia
   - Cámaras de seguridad

3. **Alertas Geográficas**
   - Notificaciones por proximidad
   - Zonas de alerta configurables
   - Informes automáticos

### Roadmap de Versiones

- **v1.1**: Análisis básico de patrones espaciales
- **v1.2**: Integración con servicios municipales
- **v1.3**: Sistema de alertas geográficas
- **v2.0**: Dashboard de análisis predictivo

---

## Soporte

Para soporte técnico o preguntas sobre la implementación:

- **Documentación técnica**: Ver `/docs/` en el repositorio
- **Issues**: GitHub Issues del proyecto
- **Contacto**: Administrador del sistema S.I.M.A.

---

_Última actualización: Septiembre 2025_
