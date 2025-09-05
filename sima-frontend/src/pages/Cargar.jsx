import { useState } from 'react';
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
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FormInput from '../components/FormInput';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export default function Cargar() {
  // Estructura jerárquica de regionales y comisarías
  const regionalesData = {
    "URC": ["Comisaría URC 1", "Comisaría URC 2", "Comisaría URC 3"],
    "Norte": ["Comisaría Norte 1", "Comisaría Norte 2"],
    "Sur": ["Comisaría Sur 1", "Comisaría Sur 2", "Comisaría Sur 3"],
    "Centro": ["Comisaría Centro 1", "Comisaría Centro 2"]
  };

  const [form, setForm] = useState({
    tipo_delito: '',
    modalidad: '',
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    edad: '',
    genero: '',
    nacionalidad: '',
    direccion: '',
    telefono: '',
    observaciones: '',
    comisaria: '',
    comisaria_hecho: '',
    categoria: '',
    UnidadesRegionales: '',
    fecha_carga: new Date().toISOString().split('T')[0], // Fecha actual por defecto
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [comisariasDisponibles, setComisariasDisponibles] = useState([]);
  const nav = useNavigate();
  const { showToast } = useToast();

  const canSave = form.nombre && form.apellido && form.dni && files.length > 0;

  // Función para manejar el cambio de regional
  const handleRegionalChange = (regional) => {
    setForm(prev => ({
      ...prev,
      UnidadesRegionales: regional,
      comisaria: '' // Reset comisaría cuando cambia la regional
    }));
    
    // Actualizar comisarías disponibles según la regional seleccionada
    if (regional && regionalesData[regional]) {
      setComisariasDisponibles(regionalesData[regional]);
    } else {
      setComisariasDisponibles([]);
    }
  };

  const onFile = e => {
    setFiles(Array.from(e.target.files || []));
  };

  const onSubmit = async () => {
    setError('');
    setOk('');
    try {
      const data = new FormData();
      const formData = { ...form };
      // Mapear UnidadesRegionales a unidades_regionales para el backend
      if (formData.UnidadesRegionales) {
        formData.unidades_regionales = formData.UnidadesRegionales;
        delete formData.UnidadesRegionales;
      }
      Object.entries(formData).forEach(([k, v]) => data.append(k, v || ''));
      files.forEach(f => data.append('fotos', f));
      await api.post('/personas', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOk('Guardado correctamente');
      showToast('Persona guardada', 'success');
      setForm({
        tipo_delito: '',
        modalidad: '',
        nombre: '',
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        edad: '',
        genero: '',
        nacionalidad: '',
        direccion: '',
        telefono: '',
        observaciones: '',
        comisaria: '',
        comisaria_hecho: '',
        categoria: '',
        UnidadesRegionales: '',
        fecha_carga: new Date().toISOString().split('T')[0],
      });
      setFiles([]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al guardar');
      showToast('Error al guardar', 'error');
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
    if (dropped.length) setFiles(prev => [...prev, ...dropped]);
  };

  const removeFile = idx => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

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
              Cargar mencionado/aprehendido
            </Typography>
            <Alert severity="info" sx={{ mb: 2, color: '#000' }}>
              Complete todos los campos y seleccione al menos una fotografía
              para guardar los datos.
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
                  label="Apellido"
                  value={form.apellido}
                  onChange={v => setForm({ ...form, apellido: v })}
                  required
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="Nombre"
                  value={form.nombre}
                  onChange={v => setForm({ ...form, nombre: v })}
                  required
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="DNI"
                  value={form.dni}
                  onChange={v => setForm({ ...form, dni: v })}
                  required
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="Fecha de nacimiento"
                  type="date"
                  InputLabelProps={{ shrink: true, style: { color: '#000' } }}
                  value={form.fecha_nacimiento}
                  onChange={v => setForm({ ...form, fecha_nacimiento: v })}
                />
                <FormInput
                  label="Edad"
                  value={form.edad}
                  onChange={v => setForm({ ...form, edad: v })}
                  type="number"
                  inputProps={{ min: 0, max: 120 }}
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="Género"
                  value={form.genero}
                  onChange={v => setForm({ ...form, genero: v })}
                  select
                  InputLabelProps={{ style: { color: '#000' } }}
                >
                  <MenuItem value="">Seleccionar género</MenuItem>
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="femenino">Femenino</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </FormInput>
                <FormInput
                  label="Nacionalidad"
                  value={form.nacionalidad}
                  onChange={v => setForm({ ...form, nacionalidad: v })}
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="Dirección"
                  value={form.direccion}
                  onChange={v => setForm({ ...form, direccion: v })}
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="Teléfono"
                  value={form.telefono}
                  onChange={v => setForm({ ...form, telefono: v })}
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="Unidades Regionales"
                  value={form.UnidadesRegionales}
                  onChange={handleRegionalChange}
                  select
                  InputLabelProps={{ style: { color: '#000' } }}
                >
                  <MenuItem value="">Seleccionar regional</MenuItem>
                  {Object.keys(regionalesData).map((regional) => (
                    <MenuItem key={regional} value={regional}>
                      {regional}
                    </MenuItem>
                  ))}
                </FormInput>
                
                <FormInput
                  label="Comisaría Jurisdic. del M/A."
                  value={form.comisaria}
                  onChange={v => setForm({ ...form, comisaria: v })}
                  select
                  disabled={!form.UnidadesRegionales}
                  InputLabelProps={{ 
                    style: { 
                      color: form.UnidadesRegionales ? '#000' : '#999' 
                    } 
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-disabled': {
                        backgroundColor: '#f5f5f5',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e0e0e0',
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    {form.UnidadesRegionales 
                      ? "Seleccionar comisaría" 
                      : "Primero seleccione una regional"
                    }
                  </MenuItem>
                  {comisariasDisponibles.map((comisaria) => (
                    <MenuItem key={comisaria} value={comisaria}>
                      {comisaria}
                    </MenuItem>
                  ))}
                </FormInput>
                <FormInput
                  label="Fecha de carga"
                  type="date"
                  InputLabelProps={{ shrink: true, style: { color: '#000' } }}
                  value={form.fecha_carga}
                  onChange={v => setForm({ ...form, fecha_carga: v })}
                />
                <FormInput
                  label="Observaciones"
                  value={form.observaciones}
                  onChange={v => setForm({ ...form, observaciones: v })}
                  multiline
                  rows={5}
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => nav('/dashboard')}
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
                    ← VOLVER AL INICIO
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
                    GUARDAR
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
                    minHeight: 500,
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
                      {/* Imagen de ejemplo */}
                      <Box
                        sx={{
                          width: 180,
                          height: 180,
                          bgcolor: 'rgb(255, 249, 175)',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          border: '6px solid #ddd',
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: 80,
                            color: '#999',
                          }}
                        >
                          📷
                        </Box>
                      </Box>

                      <Typography variant="h4" sx={{ mb: 1, color: '#000' }}>
                        {dragActive
                          ? 'Suelte las imágenes aquí'
                          : 'Cargar fotografías'}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                        Arrastre y suelte imágenes aquí o use el botón
                      </Typography>

                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: 'rgb(13, 17, 100)',
                          '&:hover': { bgcolor: 'rgb(21, 77, 113)' },
                          color: '#fff',
                          mb: 1,
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
                      <Typography variant="h5" sx={{ mb: 2, color: '#000' }}>
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
                    </>
                  )}

                  {files.length > 0 && (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: 2,
                        mt: 2,
                        width: '100%',
                        maxHeight: 300,
                        overflowY: 'auto',
                      }}
                    >
                      {files.map((f, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            width: 300,
                            height: 300,
                            position: 'relative',
                            ml: 12,
                            border: '1px solid rgb(51, 161, 224)',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: 2,
                            bgcolor: '#f7f7f7',
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
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              fontSize: 12,
                              py: 1,
                              px: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                                marginRight: 8,
                              }}
                            >
                              {f.name}
                            </span>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={e => {
                                e.stopPropagation();
                                removeFile(idx);
                              }}
                              sx={{
                                minWidth: 28,
                                height: 28,
                                bgcolor: 'rgba(255,0,0,0.8)',
                                color: '#fff',
                                fontSize: 16,
                                fontWeight: 'bold',
                                '&:hover': {
                                  bgcolor: 'rgba(255,0,0,1)',
                                },
                              }}
                            >
                              ×
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
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
