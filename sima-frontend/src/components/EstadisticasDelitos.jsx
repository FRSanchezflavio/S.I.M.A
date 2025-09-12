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

  const porcentajeEnProceso = (
    (estadisticas.enProceso / estadisticas.total) *
    100
  ).toFixed(1);
  const porcentajeResueltos = (
    (estadisticas.resueltos / estadisticas.total) *
    100
  ).toFixed(1);

  return (
    <Paper sx={{ p: 3, mb: 3, mt: -2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Estadísticas de Delitos Específicos
      </Typography>

      <Grid container spacing={3}>
        {/* Resumen general */}
        <Grid item xs={12} md={6}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              border: '2px solid #dee2e6',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid #primary.main',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    p: 1,
                    mt: 2,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpIcon sx={{ color: 'white', fontSize: 44 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#1a365d',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Resumen General
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', mb: 3, mt: 2 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 900,
                    color: 'primary.main',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    mb: 1,
                  }}
                >
                  {estadisticas.total}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#495057',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Total de Delitos
                </Typography>
              </Box>

              <Divider
                sx={{
                  my: 2,
                  borderColor: 'primary.main',
                  borderWidth: 1,
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      borderRadius: 2,
                      border: '1px solid rgba(25, 118, 210, 0.2)',
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 0.5,
                      }}
                    >
                      {estadisticas.enProceso}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                      }}
                    >
                      En Proceso
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      backgroundColor: 'rgba(102, 102, 102, 0.1)',
                      borderRadius: 2,
                      border: '1px solid rgba(102, 102, 102, 0.2)',
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: '#666666',
                        mb: 0.5,
                      }}
                    >
                      {estadisticas.resueltos}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666666',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                      }}
                    >
                      Resueltos
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tipos y modalidades */}
        <Grid item xs={12} md={6}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              border: '2px solid #dee2e6',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid #primary.main',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    p: 1,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AssignmentIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#1a365d',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Tipos de Delitos
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    p: 2,
                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                    borderRadius: 2,
                    border: '1px dashed rgba(25, 118, 210, 0.3)',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: '#495057',
                    }}
                  >
                    Tipos únicos
                  </Typography>
                  <Chip
                    label={estadisticas.tiposUnicos.length}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 700,
                      minWidth: 40,
                    }}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {estadisticas.tiposUnicos.slice(0, 6).map((tipo, index) => (
                    <Chip
                      key={index}
                      label={
                        tipo.charAt(0).toUpperCase() +
                        tipo.slice(1).replace('_', ' ')
                      }
                      sx={{
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        color: 'primary.main',
                        fontWeight: 600,
                        border: '1px solid rgba(25, 118, 210, 0.3)',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.2)',
                        },
                      }}
                      size="small"
                    />
                  ))}
                  {estadisticas.tiposUnicos.length > 6 && (
                    <Chip
                      label={`+${estadisticas.tiposUnicos.length - 6} más`}
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 700,
                      }}
                      size="small"
                    />
                  )}
                </Box>
              </Box>

              {estadisticas.modalidadesUnicas.length > 0 && (
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                      p: 2,
                      backgroundColor: 'rgba(156, 39, 176, 0.05)',
                      borderRadius: 2,
                      border: '1px dashed rgba(156, 39, 176, 0.3)',
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: '#495057',
                      }}
                    >
                      Modalidades
                    </Typography>
                    <Chip
                      label={estadisticas.modalidadesUnicas.length}
                      sx={{
                        backgroundColor: 'secondary.main',
                        color: 'white',
                        fontWeight: 700,
                        minWidth: 40,
                      }}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {estadisticas.modalidadesUnicas
                      .slice(0, 4)
                      .map((modalidad, index) => (
                        <Chip
                          key={index}
                          label={
                            modalidad.charAt(0).toUpperCase() +
                            modalidad.slice(1).replace('_', ' ')
                          }
                          sx={{
                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                            color: 'secondary.main',
                            fontWeight: 600,
                            border: '1px solid rgba(156, 39, 176, 0.3)',
                            '&:hover': {
                              backgroundColor: 'rgba(156, 39, 176, 0.2)',
                            },
                          }}
                          size="small"
                        />
                      ))}
                    {estadisticas.modalidadesUnicas.length > 4 && (
                      <Chip
                        label={`+${
                          estadisticas.modalidadesUnicas.length - 4
                        } más`}
                        sx={{
                          backgroundColor: 'secondary.main',
                          color: 'white',
                          fontWeight: 700,
                        }}
                        size="small"
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
          {estadisticas.enProceso > 0 && (
            <Box
              sx={{
                bgcolor: 'primary.main',
                width: `${porcentajeEnProceso}%`,
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
          <Typography variant="caption" color="primary.main">
            {porcentajeEnProceso}% en proceso
          </Typography>
          <Typography variant="caption" sx={{ color: '#666666' }}>
            {porcentajeResueltos}% resueltos
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
