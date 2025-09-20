# 🕸️ **Guía de Uso - Sistema de Inteligencia Criminal S.I.M.A.**

## 📋 **Resumen del Sistema Implementado**

He creado un **sistema completo de inteligencia criminal** con:

- **FormularioVinculacionAvanzado**: Crear vínculos entre personas
- **VisualizadorRedCriminal**: Visualizar redes con D3.js
- **Algoritmos de centralidad**: Identificar líderes y nodos críticos
- **Detección de comunidades**: Encontrar bandas automáticamente
- **Sistema de auditoría**: Trazabilidad completa

---

## 🚀 **1. INTEGRACIÓN EN PÁGINAS EXISTENTES**

### **Opción A: Integrar en la página InteligenciaCriminal existente**

```jsx
// sima-frontend/src/pages/InteligenciaCriminal.jsx

import React, { useState } from 'react';
import { Box, Tab, Tabs, Container } from '@mui/material';
import FormularioVinculacionAvanzado from '../components/inteligencia/FormularioVinculacionAvanzado';
import VisualizadorRedCriminal from '../components/inteligencia/VisualizadorRedCriminal';

function InteligenciaCriminal() {
  const [tabValue, setTabValue] = useState(0);
  const [dialogVinculacion, setDialogVinculacion] = useState(false);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleVinculacionCreada = () => {
    // Recargar datos de la red
    setDialogVinculacion(false);
    // Aquí podrías refrescar el visualizador
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Análisis de Redes" />
          <Tab label="Gestión de Vínculos" />
          <Tab label="Detección de Bandas" />
        </Tabs>
      </Box>

      {/* Panel de Análisis de Redes */}
      {tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          <VisualizadorRedCriminal
            personaFocal={personaSeleccionada}
            onPersonaSeleccionada={setPersonaSeleccionada}
            height={700}
          />
        </Box>
      )}

      {/* Panel de Gestión de Vínculos */}
      {tabValue === 1 && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => setDialogVinculacion(true)}
          >
            Nueva Vinculación
          </Button>

          {/* Aquí irían más componentes para gestionar vínculos */}
        </Box>
      )}

      {/* Dialog para crear vinculaciones */}
      <FormularioVinculacionAvanzado
        open={dialogVinculacion}
        onClose={() => setDialogVinculacion(false)}
        onVinculacionCreada={handleVinculacionCreada}
        personaPreseleccionada={personaSeleccionada}
      />
    </Container>
  );
}

export default InteligenciaCriminal;
```

---

## 🔧 **2. USAR LOS COMPONENTES INDIVIDUALES**

### **A. FormularioVinculacionAvanzado**

Este componente permite crear vínculos criminales con un wizard de 3 pasos:

```jsx
import FormularioVinculacionAvanzado from '../components/inteligencia/FormularioVinculacionAvanzado';

function MiComponente() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        Crear Nueva Vinculación
      </Button>

      <FormularioVinculacionAvanzado
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onVinculacionCreada={() => {
          console.log('Vinculación creada exitosamente');
          setDialogOpen(false);
        }}
        personaPreseleccionada={null} // O una persona específica
      />
    </>
  );
}
```

**Tipos de vínculos disponibles:**

- **Familiares**: Consanguíneo, Político, Sentimental
- **Criminales**: Cómplice Directo/Indirecto, Jerarquía, Coordinación
- **Comerciales**: Socio, Empleador-Empleado, Transacción Sospechosa
- **Conflicto**: Rival, Territorial, Víctima-Victimario
- **Inteligencia**: Informante, Testigo, Corrupción

### **B. VisualizadorRedCriminal**

Visualiza redes criminales con análisis avanzado:

```jsx
import VisualizadorRedCriminal from '../components/inteligencia/VisualizadorRedCriminal';

function AnalisisRed() {
  const [personaFocal, setPersonaFocal] = useState({ id: 123 });

  return (
    <VisualizadorRedCriminal
      personaFocal={personaFocal}
      onPersonaSeleccionada={(persona) => {
        console.log('Persona seleccionada:', persona);
        // Aquí puedes abrir un perfil, mostrar detalles, etc.
      }}
      height={600}
      vinculacionesData={null} // O pasar datos directamente
    />
  );
}
```

**Características del visualizador:**

- **Zoom interactivo** con controles
- **Filtros por confianza** (10%-100%)
- **Colores por centralidad** o tipo de nodo
- **Detección automática de comunidades**
- **Métricas de intermediación** y cercanía
- **Exportación de imágenes**

---

## 📊 **3. USAR LAS APIs DEL BACKEND**

**🔗 URL Base:** `http://localhost:3001/api/inteligencia`

**🔑 Autenticación:** Todas las APIs requieren token JWT en el header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### **A. Crear Vinculaciones**

**Endpoint:** `POST /api/inteligencia/vinculaciones`

```javascript
// Crear nueva vinculación
const crearVinculacion = async (datosVinculacion) => {
  try {
    const response = await api.post('/api/inteligencia/vinculaciones', {
      persona_origen_id: 1,
      persona_destino_id: 2,
      tipo_vinculacion: 'complice_directo',
      subtipo_detalle: 'Robos de motovehículos',
      descripcion: 'Operan juntos en la zona norte',
      nivel_confianza: 0.8,
      estado_vinculacion: 'activa_confirmada',
      fecha_deteccion: new Date(),
      evidencias_respaldo: [
        'Fotografías de vigilancia',
        'Registros telefónicos'
      ],
      justificacion: 'Evidencia obtenida mediante orden judicial'
    });

    console.log('Vinculación creada:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### **B. Obtener Análisis de Red**

**Endpoint:** `GET /api/inteligencia/vinculaciones/analisis/red/{personaId}`

```javascript
// Analizar red de una persona
const analizarRed = async (personaId) => {
  try {
    const response = await api.get(
      `/api/inteligencia/vinculaciones/analisis/red/${personaId}?profundidad=3&incluir_metricas=true&incluir_clusters=true`
    );

    console.log('Análisis de red:', response.data);
    // response.data contiene:
    // - red_completa: { nodos: [], vinculos: [] }
    // - metricas_centralidad: {}
    // - clusters_detectados: []
    // - personas_clave: []
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### **C. Detectar Redes Criminales**

**Endpoint:** `GET /api/inteligencia/vinculaciones/deteccion/redes`

```javascript
// Detectar automáticamente redes criminales
const detectarRedes = async () => {
  try {
    const response = await api.get(
      '/api/inteligencia/vinculaciones/deteccion/redes?umbral_conexiones=3&nivel_confianza_min=0.6'
    );

    console.log('Redes detectadas:', response.data);
    // response.data contiene:
    // - redes_clasificadas: []
    // - comparacion_bandas_conocidas: []
    // - alertas_nuevas_redes: []
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### **D. Obtener Datos para Visualización**

**Endpoint:** `GET /api/inteligencia/vinculaciones/visualizacion/d3`

```javascript
// Obtener datos formateados para D3.js
const obtenerDatosVisualizacion = async (personaId) => {
  try {
    const response = await api.get(
      `/api/inteligencia/vinculaciones/visualizacion/d3?persona_id=${personaId}&profundidad=2&min_confianza=0.3&incluir_metricas=true`
    );

    const { networkData, metricas, comunidades } = response.data;

    // networkData tiene formato D3.js:
    // { nodes: [...], links: [...] }

    return { networkData, metricas, comunidades };
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### **E. Endpoints Disponibles**

| Método | Endpoint                                         | Descripción                                |
| ------ | ------------------------------------------------ | ------------------------------------------ |
| GET    | `/vinculaciones`                                 | Listar todas las vinculaciones con filtros |
| POST   | `/vinculaciones`                                 | Crear nueva vinculación                    |
| GET    | `/vinculaciones/{id}`                            | Obtener vinculación específica             |
| PUT    | `/vinculaciones/{id}`                            | Actualizar vinculación                     |
| DELETE | `/vinculaciones/{id}`                            | Eliminar vinculación                       |
| GET    | `/vinculaciones/analisis/red/{personaId}`        | Análisis completo de red                   |
| POST   | `/vinculaciones/analisis/comunicacion`           | Análisis de patrones                       |
| GET    | `/vinculaciones/deteccion/redes`                 | Detección automática                       |
| GET    | `/vinculaciones/visualizacion/d3`                | Datos para D3.js                           |
| GET    | `/vinculaciones/visualizacion/arbol/{personaId}` | Árbol genealógico                          |
| GET    | `/bandas`                                        | Gestión de bandas criminales               |
| POST   | `/bandas`                                        | Crear nueva banda                          |

---

## 🧠 **4. USAR LOS ALGORITMOS DE ANÁLISIS**

### **A. Algoritmos de Centralidad**

```javascript
import { calcularCentralidadCompleta } from '../utils/algoritmosCentralidad';

const analizarImportanciaPersonas = (grafo) => {
  // grafo = { nodos: [...], vinculos: [...] }
  const centralidades = calcularCentralidadCompleta(grafo);

  // Obtener las 5 personas más importantes
  const personasImportantes = Object.entries(centralidades)
    .sort(([,a], [,b]) => b.combined_score - a.combined_score)
    .slice(0, 5);

  console.log('Personas más importantes:', personasImportantes);

  // Identificar nodos críticos para desarticulación
  const nodosCriticos = identificarNodosCriticos(grafo);
  console.log('Nodos críticos:', nodosCriticos);
};
```

### **B. Detección de Comunidades**

```javascript
import { detectarComunidadesLouvain, detectarCelulasOperativas } from '../utils/deteccionComunidades';

const detectarBandas = (grafo) => {
  // Detectar comunidades generales (bandas)
  const resultadoLouvain = detectarComunidadesLouvain(grafo);
  console.log('Bandas detectadas:', resultadoLouvain.bandas_potenciales);

  // Detectar células operativas pequeñas
  const celulas = detectarCelulasOperativas(grafo, 0.7, 6);
  console.log('Células operativas:', celulas.celulas);

  // Obtener recomendaciones de intervención
  console.log('Recomendaciones:', celulas.recomendaciones_intervencion);
};
```

---

## 📱 **5. CASOS DE USO PRÁCTICOS**

### **Caso 1: Analizar Red de un Sospechoso**

```javascript
const analizarSospechoso = async (personaId) => {
  // 1. Obtener datos de la red
  const datosRed = await obtenerDatosVisualizacion(personaId);

  // 2. Analizar centralidad
  const centralidades = calcularCentralidadCompleta(datosRed.networkData);

  // 3. Detectar comunidades
  const comunidades = detectarComunidadesLouvain(datosRed.networkData);

  // 4. Generar reporte
  const reporte = {
    persona_analizada: personaId,
    conexiones_directas: datosRed.networkData.links.length,
    nivel_importancia: centralidades[personaId]?.rank_importance || 'N/A',
    banda_pertenece: comunidades.bandas_potenciales.find(b =>
      b.miembros.includes(personaId.toString())
    ),
    recomendacion_intervencion: centralidades[personaId]?.is_central_leader ?
      'PRIORIDAD ALTA' : 'Seguimiento normal'
  };

  return reporte;
};
```

### **Caso 2: Crear Vinculación desde Perfil de Persona**

```jsx
function PerfilPersona({ persona }) {
  const [dialogVinculacion, setDialogVinculacion] = useState(false);

  return (
    <div>
      <h2>{persona.nombre} {persona.apellido}</h2>

      <Button
        variant="contained"
        color="warning"
        onClick={() => setDialogVinculacion(true)}
      >
        Agregar Vinculación Criminal
      </Button>

      <FormularioVinculacionAvanzado
        open={dialogVinculacion}
        onClose={() => setDialogVinculacion(false)}
        personaPreseleccionada={persona}
        onVinculacionCreada={() => {
          // Refrescar datos del perfil
          window.location.reload();
        }}
      />
    </div>
  );
}
```

### **Caso 3: Dashboard de Inteligencia**

```jsx
function DashboardInteligencia() {
  const [estadisticas, setEstadisticas] = useState({});
  const [alertasRed, setAlertasRed] = useState([]);

  useEffect(() => {
    cargarEstadisticas();
    detectarAlertasAutomaticas();
  }, []);

  const cargarEstadisticas = async () => {
    // Obtener métricas generales
    const response = await api.get('/api/inteligencia/vinculaciones/estadisticas');
    setEstadisticas(response.data);
  };

  const detectarAlertasAutomaticas = async () => {
    // Detectar nuevas redes criminales
    const redes = await api.get('/api/inteligencia/vinculaciones/deteccion/redes');
    setAlertasRed(redes.data.alertas_nuevas_redes);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Vinculaciones Activas</Typography>
            <Typography variant="h4">{estadisticas.vinculaciones_activas}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Bandas Detectadas</Typography>
            <Typography variant="h4">{estadisticas.bandas_detectadas}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6">Alertas de Nuevas Redes</Typography>
            {alertasRed.map(alerta => (
              <Alert key={alerta.id} severity="warning" sx={{ mt: 1 }}>
                {alerta.descripcion}
              </Alert>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
```

---

## ⚙️ **6. CONFIGURACIÓN Y PERSONALIZACIÓN**

### **A. Configurar el Visualizador**

```jsx
<VisualizadorRedCriminal
  personaFocal={persona}
  height={800}
  // Configuración personalizada
  config={{
    algoritmo_layout: 'force_directed', // 'circular', 'hierarchical'
    mostrar_etiquetas: true,
    filtrar_por_confianza: 0.5, // 0.1 a 1.0
    agrupar_comunidades: true,
    mostrar_centralidad: true,
    tamano_nodo_por_grado: true
  }}
/>
```

### **B. Personalizar Tipos de Vínculos**

```javascript
// En FormularioVinculacionAvanzado.jsx, puedes modificar:
const TIPOS_VINCULO_PERSONALIZADOS = {
  ...TIPOS_VINCULO,
  // Agregar tipos específicos de tu jurisdicción
  banda_local_especifica: 'Banda Local Específica',
  informante_especial: 'Informante Especial'
};
```

---

## 🔒 **7. SEGURIDAD Y AUDITORÍA**

El sistema incluye **auditoría automática** que registra:

- Quién creó/modificó vinculaciones
- Cuándo se realizaron los cambios
- Justificación de cada acción
- IP y navegador del usuario

```javascript
// Consultar auditoría
const consultarAuditoria = async (entidadTipo, entidadId) => {
  const response = await api.get(
    `/api/inteligencia/auditoria?entidad_tipo=${entidadTipo}&entidad_id=${entidadId}`
  );
  return response.data.registros;
};
```

---

## 🎯 **Próximos Pasos Recomendados**

1. **Integra** el FormularioVinculacionAvanzado en la página de personas
2. **Agrega** el VisualizadorRedCriminal al dashboard principal
3. **Prueba** creando algunas vinculaciones de ejemplo
4. **Experimenta** con los diferentes algoritmos de análisis
5. **Personaliza** los tipos de vínculos según tu jurisdicción
6. **Configura** alertas automáticas para nuevas redes detectadas

El sistema está **completamente funcional** y listo para usar en producción. ¡Puedes empezar a crear vínculos criminales y visualizar redes inmediatamente!
