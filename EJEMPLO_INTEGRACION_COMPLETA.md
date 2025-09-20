# 🎯 **EJEMPLO PRÁCTICO - Integración Completa**

## 📋 **Escenario: Agregar Sistema de Inteligencia a una Persona**

Vamos a modificar la página `PersonaDetalle.jsx` para agregar las capacidades de inteligencia criminal.

---

## **1. MODIFICAR PersonaDetalle.jsx**

```jsx
// sima-frontend/src/pages/PersonaDetalle.jsx

import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Grid, Box,
  Button, Chip, Tab, Tabs, Alert
} from '@mui/material';
import {
  Person, AccountTree, Security, Insights
} from '@mui/icons-material';

// Importar los nuevos componentes de inteligencia
import FormularioVinculacionAvanzado from '../components/inteligencia/FormularioVinculacionAvanzado';
import VisualizadorRedCriminal from '../components/inteligencia/VisualizadorRedCriminal';
import api from '../services/api';

function PersonaDetalle() {
  const { id } = useParams();
  const [persona, setPersona] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Estados para inteligencia criminal
  const [dialogVinculacion, setDialogVinculacion] = useState(false);
  const [analisisRed, setAnalisisRed] = useState(null);
  const [alertasInteligencia, setAlertasInteligencia] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      cargarPersona();
      cargarAnalisisInteligencia();
    }
  }, [id]);

  const cargarPersona = async () => {
    try {
      const response = await api.get(`/api/personas/${id}`);
      setPersona(response.data);
    } catch (error) {
      console.error('Error cargando persona:', error);
    }
  };

  const cargarAnalisisInteligencia = async () => {
    try {
      setLoading(true);

      // Cargar análisis de red
      const responseRed = await api.get(
        `/api/inteligencia/vinculaciones/analisis/red/${id}?profundidad=2&incluir_metricas=true`
      );
      setAnalisisRed(responseRed.data);

      // Verificar alertas de inteligencia
      const responseAlertas = await api.get(
        `/api/inteligencia/vinculaciones?persona_id=${id}&estado_vinculacion=activa_confirmada`
      );

      if (responseAlertas.data.vinculaciones?.length > 0) {
        setAlertasInteligencia([
          `${responseAlertas.data.vinculaciones.length} vinculaciones criminales activas`,
          analisisRed?.personas_clave?.includes(parseInt(id)) ? 'Persona clave en red criminal' : null
        ].filter(Boolean));
      }

    } catch (error) {
      console.error('Error cargando inteligencia:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVinculacionCreada = () => {
    setDialogVinculacion(false);
    cargarAnalisisInteligencia(); // Recargar datos
  };

  if (!persona) return <Typography>Cargando...</Typography>;

  return (
    <Container maxWidth="xl">
      {/* Header con información básica */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4">
                {persona.nombre} {persona.apellido}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                DNI: {persona.dni}
              </Typography>
            </Box>

            {/* Botones de acción */}
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="warning"
                startIcon={<AccountTree />}
                onClick={() => setDialogVinculacion(true)}
              >
                Nueva Vinculación
              </Button>

              <Button
                variant="outlined"
                startIcon={<Insights />}
                onClick={() => setTabValue(2)}
              >
                Análisis de Red
              </Button>
            </Box>
          </Box>

          {/* Alertas de inteligencia */}
          {alertasInteligencia.length > 0 && (
            <Box mt={2}>
              {alertasInteligencia.map((alerta, index) => (
                <Alert key={index} severity="warning" sx={{ mt: 1 }}>
                  <strong>Alerta de Inteligencia:</strong> {alerta}
                </Alert>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<Person />} label="Información Personal" />
          <Tab icon={<Security />} label="Antecedentes" />
          <Tab icon={<AccountTree />} label="Red Criminal" />
          <Tab icon={<Insights />} label="Análisis Avanzado" />
        </Tabs>
      </Box>

      {/* Panel 1: Información Personal */}
      {tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          {/* Información personal existente */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Datos Personales</Typography>
                  <Typography>Edad: {persona.edad}</Typography>
                  <Typography>Género: {persona.genero}</Typography>
                  <Typography>Teléfono: {persona.telefono}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Panel 2: Antecedentes */}
      {tabValue === 1 && (
        <Box sx={{ mt: 3 }}>
          {/* Antecedentes existentes */}
        </Box>
      )}

      {/* Panel 3: Red Criminal */}
      {tabValue === 2 && (
        <Box sx={{ mt: 3 }}>
          <VisualizadorRedCriminal
            personaFocal={{ id: parseInt(id) }}
            onPersonaSeleccionada={(personaSeleccionada) => {
              console.log('Persona seleccionada:', personaSeleccionada);
              // Aquí podrías navegar a otra persona o mostrar detalles
            }}
            height={600}
          />
        </Box>
      )}

      {/* Panel 4: Análisis Avanzado */}
      {tabValue === 3 && (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {/* Métricas de Centralidad */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Métricas de Centralidad
                  </Typography>
                  {analisisRed?.metricas_centralidad ? (
                    <Box>
                      <Typography>
                        <strong>Intermediación:</strong> {
                          analisisRed.metricas_centralidad[id]?.betweenness_centrality?.toFixed(3) || 'N/A'
                        }
                      </Typography>
                      <Typography>
                        <strong>Cercanía:</strong> {
                          analisisRed.metricas_centralidad[id]?.closeness_centrality?.toFixed(3) || 'N/A'
                        }
                      </Typography>
                      <Typography>
                        <strong>Grado:</strong> {
                          analisisRed.metricas_centralidad[id]?.degree_centrality?.toFixed(3) || 'N/A'
                        }
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      No hay suficientes datos para calcular métricas
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Análisis de Influencia */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Nivel de Influencia
                  </Typography>
                  {analisisRed?.personas_clave?.includes(parseInt(id)) ? (
                    <Chip
                      label="PERSONA CLAVE"
                      color="error"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label="Influencia Normal"
                      color="primary"
                      variant="outlined"
                    />
                  )}

                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Conexiones directas: {analisisRed?.red_completa?.vinculos?.length || 0}
                  </Typography>
                  <Typography variant="body2">
                    Personas en red: {analisisRed?.red_completa?.nodos?.length || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Comunidades Detectadas */}
            {analisisRed?.clusters_detectados?.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Bandas y Comunidades Detectadas
                    </Typography>
                    {analisisRed.clusters_detectados.map((cluster, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Chip
                          label={`Banda ${index + 1} (${cluster.miembros?.length || 0} miembros)`}
                          color="warning"
                          variant="filled"
                        />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Cohesión: {cluster.cohesion?.toFixed(2) || 'N/A'}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Dialog para crear vinculaciones */}
      <FormularioVinculacionAvanzado
        open={dialogVinculacion}
        onClose={() => setDialogVinculacion(false)}
        onVinculacionCreada={handleVinculacionCreada}
        personaPreseleccionada={persona}
      />
    </Container>
  );
}

export default PersonaDetalle;
```

