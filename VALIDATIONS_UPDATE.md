# Actualización de Validaciones - Permitir Valores "NO" y "NULO"

## 📋 Resumen de Cambios

### 🔧 Backend - Validaciones Actualizadas

#### 1. **Campo DNI** (`personas.controller.js`)

- **Antes**: Solo permitía números de 7-9 dígitos
- **Ahora**: Permite números válidos O valores como:
  - "NO", "NULO", "N/A"
  - "SIN DNI", "SIN DOCUMENTO"
  - "S/D", "EXTRANJERO", "EXT"

#### 2. **Campo Teléfono** (`personas.controller.js`)

- **Antes**: Solo permitía números con patrón específico
- **Ahora**: Permite números válidos O valores como:
  - "NO", "NULO", "N/A"
  - "SIN TELEFONO", "SIN TEL"
  - "S/D", "S/T"

#### 3. **Campo Email** (`personas.controller.js`)

- **Antes**: Solo permitía emails válidos
- **Ahora**: Permite emails válidos O valores como:
  - "NO", "NULO", "N/A"
  - "SIN EMAIL", "SIN MAIL", "SIN CORREO"
  - "S/D", "S/E"

### 🎨 Frontend - Mejoras de UX

#### 1. **Página Cargar** (`Cargar.jsx`)

- ✅ **DNI**: Agregado placeholder "Ej: 12345678 o NO" y helperText explicativo
- ✅ **Teléfono**: Agregado placeholder "Ej: +54 381 1234567 o NO" y helperText explicativo

#### 2. **Página PersonaDetalle** (`PersonaDetalle.jsx`)

- ✅ **DNI**: Agregado placeholder y helperText en modo edición
- ✅ **Teléfono**: Agregado placeholder y helperText en modo edición

## 🧪 Cómo Probar

### Valores que ahora son válidos:

**Para DNI:**

- `12345678` (número válido)
- `NO`
- `NULO`
- `SIN DNI`
- `EXTRANJERO`

**Para Teléfono:**

- `+54 381 1234567` (número válido)
- `NO`
- `NULO`
- `SIN TELEFONO`
- `N/A`

**Para Email:**

- `usuario@ejemplo.com` (email válido)
- `NO`
- `NULO`
- `SIN EMAIL`
- `N/A`

## 🚀 Estado del Servidor

- ✅ Backend reiniciado con las nuevas validaciones
- ✅ Cambios aplicados en tiempo real
- ✅ No se requiere migración de base de datos

## 📝 Notas Técnicas

- Las validaciones usan regex case-insensitive (`/i` flag)
- Se mantiene la compatibilidad con datos existentes
- Los campos siguen siendo opcionales donde corresponde
- El DNI sigue siendo requerido pero acepta valores especiales
