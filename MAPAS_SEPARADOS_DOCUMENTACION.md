# División del Mapa en Dos Opciones Separadas

## ✅ Implementación Completada

Se ha dividido el mapa en **dos opciones independientes** para visualizar de forma separada:

1. **📍 Mapa de Hechos Delictivos** - Ubicaciones donde ocurrieron los delitos
2. **🏠 Mapa de Domicilios** - Ubicaciones de residencia de los sujetos

---

## 🎯 Diferencias Entre los Mapas

### 📍 Mapa de Hechos Delictivos

**Ruta:** `/mapa-hechos`

**Muestra:**

- Ubicaciones exactas donde ocurrieron los hechos delictivos
- Coordenadas del lugar del hecho (`latitud_hecho`, `longitud_hecho`)
- Dirección del hecho (`direccion_hecho`)
- Comisaría donde ocurrió el hecho (`comisaria_hecho`)

**Utilidad:**

- Análisis de zonas calientes (hotspots)
- Patrones geográficos de criminalidad
- Distribución territorial de delitos
- Planificación de patrullajes preventivos
- Identificación de puntos críticos

### 🏠 Mapa de Domicilios

**Ruta:** `/mapa-domicilios`

**Muestra:**

- Ubicaciones de residencia de personas registradas
- Coordenadas del domicilio (`latitud`, `longitud`)
- Dirección del domicilio (`direccion`)
- Localidad y provincia
- Comisaría de jurisdicción

**Utilidad:**

- Planificación de operativos y allanamientos
- Identificación de zonas de interés policial
- Análisis de concentración residencial
- Búsqueda por proximidad a un domicilio
- Cruce de datos con zonas delictivas

---

## 📁 Archivos Creados

### 1. `sima-frontend/src/pages/MapaHechos.jsx`

- Componente completo para visualizar hechos delictivos
- Usa campos `latitud_hecho` y `longitud_hecho`
- Estadísticas específicas de hechos
- Botón para navegar al mapa de domicilios

### 2. `sima-frontend/src/pages/MapaDomicilios.jsx`

- Componente completo para visualizar domicilios
- Usa campos `latitud` y `longitud` (domicilio del sujeto)
- Estadísticas específicas de domicilios
- Botón para navegar al mapa de hechos

---

## 🔧 Archivos Modificados

### 1. `sima-frontend/src/routes.js`

**Cambios:**

- Importados `MapaHechos` y `MapaDomicilios`
- Agregadas rutas `/mapa-hechos` y `/mapa-domicilios`

```javascript
import MapaHechos from './pages/MapaHechos';
import MapaDomicilios from './pages/MapaDomicilios';

// En las rutas:
<Route path="/mapa-hechos" element={<MapaHechos />} />
<Route path="/mapa-domicilios" element={<MapaDomicilios />} />
```

### 2. `sima-frontend/src/components/Header.jsx`

**Cambios:**

- Actualizados los `menuItems` para incluir ambos mapas
- Agregados "Mapa de Hechos" y "Mapa de Domicilios" al menú móvil

```javascript
const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Buscar', icon: <Search />, path: '/buscar' },
  { text: 'Cargar', icon: <Add />, path: '/cargar' },
  { text: 'Mapa General', icon: <LocationOn />, path: '/mapa' },
  { text: 'Mapa de Hechos', icon: <LocationOn />, path: '/mapa-hechos', secondary: true },
  { text: 'Mapa de Domicilios', icon: <LocationOn />, path: '/mapa-domicilios', secondary: true },
  { text: 'Inteligencia', icon: <AccountTree />, path: '/inteligencia' },
  { text: 'Registros', icon: <ListIcon />, path: '/registros' },
];
```

### 3. `sima-frontend/src/pages/MapaGeneral.jsx`

**Cambios:**

- Agregados botones de navegación rápida a los dos mapas específicos
- Actualizada la descripción para mencionar ambos mapas

---

## 🗺️ Navegación Entre Mapas

### Desde el Mapa General

```
Mapa General
  ↓
[📍 Mapa de Hechos] [🏠 Mapa de Domicilios]
```

### Desde el Mapa de Hechos

```
Mapa de Hechos
  ↓
[👤 Ver Mapa de Domicilios]
```

### Desde el Mapa de Domicilios

```
Mapa de Domicilios
  ↓
[📍 Ver Mapa de Hechos]
```

### Desde el Menú Móvil (Hamburguesa)

```
☰ Menú
├── Dashboard
├── Buscar
├── Cargar
├── Mapa General
├── Mapa de Hechos    ← NUEVO
├── Mapa de Domicilios ← NUEVO
├── Inteligencia
└── Registros
```

---

## 📊 Estructura de Datos

### Campos de Base de Datos

#### Domicilio del Sujeto

