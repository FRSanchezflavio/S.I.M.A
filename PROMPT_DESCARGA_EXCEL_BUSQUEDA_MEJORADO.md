# Prompt para Claude 4.5 - Implementación de Descarga Excel en Búsqueda (Versión Mejorada)

## 1. Contexto de la tarea

Actuarás como un desarrollador senior de React especializado en el sistema S.I.M.A (Sistema Integral de Monitoreo de Antecedentes). Tu tarea es implementar funcionalidad de descarga masiva en Excel de resultados de búsqueda en la página `Buscar.jsx`, con selección múltiple y exportación client-side usando SheetJS.

**Rol específico:** Full-stack developer con experiencia en React 18, Material-UI 5, y manejo de grandes volúmenes de datos en el frontend.

## 2. Contexto del tono

Debes mantener un tono profesional y técnico, proporcionando código limpio, bien documentado y siguiendo las convenciones del proyecto S.I.M.A. Usa nombres de variables en español (como en el resto del proyecto) y JSDoc para funciones complejas.

## 3. Datos de contexto, documentos e imágenes

### Archivos relevantes del proyecto:

**Frontend:**

- `sima-frontend/src/pages/Buscar.jsx` - Página principal de búsqueda (líneas ~183-197 botones existentes)
- `sima-frontend/src/components/CardResult.jsx` - Card individual de resultado
- `sima-frontend/src/pages/PersonaDetalle.jsx` (línea ~386) - Referencia de función `downloadSubjectData`
- `sima-frontend/src/components/TestExcelDownload.jsx` - Ejemplo de exportación Excel

**Backend:**

- `backend/src/controllers/personas.controller.js` - Endpoint de búsqueda con soporte CSV/XLSX

### Librería en uso:

- **`xlsx` v0.18+** (SheetJS) para generación de archivos Excel **client-side**
- Importar como: `import * as XLSX from 'xlsx';`

### Contexto del sistema:

- **Frontend:** React 18.2.0 con Material-UI 5.x
- **Backend:** Node.js 22.15.1 con Express 4.19.2
- **Base de datos:** PostgreSQL con campos: `latitud`, `longitud`, `latitud_hecho`, `longitud_hecho`
- **Autenticación:** JWT tokens en localStorage
- **Toasts:** Sistema `useToast()` ya implementado
- La búsqueda actual muestra cards con fotos de personas en un grid responsivo
- Los resultados se almacenan en estado `items` (array de objetos persona)

### Estructura de datos de una persona (ejemplo):

```javascript
{
  id: 123,
  nombre: 'Juan',
  apellido: 'Pérez',
  dni: '12345678',
  fecha_nacimiento: '1990-05-15T00:00:00.000Z',
  edad: 33,
  genero: 'masculino',
  nacionalidad: 'Argentina',
  direccion: 'Av. Sarmiento 123',
  telefono: '+54 381 1234567',
  email: null,
  comisaria: 'Comisaria 1ra',
  comisaria_hecho: 'Comisaria 3ra',
  unidades_regionales: 'URC',
  fecha_carga: '2025-01-10T14:30:00.000Z',
  observaciones: 'Antecedentes por robo',
  descripcion_fisica: 'Altura 1.75m, contextura media',
  tipo_delito: 'robo',
  modalidad: 'asaltante',
  latitud: -26.8083,
  longitud: -65.2176,
  latitud_hecho: -26.8234,
  longitud_hecho: -65.2345,
  direccion_hecho: 'Av. Aconquija 456',
  foto_principal: '/uploads/fotos/123_principal.jpg',
  fotos_adicionales: ['/uploads/fotos/123_1.jpg', '/uploads/fotos/123_2.jpg']
}
```

## 4. Descripción detallada de la tarea y reglas

### Objetivo Principal:

Agregar sistema completo de selección múltiple y botón de descarga Excel para exportar resultados de búsqueda **sin fotografías**, con generación **client-side** para evitar carga del servidor.

---

### Reglas Específicas:

#### 4.1. Ubicación y diseño del botón

**Ubicación:**

- Agregar en `Buscar.jsx` junto a los botones CSV/XLSX existentes (líneas ~183-197)
- Posición: Después del botón "Descargar XLSX"

**Diseño:**

- Usar icono `<TableViewIcon />` de `@mui/icons-material`
- Texto: `"Descargar Selección Excel ({cantidad})"`
- Variante: `outlined`
- Color: institucional `rgb(21, 77, 113)` en hover
- Disabled cuando: `isExporting || selectedItems.length === 0`

**Código esperado:**

```jsx
<Button
  variant="outlined"
  onClick={handleExportSelected}
  disabled={isExporting || selectedItems.length === 0}
  startIcon={isExporting ? <CircularProgress size={20} /> : <TableViewIcon />}
  sx={{
    color: 'rgb(21, 77, 113)',
    borderColor: 'rgb(21, 77, 113)',
    '&:hover': {
      backgroundColor: 'rgba(21, 77, 113, 0.08)',
      borderColor: 'rgb(21, 77, 113)',
    },
    '&:disabled': {
      borderColor: '#ccc',
    },
  }}
>
  {isExporting
    ? 'Generando...'
    : `Descargar Selección Excel (${selectedItems.length})`
  }
</Button>
```

---

#### 4.2. Funcionalidad de selección múltiple

**Estados requeridos:**

```javascript
const [selectedItems, setSelectedItems] = useState([]); // Array de IDs
const [isExporting, setIsExporting] = useState(false);
const [selectAllChecked, setSelectAllChecked] = useState(false);
```

