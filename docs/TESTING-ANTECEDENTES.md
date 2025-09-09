# INSTRUCCIONES PARA PROBAR ANTECEDENTES PERSONALES

## Problema Resuelto

Los delitos cargados desde el formulario "Cargar" ahora aparecen automáticamente como antecedentes personales en la ficha del sujeto.

## Cambios Implementados

### 1. Formulario Cargar (Cargar.jsx)

- **✅ Creación automática**: Cuando se guarda una persona con datos de delito, se crea automáticamente un antecedente personal
- **✅ Navegación automática**: Después de guardar, navega al detalle de la persona para ver los antecedentes
- **✅ Notificaciones**: Muestra toasts informativos sobre la creación de antecedentes

### 2. Visualización Mejorada (ListaAntecedentesPersonalesMejorada.jsx)

- **✅ Estado vacío informativo**: Mensaje mejorado explicando el funcionamiento
- **✅ Vista dual**: Tarjetas detalladas y tabla compacta
- **✅ Debug info**: Información de desarrollo para troubleshooting

### 3. PersonaDetalle.jsx

- **✅ Debug logging**: Información en consola para verificar datos
- **✅ Integración completa**: Usa el componente mejorado

## Pasos para Probar

### Opción 1: Cargar Nueva Persona con Delito

1. Ve a `/cargar`
2. Llena los campos obligatorios:
   - **Nombre**: Juan
   - **Apellido**: Pérez
   - **DNI**: 12345678
   - **Tipo de delito**: Robo (o cualquier otro)
   - **Modalidad**: Con violencia (opcional)
   - **Foto**: Agregar al menos una imagen
3. Clickea "GUARDAR"
4. El sistema automáticamente:
   - Guarda la persona en la base de datos
   - Crea un antecedente personal en localStorage
   - Navega al detalle de la persona
   - Muestra notificaciones de éxito

### Opción 2: Agregar Antecedente Manualmente

1. Ve al detalle de cualquier persona existente
2. Clickea en la pestaña "Antecedentes Personales"
3. Clickea el botón "AGREGAR DELITO PERSONAL"
4. Llena el formulario del dialog
5. Guarda y verifica que aparece en la lista

### Opción 3: Usar Script de Debug (Para desarrolladores)

1. Abre la consola del navegador en una página PersonaDetalle
2. Copia y pega el contenido de `/docs/debug-antecedentes.js`
3. Ejecuta: `testAntecedentesPersonales(ID_DE_PERSONA)` (reemplaza con ID real)
4. Recarga la página para ver los cambios

## Verificación de Funcionamiento

### ✅ Checklist de Verificación:

- [ ] Formulario "Cargar" crea antecedentes automáticamente
- [ ] Antecedentes aparecen en la pestaña "Antecedentes Personales"
- [ ] Vista de tarjetas muestra información completa
- [ ] Vista de tabla funciona para listas grandes (>5 items)
- [ ] Funciones CRUD (ver/editar/eliminar) operativas
- [ ] Estadísticas se actualizan correctamente
- [ ] Persistencia en localStorage funciona
- [ ] Navegación automática después de guardar

### 🔍 Debug y Troubleshooting:

1. **Abrir consola del navegador** (F12)
2. **Buscar logs** que empiecen con "Debug -"
3. **Verificar localStorage**:

   ```javascript
   // Ver datos guardados
   localStorage.getItem('delitos_especificos_PERSONA_ID')

   // Limpiar datos (si necesario)
   localStorage.removeItem('delitos_especificos_PERSONA_ID')
   ```

## Estructura de Datos

### Antecedente Personal Automático:

```json
{
  "id": "delito_1725901234567_abc123",
  "tipo": "robo",
  "modalidad": "con_violencia",
  "descripcion": "Delito registrado desde formulario de carga: robo - con_violencia",
  "lugar": "Dirección del formulario",
  "comisaria_hecho": "Comisaría del hecho",
  "estado": "activo",
  "fecha_hecho": "2025-09-09",
  "observaciones": "Observaciones del formulario",
  "sujetoId": "123",
  "createdAt": "2025-09-09T10:30:00Z"
}
```

## Notas Importantes

### 🎯 Flujo Completo:

1. **Cargar** → Formulario con delito → **Guarda en BD + crea antecedente**
2. **Navegación** → Va automáticamente al detalle de la persona
3. **Visualización** → Pestaña "Antecedentes Personales" muestra el delito
4. **Gestión** → CRUD completo disponible

### 🔧 Tecnologías Utilizadas:

- **Frontend**: React + Material-UI
- **Persistencia**: localStorage (antecedentes personales)
- **Base de datos**: PostgreSQL (datos principales)
- **Estado**: Custom hooks (useDelitosEspecificos)

### 📱 Responsive:

- **Desktop**: Vista de tabla + tarjetas
- **Mobile**: Vista de tarjetas optimizada
- **Tablet**: Vista híbrida

¡El sistema ahora está completamente funcional y los delitos cargados desde el formulario aparecerán automáticamente como antecedentes personales!
