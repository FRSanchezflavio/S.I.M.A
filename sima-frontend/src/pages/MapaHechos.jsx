import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Map as MapIcon,
  Visibility as VisibilityIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MapaInteractivo from '../components/MapaInteractivo';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';
import {
  getConfiguracionIcono,
  MODALIDADES_MAPA,
} from '../utils/simbologiaPolicial';

export default function MapaHechos() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadHechos();
  }, []);

  const loadHechos = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/personas', {
        params: {
          page: 1,
          pageSize: 1000,
          busqueda: '',
        },
      });

      // Filtrar solo registros con ubicación del HECHO
      const hechosConUbicacion = response.data.items
        .filter(
          registro =>
            registro.latitud_hecho &&
            registro.longitud_hecho &&
            !isNaN(parseFloat(registro.latitud_hecho)) &&
            !isNaN(parseFloat(registro.longitud_hecho))
        )
        .map(registro => ({
          ...registro,
          // Usar coordenadas del hecho
          latitud: parseFloat(registro.latitud_hecho),
          longitud: parseFloat(registro.longitud_hecho),
          // Guardar las coordenadas originales
          latitud_original: registro.latitud,
          longitud_original: registro.longitud,
          tipo_delito: registro.tipo_delito || 'general',
          estado: registro.estado || 'activo',
        }));

      setRegistros(hechosConUbicacion);

      if (hechosConUbicacion.length > 0) {
        showToast(
          `${hechosConUbicacion.length} hechos delictivos cargados en el mapa`,
          'success'
        );
      } else {
        showToast(
          'No se encontraron hechos con ubicación registrada',
          'warning'
        );
      }
    } catch (error) {
      console.error('Error al cargar hechos:', error);
      setError(
        'Error al cargar datos del mapa. Por favor, intente nuevamente.'
      );
      showToast('Error al cargar datos del mapa', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistroSelect = registro => {
    setSelectedRegistro(registro);
    setShowDialog(true);
  };

  const handleVerDetalle = () => {
    if (selectedRegistro) {
      nav(`/personas/${selectedRegistro.id}`);
    }
  };

  // Calcular estadísticas
  const estadisticas = {
    total: registros.length,
    resueltos: registros.filter(r => r.estado === 'resuelto').length,
    enProceso: registros.filter(r => r.estado === 'en_proceso').length,
    activos: registros.filter(r => r.estado === 'activo').length,
  };

  if (loading) {
    return (
      <Box
        sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <Header showSettings />

        <Container
          maxWidth="xl"
          sx={{
            py: 4,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: 'rgb(21, 77, 113)' }} />
            <Typography variant="h6" sx={{ mt: 2, color: 'rgb(21, 77, 113)' }}>
              Cargando datos del mapa...
            </Typography>
          </Box>
        </Container>

        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header showSettings />

      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => nav('/mapa-domicilios')}
              sx={{
                borderColor: 'rgb(21, 77, 113)',
                color: 'rgb(21, 77, 113)',
                '&:hover': {
                  borderColor: 'rgb(16, 58, 85)',
                  bgcolor: 'rgba(21, 77, 113, 0.04)',
                },
              }}
            >
              👤 Ver Mapa de Domicilios
            </Button>
          </Box>

          <Typography
            variant="h4"
            sx={{ mb: 1, fontWeight: 'bold', color: 'rgb(21, 77, 113)' }}
          >
            📍 Mapa de Hechos Delictivos
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            Visualización geográfica de los lugares donde ocurrieron los hechos
            delictivos. Cada marcador representa la ubicación exacta donde se
            cometió el delito.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
              <Button onClick={loadHechos} sx={{ ml: 2 }}>
                Reintentar
              </Button>
            </Alert>
          )}
        </Box>

        {/* Estadísticas rápidas */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <GavelIcon
                    sx={{ fontSize: 30, color: 'rgb(21, 77, 113)', mr: 1 }}
                  />
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 'bold', color: 'rgb(21, 77, 113)' }}
                  >
                    {estadisticas.total}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Hechos registrados
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: '#4caf50',
                      mr: 1,
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 'bold', color: '#4caf50' }}
                  >
                    {estadisticas.resueltos}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Casos resueltos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: '#ff9800',
                      mr: 1,
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 'bold', color: '#ff9800' }}
                  >
                    {estadisticas.enProceso}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  En proceso
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: '#f44336',
                      mr: 1,
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 'bold', color: '#f44336' }}
                  >
                    {estadisticas.activos}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Casos activos
                </Typography>
              </CardContent>
            </Card>
          </Grid> */}
        </Grid>

        {/* Mapa principal */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 0 }}>
            {registros.length > 0 ? (
              <MapaInteractivo
                personas={registros}
                onPersonaSelect={handleRegistroSelect}
                height="70vh"
                showControls={true}
                showHeatmap={true}
                initialCenter={[-26.8083, -65.2176]} // Tucumán
                initialZoom={12}
              />
            ) : (
              <Box
                sx={{
                  height: '70vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'text.secondary',
                }}
              >
                <MapIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h6">
                  No hay hechos delictivos con ubicación
                </Typography>
                <Typography variant="body2">
                  Los registros deben tener coordenadas del lugar del hecho para
                  aparecer en este mapa
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Información del Mapa de Hechos
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Este mapa muestra:</strong>
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                  <li>
                    Ubicaciones exactas donde ocurrieron los hechos delictivos
                  </li>
                  <li>Puntos de alta incidencia criminal</li>
                  <li>Zonas calientes (hotspots) de criminalidad</li>
                  <li>Patrones geográficos de delitos</li>
                  <li>Distribución territorial de modalidades delictivas</li>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Herramientas disponibles:</strong>
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                  <li>Filtros por modalidad delictiva</li>
                  <li>Búsqueda por radio de distancia</li>
                  <li>Mapa de calor con concentración de hechos</li>
                  <li>Agrupación inteligente de marcadores</li>
                  <li>Simbología policial oficial de Tucumán</li>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

      {/* Dialog de detalle */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: 'rgb(21, 77, 113)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <GavelIcon sx={{ mr: 1 }} />
          Detalle del Hecho
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRegistro && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={selectedRegistro.foto_principal}
                  sx={{ width: 60, height: 60, mr: 2 }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedRegistro.apellido}, {selectedRegistro.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    DNI: {selectedRegistro.dni || 'No registrado'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 'bold', mb: 1, color: 'rgb(21, 77, 113)' }}
                >
                  📍 Lugar del Hecho:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Dirección:</strong>{' '}
                  {selectedRegistro.direccion_hecho || 'No especificada'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Coordenadas:</strong> {selectedRegistro.latitud},{' '}
                  {selectedRegistro.longitud}
                </Typography>
                {selectedRegistro.comisaria_hecho && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Comisaría del Hecho:</strong>{' '}
                    {selectedRegistro.comisaria_hecho}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={
                    getConfiguracionIcono(
                      selectedRegistro.modalidad || selectedRegistro.tipo_delito
                    ).nombre
                  }
                  color="primary"
                  size="small"
                />
                <Chip
                  label={selectedRegistro.estado || 'Sin estado'}
                  color={
                    selectedRegistro.estado === 'resuelto'
                      ? 'success'
                      : selectedRegistro.estado === 'en_proceso'
                      ? 'warning'
                      : 'default'
                  }
                  size="small"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cerrar</Button>
          <Button
            variant="contained"
            onClick={handleVerDetalle}
            startIcon={<VisibilityIcon />}
            sx={{
              bgcolor: 'rgb(21, 77, 113)',
              '&:hover': { bgcolor: 'rgb(16, 58, 85)' },
            }}
          >
            Ver Detalle Completo
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}
