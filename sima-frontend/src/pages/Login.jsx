import { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  keyframes,
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

  const slideDown = keyframes`
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `;

  const scaleUp = keyframes`
    from {
      transform: scale(0.3);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  `;

  return (
    <>
      <Box
        className="header"
        sx={{
          p: 2,
          display: 'flex',
          height: '115px',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgb(21, 77, 113)',
          animation: `${slideDown} 0.8s ease-out`,
        }}
      >
        <Box sx={{ position: 'absolute', left: 16 }}>
          <img
            src="/img/oficina2.jpeg"
            alt="Logo"
            style={{ height: '115px', width: 'auto', borderRadius: '800px' }}
          />
        </Box>
        <Typography variant="h2" sx={{ fontWeight: 800 }}>
          S.I.M.A.
        </Typography>
      </Box>
      <Container maxWidth="md" sx={{ py: 9 }}>
        <Card
          className="abs-center"
          sx={{
            maxWidth: 400,
            mx: 'auto',
            p: 2,
            boxShadow: '10px 40px 24px rgba(0, 0, 0, 0.15)',
            animation: `${scaleUp} 0.6s ease-out 0.3s both`,
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              sx={{ mb: 3, mt: 2, fontWeight: 800, textAlign: 'center' }}
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
                sx={{
                  mt: 4,
                  bgcolor: '#000 : rgba(112, 159, 202, 1)',
                  '&:hover': { bgcolor: 'rgb(0, 27, 183)' },
                }}
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
