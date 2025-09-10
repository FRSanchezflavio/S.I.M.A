import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para manejar clics en el mapa
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={[position.lat, position.lng]} />
  );
}

export default function MapModal({
  open,
  onClose,
  onLocationSelect,
  initialPosition,
}) {
  // Coordenadas por defecto de Tucumán
  const defaultPosition = { lat: -26.8083, lng: -65.2176 };
  const [selectedPosition, setSelectedPosition] = useState(
    initialPosition || null
  );
  const [tempPosition, setTempPosition] = useState(initialPosition || null);

  // Actualizar tempPosition cuando cambie initialPosition
  React.useEffect(() => {
    setTempPosition(initialPosition || null);
    setSelectedPosition(initialPosition || null);
  }, [initialPosition]);

  const handleConfirm = () => {
    if (tempPosition && onLocationSelect) {
      onLocationSelect(tempPosition);
      setSelectedPosition(tempPosition);
    }
    onClose();
  };

  const handleCancel = () => {
    setTempPosition(selectedPosition);
    onClose();
  };

  const handleClear = () => {
    setTempPosition(null);
    if (onLocationSelect) {
      onLocationSelect(null);
    }
    setSelectedPosition(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '600px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h6" component="div">
          Seleccionar ubicación en el mapa
        </Typography>
        <IconButton onClick={handleCancel} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ padding: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="body2" color="textSecondary">
            Haga clic en el mapa para seleccionar la ubicación exacta del hecho.
          </Typography>
          {tempPosition && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
              Coordenadas: {tempPosition.lat.toFixed(6)},{' '}
              {tempPosition.lng.toFixed(6)}
            </Typography>
          )}
        </Box>

        <Box sx={{ flexGrow: 1, height: '400px' }}>
          <MapContainer
            center={[defaultPosition.lat, defaultPosition.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={tempPosition}
              setPosition={setTempPosition}
            />
          </MapContainer>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClear}
          variant="outlined"
          color="warning"
          disabled={!tempPosition}
        >
          Limpiar
        </Button>
        <Button onClick={handleCancel} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            bgcolor: '#000',
            '&:hover': { bgcolor: 'rgb(21, 77, 113)' },
          }}
        >
          Confirmar ubicación
        </Button>
      </DialogActions>
    </Dialog>
  );
}
