import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Stack,
  Alert,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CardResult from '../components/CardResult';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useSIMAGridMetrics } from '../utils/gridMetrics';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import InfoIcon from '@mui/icons-material/Info';
import { useToast } from '../components/ToastProvider';

export default function Buscar() {
  const [modo, setModo] = useState('nombre');
  const [campoBusqueda, setCampoBusqueda] = useState('');
  const [texto, setTexto] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const nav = useNavigate();
  const { showToast } = useToast();

  // Integrar métricas específicas de S.I.M.A.
  const gridMetrics = useSIMAGridMetrics();

  // Efecto para actualizar indicador de scroll y métricas
  useEffect(() => {
    const gridElement = document.querySelector('[data-grid="search-results"]');
    if (!gridElement) return;

    const updateScrollIndicator = () => {
      const hasScroll = gridElement.scrollHeight > gridElement.clientHeight;
      gridElement.setAttribute('data-has-scroll', hasScroll.toString());

      // Actualizar métricas cuando cambie el scroll
      if (items.length > 0) {
        setTimeout(() => gridMetrics.analizarGrid(), 100);
      }
    };

    // Verificar al montar y cuando cambie el contenido
    updateScrollIndicator();

    // Observer para cambios en el tamaño
    const resizeObserver = new ResizeObserver(updateScrollIndicator);
    resizeObserver.observe(gridElement);

    // Listener para cambios de ventana
    window.addEventListener('resize', updateScrollIndicator);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollIndicator);
    };
  }, [items, gridMetrics]);

  const opcionesCampos = [
    { value: 'tipo_delito', label: 'Tipo de delito' },
    { value: 'modalidad', label: 'Modalidad' },
    { value: 'nombre', label: 'Nombre' },
    { value: 'apellido', label: 'Apellido' },
    { value: 'dni', label: 'DNI' },
    { value: 'edad', label: 'Edad' },
    { value: 'genero', label: 'Género' },
    { value: 'nacionalidad', label: 'Nacionalidad' },
    { value: 'direccion', label: 'Dirección' },
    { value: 'telefono', label: 'Teléfono' },
    { value: 'comisaria', label: 'Comisaría Jurisdic. del M/A' },
    { value: 'comisaria_hecho', label: 'Comisaría donde sucedió el hecho' },
    { value: 'unidades_regionales', label: 'Unidades Regionales' },
    { value: 'fecha_carga', label: 'Fecha de carga' },
    { value: 'observaciones', label: 'Observaciones' },
  ];

  const fetchAll = async () => {
    try {
      const { data } = await api.get('/personas');
      setItems(data.items || []);
    } catch (e) {
      setError('Error al obtener datos');
    }
  };

  const onBuscar = async () => {
    setError('');

    // Iniciar tracking de métricas S.I.M.A.
    gridMetrics.iniciarBusqueda();

    try {
      let params = {};

      if (modo === 'campo_especifico' && campoBusqueda) {
        params[campoBusqueda] = texto;
      } else if (modo === 'dni') {
        params = { dni: texto };
      } else if (modo === 'comisaria') {
        params = { comisaria: texto };
      } else {
        params = { q: texto };
      }

      const { data } = await api.get('/personas', { params });
      setItems(data.items || []);

      // Finalizar tracking después de renderizado
      setTimeout(() => {
        gridMetrics.finalizarBusqueda();
      }, 100);
    } catch (e) {
      setError('Error en la búsqueda');
      gridMetrics.finalizarBusqueda(); // También trackear errores
    }
  };

  const onExport = async type => {
    try {
      let params = {};

      if (modo === 'campo_especifico' && campoBusqueda) {
        params[campoBusqueda] = texto;
      } else if (modo === 'dni') {
        params = { dni: texto };
      } else if (modo === 'comisaria') {
        params = { comisaria: texto };
      } else {
        params = { q: texto };
      }

      const res = await api.get('/personas', {
        params: { ...params, format: type },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type:
          type === 'csv'
            ? 'text/csv;charset=utf-8;'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personas.${type}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError('No se pudo exportar');
      showToast('No se pudo exportar', 'error');
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <Box
      sx={{
        minHeight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'var(--bg)',
      }}
    >
      <Header showSettings />
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Card className="card">
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 3, mt: 1 }}>
              Buscar Mencionado/Aprehendido
            </Typography>

            {/* Información sobre los delitos específicos */}
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Búsqueda en registros oficiales
                </Typography>
                <Typography variant="body2">
                  Esta búsqueda solo muestra los{' '}
                  <strong>antecedentes delictuales oficiales</strong>{' '}
                  registrados en el sistema. Los delitos específicos de cada
                  sujeto no aparecen en estos resultados y solo son visibles en
                  el perfil individual.
                </Typography>
              </Box>
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={0} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="xl"
                  placeholder="Ingrese su búsqueda"
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ justifyContent: 'flex-end' }}
                >
                  <Button
                    variant="contained"
                    onClick={onBuscar}
                    sx={{
                      height: '56px',
                      width: '160px',
                      fontSize: '1.125rem',
                      bgcolor: '#000',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      '&:hover': {
                        bgcolor: 'rgb(21, 77, 113)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    BUSCAR
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={fetchAll}
                    sx={{
                      height: '56px',
                      width: '160px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                        bgcolor: 'rgb(21, 77, 113)',
                        color: 'white',
                      },
                    }}
                  >
                    MOSTRAR TODAS
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => nav('/dashboard')}
                    sx={{
                      height: '56px',
                      width: '180px',
                      fontSize: '14px',
                      fontWeight: 800,
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      bgcolor: '#1a365d',
                      color: '#ffffff',
                      border: '2px solid #2d5986',
                      boxShadow:
                        '0 3px 10px rgba(26, 54, 93, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                      background:
                        'linear-gradient(135deg, #1a365d 0%, #2d5986 100%)',
                      '&:hover': {
                        bgcolor: '#ffffff',
                        background: '#ffffff',
                        color: '#000000',
                        boxShadow:
                          '0 5px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                        border: '2px solid #1a365d',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                        boxShadow: '0 2px 8px rgba(26, 54, 93, 0.5)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background:
                          'linear-gradient(90deg, #4a90b8, #ffffff, #4a90b8)',
                        borderRadius: '6px 6px 0 0',
                      },
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    VOLVER AL INICIO
                  </Button>
                </Stack>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={4}
              alignItems="center"
              sx={{ mt: -1, mb: 1 }}
            >
              <Grid item xs={12}>
                <RadioGroup
                  row
                  value={modo}
                  onChange={e => setModo(e.target.value)}
                >
                  <FormControlLabel
                    value="nombre"
                    control={<Radio />}
                    label="Nombre/Apellido"
                  />
                  <FormControlLabel
                    value="dni"
                    control={<Radio />}
                    label="DNI"
                  />
                  <FormControlLabel
                    value="comisaria"
                    control={<Radio />}
                    label="Comisaría"
                  />
                  <FormControlLabel
                    value="campo_especifico"
                    control={<Radio />}
                    label="Campo específico"
                  />
                </RadioGroup>
                {modo === 'campo_especifico' && (
                  <FormControl fullWidth sx={{ mt: 0.5 }}>
                    <InputLabel>Seleccionar campo</InputLabel>
                    <Select
                      value={campoBusqueda}
                      onChange={e => setCampoBusqueda(e.target.value)}
                      label="Seleccionar campo"
                    >
                      {opcionesCampos.map(opcion => (
                        <MenuItem key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
            </Grid>
            <Box
              data-grid="search-results"
              data-testid="search-results-grid"
              sx={{
                mt: 2,
                display: 'grid',
                // FIX: Reemplazar altura fija por altura automática responsive para operaciones policiales
                minHeight: '400px', // Altura mínima para UX consistente
                height: 'auto', // Altura automática basada en contenido
                maxHeight: {
                  // Máxima altura responsive por dispositivo
                  xs: 'calc(100vh - 300px)', // Móvil: más espacio vertical para patrullaje
                  sm: 'calc(100vh - 350px)', // Tablet: balance óptimo
                  md: 'calc(100vh - 400px)', // Desktop: altura controlada para comisarías
                  lg: 'calc(100vh - 400px)', // Desktop grande: consistencia
                  xl: 'calc(100vh - 450px)', // Pantallas muy grandes
                },
                overflowY: 'auto', // Scroll vertical cuando necesario
                overflowX: 'hidden', // Prevenir scroll horizontal
                gridTemplateColumns: {
                  // Grid responsive mejorado
                  xs: '1fr', // Móvil: 1 columna para patrullaje
                  sm: 'repeat(auto-fill, minmax(300px, 1fr))', // Tablet: flexible
                  md: 'repeat(auto-fill, minmax(350px, 1fr))', // Desktop: original optimizado
                  lg: 'repeat(auto-fill, minmax(350px, 1fr))', // Consistencia
                },
                gap: 2,
                pr: 1, // Espacio para scrollbar
                // Transición suave para cambios de altura
                transition: 'all 0.3s ease-in-out',
                // Estilos de scrollbar personalizados para S.I.M.A.
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(21, 77, 113, 0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(21, 77, 113, 0.5)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(21, 77, 113, 0.7)',
                  },
                },
                // Indicador visual cuando hay scroll disponible
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background:
                    'linear-gradient(90deg, transparent, rgba(21, 77, 113, 0.3), transparent)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                },
                '&[data-has-scroll="true"]::after': {
                  opacity: 1,
                },
              }}
            >
              {items.length === 0 && (
                <Alert severity="info">No hay resultados para mostrar</Alert>
              )}
              {items.map(it => (
                <CardResult
                  key={it.id}
                  item={it}
                  onDetail={() => nav(`/personas/${it.id}`)}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Box sx={{ mt: 'auto' }}>
        <Footer />
      </Box>
    </Box>
  );
}
