import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Button,
  IconButton,
  Collapse,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';

import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  PhotoCamera as PhotoCameraIcon,
  CalendarToday as DateIcon,
  Notes as NotesIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  LocalPolice as PoliceIcon,
  DirectionsCar as CarIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
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
      tipo: delito.tipo || '',
      modalidad: delito.modalidad || '',
      descripcion: delito.descripcion || '',
      lugar: delito.lugar || '',
      fecha_hecho: delito.fecha_hecho || '',
      observaciones: delito.observaciones || '',
    });
    setEditDialog({ open: true, delito });
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!editForm.descripcion?.trim()) {
      setEditError('La descripción es requerida');
      return;
    }
    try {
      await onActualizar(editDialog.delito.id, editForm);
      setEditDialog({ open: false, delito: null });
      showToast('Antecedente actualizado exitosamente', 'success');
    } catch (error) {
      setEditError('Error al actualizar el antecedente');
    }
  };

  const handleDelete = async () => {
    try {
      await onEliminar(deleteDialog.delito.id);
      setDeleteDialog({ open: false, delito: null });
      showToast('Antecedente eliminado exitosamente', 'success');
    } catch (error) {
      showToast('Error al eliminar el antecedente', 'error');
    }
  };

  const getTipoIcon = tipo => {
    switch (tipo) {
      case 'robo':
        return '🔓';
      case 'hurto':
        return '👜';
      case 'lesiones':
        return '🩹';
      case 'amenazas':
        return '⚠️';
      case 'estafa':
        return '💰';
      case 'daños':
        return '🔨';
      case 'violencia_domestica':
        return '🏠';
      case 'trafico_drogas':
        return '💊';
      default:
        return '📋';
    }
  };

  const formatFecha = fecha => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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
            crear nuevos registros específicos del sujeto.
          </Typography>
        </Box>
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
                <Typography variant="body2">
                  {delito.comisaria_hecho || 'No especificada'}
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
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => setViewDialog({ open: true, delito })}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setDeleteDialog({ open: true, delito })}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={delitos.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count}`
        }
      />
    </TableContainer>
  );

  // Vista de tarjetas mejorada con estilo policial
  const renderCardView = () => (
    <Grid container spacing={3}>
      {delitos.map(delito => {
        const isExpanded = expandedItems.has(delito.id);

        return (
          <Grid item xs={12} key={delito.id}>
            <Card
              elevation={3}
              sx={{
                borderLeft: `6px solid #1a365d`,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  borderLeft: `6px solid #2c5282`,
                },
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                {/* Header del delito con estilo policial */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                    p: 2,
                    bgcolor: 'rgba(26, 54, 93, 0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(26, 54, 93, 0.1)',
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
                      <Box
                        sx={{
                          fontSize: '1.5em',
                          backgroundColor: '#1a365d',
                          color: 'white',
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {getTipoIcon(delito.tipo)}
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#1a365d',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {delito.tipo.charAt(0).toUpperCase() +
                            delito.tipo.slice(1).replace('_', ' ')}
                        </Typography>
                        {delito.modalidad && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#666',
                              fontWeight: 500,
                              fontStyle: 'italic',
                            }}
                          >
                            {delito.modalidad.charAt(0).toUpperCase() +
                              delito.modalidad.slice(1).replace('_', ' ')}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
                    >
                      <Chip
                        icon={<DateIcon />}
                        label={formatFecha(delito.fecha_hecho)}
                        variant="outlined"
                        size="medium"
                        sx={{
                          borderColor: '#1a365d',
                          color: '#1a365d',
                          fontWeight: 500,
                        }}
                      />
                      {delito.comisaria_hecho && (
                        <Chip
                          icon={<LocationIcon />}
                          label={delito.comisaria_hecho}
                          variant="outlined"
                          size="medium"
                          sx={{
                            borderColor: '#2c5282',
                            color: '#2c5282',
                            fontWeight: 500,
                          }}
                        />
                      )}
                      {delito.fotos?.length > 0 && (
                        <Chip
                          icon={<PhotoCameraIcon />}
                          label={`${delito.fotos.length} evidencia${
                            delito.fotos.length > 1 ? 's' : ''
                          }`}
                          variant="filled"
                          size="medium"
                          sx={{
                            bgcolor: '#ed6c02',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Stack>

                    <Box
                      sx={{
                        p: 2,
                        bgcolor: '#f8f9fa',
                        borderRadius: 1,
                        border: '1px solid #dee2e6',
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#495057',
                          lineHeight: 1.6,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'none' : 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        <strong>Descripción:</strong> {delito.descripcion}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton
                    size="large"
                    onClick={() => toggleExpanded(delito.id)}
                    sx={{
                      ml: 2,
                      bgcolor: '#1a365d',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#2c5282',
                      },
                    }}
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                {/* Información expandida con estilo policial */}
                <Collapse in={isExpanded}>
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: 'rgba(26, 54, 93, 0.02)',
                      borderRadius: 1,
                      border: '1px solid rgba(26, 54, 93, 0.1)',
                    }}
                  >
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
                            <LocationIcon sx={{ color: '#1a365d' }} />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Lugar:
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {delito.lugar}
                          </Typography>
                        </Grid>
                      )}

                      {delito.fecha_carga && (
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <AccessTimeIcon sx={{ color: '#1a365d' }} />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Fecha de carga:
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatFecha(delito.fecha_carga)}
                          </Typography>
                        </Grid>
                      )}

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
                            <NotesIcon sx={{ color: '#1a365d' }} />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Observaciones:
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {delito.observaciones}
                          </Typography>
                        </Grid>
                      )}

                      {/* Galería de fotos/evidencias */}
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
                            <PhotoCameraIcon sx={{ color: '#ed6c02' }} />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Evidencias ({delito.fotos.length}):
                            </Typography>
                          </Box>
                          <Box
                            sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                          >
                            {delito.fotos.map((foto, index) => (
                              <Box
                                key={index}
                                component="img"
                                src={foto}
                                alt={`Evidencia ${index + 1}`}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  border: '2px solid #e0e0e0',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    border: '2px solid #1a365d',
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Collapse>
              </CardContent>

              <CardActions
                sx={{
                  justifyContent: 'flex-end',
                  pt: 0,
                  bgcolor: 'rgba(248, 249, 250, 0.8)',
                  borderTop: '1px solid #dee2e6',
                }}
              >
                <Button
                  size="medium"
                  startIcon={<VisibilityIcon />}
                  onClick={() => setViewDialog({ open: true, delito })}
                  sx={{
                    color: '#1a365d',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'rgba(26, 54, 93, 0.1)',
                    },
                  }}
                >
                  REVISAR
                </Button>
                <Button
                  size="medium"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialog({ open: true, delito })}
                  sx={{
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'rgba(211, 47, 47, 0.1)',
                    },
                  }}
                >
                  ELIMINAR
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
      {/* Header con estilo policial mejorado */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          p: 3,
          background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
          borderRadius: 2,
          color: 'white',
          boxShadow: '0 4px 12px rgba(26, 54, 93, 0.3)',
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: 1,
              mb: 0.5,
            }}
          >
            📋 ANTECEDENTES PERSONALES ({delitos.length})
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Historial específico de delitos registrados
          </Typography>
        </Box>

        {delitos.length > 5 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={viewMode === 'cards' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('cards')}
              sx={{
                color: viewMode === 'cards' ? '#1a365d' : 'white',
                borderColor: 'white',
                bgcolor: viewMode === 'cards' ? 'white' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Tarjetas
            </Button>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('table')}
              sx={{
                color: viewMode === 'table' ? '#1a365d' : 'white',
                borderColor: 'white',
                bgcolor: viewMode === 'table' ? 'white' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Tabla
            </Button>
          </Box>
        )}
      </Box>

      {/* Contenido principal */}
      {viewMode === 'table' ? renderTableView() : renderCardView()}

      {/* Dialog de vista detallada */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, delito: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a365d', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: '1.5em' }}>
              {viewDialog.delito && getTipoIcon(viewDialog.delito.tipo)}
            </span>
            <Typography variant="h6" sx={{ textTransform: 'uppercase' }}>
              Detalle del Antecedente
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {viewDialog.delito && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="primary">
                  <strong>Tipo:</strong>
                </Typography>
                <Typography variant="body2">
                  {viewDialog.delito.tipo.charAt(0).toUpperCase() +
                    viewDialog.delito.tipo.slice(1).replace('_', ' ')}
                </Typography>
              </Grid>
              {viewDialog.delito.modalidad && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="primary">
                    <strong>Modalidad:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {viewDialog.delito.modalidad.replace('_', ' ')}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="primary">
                  <strong>Fecha del hecho:</strong>
                </Typography>
                <Typography variant="body2">
                  {formatFecha(viewDialog.delito.fecha_hecho)}
                </Typography>
              </Grid>
              {viewDialog.delito.lugar && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">
                    <strong>Lugar:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {viewDialog.delito.lugar}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">
                  <strong>Descripción:</strong>
                </Typography>
                <Typography variant="body2">
                  {viewDialog.delito.descripcion}
                </Typography>
              </Grid>
              {viewDialog.delito.observaciones && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">
                    <strong>Observaciones:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {viewDialog.delito.observaciones}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, delito: null })}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, delito: null })}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar este antecedente personal? Esta
            acción no se puede deshacer.
          </DialogContentText>
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
    </Box>
  );
}
