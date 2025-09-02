import {
  Container,
  Grid,
  Button,
  Box,
  keyframes,
  Card,
  CardContent,
  Typography,
  useMediaQuery,
  useTheme,
  Fade,
  Zoom,
} from '@mui/material';
import {
  PersonAdd,
  Search,
  Assignment,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const nav = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [visibleCards, setVisibleCards] = useState([]);

  // Animación escalonada de las tarjetas
  useEffect(() => {
    const timer = setTimeout(() => {
      [0, 1, 2].forEach(index => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, index * 200);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

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

  const scaleIn = keyframes`
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  `;

  const menuItems = [
    {
      id: 0,
      title: 'CARGAR',
      subtitle: 'Nuevo registro',
      description: 'Cargar mencionado/aprehendido',
      icon: (
        <PersonAdd
          sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
        />
      ),
      path: '/cargar',
      color: 'var(--primary)',
      hoverColor: 'var(--secondary)',
    },
    {
      id: 1,
      title: 'BUSCAR',
      subtitle: 'Consultar datos',
      description: 'Buscar mencionado/aprehendido',
      icon: (
        <Search sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }} />
      ),
      path: '/buscar',
      color: 'var(--secondary)',
      hoverColor: 'var(--accent)',
    },
    {
      id: 2,
      title: 'REGISTROS',
      subtitle: 'Ver historial',
      description: 'Registros delictuales',
      icon: (
        <Assignment
          sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
        />
      ),
      path: '/registros',
      color: 'var(--accent)',
      hoverColor: 'var(--primary)',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'var(--bg)',
      }}
    >
      <Header showSettings />

      {/* Título principal responsive */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6, md: 8 } }}>
          <Typography
            variant={isMobile ? 'h4' : isTablet ? 'h3' : 'h2'}
            sx={{
              fontWeight: 800,
              color: 'var(--primary)',
              mb: 2,
              animation: `${fadeInUp} 0.8s ease-out`,
              fontSize: {
                xs: '2rem',
                sm: '2.5rem',
                md: '3rem',
                lg: '3.5rem',
              },
            }}
          >
            <DashboardIcon
              sx={{
                fontSize: 'inherit',
                mr: 1,
                verticalAlign: 'middle',
              }}
            />
            Panel Principal
          </Typography>

          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
              animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
              fontSize: {
                xs: '1rem',
                sm: '1.1rem',
                md: '1.2rem',
              },
            }}
          >
            Sistema de Identificación de Mencionados y/o Aprehendidos
          </Typography>
        </Box>

        {/* Grid responsive de tarjetas */}
        <Grid
          container
          spacing={{ xs: 3, sm: 4, md: 6 }}
          justifyContent="center"
          sx={{ mb: { xs: 4, sm: 6, md: 8 } }}
        >
          {menuItems.map(item => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={item.id}
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Zoom
                in={visibleCards.includes(item.id)}
                timeout={600}
                style={{
                  transitionDelay: visibleCards.includes(item.id)
                    ? '0ms'
                    : '300ms',
                }}
              >
                <Card
                  className="card"
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '280px', md: '320px' },
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateY(0) scale(1)',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: `0 20px 40px rgba(21, 77, 113, 0.2)`,
                      '& .card-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                        color: item.hoverColor,
                      },
                      '& .card-button': {
                        bgcolor: item.hoverColor,
                        transform: 'translateY(-2px)',
                      },
                    },
                  }}
                  onClick={() => nav(item.path)}
                >
                  <CardContent
                    sx={{
                      p: { xs: 3, sm: 4 },
                      textAlign: 'center',
                      minHeight: { xs: '200px', sm: '220px', md: '240px' },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    {/* Icono */}
                    <Box
                      className="card-icon"
                      sx={{
                        color: item.color,
                        mb: { xs: 2, sm: 3 },
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </Box>

                    {/* Contenido */}
                    <Box sx={{ flex: 1, mb: 2 }}>
                      <Typography
                        variant={isMobile ? 'h6' : 'h5'}
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          mb: 1,
                          fontSize: {
                            xs: '1.1rem',
                            sm: '1.3rem',
                            md: '1.5rem',
                          },
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: item.color,
                          fontWeight: 600,
                          mb: 1,
                          fontSize: {
                            xs: '0.8rem',
                            sm: '0.9rem',
                          },
                        }}
                      >
                        {item.subtitle}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: {
                            xs: '0.85rem',
                            sm: '0.95rem',
                          },
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>

                    {/* Botón de acción */}
                    <Button
                      className="card-button"
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: item.color,
                        color: 'white',
                        fontWeight: 600,
                        py: { xs: 1, sm: 1.5 },
                        borderRadius: { xs: '8px', sm: '12px' },
                        fontSize: {
                          xs: '0.8rem',
                          sm: '0.9rem',
                          md: '1rem',
                        },
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: item.hoverColor,
                        },
                      }}
                    >
                      Acceder
                    </Button>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Información adicional para móviles */}
        {isMobile && (
          <Fade in timeout={1000} style={{ transitionDelay: '800ms' }}>
            <Card
              sx={{
                bgcolor: 'rgba(21, 77, 113, 0.05)',
                border: '1px solid rgba(21, 77, 113, 0.1)',
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontStyle: 'italic',
                  }}
                >
                  Desliza horizontalmente para acceder rápidamente a las
                  funciones principales
                </Typography>
              </CardContent>
            </Card>
          </Fade>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
