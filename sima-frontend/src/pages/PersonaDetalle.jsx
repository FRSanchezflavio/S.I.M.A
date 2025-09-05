import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Stack,
  Button,
  List,
  ListItem,
  Chip,
  Divider,
  Box,
  Alert,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';

export default function PersonaDetalle() {
  const { id } = useParams();
  const nav = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [files, setFiles] = useState([]);
  const { showToast } = useToast();

  // Estado para agregar nuevo delito
  const [showDelitoForm, setShowDelitoForm] = useState(false);
  const [delitoForm, setDelitoForm] = useState({
    tipo_delito: '',
    modalidad: '',
    lugar: '',
    estado: '',
    juzgado: '',
    detalle: '',
    comisaria_hecho: '',
    fecha_carga: new Date().toISOString().split('T')[0],
  });
  const [delitoFiles, setDelitoFiles] = useState([]);
  const [delitoError, setDelitoError] = useState('');
  const [savingDelito, setSavingDelito] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  function decodeJwt(token) {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch (_) {
      try {
        // Fallback sin escape (navegadores modernos)
        return JSON.parse(atob(token.split('.')[1]));
      } catch (_) {
        return null;
      }
    }
  }

  const me = useMemo(() => {
    const t = localStorage.getItem('accessToken');
    return t ? decodeJwt(t) : null;
  }, []);
  const canEdit = me?.rol === 'admin';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [personaRes, registrosRes] = await Promise.all([
          api.get(`/personas/${id}`),
          api.get('/registros', { params: { persona_id: id, page, pageSize } }),
        ]);
        if (!mounted) return;
        setItem(personaRes.data);
        // /registros puede devolver { items, total } o un array
        if (Array.isArray(registrosRes.data)) {
          setRegistros(registrosRes.data);
          setTotalRegistros(registrosRes.data.length);
        } else {
          setRegistros(registrosRes.data?.items || []);
          setTotalRegistros(
            Number(
              registrosRes.data?.total ??
                (registrosRes.data?.items ? registrosRes.data.items.length : 0)
            )
          );
        }
        setForm({
          nombre: personaRes.data.nombre || '',
          apellido: personaRes.data.apellido || '',
          dni: personaRes.data.dni || '',
          fecha_nacimiento:
            personaRes.data.fecha_nacimiento?.slice(0, 10) || '',
          genero: personaRes.data.genero || '',
          nacionalidad: personaRes.data.nacionalidad || '',
          direccion: personaRes.data.direccion || '',
          telefono: personaRes.data.telefono || '',
          observaciones: personaRes.data.observaciones || '',
          comisaria: personaRes.data.comisaria || '',
          comisaria_hecho: personaRes.data.comisaria_hecho || '',
        });
      } catch (e) {
        setError('No se pudo cargar el detalle');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Recarga de registros al cambiar paginación
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/registros', {
          params: { persona_id: id, page, pageSize },
        });
        if (!mounted) return;
        if (Array.isArray(res.data)) {
          setRegistros(res.data);
          setTotalRegistros(res.data.length);
        } else {
          setRegistros(res.data?.items || []);
          setTotalRegistros(
            Number(
              res.data?.total ?? (res.data?.items ? res.data.items.length : 0)
            )
          );
        }
      } catch (_) {
        // ignorar errores silenciosos aquí; la vista principal ya maneja errores
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, page, pageSize]);

  const fotos = useMemo(() => {
    if (!item) return [];
    try {
      const arr = item.fotos_adicionales
        ? JSON.parse(item.fotos_adicionales)
        : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }, [item]);

  const onSave = async () => {
    setSaving(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v || ''));
      files.forEach(f => data.append('fotos', f));
      await api.put(`/personas/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data: refreshed } = await api.get(`/personas/${id}`);
      setItem(refreshed);
      setEditMode(false);
      setFiles([]);
      showToast('Cambios guardados', 'success');
    } catch (e) {
      setError(e?.response?.data?.message || 'No se pudo guardar');
      showToast('No se pudo guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await api.delete(`/personas/${id}`);
      showToast('Registro eliminado', 'success');
      nav('/buscar');
    } catch (e) {
      setError('No se pudo eliminar');
      showToast('No se pudo eliminar', 'error');
    }
  };

  // Función para agregar nuevo delito
  const handleAgregarDelito = async () => {
    setSavingDelito(true);
    setDelitoError('');

    try {
      const data = new FormData();

      // Agregar campos del formulario
      Object.entries(delitoForm).forEach(([k, v]) => data.append(k, v || ''));

      // Agregar persona_id
      data.append('persona_id', id);

      // Agregar archivos
      delitoFiles.forEach(f => data.append('fotos', f));

      // Enviar al endpoint de registros
      await api.post('/registros', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('Delito registrado correctamente', 'success');

      // Limpiar formulario
      setDelitoForm({
        tipo_delito: '',
        modalidad: '',
        lugar: '',
        estado: '',
        juzgado: '',
        detalle: '',
        comisaria_hecho: '',
        fecha_carga: new Date().toISOString().split('T')[0],
      });
      setDelitoFiles([]);
      setShowDelitoForm(false);

      // Recargar registros
      const { data: updatedRegistros } = await api.get('/registros', {
        params: { persona_id: id, page, pageSize },
      });
      if (Array.isArray(updatedRegistros)) {
        setRegistros(updatedRegistros);
        setTotalRegistros(updatedRegistros.length);
      } else {
        setRegistros(updatedRegistros?.items || []);
        setTotalRegistros(
          Number(
            updatedRegistros?.total ??
              (updatedRegistros?.items ? updatedRegistros.items.length : 0)
          )
        );
      }
    } catch (err) {
      setDelitoError(err?.response?.data?.message || 'Error al guardar');
      showToast('Error al guardar el delito', 'error');
    } finally {
      setSavingDelito(false);
    }
  };

  const onDelitoFile = e => {
    setDelitoFiles(Array.from(e.target.files || []));
  };

  const canSaveDelito = delitoForm.tipo_delito && delitoFiles.length > 0;

  return (
    <>
      <Header showSettings />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={() => nav(-1)}>
            ← Volver
          </Button>
          {canEdit && !editMode && (
            <>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
              >
                Editar
              </Button>
              <Button
                variant="contained"
                onClick={() => nav(`/registros/nuevo?persona_id=${item?.id}`)}
                sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
              >
                Agregar registro
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDelete}
              >
                Eliminar
              </Button>
            </>
          )}
          {canEdit && editMode && (
            <>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={() => {
                  setEditMode(false);
                  setFiles([]);
                  if (item) {
                    setForm({
                      nombre: item.nombre || '',
                      apellido: item.apellido || '',
                      dni: item.dni || '',
                      fecha_nacimiento:
                        item.fecha_nacimiento?.slice(0, 10) || '',
                      genero: item.genero || '',
                      nacionalidad: item.nacionalidad || '',
                      direccion: item.direccion || '',
                      telefono: item.telefono || '',
                      email: item.email || '',
                      observaciones: item.observaciones || '',
                      comisaria: item.comisaria || '',
                      comisaria_hecho: item.comisaria_hecho || '',
                    });
                  }
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
                onClick={onSave}
                sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
              >
                Guardar
              </Button>
            </>
          )}
        </Stack>
        <Card className="card">
          <CardContent>
            {loading && <Typography>Cargando…</Typography>}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {item && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <CardMedia
                    component="img"
                    sx={{ width: '100%', borderRadius: 2, objectFit: 'cover' }}
                    image={
                      item.foto_principal ||
                      'https://via.placeholder.com/400x400?text=Sin+foto'
                    }
                    alt={`${item.apellido}, ${item.nombre}`}
                    onError={e => {
                      e.currentTarget.src =
                        'https://via.placeholder.com/400x400?text=Sin+foto';
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  {!editMode ? (
                    <>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {item.apellido}, {item.nombre}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 1, flexWrap: 'wrap' }}
                      >
                        <Chip label={`DNI: ${item.dni || '-'}`} />
                        <Chip label={`Comisaría: ${item.comisaria || '-'}`} />
                        {item.comisaria_hecho && (
                          <Chip
                            label={`Com. del Hecho: ${item.comisaria_hecho}`}
                          />
                        )}
                        {item.fecha_nacimiento && (
                          <Chip
                            label={`Nac.: ${new Date(
                              item.fecha_nacimiento
                            ).toLocaleDateString()}`}
                          />
                        )}
                        {item.genero && (
                          <Chip label={`Género: ${item.genero}`} />
                        )}
                      </Stack>
                    </>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Nombre"
                          fullWidth
                          value={form.nombre}
                          onChange={e =>
                            setForm({ ...form, nombre: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Apellido"
                          fullWidth
                          value={form.apellido}
                          onChange={e =>
                            setForm({ ...form, apellido: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="DNI"
                          fullWidth
                          value={form.dni}
                          onChange={e =>
                            setForm({ ...form, dni: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          type="date"
                          label="Fecha de nacimiento"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={form.fecha_nacimiento}
                          onChange={e =>
                            setForm({
                              ...form,
                              fecha_nacimiento: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Género"
                          fullWidth
                          value={form.genero}
                          onChange={e =>
                            setForm({ ...form, genero: e.target.value })
                          }
                        >
                          <MenuItem value="">Seleccionar género</MenuItem>
                          <MenuItem value="masculino">Masculino</MenuItem>
                          <MenuItem value="femenino">Femenino</MenuItem>
                          <MenuItem value="otro">Otro</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Comisaría"
                          fullWidth
                          value={form.comisaria}
                          onChange={e =>
                            setForm({ ...form, comisaria: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Comisaría del Hecho"
                          fullWidth
                          value={form.comisaria_hecho}
                          onChange={e =>
                            setForm({
                              ...form,
                              comisaria_hecho: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Nacionalidad"
                          fullWidth
                          value={form.nacionalidad}
                          onChange={e =>
                            setForm({ ...form, nacionalidad: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Dirección"
                          fullWidth
                          value={form.direccion}
                          onChange={e =>
                            setForm({ ...form, direccion: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Teléfono"
                          fullWidth
                          value={form.telefono}
                          onChange={e =>
                            setForm({ ...form, telefono: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Observaciones"
                          fullWidth
                          multiline
                          rows={3}
                          value={form.observaciones}
                          onChange={e =>
                            setForm({ ...form, observaciones: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            p: 2,
                            border: '2px dashed #90a4ae',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Adjuntar nuevas fotos (opcional)
                          </Typography>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={e =>
                              setFiles(Array.from(e.target.files || []))
                            }
                          />
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mt: 1, flexWrap: 'wrap' }}
                          >
                            {files.map((f, idx) => (
                              <img
                                key={idx}
                                src={URL.createObjectURL(f)}
                                alt="preview"
                                style={{
                                  width: 96,
                                  height: 96,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                  <Divider sx={{ my: 2 }} />
                  {!editMode ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Dirección
                        </Typography>
                        <Typography>{item.direccion || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Teléfono / Email
                        </Typography>
                        <Typography>
                          {(item.telefono || '-') + ' / ' + (item.email || '-')}
                        </Typography>
                      </Grid>
                      {item.comisaria_hecho && (
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Comisaría del Hecho
                          </Typography>
                          <Typography>{item.comisaria_hecho}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Observaciones
                        </Typography>
                        <Typography whiteSpace="pre-wrap">
                          {item.observaciones || '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : null}
                </Grid>
                {!!fotos.length && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Fotos adicionales
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: 2,
                      }}
                    >
                      {fotos.map((src, idx) => (
                        <CardMedia
                          key={idx}
                          component="img"
                          sx={{
                            width: '100%',
                            height: 140,
                            objectFit: 'cover',
                            borderRadius: 2,
                          }}
                          image={
                            src ||
                            'https://via.placeholder.com/300x200?text=Sin+foto'
                          }
                          alt={`foto-${idx + 1}`}
                          onError={e => {
                            e.currentTarget.src =
                              'https://via.placeholder.com/300x200?text=Sin+foto';
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Acciones */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Acciones
                  </Typography>
                  <List>
                    <ListItem disableGutters>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => setShowDelitoForm(!showDelitoForm)}
                        sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
                      >
                        {showDelitoForm
                          ? 'Ocultar formulario'
                          : 'Agregar delito'}
                      </Button>
                    </ListItem>
                  </List>
                </Grid>

                {/* Formulario para agregar delito */}
                {showDelitoForm && (
                  <Grid item xs={12}>
                    <Paper
                      elevation={2}
                      sx={{ p: 3, mt: 2, bgcolor: '#f8f9fa' }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ mb: 2, fontWeight: 600, color: '#000' }}
                      >
                        Agregar Nuevo Delito
                      </Typography>

                      {delitoError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {delitoError}
                        </Alert>
                      )}

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            select
                            label="Tipo de delito"
                            fullWidth
                            value={delitoForm.tipo_delito}
                            onChange={e =>
                              setDelitoForm({
                                ...delitoForm,
                                tipo_delito: e.target.value,
                              })
                            }
                            sx={{ mb: 2 }}
                          >
                            <MenuItem value="">Seleccionar tipo</MenuItem>
                            <MenuItem value="robo">Robo</MenuItem>
                            <MenuItem value="hurto">Hurto</MenuItem>
                          </TextField>

                          <TextField
                            select
                            label="Modalidad"
                            fullWidth
                            value={delitoForm.modalidad}
                            onChange={e =>
                              setDelitoForm({
                                ...delitoForm,
                                modalidad: e.target.value,
                              })
                            }
                            sx={{ mb: 2 }}
                          >
                            <MenuItem value="">Seleccionar modalidad</MenuItem>
                            <MenuItem value="arrebato">Arrebato</MenuItem>
                            <MenuItem value="descuido">Descuido</MenuItem>
                            <MenuItem value="destreza">Destreza</MenuItem>
                            <MenuItem value="escalamiento">
                              Escalamiento
                            </MenuItem>
                            <MenuItem value="fuerza_puerta">
                              Fuerza en puerta
                            </MenuItem>
                            <MenuItem value="fuerza_ventana">
                              Fuerza en ventana
                            </MenuItem>
                            <MenuItem value="intimidacion">
                              Intimidación
                            </MenuItem>
                            <MenuItem value="llave_falsa">Llave falsa</MenuItem>
                            <MenuItem value="motochorro">Motochorro</MenuItem>
                            <MenuItem value="violencia">Violencia</MenuItem>
                            <MenuItem value="otro">Otro</MenuItem>
                          </TextField>

                          <TextField
                            label="Comisaría donde sucedió el hecho"
                            fullWidth
                            value={delitoForm.comisaria_hecho}
                            onChange={e =>
                              setDelitoForm({
                                ...delitoForm,
                                comisaria_hecho: e.target.value,
                              })
                            }
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            label="Lugar del hecho"
                            fullWidth
                            value={delitoForm.lugar}
                            onChange={e =>
                              setDelitoForm({
                                ...delitoForm,
                                lugar: e.target.value,
                              })
                            }
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            select
                            label="Estado del caso"
                            fullWidth
                            value={delitoForm.estado}
                            onChange={e =>
                              setDelitoForm({
                                ...delitoForm,
                                estado: e.target.value,
                              })
                            }
                            sx={{ mb: 2 }}
                          >
                            <MenuItem value="">Seleccionar estado</MenuItem>
                            <MenuItem value="activo">Activo</MenuItem>
                            <MenuItem value="resuelto">Resuelto</MenuItem>
                            <MenuItem value="archivado">Archivado</MenuItem>
                            <MenuItem value="en_proceso">En proceso</MenuItem>
                            <MenuItem value="suspendido">Suspendido</MenuItem>
                          </TextField>

                          <TextField
                            label="Juzgado interviniente"
                            fullWidth
                            value={delitoForm.juzgado}
                            onChange={e =>
                              setDelitoForm({
                                ...delitoForm,
                                juzgado: e.target.value,
                              })
                            }
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            type="date"
                            label="Fecha de carga"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={delitoForm.fecha_carga}
                            onChange={e =>
                              setDelitoForm({
                                ...delitoForm,
                                fecha_carga: e.target.value,
                              })
                            }
                            sx={{ mb: 2 }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Detalle del caso"
                            fullWidth
                            multiline
                            rows={5}
                            value={delitoForm.detalle}
                            onChange={e =>
                              setDelitoForm({
                                ...delitoForm,
                                detalle: e.target.value,
                              })
                            }
                            sx={{ mb: 2 }}
                          />

                          <Box
                            sx={{
                              p: 2,
                              border: '2px dashed #90a4ae',
                              borderRadius: 2,
                              textAlign: 'center',
                              mb: 2,
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Adjuntar fotografías (obligatorio)
                            </Typography>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={onDelitoFile}
                            />
                            {delitoFiles.length > 0 && (
                              <Typography
                                variant="body2"
                                sx={{ mt: 1, color: 'green' }}
                              >
                                {delitoFiles.length} archivo(s) seleccionado(s)
                              </Typography>
                            )}
                          </Box>

                          <Stack direction="row" spacing={2}>
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setShowDelitoForm(false);
                                setDelitoForm({
                                  tipo_delito: '',
                                  modalidad: '',
                                  lugar: '',
                                  estado: '',
                                  juzgado: '',
                                  detalle: '',
                                  comisaria_hecho: '',
                                  fecha_carga: new Date()
                                    .toISOString()
                                    .split('T')[0],
                                });
                                setDelitoFiles([]);
                                setDelitoError('');
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleAgregarDelito}
                              disabled={!canSaveDelito || savingDelito}
                              sx={{
                                bgcolor: '#000',
                                '&:hover': { bgcolor: '#111' },
                                '&:disabled': { bgcolor: '#ccc' },
                              }}
                            >
                              {savingDelito ? 'Guardando...' : 'AGREGAR DELITO'}
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Lista de antecedentes delictuales */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Antecedentes Delictuales (
                    {totalRegistros || registros.length})
                  </Typography>

                  {registros.length === 0 ? (
                    <Alert severity="info">
                      No se encontraron antecedentes delictuales para esta
                      persona.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {registros.map((registro, index) => (
                        <Grid item xs={12} key={registro.id}>
                          <Paper elevation={1} sx={{ p: 2 }}>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                              <Chip
                                label={
                                  registro.tipo_delito || 'Sin especificar'
                                }
                                color="primary"
                                size="small"
                              />
                              <Chip
                                label={registro.estado || 'Sin estado'}
                                variant="outlined"
                                size="small"
                              />
                              {registro.modalidad && (
                                <Chip
                                  label={registro.modalidad}
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Lugar:</strong> {registro.lugar || '-'} |
                              <strong> Comisaría:</strong>{' '}
                              {registro.comisaria_hecho || '-'} |
                              <strong> Juzgado:</strong>{' '}
                              {registro.juzgado || '-'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Fecha:</strong>{' '}
                              {registro.fecha_carga
                                ? new Date(
                                    registro.fecha_carga
                                  ).toLocaleDateString()
                                : '-'}{' '}
                              |<strong> Registrado:</strong>{' '}
                              {registro.created_at
                                ? new Date(
                                    registro.created_at
                                  ).toLocaleDateString()
                                : '-'}
                            </Typography>
                            {registro.detalle && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                <strong>Detalle:</strong> {registro.detalle}
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      label="Tamaño de página"
                      type="number"
                      size="small"
                      value={pageSize}
                      onChange={e => {
                        const val = Math.max(
                          1,
                          Math.min(50, Number(e.target.value) || 5)
                        );
                        setPageSize(val);
                        setPage(1);
                      }}
                      sx={{ width: 160 }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outlined"
                        disabled={page * pageSize >= totalRegistros}
                        onClick={() => setPage(p => p + 1)}
                      >
                        Siguiente
                      </Button>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Página {page} · {totalRegistros} resultados
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Creado:{' '}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : '-'}
                    {` · por #${item.created_by ?? '-'}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actualizado:{' '}
                    {item.updated_at
                      ? new Date(item.updated_at).toLocaleString()
                      : '-'}
                    {` · por #${item.updated_by ?? '-'}`}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </>
  );
}