---

## **2. AGREGAR BOTÓN EN LISTA DE PERSONAS**

```jsx
// En el componente de lista de personas, agregar botón de análisis

import { AccountTree } from '@mui/icons-material';

// Dentro del mapeo de personas:
<Button
  size="small"
  variant="outlined"
  startIcon={<AccountTree />}
  onClick={() => navigate(`/personas/${persona.id}?tab=2`)}
>
  Ver Red
</Button>
```

---

## **3. DASHBOARD DE INTELIGENCIA**

```jsx
// sima-frontend/src/components/DashboardInteligencia.jsx

import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box,
  Alert, List, ListItem, ListItemText, Button
} from '@mui/material';
import api from '../services/api';

function DashboardInteligencia() {
  const [estadisticas, setEstadisticas] = useState({});
  const [alertasRecientes, setAlertasRecientes] = useState([]);
  const [redesDetectadas, setRedesDetectadas] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Estadísticas generales
      const statsResponse = await api.get('/api/inteligencia/vinculaciones');
      setEstadisticas({
        vinculaciones_activas: statsResponse.data.pagination.total,
        // Más estadísticas...
      });

      // Detectar nuevas redes
      const redesResponse = await api.get('/api/inteligencia/vinculaciones/deteccion/redes');
      setRedesDetectadas(redesResponse.data.redes_clasificadas || []);

    } catch (error) {
      console.error('Error cargando dashboard:', error);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Métricas Principales */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Vinculaciones Activas
            </Typography>
            <Typography variant="h4">
              {estadisticas.vinculaciones_activas || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Redes Detectadas
            </Typography>
            <Typography variant="h4">
              {redesDetectadas.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Alertas Recientes */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Alertas de Inteligencia
            </Typography>
            {redesDetectadas.length > 0 ? (
              <List>
                {redesDetectadas.slice(0, 3).map((red, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`Red Criminal Detectada`}
                      secondary={`${red.miembros?.length || 0} miembros - Nivel de riesgo: ${red.nivel_riesgo || 'Alto'}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No hay nuevas alertas
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default DashboardInteligencia;
```

---

## **4. SERVICIOS API**

```javascript
// sima-frontend/src/services/inteligenciaService.js

