import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  ZoomOut,
  ZoomIn,
  Edit,
  Save,
  Cancel,
  Refresh,
  Warning,
  CheckCircle,
  Info,
} from '@mui/icons-material';

const PanelControlTerritorial = ({
  bandas = [],
  modoEdicion = 'visualizar',
  onModoChange,
  onBandaSelect,
  bandaActiva,
  loading = false,
  cambiosPendientes = false,
  onGuardarCambios,
  onCancelarCambios,
  onRefrescar,
  estadisticas = {},
}) => {
  const modos = [
    {
      value: 'visualizar',
      icon: <Visibility fontSize="small" />,
      tooltip: 'Solo visualización',
      color: 'primary',
    },
    {
      value: 'expandir',
      icon: <ZoomOut fontSize="small" />,
      tooltip: 'Expandir territorios',
      color: 'success',
    },
    {
      value: 'contraer',
      icon: <ZoomIn fontSize="small" />,
      tooltip: 'Contraer territorios',
      color: 'warning',
    },
    {
      value: 'redefinir',
      icon: <Edit fontSize="small" />,
      tooltip: 'Redefinir completamente',
      color: 'error',
    },
  ];

  const obtenerColorBanda = banda => {
    return banda.color_mapa || banda.color || '#2196f3';
  };

  const obtenerEstadoBanda = banda => {
    switch (banda.estado_operacional || banda.estado) {
      case 'activa':
        return { color: 'success', label: 'Activa' };
      case 'inactiva':
        return { color: 'default', label: 'Inactiva' };
      case 'en_investigacion':
        return { color: 'warning', label: 'Investigación' };
      case 'desarticulada':
        return { color: 'error', label: 'Desarticulada' };
      default:
        return { color: 'info', label: 'Sin estado' };
    }
  };

  const puedeEditar = banda => {
    const estadosEditables = ['activa', 'en_investigacion'];
    return estadosEditables.includes(banda.estado_operacional || banda.estado);
  };

  return (
    <Card
      sx={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        minWidth: 300,
        maxWidth: 350,
        maxHeight: '80vh',
        overflow: 'auto',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(21, 77, 113, 0.1)',
        boxShadow: '0 8px 32px rgba(21, 77, 113, 0.2)',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header del panel */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: 'rgb(21, 77, 113)',
              fontSize: '1.1rem',
            }}
          >
            Control Territorial
          </Typography>
          <Tooltip title="Actualizar datos">
            <IconButton
              onClick={onRefrescar}
              size="small"
              disabled={loading}
              sx={{ color: 'rgb(21, 77, 113)' }}
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                <Refresh fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Estadísticas rápidas */}
        {estadisticas && (
          <Box mb={2}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                icon={<Info />}
                label={`${bandas.length} bandas`}
                size="small"
                color="primary"
                variant="outlined"
              />
              {estadisticas.conflictos > 0 && (
                <Chip
                  icon={<Warning />}
                  label={`${estadisticas.conflictos} conflictos`}
                  size="small"
                  color="warning"
                />
              )}
              {estadisticas.territoriosActivos && (
                <Chip
                  icon={<CheckCircle />}
                  label={`${estadisticas.territoriosActivos} activos`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Selector de modo de edición */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Modo de edición
          </Typography>
          <ToggleButtonGroup
            value={modoEdicion}
            exclusive
            onChange={(e, value) => value && onModoChange(value)}
            size="small"
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                py: 1,
                borderColor: 'rgba(21, 77, 113, 0.2)',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(21, 77, 113, 0.1)',
                  color: 'rgb(21, 77, 113)',
                  '&:hover': {
                    backgroundColor: 'rgba(21, 77, 113, 0.2)',
                  },
                },
              },
            }}
          >
            {modos.map(modo => (
              <Tooltip key={modo.value} title={modo.tooltip}>
                <ToggleButton value={modo.value}>{modo.icon}</ToggleButton>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Información del modo actual */}
        <Box mb={2}>
          <Typography variant="caption" color="text.secondary">
            {modoEdicion === 'visualizar' && 'Modo solo lectura activo'}
            {modoEdicion === 'expandir' && 'Arrastra vértices hacia afuera'}
            {modoEdicion === 'contraer' && 'Arrastra vértices hacia adentro'}
            {modoEdicion === 'redefinir' &&
              'Dibuja nuevos límites territoriales'}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Lista de bandas */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Bandas territoriales ({bandas.length})
        </Typography>

        <List dense sx={{ maxHeight: '300px', overflow: 'auto' }}>
          {bandas.map(banda => {
            const estado = obtenerEstadoBanda(banda);
            const esSeleccionada = bandaActiva?.banda_id === banda.banda_id;
            const puedeEditarBanda = puedeEditar(banda);

            return (
              <ListItem
                key={banda.banda_id}
                button
                selected={esSeleccionada}
                onClick={() => onBandaSelect(banda)}
                disabled={modoEdicion !== 'visualizar' && !puedeEditarBanda}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  border: esSeleccionada
                    ? '2px solid rgba(21, 77, 113, 0.3)'
                    : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(21, 77, 113, 0.05)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(21, 77, 113, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(21, 77, 113, 0.15)',
                    },
                  },
                  opacity:
                    !puedeEditarBanda && modoEdicion !== 'visualizar' ? 0.5 : 1,
                }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      backgroundColor: obtenerColorBanda(banda),
                      borderRadius: '50%',
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {banda.nombre}
                      </Typography>
                      <Chip
                        label={estado.label}
                        size="small"
                        color={estado.color}
                        sx={{ height: 18, fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Radio:{' '}
                        {banda.radio_km || banda.radio_influencia_km || 0} km
                      </Typography>
                      {banda.nivel_control && (
                        <Typography variant="caption" color="text.secondary">
                          {' • '}Control: {banda.nivel_control}/10
                        </Typography>
                      )}
                    </Box>
                  }
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                {!puedeEditarBanda && modoEdicion !== 'visualizar' && (
                  <Tooltip title="No se puede editar en estado actual">
                    <Warning fontSize="small" color="warning" />
                  </Tooltip>
                )}
              </ListItem>
            );
          })}
        </List>

        {bandas.length === 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            py={3}
            color="text.secondary"
          >
            <Info sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" textAlign="center">
              No hay bandas con territorios definidos
            </Typography>
          </Box>
        )}

        {/* Controles de guardado (solo en modos de edición) */}
        {modoEdicion !== 'visualizar' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Save />}
                onClick={onGuardarCambios}
                disabled={!cambiosPendientes || loading}
                sx={{
                  flex: 1,
                  backgroundColor: 'rgb(21, 77, 113)',
                  '&:hover': {
                    backgroundColor: 'rgb(18, 65, 95)',
                  },
                }}
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Cancel />}
                onClick={onCancelarCambios}
                disabled={loading}
                sx={{
                  flex: 1,
                  borderColor: 'rgb(21, 77, 113)',
                  color: 'rgb(21, 77, 113)',
                  '&:hover': {
                    borderColor: 'rgb(18, 65, 95)',
                    backgroundColor: 'rgba(21, 77, 113, 0.05)',
                  },
                }}
              >
                Cancelar
              </Button>
            </Box>
          </>
        )}

        {/* Ayuda contextual */}
        {modoEdicion !== 'visualizar' && (
          <Box
            mt={2}
            p={1.5}
            bgcolor="rgba(21, 77, 113, 0.05)"
            borderRadius={1}
          >
            <Typography variant="caption" color="text.secondary">
              💡 Selecciona una banda activa para editar su territorio usando
              las herramientas del mapa
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PanelControlTerritorial;
