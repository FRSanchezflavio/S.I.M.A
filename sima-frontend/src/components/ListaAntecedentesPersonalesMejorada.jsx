import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Button,
  Grid,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Divider,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  TablePagination,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  DateRange as DateIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useToast } from './ToastProvider';

/**
 * Componente mejorado para mostrar la lista de antecedentes personales
 * con mejor visualización y funcionalidad completa
 */
export default function ListaAntecedentesPersonales({
  delitos,
  onActualizar,
  onEliminar,
  loading,
  showTableView = false,
}) {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState(showTableView ? 'table' : 'cards');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [editDialog, setEditDialog] = useState({ open: false, delito: null });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    delito: null,
  });
  const [viewDialog, setViewDialog] = useState({ open: false, delito: null });

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Estados para edición
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');

  const toggleExpanded = delitoId => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(delitoId)) {
      newExpanded.delete(delitoId);
    } else {
      newExpanded.add(delitoId);
    }
    setExpandedItems(newExpanded);
  };

  const handleEdit = delito => {
    setEditForm({
      tipo: delito.tipo,
      modalidad: delito.modalidad,
      descripcion: delito.descripcion,
      lugar: delito.lugar,
      comisaria_hecho: delito.comisaria_hecho,
      estado: delito.estado,
      juzgado: delito.juzgado,
      fecha_hecho: delito.fecha_hecho,
      observaciones: delito.observaciones,
    });
    setEditDialog({ open: true, delito });
    setEditError('');
  };

  const handleSaveEdit = async () => {
    setEditError('');

    if (!editForm.tipo || !editForm.descripcion?.trim()) {
      setEditError('Tipo y descripción son obligatorios');
      return;
    }

    try {
      await onActualizar(editDialog.delito.id, editForm);
      showToast('Antecedente actualizado correctamente', 'success');
      setEditDialog({ open: false, delito: null });
    } catch (err) {
      setEditError(err.message || 'Error al actualizar');
      showToast('Error al actualizar el antecedente', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await onEliminar(deleteDialog.delito.id);
      showToast('Antecedente eliminado correctamente', 'success');
      setDeleteDialog({ open: false, delito: null });
    } catch (err) {
      showToast('Error al eliminar el antecedente', 'error');
    }
  };

  const getEstadoColor = estado => {
    const colores = {
      en_proceso: 'warning',
      resuelto: 'success',
      archivado: 'default',
      suspendido: 'secondary',
    };
    return colores[estado] || 'default';
  };

  const getTipoIcon = tipo => {
    const iconos = {
      robo: '🚨',
      hurto: '🔍',
      estafa: '💰',
      amenazas: '⚠️',
      lesiones: '🏥',
      otros: '📋',
    };
    return iconos[tipo] || '📋';
  };

  const formatFecha = fecha => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatEstado = estado => {
    const estados = {
      en_proceso: 'En Proceso',
      resuelto: 'Resuelto',
      archivado: 'Archivado',
      suspendido: 'Suspendido',
    };
    return estados[estado] || estado;
  };

  // Paginación para tabla
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDelitos = delitos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Estado vacío mejorado
  if (delitos.length === 0) {
    // Debug info
    console.log('ListaAntecedentesPersonalesMejorada - No hay delitos:', {
      delitos,
      loading,
      totalDelitos: delitos.length,
    });

    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay antecedentes personales registrados
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Los antecedentes personales son independientes de los registros
          oficiales y permiten un seguimiento detallado del historial específico
          del sujeto.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          💡 Los delitos cargados desde el formulario "Cargar" se crean
          automáticamente como antecedentes personales.
        </Typography>
        <Box
          sx={{
            p: 2,
            bgcolor: 'info.light',
            borderRadius: 1,
            color: 'info.dark',
            maxWidth: 400,
            mx: 'auto',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            💡 <strong>Tip:</strong> Use el botón "AGREGAR DELITO PERSONAL" para
            comenzar a registrar el historial específico de este sujeto, o
            cargue una nueva persona con datos de delito desde el formulario
            principal.
          </Typography>
        </Box>

        {/* Información de debug en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <Box
            sx={{
              mt: 2,
              p: 1,
              bgcolor: 'grey.100',
              borderRadius: 1,
              fontSize: '0.8em',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Debug: {delitos.length} delitos cargados, loading:{' '}
              {loading.toString()}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  }

  // Vista de tabla
  const renderTableView = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell>
              <strong>Tipo</strong>
            </TableCell>
            <TableCell>
              <strong>Fecha</strong>
            </TableCell>
            <TableCell>
              <strong>Estado</strong>
            </TableCell>
            <TableCell>
              <strong>Comisaría</strong>
            </TableCell>
            <TableCell>
              <strong>Descripción</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Acciones</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedDelitos.map(delito => (
            <TableRow
              key={delito.id}
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{getTipoIcon(delito.tipo)}</span>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {delito.tipo.charAt(0).toUpperCase() +
                        delito.tipo.slice(1).replace('_', ' ')}
                    </Typography>
                    {delito.modalidad && (
                      <Typography variant="caption" color="text.secondary">
                        {delito.modalidad.replace('_', ' ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatFecha(delito.fecha_hecho)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={formatEstado(delito.estado)}
                  color={getEstadoColor(delito.estado)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {delito.comisaria_hecho || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {delito.descripcion}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={0.5} justifyContent="center">
                  <Tooltip title="Ver detalles">
                    <IconButton
                      size="small"
                      onClick={() => setViewDialog({ open: true, delito })}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => handleEdit(delito)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, delito })}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* <TablePagination
        component="div"
        count={delitos.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Registros por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      /> */}
    </TableContainer>
  );

  // Vista de tarjetas (original mejorada)
  const renderCardView = () => (
    <Grid container spacing={2}>
      {delitos.map(delito => {
        const isExpanded = expandedItems.has(delito.id);

        return (
          <Grid item xs={12} key={delito.id}>
            <Card
              elevation={2}
              sx={{
                borderLeft: `4px solid ${
                  getEstadoColor(delito.estado) === 'error'
                    ? '#f44336'
                    : getEstadoColor(delito.estado) === 'warning'
                    ? '#ff9800'
                    : getEstadoColor(delito.estado) === 'success'
                    ? '#666666'
                    : '#9e9e9e'
                }`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                {/* Header del delito */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <span style={{ fontSize: '1.2em' }}>
                        {getTipoIcon(delito.tipo)}
                      </span>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {delito.tipo.charAt(0).toUpperCase() +
                          delito.tipo.slice(1).replace('_', ' ')}
                        {delito.modalidad &&
                          ` - ${
                            delito.modalidad.charAt(0).toUpperCase() +
                            delito.modalidad.slice(1).replace('_', ' ')
                          }`}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}
                    >
                      <Chip
                        label={formatEstado(delito.estado)}
                        color={getEstadoColor(delito.estado)}
                        size="small"
                      />
                      <Chip
                        icon={<DateIcon />}
                        label={formatFecha(delito.fecha_hecho)}
                        variant="outlined"
                        size="small"
                      />
                      {delito.comisaria_hecho && (
                        <Chip
                          icon={<LocationIcon />}
                          label={delito.comisaria_hecho}
                          variant="outlined"
                          size="small"
                        />
                      )}
                      {delito.fotos?.length > 0 && (
                        <Chip
                          icon={<PhotoCameraIcon />}
                          label={`${delito.fotos.length} foto${
                            delito.fotos.length > 1 ? 's' : ''
                          }`}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'none' : 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4,
                      }}
                    >
                      {delito.descripcion}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => toggleExpanded(delito.id)}
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </Box>

                {/* Información expandida */}
                <Collapse in={isExpanded}>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {delito.lugar && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <LocationIcon fontSize="small" color="action" />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Lugar del Hecho
                          </Typography>
                        </Box>
                        <Typography variant="body2">{delito.lugar}</Typography>
                      </Grid>
                    )}

                    {delito.juzgado && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <GavelIcon fontSize="small" color="action" />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Juzgado
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {delito.juzgado}
                        </Typography>
                      </Grid>
                    )}

                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <DateIcon fontSize="small" color="action" />
                        <Typography variant="subtitle2" color="text.secondary">
                          Fecha de Registro
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {formatFecha(delito.createdAt)}
                      </Typography>
                    </Grid>

                    {delito.observaciones && (
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <DescriptionIcon fontSize="small" color="action" />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Observaciones
                          </Typography>
                        </Box>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="body2">
                            {delito.observaciones}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}

                    {delito.fotos?.length > 0 && (
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <PhotoCameraIcon fontSize="small" color="action" />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Evidencia Fotográfica ({delito.fotos.length})
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {delito.fotos.slice(0, 6).map((foto, index) => (
                            <Avatar
                              key={index}
                              src={foto}
                              variant="rounded"
                              sx={{
                                width: 60,
                                height: 60,
                                cursor: 'pointer',
                                border: '2px solid #ddd',
                                '&:hover': { opacity: 0.8 },
                              }}
                              onClick={() =>
                                setViewDialog({ open: true, delito })
                              }
                            />
                          ))}
                          {delito.fotos.length > 6 && (
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 60,
                                height: 60,
                                bgcolor: 'grey.300',
                                cursor: 'pointer',
                                border: '2px solid #ddd',
                              }}
                              onClick={() =>
                                setViewDialog({ open: true, delito })
                              }
                            >
                              +{delito.fotos.length - 6}
                            </Avatar>
                          )}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Collapse>
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => setViewDialog({ open: true, delito })}
                >
                  Ver
                </Button>
                {/* <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(delito)}
                >
                  Editar
                </Button> */}
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialog({ open: true, delito })}
                >
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  return (
    <Box>
      {/* Header con estadísticas y controles */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: 'text.primary' }}
          >
            Antecedentes Personales ({delitos.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historial específico independiente de registros oficiales
          </Typography>
        </Box>

        {delitos.length > 5 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={viewMode === 'cards' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('cards')}
            >
              Tarjetas
            </Button>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('table')}
            >
              Tabla
            </Button>
          </Box>
        )}
      </Box>

      {/* Resumen estadístico */}
      {delitos.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Typography variant="body2">
              <strong>Resueltos:</strong>{' '}
              {delitos.filter(d => d.estado === 'resuelto').length}
            </Typography>
            <Typography variant="body2">
              <strong>Último registro:</strong>{' '}
              {formatFecha(
                Math.max(...delitos.map(d => new Date(d.createdAt)))
              )}
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Contenido principal */}
      {viewMode === 'table' ? renderTableView() : renderCardView()}

      {/* Dialog de edición */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, delito: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar Antecedente Personal</DialogTitle>
        <DialogContent dividers>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Tipo de delito"
                fullWidth
                value={editForm.tipo || ''}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, tipo: e.target.value }))
                }
                sx={{ mb: 2 }}
              >
                <MenuItem value="robo">Robo</MenuItem>
                <MenuItem value="hurto">Hurto</MenuItem>
                <MenuItem value="estafa">Estafa</MenuItem>
                <MenuItem value="amenazas">Amenazas</MenuItem>
                <MenuItem value="lesiones">Lesiones</MenuItem>
                <MenuItem value="otros">Otros</MenuItem>
              </TextField>

              <TextField
                select
                label="Estado"
                fullWidth
                value={editForm.estado || ''}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, estado: e.target.value }))
                }
                sx={{ mb: 2 }}
              >
                <MenuItem value="en_proceso">En Proceso</MenuItem>
                <MenuItem value="resuelto">Resuelto</MenuItem>
                <MenuItem value="archivado">Archivado</MenuItem>
                <MenuItem value="suspendido">Suspendido</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Lugar"
                fullWidth
                value={editForm.lugar || ''}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, lugar: e.target.value }))
                }
                sx={{ mb: 2 }}
              />

              <TextField
                type="date"
                label="Fecha del hecho"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={editForm.fecha_hecho || ''}
                onChange={e =>
                  setEditForm(prev => ({
                    ...prev,
                    fecha_hecho: e.target.value,
                  }))
                }
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Comisaría del hecho"
                fullWidth
                value={editForm.comisaria_hecho || ''}
                onChange={e =>
                  setEditForm(prev => ({
                    ...prev,
                    comisaria_hecho: e.target.value,
                  }))
                }
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={4}
                value={editForm.descripcion || ''}
                onChange={e =>
                  setEditForm(prev => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Observaciones"
                fullWidth
                multiline
                rows={3}
                value={editForm.observaciones || ''}
                onChange={e =>
                  setEditForm(prev => ({
                    ...prev,
                    observaciones: e.target.value,
                  }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, delito: null })}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, delito: null })}
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción no se puede deshacer. El antecedente se eliminará
            permanentemente.
          </Alert>
          <Typography>
            ¿Está seguro que desea eliminar este antecedente personal?
          </Typography>
          {deleteDialog.delito && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {getTipoIcon(deleteDialog.delito.tipo)}{' '}
                {deleteDialog.delito.tipo.toUpperCase()} -{' '}
                {formatFecha(deleteDialog.delito.fecha_hecho)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {deleteDialog.delito.descripcion.substring(0, 100)}
                {deleteDialog.delito.descripcion.length > 100 && '...'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, delito: null })}
          >
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar Definitivamente
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de visualización completa */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, delito: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography variant="h6">Detalle del Antecedente Personal</Typography>
          <IconButton
            onClick={() => setViewDialog({ open: false, delito: null })}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewDialog.delito && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}
                >
                  <Box sx={{ fontSize: '2em' }}>
                    {getTipoIcon(viewDialog.delito.tipo)}
                  </Box>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {viewDialog.delito.tipo.charAt(0).toUpperCase() +
                        viewDialog.delito.tipo.slice(1).replace('_', ' ')}
                      {viewDialog.delito.modalidad &&
                        ` - ${viewDialog.delito.modalidad.replace('_', ' ')}`}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={formatEstado(viewDialog.delito.estado)}
                        color={getEstadoColor(viewDialog.delito.estado)}
                      />
                      <Chip
                        icon={<DateIcon />}
                        label={formatFecha(viewDialog.delito.fecha_hecho)}
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Descripción del Hecho
                  </Typography>
                  <Typography variant="body1">
                    {viewDialog.delito.descripcion}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  <LocationIcon
                    fontSize="small"
                    sx={{ verticalAlign: 'middle', mr: 1 }}
                  />
                  Información del Lugar
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Lugar:</strong>{' '}
                  {viewDialog.delito.lugar || 'No especificado'}
                </Typography>
                <Typography variant="body2">
                  <strong>Comisaría:</strong>{' '}
                  {viewDialog.delito.comisaria_hecho || 'No especificada'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  <DateIcon
                    fontSize="small"
                    sx={{ verticalAlign: 'middle', mr: 1 }}
                  />
                  Información Temporal
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Fecha del hecho:</strong>{' '}
                  {formatFecha(viewDialog.delito.fecha_hecho)}
                </Typography>
                <Typography variant="body2">
                  <strong>Registrado:</strong>{' '}
                  {formatFecha(viewDialog.delito.createdAt)}
                </Typography>
              </Grid>

              {viewDialog.delito.juzgado && (
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    <GavelIcon
                      fontSize="small"
                      sx={{ verticalAlign: 'middle', mr: 1 }}
                    />
                    Información Judicial
                  </Typography>
                  <Typography variant="body2">
                    <strong>Juzgado:</strong> {viewDialog.delito.juzgado}
                  </Typography>
                </Grid>
              )}

              {viewDialog.delito.observaciones && (
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    <DescriptionIcon
                      fontSize="small"
                      sx={{ verticalAlign: 'middle', mr: 1 }}
                    />
                    Observaciones Adicionales
                  </Typography>
                  <Paper
                    sx={{ p: 2, bgcolor: 'info.light', color: 'info.dark' }}
                  >
                    <Typography variant="body2">
                      {viewDialog.delito.observaciones}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {viewDialog.delito.fotos?.length > 0 && (
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    <PhotoCameraIcon
                      fontSize="small"
                      sx={{ verticalAlign: 'middle', mr: 1 }}
                    />
                    Evidencia Fotográfica ({viewDialog.delito.fotos.length})
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 2,
                    }}
                  >
                    {viewDialog.delito.fotos.map((foto, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={foto}
                          alt={`Evidencia ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: '2px solid #ddd',
                          }}
                        />
                        <Chip
                          label={`Foto ${index + 1}`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<EditIcon />}
            onClick={() => {
              setViewDialog({ open: false, delito: null });
              handleEdit(viewDialog.delito);
            }}
          >
            Editar
          </Button>
          <Button
            onClick={() => setViewDialog({ open: false, delito: null })}
            variant="contained"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
//           >
//             Cerrar
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }
