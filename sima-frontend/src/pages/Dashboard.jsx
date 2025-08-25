import { Container, Grid, Button, Box } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const nav = useNavigate();
  return (
    <>
      <Header showSettings />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                alignItems: 'center',
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => nav('/buscar')}
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  width: '100%',
                  py: 3,
                  fontWeight: 600,
                }}
              >
                🔍 BUSCAR MENCIONADO/APREHENDIDO
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => nav('/cargar')}
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  width: '100%',
                  py: 3,
                  fontWeight: 600,
                }}
              >
                📄 CARGAR MENCIONADO/APREHENDIDO
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => nav('/registros')}
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  width: '100%',
                  py: 3,
                  fontWeight: 600,
                }}
              >
                🗂️ REGISTROS DELICTUALES
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}
