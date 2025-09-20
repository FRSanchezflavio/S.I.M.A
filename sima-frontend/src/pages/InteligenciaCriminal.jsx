import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountTree,
  Map,
  Analytics,
  Security,
  Refresh,
  Dashboard,
  Assessment,
} from '@mui/icons-material';
import VisualizadorRedCriminalDemo from '../components/inteligencia/VisualizadorRedCriminalDemo';
import DashboardVinculaciones from '../components/inteligencia/DashboardVinculaciones';
import MetricasAvanzadas from '../components/inteligencia/MetricasAvanzadas';

// Componente demo para mapas territoriales
const MapaTerritorialDemo = () => (
  <Card>
    <CardContent>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Mapeo Territorial de Bandas</Typography>
        <Chip label="DEMO - Datos de Prueba" color="warning" size="small" />
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Funcionalidad Demo:</strong> Esta sección mostraría
          territorios controlados por bandas criminales con análisis de
          conflictos territoriales, zonas de influencia y patrones de actividad
          criminal.
        </Typography>
      </Alert>

      <Box
        sx={{
          height: 400,
          bgcolor: 'background.default',
          border: '2px dashed #ccc',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Map sx={{ fontSize: 60, color: 'text.secondary' }} />
        <Typography variant="h6" color="text.secondary">
          Mapa Territorial Interactivo
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Aquí se visualizarían las zonas de influencia de las bandas criminales
          <br />
          con análisis de conflictos y superposiciones territoriales
        </Typography>
      </Box>

      <Box
        mt={2}
        p={2}
        bgcolor="background.paper"
        borderRadius={1}
        border="1px solid #ddd"
      >
        <Typography variant="subtitle2" gutterBottom>
          Leyenda Territorial:
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip
            label="Zona de Control Principal"
            style={{ backgroundColor: '#e74c3c', color: 'white' }}
            size="small"
          />
          <Chip
            label="Zona de Influencia"
            style={{ backgroundColor: '#f39c12', color: 'white' }}
            size="small"
          />
          <Chip
            label="Territorio Disputado"
            style={{ backgroundColor: '#9b59b6', color: 'white' }}
            size="small"
          />
          <Chip
            label="Zona Neutral"
            style={{ backgroundColor: '#95a5a6', color: 'white' }}
            size="small"
          />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Componente demo para análisis predictivo
const AnalisisPredictivo = () => (
  <Card>
    <CardContent>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Análisis Predictivo Criminal</Typography>
        <Chip label="DEMO - Datos de Prueba" color="warning" size="small" />
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Funcionalidad Demo:</strong> Esta sección incluiría algoritmos
          de machine learning para predicción de actividad criminal, análisis de
          patrones y alertas tempranas.
        </Typography>
      </Alert>

      <Box
        sx={{
          height: 400,
          bgcolor: 'background.default',
          border: '2px dashed #ccc',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Analytics sx={{ fontSize: 60, color: 'text.secondary' }} />
        <Typography variant="h6" color="text.secondary">
          Modelos Predictivos
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Análisis de patrones criminales y predicciones de actividad
          <br />
          basado en datos históricos y redes de vínculos
        </Typography>
      </Box>

      <Box
        mt={2}
        p={2}
        bgcolor="background.paper"
        borderRadius={1}
        border="1px solid #ddd"
      >
        <Typography variant="subtitle2" gutterBottom>
          Métricas de Riesgo:
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip label="Riesgo Alto: 15%" color="error" size="small" />
          <Chip label="Riesgo Medio: 35%" color="warning" size="small" />
          <Chip label="Riesgo Bajo: 50%" color="success" size="small" />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Componente demo para gestión de bandas
const GestionBandasDemo = () => (
  <Card>
    <CardContent>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Gestión de Bandas Criminales</Typography>
        <Box display="flex" gap={1}>
          <Chip label="DEMO - Datos de Prueba" color="warning" size="small" />
          <Tooltip title="Actualizar datos">
            <IconButton size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Funcionalidad Demo:</strong> Sistema completo de gestión de
          bandas criminales con CRUD, análisis organizacional y tracking de
          evolución.
        </Typography>
      </Alert>

      <Box
        sx={{
          height: 400,
          bgcolor: 'background.default',
          border: '2px dashed #ccc',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Security sx={{ fontSize: 60, color: 'text.secondary' }} />
        <Typography variant="h6" color="text.secondary">
          Panel de Gestión de Bandas
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Administración completa de organizaciones criminales
          <br />
          con jerarquías, miembros y evolución temporal
        </Typography>
      </Box>

      <Box
        mt={2}
        p={2}
        bgcolor="background.paper"
        borderRadius={1}
        border="1px solid #ddd"
      >
        <Typography variant="subtitle2" gutterBottom>
          Bandas Activas (Demo):
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip
            label="Los Hermanos del Norte - 6 miembros"
            color="error"
            size="small"
          />
          <Chip
            label="Banda de la 9 de Julio - 4 miembros"
            color="warning"
            size="small"
          />
          <Chip
            label="Los Tigres del Sur - 8 miembros"
            color="error"
            size="small"
          />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const InteligenciaCriminal = () => {
  const [tabActual, setTabActual] = useState(0);

  const handleCambioTab = (event, nuevoTab) => {
    setTabActual(nuevoTab);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Encabezado */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          🕵️ Inteligencia Criminal
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Sistema avanzado de análisis de redes criminales y bandas organizadas
        </Typography>

        <Alert severity="warning" sx={{ mt: 2, mb: 3 }}>
          <Typography variant="body2">
            <strong>SISTEMA EN MODO DEMO:</strong> Esta versión utiliza datos de
            prueba para demostrar las capacidades del sistema de inteligencia
            criminal. En producción, se conectaría con la base de datos real de
            personas registradas.
          </Typography>
        </Alert>
      </Box>

      {/* Navegación por pestañas */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabActual}
            onChange={handleCambioTab}
            aria-label="pestañas de inteligencia criminal"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<Dashboard />}
              label="Dashboard Redes"
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab
              icon={<AccountTree />}
              label="Visualizador"
              id="tab-1"
              aria-controls="tabpanel-1"
            />
            <Tab
              icon={<Assessment />}
              label="Métricas Avanzadas"
              id="tab-2"
              aria-controls="tabpanel-2"
            />
            <Tab
              icon={<Map />}
              label="Mapeo Territorial"
              id="tab-3"
              aria-controls="tabpanel-3"
            />
            <Tab
              icon={<Analytics />}
              label="Análisis Predictivo"
              id="tab-4"
              aria-controls="tabpanel-4"
            />
            <Tab
              icon={<Security />}
              label="Gestión de Bandas"
              id="tab-5"
              aria-controls="tabpanel-5"
            />
          </Tabs>
        </Box>

        {/* Panel Dashboard de Redes */}
        <TabPanel value={tabActual} index={0}>
          <DashboardVinculaciones />
        </TabPanel>

        {/* Panel de Visualizador de Redes */}
        <TabPanel value={tabActual} index={1}>
          <VisualizadorRedCriminalDemo
            personaId={1}
            altura={600}
            onPersonaSelect={id => console.log('Persona seleccionada:', id)}
          />
        </TabPanel>

        {/* Panel de Métricas Avanzadas */}
        <TabPanel value={tabActual} index={2}>
          <MetricasAvanzadas />
        </TabPanel>

        {/* Panel de Mapeo Territorial */}
        <TabPanel value={tabActual} index={3}>
          <MapaTerritorialDemo />
        </TabPanel>

        {/* Panel de Análisis Predictivo */}
        <TabPanel value={tabActual} index={4}>
          <AnalisisPredictivo />
        </TabPanel>

        {/* Panel de Gestión de Bandas */}
        <TabPanel value={tabActual} index={5}>
          <GestionBandasDemo />
        </TabPanel>
      </Card>

      {/* Panel de información adicional */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Características del Sistema de Inteligencia Criminal
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                🕸️ Análisis de Redes Criminales:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualización interactiva de vínculos entre personas, análisis
                de centralidad, detección de estructuras organizacionales y
                patrones de comunicación.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                🗺️ Mapeo Territorial:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Análisis geoespacial de territorios controlados por bandas,
                identificación de zonas de conflicto y patrones de actividad
                criminal por área.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                🤖 Análisis Predictivo:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Algoritmos de machine learning para predicción de actividad
                criminal, análisis de tendencias y generación de alertas
                tempranas.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                🛡️ Gestión de Bandas:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema completo de administración de organizaciones criminales
                con seguimiento de evolución, jerarquías y actividades.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default InteligenciaCriminal;
