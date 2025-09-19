import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Group,
  Map,
  Analytics,
  Person,
  Warning,
  Timeline,
  ExpandMore,
  Visibility,
  LocationOn,
  Security,
} from '@mui/icons-material';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Circle,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import VisualizadorRedCriminal from './VisualizadorRedCriminal';

const GestionBandasCriminales = () => {
  const [bandas, setBandas] = useState([]);
  const [bandaSeleccionada, setBandaSeleccionada] = useState(null);
  const [dialogoCrear, setDialogoCrear] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [dialogoMiembros, setDialogoMiembros] = useState(false);
  const [dialogoAnalisis, setDialogoAnalisis] = useState(false);
  const [tabActiva, setTabActiva] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo_criminal: '',
    estado_operacional: '',
    nivel_peligrosidad: '',
  });

  // Estados para formularios
  const [formularioBanda, setFormularioBanda] = useState({
    nombre: '',
    alias: '',
    descripcion: '',
    tipo_criminal: 'delictiva_general',
    nivel_peligrosidad: 'medio',
    estado_operacional: 'en_investigacion',
    territorio_principal: '',
    latitud_centro: '',
    longitud_centro: '',
    radio_influencia_km: '',
    color_mapa: '#ff0000',
    lider_principal_id: '',
  });

  const [miembrosBanda, setMiembrosBanda] = useState([]);
  const [analisisTerritorial, setAnalisisTerritorial] = useState(null);

  useEffect(() => {
    cargarBandas();
  }, [filtros]);

  const cargarBandas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filtros,
        incluir_metricas: 'true',
        incluir_actividad_reciente: 'true',
      });

      const response = await fetch(`/api/inteligencia/bandas?${params}`);
      if (!response.ok) throw new Error('Error al cargar bandas');

      const data = await response.json();
      setBandas(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarMiembrosBanda = async bandaId => {
    try {
      const response = await fetch(
        `/api/inteligencia/bandas/${bandaId}/miembros?incluir_historial=true`
      );
      if (!response.ok) throw new Error('Error al cargar miembros');

      const data = await response.json();
      setMiembrosBanda(data.miembros);
    } catch (err) {
      setError(err.message);
    }
  };

  const cargarAnalisisTerritorial = async () => {
    try {
      const response = await fetch(
        '/api/inteligencia/bandas/analisis/territorial?incluir_conflictos=true&incluir_expansion=true'
      );
      if (!response.ok) throw new Error('Error al cargar análisis territorial');

      const data = await response.json();
      setAnalisisTerritorial(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const crearBanda = async () => {
    try {
      const response = await fetch('/api/inteligencia/bandas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formularioBanda),
      });

      if (!response.ok) throw new Error('Error al crear banda');

      await cargarBandas();
      setDialogoCrear(false);
      limpiarFormulario();
    } catch (err) {
      setError(err.message);
    }
  };

  const editarBanda = async () => {
    try {
      const response = await fetch(
        `/api/inteligencia/bandas/${bandaSeleccionada.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formularioBanda),
        }
      );

      if (!response.ok) throw new Error('Error al actualizar banda');

      await cargarBandas();
      setDialogoEditar(false);
      setBandaSeleccionada(null);
      limpiarFormulario();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminarBanda = async bandaId => {
    if (!window.confirm('¿Está seguro de eliminar esta banda?')) return;

    try {
      const response = await fetch(`/api/inteligencia/bandas/${bandaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar banda');

      await cargarBandas();
      setBandaSeleccionada(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const limpiarFormulario = () => {
    setFormularioBanda({
      nombre: '',
      alias: '',
      descripcion: '',
      tipo_criminal: 'delictiva_general',
      nivel_peligrosidad: 'medio',
      estado_operacional: 'en_investigacion',
      territorio_principal: '',
      latitud_centro: '',
      longitud_centro: '',
      radio_influencia_km: '',
      color_mapa: '#ff0000',
      lider_principal_id: '',
    });
  };

  const abrirDialogoEditar = banda => {
    setBandaSeleccionada(banda);
    setFormularioBanda({
      nombre: banda.nombre || '',
      alias: banda.alias || '',
      descripcion: banda.descripcion || '',
      tipo_criminal: banda.tipo_criminal,
      nivel_peligrosidad: banda.nivel_peligrosidad,
      estado_operacional: banda.estado_operacional,
      territorio_principal: banda.territorio_principal || '',
      latitud_centro: banda.latitud_centro || '',
      longitud_centro: banda.longitud_centro || '',
      radio_influencia_km: banda.radio_influencia_km || '',
      color_mapa: banda.color_mapa || '#ff0000',
      lider_principal_id: banda.lider_principal_id || '',
    });
    setDialogoEditar(true);
  };

  const abrirGestionMiembros = async banda => {
    setBandaSeleccionada(banda);
    await cargarMiembrosBanda(banda.id);
    setDialogoMiembros(true);
  };

  const abrirAnalisisBanda = async banda => {
    setBandaSeleccionada(banda);
    await cargarAnalisisTerritorial();
    setDialogoAnalisis(true);
  };

  const obtenerColorPeligrosidad = nivel => {
    const colores = {
      bajo: '#2ecc71',
      medio: '#f39c12',
      alto: '#e67e22',
      extremo: '#e74c3c',
    };
    return colores[nivel] || '#95a5a6';
  };

  const obtenerIconoEstado = estado => {
    const iconos = {
      activa: { icon: <Warning />, color: 'error' },
      en_investigacion: { icon: <Security />, color: 'warning' },
      desarticulada_parcial: { icon: <Timeline />, color: 'info' },
      desarticulada_total: { icon: <Security />, color: 'success' },
      inactiva_temporal: { icon: <Timeline />, color: 'default' },
    };
    return iconos[estado] || { icon: <Security />, color: 'default' };
  };

  const FormularioBanda = ({ modo = 'crear' }) => (
    <Box
      component="form"
      sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nombre de la banda"
            value={formularioBanda.nombre}
            onChange={e =>
              setFormularioBanda(prev => ({ ...prev, nombre: e.target.value }))
            }
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Alias/Nombre conocido"
            value={formularioBanda.alias}
            onChange={e =>
              setFormularioBanda(prev => ({ ...prev, alias: e.target.value }))
            }
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Descripción"
            value={formularioBanda.descripcion}
            onChange={e =>
              setFormularioBanda(prev => ({
                ...prev,
                descripcion: e.target.value,
              }))
            }
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth required>
            <InputLabel>Tipo Criminal</InputLabel>
            <Select
              value={formularioBanda.tipo_criminal}
              onChange={e =>
                setFormularioBanda(prev => ({
                  ...prev,
                  tipo_criminal: e.target.value,
                }))
              }
              label="Tipo Criminal"
            >
              <MenuItem value="delictiva_general">Delictiva General</MenuItem>
              <MenuItem value="narcotraficante">Narcotráfico</MenuItem>
              <MenuItem value="robo_automotor">Robo Automotor</MenuItem>
              <MenuItem value="asaltos_violentos">Asaltos Violentos</MenuItem>
              <MenuItem value="secuestros_extorsivos">
                Secuestros/Extorsión
              </MenuItem>
              <MenuItem value="estafas_tecnologicas">
                Estafas Tecnológicas
              </MenuItem>
              <MenuItem value="trata_personas">Trata de Personas</MenuItem>
              <MenuItem value="lavado_dinero">Lavado de Dinero</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth required>
            <InputLabel>Nivel de Peligrosidad</InputLabel>
            <Select
              value={formularioBanda.nivel_peligrosidad}
              onChange={e =>
                setFormularioBanda(prev => ({
                  ...prev,
                  nivel_peligrosidad: e.target.value,
                }))
              }
              label="Nivel de Peligrosidad"
            >
              <MenuItem value="bajo">Bajo</MenuItem>
              <MenuItem value="medio">Medio</MenuItem>
              <MenuItem value="alto">Alto</MenuItem>
              <MenuItem value="extremo">Extremo</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth required>
            <InputLabel>Estado Operacional</InputLabel>
            <Select
              value={formularioBanda.estado_operacional}
              onChange={e =>
                setFormularioBanda(prev => ({
                  ...prev,
                  estado_operacional: e.target.value,
                }))
              }
              label="Estado Operacional"
            >
              <MenuItem value="activa">Activa</MenuItem>
              <MenuItem value="en_investigacion">En Investigación</MenuItem>
              <MenuItem value="desarticulada_parcial">
                Desarticulada Parcial
              </MenuItem>
              <MenuItem value="desarticulada_total">
                Desarticulada Total
              </MenuItem>
              <MenuItem value="inactiva_temporal">Inactiva Temporal</MenuItem>
              <MenuItem value="reorganizandose">Reorganizándose</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Territorio Principal"
            value={formularioBanda.territorio_principal}
            onChange={e =>
              setFormularioBanda(prev => ({
                ...prev,
                territorio_principal: e.target.value,
              }))
            }
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Radio de Influencia (km)"
            type="number"
            value={formularioBanda.radio_influencia_km}
            onChange={e =>
              setFormularioBanda(prev => ({
                ...prev,
                radio_influencia_km: e.target.value,
              }))
            }
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Latitud Centro"
            type="number"
            step="any"
            value={formularioBanda.latitud_centro}
            onChange={e =>
              setFormularioBanda(prev => ({
                ...prev,
                latitud_centro: e.target.value,
              }))
            }
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Longitud Centro"
            type="number"
            step="any"
            value={formularioBanda.longitud_centro}
            onChange={e =>
              setFormularioBanda(prev => ({
                ...prev,
                longitud_centro: e.target.value,
              }))
            }
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Color en Mapa"
            type="color"
            value={formularioBanda.color_mapa}
            onChange={e =>
              setFormularioBanda(prev => ({
                ...prev,
                color_mapa: e.target.value,
              }))
            }
          />
        </Grid>
      </Grid>
    </Box>
  );

  const ListaBandas = () => (
    <Box>
      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo Criminal</InputLabel>
                <Select
                  value={filtros.tipo_criminal}
                  onChange={e =>
                    setFiltros(prev => ({
                      ...prev,
                      tipo_criminal: e.target.value,
                    }))
                  }
                  label="Tipo Criminal"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="narcotraficante">Narcotráfico</MenuItem>
                  <MenuItem value="robo_automotor">Robo Automotor</MenuItem>
                  <MenuItem value="asaltos_violentos">
                    Asaltos Violentos
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtros.estado_operacional}
                  onChange={e =>
                    setFiltros(prev => ({
                      ...prev,
                      estado_operacional: e.target.value,
                    }))
                  }
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="activa">Activa</MenuItem>
                  <MenuItem value="en_investigacion">En Investigación</MenuItem>
                  <MenuItem value="desarticulada_parcial">
                    Desarticulada Parcial
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Peligrosidad</InputLabel>
                <Select
                  value={filtros.nivel_peligrosidad}
                  onChange={e =>
                    setFiltros(prev => ({
                      ...prev,
                      nivel_peligrosidad: e.target.value,
                    }))
                  }
                  label="Peligrosidad"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="bajo">Bajo</MenuItem>
                  <MenuItem value="medio">Medio</MenuItem>
                  <MenuItem value="alto">Alto</MenuItem>
                  <MenuItem value="extremo">Extremo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de bandas */}
      <Grid container spacing={2}>
        {bandas.map(banda => {
          const estadoIcon = obtenerIconoEstado(banda.estado_operacional);

          return (
            <Grid item xs={12} md={6} lg={4} key={banda.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <Typography variant="h6" component="div">
                      {banda.nombre}
                    </Typography>
                    <Chip
                      icon={estadoIcon.icon}
                      label={banda.estado_operacional?.replace('_', ' ')}
                      color={estadoIcon.color}
                      size="small"
                    />
                  </Box>

                  {banda.alias && (
                    <Typography color="text.secondary" gutterBottom>
                      "{banda.alias}"
                    </Typography>
                  )}

                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip
                      label={banda.tipo_criminal?.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={banda.nivel_peligrosidad}
                      size="small"
                      style={{
                        backgroundColor: obtenerColorPeligrosidad(
                          banda.nivel_peligrosidad
                        ),
                        color: 'white',
                      }}
                    />
                  </Box>

                  <Box display="flex" gap={1} mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      <Badge
                        badgeContent={banda.total_miembros_confirmados || 0}
                        color="primary"
                      >
                        <Group fontSize="small" />
                      </Badge>
                      {` ${banda.miembros_activos || 0} activos`}
                    </Typography>
                  </Box>

                  {banda.territorio_principal && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <LocationOn fontSize="small" />{' '}
                      {banda.territorio_principal}
                    </Typography>
                  )}

                  {banda.lider_info && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Líder:</strong> {banda.lider_info.nombre}{' '}
                      {banda.lider_info.apellido}
                    </Typography>
                  )}

                  <Box display="flex" gap={1} mt={2}>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => abrirDialogoEditar(banda)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Gestionar miembros">
                      <IconButton
                        size="small"
                        onClick={() => abrirGestionMiembros(banda)}
                      >
                        <Group />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Análisis">
                      <IconButton
                        size="small"
                        onClick={() => abrirAnalisisBanda(banda)}
                      >
                        <Analytics />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => eliminarBanda(banda.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const GestionMiembros = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Miembros de {bandaSeleccionada?.nombre}
      </Typography>

      <List>
        {miembrosBanda.map(miembro => (
          <React.Fragment key={miembro.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar src={miembro.foto_principal}>
                  <Person />
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={`${miembro.nombre} ${miembro.apellido}`}
                secondary={
                  <Box>
                    <Typography variant="body2">
                      <strong>Rol:</strong>{' '}
                      {miembro.rol_principal?.replace('_', ' ')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Estado:</strong>{' '}
                      {miembro.estado_miembro?.replace('_', ' ')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>DNI:</strong> {miembro.dni}
                    </Typography>
                    {miembro.fecha_ingreso_confirmada && (
                      <Typography variant="body2">
                        <strong>Ingreso:</strong>{' '}
                        {new Date(
                          miembro.fecha_ingreso_confirmada
                        ).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Gestión de Bandas Criminales</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogoCrear(true)}
        >
          Nueva Banda
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs
        value={tabActiva}
        onChange={(e, newValue) => setTabActiva(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Lista de Bandas" />
        <Tab label="Mapa Territorial" />
        <Tab label="Análisis de Redes" />
      </Tabs>

      {tabActiva === 0 && <ListaBandas />}
      {tabActiva === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Mapa Territorial
            </Typography>
            <Box height={500}>
              {/* Implementar mapa con Leaflet */}
              <Typography>Mapa territorial en desarrollo...</Typography>
            </Box>
          </CardContent>
        </Card>
      )}
      {tabActiva === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Análisis de Redes Criminales
            </Typography>
            {bandaSeleccionada && (
              <VisualizadorRedCriminal
                personaId={bandaSeleccionada.lider_principal_id}
                altura={500}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Diálogo crear banda */}
      <Dialog
        open={dialogoCrear}
        onClose={() => setDialogoCrear(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crear Nueva Banda Criminal</DialogTitle>
        <DialogContent>
          <FormularioBanda modo="crear" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoCrear(false)}>Cancelar</Button>
          <Button onClick={crearBanda} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo editar banda */}
      <Dialog
        open={dialogoEditar}
        onClose={() => setDialogoEditar(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar Banda Criminal</DialogTitle>
        <DialogContent>
          <FormularioBanda modo="editar" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoEditar(false)}>Cancelar</Button>
          <Button onClick={editarBanda} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo gestión de miembros */}
      <Dialog
        open={dialogoMiembros}
        onClose={() => setDialogoMiembros(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Gestión de Miembros</DialogTitle>
        <DialogContent>
          <GestionMiembros />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoMiembros(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo análisis de banda */}
      <Dialog
        open={dialogoAnalisis}
        onClose={() => setDialogoAnalisis(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Análisis de Banda Criminal</DialogTitle>
        <DialogContent>
          {bandaSeleccionada && (
            <VisualizadorRedCriminal
              personaId={bandaSeleccionada.lider_principal_id}
              altura={400}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoAnalisis(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionBandasCriminales;