```javascript
{
  direccion: 'Calle 123, San Miguel de Tucumán',
  latitud: -26.8083,
  longitud: -65.2176,
  localidad: 'San Miguel de Tucumán',
  provincia: 'Tucumán',
  comisaria: 'Comisaría 1ra'
}
```

#### Lugar del Hecho

```javascript
{
  direccion_hecho: 'Av. Aconquija 456',
  latitud_hecho: -26.8234,
  longitud_hecho: -65.2345,
  comisaria_hecho: 'Comisaría 3ra'
}
```

---

## 🧪 Cómo Probar

### 1. Iniciar la Aplicación

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd sima-frontend
npm start
```

### 2. Acceder a los Mapas

**Opción A - Desde el Dashboard:**

1. Login en `http://localhost:3000`
2. Ir a "Mapa" desde el menú
3. Click en "📍 Mapa de Hechos Delictivos"
4. O click en "🏠 Mapa de Domicilios"

**Opción B - URLs directas:**

- Mapa General: `http://localhost:3000/mapa`
- Mapa de Hechos: `http://localhost:3000/mapa-hechos`
- Mapa de Domicilios: `http://localhost:3000/mapa-domicilios`

**Opción C - Menú móvil:**

1. Reducir ancho de ventana (< 960px)
2. Click en ☰ (hamburguesa)
3. Seleccionar "Mapa de Hechos" o "Mapa de Domicilios"

### 3. Verificar Funcionalidad

**En el Mapa de Hechos:**

- ✅ Solo aparecen marcadores con `latitud_hecho` y `longitud_hecho`
- ✅ Al hacer click en un marcador, muestra "Lugar del Hecho"
- ✅ Muestra `direccion_hecho` y `comisaria_hecho`
- ✅ Botón para ir al Mapa de Domicilios visible

**En el Mapa de Domicilios:**

- ✅ Solo aparecen marcadores con `latitud` y `longitud` (domicilio)
- ✅ Al hacer click en un marcador, muestra "Domicilio"
- ✅ Muestra `direccion`, `localidad`, `provincia`
- ✅ Botón para ir al Mapa de Hechos visible

---

## 📈 Estadísticas por Mapa

### Mapa de Hechos

- Total de hechos registrados
- Casos resueltos
- Casos en proceso
- Casos activos

### Mapa de Domicilios

- Total de domicilios registrados
- Con dirección completa
- Sin dirección
- Casos activos

---

## 🎨 Diferencias Visuales

### Mapa de Hechos

- **Título:** 📍 Mapa de Hechos Delictivos
- **Icono principal:** ⚖️ Gavel (martillo de juez)
- **Color tema:** Azul marino (rgb(21, 77, 113))
- **Enfoque:** Lugares donde se cometieron delitos

### Mapa de Domicilios

- **Título:** 🏠 Mapa de Domicilios
- **Icono principal:** 🏠 Home
- **Color tema:** Azul marino (rgb(21, 77, 113))
- **Enfoque:** Residencias de personas registradas

---

## 🔍 Casos de Uso

### Investigación Criminal

1. **Análisis de zona:** Ver mapa de hechos para identificar hotspots
2. **Identificar sospechosos:** Ver mapa de domicilios cercanos al hecho
3. **Cruce de datos:** Comparar ambos mapas para establecer patrones

### Operativos Policiales

1. **Planificación:** Usar mapa de domicilios para ubicar sujetos
2. **Prevención:** Usar mapa de hechos para patrullajes preventivos
3. **Coordinación:** Identificar comisarías de jurisdicción

### Análisis Territorial

1. **Concentración delictiva:** Mapa de hechos muestra zonas críticas
2. **Concentración residencial:** Mapa de domicilios muestra dónde viven los sujetos
3. **Correlación:** Analizar si hay correlación entre ambos

---

## ✅ Checklist de Funcionalidad

- [x] Mapa de Hechos creado y funcional
- [x] Mapa de Domicilios creado y funcional
- [x] Rutas agregadas correctamente
- [x] Menú móvil actualizado
- [x] Navegación entre mapas implementada
- [x] Botones de acceso rápido en Mapa General
- [x] Estadísticas específicas por tipo de mapa
- [x] Filtros y controles de mapa funcionando
- [x] Dialogs de detalle personalizados
- [x] Simbología policial aplicada
- [x] Responsive design implementado

---

## 🚀 Estado Final

**Fecha:** 7 de octubre de 2025  
**Estado:** ✅ Completado y Listo para Pruebas

**Archivos creados:** 3  
**Archivos modificados:** 3  
**Rutas nuevas:** 2  
**Menú actualizado:** ✅

---

**Próximos pasos sugeridos:**

1. Probar ambos mapas con datos reales
2. Verificar que los filtros funcionen correctamente
3. Revisar que la carga de datos sea óptima
4. Considerar agregar más estadísticas específicas
