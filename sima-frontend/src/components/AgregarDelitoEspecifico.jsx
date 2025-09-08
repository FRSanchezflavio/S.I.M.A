import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useToast } from './ToastProvider';

/**
 * Componente para agregar delitos específicos a un sujeto
 * Estos delitos no aparecen en las búsquedas generales
 */
export default function AgregarDelitoEspecifico({
  open,
  onClose,
  onAgregar,
  sujetoInfo,
  loading,
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    tipo: '',
    modalidad: '',
    descripcion: '',
    lugar: '',
    comisaria_hecho: '',
    estado: 'activo',
    juzgado: '',
    fecha_hecho: new Date().toISOString().split('T')[0],
    observaciones: '',
  });
  const [fotos, setFotos] = useState([]);
  const [error, setError] = useState('');

  // Opciones para los campos select
  const tiposDelito = [
    { value: 'robo', label: 'Robo' },
    { value: 'hurto', label: 'Hurto' },
    { value: 'estafa', label: 'Estafa' },
    { value: 'amenazas', label: 'Amenazas' },
    { value: 'lesiones', label: 'Lesiones' },
    { value: 'daños', label: 'Daños' },
    { value: 'usurpacion', label: 'Usurpación' },
    { value: 'violencia_genero', label: 'Violencia de Género' },
    { value: 'drogas', label: 'Infracción Ley de Drogas' },
    { value: 'otros', label: 'Otros' },
  ];

  const modalidades = [
    { value: 'arrebato', label: 'Arrebato' },
    { value: 'descuido', label: 'Descuido' },
    { value: 'destreza', label: 'Destreza' },
    { value: 'escalamiento', label: 'Escalamiento' },
    { value: 'fuerza_puerta', label: 'Fuerza en puerta' },
    { value: 'fuerza_ventana', label: 'Fuerza en ventana' },
    { value: 'intimidacion', label: 'Intimidación' },
    { value: 'llave_falsa', label: 'Llave falsa' },
    { value: 'motochorro', label: 'Motochorro' },
    { value: 'violencia', label: 'Violencia' },
    { value: 'engaño', label: 'Engaño' },
    { value: 'digital', label: 'Digital/Virtual' },
    { value: 'otro', label: 'Otro' },
  ];

  const estados = [
    { value: 'activo', label: 'Activo' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'resuelto', label: 'Resuelto' },
    { value: 'archivado', label: 'Archivado' },
    { value: 'suspendido', label: 'Suspendido' },
  ];

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    if (error) setError('');
  };

  const handleFotoChange = e => {
    const files = Array.from(e.target.files || []);
    const fotoUrls = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setFotos(prev => [...prev, ...fotoUrls]);
  };

  const removerFoto = index => {
    setFotos(prev => {
      const nueva = [...prev];
      // Liberar URL del objeto para evitar memory leaks
      if (nueva[index]?.url) {
        URL.revokeObjectURL(nueva[index].url);
      }
      nueva.splice(index, 1);
      return nueva;
    });
  };

  const handleSubmit = async () => {
    setError('');

    // Validaciones
    if (!form.tipo) {
      setError('El tipo de delito es obligatorio');
      return;
    }

    if (!form.descripcion.trim()) {
      setError('La descripción es obligatoria');
      return;
    }

    if (form.descripcion.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }

    try {
      // Preparar datos del delito
      const delitoData = {
        ...form,
        descripcion: form.descripcion.trim(),
        fotos: fotos.map(foto => foto.url), // En un caso real, aquí subirías las fotos
      };

      await onAgregar(delitoData);

      showToast('Delito específico agregado correctamente', 'success');
      handleClose();
    } catch (err) {
      setError(err.message || 'Error al agregar el delito');
      showToast('Error al agregar el delito', 'error');
    }
  };

  const handleClose = () => {
    // Limpiar URLs de objetos para evitar memory leaks
    fotos.forEach(foto => {
      if (foto.url) URL.revokeObjectURL(foto.url);
    });

    setForm({
      tipo: '',
      modalidad: '',
      descripcion: '',
      lugar: '',
      comisaria_hecho: '',
      estado: 'activo',
      juzgado: '',
      fecha_hecho: new Date().toISOString().split('T')[0],
      observaciones: '',
    });
    setFotos([]);
    setError('');
    onClose();
  };

  const canSave = form.tipo && form.descripcion.trim().length >= 10;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
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
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Agregar Delito Específico
          </Typography>
          {sujetoInfo && (
            <Typography variant="subtitle2" color="text.secondary">
              Sujeto: {sujetoInfo.apellido}, {sujetoInfo.nombre} - DNI:{' '}
              {sujetoInfo.dni}
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Información básica del delito */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Tipo de delito *"
              fullWidth
              value={form.tipo}
              onChange={e => handleChange('tipo', e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Seleccionar tipo</MenuItem>
              {tiposDelito.map(tipo => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Modalidad"
              fullWidth
              value={form.modalidad}
              onChange={e => handleChange('modalidad', e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Seleccionar modalidad</MenuItem>
              {modalidades.map(modalidad => (
                <MenuItem key={modalidad.value} value={modalidad.value}>
                  {modalidad.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Estado del caso"
              fullWidth
              value={form.estado}
              onChange={e => handleChange('estado', e.target.value)}
              sx={{ mb: 2 }}
            >
              {estados.map(estado => (
                <MenuItem key={estado.value} value={estado.value}>
                  {estado.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Fecha del hecho"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.fecha_hecho}
              onChange={e => handleChange('fecha_hecho', e.target.value)}
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Detalles del delito */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Lugar del hecho"
              fullWidth
              value={form.lugar}
              onChange={e => handleChange('lugar', e.target.value)}
              placeholder="Ej: Av. Corrientes 1234, CABA"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Comisaría del hecho"
              fullWidth
              value={form.comisaria_hecho}
              onChange={e => handleChange('comisaria_hecho', e.target.value)}
              placeholder="Ej: Comisaría 15ta"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Juzgado interviniente"
              fullWidth
              value={form.juzgado}
              onChange={e => handleChange('juzgado', e.target.value)}
              placeholder="Ej: Juzgado Nacional en lo Criminal N° 45"
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Descripción detallada */}
          <Grid item xs={12}>
            <TextField
              label="Descripción del delito *"
              fullWidth
              multiline
              rows={4}
              value={form.descripcion}
              onChange={e => handleChange('descripcion', e.target.value)}
              placeholder="Describa detalladamente los hechos ocurridos..."
              helperText={`${form.descripcion.length}/1000 caracteres (mínimo 10)`}
              inputProps={{ maxLength: 1000 }}
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Observaciones adicionales */}
          <Grid item xs={12}>
            <TextField
              label="Observaciones adicionales"
              fullWidth
              multiline
              rows={2}
              value={form.observaciones}
              onChange={e => handleChange('observaciones', e.target.value)}
              placeholder="Información adicional relevante..."
              inputProps={{ maxLength: 500 }}
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Sección de fotos */}
          <Grid item xs={12}>
            <Box sx={{ border: '2px dashed #ddd', borderRadius: 2, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhotoCameraIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2">
                  Fotografías del delito (opcional)
                </Typography>
              </Box>

              <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                Seleccionar imágenes
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleFotoChange}
                />
              </Button>

              {fotos.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {fotos.map((foto, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img
                        src={foto.url}
                        alt={`Foto ${index + 1}`}
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 4,
                          border: '1px solid #ddd',
                        }}
                      />
                      <Chip
                        label="×"
                        size="small"
                        clickable
                        onClick={() => removerFoto(index)}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          minWidth: 20,
                          height: 20,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSave || loading}
          sx={{
            bgcolor: '#000',
            '&:hover': { bgcolor: '#333' },
            '&:disabled': { bgcolor: '#ccc' },
          }}
        >
          {loading ? 'Agregando...' : 'Agregar Delito'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
