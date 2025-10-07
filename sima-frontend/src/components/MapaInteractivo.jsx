import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  Circle,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Person as PersonIcon,
  LocationOn as LocationIcon,
  FilterList as FilterIcon,
  Layers as LayersIcon,
  MyLocation as MyLocationIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getConfiguracionIcono,
  crearIconoSVG,
  MODALIDADES_MAPA,
  esTentativa,
} from '../utils/simbologiaPolicial';

// Corregir iconos por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Configuración de iconos personalizados con simbología policial oficial
const createCustomIcon = (modalidad, estado, descripcion = '') => {
  // Determinar si es tentativa
  const esTentativaDelito = esTentativa(descripcion, modalidad);

  // Obtener configuración específica según modalidad policial
  const config = getConfiguracionIcono(modalidad, esTentativaDelito);

  // Crear SVG personalizado
  const svgString = crearIconoSVG(config);

  return L.divIcon({
    html: `
      <div style="
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      " class="${esTentativaDelito ? 'tentativa' : ''}">
        ${svgString}
      </div>
    `,
    className: `marcador-policial ${config.tipo}`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Componente para centrar el mapa en ubicación actual
function LocationControl({ onLocationFound }) {
  const map = useMap();

  const handleLocationClick = () => {
    map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true,
    });
  };

  useMapEvents({
    locationfound: e => {
      onLocationFound && onLocationFound(e.latlng);
    },
    locationerror: e => {
      console.warn('Error de geolocalización:', e.message);
    },
  });

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        bgcolor: 'white',
        borderRadius: 1,
        boxShadow: 2,
      }}
    >
      <Tooltip title="Mi ubicación">
        <IconButton onClick={handleLocationClick} size="small">
          <MyLocationIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// Componente de leyenda policial
const LeyendaPolicial = ({ visible, onToggle }) => {
  if (!visible) {
    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: 50,
          left: 10,
          zIndex: 1000,
          bgcolor: 'white',
          borderRadius: 1,
          boxShadow: 2,
          p: 1,
        }}
      >
        <Tooltip title="Mostrar leyenda de símbolos">
          <IconButton onClick={onToggle} size="small">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Card
      sx={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        zIndex: 1000,
        maxWidth: 350,
        maxHeight: '60vh',
        overflow: 'auto',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontSize: '1rem', fontWeight: 'bold' }}
          >
            Simbología Policial
          </Typography>
          <IconButton onClick={onToggle} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Robos Agravados */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 'bold', mb: 1, color: '#ff0000' }}
        >
          🔺 ROBOS AGRAVADOS
        </Typography>
        <Box sx={{ ml: 1, mb: 2 }}>
          {Object.entries(MODALIDADES_MAPA)
            .filter(([key, config]) => config.tipo.includes('robo_agravado'))
            .map(([key, config]) => (
              <Box
                key={key}
                sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    mr: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  dangerouslySetInnerHTML={{ __html: crearIconoSVG(config) }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {config.nombre}
                </Typography>
              </Box>
            ))}
        </Box>

        {/* Robos Simples */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 'bold', mb: 1, color: '#0066ff' }}
        >
          🔺 ROBOS SIMPLES
        </Typography>
        <Box sx={{ ml: 1, mb: 2 }}>
          {Object.entries(MODALIDADES_MAPA)
            .filter(
              ([key, config]) =>
                config.tipo.includes('robo_') &&
                !config.tipo.includes('agravado')
            )
            .map(([key, config]) => (
              <Box
                key={key}
                sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    mr: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  dangerouslySetInnerHTML={{ __html: crearIconoSVG(config) }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {config.nombre}
                </Typography>
              </Box>
            ))}
        </Box>

        {/* Hurtos */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 'bold', mb: 1, color: '#00cc00' }}
        >
          ⚫ HURTOS
        </Typography>
        <Box sx={{ ml: 1, mb: 2 }}>
          {Object.entries(MODALIDADES_MAPA)
            .filter(([key, config]) => config.tipo.includes('hurto_'))
            .map(([key, config]) => (
              <Box
                key={key}
                sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    mr: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  dangerouslySetInnerHTML={{ __html: crearIconoSVG(config) }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {config.nombre}
                </Typography>
              </Box>
            ))}
        </Box>

        {/* Estafas */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 'bold', mb: 1, color: '#0066cc' }}
        >
          ♦️ ESTAFAS
        </Typography>
        <Box sx={{ ml: 1 }}>
          {Object.entries(MODALIDADES_MAPA)
            .filter(([key, config]) => config.tipo.includes('estafa_'))
            .map(([key, config]) => (
              <Box
                key={key}
                sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    mr: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  dangerouslySetInnerHTML={{ __html: crearIconoSVG(config) }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {config.nombre}
                </Typography>
              </Box>
            ))}
        </Box>

        <Divider sx={{ my: 1 }} />
        <Typography
          variant="caption"
          sx={{ fontSize: '0.7rem', color: 'text.secondary' }}
        >
          ⚠️ Los símbolos con borde punteado rojo indican tentativas
        </Typography>
      </CardContent>
    </Card>
  );
};

