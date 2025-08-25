import { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  TextField,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';

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

export default function Registros() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [personaId, setPersonaId] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const nav = useNavigate();
  const { showToast } = useToast();
  const me = useMemo(() => {
    const t = localStorage.getItem('accessToken');
    return t ? decodeJwt(t) : null;
  }, []);
  const isAdmin = me?.rol === 'admin';

  const fetchList = async (override = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        pageSize,
        q: q || undefined,
        persona_id: personaidNumber(personaId),
        ...override,
      };
      if (!params.persona_id) delete params.persona_id;
      const { data } = await api.get('/registros', { params });
      setItems(data.items || []);
      setTotal(Number(data.total || 0));
    } catch (e) {
      setError('No se pudieron cargar los registros');
    } finally {
      setLoading(false);
    }
  };

  function personaidNumber(val) {
    const n = parseInt(val, 10);
    return !isNaN(n) && n > 0 ? n : undefined;
  }

  useEffect(() => {
    fetchList();
  }, [page, pageSize]);

  const onFilter = () => {
    setPage(1);
    fetchList({ page: 1 });
  };

  const onDelete = async id => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await api.delete(`/registros/${id}`);
      showToast('Registro eliminado', 'success');
      fetchList();
    } catch (_) {
      // interceptor mostrará toast
    }
  };

  const onExport = async type => {
    try {
      const params = {
        q: q || undefined,
        persona_id: personaidNumber(personaId),
        format: type,
      };
      if (!params.persona_id) delete params.persona_id;
      const res = await api.get('/registros', { params, responseType: 'blob' });
      const blob = new Blob([res.data], {
        type:
          type === 'csv'
            ? 'text/csv;charset=utf-8;'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registros.${type}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError('No se pudo exportar');
      showToast('No se pudo exportar', 'error');
    }
  };

  return (
    <>
      <Header showSettings />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card className="card">
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Registros
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Persona ID"
                  size="small"
                  value={personaId}
                  onChange={e => setPersonaId(e.target.value)}
                  sx={{ width: 160 }}
                />
                <TextField
                  label="Buscar (tipo/lugar/juzgado/estado)"
                  size="small"
                  value={q}
                  onChange={e => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  sx={{ minWidth: 280 }}
                />
                <Button
                  variant="contained"
                  onClick={onFilter}
                  sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
                >
                  Filtrar
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setPersonaId('');
                    setQ('');
                    setPage(1);
                    fetchList({ page: 1, q: undefined, persona_id: undefined });
                  }}
                >
                  Limpiar
                </Button>
                <Button
                  variant="contained"
                  onClick={() => nav('/registros/nuevo')}
                  sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
                >
                  Nuevo
                </Button>
                <Button variant="outlined" onClick={() => nav('/dashboard')}>
                  ← Volver
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
              </Stack>
            </Stack>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Persona</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Lugar</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Juzgado</TableCell>
                  <TableCell>Creado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Alert severity="info">
                        No hay registros para mostrar
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
                {items.map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>
                      #{r.persona_id}{' '}
                      <Button
                        size="small"
                        onClick={() => nav(`/personas/${r.persona_id}`)}
                      >
                        Ver persona
                      </Button>
                    </TableCell>
                    <TableCell>{r.tipo_delito}</TableCell>
                    <TableCell>{r.lugar || '-'}</TableCell>
                    <TableCell>{r.estado || '-'}</TableCell>
                    <TableCell>{r.juzgado || '-'}</TableCell>
                    <TableCell>
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => nav(`/registros/${r.id}`)}
                        aria-label="ver"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {isAdmin && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(r.id)}
                          aria-label="eliminar"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <TextField
                label="Tamaño de página"
                type="number"
                size="small"
                value={pageSize}
                onChange={e => {
                  setPageSize(
                    Math.max(1, Math.min(100, Number(e.target.value) || 10))
                  );
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
                  disabled={page * pageSize >= total}
                  onClick={() => setPage(p => p + 1)}
                >
                  Siguiente
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Página {page} · {total} resultados
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </>
  );
}