**Checkbox "Seleccionar todo":**

- Ubicación: Encima del grid de resultados, a la izquierda
- Comportamiento:
  - Checked: Selecciona todos los `items` actuales (filtrados)
  - Unchecked: Deselecciona todos
  - Indeterminate: Cuando hay selección parcial

**Checkbox individual en cada CardResult:**

- Agregar prop `selected` y `onSelect` a `CardResult`
- Posición: Esquina superior derecha del card
- Click en checkbox NO debe navegar al detalle
- Usar `event.stopPropagation()` en el checkbox

**Código esperado para el checkbox "Seleccionar todo":**

```jsx
<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
  <FormControlLabel
    control={
      <Checkbox
        checked={selectAllChecked}
        indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
        onChange={handleSelectAll}
        sx={{
          color: 'rgb(21, 77, 113)',
          '&.Mui-checked': { color: 'rgb(21, 77, 113)' },
        }}
      />
    }
    label={`Seleccionar todos (${items.length} resultados)`}
  />
  {selectedItems.length > 0 && (
    <Typography variant="body2" sx={{ ml: 2, color: 'rgb(21, 77, 113)' }}>
      {selectedItems.length} seleccionado{selectedItems.length !== 1 ? 's' : ''}
    </Typography>
  )}
</Box>
```

---

#### 4.3. Estructura del archivo Excel

**Generación:** Client-side usando SheetJS (`XLSX.utils.book_new()`)

**Hoja 1 - "Datos Personales":**

Columnas (en este orden):

1. ID
2. Apellido
3. Nombre
4. DNI (mostrar "Sin DNI" si es null/vacío)
5. Fecha Nacimiento (formato: `DD/MM/YYYY`)
6. Edad
7. Género
8. Nacionalidad
9. Dirección (domicilio)
10. Teléfono (mostrar "Sin teléfono" si es null)
11. Email (mostrar "Sin email" si es null)
12. Comisaría (jurisdicción del mencionado/aprehendido)
13. Comisaría del Hecho
14. Unidades Regionales
15. Tipo de Delito
16. Modalidad
17. Fecha de Carga (formato: `DD/MM/YYYY HH:mm`)
18. Observaciones
19. Descripción Física

**Hoja 2 - "Ubicaciones" (solo si al menos 1 persona tiene coordenadas):**

Columnas:

1. ID Persona
2. Apellido
3. Nombre
4. **Domicilio:** Latitud
5. **Domicilio:** Longitud
6. **Domicilio:** Dirección
7. **Hecho:** Latitud
8. **Hecho:** Longitud
9. **Hecho:** Dirección

**Reglas de la hoja "Ubicaciones":**

- Incluir solo personas que tengan `latitud` Y `longitud` O `latitud_hecho` Y `longitud_hecho`
- Si no hay coordenadas, mostrar "-" en la celda
- Si hay coordenadas, formatear a 6 decimales: `latitud.toFixed(6)`

**Formato de celdas:**

- Headers: **Negrita**, fondo `#154d71` (azul institucional), texto blanco
- Ancho de columnas: Automático basado en contenido (usar `wscols`)
- Congelar primera fila (headers)
- Alineación: Izquierda para texto, derecha para números

---

#### 4.4. Formato del archivo y nombre

**Nombre del archivo:**

```
SIMA_Busqueda_[CRITERIO]_[CANTIDAD]personas_[TIMESTAMP].xlsx
```

**Ejemplos:**

- `SIMA_Busqueda_Juan_5personas_2025-10-07_14-30-45.xlsx`
- `SIMA_Busqueda_DNI-12345678_1persona_2025-10-07_15-00-12.xlsx`
- `SIMA_Busqueda_Todos_125personas_2025-10-07_16-45-30.xlsx`

**Formato del TIMESTAMP:**

- Formato: `YYYY-MM-DD_HH-mm-ss`
- Usar zona horaria local de Argentina (UTC-3)
- Código: `new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')`

**Criterio de búsqueda:**

- Si hay `texto` de búsqueda: usar el texto (max 30 caracteres)
- Si búsqueda por DNI: usar "DNI-[número]"
- Si es búsqueda vacía: usar "Todos"
- Sanitizar: eliminar caracteres especiales `/\:*?"<>|`

---

#### 4.5. Validaciones y manejo de errores

**Validaciones obligatorias:**

1. **Sin selección:**

   ```javascript
   if (selectedItems.length === 0) {
     showToast('⚠️ Seleccione al menos una persona para exportar', 'warning');
     return;
   }
   ```

2. **Items no existe:**

   ```javascript
   if (!items || items.length === 0) {
     showToast('❌ No hay resultados de búsqueda para exportar', 'error');
     return;
   }
   ```

3. **Datos faltantes:**

   - Usar valores por defecto: `|| 'Sin datos'`
   - No romper la exportación si faltan campos

4. **Error de generación:**
   ```javascript
   catch (error) {
     console.error('Error al exportar a Excel:', error);
     showToast('❌ Error al generar el archivo Excel. Intente nuevamente.', 'error');
   }
   ```

**Estados del botón:**

- **Disabled:** `isExporting || selectedItems.length === 0`
- **Loading:** Mostrar `CircularProgress` mientras exporta
- **Texto dinámico:** "Generando..." durante exportación

---

#### 4.6. Comportamiento post-exportación

**Al completar exitosamente:**

1. Mostrar toast: `✅ Archivo Excel generado: X personas exportadas`
2. Limpiar selección: `setSelectedItems([])`
3. Desmarcar "Seleccionar todo": `setSelectAllChecked(false)`
4. **NO** limpiar resultados de búsqueda (`items` permanece intacto)
5. **NO** cerrar o navegar a otra página

