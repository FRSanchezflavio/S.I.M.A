import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  MyLocation as MyLocationIcon,
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import MapComponent from './MapComponent';
import geoService from '../services/geoService';

/**
 * Componente para seleccionar ubicación con mapa y geocodificación
 */
const LocationSelector = ({
  open,
  onClose,
  onLocationSelected,
  title = 'Seleccionar Ubicación',
  initialLocation = null,
  showAddressInput = true,
  allowManualSelection = true,
  height = 400,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [addressInput, setAddressInput] = useState('');
  const [geocodingResult, setGeocodingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState(
    initialLocation || { latitude: -26.8241, longitude: -65.2226 }
  );
  const [mapReady, setMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapContainerRef = useRef(null);
  const dialogRef = useRef(null);
  const geocodingTimeoutRef = useRef(null);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setMapCenter(initialLocation);
      if (initialLocation.address) {
        setAddressInput(initialLocation.address);
      }
    }
  }, [initialLocation]);

  // Efecto para inicializar el mapa cuando el modal se abre - MEJORADO
  useEffect(() => {
    if (open) {
      console.log('LocationSelector modal abierto, inicializando mapa...');

      // Múltiples estrategias para asegurar que el mapa se renderice correctamente
      const initializeMap = () => {
        // Verificar que el contenedor existe y tiene dimensiones
        if (mapContainerRef.current) {
          const rect = mapContainerRef.current.getBoundingClientRect();
          console.log(
            'Dimensiones del contenedor:',
            rect.width,
            'x',
            rect.height
          );

          if (rect.width > 0 && rect.height > 0) {
            console.log('Contenedor listo, estableciendo mapReady = true');
            setMapReady(true);

            // Forzar redimensionamiento después de la inicialización
            setTimeout(() => {
              if (mapInstance) {
                console.log('Invalidando tamaño del mapa...');
                mapInstance.invalidateSize();
              }
              window.dispatchEvent(new Event('resize'));
            }, 300);
          } else {
            console.log('Contenedor sin dimensiones, reintentando...');
            setTimeout(initializeMap, 100);
          }
        } else {
          console.log('Contenedor no encontrado, reintentando...');
          setTimeout(initializeMap, 100);
        }
      };

      // Inicializar después de que el modal termine su animación de entrada
      const timer = setTimeout(initializeMap, 350);

      return () => {
        clearTimeout(timer);
        setMapInstance(null);
      };
    } else {
      console.log('LocationSelector modal cerrado');
      setMapReady(false);
      setMapInstance(null);
    }
  }, [open, mapInstance]);

  // Autocompletado de direcciones con debounce
  useEffect(() => {
    if (geocodingTimeoutRef.current) {
      clearTimeout(geocodingTimeoutRef.current);
    }

    if (addressInput.trim().length >= 3) {
      geocodingTimeoutRef.current = setTimeout(async () => {
        try {
          const result = await geoService.geocodeAddress(addressInput, {
            localidad: 'Tucumán',
            limit: 5, // Limitar sugerencias
          });

          if (result.success && result.data && Array.isArray(result.data)) {
            setAddressSuggestions(result.data.slice(0, 5));
            setShowSuggestions(true);
          } else if (result.success && result.data) {
            // Si es un solo resultado, agregarlo como sugerencia
            setAddressSuggestions([result.data]);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.warn('Error en autocompletado:', error);
          setAddressSuggestions([]);
        }
      }, 500); // Debounce de 500ms
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (geocodingTimeoutRef.current) {
        clearTimeout(geocodingTimeoutRef.current);
      }
    };
  }, [addressInput]);

  // Geocodificar dirección ingresada - MEJORADO
  const handleGeocode = async (address = null) => {
    const searchAddress = address || addressInput;

    if (!searchAddress.trim()) {
      setError('Ingrese una dirección para buscar');
      return;
    }

    setLoading(true);
    setError('');
    setShowSuggestions(false);

    try {
      const result = await geoService.geocodeAddress(searchAddress, {
        localidad: 'Tucumán',
        provincia: 'Tucumán',
        pais: 'Argentina',
      });

      if (result.success && result.data) {
        const resultData = Array.isArray(result.data)
          ? result.data[0]
          : result.data;

        const location = {
          latitude: resultData.latitude,
          longitude: resultData.longitude,
          address: resultData.formatted_address || resultData.display_name,
          city: resultData.city,
          neighborhood: resultData.neighborhood,
          confidence: resultData.confidence || 0.8,
        };

        setSelectedLocation(location);
        setMapCenter(location);
        setGeocodingResult(resultData);
        setAddressInput(location.address);
        setError('');

        // Si tenemos instancia del mapa, actualizar vista
        if (mapInstance) {
          setTimeout(() => {
            mapInstance.setView([location.latitude, location.longitude], 16);
          }, 100);
        }
      } else {
        setError('No se pudo geocodificar la dirección');
      }
    } catch (err) {
      setError(err.message || 'Error en la geocodificación');
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar sugerencia de autocompletado
  const handleSelectSuggestion = suggestion => {
    const location = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      address: suggestion.formatted_address || suggestion.display_name,
      city: suggestion.city,
      neighborhood: suggestion.neighborhood,
      confidence: suggestion.confidence || 0.8,
    };

    setSelectedLocation(location);
    setMapCenter(location);
    setGeocodingResult(suggestion);
    setAddressInput(location.address);
    setShowSuggestions(false);
    setError('');

    // Actualizar vista del mapa
    if (mapInstance) {
      setTimeout(() => {
        mapInstance.setView([location.latitude, location.longitude], 16);
      }, 100);
    }
  };

  // Manejar cambio en el input de dirección
  const handleAddressInputChange = e => {
    const value = e.target.value;
    setAddressInput(value);

    if (value.trim().length < 3) {
      setShowSuggestions(false);
      setAddressSuggestions([]);
    }
  };

  // Obtener ubicación actual del navegador - MEJORADO
  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setError('');
    setShowSuggestions(false);

    try {
      console.log('Obteniendo ubicación actual...');
      const location = await geoService.getCurrentLocation();

      console.log('Ubicación obtenida:', location);

      // Hacer geocodificación inversa para obtener la dirección
      try {
        const reverseResult = await geoService.reverseGeocode(
          location.latitude,
          location.longitude
        );

        if (reverseResult.success && reverseResult.data) {
          const enrichedLocation = {
            ...location,
            address:
              reverseResult.data.formatted_address ||
              reverseResult.data.display_name,
            city: reverseResult.data.city,
            neighborhood: reverseResult.data.neighborhood,
          };

          setSelectedLocation(enrichedLocation);
          setMapCenter(enrichedLocation);
          setAddressInput(enrichedLocation.address || '');
          setGeocodingResult(reverseResult.data);

          // Actualizar vista del mapa
          if (mapInstance) {
            setTimeout(() => {
              mapInstance.setView([location.latitude, location.longitude], 16);
            }, 100);
          }
        } else {
          // Si no hay geocodificación inversa, usar coordenadas
          setSelectedLocation(location);
          setMapCenter(location);
          setAddressInput(
            `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
          );
        }
      } catch (reverseError) {
        console.warn('Error en geocodificación inversa:', reverseError);
        setSelectedLocation(location);
        setMapCenter(location);
        setAddressInput(
          `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
        );
      }

      setError('');
    } catch (err) {
      console.error('Error obteniendo ubicación:', err);
      setError(err.message || 'Error obteniendo ubicación actual');
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección manual en el mapa - MEJORADO
  const handleMapLocationSelect = async location => {
    if (!allowManualSelection) return;

    console.log('Ubicación seleccionada en mapa:', location);
    setSelectedLocation(location);
    setLoading(true);
    setShowSuggestions(false);

    try {
      // Hacer geocodificación inversa
      const reverseResult = await geoService.reverseGeocode(
        location.latitude,
        location.longitude
      );

      if (reverseResult.success && reverseResult.data) {
        const enrichedLocation = {
          ...location,
          address:
            reverseResult.data.formatted_address ||
            reverseResult.data.display_name,
          city: reverseResult.data.city,
          neighborhood: reverseResult.data.neighborhood,
        };

        setSelectedLocation(enrichedLocation);
        setAddressInput(
          enrichedLocation.address ||
            `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
        );
        setGeocodingResult(reverseResult.data);
      } else {
        // Si no hay geocodificación inversa disponible
        setAddressInput(
          `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
        );
      }
    } catch (err) {
      console.warn('Error en geocodificación inversa:', err);
      setAddressInput(
        `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Confirmar selección
  const handleConfirm = () => {
    if (!selectedLocation) {
      setError('Seleccione una ubicación');
      return;
    }

    onLocationSelected({
      ...selectedLocation,
      address: addressInput || selectedLocation.address,
    });
    onClose();
  };

  // Limpiar formulario
  const handleClear = () => {
    setSelectedLocation(null);
    setAddressInput('');
    setGeocodingResult(null);
    setError('');
    setMapCenter({ latitude: -26.8241, longitude: -65.2226 });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={false}
      keepMounted={false}
      PaperProps={{
        sx: {
          height: '80vh',
          overflow: 'hidden',
        },
      }}
      TransitionProps={{
        onEntered: () => {
          // Cuando la animación termina, forzar redimensionamiento
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 100);
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" height="100%">
          {/* Búsqueda por dirección */}
          {showAddressInput && (
            <Box mb={2} position="relative">
              <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                  <TextField
                    fullWidth
                    label="Dirección"
                    value={addressInput}
                    onChange={handleAddressInputChange}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        handleGeocode();
                        setShowSuggestions(false);
                      }
                      if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (addressSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="Ej: Av. Mitre 500, Tucumán"
                    InputProps={{
                      endAdornment: loading ? (
                        <CircularProgress size={20} />
                      ) : null,
                    }}
                    helperText="Escriba al menos 3 caracteres para obtener sugerencias"
                  />

                  {/* Lista de sugerencias */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <Paper
                      elevation={3}
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 60, // Espacio para los botones
                        zIndex: 1000,
                        maxHeight: 200,
                        overflow: 'auto',
                        mt: 1,
                      }}
                    >
                      {addressSuggestions.map((suggestion, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 1,
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                            '&:hover': { bgcolor: '#f5f5f5' },
                            '&:last-child': { borderBottom: 'none' },
                          }}
                          onClick={() => handleSelectSuggestion(suggestion)}
                        >
                          <Typography variant="body2" fontWeight="medium">
                            {suggestion.formatted_address ||
                              suggestion.display_name}
                          </Typography>
                          {suggestion.city && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {suggestion.city}
                              {suggestion.neighborhood &&
                                `, ${suggestion.neighborhood}`}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Paper>
                  )}
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={() => handleGeocode()}
                    disabled={loading || !addressInput.trim()}
                    color="primary"
                    title="Buscar dirección"
                  >
                    <SearchIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={handleGetCurrentLocation}
                    disabled={loading}
                    color="secondary"
                    title="Mi ubicación"
                  >
                    <MyLocationIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Mensajes de error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Información de geocodificación */}
          {geocodingResult && (
            <Box mb={2}>
              <Alert severity="info">
                <Typography variant="body2">
                  <LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {geocodingResult.formatted_address}
                </Typography>
                {geocodingResult.confidence && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Confianza: {(geocodingResult.confidence * 100).toFixed(0)}%
                  </Typography>
                )}
              </Alert>
            </Box>
          )}

          {/* Ubicación seleccionada */}
          {selectedLocation && (
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Ubicación seleccionada:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                <Chip
                  label={`${selectedLocation.latitude.toFixed(
                    6
                  )}, ${selectedLocation.longitude.toFixed(6)}`}
                  size="small"
                  variant="outlined"
                />
                {selectedLocation.city && (
                  <Chip
                    label={selectedLocation.city}
                    size="small"
                    color="primary"
                  />
                )}
                {selectedLocation.neighborhood && (
                  <Chip
                    label={selectedLocation.neighborhood}
                    size="small"
                    color="secondary"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Mapa */}
          <Box
            ref={mapContainerRef}
            flexGrow={1}
            minHeight={height}
            sx={{
              '& .leaflet-container': {
                height: '100% !important',
                width: '100% !important',
              },
            }}
          >
            {mapReady ? (
              <MapComponent
                key={`map-${open}-${mapCenter.latitude}-${mapCenter.longitude}`}
                center={mapCenter}
                zoom={15}
                height="100%"
                allowLocationSelect={allowManualSelection}
                onLocationSelect={handleMapLocationSelect}
                onMapReady={map => {
                  console.log('Mapa listo, guardando instancia');
                  setMapInstance(map);
                }}
                showCurrentLocation={false}
                showLegend={false}
                personas={[]}
                registros={[]}
                interactive={true}
              />
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                }}
              >
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Cargando mapa...
                </Typography>
              </Box>
            )}

            {allowManualSelection && mapReady && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1, textAlign: 'center' }}
              >
                Haga clic en el mapa para seleccionar una ubicación
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClear} color="inherit">
          Limpiar
        </Button>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedLocation}
        >
          Confirmar Ubicación
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationSelector;
