import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Badge,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Fade,
  Zoom,
  Slide,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Notifications,
  NotificationsActive,
  Warning,
  Security,
  AccountTree,
  Group,
  LocationOn,
  Timeline,
  Close,
  CheckCircle,
  Info,
  Error,
  TrendingUp,
} from '@mui/icons-material';
import api from '../../services/api';

// Animación de pulso usando styled-components
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Tipos de notificaciones del sistema
const TIPOS_NOTIFICACION = {
  red_emergente: {
    icon: <AccountTree />,
    color: '#e74c3c',
    titulo: 'Nueva Red Detectada',
    sonido: true,
  },
  expansion_territorial: {
    icon: <LocationOn />,
    color: '#f39c12',
    titulo: 'Expansión Territorial',
    sonido: true,
  },
  vinculo_critico: {
    icon: <Warning />,
    color: '#c0392b',
    titulo: 'Vínculo Crítico',
    sonido: true,
  },
  cambio_liderazgo: {
    icon: <Group />,
    color: '#9b59b6',
    titulo: 'Cambio de Liderazgo',
    sonido: false,
  },
  actividad_anomala: {
    icon: <Timeline />,
    color: '#e67e22',
    titulo: 'Actividad Anómala',
    sonido: true,
  },
  nueva_alianza: {
    icon: <Security />,
    color: '#c0392b',
    titulo: 'Nueva Alianza Criminal',
    sonido: true,
  },
};

