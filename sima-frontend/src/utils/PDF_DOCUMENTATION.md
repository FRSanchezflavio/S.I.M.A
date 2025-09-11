# Funcionalidad PDF para S.I.M.A

## 📋 Descripción

Sistema completo de generación de PDFs para el Sistema de Información Policial (S.I.M.A) con estándares profesionales y configuración específica para entorno policial.

## 🚀 Características Implementadas

### ✅ Funcionalidades Principales

- **Descarga PDF de PersonaDetalle** con todos los datos
- **Preservación exacta de estilos CSS** y layout
- **Header/Footer oficiales** con branding policial
- **Watermark POLICIA** con transparencia adecuada
- **Fallback automático** si html2pdf falla
- **Estados de carga** con feedback visual
- **Nomenclatura estándar** de archivos
- **Validación de permisos** antes de generar

### 🔧 Componentes Creados

#### 1. `usePDFGenerator.js` - Hook Reutilizable

```javascript
const { generatePDF, isGenerating } = usePDFGenerator();

await generatePDF('.card', {
  filename: 'SIMA_Reporte.pdf',
  title: 'Reporte de Persona',
  includeHeader: true,
  includeFooter: true,
  includeWatermark: true
});
```

#### 2. `PDFDownloadButton.jsx` - Componente Reutilizable

```jsx
<PDFDownloadButton
  selector=".card"
  filename="SIMA_Persona.pdf"
  title="Reporte de Persona"
  disabled={saving}
/>
```

#### 3. Integración en `PersonaDetalle.jsx`

- Función `handleDownloadPDF()` completa
- Botón integrado en Stack de acciones
- Estados de carga sincronizados
- Configuración específica S.I.M.A

## 📊 Especificaciones Técnicas

### Configuración PDF

- **Formato**: A4 Portrait
- **Resolución**: 300 DPI (scale: 2)
- **Márgenes**: 20mm top/bottom, 15mm left/right
- **Calidad**: JPEG 92%
- **Fuentes**: Arial fallback para compatibilidad

### Contenido Incluido

- ✅ Datos personales completos
- ✅ Foto del sujeto (si existe)
- ✅ Antecedentes oficiales
- ✅ Antecedentes personales
- ✅ Estadísticas y métricas
- ✅ Header con logo y fecha
- ✅ Footer con clasificación
- ✅ Watermark policial

### Contenido Excluido

- ❌ Botones de acción
- ❌ Header/Footer de navegación
- ❌ Elementos interactivos
- ❌ Tokens de sesión

## 🔒 Seguridad

### Validaciones Implementadas

- Verificación de permisos de usuario
- Validación de existencia de datos
- Sanitización automática de elementos
- No inclusión de datos sensibles

### Auditoría

- Log de usuario que descarga
- Timestamp de generación
- Metadata del archivo
- Clasificación de confidencialidad

## 🧪 Testing

### Casos de Prueba Básicos

```javascript
// Test básico de funcionalidad
describe('PDF Generation', () => {
  test('should generate PDF with valid data', async () => {
    // Mock data setup
    const mockItem = {
      apellido: 'García',
      nombre: 'Juan',
      dni: '12345678'
    };

    // Test generation
    await handleDownloadPDF();

    // Verify file creation
    expect(showToast).toHaveBeenCalledWith(
      'PDF descargado exitosamente',
      'success'
    );
  });
});
```

### Validaciones Requeridas

- [ ] Testing en Chrome, Firefox, Safari, Edge
- [ ] Verificación de fidelidad visual
- [ ] Testing con diferentes tamaños de viewport
- [ ] Validación de tiempo de respuesta <30seg
- [ ] Testing con contenido mínimo y máximo
- [ ] Verificación de memoria/CPU usage

## 📱 Compatibilidad

### Navegadores Soportados

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Características Responsive

- Adaptación automática a A4
- Optimización de imágenes
- Manejo de contenido largo
- Page breaks inteligentes

## 🎯 Roadmap Futuro

### Fase 2: Extensiones

- [ ] Batch PDF de múltiples personas
- [ ] Configuración personalizada de usuario
- [ ] Templates adicionales de reportes

### Fase 3: Integración

- [ ] API endpoint para generación server-side
- [ ] Integración con sistema de reportes oficial
- [ ] Envío automático por email

### Fase 4: Analytics

- [ ] Dashboard de reportes generados
- [ ] Métricas de uso por usuario
- [ ] Optimización de performance

## 🛠️ Instalación y Uso

### Dependencias Instaladas

```bash
npm install html2pdf.js html2canvas jspdf
```

### Importación en Componentes

```javascript
import usePDFGenerator from '../hooks/usePDFGenerator';
import PDFDownloadButton from '../components/PDFDownloadButton';
```

### Uso Básico

```jsx
function MiComponente() {
  return (
    <PDFDownloadButton
      selector=".mi-contenido"
      filename="Mi_Reporte.pdf"
      title="Mi Reporte Personalizado"
    />
  );
}
```

## 📞 Soporte

Para issues o mejoras, contactar al equipo de desarrollo S.I.M.A.

---

**S.I.M.A - Sistema de Información Policial**  
_Versión PDF: 1.0 - Septiembre 2025_