**Código esperado:**

```javascript
showToast(`✅ Archivo Excel generado: ${selectedItems.length} persona${selectedItems.length !== 1 ? 's' : ''} exportada${selectedItems.length !== 1 ? 's' : ''}`, 'success');
setSelectedItems([]);
setSelectAllChecked(false);
```

---

#### 4.7. Optimización para grandes volúmenes

**Límite recomendado: 1000 registros**

Si `selectedItems.length > 1000`:

```javascript
const confirmar = window.confirm(
  `⚠️ Va a exportar ${selectedItems.length} registros. Esto puede tardar varios segundos.\n\n¿Desea continuar?`
);
if (!confirmar) return;
```

**Optimización:**

- Procesar en lotes de 100 registros
- Mostrar progreso en toast: "Procesando... (300/1500)"
- Usar `requestIdleCallback` si es posible
- Si > 5000 registros: sugerir exportar desde el backend

---

#### 4.8. Formato de fechas y localización

**Fechas:**

- Formato: `DD/MM/YYYY` para fechas
- Formato: `DD/MM/YYYY HH:mm` para fecha-hora
- Zona horaria: Argentina (UTC-3)
- Si fecha es null: mostrar "-"

**Función auxiliar requerida:**

```javascript
/**
 * Formatea una fecha ISO a formato DD/MM/YYYY
 * @param {string|Date} fecha - Fecha en formato ISO o objeto Date
 * @param {boolean} incluirHora - Si incluir hora (HH:mm)
 * @returns {string} Fecha formateada o "-" si es null
 */
const formatearFecha = (fecha, incluirHora = false) => {
  if (!fecha) return '-';

  try {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();

    if (incluirHora) {
      const hora = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${anio} ${hora}:${min}`;
    }

    return `${dia}/${mes}/${anio}`;
  } catch (error) {
    return '-';
  }
};
```

---

#### 4.9. Campos a EXCLUIR del Excel

**IMPORTANTE - NO incluir:**

- `foto_principal` (URL de foto)
- `fotos_adicionales` (array de URLs)
- `created_at` (timestamp interno)
- `updated_at` (timestamp interno)
- `created_by` (ID usuario creador)
- `updated_by` (ID usuario modificador)
- `token_version` (seguridad)
- `password` (si existiera)

**Campos sensibles (incluir pero sanitizar):**

- `dni`: Mostrar completo (no ofuscar en esta versión)
- `telefono`: Mostrar completo
- `direccion`: Mostrar completo

---

#### 4.10. Estilo de código y convenciones

**Nombres de variables:**

- Usar español: `personasSeleccionadas`, `datosPersonales`, `hojaUbicaciones`
- Funciones: camelCase en español: `handleExportSelected`, `formatearFecha`
- Constantes: UPPER_SNAKE_CASE: `MAX_REGISTROS_SIN_CONFIRMACION`

**Comentarios:**

- JSDoc para funciones exportadas
- Comentarios inline en español para lógica compleja
- TODO/FIXME si hay mejoras pendientes

**Manejo de errores:**

- Try-catch en función principal
- Console.error con contexto
- Toast para feedback al usuario
- No mostrar stack traces al usuario

---

## 5. Ejemplos

### Ejemplo 1: Interacción estándar (flujo completo)

```javascript
// PASO 1: Usuario realiza búsqueda
Usuario: Escribe "Juan" en el campo de búsqueda
Usuario: Click en "Buscar"
Sistema: Muestra 15 resultados en cards

// PASO 2: Usuario selecciona items
Usuario: Click en checkbox del card de "Juan Pérez"
Sistema: Card se marca visualmente, contador muestra (1)
Usuario: Click en checkbox del card de "Juan Gómez"
Sistema: Contador muestra (2)
Usuario: Click en checkbox de "Juan López"
Sistema: Contador muestra (3)
Usuario: Click en checkbox "Seleccionar todo"
Sistema: Todos los 15 cards se marcan, contador muestra (15)
Usuario: Click nuevamente en checkbox "Seleccionar todo"
Sistema: Todos los cards se desmarcan, contador muestra (0)
Usuario: Marca manualmente 5 cards
Sistema: Contador muestra (5), checkbox "Seleccionar todo" en estado indeterminado

// PASO 3: Usuario exporta
Usuario: Click en "Descargar Selección Excel (5)"
Sistema: Botón se deshabilita y muestra "Generando..."
Sistema: Toast aparece: "Generando archivo Excel con 5 persona(s)..."
Sistema: (1 segundo después) Descarga automática de archivo
Sistema: Nombre del archivo: "SIMA_Busqueda_Juan_5personas_2025-10-07_14-30-45.xlsx"
Sistema: Toast de éxito: "✅ Archivo Excel generado: 5 personas exportadas"
Sistema: Todos los checkboxes se desmarcan automáticamente
Sistema: Botón vuelve a habilitarse con texto "Descargar Selección Excel (0)"
Sistema: Los 15 resultados de búsqueda permanecen en pantalla
```

---

### Ejemplo 2: Código completo de la función de exportación

```javascript
/**
 * Exporta las personas seleccionadas a un archivo Excel
 * Genera dos hojas: Datos Personales y Ubicaciones (si hay coordenadas)
 */
