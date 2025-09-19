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

export default function MapaGeneral() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      setLoading(true);
      setError('');

      // Hacer petición con paginación grande para obtener muchos registros
      const response = await api.get('/personas', {
        params: {
          page: 1,
          pageSize: 1000, // Cargar muchas para el mapa
          busqueda: '', // Parámetro vacío para obtener todos
        },
      });

      // Filtrar solo personas con coordenadas válidas
      const personasConUbicacion = response.data.items
        .filter(
          persona =>
            persona.latitud &&
            persona.longitud &&
            !isNaN(parseFloat(persona.latitud)) &&
            !isNaN(parseFloat(persona.longitud))
        )
        .map(persona => ({
          ...persona,
          // Preparar datos para el mapa
          latitud: parseFloat(persona.latitud),
          longitud: parseFloat(persona.longitud),
          // Determinar tipo y estado basado en los antecedentes disponibles
          tipo_delito: persona.tipo_delito || 'general',
          estado: persona.estado || 'activo',
        }));

      setPersonas(personasConUbicacion);

      if (personasConUbicacion.length > 0) {
        showToast(
          `${personasConUbicacion.length} ubicaciones cargadas en el mapa`,
          'success'
        );
      } else {
        showToast(
          'No se encontraron personas con ubicación registrada',
          'warning'
        );
      }
    } catch (error) {
      console.error('Error al cargar personas:', error);
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
    resueltos: personas.filter(p => p.estado === 'resuelto').length,
    enProceso: personas.filter(p => p.estado === 'en_proceso').length,
    activos: personas.filter(p => p.estado === 'activo').length,
    archivados: personas.filter(p => p.estado === 'archivado').length,
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
          <Typography
            variant="h4"
            sx={{ mb: 1, fontWeight: 'bold', color: 'rgb(21, 77, 113)' }}
          >
            🗺️ Mapa General S.I.M.A.
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            Visualización geográfica con simbología policial oficial de Tucumán.
            Use los controles del mapa para filtrar y explorar los datos por
            modalidad delictiva.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
              <Button onClick={loadPersonas} sx={{ ml: 2 }}>
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
                  <LocationOnIcon
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
                  Ubicaciones registradas
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
          </Grid>
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
                  No hay datos de ubicación para mostrar
                </Typography>
                <Typography variant="body2">
                  Las personas deben tener coordenadas registradas para aparecer
                  en el mapa
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Información del Mapa
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Controles disponibles:</strong>
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                  <li>Filtros por modalidad delictiva específica</li>
                  <li>Leyenda de simbología policial oficial</li>
                  <li>Búsqueda por radio de distancia</li>
                  <li>Agrupación automática de marcadores</li>
                  <li>Zonas de alta concentración</li>
                  <li>Mi ubicación actual</li>
                  <li>Búsqueda de direcciones</li>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Simbología policial oficial:</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: '12px solid #ff0000',
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2">
                      Robos Agravados (Triángulos rojos)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: '12px solid #0066ff',
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2">
                      Robos Simples (Triángulos azules)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: '#00cc00',
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2">
                      Hurtos (Círculos verdes)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        backgroundColor: '#0066cc',
                        mr: 1,
                        transform: 'rotate(45deg)',
                        width: 12,
                        height: 12,
                      }}
                    />
                    <Typography variant="body2">
                      Estafas (Rombos azules)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 2,
                        backgroundColor: '#ff0000',
                        mr: 1,
                        borderStyle: 'dashed',
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}
                    >
                      Borde punteado rojo = Tentativas
                    </Typography>
                  </Box>
                </Box>
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
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Dirección:</strong>{' '}
                  {selectedPersona.direccion || 'No especificada'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Coordenadas:</strong> {selectedPersona.latitud},{' '}
                  {selectedPersona.longitud}
                </Typography>
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
                <Chip
                  label={selectedPersona.estado || 'Sin estado'}
                  color={
                    selectedPersona.estado === 'resuelto'
                      ? 'success'
                      : selectedPersona.estado === 'en_proceso'
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
