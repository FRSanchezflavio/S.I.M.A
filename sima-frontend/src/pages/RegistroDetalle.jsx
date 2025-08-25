import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Button,
  TextField,
  Alert,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (_) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}

export default function RegistroDetalle() {
  const { id } = useParams();
  const nav = useNavigate();
  const { showToast } = useToast();
  const [item, setItem] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const me = useMemo(() => {
    const t = localStorage.getItem('accessToken');
    return t ? decodeJwt(t) : null;
  }, []);
  const isAdmin = me?.rol === 'admin';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/registros/${id}`);
        if (!mounted) return;
        setItem(data);
        setForm({
          persona_id: data.persona_id,
          tipo_delito: data.tipo_delito || '',
          lugar: data.lugar || '',
          estado: data.estado || '',
          juzgado: data.juzgado || '',
          detalle: data.detalle || '',
        });
      } catch (_) {
        setError('No se pudo cargar el registro');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const onSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/registros/${id}`, form);
      const { data } = await api.get(`/registros/${id}`);
      setItem(data);
      setForm({
        persona_id: data.persona_id,
        tipo_delito: data.tipo_delito || '',
        lugar: data.lugar || '',
        estado: data.estado || '',
        juzgado: data.juzgado || '',
        detalle: data.detalle || '',
      });
      setEditMode(false);
      showToast('Cambios guardados', 'success');
    } catch (_) {
      // interceptor mostrará toast
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await api.delete(`/registros/${id}`);
      showToast('Registro eliminado', 'success');
      nav('/registros');
    } catch (_) {}
  };

  return (
    <>
      <Header showSettings />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={() => nav('/registros')}>
            ← Volver
          </Button>
          {item && (
            <Button
              variant="outlined"
              onClick={() => {
                const qp = new URLSearchParams({
                  persona_id: String(item.persona_id ?? ''),
                  tipo_delito: item.tipo_delito || '',
                  lugar: item.lugar || '',
                  estado: item.estado || '',
                  juzgado: item.juzgado || '',
                  detalle: item.detalle || '',
                }).toString();
                nav(`/registros/nuevo?${qp}`);
              }}
            >
              Duplicar
            </Button>
          )}
          {isAdmin && !editMode && (
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
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDelete}
              >
                Eliminar
              </Button>
            </>
          )}
          {isAdmin && editMode && (
            <>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={() => {
                  setEditMode(false);
                  if (item)
                    setForm({
                      persona_id: item.persona_id,
                      tipo_delito: item.tipo_delito || '',
                      lugar: item.lugar || '',
                      estado: item.estado || '',
                      juzgado: item.juzgado || '',
                      detalle: item.detalle || '',
                    });
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
              <Grid container spacing={2}>
                {!editMode ? (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        #{item.id} · {item.tipo_delito}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Persona
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => nav(`/personas/${item.persona_id}`)}
                      >
                        Ver persona #{item.persona_id}
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Estado
                      </Typography>
                      <Typography>{item.estado || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Lugar
                      </Typography>
                      <Typography>{item.lugar || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Juzgado
                      </Typography>
                      <Typography>{item.juzgado || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Detalle
                      </Typography>
                      <Typography whiteSpace="pre-wrap">
                        {item.detalle || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Creado:{' '}
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : '-'}{' '}
                        · por #{item.created_by ?? '-'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Actualizado:{' '}
                        {item.updated_at
                          ? new Date(item.updated_at).toLocaleString()
                          : '-'}{' '}
                        · por #{item.updated_by ?? '-'}
                      </Typography>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Persona ID"
                        type="number"
                        fullWidth
                        value={form.persona_id}
                        onChange={e =>
                          setForm({
                            ...form,
                            persona_id: Number(e.target.value),
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        label="Tipo de delito"
                        fullWidth
                        value={form.tipo_delito}
                        onChange={e =>
                          setForm({ ...form, tipo_delito: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Lugar"
                        fullWidth
                        value={form.lugar}
                        onChange={e =>
                          setForm({ ...form, lugar: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Estado"
                        fullWidth
                        value={form.estado}
                        onChange={e =>
                          setForm({ ...form, estado: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Juzgado"
                        fullWidth
                        value={form.juzgado}
                        onChange={e =>
                          setForm({ ...form, juzgado: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Detalle"
                        fullWidth
                        multiline
                        rows={4}
                        value={form.detalle}
                        onChange={e =>
                          setForm({ ...form, detalle: e.target.value })
                        }
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </>
  );
}
