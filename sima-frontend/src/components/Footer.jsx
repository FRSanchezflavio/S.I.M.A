import {
  Typography,
  keyframes,
  Box,
  useMediaQuery,
  useTheme,
  Container,
  Stack,
} from '@mui/material';

export default function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `;

  const footerHeight = isMobile ? '140px' : isTablet ? '120px' : '115px';

  return (
    <Box
      className="footer"
      sx={{
        position: 'relative',
        height: footerHeight,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgb(51, 161, 224)',
        py: { xs: 1, sm: 1.5, md: 2 },
        px: { xs: 1, sm: 2, md: 3 },
        textAlign: 'center',
        zIndex: 10,
        animation: `${fadeIn} 0.4s ease-out`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        width: '100%',
        borderTop: '1px solid rgba(255,255,255,0.25)',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: { xs: 0.5, sm: 1 },
            position: 'relative',
          }}
        >
          {/* Contenido principal del footer */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', sm: 'flex-start', md: 'center' },
              justifyContent: 'center',
              textAlign: { xs: 'center', sm: 'left', md: 'center' },
              pr: { xs: 0, sm: 2, md: 8 },
            }}
          >
            <Typography
              variant={isMobile ? 'body2' : isTablet ? 'h6' : 'h6'}
              sx={{
                color: 'beige',
                fontWeight: 600,
                fontSize: {
                  xs: '0.75rem',
                  sm: '0.9rem',
                  md: '1rem',
                  lg: '1.1rem',
                },
                lineHeight: 1.2,
                mb: { xs: 0.5, sm: 0.5, md: 1 },
              }}
            >
              {isMobile
                ? '· S.I.M.A. ·'
                : '· SISTEMA DE IDENTIFICACIÓN DE MENCIONADOS Y APREHENDIDOS ·'}
            </Typography>

            <Typography
              variant={isMobile ? 'caption' : 'body1'}
              sx={{
                color: 'beige',
                fontSize: {
                  xs: '0.65rem',
                  sm: '0.8rem',
                  md: '0.9rem',
                  lg: '1rem',
                },
                fontWeight: 500,
                mb: { xs: 0.5, sm: 0.5, md: 1 },
                lineHeight: 1.1,
              }}
            >
              DEPARTAMENTO INTELIGENCIA CRIMINAL - D-2
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: 'beige',
                fontSize: {
                  xs: '0.6rem',
                  sm: '0.7rem',
                  md: '0.75rem',
                  lg: '0.8rem',
                },
                fontWeight: 400,
                opacity: 0.9,
                lineHeight: 1,
              }}
            >
              COPYRIGHT 2025 - SANZTECH - Todos los derechos reservados.
            </Typography>
          </Box>

          {/* Logo sin posición absoluta para evitar superposición en dashboard */}
          <Box
            component="img"
            src="/img/escDepto.png"
            alt="Logo Departamento"
            sx={{
              height: { xs: '60px', sm: '70px', md: '80px', lg: '90px' },
              width: 'auto',
              maxWidth: { xs: '60px', sm: '70px', md: '80px', lg: '100px' },
              position: 'static', // antes: absolute en sm+
              mt: { xs: 1, sm: 0 },
              opacity: 0.95,
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              '&:hover': { opacity: 1, transform: 'scale(1.03)' },
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
