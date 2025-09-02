import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  Layers as LayersIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';

// Configurar íconos personalizados para los marcadores
const createCustomIcon = (color, type) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color}; 
        width: 25px; 
        height: 25px; 
        border-radius: 50%; 
        border: 2px solid white; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-size: 12px;
        color: white;
      ">
        ${type === 'persona' ? '👤' : '🚨'}
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -12.5],
  });
};

// Iconos para diferentes tipos
const ICONS = {
  persona: createCustomIcon('#2196F3', 'persona'),
  registro: createCustomIcon('#F44336', 'registro'),
  current: createCustomIcon('#4CAF50', 'current'),
};

// Componente para eventos del mapa
const MapEventHandler = ({ onLocationSelect, onMapReady }) => {
  const map = useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        });
      }
    },
    ready() {
      // Forzar actualización de tamaño del mapa después de la inicialización
      setTimeout(() => {
        map.invalidateSize();
        if (onMapReady) {
          onMapReady(map);
        }
      }, 100);
    },
  });

  return null;
};

// Componente para centrar el mapa en una ubicación
const MapCenterController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center.latitude && center.longitude) {
      map.setView([center.latitude, center.longitude], zoom || map.getZoom());

      // Asegurar que el mapa se redimensione correctamente
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [center, zoom, map]);

  return null;
};

/**
 * Componente de mapa interactivo con Leaflet
 */
