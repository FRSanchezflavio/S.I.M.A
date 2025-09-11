import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';

/**
 * Componente para mostrar estadísticas de los delitos específicos
 */
export default function EstadisticasDelitos({ estadisticas, loading }) {
  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Cargando estadísticas...
        </Typography>
      </Paper>
    );
  }

  if (!estadisticas || estadisticas.total === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f9fa' }}>
        <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6" color="text.secondary">
          Sin delitos específicos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No hay delitos específicos registrados para este sujeto
        </Typography>
      </Paper>
    );
  }

  const porcentajeActivos = (
    (estadisticas.activos / estadisticas.total) *
    100
  ).toFixed(1);
  const porcentajeResueltos = (
    (estadisticas.resueltos / estadisticas.total) *
    100
  ).toFixed(1);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Estadísticas de Delitos Específicos
      </Typography>

      <Grid container spacing={3}>
        {/* Resumen general */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Resumen General
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h4"
                      color="primary.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {estadisticas.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de delitos
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h4"
                      color="error.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {estadisticas.activos}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Casos activos
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label={`${estadisticas.resueltos} resueltos (${porcentajeResueltos}%)`}
                  sx={{ bgcolor: '#666666', color: 'white' }}
                  size="small"
                />
                {estadisticas.archivados > 0 && (
                  <Chip
                    label={`${estadisticas.archivados} archivados`}
                    color="default"
                    size="small"
                  />
                )}
                {estadisticas.suspendido > 0 && (
                  <Chip
                    label={`${estadisticas.suspendido} suspendidos`}
                    color="warning"
                    size="small"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tipos y modalidades */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Tipos de Delitos
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tipos únicos ({estadisticas.tiposUnicos.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {estadisticas.tiposUnicos.slice(0, 6).map((tipo, index) => (
                    <Chip
                      key={index}
                      label={
                        tipo.charAt(0).toUpperCase() +
                        tipo.slice(1).replace('_', ' ')
                      }
                      variant="outlined"
                      size="small"
                    />
                  ))}
                  {estadisticas.tiposUnicos.length > 6 && (
                    <Chip
                      label={`+${estadisticas.tiposUnicos.length - 6} más`}
                      variant="outlined"
                      size="small"
                      color="primary"
                    />
                  )}
                </Box>
              </Box>

              {estadisticas.modalidadesUnicas.length > 0 && (
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Modalidades ({estadisticas.modalidadesUnicas.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {estadisticas.modalidadesUnicas
                      .slice(0, 4)
                      .map((modalidad, index) => (
                        <Chip
                          key={index}
                          label={
                            modalidad.charAt(0).toUpperCase() +
                            modalidad.slice(1).replace('_', ' ')
                          }
                          variant="outlined"
                          size="small"
                          color="secondary"
                        />
                      ))}
                    {estadisticas.modalidadesUnicas.length > 4 && (
                      <Chip
                        label={`+${
                          estadisticas.modalidadesUnicas.length - 4
                        } más`}
                        variant="outlined"
                        size="small"
                        color="secondary"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Indicadores de progreso visual */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Distribución por estado
        </Typography>
        <Box
          sx={{
            display: 'flex',
            height: 8,
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'grey.200',
          }}
        >
          {estadisticas.activos > 0 && (
            <Box
              sx={{
                bgcolor: 'error.main',
                width: `${porcentajeActivos}%`,
                transition: 'width 0.3s ease',
              }}
            />
          )}
          {estadisticas.resueltos > 0 && (
            <Box
              sx={{
                bgcolor: '#666666',
                width: `${porcentajeResueltos}%`,
                transition: 'width 0.3s ease',
              }}
            />
          )}
          {estadisticas.archivados + (estadisticas.suspendido || 0) > 0 && (
            <Box
              sx={{
                bgcolor: 'grey.400',
                width: `${(
                  ((estadisticas.archivados + (estadisticas.suspendido || 0)) /
                    estadisticas.total) *
                  100
                ).toFixed(1)}%`,
                transition: 'width 0.3s ease',
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="error.main">
            {porcentajeActivos}% activos
          </Typography>
          <Typography variant="caption" sx={{ color: '#666666' }}>
            {porcentajeResueltos}% resueltos
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
