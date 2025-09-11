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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useToast } from './ToastProvider';

/**
 * Componente para mostrar la lista de delitos específicos de un sujeto
 */
export default function ListaDelitosEspecificos({
  delitos,
  onActualizar,
  onEliminar,
  loading,
}) {
  const { showToast } = useToast();
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [editDialog, setEditDialog] = useState({ open: false, delito: null });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    delito: null,
  });
  const [viewDialog, setViewDialog] = useState({ open: false, delito: null });

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
      showToast('Delito actualizado correctamente', 'success');
      setEditDialog({ open: false, delito: null });
    } catch (err) {
      setEditError(err.message || 'Error al actualizar');
      showToast('Error al actualizar el delito', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await onEliminar(deleteDialog.delito.id);
      showToast('Delito eliminado correctamente', 'success');
      setDeleteDialog({ open: false, delito: null });
    } catch (err) {
      showToast('Error al eliminar el delito', 'error');
    }
  };

  const getEstadoColor = estado => {
    const colores = {
      activo: 'error',
      en_proceso: 'warning',
      resuelto: 'success',
      archivado: 'default',
      suspendido: 'secondary',
    };
    return colores[estado] || 'default';
  };

  const formatFecha = fecha => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (delitos.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay delitos específicos registrados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Los delitos específicos son independientes de los registros oficiales
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Delitos Específicos ({delitos.length})
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Nota:</strong> Estos delitos son específicos de este sujeto y
          no aparecen en las búsquedas generales del sistema.
        </Typography>
      </Alert>

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
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {delito.tipo.charAt(0).toUpperCase() +
                          delito.tipo.slice(1).replace('_', ' ')}
                        {delito.modalidad &&
                          ` - ${
                            delito.modalidad.charAt(0).toUpperCase() +
                            delito.modalidad.slice(1).replace('_', ' ')
                          }`}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip
                          label={
                            delito.estado.charAt(0).toUpperCase() +
                            delito.estado.slice(1).replace('_', ' ')
                          }
                          color={getEstadoColor(delito.estado)}
                          size="small"
                        />
                        <Chip
                          label={formatFecha(delito.fecha_hecho)}
                          variant="outlined"
                          size="small"
                        />
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
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Lugar
                          </Typography>
                          <Typography variant="body2">
                            {delito.lugar}
                          </Typography>
                        </Grid>
                      )}

                      {delito.comisaria_hecho && (
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Comisaría
                          </Typography>
                          <Typography variant="body2">
                            {delito.comisaria_hecho}
                          </Typography>
                        </Grid>
                      )}

                      {delito.juzgado && (
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Juzgado
                          </Typography>
                          <Typography variant="body2">
                            {delito.juzgado}
                          </Typography>
                        </Grid>
                      )}

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Registrado
                        </Typography>
                        <Typography variant="body2">
                          {formatFecha(delito.createdAt)}
                        </Typography>
                      </Grid>

                      {delito.observaciones && (
                        <Grid item xs={12}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Observaciones
                          </Typography>
                          <Typography variant="body2">
                            {delito.observaciones}
                          </Typography>
                        </Grid>
                      )}

                      {delito.fotos?.length > 0 && (
                        <Grid item xs={12}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Fotografías ({delito.fotos.length})
                          </Typography>
                          <Box
                            sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                          >
                            {delito.fotos.slice(0, 6).map((foto, index) => (
                              <Avatar
                                key={index}
                                src={foto}
                                variant="rounded"
                                sx={{
                                  width: 60,
                                  height: 60,
                                  cursor: 'pointer',
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
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(delito)}
                  >
                    Editar
                  </Button>
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

      {/* Dialog de edición */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, delito: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar Delito Específico</DialogTitle>
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
                <MenuItem value="activo">Activo</MenuItem>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, delito: null })}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, delito: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar este delito específico? Esta acción
            no se puede deshacer.
          </Typography>
          {deleteDialog.delito && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {deleteDialog.delito.tipo} -{' '}
                {formatFecha(deleteDialog.delito.fecha_hecho)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {deleteDialog.delito.descripcion.substring(0, 100)}...
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
            Eliminar
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
          }}
        >
          <Typography variant="h6">Detalle del Delito</Typography>
          <IconButton
            onClick={() => setViewDialog({ open: false, delito: null })}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewDialog.delito && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {viewDialog.delito.tipo.charAt(0).toUpperCase() +
                    viewDialog.delito.tipo.slice(1)}
                  {viewDialog.delito.modalidad &&
                    ` - ${viewDialog.delito.modalidad}`}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={viewDialog.delito.estado}
                    color={getEstadoColor(viewDialog.delito.estado)}
                  />
                  <Chip
                    label={formatFecha(viewDialog.delito.fecha_hecho)}
                    variant="outlined"
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Descripción
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {viewDialog.delito.descripcion}
                </Typography>
              </Grid>

              {viewDialog.delito.fotos?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Fotografías
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: 2,
                    }}
                  >
                    {viewDialog.delito.fotos.map((foto, index) => (
                      <img
                        key={index}
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: '1px solid #ddd',
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