const handleExportSelected = async () => {
  try {
    // Validación 1: Verificar que hay items seleccionados
    if (selectedItems.length === 0) {
      showToast('⚠️ Seleccione al menos una persona para exportar', 'warning');
      return;
    }

    // Validación 2: Verificar que items existe
    if (!items || items.length === 0) {
      showToast('❌ No hay resultados de búsqueda para exportar', 'error');
      return;
    }

    // Confirmación para grandes volúmenes
    if (selectedItems.length > 1000) {
      const confirmar = window.confirm(
        `⚠️ Va a exportar ${selectedItems.length} registros. Esto puede tardar varios segundos.\n\n¿Desea continuar?`
      );
      if (!confirmar) return;
    }

    // Iniciar proceso de exportación
    setIsExporting(true);
    showToast(
      `Generando archivo Excel con ${selectedItems.length} persona(s)...`,
      'info'
    );

    // Filtrar personas seleccionadas
    const personasSeleccionadas = items.filter(item =>
      selectedItems.includes(item.id)
    );

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();

    // ============================================
    // HOJA 1: DATOS PERSONALES
    // ============================================
    const datosPersonales = personasSeleccionadas.map(p => ({
      ID: p.id,
      Apellido: p.apellido || '-',
      Nombre: p.nombre || '-',
      DNI: p.dni || 'Sin DNI',
      'Fecha Nacimiento': formatearFecha(p.fecha_nacimiento, false),
      Edad: p.edad || '-',
      Género: p.genero || '-',
      Nacionalidad: p.nacionalidad || '-',
      'Dirección': p.direccion || '-',
      Teléfono: p.telefono || 'Sin teléfono',
      Email: p.email || 'Sin email',
      Comisaría: p.comisaria || '-',
      'Comisaría del Hecho': p.comisaria_hecho || '-',
      'Unidades Regionales': p.unidades_regionales || '-',
      'Tipo de Delito': p.tipo_delito || '-',
      Modalidad: p.modalidad || '-',
      'Fecha de Carga': formatearFecha(p.fecha_carga, true),
      Observaciones: p.observaciones || '-',
      'Descripción Física': p.descripcion_fisica || '-',
    }));

    const wsDatosPersonales = XLSX.utils.json_to_sheet(datosPersonales);

    // Ajustar ancho de columnas automáticamente
    const colWidths = Object.keys(datosPersonales[0] || {}).map(key => ({
      wch: Math.max(
        key.length,
        ...datosPersonales.map(row => String(row[key] || '').length)
      ) + 2, // +2 para padding
    }));
    wsDatosPersonales['!cols'] = colWidths;

    // Estilo de headers (primera fila)
    const range = XLSX.utils.decode_range(wsDatosPersonales['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!wsDatosPersonales[address]) continue;
      wsDatosPersonales[address].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '154d71' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }

    XLSX.utils.book_append_sheet(workbook, wsDatosPersonales, 'Datos Personales');

    // ============================================
    // HOJA 2: UBICACIONES (solo si hay coordenadas)
    // ============================================
    const personasConUbicacion = personasSeleccionadas.filter(
      p =>
        (p.latitud && p.longitud) ||
        (p.latitud_hecho && p.longitud_hecho)
    );

    if (personasConUbicacion.length > 0) {
      const datosUbicaciones = personasConUbicacion.map(p => ({
        'ID Persona': p.id,
        Apellido: p.apellido || '-',
        Nombre: p.nombre || '-',
        'Domicilio - Latitud': p.latitud ? Number(p.latitud).toFixed(6) : '-',
        'Domicilio - Longitud': p.longitud ? Number(p.longitud).toFixed(6) : '-',
        'Domicilio - Dirección': p.direccion || '-',
        'Hecho - Latitud': p.latitud_hecho ? Number(p.latitud_hecho).toFixed(6) : '-',
        'Hecho - Longitud': p.longitud_hecho ? Number(p.longitud_hecho).toFixed(6) : '-',
        'Hecho - Dirección': p.direccion_hecho || '-',
      }));

      const wsUbicaciones = XLSX.utils.json_to_sheet(datosUbicaciones);

      // Ajustar ancho de columnas
      const colWidthsUbic = Object.keys(datosUbicaciones[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...datosUbicaciones.map(row => String(row[key] || '').length)
        ) + 2,
      }));
      wsUbicaciones['!cols'] = colWidthsUbic;

      XLSX.utils.book_append_sheet(workbook, wsUbicaciones, 'Ubicaciones');
    }

    // ============================================
    // GENERAR NOMBRE DE ARCHIVO
    // ============================================
    const criterio = (texto || 'Todos')
      .replace(/[/\\:*?"<>|]/g, '') // Sanitizar caracteres especiales
      .substring(0, 30); // Limitar longitud

    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', '_')
      .replace(/:/g, '-');

    const filename = `SIMA_Busqueda_${criterio}_${selectedItems.length}personas_${timestamp}.xlsx`;

    // ============================================
    // DESCARGAR ARCHIVO
    // ============================================
    XLSX.writeFile(workbook, filename);

    // Feedback de éxito
    showToast(
      `✅ Archivo Excel generado: ${selectedItems.length} persona${
        selectedItems.length !== 1 ? 's' : ''
      } exportada${selectedItems.length !== 1 ? 's' : ''}`,
      'success'
    );

    // Limpiar selección
    setSelectedItems([]);
    setSelectAllChecked(false);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    showToast('❌ Error al generar el archivo Excel. Intente nuevamente.', 'error');
  } finally {
    setIsExporting(false);
  }
};

/**
 * Formatea una fecha ISO a formato DD/MM/YYYY o DD/MM/YYYY HH:mm
 */
const formatearFecha = (fecha, incluirHora = false) => {
  if (!fecha) return '-';

  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '-';

    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();

    if (incluirHora) {
      const hora = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${anio} ${hora}:${min}`;
    }

    return `${dia}/${mes}/${anio}`;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '-';
  }
};
```

---

### Ejemplo 3: Funciones auxiliares de selección

```javascript
/**
 * Maneja la selección/deselección de todos los items
 */
const handleSelectAll = (event) => {
  if (event.target.checked) {
    // Seleccionar todos los IDs de los items actuales
    const allIds = items.map(item => item.id);
    setSelectedItems(allIds);
    setSelectAllChecked(true);
  } else {
    // Deseleccionar todos
    setSelectedItems([]);
    setSelectAllChecked(false);
  }
};

/**
 * Maneja la selección/deselección de un item individual
 */
const handleSelectItem = (id, event) => {
  // Prevenir navegación al detalle cuando se hace click en checkbox
  if (event) {
    event.stopPropagation();
  }

  setSelectedItems(prev => {
    const isSelected = prev.includes(id);
    const newSelection = isSelected
      ? prev.filter(itemId => itemId !== id) // Deseleccionar
      : [...prev, id]; // Seleccionar

    // Actualizar estado del checkbox "Seleccionar todo"
    setSelectAllChecked(newSelection.length === items.length);

    return newSelection;
  });
};

/**
 * Verifica si un item está seleccionado
 */
const isItemSelected = (id) => {
  return selectedItems.includes(id);
};
```

---

### Ejemplo 4: Modificación del CardResult para agregar checkbox

```jsx
// En CardResult.jsx - Agregar estas props
export default function CardResult({
  persona,
  onClick,
  selected = false,    // Nueva prop
  onSelect = null      // Nueva prop
}) {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        position: 'relative',
        border: selected ? '2px solid rgb(21, 77, 113)' : '1px solid #e0e0e0',
        backgroundColor: selected ? 'rgba(21, 77, 113, 0.05)' : '#fff',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        },
      }}
      onClick={onClick}
    >
      {/* Checkbox en esquina superior derecha */}
      {onSelect && (
        <Checkbox
          checked={selected}
          onChange={(e) => onSelect(persona.id, e)}
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
            '& .MuiSvgIcon-root': {
              fontSize: 28,
            },
            color: 'rgb(21, 77, 113)',
            '&.Mui-checked': {
              color: 'rgb(21, 77, 113)',
            },
          }}
        />
      )}

      {/* Resto del contenido del card */}
      <CardContent>
        {/* ... contenido existente ... */}
      </CardContent>
    </Card>
  );
}
```

---

### Ejemplo 5: Integración en el grid de Buscar.jsx

```jsx
{/* Checkbox "Seleccionar todo" antes del grid */}
{items.length > 0 && (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 2,
      p: 2,
      backgroundColor: '#f5f5f5',
      borderRadius: 2,
    }}
  >
    <FormControlLabel
      control={
        <Checkbox
          checked={selectAllChecked}
          indeterminate={
            selectedItems.length > 0 &&
            selectedItems.length < items.length
          }
          onChange={handleSelectAll}
          sx={{
            color: 'rgb(21, 77, 113)',
            '&.Mui-checked': { color: 'rgb(21, 77, 113)' },
            '&.MuiCheckbox-indeterminate': { color: 'rgb(21, 77, 113)' },
          }}
        />
      }
      label={
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Seleccionar todos ({items.length} resultado{items.length !== 1 ? 's' : ''})
        </Typography>
      }
    />

    {selectedItems.length > 0 && (
      <Chip
        label={`${selectedItems.length} seleccionado${selectedItems.length !== 1 ? 's' : ''}`}
        color="primary"
        sx={{
          backgroundColor: 'rgb(21, 77, 113)',
          color: '#fff',
          fontWeight: 600,
        }}
      />
    )}
  </Box>
)}

{/* Grid de resultados con checkbox */}
<Grid container spacing={3}>
  {items.map((persona) => (
    <Grid item xs={12} sm={6} md={4} key={persona.id}>
      <CardResult
        persona={persona}
        onClick={() => navigate(`/persona/${persona.id}`)}
        selected={isItemSelected(persona.id)}
        onSelect={handleSelectItem}
      />
    </Grid>
  ))}
</Grid>
```

---

## 6. Historial de la conversación

_No hay historial previo. Esta es la solicitud inicial._

---

## 7. Descripción inmediata de la tarea o solicitud

Necesito que implementes la funcionalidad completa de **selección múltiple y exportación Excel** de resultados de búsqueda en `Buscar.jsx`. La implementación debe incluir:

1. ✅ Sistema de checkboxes para selección individual y masiva
2. ✅ Checkbox "Seleccionar todo" con estado indeterminado
3. ✅ Botón "Descargar Selección Excel" con contador dinámico
4. ✅ Función de exportación client-side usando SheetJS
5. ✅ Generación de 2 hojas: "Datos Personales" y "Ubicaciones"
6. ✅ Formato de fechas DD/MM/YYYY y DD/MM/YYYY HH:mm
7. ✅ Validaciones completas y manejo de errores
8. ✅ Integración con sistema de toasts existente
9. ✅ Limpieza de selección post-exportación
10. ✅ Manejo de grandes volúmenes (confirmación si > 1000 registros)

**Prioridad:** Alta  
**Complejidad:** Media-Alta  
**Tiempo estimado:** 2-3 horas de desarrollo + testing

---

## 8. Pensar paso a paso / respira hondo

Antes de comenzar a escribir código, analiza cuidadosamente:

### Paso 1: Análisis de archivos existentes

- [ ] Lee `Buscar.jsx` completo para entender estructura actual
- [ ] Identifica dónde están los botones CSV/XLSX (líneas ~183-197)
- [ ] Localiza el estado `items` donde se almacenan los resultados
- [ ] Verifica si existe función `useToast()` y cómo se usa
- [ ] Revisa el componente `CardResult` actual

### Paso 2: Planificación de estados

- [ ] Determina dónde declarar `selectedItems`, `isExporting`, `selectAllChecked`
- [ ] Planifica el flujo de actualización de estados
- [ ] Considera efectos secundarios (useEffect si es necesario)

### Paso 3: Diseño de UI

- [ ] Decide ubicación exacta del checkbox "Seleccionar todo"
- [ ] Planifica modificación de `CardResult` (prop drilling vs context)
- [ ] Diseña feedback visual para items seleccionados (borde azul)
- [ ] Planifica posición del botón de exportación

### Paso 4: Lógica de exportación

- [ ] Revisa función `downloadSubjectData` en `PersonaDetalle.jsx` (línea 386)
- [ ] Planifica mapeo de campos: persona → fila Excel
- [ ] Define lógica para hoja "Ubicaciones" (filtro de coordenadas)
- [ ] Implementa función `formatearFecha` auxiliar

### Paso 5: Validaciones y edge cases

- [ ] Lista todos los casos de error posibles
- [ ] Planifica mensajes de toast para cada caso
- [ ] Considera: items vacío, sin selección, error de librería, datos null

### Paso 6: Testing mental

- [ ] Simula flujo: buscar → seleccionar → exportar → limpiar
- [ ] Verifica que no hay memory leaks (limpieza de estados)
- [ ] Confirma que exportación no afecta resultados de búsqueda
- [ ] Valida que navegación al detalle sigue funcionando

### Paso 7: Consideraciones UX

- [ ] Mensajes claros y en español
- [ ] Estados de carga visibles (spinner en botón)
- [ ] Feedback inmediato (toast al exportar)
- [ ] Confirmación para grandes volúmenes
- [ ] Limpieza automática post-exportación

---

## 9. Formato de salida

Proporciona tu respuesta estructurada en este formato:

````markdown
## 📋 Análisis de archivos existentes

### Ubicaciones clave en Buscar.jsx
- Estados actuales (línea X)
- Botones CSV/XLSX (líneas X-Y)
- Grid de resultados (línea Z)

### Cambios necesarios en CardResult.jsx
- Props a agregar
- Modificación del layout

---

## 🔧 Implementación

### 1. Imports necesarios en Buscar.jsx

```javascript
// Agregar estos imports al inicio del archivo
import * as XLSX from 'xlsx';
import { TableView as TableViewIcon } from '@mui/icons-material';
import { Checkbox, FormControlLabel, Chip, CircularProgress } from '@mui/material';
```

### 2. Nuevos estados (agregar después de los estados existentes)

```javascript
// Estados para selección y exportación
const [selectedItems, setSelectedItems] = useState([]);
const [isExporting, setIsExporting] = useState(false);
const [selectAllChecked, setSelectAllChecked] = useState(false);
```

### 3. Función formatearFecha (agregar antes de handleExportSelected)

```javascript
// Código completo de la función
```

### 4. Función handleExportSelected (función principal)

```javascript
// Código completo con comentarios explicativos
```

### 5. Funciones auxiliares de selección

```javascript
// handleSelectAll, handleSelectItem, isItemSelected
```

### 6. Modificación del JSX - Checkbox "Seleccionar todo"

```jsx
// Código completo para agregar antes del grid
```

### 7. Modificación del JSX - Botón de exportación

```jsx
// Código completo para agregar junto a botones CSV/XLSX
```

### 8. Modificación del Grid de resultados

```jsx
// Cambios en el mapeo de items para agregar props de selección
```

---

## 📝 Cambios en CardResult.jsx

### Props a agregar

```jsx
// Modificación de la firma de la función
```

### Checkbox en el card

```jsx
// Código completo del checkbox posicionado
```

### Estilos condicionales para selección

```jsx
// Modificación de sx para border y background cuando selected=true
```

---

## ✅ Checklist de implementación

- [ ] `sima-frontend/src/pages/Buscar.jsx` - Estados agregados
- [ ] `sima-frontend/src/pages/Buscar.jsx` - Función formatearFecha
- [ ] `sima-frontend/src/pages/Buscar.jsx` - Función handleExportSelected
- [ ] `sima-frontend/src/pages/Buscar.jsx` - Funciones auxiliares
- [ ] `sima-frontend/src/pages/Buscar.jsx` - Checkbox "Seleccionar todo"
- [ ] `sima-frontend/src/pages/Buscar.jsx` - Botón exportación
- [ ] `sima-frontend/src/pages/Buscar.jsx` - Grid modificado con selección
- [ ] `sima-frontend/src/components/CardResult.jsx` - Props agregadas
- [ ] `sima-frontend/src/components/CardResult.jsx` - Checkbox implementado
- [ ] `sima-frontend/src/components/CardResult.jsx` - Estilos de selección

---

## 🧪 Plan de testing

### Casos de prueba

1. **Selección básica**
   - [ ] Marcar 1 item → contador muestra (1)
   - [ ] Desmarcar 1 item → contador muestra (0)

2. **Seleccionar todo**
   - [ ] Click en "Seleccionar todo" → todos marcados
   - [ ] Click nuevamente → todos desmarcados
   - [ ] Estado indeterminado cuando hay selección parcial

3. **Exportación exitosa**
   - [ ] Exportar 1 persona → archivo con 1 fila
   - [ ] Exportar 10 personas → archivo con 10 filas
   - [ ] Verificar que NO incluye URLs de fotos
   - [ ] Verificar formato de fechas DD/MM/YYYY
   - [ ] Verificar hoja "Ubicaciones" solo si hay coordenadas

4. **Validaciones**
   - [ ] Botón disabled cuando no hay selección
   - [ ] Toast de advertencia si intenta exportar sin seleccionar
   - [ ] Toast de error si items es undefined

5. **Post-exportación**
   - [ ] Selección se limpia automáticamente
   - [ ] Resultados de búsqueda permanecen en pantalla
   - [ ] Botón vuelve a estado normal

6. **Grandes volúmenes**
   - [ ] Confirmación aparece si > 1000 registros
   - [ ] Si cancela confirmación, no exporta
   - [ ] Si acepta confirmación, exporta correctamente

---

## 📦 Archivos finales a modificar

- [x] `sima-frontend/src/pages/Buscar.jsx` (~150 líneas de código agregadas)
- [x] `sima-frontend/src/components/CardResult.jsx` (~30 líneas modificadas)

---

## 🎨 Vista previa del resultado

**Checkbox "Seleccionar todo":**
```
┌──────────────────────────────────────────────────┐
│ ☑ Seleccionar todos (15 resultados)    [5 selecc.]│
└──────────────────────────────────────────────────┘
```

**Botón de exportación:**
```
┌────────────────────────────────────┐
│ 📊 Descargar Selección Excel (5)   │  ← Enabled
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ⏳ Generando...                     │  ← Disabled durante export
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 📊 Descargar Selección Excel (0)   │  ← Disabled sin selección
└────────────────────────────────────┘
```

**Card con checkbox:**
```
┌─────────────────────────────────┐
│                            ☑    │ ← Checkbox esquina superior
│   [Foto]                        │
│                                 │
│   Juan Pérez                    │
│   DNI: 12345678                 │
│   📍 Robo - Asaltante          │
└─────────────────────────────────┘
     ↑ Border azul si selected
```
````

---

## 10. Respuesta pre-rellenada (punto de partida)

```javascript
// ============================================
// PUNTO DE PARTIDA - Buscar.jsx
// ============================================

// 1. IMPORTS (agregar al inicio del archivo)
import * as XLSX from 'xlsx';
import { TableView as TableViewIcon } from '@mui/icons-material';
import {
  Checkbox,
  FormControlLabel,
  Chip,
  CircularProgress
} from '@mui/material';

// 2. ESTADOS (agregar junto a los estados existentes, línea ~33)
const [selectedItems, setSelectedItems] = useState([]);
const [isExporting, setIsExporting] = useState(false);
const [selectAllChecked, setSelectAllChecked] = useState(false);

// 3. FUNCIÓN FORMATEAR FECHA (agregar antes de return)
const formatearFecha = (fecha, incluirHora = false) => {
  if (!fecha) return '-';
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '-';
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    if (incluirHora) {
      const hora = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${anio} ${hora}:${min}`;
    }
    return `${dia}/${mes}/${anio}`;
  } catch (error) {
    return '-';
  }
};

