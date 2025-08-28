import { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import FormInput from '../components/FormInput';
import Footer from '../components/Footer';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();
  const { showToast } = useToast();

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!usuario || !password) {
      setError('Complete usuario y contraseña');
      return;
    }
    try {
      const { data } = await api.post('/auth/login', { usuario, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      showToast('Inicio de sesión exitoso', 'success');
      nav('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Error de autenticación');
      showToast('Error de autenticación', 'error');
    }
  };

  return (
    <>
      <Box className="header" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 800 }}>
          S.I.M.A.
        </Typography>
      </Box>
      <Container maxWidth="md" sx={{ py: 9 }}>
        <Card className="abs-center" sx={{ maxWidth: 400, mx: 'auto' }}>
          <CardContent>
            <Typography
              variant="h4"
              sx={{ mb: 3, mt: 2, fontWeight: 600, textAlign: 'center' }}
            >
              Iniciar sesión
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <form onSubmit={onSubmit}>
              <FormInput
                label="Usuario"
                value={usuario}
                onChange={setUsuario}
                required
              />
              <FormInput
                label="Contraseña"
                value={password}
                onChange={setPassword}
                type="password"
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
              >
                INICIAR SESIÓN
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </>
  );
}
