import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  keyframes,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Dashboard,
  Search,
  Add,
  List as ListIcon,
  LocationOn,
  AccountTree,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ showSettings = false }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const settingsMenuOpen = Boolean(settingsAnchorEl);

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

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Buscar', icon: <Search />, path: '/buscar' },
    { text: 'Cargar', icon: <Add />, path: '/cargar' },
    { text: 'Mapa General', icon: <LocationOn />, path: '/mapa' },
    {
      text: 'Mapa de Hechos',
      icon: <LocationOn />,
      path: '/mapa-hechos',
      secondary: true,
    },
    {
      text: 'Mapa de Domicilios',
      icon: <LocationOn />,
      path: '/mapa-domicilios',
      secondary: true,
    },
    { text: 'Inteligencia', icon: <AccountTree />, path: '/inteligencia' },
    { text: 'Registros', icon: <ListIcon />, path: '/registros' },
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSettingsClick = event => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleLogoClick = () => {
    // No hacer nada si estamos en login o dashboard
    if (location.pathname === '/login' || location.pathname === '/dashboard') {
      return;
    }
    // Navegar al dashboard desde cualquier otra página
    navigate('/dashboard');
  };

  const handleLogoKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogoClick();
    }
  };

  const handleLogout = () => {
    // Cerrar menús
    setMobileMenuOpen(false);
    setSettingsAnchorEl(null);

    // Limpiar todos los tokens y datos de sesión
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Opcional: limpiar otros datos de sesión si existen
    sessionStorage.clear();

    // Redireccionar al login
    navigate('/login');
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: 'rgb(21, 77, 113)',
          animation: `${slideDown} 0.8s ease-out`,
        }}
        className="header"
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 1, sm: 2, md: 3 },
            // Header más alto para mejor presencia
            minHeight: { xs: '72px', sm: '110px', md: '120px', lg: '130px' },
          }}
        >
          {/* Logo y título - responsive */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flex: isMobile ? '1' : 'none',
            }}
          >
            <Box
              component="img"
              src="/img/oficina2.jpeg"
              alt="Logo S.I.M.A."
              aria-label="Logo S.I.M.A. - Ir al dashboard"
              tabIndex={
                location.pathname === '/login' ||
                location.pathname === '/dashboard'
                  ? -1
                  : 0
              }
              role="button"
              onKeyDown={handleLogoKeyDown}
              onClick={handleLogoClick}
              sx={{
                // Agrandar logo para headers más altos
                width: { xs: '56px', sm: '88px', md: '110px', lg: '150px' },
                height: { xs: '56px', sm: '88px', md: '110px', lg: '150px' },
                maxWidth: { xs: '56px', sm: '88px', md: '110px', lg: '150px' },
                maxHeight: { xs: '56px', sm: '88px', md: '110px', lg: '150px' },
                objectFit: 'cover',
                bgcolor: 'white',
                borderRadius: '50%',
                mr: { xs: 1, sm: 2 },
                boxShadow: '0 6px 20px rgba(0,0,0,0.38)',
                border: '2px solid rgba(255,255,255,0.14)',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                cursor:
                  location.pathname === '/login' ||
                  location.pathname === '/dashboard'
                    ? 'default'
                    : 'pointer',
                '&:hover':
                  location.pathname === '/login' ||
                  location.pathname === '/dashboard'
                    ? {}
                    : {
                        transform: 'scale(1.06)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      },
              }}
            />

            {!isMobile && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'beige',
                  fontSize: { sm: '13px', md: '15px', lg: '18px' },
                  display: { xs: 'none', sm: 'block' },
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  ml: { sm: 0.5, md: 1 },
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                Análisis Delictual
              </Typography>
            )}
            {isMobile && (
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'beige',
                  fontSize: '0.8rem',
                  ml: 1,
                  display: { xs: 'block', sm: 'none' },
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Análisis
              </Typography>
            )}
          </Box>

          {/* Título central - responsive */}
          <Typography
            variant={isMobile ? 'h5' : isTablet ? 'h3' : 'h1'}
            sx={{
              fontWeight: 700,
              color: 'beige',
              position: isMobile ? 'static' : 'absolute',
              left: isMobile ? 'auto' : '50%',
              transform: isMobile ? 'none' : 'translateX(-50%)',
              // Fuentes más grandes para mayor presencia
              fontSize: {
                xs: '1.6rem',
                sm: '2.2rem',
                md: '2.8rem',
                lg: '3.4rem',
                xl: '4rem',
              },
              letterSpacing: '0.08em',
            }}
          >
            S.I.M.A.
          </Typography>

          {/* Botones de acción - responsive */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={handleMobileMenuToggle}
                sx={{ p: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {showSettings && (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleSettingsClick}
                  aria-controls={settingsMenuOpen ? 'settings-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={settingsMenuOpen ? 'true' : undefined}
                  sx={{
                    ml: 1,
                    display: { xs: 'none', sm: 'inline-flex' },
                  }}
                >
                  <SettingsIcon />
                </IconButton>

                {/* Menú desplegable de configuración */}
                <Menu
                  id="settings-menu"
                  anchorEl={settingsAnchorEl}
                  open={settingsMenuOpen}
                  onClose={handleSettingsClose}
                  MenuListProps={{
                    'aria-labelledby': 'settings-button',
                  }}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cerrar sesión"
                      sx={{ color: '#d32f2f' }}
                    />
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 300,
            bgcolor: 'rgb(21, 77, 113)',
            color: 'white',
            paddingTop: '12px',
          },
        }}
      >
        <Box sx={{ pt: 2 }}>
          <Typography
            variant="h6"
            sx={{
              px: 3,
              py: 2,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              fontWeight: 600,
            }}
          >
            S.I.M.A.
          </Typography>
          <List>
            {menuItems.map(item => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(item.path);
                }}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}

            {/* Separador visual antes del logout */}
            <Box
              sx={{
                borderTop: '1px solid rgba(255,255,255,0.2)',
                my: 2,
                mx: 2,
              }}
            />

            {/* Botón de cerrar sesión */}
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(255,100,100,0.2)',
                },
                color: '#ffcccc',
              }}
            >
              <ListItemIcon sx={{ color: '#ff6666', minWidth: '40px' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar sesión" sx={{ color: '#ffcccc' }} />
            </ListItem>

            {showSettings && (
              <ListItem
                button
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Configuración" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
