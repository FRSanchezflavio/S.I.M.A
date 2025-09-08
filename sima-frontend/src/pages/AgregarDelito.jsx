import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Box,
  MenuItem,
  Divider,
  Paper,
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FormInput from '../components/FormInput';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';

export default function AgregarDelito() {
  const location = useLocation();
  const nav = useNavigate();
  const { showToast } = useToast();

  // Obtener datos pre-rellenados desde la navegación
  const prefilledData = location.state?.prefilledData || {};
  const sujetoId = location.state?.sujetoId;

  const [form, setForm] = useState({
    tipo_delito: '',
    modalidad: '',
    nombre: prefilledData.nombre || '',
    apellido: prefilledData.apellido || '',
    dni: prefilledData.dni || '',
    fecha_nacimiento: prefilledData.fecha_nacimiento?.slice(0, 10) || '',
    edad: prefilledData.edad || '',
    genero: prefilledData.genero || '',
    nacionalidad: prefilledData.nacionalidad || '',
    direccion: prefilledData.direccion || '',
    telefono: prefilledData.telefono || '',
    observaciones: '',
    comisaria: prefilledData.comisaria || '',
    comisaria_hecho: prefilledData.comisaria_hecho || '',
    categoria: '',
    UnidadesRegionales: '',
    fecha_carga: new Date().toISOString().split('T')[0],
  });

  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  // Validación: solo requerir tipo de delito y modalidad para agregar nuevo delito
  const canSave = form.tipo_delito && form.modalidad && files.length > 0;

  const onFile = e => {
    setFiles(Array.from(e.target.files || []));
  };

  const onSubmit = async () => {
    setError('');
    setOk('');
    try {
      const data = new FormData();

      // Usar los datos existentes del sujeto con nueva información del delito
      const formData = { ...form };

      if (formData.UnidadesRegionales) {
        formData.unidades_regionales = formData.UnidadesRegionales;
        delete formData.UnidadesRegionales;
      }

      Object.keys(formData).forEach(k => {
        if (formData[k]) data.append(k, formData[k]);
      });

      files.forEach(f => data.append('files', f));

      await api.post('/personas', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setOk('Delito agregado exitosamente');
      showToast('Delito agregado exitosamente', 'success');

      // Redirigir de vuelta al detalle de la persona
      setTimeout(() => {
        nav(`/personas/${sujetoId}`);
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al agregar el delito');
      showToast('Error al agregar el delito', 'error');
    }
  };

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer?.files || []);
    if (dropped.length) setFiles(dropped);
  };

  const removeFile = idx => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Redirigir si no hay datos pre-rellenados
  useEffect(() => {
    if (!prefilledData.dni || !sujetoId) {
      nav('/buscar');
    }
  }, [prefilledData, sujetoId, nav]);

  return (
    <>
      <Header showSettings />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card className="card">
          <CardContent>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, mb: 4, color: '#000' }}
            >
              Agregar Nuevo Delito
            </Typography>

            {/* Información del sujeto */}
            <Paper
              elevation={1}
              sx={{
                p: 3,
                mb: 4,
                bgcolor: '#f8f9fa',
                border: '1px solid #e3f2fd',
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}
              >
                Información del Sujeto
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1">
                    <strong>Nombre:</strong> {form.apellido}, {form.nombre}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1">
                    <strong>DNI:</strong> {form.dni}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1">
                    <strong>Género:</strong> {form.genero || 'No especificado'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Alert severity="info" sx={{ mb: 3, color: '#000' }}>
              Complete la información del nuevo delito cometido por este sujeto
              y seleccione las fotografías correspondientes.
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 2, color: '#000' }}>
                {error}
              </Alert>
            )}
            {ok && (
              <Alert severity="success" sx={{ mb: 2, color: '#000' }}>
                {ok}
              </Alert>
            )}

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <FormInput
                  label="Tipo de delito"
                  value={form.tipo_delito}
                  onChange={v => setForm({ ...form, tipo_delito: v })}
                  select
                  required
                  InputLabelProps={{ style: { color: '#000' } }}
                >
                  <MenuItem value="">Seleccionar tipo</MenuItem>
                  <MenuItem value="robo">Robo</MenuItem>
                  <MenuItem value="hurto">Hurto</MenuItem>
                </FormInput>

                <FormInput
                  label="Modalidad"
                  value={form.modalidad}
                  onChange={v => setForm({ ...form, modalidad: v })}
                  select
                  required
                  InputLabelProps={{ style: { color: '#000' } }}
                >
                  <MenuItem value="">Seleccionar modalidad</MenuItem>
                  <MenuItem value="arrebato">Arrebato</MenuItem>
                  <MenuItem value="descuido">Descuido</MenuItem>
                  <MenuItem value="destreza">Destreza</MenuItem>
                  <MenuItem value="escalamiento">Escalamiento</MenuItem>
                  <MenuItem value="fuerza_puerta">Fuerza en puerta</MenuItem>
                  <MenuItem value="fuerza_ventana">Fuerza en ventana</MenuItem>
                  <MenuItem value="intimidacion">Intimidación</MenuItem>
                  <MenuItem value="llave_falsa">Llave falsa</MenuItem>
                  <MenuItem value="motochorro">Motochorro</MenuItem>
                  <MenuItem value="violencia">Violencia</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </FormInput>

                <FormInput
                  label="Comisaría donde sucedió el hecho"
                  value={form.comisaria_hecho}
                  onChange={v => setForm({ ...form, comisaria_hecho: v })}
                  InputLabelProps={{ style: { color: '#000' } }}
                />

                <FormInput
                  label="Fecha de carga"
                  type="date"
                  InputLabelProps={{ shrink: true, style: { color: '#000' } }}
                  value={form.fecha_carga}
                  onChange={v => setForm({ ...form, fecha_carga: v })}
                />

                <FormInput
                  label="Observaciones del delito"
                  value={form.observaciones}
                  onChange={v => setForm({ ...form, observaciones: v })}
                  multiline
                  rows={5}
                  InputLabelProps={{ style: { color: '#000' } }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => nav(`/personas/${sujetoId}`)}
                    sx={{
                      bgcolor: '#f1f1f1ff',
                      color: '#000',
                      '&:hover': {
                        bgcolor: 'rgb(21, 77, 113)',
                        color: '#fff',
                        transition: 'all 0.3s ease',
                      },
                    }}
                  >
                    ← VOLVER AL PERFIL
                  </Button>
                  <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={!canSave}
                    sx={{
                      bgcolor: '#000',
                      color: '#fff',
                      '&:hover': { bgcolor: 'rgb(21, 77, 113)' },
                    }}
                  >
                    AGREGAR DELITO
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  sx={{
                    p: 3,
                    border: `2px dashed ${dragActive ? '#15616f' : '#90a4ae'}`,
                    borderRadius: 2,
                    textAlign: 'center',
                    color: '#000',
                    position: 'relative',
                    bgcolor: dragActive
                      ? 'rgba(21,77,113,0.06)'
                      : 'transparent',
                    transition: 'all 0.15s ease',
                    minHeight: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: files.length === 0 ? 'pointer' : 'default',
                    '&:hover':
                      files.length === 0
                        ? {
                            borderColor: '#15616f',
                            bgcolor: 'rgba(21,77,113,0.03)',
                          }
                        : {},
                  }}
                  onClick={() =>
                    files.length === 0 &&
                    document.getElementById('file-input').click()
                  }
                >
                  {files.length === 0 ? (
                    <>
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          bgcolor: 'rgb(255, 249, 175)',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          border: '4px solid #ddd',
                        }}
                      >
                        <Box sx={{ fontSize: 60, color: '#999' }}>📷</Box>
                      </Box>

                      <Typography variant="h5" sx={{ mb: 1, color: '#000' }}>
                        {dragActive
                          ? 'Suelte las imágenes aquí'
                          : 'Fotografías del delito'}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                        Arrastre y suelte o seleccione imágenes
                      </Typography>

                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: 'rgb(13, 17, 100)',
                          '&:hover': { bgcolor: 'rgb(21, 77, 113)' },
                          color: '#fff',
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          document.getElementById('file-input').click();
                        }}
                      >
                        📁 SELECCIONAR IMÁGENES
                      </Button>

                      <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onFile}
                        style={{ display: 'none' }}
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" sx={{ mb: 2, color: '#000' }}>
                        Imágenes seleccionadas: {files.length}
                      </Typography>

                      <Button
                        variant="outlined"
                        onClick={() =>
                          document.getElementById('file-input-add').click()
                        }
                        sx={{
                          mb: 2,
                          borderColor: '#15616f',
                          color: '#15616f',
                          '&:hover': {
                            bgcolor: '#15616f',
                            color: '#fff',
                          },
                        }}
                      >
                        + AGREGAR MÁS IMÁGENES
                      </Button>

                      <input
                        id="file-input-add"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onFile}
                        style={{ display: 'none' }}
                      />

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fill, minmax(120px, 1fr))',
                          gap: 1,
                          mt: 2,
                          width: '100%',
                          maxHeight: 200,
                          overflowY: 'auto',
                        }}
                      >
                        {files.map((f, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              position: 'relative',
                              border: '1px solid #ddd',
                              borderRadius: 1,
                              overflow: 'hidden',
                              aspectRatio: '1',
                            }}
                          >
                            <img
                              src={URL.createObjectURL(f)}
                              alt={f.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <Button
                              size="small"
                              onClick={e => {
                                e.stopPropagation();
                                removeFile(idx);
                              }}
                              sx={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                minWidth: 24,
                                height: 24,
                                bgcolor: 'rgba(255,0,0,0.8)',
                                color: '#fff',
                                fontSize: 12,
                                '&:hover': {
                                  bgcolor: 'rgba(255,0,0,1)',
                                },
                              }}
                            >
                              ×
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </>
  );
}
