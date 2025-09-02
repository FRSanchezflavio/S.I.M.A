import { Container, Grid, Button, Box, keyframes } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const nav = useNavigate();

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

  const buttonStyle = {
    bgcolor: '#000',
    color: '#fff',
    width: '100%',
    py: 3,
    fontWeight: 1000,
    transition: 'all 0.3s ease',
    transform: 'translateY(0)',
    '&:hover': {
      bgcolor: 'rgb(21, 77, 113)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  };

  return (
    <>
      <Header showSettings />
      <Container maxWidth="lg" sx={{ py: 10, minHeight: '65vh' }}>
        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                alignItems: 'center',
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => nav('/cargar')}
                sx={{
                  ...buttonStyle,
                  animation: `${fadeInUp} 0.6s ease-out 0.1s both`,
                }}
              >
                📄 CARGAR MENCIONADO/APREHENDIDO
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => nav('/buscar')}
                sx={{
                  ...buttonStyle,
                  animation: `${fadeInUp} 0.6s ease-out 0.3s both`,
                }}
              >
                🔍 BUSCAR MENCIONADO/APREHENDIDO
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => nav('/registros')}
                sx={{
                  ...buttonStyle,
                  animation: `${fadeInUp} 0.6s ease-out 0.5s both`,
                }}
              >
                🗂️ REGISTROS DELICTUALES
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => nav('/mapas')}
                sx={{
                  ...buttonStyle,
                  bgcolor: '#1976d2',
                  '&:hover': {
                    bgcolor: '#1565c0',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(25, 118, 210, 0.4)',
                  },
                  animation: `${fadeInUp} 0.6s ease-out 0.7s both`,
                }}
              >
                🗺️ VISUALIZACIÓN GEOGRÁFICA
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}