const SistemaNotificaciones = ({ onNotificacionRecibida }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [snackbarAbierto, setSnackbarAbierto] = useState(false);
  const [ultimaNotificacion, setUltimaNotificacion] = useState(null);
  const [configuracion, setConfiguracion] = useState({
    sonidos_activos: true,
    notificaciones_push: true,
    solo_criticas: false,
  });

  // Simular conexión WebSocket o polling para notificaciones en tiempo real
  useEffect(() => {
    const intervalo = setInterval(() => {
      verificarNuevasNotificaciones();
    }, 30000); // Verificar cada 30 segundos

    return () => clearInterval(intervalo);
  }, []);

  const verificarNuevasNotificaciones = useCallback(async () => {
    try {
      // En producción, esto sería una llamada real a la API
      // const response = await api.get('/api/inteligencia/notificaciones/nuevas');

      // Simular nuevas notificaciones aleatoriamente
      if (Math.random() > 0.7) {
        // 30% de probabilidad
        generarNotificacionSimulada();
      }
    } catch (error) {
      console.error('Error verificando notificaciones:', error);
    }
  }, []);

  const generarNotificacionSimulada = () => {
    const tiposDisponibles = Object.keys(TIPOS_NOTIFICACION);
    const tipoAleatorio =
      tiposDisponibles[Math.floor(Math.random() * tiposDisponibles.length)];
    const tipoConfig = TIPOS_NOTIFICACION[tipoAleatorio];

    const nuevaNotificacion = {
      id: Date.now(),
      tipo: tipoAleatorio,
      titulo: tipoConfig.titulo,
      mensaje: generarMensajeSegunTipo(tipoAleatorio),
      timestamp: new Date(),
      leida: false,
      prioridad:
        tipoAleatorio === 'vinculo_critico' || tipoAleatorio === 'nueva_alianza'
          ? 'alta'
          : 'media',
      parametros: generarParametrosSegunTipo(tipoAleatorio),
    };

    setNotificaciones(prev => [nuevaNotificacion, ...prev]);
    setNotificacionesNoLeidas(prev => prev + 1);
    setUltimaNotificacion(nuevaNotificacion);

    // Mostrar snackbar
    setSnackbarAbierto(true);

    // Reproducir sonido si está habilitado
    if (configuracion.sonidos_activos && tipoConfig.sonido) {
      reproducirSonidoNotificacion(nuevaNotificacion.prioridad);
    }

    // Callback para componente padre
    if (onNotificacionRecibida) {
      onNotificacionRecibida(nuevaNotificacion);
    }
  };

  const generarMensajeSegunTipo = tipo => {
    const mensajes = {
      red_emergente:
        'Se detectó una nueva red criminal con 6 miembros en zona Norte',
      expansion_territorial:
        'Clan Gutierrez expandió operaciones hacia zona Centro',
      vinculo_critico:
        'Nuevo vínculo entre líderes de organizaciones diferentes',
      cambio_liderazgo:
        'Cambio de liderazgo detectado en Los Hermanos del Norte',
      actividad_anomala:
        'Incremento del 40% en actividad criminal en últimas 48h',
      nueva_alianza:
        'Posible alianza entre dos organizaciones criminales detectada',
    };
    return mensajes[tipo] || 'Nueva actividad detectada en el sistema';
  };

  const generarParametrosSegunTipo = tipo => {
    const parametros = {
      red_emergente: { zona: 'Norte', miembros: 6, confianza: 0.87 },
      expansion_territorial: {
        organizacion: 'Clan Gutierrez',
        zona_origen: 'Sur',
        zona_destino: 'Centro',
      },
      vinculo_critico: {
        personas: ['Carlos Martinez', 'Roberto Gutierrez'],
        tipo_vinculo: 'reunion_clandestina',
      },
      cambio_liderazgo: {
        organizacion: 'Los Hermanos del Norte',
        lider_anterior: 'Miguel Rodriguez',
        lider_nuevo: 'Carlos Martinez',
      },
      actividad_anomala: {
        incremento: '40%',
        periodo: '48h',
        zona_afectada: 'Multiple',
      },
      nueva_alianza: {
        organizaciones: ['Los Hermanos del Norte', 'Clan Gutierrez'],
        tipo: 'alianza_temporal',
      },
    };
    return parametros[tipo] || {};
  };

  const reproducirSonidoNotificacion = prioridad => {
    // En un entorno real, aquí se reproduciría un sonido
    if ('vibrate' in navigator) {
      const patron = prioridad === 'alta' ? [200, 100, 200] : [100];
      navigator.vibrate(patron);
    }
    console.log(`🔊 Sonido de notificación: ${prioridad}`);
  };

  const marcarComoLeida = notificacionId => {
    setNotificaciones(prev =>
      prev.map(notif =>
        notif.id === notificacionId ? { ...notif, leida: true } : notif
      )
    );
    setNotificacionesNoLeidas(prev => Math.max(0, prev - 1));
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones(prev => prev.map(notif => ({ ...notif, leida: true })));
    setNotificacionesNoLeidas(0);
  };

  const eliminarNotificacion = notificacionId => {
    setNotificaciones(prev =>
      prev.filter(notif => notif.id !== notificacionId)
    );
    setNotificacionesNoLeidas(prev => {
      const notificacion = notificaciones.find(n => n.id === notificacionId);
      return notificacion && !notificacion.leida ? Math.max(0, prev - 1) : prev;
    });
  };

  const obtenerColorSeveridad = (tipo, prioridad) => {
    if (prioridad === 'alta') return '#c0392b';
    return TIPOS_NOTIFICACION[tipo]?.color || '#95a5a6';
  };

  const formatearTiempoTranscurrido = timestamp => {
    const ahora = new Date();
    const diferencia = ahora - timestamp;
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (dias > 0) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (minutos > 0) return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    return 'hace un momento';
  };

  return (
    <>
      {/* Icono de notificaciones en la UI */}
      <Tooltip title="Notificaciones del sistema">
        <IconButton
          onClick={() => setDialogAbierto(true)}
          sx={{
            color: notificacionesNoLeidas > 0 ? 'error.main' : 'inherit',
            animation:
              notificacionesNoLeidas > 0
                ? `${pulseAnimation} 2s infinite`
                : 'none',
          }}
        >
          <Badge badgeContent={notificacionesNoLeidas} color="error" max={99}>
            {notificacionesNoLeidas > 0 ? (
              <NotificationsActive />
            ) : (
              <Notifications />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Dialog principal de notificaciones */}
      <Dialog
        open={dialogAbierto}
        onClose={() => setDialogAbierto(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'down' }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <NotificationsActive color="primary" />
              <Typography variant="h6">Notificaciones Inteligentes</Typography>
              <Chip
                label={`${notificacionesNoLeidas} nuevas`}
                color="error"
                size="small"
                sx={{ display: notificacionesNoLeidas > 0 ? 'block' : 'none' }}
              />
            </Box>
            <IconButton onClick={() => setDialogAbierto(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {notificaciones.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              py={4}
              sx={{ color: 'text.secondary' }}
            >
              <Notifications sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">No hay notificaciones</Typography>
              <Typography variant="body2">
                Las alertas del sistema aparecerán aquí automáticamente
              </Typography>
            </Box>
          ) : (
            <List>
              {notificaciones.map((notificacion, index) => {
                const tipoConfig = TIPOS_NOTIFICACION[notificacion.tipo];
                const color = obtenerColorSeveridad(
                  notificacion.tipo,
                  notificacion.prioridad
                );

                return (
                  <Fade in timeout={300 + index * 100} key={notificacion.id}>
                    <ListItem
                      sx={{
                        mb: 1,
                        border: `2px solid ${color}`,
                        borderRadius: 2,
                        backgroundColor: notificacion.leida
                          ? 'transparent'
                          : `${color}10`,
                        opacity: notificacion.leida ? 0.7 : 1,
                      }}
                    >
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            bgcolor: color,
                            color: 'white',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {tipoConfig?.icon || <Info />}
                        </Avatar>
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                            mb={1}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={
                                notificacion.leida ? 'normal' : 'bold'
                              }
                            >
                              {notificacion.titulo}
                            </Typography>

                            <Chip
                              label={notificacion.prioridad.toUpperCase()}
                              size="small"
                              sx={{
                                backgroundColor: color,
                                color: 'white',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                              }}
                            />

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatearTiempoTranscurrido(
                                notificacion.timestamp
                              )}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              {notificacion.mensaje}
                            </Typography>

                            {notificacion.parametros &&
                              Object.keys(notificacion.parametros).length >
                                0 && (
                                <Box
                                  display="flex"
                                  gap={1}
                                  flexWrap="wrap"
                                  mt={1}
                                >
                                  {Object.entries(notificacion.parametros).map(
                                    ([key, value]) => (
                                      <Chip
                                        key={key}
                                        label={`${key}: ${
                                          Array.isArray(value)
                                            ? value.join(', ')
                                            : value
                                        }`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: '0.7rem',
                                          borderColor: color,
                                          color: color,
                                        }}
                                      />
                                    )
                                  )}
                                </Box>
                              )}

                            <Box display="flex" gap={1} mt={2}>
                              {!notificacion.leida && (
                                <Button
                                  size="small"
                                  onClick={() =>
                                    marcarComoLeida(notificacion.id)
                                  }
                                  startIcon={<CheckCircle />}
                                >
                                  Marcar como leída
                                </Button>
                              )}

                              <Button
                                size="small"
                                color="error"
                                onClick={() =>
                                  eliminarNotificacion(notificacion.id)
                                }
                                startIcon={<Close />}
                              >
                                Eliminar
                              </Button>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Fade>
                );
              })}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={marcarTodasComoLeidas}
            disabled={notificacionesNoLeidas === 0}
          >
            Marcar todas como leídas
          </Button>
          <Button onClick={() => setDialogAbierto(false)} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para nuevas notificaciones */}
      <Snackbar
        open={snackbarAbierto}
        autoHideDuration={6000}
        onClose={() => setSnackbarAbierto(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Zoom}
      >
        <Alert
          onClose={() => setSnackbarAbierto(false)}
          severity="warning"
          sx={{
            backgroundColor: ultimaNotificacion
              ? obtenerColorSeveridad(
                  ultimaNotificacion.tipo,
                  ultimaNotificacion.prioridad
                )
              : '#f39c12',
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' },
            '& .MuiAlert-action': { color: 'white' },
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {ultimaNotificacion?.titulo || 'Nueva notificación'}
          </Typography>
          <Typography variant="body2">
            {ultimaNotificacion?.mensaje || 'Nueva actividad detectada'}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
};

export default SistemaNotificaciones;
