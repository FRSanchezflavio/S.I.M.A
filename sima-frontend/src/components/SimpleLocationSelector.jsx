import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * Selector de ubicación simple usando Google Maps Embed (sin API key)
 * Como fallback mientras se soluciona el problema de Leaflet
 */
const SimpleLocationSelector = ({
  open,
  onClose,
  onLocationSelected,
  title = 'Seleccionar Ubicación',
  initialLocation = null,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(true);

  const tucumanLocation = initialLocation || {
    latitude: -26.8241,
    longitude: -65.2226,
    address: 'Tucumán, Argentina',
  };

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      // Simular carga
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleManualCoordinates = () => {
    const lat = prompt('Ingrese la latitud:', tucumanLocation.latitude);
    const lng = prompt('Ingrese la longitud:', tucumanLocation.longitude);

    if (lat && lng) {
      const location = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        address: `Coordenadas: ${lat}, ${lng}`,
      };
      setSelectedLocation(location);
    }
  };

  const handleUseTucuman = () => {
    const location = {
      latitude: -26.8241,
      longitude: -65.2226,
      address: 'Plaza Independencia, Tucumán, Argentina',
    };
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation && onLocationSelected) {
      onLocationSelected(selectedLocation);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} py={2}>
          {loading ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              p={4}
            >
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Cargando selector de ubicación...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body1">
                📍 Seleccionar ubicación para el domicilio
              </Typography>

              {selectedLocation && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'primary.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'primary.200',
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    Ubicación seleccionada:
                  </Typography>
                  <Typography variant="body2">
                    📍 {selectedLocation.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lat: {selectedLocation.latitude.toFixed(6)}, Lng:{' '}
                    {selectedLocation.longitude.toFixed(6)}
                  </Typography>
                </Box>
              )}

              <Box display="flex" flexDirection="column" gap={2}>
                <Button variant="outlined" onClick={handleUseTucuman} fullWidth>
                  📍 Usar Plaza Independencia, Tucumán
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleManualCoordinates}
                  fullWidth
                >
                  🎯 Ingresar Coordenadas Manualmente
                </Button>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
              >
                ⚠️ Modo de compatibilidad - El mapa interactivo se está
                solucionando
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
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

export default SimpleLocationSelector;
