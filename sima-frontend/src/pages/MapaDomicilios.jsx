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
  Home as HomeIcon,
  Person as PersonIcon,
  Map as MapIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MapaInteractivo from '../components/MapaInteractivo';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';
import { getConfiguracionIcono } from '../utils/simbologiaPolicial';

export default function MapaDomicilios() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadDomicilios();
  }, []);

  const loadDomicilios = async () => {
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

      // Filtrar solo personas con ubicación del DOMICILIO
      const personasConDomicilio = response.data.items
        .filter(
          persona =>
            persona.latitud &&
            persona.longitud &&
            !isNaN(parseFloat(persona.latitud)) &&
            !isNaN(parseFloat(persona.longitud))
        )
        .map(persona => ({
          ...persona,
          latitud: parseFloat(persona.latitud),
          longitud: parseFloat(persona.longitud),
          tipo_delito: persona.tipo_delito || 'general',
          estado: persona.estado || 'activo',
        }));

      setPersonas(personasConDomicilio);

      if (personasConDomicilio.length > 0) {
        showToast(
          `${personasConDomicilio.length} domicilios cargados en el mapa`,
          'success'
        );
      } else {
        showToast(
          'No se encontraron personas con domicilio registrado',
          'warning'
        );
      }
    } catch (error) {
      console.error('Error al cargar domicilios:', error);
      setError(
        'Error al cargar datos del mapa. Por favor, intente nuevamente.'
      );
      showToast('Error al cargar datos del mapa', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaSelect = persona => {
    setSelectedPersona(persona);
    setShowDialog(true);
  };

  const handleVerDetalle = () => {
    if (selectedPersona) {
      nav(`/personas/${selectedPersona.id}`);
    }
  };

  // Calcular estadísticas
  const estadisticas = {
    total: personas.length,
    conDomicilio: personas.filter(p => p.direccion).length,
    sinDomicilio: personas.filter(p => !p.direccion).length,
    activos: personas.filter(p => p.estado === 'activo').length,
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
              onClick={() => nav('/mapa-hechos')}
              sx={{
                borderColor: 'rgb(21, 77, 113)',
                color: 'rgb(21, 77, 113)',
                '&:hover': {
                  borderColor: 'rgb(16, 58, 85)',
                  bgcolor: 'rgba(21, 77, 113, 0.04)',
                },
              }}
            >
              📍 Ver Mapa de Hechos
            </Button>
          </Box>

          <Typography
            variant="h4"
            sx={{ mb: 1, fontWeight: 'bold', color: 'rgb(21, 77, 113)' }}
          >
            🏠 Mapa de Domicilios
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            Visualización geográfica de los domicilios de las personas
            registradas. Cada marcador representa la residencia o domicilio
            declarado del sujeto.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
              <Button onClick={loadDomicilios} sx={{ ml: 2 }}>
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
                  <HomeIcon
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
                  Domicilios registrados
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
                  <PersonIcon sx={{ fontSize: 30, color: '#4caf50', mr: 1 }} />
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 'bold', color: '#4caf50' }}
                  >
                    {estadisticas.conDomicilio}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Con dirección completa
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
                    {estadisticas.sinDomicilio}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Sin dirección
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
            {personas.length > 0 ? (
              <MapaInteractivo
                personas={personas}
                onPersonaSelect={handlePersonaSelect}
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
                  No hay domicilios con ubicación
                </Typography>
                <Typography variant="body2">
                  Las personas deben tener coordenadas de su domicilio para
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
              Información del Mapa de Domicilios
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Este mapa muestra:</strong>
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                  <li>
                    Ubicaciones de residencia de personas con antecedentes
                  </li>
                  <li>Concentración de domicilios por zona</li>
                  <li>Patrones de distribución geográfica de residencias</li>
                  <li>Zonas con mayor presencia de sujetos registrados</li>
                  <li>Análisis territorial de domicilios declarados</li>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Utilidad operativa:</strong>
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                  <li>Planificación de operativos y allanamientos</li>
                  <li>Identificación de zonas de interés policial</li>
                  <li>Análisis de concentración residencial</li>
                  <li>Búsqueda por proximidad a un domicilio específico</li>
                  <li>Cruce de datos con zonas de alta incidencia delictiva</li>
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
          <PersonIcon sx={{ mr: 1 }} />
          Detalle de Persona
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedPersona && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={selectedPersona.foto_principal}
                  sx={{ width: 60, height: 60, mr: 2 }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedPersona.apellido}, {selectedPersona.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    DNI: {selectedPersona.dni || 'No registrado'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 'bold', mb: 1, color: 'rgb(21, 77, 113)' }}
                >
                  🏠 Domicilio:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Dirección:</strong>{' '}
                  {selectedPersona.direccion || 'No especificada'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Coordenadas:</strong> {selectedPersona.latitud},{' '}
                  {selectedPersona.longitud}
                </Typography>
                {selectedPersona.localidad && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Localidad:</strong> {selectedPersona.localidad}
                  </Typography>
                )}
                {selectedPersona.provincia && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Provincia:</strong> {selectedPersona.provincia}
                  </Typography>
                )}
                {selectedPersona.comisaria && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Comisaría:</strong> {selectedPersona.comisaria}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={
                    getConfiguracionIcono(
                      selectedPersona.modalidad || selectedPersona.tipo_delito
                    ).nombre
                  }
                  color="primary"
                  size="small"
                />
                {/* <Chip
                  label={selectedPersona.estado || 'Sin estado'}
                  color={
                    selectedPersona.estado === 'resuelto'
                      ? 'success'
                      : selectedPersona.estado === 'en_proceso'
                      ? 'warning'
                      : 'default'
                  }
                  size="small"
                /> */}
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
