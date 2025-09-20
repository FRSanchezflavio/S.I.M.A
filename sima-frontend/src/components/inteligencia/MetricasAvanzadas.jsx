import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Assessment,
  Timeline,
  Security,
  Notifications,
  Analytics,
  Speed,
  Shield,
  LocationOn,
  Group,
  AccountTree,
  Refresh,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  HeatMap,
} from 'recharts';

// Datos mock para métricas avanzadas
const MOCK_METRICAS_RIESGO = {
  indice_riesgo_general: 7.2,
  tendencia_riesgo: 'incremento',
  factores_criticos: [
    {
      factor: 'Incremento en vínculos criminales',
      peso: 0.8,
      estado: 'critico',
    },
    { factor: 'Nuevas estructuras jerárquicas', peso: 0.7, estado: 'alto' },
    { factor: 'Expansión territorial', peso: 0.6, estado: 'medio' },
    { factor: 'Vínculos internacionales', peso: 0.5, estado: 'bajo' },
  ],
  predicciones: {
    proximos_30_dias: 'Alto riesgo de expansión de redes',
    proximos_90_dias: 'Posible consolidación de alianzas',
    recomendacion: 'Intensificar vigilancia en zonas Norte y Centro',
  },
};

const MOCK_ANALISIS_TEMPORAL = [
  { mes: 'Ene', riesgo: 5.2, actividad: 23, densidad: 0.3 },
  { mes: 'Feb', riesgo: 5.8, actividad: 28, densidad: 0.35 },
  { mes: 'Mar', riesgo: 6.1, actividad: 35, densidad: 0.42 },
  { mes: 'Abr', riesgo: 6.7, actividad: 41, densidad: 0.48 },
  { mes: 'May', riesgo: 7.0, actividad: 47, densidad: 0.52 },
  { mes: 'Jun', riesgo: 7.2, actividad: 53, densidad: 0.58 },
];

const MOCK_MAPA_CALOR_ACTIVIDAD = [
  {
    zona: 'Norte',
    actividad_criminal: 85,
    redes_activas: 4,
    densidad_poblacional: 'alta',
  },
  {
    zona: 'Sur',
    actividad_criminal: 67,
    redes_activas: 3,
    densidad_poblacional: 'media',
  },
  {
    zona: 'Centro',
    actividad_criminal: 92,
    redes_activas: 5,
    densidad_poblacional: 'muy_alta',
  },
  {
    zona: 'Este',
    actividad_criminal: 43,
    redes_activas: 2,
    densidad_poblacional: 'baja',
  },
  {
    zona: 'Oeste',
    actividad_criminal: 58,
    redes_activas: 2,
    densidad_poblacional: 'media',
  },
];

const MOCK_ALERTAS_INTELIGENTES = [
  {
    id: 1,
    tipo: 'red_emergente',
    titulo: 'Nueva red criminal detectada',
    descripcion: 'Sistema detectó formación de nueva banda en zona Norte',
    prioridad: 'alta',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
    parametros: { zona: 'Norte', miembros: 6, confianza: 0.87 },
  },
  {
    id: 2,
    tipo: 'expansion_territorial',
    titulo: 'Expansión de territorio criminal',
    descripcion: 'Clan Gutierrez expandió operaciones hacia zona Centro',
    prioridad: 'media',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // hace 6 horas
    parametros: {
      clan: 'Gutierrez',
      zona_origen: 'Sur',
      zona_destino: 'Centro',
    },
  },
  {
    id: 3,
    tipo: 'vinculo_sospechoso',
    titulo: 'Vínculo de alto riesgo identificado',
    descripcion: 'Nuevo vínculo entre líderes de diferentes organizaciones',
    prioridad: 'muy_alta',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // hace 30 minutos
    parametros: {
      personas: ['Carlos Martinez', 'Roberto Gutierrez'],
      tipo: 'reunion_clandestina',
    },
  },
];

const MOCK_RADAR_CAPACIDADES = [
  { capacidad: 'Estructura', valor: 85 },
  { capacidad: 'Territorios', valor: 72 },
  { capacidad: 'Vínculos', valor: 91 },
  { capacidad: 'Cohesión', valor: 78 },
  { capacidad: 'Operatividad', valor: 83 },
  { capacidad: 'Adaptabilidad', valor: 69 },
];

