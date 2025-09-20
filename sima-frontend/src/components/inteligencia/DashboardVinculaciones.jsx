import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Paper,
  Collapse,
  Fab,
  Zoom,
  CircularProgress,
  Stack,
  AvatarGroup,
} from '@mui/material';
import {
  AccountTree,
  Group,
  Security,
  Warning,
  TrendingUp,
  Visibility,
  Edit,
  Add,
  Refresh,
  ExpandMore,
  ExpandLess,
  Assessment,
  Timeline,
  LocationOn,
  Person,
  AutoGraph,
  Shield,
  Analytics,
  Notifications,
  TrendingDown,
  Stars,
  FilterList,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import api from '../../services/api';
import SistemaNotificaciones from './SistemaNotificaciones';

// Datos mock mejorados para demostración
const MOCK_ESTADISTICAS = {
  total_vinculaciones: 147,
  vinculaciones_activas: 89,
  personas_involucradas: 156,
  nuevas_redes_detectadas: 3,
  alertas_criticas: 2,
  nivel_riesgo_general: 'alto',
  ultima_actualizacion: new Date(),
  tendencia_semanal: '+12%',
  eficiencia_deteccion: 87.3,
};

const MOCK_REDES_CRIMINALES = [
  {
    id: 'red_001',
    nombre: 'Los Hermanos del Norte',
    tipo_red: 'banda_criminal',
    nivel_peligrosidad: 'muy_alto',
    total_miembros: 8,
    total_vinculos: 23,
    cohesion: 0.84,
    lider: { nombre: 'Carlos', apellido: 'Martinez', dni: '35123456' },
    tipos_vinculo_predominantes: [
      { tipo: 'complice_criminal', cantidad: 12 },
      { tipo: 'jerarquia_comando', cantidad: 6 },
      { tipo: 'familiar', cantidad: 5 },
    ],
    es_nueva: false,
    alertas_count: 2,
    territorio: 'Zona Norte - Barrio San Martin',
    actividad_reciente: 'Incremento en vínculos operativos',
    fecha_deteccion: '2025-09-15',
    confianza_deteccion: 0.91,
    miembros_destacados: [
      {
        nombre: 'Carlos',
        apellido: 'Martinez',
        rol: 'Líder',
        peligrosidad: 'muy_alta',
      },
      {
        nombre: 'Miguel',
        apellido: 'Rodriguez',
        rol: 'Lugarteniente',
        peligrosidad: 'alta',
      },
      {
        nombre: 'Ana',
        apellido: 'Fernandez',
        rol: 'Coordinadora',
        peligrosidad: 'media',
      },
    ],
  },
  {
    id: 'red_002',
    nombre: 'Clan Familiar Gutierrez',
    tipo_red: 'clan_familiar',
    nivel_peligrosidad: 'alto',
    total_miembros: 12,
    total_vinculos: 18,
    cohesion: 0.67,
    lider: { nombre: 'Roberto', apellido: 'Gutierrez', dni: '28987654' },
    tipos_vinculo_predominantes: [
      { tipo: 'familiar', cantidad: 10 },
      { tipo: 'complice_criminal', cantidad: 6 },
      { tipo: 'financiero', cantidad: 2 },
    ],
    es_nueva: true,
    alertas_count: 1,
    territorio: 'Zona Sur - Multiple',
    actividad_reciente: 'Red familiar expandida recientemente',
    fecha_deteccion: '2025-09-18',
    confianza_deteccion: 0.78,
    miembros_destacados: [
      {
        nombre: 'Roberto',
        apellido: 'Gutierrez',
        rol: 'Patriarca',
        peligrosidad: 'alta',
      },
      {
        nombre: 'María',
        apellido: 'Gutierrez',
        rol: 'Matriarca',
        peligrosidad: 'media',
      },
    ],
  },
  {
    id: 'red_003',
    nombre: 'Red de Colaboradores del Centro',
    tipo_red: 'red_colaboradores',
    nivel_peligrosidad: 'medio',
    total_miembros: 6,
    total_vinculos: 11,
    cohesion: 0.45,
    lider: null,
    tipos_vinculo_predominantes: [
      { tipo: 'colaboracion', cantidad: 7 },
      { tipo: 'financiero', cantidad: 3 },
      { tipo: 'informante', cantidad: 1 },
    ],
    es_nueva: false,
    alertas_count: 0,
    territorio: 'Centro Urbano',
    actividad_reciente: 'Red estable sin cambios significativos',
    fecha_deteccion: '2025-08-22',
    confianza_deteccion: 0.65,
    miembros_destacados: [],
  },
];

const MOCK_DATOS_TENDENCIAS = [
  { mes: 'May', vinculaciones: 65, redes: 8, peligrosidad: 2.3 },
  { mes: 'Jun', vinculaciones: 78, redes: 9, peligrosidad: 2.8 },
  { mes: 'Jul', vinculaciones: 89, redes: 12, peligrosidad: 3.1 },
  { mes: 'Ago', vinculaciones: 134, redes: 15, peligrosidad: 3.6 },
  { mes: 'Sep', vinculaciones: 147, redes: 17, peligrosidad: 3.9 },
];

const COLORES_PELIGROSIDAD = {
  muy_alto: '#c0392b',
  alto: '#e74c3c',
  medio: '#f39c12',
  bajo: '#27ae60',
  muy_bajo: '#2ecc71',
};

const COLORES_GRAFICOS = [
  '#3498db',
  '#e74c3c',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
];

const DashboardVinculaciones = () => {
  const [estadisticas, setEstadisticas] = useState(MOCK_ESTADISTICAS);
  const [redesCriminales, setRedesCriminales] = useState(MOCK_REDES_CRIMINALES);
  const [datosTendencias, setDatosTendencias] = useState(MOCK_DATOS_TENDENCIAS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRed, setExpandedRed] = useState(null);
  const [dialogCrearBanda, setDialogCrearBanda] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroPeligrosidad, setFiltroPeligrosidad] = useState('todos');
  const [redSeleccionada, setRedSeleccionada] = useState(null);

  const cargarDatosVinculaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // En producción, estas serían llamadas reales a la API
      /*
      const statsResponse = await api.get('/api/inteligencia/vinculaciones/dashboard/stats');
      const redesResponse = await api.get('/api/inteligencia/vinculaciones/deteccion/redes', {
        params: { 
          umbral_conexiones: 3,
          nivel_confianza_min: 0.6,
          incluir_clasificacion: true
        }
      });
      const tendenciasResponse = await api.get('/api/inteligencia/vinculaciones/tendencias');

      setEstadisticas(statsResponse.data.estadisticas_generales);
      setRedesCriminales(redesResponse.data.redes_clasificadas);
      setDatosTendencias(tendenciasResponse.data.datos_mensuales);
      */

      // Por ahora usar datos mock
      setEstadisticas(MOCK_ESTADISTICAS);
      setRedesCriminales(MOCK_REDES_CRIMINALES);
      setDatosTendencias(MOCK_DATOS_TENDENCIAS);
    } catch (error) {
      console.error('Error cargando datos de vinculaciones:', error);
      setError('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatosVinculaciones();
  }, [cargarDatosVinculaciones]);

  const redesFiltradas = useMemo(() => {
    return redesCriminales.filter(red => {
      const pasaFiltroTipo =
        filtroTipo === 'todos' || red.tipo_red === filtroTipo;
      const pasaFiltroPeligrosidad =
        filtroPeligrosidad === 'todos' ||
        red.nivel_peligrosidad === filtroPeligrosidad;
      return pasaFiltroTipo && pasaFiltroPeligrosidad;
    });
  }, [redesCriminales, filtroTipo, filtroPeligrosidad]);

  const obtenerIconoTipoRed = useCallback(tipo => {
    const iconos = {
      banda_criminal: {
        icon: <Security />,
        color: '#e74c3c',
        label: 'Banda Criminal',
      },
      clan_familiar: {
        icon: <Group />,
        color: '#9b59b6',
        label: 'Clan Familiar',
      },
      red_colaboradores: {
        icon: <AccountTree />,
        color: '#3498db',
        label: 'Red de Colaboradores',
      },
      estructura_jerarquica: {
        icon: <TrendingUp />,
        color: '#e67e22',
        label: 'Estructura Jerárquica',
      },
      red_territorial: {
        icon: <LocationOn />,
        color: '#f39c12',
        label: 'Red Territorial',
      },
      organizacion_compleja: {
        icon: <AutoGraph />,
        color: '#c0392b',
        label: 'Organización Compleja',
      },
    };
    return (
      iconos[tipo] || {
        icon: <AccountTree />,
        color: '#95a5a6',
        label: 'Red Criminal',
      }
    );
  }, []);

  const distribucionTipos = useMemo(() => {
    const conteo = redesCriminales.reduce((acc, red) => {
      const tipo = obtenerIconoTipoRed(red.tipo_red);
      acc[tipo.label] = (acc[tipo.label] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(conteo).map(([tipo, cantidad], index) => ({
      tipo,
      cantidad,
      color: COLORES_GRAFICOS[index % COLORES_GRAFICOS.length],
    }));
  }, [redesCriminales, obtenerIconoTipoRed]);

  const handleExpandRed = redId => {
    setExpandedRed(expandedRed === redId ? null : redId);
  };

  const handleCrearBandaOficial = red => {
    setRedSeleccionada(red);
    setDialogCrearBanda(true);
  };

  const handleVerRedCompleta = red => {
    console.log('Ver red completa:', red);
    // Aquí se abriría el visualizador de red completo
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6">Error al cargar dashboard</Typography>
        <Typography>{error}</Typography>
        <Button onClick={cargarDatosVinculaciones} sx={{ mt: 1 }}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Encabezado con acciones */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🕸️ Dashboard de Redes Criminales
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Análisis inteligente de clanes, bandas y organizaciones criminales
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <SistemaNotificaciones
            onNotificacionRecibida={notificacion => {
              console.log('Nueva notificación recibida:', notificacion);
              // Aquí se puede actualizar el dashboard si es necesario
              if (notificacion.tipo === 'red_emergente') {
                cargarDatosVinculaciones();
              }
            }}
          />
          <Tooltip title="Filtrar redes">
            <IconButton>
              <FilterList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Actualizar datos">
            <IconButton onClick={cargarDatosVinculaciones} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mb={3}>
          <CircularProgress />
        </Box>
      )}

      {/* Estadísticas Principales */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <AccountTree />
                </Avatar>
                <Box color="white">
                  <Typography variant="h4" fontWeight="bold">
                    {estadisticas.total_vinculaciones}
                  </Typography>
                  <Typography variant="body2">Total Vinculaciones</Typography>
                  <Chip
                    label={estadisticas.tendencia_semanal}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      mt: 0.5,
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <Group />
                </Avatar>
                <Box color="white">
                  <Typography variant="h4" fontWeight="bold">
                    {estadisticas.vinculaciones_activas}
                  </Typography>
                  <Typography variant="body2">Vínculos Activos</Typography>
                  <Typography variant="caption">
                    {estadisticas.personas_involucradas} personas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <AutoGraph />
                </Avatar>
                <Box color="white">
                  <Typography variant="h4" fontWeight="bold">
                    {redesCriminales.length}
                  </Typography>
                  <Typography variant="body2">Redes Detectadas</Typography>
                  <Chip
                    label={`${estadisticas.nuevas_redes_detectadas} nuevas`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      mt: 0.5,
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Badge
                  badgeContent={estadisticas.alertas_criticas}
                  color="error"
                >
                  <Avatar
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    <Shield />
                  </Avatar>
                </Badge>
                <Box color="white">
                  <Typography variant="h4" fontWeight="bold">
                    {estadisticas.eficiencia_deteccion}%
                  </Typography>
                  <Typography variant="body2">Eficiencia</Typography>
                  <Typography variant="caption">
                    Nivel {estadisticas.nivel_riesgo_general}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos de Análisis */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Tendencias de Actividad Criminal
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={datosTendencias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="vinculaciones"
                    stroke="#3498db"
                    fill="#3498db"
                    fillOpacity={0.3}
                    name="Vinculaciones"
                  />
                  <Area
                    type="monotone"
                    dataKey="redes"
                    stroke="#e74c3c"
                    fill="#e74c3c"
                    fillOpacity={0.3}
                    name="Redes Detectadas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Distribución por Tipo
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribucionTipos}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="cantidad"
                    label={({ tipo, cantidad }) => `${tipo}: ${cantidad}`}
                  >
                    {distribucionTipos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle1" fontWeight="bold">
              Filtros:
            </Typography>
            <TextField
              select
              label="Tipo de Red"
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              size="small"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="todos">Todos los tipos</MenuItem>
              <MenuItem value="banda_criminal">Bandas Criminales</MenuItem>
              <MenuItem value="clan_familiar">Clanes Familiares</MenuItem>
              <MenuItem value="red_colaboradores">
                Redes de Colaboradores
              </MenuItem>
              <MenuItem value="estructura_jerarquica">
                Estructuras Jerárquicas
              </MenuItem>
            </TextField>

            <TextField
              select
              label="Nivel de Peligrosidad"
              value={filtroPeligrosidad}
              onChange={e => setFiltroPeligrosidad(e.target.value)}
              size="small"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="todos">Todos los niveles</MenuItem>
              <MenuItem value="muy_alto">Muy Alto</MenuItem>
              <MenuItem value="alto">Alto</MenuItem>
              <MenuItem value="medio">Medio</MenuItem>
              <MenuItem value="bajo">Bajo</MenuItem>
            </TextField>

            <Chip
              label={`${redesFiltradas.length} redes mostradas`}
              color="primary"
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Redes Criminales Detectadas */}
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" fontWeight="bold">
              🕸️ Clanes, Bandas y Redes Criminales
            </Typography>
            <Box display="flex" gap={1}>
              <Chip
                label={`${redesFiltradas.length} redes activas`}
                color="primary"
                size="small"
              />
              <Button
                startIcon={<Add />}
                variant="outlined"
                size="small"
                onClick={() => setDialogCrearBanda(true)}
              >
                Nueva Banda
              </Button>
            </Box>
          </Box>

          {redesFiltradas.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              py={6}
              sx={{ color: 'text.secondary' }}
            >
              <AccountTree sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">
                No hay redes que coincidan con los filtros
              </Typography>
              <Typography variant="body2" textAlign="center">
                Ajusta los filtros o espera a que se detecten nuevas redes
                criminales automáticamente
              </Typography>
            </Box>
          ) : (
            <List>
              {redesFiltradas.map((red, index) => {
                const tipoIcon = obtenerIconoTipoRed(red.tipo_red);
                const isExpanded = expandedRed === red.id;

                return (
                  <React.Fragment key={red.id}>
                    <ListItem
                      sx={{
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        mb: 2,
                        border: '1px solid #e0e0e0',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                          transition: 'all 0.3s ease',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: tipoIcon.color,
                            width: 60,
                            height: 60,
                            mr: 1,
                          }}
                        >
                          {tipoIcon.icon}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                            mb={1}
                          >
                            <Typography variant="h6" fontWeight="bold">
                              {red.nombre}
                            </Typography>

                            <Chip
                              label={red.nivel_peligrosidad
                                .replace('_', ' ')
                                .toUpperCase()}
                              size="small"
                              sx={{
                                backgroundColor:
                                  COLORES_PELIGROSIDAD[red.nivel_peligrosidad],
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            />

                            {red.es_nueva && (
                              <Chip
                                label="NUEVA"
                                size="small"
                                color="warning"
                                sx={{
                                  fontWeight: 'bold',
                                  animation: 'pulse 2s infinite',
                                }}
                              />
                            )}

                            <Chip
                              label={`Confianza: ${(
                                red.confianza_deteccion * 100
                              ).toFixed(0)}%`}
                              size="small"
                              variant="outlined"
                              color={
                                red.confianza_deteccion > 0.8
                                  ? 'success'
                                  : red.confianza_deteccion > 0.6
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box
                              component="span"
                              sx={{
                                display: 'block',
                                color: 'text.secondary',
                                mb: 1,
                                fontSize: '0.875rem',
                              }}
                            >
                              <strong>Tipo:</strong> {tipoIcon.label} •{' '}
                              <strong>Territorio:</strong> {red.territorio}
                            </Box>

                            <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                              <Chip
                                icon={<Group />}
                                label={`${red.total_miembros} miembros`}
                                size="small"
                                variant="outlined"
                              />

                              <Chip
                                icon={<AccountTree />}
                                label={`${red.total_vinculos} vínculos`}
                                size="small"
                                variant="outlined"
                              />

                              <Chip
                                icon={<TrendingUp />}
                                label={`Cohesión: ${(
                                  red.cohesion * 100
                                ).toFixed(0)}%`}
                                size="small"
                                variant="outlined"
                                color={
                                  red.cohesion > 0.7
                                    ? 'error'
                                    : red.cohesion > 0.5
                                    ? 'warning'
                                    : 'default'
                                }
                              />
                            </Box>

                            {red.lider && (
                              <Box
                                component="span"
                                sx={{
                                  display: 'block',
                                  color: 'text.secondary',
                                  mb: 1,
                                  fontSize: '0.875rem',
                                }}
                              >
                                <Person
                                  sx={{
                                    fontSize: 16,
                                    mr: 0.5,
                                    verticalAlign: 'middle',
                                  }}
                                />
                                <strong>Líder:</strong> {red.lider.nombre}{' '}
                                {red.lider.apellido}
                                {red.lider.dni && ` (DNI: ${red.lider.dni})`}
                              </Box>
                            )}

                            <Box
                              component="span"
                              sx={{
                                display: 'block',
                                color: 'text.secondary',
                                fontStyle: 'italic',
                                fontSize: '0.875rem',
                              }}
                            >
                              {red.actividad_reciente}
                            </Box>

                            {/* Panel expandible */}
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box
                                sx={{
                                  mt: 2,
                                  p: 2,
                                  bgcolor: 'background.paper',
                                  borderRadius: 1,
                                }}
                              >
                                <Typography variant="subtitle2" gutterBottom>
                                  🎯 Análisis Detallado
                                </Typography>

                                {red.tipos_vinculo_predominantes && (
                                  <Box mb={2}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      gutterBottom
                                      display="block"
                                    >
                                      Tipos de vínculos predominantes:
                                    </Typography>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      flexWrap="wrap"
                                    >
                                      {red.tipos_vinculo_predominantes.map(
                                        (tipo, idx) => (
                                          <Chip
                                            key={idx}
                                            label={`${tipo.tipo.replace(
                                              '_',
                                              ' '
                                            )}: ${tipo.cantidad}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ mb: 0.5 }}
                                          />
                                        )
                                      )}
                                    </Stack>
                                  </Box>
                                )}

                                {red.miembros_destacados &&
                                  red.miembros_destacados.length > 0 && (
                                    <Box mb={2}>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        gutterBottom
                                        display="block"
                                      >
                                        Miembros destacados:
                                      </Typography>
                                      <List dense>
                                        {red.miembros_destacados.map(
                                          (miembro, idx) => (
                                            <ListItem
                                              key={idx}
                                              sx={{ py: 0.5 }}
                                            >
                                              <ListItemAvatar>
                                                <Avatar
                                                  sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor:
                                                      COLORES_PELIGROSIDAD[
                                                        miembro.peligrosidad
                                                      ] || '#95a5a6',
                                                  }}
                                                >
                                                  {miembro.nombre.charAt(0)}
                                                </Avatar>
                                              </ListItemAvatar>
                                              <ListItemText
                                                primary={`${miembro.nombre} ${miembro.apellido}`}
                                                secondary={miembro.rol}
                                                primaryTypographyProps={{
                                                  variant: 'body2',
                                                }}
                                                secondaryTypographyProps={{
                                                  variant: 'caption',
                                                }}
                                              />
                                            </ListItem>
                                          )
                                        )}
                                      </List>
                                    </Box>
                                  )}

                                <Box display="flex" gap={1} alignItems="center">
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Detectado:{' '}
                                    {new Date(
                                      red.fecha_deteccion
                                    ).toLocaleDateString()}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    • Última actualización:{' '}
                                    {estadisticas.ultima_actualizacion.toLocaleTimeString()}
                                  </Typography>
                                </Box>
                              </Box>
                            </Collapse>
                          </Box>
                        }
                      />

                      {/* Acciones */}
                      <Box display="flex" flexDirection="column" gap={1} ml={2}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => handleExpandRed(red.id)}
                          >
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Ver Red Completa">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleVerRedCompleta(red)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Crear Banda Oficial">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleCrearBandaOficial(red)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>

                        {red.alertas_count > 0 && (
                          <Badge badgeContent={red.alertas_count} color="error">
                            <Warning color="warning" />
                          </Badge>
                        )}
                      </Box>
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          )}

          {/* Botón flotante para actualizar */}
          <Zoom in={!loading}>
            <Fab
              color="primary"
              aria-label="actualizar"
              onClick={cargarDatosVinculaciones}
              sx={{
                position: 'fixed',
                bottom: 32,
                right: 32,
                zIndex: 1000,
              }}
            >
              <Refresh />
            </Fab>
          </Zoom>
        </CardContent>
      </Card>

      {/* Dialog para crear banda oficial */}
      <Dialog
        open={dialogCrearBanda}
        onClose={() => setDialogCrearBanda(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Security />
            Crear Banda Criminal Oficial
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Esta funcionalidad convertirá la red detectada automáticamente en
            una banda criminal oficial registrada en el sistema.
          </Alert>

          {redSeleccionada && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Red seleccionada: <strong>{redSeleccionada.nombre}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {redSeleccionada.total_miembros} miembros •{' '}
                {redSeleccionada.total_vinculos} vínculos • Nivel de
                peligrosidad:{' '}
                {redSeleccionada.nivel_peligrosidad.replace('_', ' ')}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label="Nombre oficial de la banda"
            defaultValue={redSeleccionada?.nombre || ''}
            margin="normal"
          />

          <TextField
            fullWidth
            select
            label="Clasificación oficial"
            defaultValue="banda_criminal"
            margin="normal"
          >
            <MenuItem value="banda_criminal">Banda Criminal</MenuItem>
            <MenuItem value="organizacion_criminal">
              Organización Criminal
            </MenuItem>
            <MenuItem value="clan_familiar">Clan Familiar Criminal</MenuItem>
            <MenuItem value="cartel">Cartel</MenuItem>
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            placeholder="Información adicional sobre la banda..."
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogCrearBanda(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              console.log('Creando banda oficial:', redSeleccionada);
              setDialogCrearBanda(false);
              setRedSeleccionada(null);
            }}
          >
            Crear Banda Oficial
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardVinculaciones;