const MapComponent = ({
  personas = [],
  registros = [],
  center = { latitude: -26.8241, longitude: -65.2226 }, // Tucumán por defecto
  zoom = 13,
  height = 400,
  allowLocationSelect = false,
  onLocationSelect,
  onMapReady,
  showCurrentLocation = false,
  currentLocation = null,
  showLegend = true,
  showControls = true,
  interactive = true,
  className = '',
  onMarkerClick,
  filters = {},
  loading = false,
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [showLayersDialog, setShowLayersDialog] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    personas: true,
    registros: true,
    current: true,
  });
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef();

  // Efecto para manejar el redimensionado del mapa
  useEffect(() => {
    if (mapReady && mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [mapReady, height]);

  // Filtrar datos según los filtros activos
  const filteredPersonas = personas.filter(persona => {
    if (!visibleLayers.personas) return false;

    if (filters.tipo_delito && persona.tipo_delito !== filters.tipo_delito)
      return false;
    if (filters.modalidad && persona.modalidad !== filters.modalidad)
      return false;
    if (
      filters.comisaria &&
      !persona.comisaria
        ?.toLowerCase()
        .includes(filters.comisaria.toLowerCase())
    )
      return false;

    return true;
  });

  const filteredRegistros = registros.filter(registro => {
    if (!visibleLayers.registros) return false;

    if (filters.tipo_delito && registro.tipo_delito !== filters.tipo_delito)
      return false;

    return true;
  });

  // Manejar clic en marcador
  const handleMarkerClick = (item, type) => {
    setSelectedMarker({ ...item, type });
    if (onMarkerClick) {
      onMarkerClick(item, type);
    }
  };

  // Obtener ubicación actual del usuario
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          if (mapRef.current) {
            mapRef.current.setView([location.latitude, location.longitude], 16);
          }

          if (onLocationSelect) {
            onLocationSelect(location);
          }
        },
        error => {
          console.error('Error obteniendo ubicación:', error);
        }
      );
    }
  };

  // Toggle de capas
  const toggleLayer = layerName => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  };

  // Formatear información del popup
  const formatPersonaInfo = persona => (
    <div>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 'bold', color: '#1976d2' }}
      >
        👤 {persona.nombre} {persona.apellido}
      </Typography>
      <Typography variant="body2">DNI: {persona.dni}</Typography>
      {persona.edad && (
        <Typography variant="body2">Edad: {persona.edad} años</Typography>
      )}
      {persona.tipo_delito && (
        <Chip
          label={persona.tipo_delito}
          size="small"
          color="primary"
          sx={{ mt: 1, mr: 1 }}
        />
      )}
      {persona.modalidad && (
        <Chip
          label={persona.modalidad}
          size="small"
          color="secondary"
          sx={{ mt: 1 }}
        />
      )}
      {persona.direccion_completa && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          📍 {persona.direccion_completa}
        </Typography>
      )}
      {persona.comisaria && (
        <Typography variant="body2">
          🏢 Comisaría: {persona.comisaria}
        </Typography>
      )}
    </div>
  );

  const formatRegistroInfo = registro => (
    <div>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 'bold', color: '#d32f2f' }}
      >
        🚨 {registro.tipo_delito}
      </Typography>
      <Typography variant="body2">
        Involucrado: {registro.persona_nombre}
      </Typography>
      <Typography variant="body2">DNI: {registro.persona_dni}</Typography>
      {registro.lugar_delito_texto && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          📍 {registro.lugar_delito_texto}
        </Typography>
      )}
      {registro.hecho_direccion && (
        <Typography variant="body2">🏠 {registro.hecho_direccion}</Typography>
      )}
      {registro.estado && (
        <Chip
          label={registro.estado}
          size="small"
          color="error"
          sx={{ mt: 1 }}
        />
      )}
      {registro.created_at && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          📅 {new Date(registro.created_at).toLocaleDateString('es-AR')}
        </Typography>
      )}
    </div>
  );

  if (!center || !center.latitude || !center.longitude) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #ddd',
          borderRadius: 1,
        }}
      >
        <Typography color="text.secondary">Configurando mapa...</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} className={className}>
      <Box position="relative" height={height}>
        {loading && (
          <Box
            position="absolute"
            top={10}
            left={10}
            zIndex={1000}
            display="flex"
            alignItems="center"
            gap={1}
            bgcolor="rgba(255,255,255,0.9)"
            px={2}
            py={1}
            borderRadius={1}
          >
            <CircularProgress size={20} />
            <Typography variant="body2">Cargando datos...</Typography>
          </Box>
        )}

        <MapContainer
          center={[center.latitude, center.longitude]}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={interactive}
          dragging={interactive}
          touchZoom={interactive}
          doubleClickZoom={interactive}
          boxZoom={interactive}
          keyboard={interactive}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEventHandler
            onLocationSelect={allowLocationSelect ? onLocationSelect : null}
            onMapReady={map => {
              mapRef.current = map;
              setMapReady(true);
              // Llamar al callback externo si existe
              if (onMapReady) {
                onMapReady(map);
              }
            }}
          />

          <MapCenterController center={center} zoom={zoom} />

          {/* Marcadores de personas */}
          {filteredPersonas.map(
            persona =>
              persona.domicilio_latitud &&
              persona.domicilio_longitud && (
                <Marker
                  key={`persona-${persona.id}`}
                  position={[
                    parseFloat(persona.domicilio_latitud),
                    parseFloat(persona.domicilio_longitud),
                  ]}
                  icon={ICONS.persona}
                  eventHandlers={{
                    click: () => handleMarkerClick(persona, 'persona'),
                  }}
                >
                  <Popup maxWidth={300}>{formatPersonaInfo(persona)}</Popup>
                </Marker>
              )
          )}

          {/* Marcadores de registros */}
          {filteredRegistros.map(
            registro =>
              registro.hecho_latitud &&
              registro.hecho_longitud && (
                <Marker
                  key={`registro-${registro.id}`}
                  position={[
                    parseFloat(registro.hecho_latitud),
                    parseFloat(registro.hecho_longitud),
                  ]}
                  icon={ICONS.registro}
                  eventHandlers={{
                    click: () => handleMarkerClick(registro, 'registro'),
                  }}
                >
                  <Popup maxWidth={300}>{formatRegistroInfo(registro)}</Popup>
                </Marker>
              )
          )}

          {/* Marcador de ubicación actual */}
          {showCurrentLocation && currentLocation && (
            <Marker
              position={[currentLocation.latitude, currentLocation.longitude]}
              icon={ICONS.current}
            >
              <Popup>
                <Typography variant="subtitle2" sx={{ color: '#4CAF50' }}>
                  📍 Tu ubicación
                </Typography>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Controles del mapa */}
        {showControls && (
          <Box
            position="absolute"
            top={10}
            right={10}
            zIndex={1000}
            display="flex"
            flexDirection="column"
            gap={1}
          >
            {/* Botón de ubicación actual */}
            <Tooltip title="Mi ubicación">
              <IconButton
                size="small"
                onClick={handleGetCurrentLocation}
                sx={{
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <MyLocationIcon />
              </IconButton>
            </Tooltip>

            {/* Botón de capas */}
            <Tooltip title="Capas">
              <IconButton
                size="small"
                onClick={() => setShowLayersDialog(true)}
                sx={{
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <LayersIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Leyenda */}
        {showLegend && (
          <Box
            position="absolute"
            bottom={10}
            left={10}
            zIndex={1000}
            bgcolor="rgba(255,255,255,0.95)"
            p={1}
            borderRadius={1}
            boxShadow={1}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 'bold', display: 'block' }}
            >
              Leyenda
            </Typography>
            <Box display="flex" alignItems="center" gap={1} my={0.5}>
              <Box
                width={12}
                height={12}
                borderRadius="50%"
                bgcolor="#2196F3"
              />
              <Typography variant="caption">
                Personas ({filteredPersonas.length})
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                width={12}
                height={12}
                borderRadius="50%"
                bgcolor="#F44336"
              />
              <Typography variant="caption">
                Hechos ({filteredRegistros.length})
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Dialog de capas */}
      <Dialog
        open={showLayersDialog}
        onClose={() => setShowLayersDialog(false)}
      >
        <DialogTitle>
          Capas del Mapa
          <IconButton
            onClick={() => setShowLayersDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemText
                primary="Personas Registradas"
                secondary={`${filteredPersonas.length} elementos visibles`}
              />
              <ListItemSecondaryAction>
                <Button
                  variant={visibleLayers.personas ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => toggleLayer('personas')}
                  startIcon={<PersonIcon />}
                >
                  {visibleLayers.personas ? 'Ocultar' : 'Mostrar'}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Registros Delictuales"
                secondary={`${filteredRegistros.length} elementos visibles`}
              />
              <ListItemSecondaryAction>
                <Button
                  variant={visibleLayers.registros ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => toggleLayer('registros')}
                  startIcon={<SecurityIcon />}
                >
                  {visibleLayers.registros ? 'Ocultar' : 'Mostrar'}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLayersDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MapComponent;
