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
  Chip,
  Divider,
  Box,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
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
        const { data } = await api.get(`/personas/${id}`);
        if (!mounted) return;
        setItem(data);
        setForm({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          dni: data.dni || '',
          fecha_nacimiento: data.fecha_nacimiento?.slice(0, 10) || '',
          nacionalidad: data.nacionalidad || '',
          direccion: data.direccion || '',
          telefono: data.telefono || '',
          email: data.email || '',
          observaciones: data.observaciones || '',
          comisaria: data.comisaria || '',
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
                      nacionalidad: item.nacionalidad || '',
                      direccion: item.direccion || '',
                      telefono: item.telefono || '',
                      email: item.email || '',
                      observaciones: item.observaciones || '',
                      comisaria: item.comisaria || '',
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
                        {item.fecha_nacimiento && (
                          <Chip
                            label={`Nac.: ${new Date(
                              item.fecha_nacimiento
                            ).toLocaleDateString()}`}
                          />
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email"
                          type="email"
                          fullWidth
                          value={form.email}
                          onChange={e =>
                            setForm({ ...form, email: e.target.value })
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