// 4. FUNCIONES AUXILIARES
const handleSelectAll = (event) => {
  if (event.target.checked) {
    setSelectedItems(items.map(item => item.id));
    setSelectAllChecked(true);
  } else {
    setSelectedItems([]);
    setSelectAllChecked(false);
  }
};

const handleSelectItem = (id, event) => {
  if (event) event.stopPropagation();
  setSelectedItems(prev => {
    const isSelected = prev.includes(id);
    const newSelection = isSelected
      ? prev.filter(itemId => itemId !== id)
      : [...prev, id];
    setSelectAllChecked(newSelection.length === items.length);
    return newSelection;
  });
};

const isItemSelected = (id) => selectedItems.includes(id);

// 5. FUNCIÓN PRINCIPAL DE EXPORTACIÓN
const handleExportSelected = async () => {
  try {
    if (selectedItems.length === 0) {
      showToast('⚠️ Seleccione al menos una persona para exportar', 'warning');
      return;
    }

    if (!items || items.length === 0) {
      showToast('❌ No hay resultados de búsqueda para exportar', 'error');
      return;
    }

    if (selectedItems.length > 1000) {
      const confirmar = window.confirm(
        `⚠️ Va a exportar ${selectedItems.length} registros. Esto puede tardar varios segundos.\n\n¿Desea continuar?`
      );
      if (!confirmar) return;
    }

    setIsExporting(true);
    showToast(`Generando archivo Excel con ${selectedItems.length} persona(s)...`, 'info');

    // ... (completar con el resto de la lógica del ejemplo 2)

  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    showToast('❌ Error al generar el archivo Excel. Intente nuevamente.', 'error');
  } finally {
    setIsExporting(false);
  }
};

