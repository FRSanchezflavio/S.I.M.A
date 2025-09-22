import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Circle,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Alert,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Layers,
  Warning,
  Timeline,
  MyLocation,
  FilterList,
  Refresh,
  Download,
  Security,
  Group,
  TrendingUp,
  Warning as ConflictIcon,
} from '@mui/icons-material';
import SafeDatePicker from '../SafeDatePicker'; // Componente de fecha seguro

// Configuración de iconos para Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapaTerritorialBandas = ({
  bandasSeleccionadas = [],
  altura = 600,
  modoEdicion = 'visualizar',
  bandaEditando = null,
  onTerritorioModificado = null,
  mostrarPanelControl = false,
  esIntegracionDashboard = false,
}) => {
  const mapRef = useRef();
  const drawControlRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const [territorioBandas, setTerritorioBandas] = useState([]);
  const [actividadesRecientes, setActividadesRecientes] = useState([]);
  const [conflictosTeritoriales, setConflictosTeritoriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [territorioTemporal, setTerritorioTemporal] = useState(null);

  // Estados de configuración
  const [configuracion, setConfiguracion] = useState({
    mostrarTerritorios: true,
    mostrarActividades: true,
    mostrarConflictos: true,
    mostrarHeatmap: false,
    mostrarRutas: false,
    filtrarPorFecha: false,
    fechaDesde: null,
    fechaHasta: null,
    nivelPeligrosidadMin: 1,
    tiposActividad: [],
    bandasFiltradas: [],
  });

  // Estados de UI
  const [dialogoInfo, setDialogoInfo] = useState(false);
  const [territorioSeleccionado, setTerritorioSeleccionado] = useState(null);
  const [dialogoConflictos, setDialogoConflictos] = useState(false);
  const [analisisTerritorial, setAnalisisTerritorial] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatosTerritoriales();
  }, [configuracion.fechaDesde, configuracion.fechaHasta, bandasSeleccionadas]);

  const cargarDatosTerritoriales = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar análisis territorial
      const paramsAnalisis = new URLSearchParams({
        incluir_conflictos: 'true',
        incluir_expansion: 'true',
      });

      const responseAnalisis = await fetch(
        `/api/inteligencia/bandas/analisis/territorial?${paramsAnalisis}`
      );
      if (!responseAnalisis.ok)
        throw new Error('Error al cargar análisis territorial');

      const datosAnalisis = await responseAnalisis.json();
      setTerritorioBandas(datosAnalisis.coverage_map);
      setConflictosTeritoriales(datosAnalisis.conflictos_territoriales);
      setAnalisisTerritorial(datosAnalisis);

      // Cargar mapa de calor de actividades
      const paramsHeatmap = new URLSearchParams({
        fecha_desde:
          configuracion.fechaDesde?.toISOString() ||
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        fecha_hasta:
          configuracion.fechaHasta?.toISOString() || new Date().toISOString(),
      });

      if (configuracion.tiposActividad.length > 0) {
        paramsHeatmap.append(
          'tipos_actividad',
          configuracion.tiposActividad.join(',')
        );
      }

      const responseHeatmap = await fetch(
        `/api/inteligencia/bandas/visualizacion/mapa-calor?${paramsHeatmap}`
      );
      if (!responseHeatmap.ok)
        throw new Error('Error al cargar datos de calor');

      const datosHeatmap = await responseHeatmap.json();
      setActividadesRecientes(datosHeatmap.puntos_individuales);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando datos territoriales:', err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // FUNCIONES DE EDICIÓN TERRITORIAL
  // ===============================

  // Configurar herramientas de edición según el modo
  const configurarEdicionTerritorial = (map, modo) => {
    // Limpiar controles anteriores
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    // Crear grupo de elementos dibujados si no existe
    if (!drawnItemsRef.current) {
      drawnItemsRef.current = new L.FeatureGroup();
      map.addLayer(drawnItemsRef.current);
    }

    // Configuración según modo de edición
    const opcionesEdicion = {
      position: 'topleft',
      draw: {
        polygon: modo === 'redefinir',
        rectangle: false,
        circle: modo === 'expandir',
        marker: false,
        polyline: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: modo === 'contraer',
        edit: modo === 'expandir' || modo === 'contraer',
      },
    };

    // Solo agregar controles si no estamos en modo visualizar
    if (modo !== 'visualizar') {
      drawControlRef.current = new L.Control.Draw(opcionesEdicion);
      map.addControl(drawControlRef.current);

      // Event listeners para dibujo
      map.on(L.Draw.Event.CREATED, handleTerritorioCreado);
      map.on(L.Draw.Event.EDITED, handleTerritorioEditado);
      map.on(L.Draw.Event.DELETED, handleTerritorioEliminado);
    }

    return {
      drawnItems: drawnItemsRef.current,
      drawControl: drawControlRef.current,
    };
  };

  // Manejar creación de nuevo territorio
  const handleTerritorioCreado = e => {
    const layer = e.layer;
    const geoJSON = layer.toGeoJSON();

    if (bandaEditando && onTerritorioModificado) {
      const nuevoPoligono = geoJSON.geometry.coordinates[0];
      const centro = calcularCentroPoligono(nuevoPoligono);
      const radio = calcularRadioPoligono(nuevoPoligono);

      setTerritorioTemporal({
        banda_id: bandaEditando.banda_id,
        nuevoPoligono,
        nuevoCentro: centro,
        nuevoRadio: radio,
        layer,
      });

      onTerritorioModificado({
        banda_id: bandaEditando.banda_id,
        nuevoPoligono,
        nuevoCentro: centro,
        nuevoRadio: radio,
        tipo: 'creado',
      });
    }

    drawnItemsRef.current.addLayer(layer);
  };

  // Manejar edición de territorio existente
  const handleTerritorioEditado = e => {
    const layers = e.layers;

    layers.eachLayer(layer => {
      const geoJSON = layer.toGeoJSON();

      if (bandaEditando && onTerritorioModificado) {
        const nuevoPoligono = geoJSON.geometry.coordinates[0];
        const centro = calcularCentroPoligono(nuevoPoligono);
        const radio = calcularRadioPoligono(nuevoPoligono);

        onTerritorioModificado({
          banda_id: bandaEditando.banda_id,
          nuevoPoligono,
          nuevoCentro: centro,
          nuevoRadio: radio,
          tipo: 'editado',
        });
      }
    });
  };

  // Manejar eliminación de territorio
  const handleTerritorioEliminado = e => {
    if (bandaEditando && onTerritorioModificado) {
      onTerritorioModificado({
        banda_id: bandaEditando.banda_id,
        nuevoPoligono: null,
        tipo: 'eliminado',
      });
    }
  };

  // Calcular centro de un polígono
  const calcularCentroPoligono = poligono => {
    if (!poligono || poligono.length === 0) return [0, 0];

    const lat =
      poligono.reduce((sum, coord) => sum + coord[1], 0) / poligono.length;
    const lng =
      poligono.reduce((sum, coord) => sum + coord[0], 0) / poligono.length;

    return [lat, lng];
  };

  // Calcular radio aproximado de un polígono
  const calcularRadioPoligono = poligono => {
    if (!poligono || poligono.length === 0) return 0;

    const centro = calcularCentroPoligono(poligono);
    let maxDistancia = 0;

    poligono.forEach(coord => {
      const distancia = Math.sqrt(
        Math.pow(coord[1] - centro[0], 2) + Math.pow(coord[0] - centro[1], 2)
      );
      maxDistancia = Math.max(maxDistancia, distancia);
    });

    // Convertir grados a kilómetros aproximadamente
    return Math.round(maxDistancia * 111 * 100) / 100;
  };

  // Cargar territorio de banda para edición
  const cargarTerritorioParaEdicion = banda => {
    if (!drawnItemsRef.current || !banda.poligonos_territorio) return;

    // Limpiar elementos anteriores
    drawnItemsRef.current.clearLayers();

    // Agregar polígonos existentes al grupo editable
    banda.poligonos_territorio.forEach(poligono => {
      const layer = L.polygon(poligono.map(coord => [coord[1], coord[0]]));
      drawnItemsRef.current.addLayer(layer);
    });
  };

  // useEffect para manejar cambios en modo de edición
  useEffect(() => {
    if (mapRef.current && modoEdicion) {
      const map = mapRef.current;
      configurarEdicionTerritorial(map, modoEdicion);
    }
  }, [modoEdicion]);

  // useEffect para cargar territorio cuando cambia la banda a editar
  useEffect(() => {
    if (bandaEditando && modoEdicion !== 'visualizar') {
      cargarTerritorioParaEdicion(bandaEditando);
    }
  }, [bandaEditando, modoEdicion]);

  const crearIconoBanda = banda => {
    const colorPeligrosidad = obtenerColorPeligrosidad(banda.peligrosidad);
    return L.divIcon({
      className: 'banda-marker',
      html: `
        <div style="
          background: ${banda.color || colorPeligrosidad};
          border: 2px solid #fff;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">
          ${banda.nivel_control || '?'}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const crearIconoActividad = actividad => {
    const iconosActividad = {
      operacion: '🔫',
      reunion: '👥',
      transaccion: '💰',
      vigilancia: '👁️',
      conflicto: '⚡',
      expansion: '📈',
    };

    return L.divIcon({
      className: 'actividad-marker',
      html: `
        <div style="
          background: ${actividad.color || '#ff6b6b'};
          border: 1px solid #fff;
          border-radius: 3px;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
        ">
          ${iconosActividad[actividad.tipo] || '📍'}
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
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

  const obtenerColorConflicto = intensidad => {
    if (intensidad >= 0.8) return '#e74c3c'; // Rojo - Conflicto alto
    if (intensidad >= 0.6) return '#e67e22'; // Naranja - Conflicto medio
    if (intensidad >= 0.4) return '#f39c12'; // Amarillo - Conflicto bajo
    return '#3498db'; // Azul - Sin conflicto
  };

  const calcularCentroMapa = () => {
    if (territorioBandas.length === 0) {
      return [-26.8241, -65.2226]; // Tucumán por defecto
    }

    const latSum = territorioBandas.reduce(
      (sum, banda) => sum + banda.centro[0],
      0
    );
    const lngSum = territorioBandas.reduce(
      (sum, banda) => sum + banda.centro[1],
      0
    );

    return [latSum / territorioBandas.length, lngSum / territorioBandas.length];
  };

  const mostrarInfoTerritorio = banda => {
    setTerritorioSeleccionado(banda);
    setDialogoInfo(true);
  };

  const mostrarAnalisisConflictos = () => {
    setDialogoConflictos(true);
  };

  const ComponenteTerritorios = () => (
    <LayerGroup>
      {territorioBandas
        .filter(
          banda =>
            !configuracion.bandasFiltradas.length ||
            configuracion.bandasFiltradas.includes(banda.banda_id)
        )
        .filter(
          banda => banda.nivel_control >= configuracion.nivelPeligrosidadMin
        )
        .map(banda => (
          <React.Fragment key={banda.banda_id}>
            {/* Círculo de influencia */}
            <Circle
              center={banda.centro}
              radius={banda.radio_km * 1000} // Convertir km a metros
              pathOptions={{
                color: banda.color,
                fillColor: banda.color,
                fillOpacity: 0.1,
                weight: 2,
                opacity: 0.6,
              }}
              eventHandlers={{
                click: () => mostrarInfoTerritorio(banda),
              }}
            />

            {/* Polígonos específicos si existen */}
            {banda.poligonos &&
              banda.poligonos.map((poligono, index) => (
                <Polygon
                  key={`${banda.banda_id}-${index}`}
                  positions={poligono}
                  pathOptions={{
                    color: banda.color,
                    fillColor: banda.color,
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => mostrarInfoTerritorio(banda),
                  }}
                />
              ))}

            {/* Marcador central */}
            <Marker
              position={banda.centro}
              icon={crearIconoBanda(banda)}
              eventHandlers={{
                click: () => mostrarInfoTerritorio(banda),
              }}
            >
              <Popup>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {banda.nombre}
                  </Typography>
                  <Typography variant="body2">
                    Nivel de control: {banda.nivel_control}/10
                  </Typography>
                  <Typography variant="body2">
                    Actividades recientes: {banda.actividades_recientes}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => mostrarInfoTerritorio(banda)}
                    sx={{ mt: 1 }}
                  >
                    Ver detalles
                  </Button>
                </Box>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
    </LayerGroup>
  );

  const ComponenteActividades = () => (
    <LayerGroup>
      {actividadesRecientes
        .filter(
          actividad =>
            !configuracion.tiposActividad.length ||
            configuracion.tiposActividad.includes(actividad.tipo)
        )
        .map((actividad, index) => (
          <Marker
            key={`actividad-${index}`}
            position={[actividad.lat, actividad.lng]}
            icon={crearIconoActividad(actividad)}
          >
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {actividad.tipo.replace('_', ' ').toUpperCase()}
                </Typography>
                <Typography variant="body2">
                  Banda: {actividad.banda}
                </Typography>
                <Typography variant="body2">
                  Intensidad: {actividad.intensidad}/10
                </Typography>
                <Typography variant="body2">
                  Peligrosidad: {actividad.peligrosidad}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}
    </LayerGroup>
  );

  const ComponenteConflictos = () => (
    <LayerGroup>
      {conflictosTeritoriales.map((conflicto, index) => (
        <React.Fragment key={`conflicto-${index}`}>
          {/* Área de conflicto */}
          <Circle
            center={conflicto.centro}
            radius={conflicto.radio_afectado * 1000}
            pathOptions={{
              color: obtenerColorConflicto(conflicto.intensidad),
              fillColor: obtenerColorConflicto(conflicto.intensidad),
              fillOpacity: 0.3,
              weight: 3,
              opacity: 0.8,
              dashArray: '5, 5',
            }}
          />

          {/* Marcador de conflicto */}
          <Marker
            position={conflicto.centro}
            icon={L.divIcon({
              className: 'conflicto-marker',
              html: `
                <div style="
                  background: ${obtenerColorConflicto(conflicto.intensidad)};
                  border: 2px solid #fff;
                  border-radius: 50%;
                  width: 20px;
                  height: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 12px;
                ">
                  ⚡
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Conflicto Territorial
                </Typography>
                <Typography variant="body2">
                  Bandas involucradas:{' '}
                  {conflicto.bandas_involucradas?.join(', ')}
                </Typography>
                <Typography variant="body2">
                  Intensidad: {(conflicto.intensidad * 100).toFixed(0)}%
                </Typography>
                <Typography variant="body2">
                  Tipo: {conflicto.tipo_conflicto}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        </React.Fragment>
      ))}
    </LayerGroup>
  );

  const PanelControl = () => (
    <Card
      sx={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        minWidth: 300,
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Controles del Mapa
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {/* Switches de capas */}
          <FormControlLabel
            control={
              <Switch
                checked={configuracion.mostrarTerritorios}
                onChange={e =>
                  setConfiguracion(prev => ({
                    ...prev,
                    mostrarTerritorios: e.target.checked,
                  }))
                }
              />
            }
            label="Territorios de bandas"
          />

          <FormControlLabel
            control={
              <Switch
                checked={configuracion.mostrarActividades}
                onChange={e =>
                  setConfiguracion(prev => ({
                    ...prev,
                    mostrarActividades: e.target.checked,
                  }))
                }
              />
            }
            label="Actividades recientes"
          />

          <FormControlLabel
            control={
              <Switch
                checked={configuracion.mostrarConflictos}
                onChange={e =>
                  setConfiguracion(prev => ({
                    ...prev,
                    mostrarConflictos: e.target.checked,
                  }))
                }
              />
            }
            label="Conflictos territoriales"
          />

          <FormControlLabel
            control={
              <Switch
                checked={configuracion.mostrarHeatmap}
                onChange={e =>
                  setConfiguracion(prev => ({
                    ...prev,
                    mostrarHeatmap: e.target.checked,
                  }))
                }
              />
            }
            label="Mapa de calor"
          />

          <Divider />

          {/* Filtro de nivel de peligrosidad */}
          <Box>
            <Typography gutterBottom>
              Nivel mínimo de control: {configuracion.nivelPeligrosidadMin}
            </Typography>
            <Slider
              value={configuracion.nivelPeligrosidadMin}
              onChange={(e, value) =>
                setConfiguracion(prev => ({
                  ...prev,
                  nivelPeligrosidadMin: value,
                }))
              }
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Filtros de fecha */}
          <FormControlLabel
            control={
              <Switch
                checked={configuracion.filtrarPorFecha}
                onChange={e =>
                  setConfiguracion(prev => ({
                    ...prev,
                    filtrarPorFecha: e.target.checked,
                  }))
                }
              />
            }
            label="Filtrar por fechas"
          />

          {configuracion.filtrarPorFecha && (
            <Box display="flex" flexDirection="column" gap={1}>
              <SafeDatePicker
                label="Fecha desde"
                value={configuracion.fechaDesde}
                onChange={fecha =>
                  setConfiguracion(prev => ({
                    ...prev,
                    fechaDesde: fecha,
                  }))
                }
                size="small"
                fullWidth
              />

              <SafeDatePicker
                label="Fecha hasta"
                value={configuracion.fechaHasta}
                onChange={fecha =>
                  setConfiguracion(prev => ({
                    ...prev,
                    fechaHasta: fecha,
                  }))
                }
                size="small"
                fullWidth
              />
            </Box>
          )}

          <Divider />

          {/* Botones de acción */}
          <Box display="flex" gap={1}>
            <Tooltip title="Actualizar datos">
              <IconButton onClick={cargarDatosTerritoriales} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>

            <Tooltip title="Análisis de conflictos">
              <IconButton onClick={mostrarAnalisisConflictos} size="small">
                <ConflictIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Exportar mapa">
              <IconButton size="small">
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card sx={{ height: altura }}>
        <CardContent>
          <Typography>Cargando datos territoriales...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: altura }}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
          <Button
            onClick={cargarDatosTerritoriales}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box position="relative" height={altura}>
      <MapContainer
        ref={mapRef}
        center={calcularCentroMapa()}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <LayersControl position="topleft">
          {/* Capas base */}
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satélite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
          </LayersControl.BaseLayer>

          {/* Capas de datos */}
          {configuracion.mostrarTerritorios && (
            <LayersControl.Overlay checked name="Territorios de Bandas">
              <ComponenteTerritorios />
            </LayersControl.Overlay>
          )}

          {configuracion.mostrarActividades && (
            <LayersControl.Overlay checked name="Actividades Recientes">
              <ComponenteActividades />
            </LayersControl.Overlay>
          )}

          {configuracion.mostrarConflictos && (
            <LayersControl.Overlay checked name="Conflictos Territoriales">
              <ComponenteConflictos />
            </LayersControl.Overlay>
          )}

          {configuracion.mostrarHeatmap && (
            <LayersControl.Overlay name="Mapa de Calor">
              <HeatmapLayer data={actividadesRecientes} />
            </LayersControl.Overlay>
          )}
        </LayersControl>
      </MapContainer>

      {/* Panel de control - Solo mostrar si no es integración Dashboard */}
      {mostrarPanelControl && !esIntegracionDashboard && <PanelControl />}

      {/* Diálogo de información del territorio */}
      <Dialog
        open={dialogoInfo}
        onClose={() => setDialogoInfo(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Información del Territorio - {territorioSeleccionado?.nombre}
        </DialogTitle>
        <DialogContent>
          {territorioSeleccionado && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Datos Generales
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Group />
                    </ListItemIcon>
                    <ListItemText
                      primary="Nivel de Control"
                      secondary={`${territorioSeleccionado.nivel_control}/10`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <MyLocation />
                    </ListItemIcon>
                    <ListItemText
                      primary="Radio de Influencia"
                      secondary={`${territorioSeleccionado.radio_km} km`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Timeline />
                    </ListItemIcon>
                    <ListItemText
                      primary="Actividades Recientes"
                      secondary={territorioSeleccionado.actividades_recientes}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Análisis
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Chip
                    icon={<Security />}
                    label={`Banda ID: ${territorioSeleccionado.banda_id}`}
                    variant="outlined"
                  />
                  <Chip
                    icon={<Warning />}
                    label="Territorio Activo"
                    color="warning"
                  />
                  {territorioSeleccionado.actividades_recientes > 5 && (
                    <Chip
                      icon={<TrendingUp />}
                      label="Alta Actividad"
                      color="error"
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoInfo(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de análisis de conflictos */}
      <Dialog
        open={dialogoConflictos}
        onClose={() => setDialogoConflictos(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Análisis de Conflictos Territoriales</DialogTitle>
        <DialogContent>
          {analisisTerritorial && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Resumen General
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {analisisTerritorial.total_bandas_territorio}
                      </Typography>
                      <Typography variant="body2">
                        Bandas con territorio
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="warning.main">
                        {conflictosTeritoriales.length}
                      </Typography>
                      <Typography variant="body2">
                        Conflictos activos
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="success.main">
                        {actividadesRecientes.length}
                      </Typography>
                      <Typography variant="body2">
                        Actividades recientes
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="error.main">
                        {
                          conflictosTeritoriales.filter(
                            c => c.intensidad >= 0.7
                          ).length
                        }
                      </Typography>
                      <Typography variant="body2">
                        Conflictos críticos
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Conflictos Detallados
              </Typography>
              <List>
                {conflictosTeritoriales.map((conflicto, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <ConflictIcon
                          style={{
                            color: obtenerColorConflicto(conflicto.intensidad),
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Conflicto entre: ${conflicto.bandas_involucradas?.join(
                          ' vs '
                        )}`}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              Intensidad:{' '}
                              {(conflicto.intensidad * 100).toFixed(0)}%
                            </Typography>
                            <Typography variant="body2">
                              Tipo: {conflicto.tipo_conflicto}
                            </Typography>
                            <Typography variant="body2">
                              Radio afectado: {conflicto.radio_afectado} km
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < conflictosTeritoriales.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoConflictos(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MapaTerritorialBandas;
