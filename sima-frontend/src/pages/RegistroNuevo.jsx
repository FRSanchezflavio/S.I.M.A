import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  Stack,
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';

export default function RegistroNuevo() {
  const [search] = useSearchParams();
  const nav = useNavigate();
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    persona_id: '',
    tipo_delito: '',
    lugar: '',
    estado: '',
    juzgado: '',
    detalle: '',
  });

  useEffect(() => {
    const pid = search.get('persona_id');
    const tipo = search.get('tipo_delito');
    const lugar = search.get('lugar');
    const estado = search.get('estado');
    const juzgado = search.get('juzgado');
    const detalle = search.get('detalle');
    setForm(f => ({
      ...f,
      persona_id: pid ? Number(pid) : f.persona_id,
      tipo_delito: tipo ?? f.tipo_delito,
      lugar: lugar ?? f.lugar,
      estado: estado ?? f.estado,
      juzgado: juzgado ?? f.juzgado,
      detalle: detalle ?? f.detalle,
    }));
  }, [search]);

  const onSave = async () => {
    setError('');
    if (!form.persona_id || !form.tipo_delito) {
      setError('persona_id y tipo_delito son requeridos');
      return;
    }
    try {
      setSaving(true);
      const { data } = await api.post('/registros', {
        persona_id: Number(form.persona_id),
        tipo_delito: form.tipo_delito,
        lugar: form.lugar || '',
        estado: form.estado || '',
        juzgado: form.juzgado || '',
        detalle: form.detalle || '',
      });
      showToast('Registro creado', 'success');
      nav(`/registros/${data.id}`);
    } catch (e) {
      // interceptor se ocupa del toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header showSettings />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card className="card">
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Nuevo registro
              </Typography>
              <Button variant="outlined" onClick={() => nav('/registros')}>
                ← Volver
              </Button>
            </Stack>
            {error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Persona ID"
                  type="number"
                  fullWidth
                  value={form.persona_id}
                  onChange={e =>
                    setForm({ ...form, persona_id: Number(e.target.value) })
                  }
                  required
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
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Lugar"
                  fullWidth
                  value={form.lugar}
                  onChange={e => setForm({ ...form, lugar: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Estado"
                  fullWidth
                  value={form.estado}
                  onChange={e => setForm({ ...form, estado: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Juzgado"
                  fullWidth
                  value={form.juzgado}
                  onChange={e => setForm({ ...form, juzgado: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Detalle"
                  fullWidth
                  multiline
                  rows={4}
                  value={form.detalle}
                  onChange={e => setForm({ ...form, detalle: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" onClick={() => nav('/registros')}>
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    disabled={saving}
                    onClick={onSave}
                    sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
                  >
                    Guardar
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </>
  );
}
