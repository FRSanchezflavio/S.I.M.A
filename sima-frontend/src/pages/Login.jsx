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
  useMediaQuery,
  useTheme,
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
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { showToast } = useToast();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!usuario || !password) {
      setError('Complete usuario y contraseña');
      setLoading(false);
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
    } finally {
      setLoading(false);
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

  const fadeInUp = keyframes`
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'var(--bg)',
    }}>
      {/* Header responsive */}
      <Box
        className="header"
        sx={{
          p: { xs: 1, sm: 2 },
          display: 'flex',
          height: { xs: '80px', sm: '100px', md: '115px' },
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgb(21, 77, 113)',
          animation: `${slideDown} 0.8s ease-out`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Logo - responsive positioning */}
        <Box 
          sx={{ 
            position: { xs: 'static', sm: 'absolute' }, 
            left: { xs: 'auto', sm: 16 },
            mb: { xs: 1, sm: 0 },
            mr: { xs: 2, sm: 0 },
          }}
        >
          <Box
            component="img"
            src="/img/oficina2.jpeg"
            alt="Logo"
            sx={{
              height: { xs: '60px', sm: '80px', md: '115px' },
              width: 'auto',
              borderRadius: '50%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          />
        </Box>
        
        {/* Título principal - responsive */}
        <Typography 
          variant={isMobile ? 'h4' : isTablet ? 'h3' : 'h2'} 
          sx={{ 
            fontWeight: 800,
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            fontSize: {
              xs: '2rem',
              sm: '2.5rem',
              md: '3rem',
              lg: '3.5rem'
            },
            animation: `${fadeInUp} 0.6s ease-out 0.2s both`,
          }}
        >
          S.I.M.A.
        </Typography>
      </Box>

      {/* Main content - responsive container */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, sm: 6, md: 9 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Card
          className="card fade-in"
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: 450, md: 500 },
            p: { xs: 1, sm: 2, md: 3 },
            boxShadow: {
              xs: '0 8px 24px rgba(0, 0, 0, 0.12)',
              sm: '10px 40px 24px rgba(0, 0, 0, 0.15)',
            },
            animation: `${scaleUp} 0.6s ease-out 0.3s both`,
            borderRadius: { xs: '16px', sm: '20px' },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Título del formulario - responsive */}
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{ 
                mb: { xs: 2, sm: 3 },
                mt: { xs: 1, sm: 2 },
                fontWeight: 800, 
                textAlign: 'center',
                color: 'var(--primary)',
                fontSize: {
                  xs: '1.5rem',
                  sm: '1.8rem',
                  md: '2rem'
                }
              }}
            >
              Iniciar sesión
            </Typography>

            {/* Alert de error - responsive */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  animation: `${fadeInUp} 0.3s ease-out`,
                }}
              >
                {error}
              </Alert>
            )}

            {/* Formulario responsive */}
            <Box component="form" onSubmit={onSubmit}>
              <FormInput
                label="Usuario"
                value={usuario}
                onChange={setUsuario}
                required
                disabled={loading}
                fullWidth
                sx={{ mb: { xs: 2, sm: 3 } }}
              />
              
              <FormInput
                label="Contraseña"
                value={password}
                onChange={setPassword}
                type="password"
                required
                disabled={loading}
                fullWidth
                sx={{ mb: { xs: 3, sm: 4 } }}
              />
              
              {/* Botón de submit - responsive */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: { xs: 2, sm: 3, md: 4 },
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  fontWeight: 600,
                  bgcolor: 'var(--primary)',
                  borderRadius: { xs: '8px', sm: '12px' },
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(21, 77, 113, 0.3)',
                  '&:hover': { 
                    bgcolor: 'var(--accent)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(21, 77, 113, 0.4)',
                  },
                  '&:disabled': {
                    bgcolor: '#ccc',
                    transform: 'none',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box className="spinner" sx={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid #f3f3f3',
                      borderTop: '2px solid white',
                      margin: 0,
                    }} />
                    Iniciando...
                  </Box>
                ) : (
                  'INICIAR SESIÓN'
                )}
              </Button>
            </Box>

            {/* Texto adicional para móviles */}
            {isMobile && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  mt: 3,
                  color: 'text.secondary',
                  animation: `${fadeInUp} 0.6s ease-out 0.8s both`,
                }}
              >
                Sistema de Identificación de Mencionados y/o Aprehendidos
              </Typography>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Footer siempre al final */}
      <Footer />
    </Box>
  );
}