// 6. JSX - CHECKBOX "SELECCIONAR TODO" (agregar antes del grid, línea ~180)
{items.length > 0 && (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
    <FormControlLabel
      control={
        <Checkbox
          checked={selectAllChecked}
          indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
          onChange={handleSelectAll}
          sx={{ color: 'rgb(21, 77, 113)', '&.Mui-checked': { color: 'rgb(21, 77, 113)' } }}
        />
      }
      label={`Seleccionar todos (${items.length} resultados)`}
    />
    {selectedItems.length > 0 && (
      <Chip label={`${selectedItems.length} seleccionados`} color="primary" />
    )}
  </Box>
)}

// 7. JSX - BOTÓN DE EXPORTACIÓN (agregar junto a botones CSV/XLSX, línea ~190)
<Button
  variant="outlined"
  onClick={handleExportSelected}
  disabled={isExporting || selectedItems.length === 0}
  startIcon={isExporting ? <CircularProgress size={20} /> : <TableViewIcon />}
  sx={{
    color: 'rgb(21, 77, 113)',
    borderColor: 'rgb(21, 77, 113)',
    '&:hover': { backgroundColor: 'rgba(21, 77, 113, 0.08)' },
  }}
>
  {isExporting ? 'Generando...' : `Descargar Selección Excel (${selectedItems.length})`}
