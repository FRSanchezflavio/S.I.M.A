import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Stack,
  Alert,
  Box,
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CardResult from '../components/CardResult';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useToast } from '../components/ToastProvider';

export default function Buscar() {
  const [modo, setModo] = useState('nombre');
  const [texto, setTexto] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const nav = useNavigate();
  const { showToast } = useToast();

  const fetchAll = async () => {
    try {
      const { data } = await api.get('/personas');
      setItems(data.items || []);
    } catch (e) {
      setError('Error al obtener datos');
    }
  };

  const onBuscar = async () => {
    setError('');
    try {
      const params =
        modo === 'dni'
          ? { dni: texto }
          : modo === 'comisaria'
          ? { comisaria: texto }
          : { q: texto };
      const { data } = await api.get('/personas', { params });
      setItems(data.items || []);
    } catch (e) {
      setError('Error en la búsqueda');
    }
  };

  const onExport = async type => {
    try {
      const params =
        modo === 'dni'
          ? { dni: texto }
          : modo === 'comisaria'
          ? { comisaria: texto }
          : { q: texto };
      const res = await api.get('/personas', {
        params: { ...params, format: type },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type:
          type === 'csv'
            ? 'text/csv;charset=utf-8;'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personas.${type}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError('No se pudo exportar');
      showToast('No se pudo exportar', 'error');
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <>
      <Header showSettings />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card className="card">
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Buscar mencionado/aprehendido
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Ingrese su búsqueda"
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RadioGroup
                  row
                  value={modo}
                  onChange={e => setModo(e.target.value)}
                >
                  <FormControlLabel
                    value="nombre"
                    control={<Radio />}
                    label="Nombre/Apellido"
                  />
                  <FormControlLabel
                    value="dni"
                    control={<Radio />}
                    label="DNI"
                  />
                  <FormControlLabel
                    value="comisaria"
                    control={<Radio />}
                    label="Comisaría"
                  />
                </RadioGroup>
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={onBuscar}
                sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
              >
                BUSCAR
              </Button>
              <Button variant="outlined" onClick={fetchAll}>
                MOSTRAR TODAS
              </Button>
              <Button
                variant="outlined"
                onClick={() => onExport('csv')}
                startIcon={<InsertDriveFileIcon />}
              >
                CSV
              </Button>
              <Button
                variant="outlined"
                onClick={() => onExport('xlsx')}
                startIcon={<DownloadIcon />}
              >
                XLSX
              </Button>
              <Button variant="outlined" onClick={() => nav('/dashboard')}>
                ← VOLVER AL INICIO
              </Button>
            </Stack>
            <Box
              sx={{
                mt: 3,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 2,
              }}
            >
              {items.length === 0 && (
                <Alert severity="info">No hay resultados para mostrar</Alert>
              )}
              {items.map(it => (
                <CardResult
                  key={it.id}
                  item={it}
                  onDetail={() => nav(`/personas/${it.id}`)}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </>
  );
}