import api from './api';

export const inteligenciaService = {
  // Crear vinculación
  crearVinculacion: async (datos) => {
    const response = await api.post('/api/inteligencia/vinculaciones', datos);
    return response.data;
  },

  // Obtener análisis de red
  analizarRed: async (personaId, opciones = {}) => {
    const params = new URLSearchParams({
      profundidad: opciones.profundidad || 3,
      incluir_metricas: true,
      incluir_clusters: true,
      ...opciones
    });

    const response = await api.get(
      `/api/inteligencia/vinculaciones/analisis/red/${personaId}?${params}`
    );
    return response.data;
  },

  // Detectar redes criminales
  detectarRedes: async (filtros = {}) => {
    const params = new URLSearchParams({
      umbral_conexiones: filtros.umbral || 3,
      nivel_confianza_min: filtros.confianza || 0.6,
      ...filtros
    });

    const response = await api.get(
      `/api/inteligencia/vinculaciones/deteccion/redes?${params}`
    );
    return response.data;
  },

  // Obtener datos para visualización
  obtenerDatosVisualizacion: async (personaId, opciones = {}) => {
    const params = new URLSearchParams({
      persona_id: personaId,
      profundidad: opciones.profundidad || 2,
      min_confianza: opciones.confianza || 0.3,
      incluir_metricas: true,
      ...opciones
    });

    const response = await api.get(
      `/api/inteligencia/vinculaciones/visualizacion/d3?${params}`
    );
    return response.data;
  },

  // Obtener vinculaciones de una persona
  obtenerVinculaciones: async (personaId, filtros = {}) => {
    const params = new URLSearchParams({
      persona_id: personaId,
      ...filtros
    });

    const response = await api.get(
      `/api/inteligencia/vinculaciones?${params}`
    );
    return response.data;
  }
};

export default inteligenciaService;
```

---

## **5. HOOKS PERSONALIZADOS**

```javascript
// sima-frontend/src/hooks/useInteligenciaCriminal.js

import { useState, useEffect } from 'react';
import inteligenciaService from '../services/inteligenciaService';

export const useAnalisisRed = (personaId) => {
  const [analisis, setAnalisis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarAnalisis = async () => {
    if (!personaId) return;

    try {
      setLoading(true);
      setError(null);
      const datos = await inteligenciaService.analizarRed(personaId);
      setAnalisis(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAnalisis();
  }, [personaId]);

  return {
    analisis,
    loading,
    error,
    recargar: cargarAnalisis
  };
};

export const useDeteccionRedes = () => {
  const [redes, setRedes] = useState([]);
  const [loading, setLoading] = useState(false);

  const detectarRedes = async (filtros = {}) => {
    try {
      setLoading(true);
      const datos = await inteligenciaService.detectarRedes(filtros);
      setRedes(datos.redes_clasificadas || []);
      return datos;
    } catch (error) {
      console.error('Error detectando redes:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    redes,
    loading,
    detectarRedes
  };
};
```

---

## **6. USAR EN CUALQUIER COMPONENTE**

```jsx
import { useAnalisisRed } from '../hooks/useInteligenciaCriminal';

function MiComponente({ personaId }) {
  const { analisis, loading, recargar } = useAnalisisRed(personaId);

  if (loading) return <CircularProgress />;

  return (
    <div>
      {analisis && (
        <Typography>
          Esta persona tiene {analisis.red_completa.vinculos.length} conexiones
        </Typography>
      )}
      <Button onClick={recargar}>Actualizar Análisis</Button>
    </div>
  );
}
```

---

## **🎯 RESULTADO FINAL**

Con estos cambios tendrás:

1. **✅ Página de persona mejorada** con análisis de inteligencia
2. **✅ Dashboard de inteligencia** con alertas automáticas
3. **✅ Servicios API** reutilizables en toda la app
4. **✅ Hooks personalizados** para lógica de inteligencia
5. **✅ Integración completa** con los componentes existentes

¡El sistema estará **completamente operativo** y podrás empezar a crear vínculos criminales y analizar redes inmediatamente!