</Button>

// 8. JSX - GRID CON SELECCIÓN (modificar el mapeo existente)
<Grid container spacing={3}>
  {items.map((persona) => (
    <Grid item xs={12} sm={6} md={4} key={persona.id}>
      <CardResult
        persona={persona}
        onClick={() => navigate(`/persona/${persona.id}`)}
        selected={isItemSelected(persona.id)}
        onSelect={handleSelectItem}
      />
    </Grid>
  ))}
</Grid>
```

```jsx
// ============================================
// PUNTO DE PARTIDA - CardResult.jsx
// ============================================

// Modificar firma de función
export default function CardResult({
  persona,
  onClick,
  selected = false,
  onSelect = null
}) {

// Agregar checkbox en el JSX del Card
{onSelect && (
  <Checkbox
    checked={selected}
    onChange={(e) => onSelect(persona.id, e)}
    onClick={(e) => e.stopPropagation()}
    sx={{
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      color: 'rgb(21, 77, 113)',
      '&.Mui-checked': { color: 'rgb(21, 77, 113)' },
    }}
  />
)}

// Modificar sx del Card para mostrar selección
<Card
  sx={{
    border: selected ? '2px solid rgb(21, 77, 113)' : '1px solid #e0e0e0',
    backgroundColor: selected ? 'rgba(21, 77, 113, 0.05)' : '#fff',
    // ... resto de estilos
  }}
  onClick={onClick}
>
```

---

## ⚠️ IMPORTANTE - Verificaciones finales

Antes de entregar el código, asegúrate de:

✅ **Estilo y convenciones:**

- [ ] Nombres de variables en español
- [ ] Colores institucionales: `rgb(21, 77, 113)`
- [ ] Imports ordenados alfabéticamente
- [ ] Sin console.log innecesarios
- [ ] Comentarios en español

✅ **Funcionalidad:**

- [ ] Validar que `items` existe antes de filtrar
- [ ] No incluir campos de fotos (`foto_principal`, `fotos_adicionales`)
- [ ] Limpiar selección después de exportación exitosa
- [ ] Toast de éxito con contador correcto
- [ ] Mantener resultados de búsqueda visibles

✅ **Performance:**

- [ ] No re-renderizar innecesariamente
- [ ] Confirmación para > 1000 registros
- [ ] Función `formatearFecha` con try-catch

✅ **UX:**

- [ ] Botón disabled apropiadamente
- [ ] Feedback visual de selección (border azul)
- [ ] Estados de carga claros
- [ ] Mensajes de error descriptivos
- [ ] Checkbox "Seleccionar todo" con estado indeterminado

✅ **Excel:**

- [ ] Formato de fechas: DD/MM/YYYY
- [ ] Headers en negrita
- [ ] Ancho de columnas automático
- [ ] Hoja "Ubicaciones" solo si hay coordenadas
- [ ] Nombre de archivo correcto con timestamp

---

## 📚 Referencias adicionales

**Documentación de SheetJS:**

- https://docs.sheetjs.com/docs/api/utilities/
- `XLSX.utils.book_new()` - Crear libro
- `XLSX.utils.json_to_sheet()` - Convertir JSON a hoja
- `XLSX.utils.book_append_sheet()` - Agregar hoja al libro
- `XLSX.writeFile()` - Descargar archivo

**Material-UI:**

- Checkbox: https://mui.com/material-ui/react-checkbox/
- FormControlLabel: https://mui.com/material-ui/api/form-control-label/
- Chip: https://mui.com/material-ui/react-chip/
- CircularProgress: https://mui.com/material-ui/react-progress/

---

## 🎯 Criterios de aceptación

La implementación será considerada **exitosa** si cumple:

1. ✅ Usuario puede seleccionar items individuales con checkbox
2. ✅ Checkbox "Seleccionar todo" funciona correctamente con estado indeterminado
3. ✅ Botón muestra contador dinámico de items seleccionados
4. ✅ Exportación genera archivo Excel con nombre correcto
5. ✅ Excel contiene 2 hojas: "Datos Personales" y "Ubicaciones" (si aplica)
6. ✅ Fechas en formato DD/MM/YYYY y DD/MM/YYYY HH:mm
7. ✅ NO incluye URLs de fotos en el Excel
8. ✅ Validaciones muestran toasts apropiados
9. ✅ Selección se limpia automáticamente después de exportar
10. ✅ Resultados de búsqueda permanecen en pantalla
11. ✅ Click en checkbox NO navega al detalle de la persona
12. ✅ Confirmación aparece al exportar > 1000 registros
13. ✅ Manejo de errores con try-catch y toasts
14. ✅ Estilo visual consistente con el resto de S.I.M.A

---

**Desarrollador asignado:** Claude 4.5  
**Prioridad:** Alta  
**Fecha límite:** 7 de octubre de 2025  
**Revisión:** Pendiente

**¡Éxito con la implementación! 🚀**