const MetricasAvanzadas = () => {
  const [metricas, setMetricas] = useState(MOCK_METRICAS_RIESGO);
  const [datosTemporales, setDatosTemporales] = useState(
    MOCK_ANALISIS_TEMPORAL
  );
  const [mapaCalor, setMapaCalor] = useState(MOCK_MAPA_CALOR_ACTIVIDAD);
  const [alertas, setAlertas] = useState(MOCK_ALERTAS_INTELIGENTES);
  const [radarCapacidades, setRadarCapacidades] = useState(
    MOCK_RADAR_CAPACIDADES
  );
  const [loading, setLoading] = useState(false);

  const actualizarMetricas = async () => {
    setLoading(true);
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const obtenerColorRiesgo = valor => {
    if (valor >= 8) return '#c0392b';
    if (valor >= 6) return '#e74c3c';
    if (valor >= 4) return '#f39c12';
    if (valor >= 2) return '#f1c40f';
    return '#27ae60';
  };

  const obtenerColorPrioridad = prioridad => {
    const colores = {
      muy_alta: '#c0392b',
      alta: '#e74c3c',
      media: '#f39c12',
      baja: '#27ae60',
    };
    return colores[prioridad] || '#95a5a6';
  };

  const obtenerIconoPrioridad = prioridad => {
    if (prioridad === 'muy_alta') return <Warning color="error" />;
    if (prioridad === 'alta') return <Security color="warning" />;
    return <Notifications color="info" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📊 Métricas Avanzadas de Inteligencia
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Análisis predictivo y evaluación de riesgos en tiempo real
          </Typography>
        </Box>
        <IconButton onClick={actualizarMetricas} disabled={loading}>
          <Refresh />
        </IconButton>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Indicador de Riesgo General */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${obtenerColorRiesgo(
                metricas.indice_riesgo_general
              )}, ${obtenerColorRiesgo(metricas.indice_riesgo_general)}dd)`,
              color: 'white',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    width: 60,
                    height: 60,
                  }}
                >
                  <Assessment fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {metricas.indice_riesgo_general.toFixed(1)}
                  </Typography>
                  <Typography variant="h6">Índice de Riesgo</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {metricas.tendencia_riesgo === 'incremento' ? (
                      <TrendingUp fontSize="small" />
                    ) : (
                      <TrendingDown fontSize="small" />
                    )}
                    <Typography variant="body2">
                      {metricas.tendencia_riesgo === 'incremento'
                        ? 'En aumento'
                        : 'En descenso'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Evolución Temporal del Riesgo
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={datosTemporales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis domain={[0, 10]} />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="riesgo"
                    stroke="#e74c3c"
                    fill="#e74c3c"
                    fillOpacity={0.3}
                    name="Índice de Riesgo"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Análisis de Capacidades y Factores de Riesgo */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Capacidades de Redes Criminales
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarCapacidades}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="capacidad" />
                  <PolarRadiusAxis angle={60} domain={[0, 100]} />
                  <Radar
                    name="Capacidades"
                    dataKey="valor"
                    stroke="#3498db"
                    fill="#3498db"
                    fillOpacity={0.3}
                  />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚠️ Factores Críticos de Riesgo
              </Typography>
              <List>
                {metricas.factores_criticos.map((factor, index) => (
                  <ListItem key={index} sx={{ mb: 1 }}>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor: obtenerColorRiesgo(factor.peso * 10),
                          width: 32,
                          height: 32,
                        }}
                      >
                        <Speed fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={factor.factor}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={factor.peso * 100}
                            sx={{
                              flexGrow: 1,
                              height: 6,
                              borderRadius: 3,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: obtenerColorRiesgo(
                                  factor.peso * 10
                                ),
                              },
                            }}
                          />
                          <Chip
                            label={factor.estado.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: obtenerColorRiesgo(
                                factor.peso * 10
                              ),
                              color: 'white',
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Mapa de Calor de Actividad Criminal */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🗺️ Mapa de Calor - Actividad Criminal por Zona
              </Typography>
              <Grid container spacing={2}>
                {mapaCalor.map((zona, index) => (
                  <Grid item xs={12} sm={6} md={2.4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${obtenerColorRiesgo(
                          zona.actividad_criminal / 10
                        )}, ${obtenerColorRiesgo(
                          zona.actividad_criminal / 10
                        )}aa)`,
                        color: 'white',
                      }}
                    >
                      <LocationOn sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        {zona.zona}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {zona.actividad_criminal}%
                      </Typography>
                      <Typography variant="body2">
                        {zona.redes_activas} redes activas
                      </Typography>
                      <Chip
                        label={zona.densidad_poblacional}
                        size="small"
                        sx={{
                          mt: 1,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                        }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertas Inteligentes */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚨 Alertas Inteligentes del Sistema
          </Typography>

          {alertas.length === 0 ? (
            <Alert severity="success">
              No hay alertas críticas en este momento
            </Alert>
          ) : (
            <List>
              {alertas.map(alerta => (
                <ListItem
                  key={alerta.id}
                  sx={{
                    mb: 1,
                    border: `2px solid ${obtenerColorPrioridad(
                      alerta.prioridad
                    )}`,
                    borderRadius: 2,
                    backgroundColor: `${obtenerColorPrioridad(
                      alerta.prioridad
                    )}10`,
                  }}
                >
                  <ListItemIcon>
                    {obtenerIconoPrioridad(alerta.prioridad)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {alerta.titulo}
                        </Typography>
                        <Chip
                          label={alerta.prioridad
                            .replace('_', ' ')
                            .toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: obtenerColorPrioridad(
                              alerta.prioridad
                            ),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {alerta.timestamp.toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {alerta.descripcion}
                        </Typography>
                        {alerta.parametros && (
                          <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                            {Object.entries(alerta.parametros).map(
                              ([key, value]) => (
                                <Chip
                                  key={key}
                                  label={`${key}: ${
                                    Array.isArray(value)
                                      ? value.join(', ')
                                      : value
                                  }`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )
                            )}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Predicciones y Recomendaciones */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔮 Predicciones y Recomendaciones
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Alert severity="warning" sx={{ height: '100%' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Próximos 30 días:
                </Typography>
                <Typography variant="body2">
                  {metricas.predicciones.proximos_30_dias}
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12} md={4}>
              <Alert severity="info" sx={{ height: '100%' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Próximos 90 días:
                </Typography>
                <Typography variant="body2">
                  {metricas.predicciones.proximos_90_dias}
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12} md={4}>
              <Alert severity="error" sx={{ height: '100%' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Recomendación operativa:
                </Typography>
                <Typography variant="body2">
                  {metricas.predicciones.recomendacion}
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MetricasAvanzadas;
