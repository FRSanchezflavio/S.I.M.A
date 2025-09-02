import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Box,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  Drawer,
  Paper,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Slider,
  CircularProgress,
} from '@mui/material';
import {
  Map as MapIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  MyLocation as MyLocationIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  FileDownload as FileDownloadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MapComponent from '../components/MapComponent';
import LocationSelector from '../components/LocationSelector';
import geoService from '../services/geoService';
import { useToast } from '../components/ToastProvider';

/**
 * Página de visualización geográfica del sistema S.I.M.A.
 */
export default function MapasPage() {
  const [mapData, setMapData] = useState({ personas: [], registros: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Estados para filtros
  const [filters, setFilters] = useState({
    tipo_delito: '',
    modalidad: '',
    comisaria: '',
    fecha_desde: '',
    fecha_hasta: '',
    incluir_personas: true,
    incluir_registros: true,
    cerca_lat: null,
    cerca_lng: null,
    radio: 1, // km
  });

  // Estados para el mapa
  const [mapCenter, setMapCenter] = useState({
    latitude: -26.8241,
    longitude: -65.2226, // Tucumán
  });
  const [mapZoom, setMapZoom] = useState(13);

  const { showToast } = useToast();

  // Cargar datos inicial
  useEffect(() => {
    loadMapData();
    loadStatistics();
  }, []);

  // Recargar datos cuando cambian los filtros
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadMapData();
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [filters]);

  // Cargar datos del mapa
  const loadMapData = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await geoService.getMapData(filters);

      if (data.success) {
        setMapData({
          personas: data.data.personas || [],
          registros: data.data.registros || [],
        });
      } else {
        setError('Error cargando datos del mapa');
      }
    } catch (err) {
      setError(err.message || 'Error cargando datos del mapa');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStatistics = async () => {
    try {
      const stats = await geoService.getGeoStatistics();
      if (stats.success) {
        setStatistics(stats.data);
      }
    } catch (err) {
      console.warn('Error cargando estadísticas:', err);
    }
  };

  // Manejar cambio de filtro
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      tipo_delito: '',
      modalidad: '',
      comisaria: '',
      fecha_desde: '',
      fecha_hasta: '',
      incluir_personas: true,
      incluir_registros: true,
      cerca_lat: null,
      cerca_lng: null,
      radio: 1,
    });
  };

  // Buscar por ubicación
  const handleLocationSearch = location => {
    setFilters(prev => ({
      ...prev,
      cerca_lat: location.latitude,
      cerca_lng: location.longitude,
    }));

    setMapCenter({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setMapZoom(15);

    showToast('Búsqueda por ubicación aplicada', 'success');
  };

  // Obtener ubicación actual
  const handleGetCurrentLocation = async () => {
    try {
      const location = await geoService.getCurrentLocation();
      setMapCenter({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setMapZoom(15);
      showToast('Centrado en tu ubicación', 'success');
    } catch (err) {
      showToast(err.message || 'Error obteniendo ubicación', 'error');
    }
  };

  // Exportar datos
  const handleExport = async format => {
    try {
      setLoading(true);
      const filename = `sima_mapa_${new Date().toISOString().split('T')[0]}`;

      const blob = await geoService.exportQGIS(format, filters, filename);

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${filename}.${format === 'shapefile' ? 'zip' : 'geojson'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`Exportación ${format} completada`, 'success');
      setShowExportDialog(false);
    } catch (err) {
      showToast(err.message || 'Error en exportación', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manejar clic en marcador
  const handleMarkerClick = (item, type) => {
    let message = '';
    if (type === 'persona') {
      message = `${item.nombre} ${item.apellido} - DNI: ${item.dni}`;
    } else {
      message = `${item.tipo_delito} - ${item.persona_nombre}`;
    }
    showToast(message, 'info');
  };

  return (
    <>
      <Header />
      <Container maxWidth={false} sx={{ mt: 3, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              <MapIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
              Visualización Geográfica S.I.M.A.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Mapa interactivo con personas registradas y registros delictuales
              georreferenciados
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Tooltip title="Mi ubicación">
              <IconButton onClick={handleGetCurrentLocation} color="primary">
                <MyLocationIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Filtros">
              <IconButton
                onClick={() => setShowFilters(true)}
                color={
                  Object.values(filters).some(v => v && v !== true)
                    ? 'secondary'
                    : 'default'
                }
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Buscar por ubicación">
              <IconButton
                onClick={() => setShowLocationSearch(true)}
                color="primary"
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Exportar">
              <IconButton
                onClick={() => setShowExportDialog(true)}
                color="success"
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Estadísticas">
              <IconButton onClick={() => setShowStatistics(true)} color="info">
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                loadMapData();
                loadStatistics();
              }}
              disabled={loading}
            >
              Actualizar
            </Button>
          </Box>
        </Box>

        {/* Chips de filtros activos */}
        {Object.entries(filters).some(
          ([key, value]) =>
            value &&
            value !== true &&
            key !== 'incluir_personas' &&
            key !== 'incluir_registros'
        ) && (
          <Box mb={2} display="flex" gap={1} flexWrap="wrap">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ alignSelf: 'center' }}
            >
              Filtros activos:
            </Typography>
            {filters.tipo_delito && (
              <Chip
                size="small"
                label={`Delito: ${filters.tipo_delito}`}
                onDelete={() => handleFilterChange('tipo_delito', '')}
              />
            )}
            {filters.modalidad && (
              <Chip
                size="small"
                label={`Modalidad: ${filters.modalidad}`}
                onDelete={() => handleFilterChange('modalidad', '')}
              />
            )}
            {filters.comisaria && (
              <Chip
                size="small"
                label={`Comisaría: ${filters.comisaria}`}
                onDelete={() => handleFilterChange('comisaria', '')}
              />
            )}
            {filters.cerca_lat && filters.cerca_lng && (
              <Chip
                size="small"
                label={`Radio: ${filters.radio} km`}
                onDelete={() => {
                  handleFilterChange('cerca_lat', null);
                  handleFilterChange('cerca_lng', null);
                }}
              />
            )}
            <Button size="small" onClick={clearFilters}>
              Limpiar todos
            </Button>
          </Box>
        )}

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Resumen de datos */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PersonIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">
                      {mapData.personas?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Personas georreferenciadas
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <SecurityIcon color="error" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">
                      {mapData.registros?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hechos delictuales georreferenciados
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <MapIcon color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">
                      {(mapData.personas?.length || 0) +
                        (mapData.registros?.length || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total puntos en mapa
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Mapa principal */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <MapComponent
              personas={mapData.personas}
              registros={mapData.registros}
              center={mapCenter}
              zoom={mapZoom}
              height={600}
              showCurrentLocation={false}
              showLegend={true}
              showControls={true}
              interactive={true}
              onMarkerClick={handleMarkerClick}
              filters={filters}
              loading={loading}
            />
          </CardContent>
        </Card>
      </Container>
      <Footer />

      {/* Drawer de filtros */}
      <Drawer
        anchor="right"
        open={showFilters}
        onClose={() => setShowFilters(false)}
        PaperProps={{ sx: { width: 400, p: 2 } }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6">Filtros</Typography>
          <IconButton onClick={() => setShowFilters(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box display="flex" flexDirection="column" gap={3}>
          {/* Filtros de capas */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Capas a mostrar
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.incluir_personas}
                  onChange={e =>
                    handleFilterChange('incluir_personas', e.target.checked)
                  }
                />
              }
              label="Personas registradas"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.incluir_registros}
                  onChange={e =>
                    handleFilterChange('incluir_registros', e.target.checked)
                  }
                />
              }
              label="Registros delictuales"
            />
          </Box>

          {/* Filtros de contenido */}
          <TextField
            label="Tipo de delito"
            value={filters.tipo_delito}
            onChange={e => handleFilterChange('tipo_delito', e.target.value)}
            fullWidth
          />

          <TextField
            label="Modalidad"
            value={filters.modalidad}
            onChange={e => handleFilterChange('modalidad', e.target.value)}
            fullWidth
          />

          <TextField
            label="Comisaría"
            value={filters.comisaria}
            onChange={e => handleFilterChange('comisaria', e.target.value)}
            fullWidth
          />

          {/* Filtros de fecha */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Rango de fechas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Desde"
                  type="date"
                  value={filters.fecha_desde}
                  onChange={e =>
                    handleFilterChange('fecha_desde', e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Hasta"
                  type="date"
                  value={filters.fecha_hasta}
                  onChange={e =>
                    handleFilterChange('fecha_hasta', e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>

          {/* Filtro de proximidad */}
          {filters.cerca_lat && filters.cerca_lng && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Radio de búsqueda: {filters.radio} km
              </Typography>
              <Slider
                value={filters.radio}
                onChange={(e, value) => handleFilterChange('radio', value)}
                min={0.1}
                max={10}
                step={0.1}
                marks={[
                  { value: 0.5, label: '500m' },
                  { value: 1, label: '1km' },
                  { value: 5, label: '5km' },
                  { value: 10, label: '10km' },
                ]}
                valueLabelDisplay="auto"
              />
              <Button
                fullWidth
                color="warning"
                onClick={() => {
                  handleFilterChange('cerca_lat', null);
                  handleFilterChange('cerca_lng', null);
                }}
              >
                Quitar filtro de proximidad
              </Button>
            </Box>
          )}

          {/* Botones de acción */}
          <Box display="flex" gap={1}>
            <Button fullWidth variant="outlined" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setShowFilters(false)}
            >
              Aplicar
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Dialog de exportación */}
      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      >
        <DialogTitle>Exportar Datos Geoespaciales</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Exportar los datos visibles en el mapa a formatos compatibles con
            QGIS y otros SIG.
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExport('geojson')}
              disabled={loading}
            >
              Exportar como GeoJSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExport('shapefile')}
              disabled={loading}
            >
              Exportar como Shapefile (ZIP)
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: 'block' }}
          >
            Los archivos incluirán todos los datos filtrados actualmente
            visibles en el mapa.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Selector de ubicación para búsqueda */}
      <LocationSelector
        open={showLocationSearch}
        onClose={() => setShowLocationSearch(false)}
        onLocationSelected={handleLocationSearch}
        title="Buscar por Ubicación"
        showAddressInput={true}
        allowManualSelection={true}
      />

      {/* Dialog de estadísticas */}
      <Dialog
        open={showStatistics}
        onClose={() => setShowStatistics(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Estadísticas Geoespaciales</DialogTitle>
        <DialogContent>
          {statistics ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Personas Registradas
                    </Typography>
                    <Typography variant="body2">
                      Total: {statistics.personas?.total || 0}
                    </Typography>
                    <Typography variant="body2">
                      Geocodificadas: {statistics.personas?.geocodificadas || 0}
                      ({statistics.personas?.porcentaje_geocodificado || 0}%)
                    </Typography>
                    <Typography variant="body2">
                      Verificadas: {statistics.personas?.verificadas || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Registros Delictuales
                    </Typography>
                    <Typography variant="body2">
                      Total: {statistics.registros?.total || 0}
                    </Typography>
                    <Typography variant="body2">
                      Geocodificados:{' '}
                      {statistics.registros?.geocodificados || 0}(
                      {statistics.registros?.porcentaje_geocodificado || 0}%)
                    </Typography>
                    <Typography variant="body2">
                      Verificados: {statistics.registros?.verificados || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {statistics.top_localidades?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Top Localidades
                      </Typography>
                      <List dense>
                        {statistics.top_localidades
                          .slice(0, 5)
                          .map((item, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={item.localidad}
                                secondary={`${item.cantidad} registros`}
                              />
                            </ListItem>
                          ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {statistics.top_delitos?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Top Tipos de Delito
                      </Typography>
                      <List dense>
                        {statistics.top_delitos
                          .slice(0, 5)
                          .map((item, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={item.tipo_delito}
                                secondary={`${item.cantidad} casos`}
                              />
                            </ListItem>
                          ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          ) : (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatistics(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