// Componente para búsqueda de direcciones
function SearchControl({ onLocationSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      // Búsqueda básica usando Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTerm + ' Tucumán Argentina'
        )}&limit=5`
      );
      const results = await response.json();

      if (results.length > 0) {
        const location = {
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon),
        };
        onLocationSelect(location);
      }
    } catch (error) {
      console.warn('Error en búsqueda:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        bgcolor: 'white',
        borderRadius: 1,
        boxShadow: 2,
        p: 1,
        display: 'flex',
        gap: 1,
        minWidth: 250,
      }}
    >
      <TextField
        size="small"
        placeholder="Buscar dirección..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && handleSearch()}
        sx={{ flexGrow: 1 }}
      />
      <IconButton size="small" onClick={handleSearch} disabled={isSearching}>
        <SearchIcon />
      </IconButton>
    </Box>
  );
}

// Componente principal del mapa
export default function MapaInteractivo({
  personas = [],
  onPersonaSelect,
  height = '600px',
  showControls = true,
  showHeatmap = false,
  initialCenter = [-26.8083, -65.2176], // Tucumán
  initialZoom = 12,
}) {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [filtros, setFiltros] = useState({
    tipoDelito: 'todos',
    estado: 'todos',
    radio: 0, // km
    fechaDesde: '',
    fechaHasta: '',
  });
  const [showFiltros, setShowFiltros] = useState(false);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [showClusters, setShowClusters] = useState(true);
  const [showHeatZones, setShowHeatZones] = useState(false);
  const [showLeyenda, setShowLeyenda] = useState(false);

  // Filtrar personas según criterios
  const personasFiltradas = useMemo(() => {
    return personas.filter(persona => {
      // Filtro por tipo de delito
      if (
        filtros.tipoDelito !== 'todos' &&
        persona.tipo_delito !== filtros.tipoDelito
      ) {
        return false;
      }

      // Filtro por estado
      if (filtros.estado !== 'todos' && persona.estado !== filtros.estado) {
        return false;
      }

      // Filtro por radio (si está definido)
      if (filtros.radio > 0 && persona.latitud && persona.longitud) {
        const distance = calculateDistance(
          mapCenter[0],
          mapCenter[1],
          persona.latitud,
          persona.longitud
        );
        if (distance > filtros.radio) {
          return false;
        }
      }

      return true;
    });
  }, [personas, filtros, mapCenter]);

  // Calcular distancia entre dos puntos
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calcular zonas de alta concentración
  const zonasCalientes = useMemo(() => {
    if (!showHeatZones || personasFiltradas.length < 3) return [];

    const zonas = [];
    const grid = {};
    const cellSize = 0.01; // Tamaño de celda en grados

    // Agrupar por celdas de grid
    personasFiltradas.forEach(persona => {
      if (persona.latitud && persona.longitud) {
        const cellLat = Math.floor(persona.latitud / cellSize) * cellSize;
        const cellLng = Math.floor(persona.longitud / cellSize) * cellSize;
        const cellKey = `${cellLat},${cellLng}`;

        if (!grid[cellKey]) {
          grid[cellKey] = { count: 0, lat: cellLat, lng: cellLng };
        }
        grid[cellKey].count++;
      }
    });

    // Crear círculos para celdas con más de 2 casos
    Object.values(grid).forEach(cell => {
      if (cell.count > 2) {
        zonas.push({
          center: [cell.lat + cellSize / 2, cell.lng + cellSize / 2],
          radius: Math.min(cell.count * 200, 1000), // metros
          count: cell.count,
        });
      }
    });

    return zonas;
  }, [personasFiltradas, showHeatZones]);

  const handlePersonaClick = persona => {
    setSelectedPersona(persona);
    if (onPersonaSelect) {
      onPersonaSelect(persona);
    }
  };

  const handleLocationSelect = location => {
    setMapCenter([location.lat, location.lng]);
    setMapZoom(15);
  };

  // Panel de filtros
  const renderFiltros = () => (
    <Drawer
      anchor="left"
      open={showFiltros}
      onClose={() => setShowFiltros(false)}
      PaperProps={{
        sx: { width: 320, p: 2 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">Filtros del Mapa</Typography>
        <IconButton onClick={() => setShowFiltros(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Tipo de Delito</InputLabel>
        <Select
          value={filtros.tipoDelito}
          onChange={e =>
            setFiltros(prev => ({ ...prev, tipoDelito: e.target.value }))
          }
        >
          <MenuItem value="todos">Todos los tipos</MenuItem>

          <MenuItem disabled sx={{ fontWeight: 'bold', color: 'red' }}>
            ── ROBOS AGRAVADOS ──
          </MenuItem>
          <MenuItem value="asaltante">🔺 Robo Agravado Asaltante</MenuItem>
          <MenuItem value="asaltante_En_Banda">🔺 Asaltante en Banda</MenuItem>
          <MenuItem value="robo_motovehiculo">🔺 Robo Motovehículo</MenuItem>
          <MenuItem value="robo_automotor">🔺 Robo Automotor</MenuItem>
          <MenuItem value="arriete">🔺 Ariete</MenuItem>
          <MenuItem value="entradera">🔺 Entradera</MenuItem>

          <MenuItem disabled sx={{ fontWeight: 'bold', color: 'blue' }}>
            ── ROBOS SIMPLES ──
          </MenuItem>
          <MenuItem value="arrebato">🔺 Arrebato</MenuItem>
          <MenuItem value="piraña">⚫ Piraña</MenuItem>
          <MenuItem value="clavero_De_Autos">🔺 Clavero de Autos</MenuItem>
          <MenuItem value="boquetero">🔺 Boquetero</MenuItem>
          <MenuItem value="escruche">🔺 Escruche</MenuItem>
          <MenuItem value="rompe_vidrio">🔺 Rompe Vidrio</MenuItem>

          <MenuItem disabled sx={{ fontWeight: 'bold', color: 'green' }}>
            ── HURTOS ──
          </MenuItem>
          <MenuItem value="punga">⚫ Punga</MenuItem>
          <MenuItem value="mechera">⚫ Mechera</MenuItem>
          <MenuItem value="oportunista">⚫ Oportunista</MenuItem>
          <MenuItem value="escalamiento">⚫ Escalamiento</MenuItem>
          <MenuItem value="inhibidor_alarmas">⚫ Inhibidor Alarmas</MenuItem>

          <MenuItem disabled sx={{ fontWeight: 'bold', color: 'darkblue' }}>
            ── ESTAFAS ──
          </MenuItem>
          <MenuItem value="cuento_del_tio">♦️ Cuento del Tío</MenuItem>

          <MenuItem disabled sx={{ fontWeight: 'bold', color: 'orange' }}>
            ── TENTATIVAS ──
          </MenuItem>
          <MenuItem value="tentativa">⚠️ Tentativa</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Estado</InputLabel>
        <Select
          value={filtros.estado}
          onChange={e =>
            setFiltros(prev => ({ ...prev, estado: e.target.value }))
          }
        >
          <MenuItem value="todos">Todos los estados</MenuItem>
          <MenuItem value="activo">Activo</MenuItem>
          <MenuItem value="en_proceso">En Proceso</MenuItem>
          <MenuItem value="resuelto">Resuelto</MenuItem>
          <MenuItem value="archivado">Archivado</MenuItem>
        </Select>
      </FormControl>

      <Typography gutterBottom>
        Radio de búsqueda: {filtros.radio} km
      </Typography>
      <Slider
        value={filtros.radio}
        onChange={(e, value) => setFiltros(prev => ({ ...prev, radio: value }))}
        min={0}
        max={50}
        marks={[
          { value: 0, label: '0 km' },
          { value: 10, label: '10 km' },
          { value: 25, label: '25 km' },
          { value: 50, label: '50 km' },
        ]}
        sx={{ mb: 3 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={showClusters}
            onChange={e => setShowClusters(e.target.checked)}
          />
        }
        label="Agrupar marcadores"
        sx={{ mb: 1 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={showHeatZones}
            onChange={e => setShowHeatZones(e.target.checked)}
          />
        }
        label="Zonas de alta concentración"
        sx={{ mb: 3 }}
      />

      <Button
        variant="outlined"
        fullWidth
        onClick={() =>
          setFiltros({
            tipoDelito: 'todos',
            estado: 'todos',
            radio: 0,
            fechaDesde: '',
            fechaHasta: '',
          })
        }
      >
        Limpiar Filtros
      </Button>
    </Drawer>
  );

  const renderMarkerContent = persona => (
    <Card elevation={0}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
              {persona.apellido}, {persona.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              DNI: {persona.dni}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={
              getConfiguracionIcono(persona.modalidad || persona.tipo_delito)
                .nombre
            }
            color="primary"
            size="small"
            sx={{ mr: 1, mb: 1 }}
          />
          <Chip
            label={persona.estado || 'Sin estado'}
            color={
              persona.estado === 'resuelto'
                ? 'success'
                : persona.estado === 'en_proceso'
                ? 'warning'
                : 'default'
            }
            size="small"
          />
        </Box>

        {persona.direccion && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
            {persona.direccion}
          </Typography>
        )}

        <Button
          variant="contained"
          size="small"
          fullWidth
          startIcon={<VisibilityIcon />}
          onClick={() => handlePersonaClick(persona)}
        >
          Ver Detalle
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ position: 'relative', width: '100%', height }}>
      {/* Controles superiores */}
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 60,
            right: 10,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Tooltip title="Filtros">
            <Badge
              badgeContent={
                Object.values(filtros).filter(
                  v => v !== 'todos' && v !== '' && v !== 0
                ).length || null
              }
              color="primary"
            >
              <IconButton
                onClick={() => setShowFiltros(true)}
                sx={{ bgcolor: 'white', boxShadow: 2 }}
              >
                <FilterIcon />
              </IconButton>
            </Badge>
          </Tooltip>

          <Tooltip title="Leyenda de símbolos">
            <IconButton
              sx={{ bgcolor: 'white', boxShadow: 2 }}
              onClick={() => setShowLeyenda(!showLeyenda)}
            >
              <InfoIcon color={showLeyenda ? 'primary' : 'inherit'} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Capas">
            <IconButton
              sx={{ bgcolor: 'white', boxShadow: 2 }}
              onClick={() => setShowHeatZones(!showHeatZones)}
            >
              <LayersIcon color={showHeatZones ? 'primary' : 'inherit'} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Mapa principal */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* Capa base */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Controles personalizados */}
        <LocationControl onLocationFound={handleLocationSelect} />
        <SearchControl onLocationSelect={handleLocationSelect} />

        {/* Zonas de alta concentración */}
        {showHeatZones &&
          zonasCalientes.map((zona, index) => (
            <Circle
              key={`zona-${index}`}
              center={zona.center}
              radius={zona.radius}
              pathOptions={{
                fillColor: '#ff6b6b',
                fillOpacity: 0.3,
                color: '#ff4757',
                weight: 2,
              }}
            >
              <Popup>
                <Typography variant="body2">
                  <strong>Zona de Alta Actividad</strong>
                  <br />
                  {zona.count} casos registrados
                </Typography>
              </Popup>
            </Circle>
          ))}

        {/* Marcadores de personas */}
        {showClusters ? (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
          >
            {personasFiltradas.map(
              persona =>
                persona.latitud &&
                persona.longitud && (
                  <Marker
                    key={persona.id}
                    position={[persona.latitud, persona.longitud]}
                    icon={createCustomIcon(
                      persona.modalidad || persona.tipo_delito,
                      persona.estado,
                      persona.descripcion
                    )}
                    eventHandlers={{
                      click: () => handlePersonaClick(persona),
                    }}
                  >
                    <Popup maxWidth={300}>{renderMarkerContent(persona)}</Popup>
                  </Marker>
                )
            )}
          </MarkerClusterGroup>
        ) : (
          personasFiltradas.map(
            persona =>
              persona.latitud &&
              persona.longitud && (
                <Marker
                  key={persona.id}
                  position={[persona.latitud, persona.longitud]}
                  icon={createCustomIcon(
                    persona.modalidad || persona.tipo_delito,
                    persona.estado,
                    persona.descripcion
                  )}
                  eventHandlers={{
                    click: () => handlePersonaClick(persona),
                  }}
                >
                  <Popup maxWidth={300}>{renderMarkerContent(persona)}</Popup>
                </Marker>
              )
          )
        )}

        {/* Radio de búsqueda */}
        {filtros.radio > 0 && (
          <Circle
            center={mapCenter}
            radius={filtros.radio * 1000} // convertir km a metros
            pathOptions={{
              fillColor: 'blue',
              fillOpacity: 0.1,
              color: 'blue',
              weight: 2,
              dashArray: '5, 5',
            }}
          />
        )}
      </MapContainer>

      {/* Panel de filtros */}
      {renderFiltros()}

      {/* Leyenda policial */}
      <LeyendaPolicial
        visible={showLeyenda}
        onToggle={() => setShowLeyenda(!showLeyenda)}
      />

      {/* Información de resultados */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          bgcolor: 'white',
          p: 1,
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 1000,
        }}
      >
        <Typography variant="body2">
          Mostrando {personasFiltradas.length} de {personas.length} personas
        </Typography>
      </Box>
    </Box>
  );
}
