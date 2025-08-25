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
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FormInput from '../components/FormInput';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export default function Cargar() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    nacionalidad: '',
    direccion: '',
    telefono: '',
    email: '',
    observaciones: '',
    comisaria: '',
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const nav = useNavigate();
  const { showToast } = useToast();

  const canSave = form.nombre && form.apellido && form.dni && files.length > 0;

  const onFile = e => {
    setFiles(Array.from(e.target.files || []));
  };

  const onSubmit = async () => {
    setError('');
    setOk('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v || ''));
      files.forEach(f => data.append('fotos', f));
      await api.post('/personas', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOk('Guardado correctamente');
      showToast('Persona guardada', 'success');
      setForm({
        nombre: '',
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        nacionalidad: '',
        direccion: '',
        telefono: '',
        email: '',
        observaciones: '',
        comisaria: '',
      });
      setFiles([]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al guardar');
      showToast('Error al guardar', 'error');
    }
  };

  return (
    <>
      <Header showSettings />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card className="card">
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Cargar mencionado/aprehendido
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Complete todos los campos y seleccione al menos una fotografía
              para guardar los datos.
            </Alert>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {ok && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {ok}
              </Alert>
            )}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormInput
                  label="Comisaría"
                  value={form.comisaria}
                  onChange={v => setForm({ ...form, comisaria: v })}
                />
                <FormInput
                  label="Nombre"
                  value={form.nombre}
                  onChange={v => setForm({ ...form, nombre: v })}
                  required
                />
                <FormInput
                  label="Apellido"
                  value={form.apellido}
                  onChange={v => setForm({ ...form, apellido: v })}
                  required
                />
                <FormInput
                  label="DNI"
                  value={form.dni}
                  onChange={v => setForm({ ...form, dni: v })}
                  required
                />
                <FormInput
                  label="Fecha de nacimiento"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.fecha_nacimiento}
                  onChange={v => setForm({ ...form, fecha_nacimiento: v })}
                />
                <FormInput
                  label="Nacionalidad"
                  value={form.nacionalidad}
                  onChange={v => setForm({ ...form, nacionalidad: v })}
                />
                <FormInput
                  label="Dirección"
                  value={form.direccion}
                  onChange={v => setForm({ ...form, direccion: v })}
                />
                <FormInput
                  label="Teléfono"
                  value={form.telefono}
                  onChange={v => setForm({ ...form, telefono: v })}
                />
                <FormInput
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={v => setForm({ ...form, email: v })}
                />
                <FormInput
                  label="Observaciones"
                  value={form.observaciones}
                  onChange={v => setForm({ ...form, observaciones: v })}
                  multiline
                  rows={3}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button variant="outlined" onClick={() => nav('/dashboard')}>
                    ← VOLVER AL INICIO
                  </Button>
                  <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={!canSave}
                    sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
                  >
                    GUARDAR
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    border: '2px dashed #90a4ae',
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Arrastre y suelte imágenes aquí o haga clic para seleccionar
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFile}
                    style={{ display: 'block', margin: '8px auto' }}
                  />
                  <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}
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
                  </Box>
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
