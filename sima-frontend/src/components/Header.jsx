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
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Dashboard,
  Search,
  Add,
  List as ListIcon,
} from '@mui/icons-material';
import { useState } from 'react';

export default function Header({ showSettings = false }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { text: 'Registros', icon: <ListIcon />, path: '/registros' },
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
            minHeight: { xs: '64px', sm: '70px', md: '80px' },
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
              alt="Logo"
              sx={{
                width: { xs: '50px', sm: '70px', md: '90px', lg: '130px' },
                height: 'auto',
                bgcolor: 'white',
                borderRadius: '50%',
                mr: { xs: 1, sm: 2 },
              }}
            />
            {!isMobile && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: 'beige',
                  fontSize: { sm: '14px', md: '16px', lg: '20px' },
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Análisis Delictual
              </Typography>
            )}
          </Box>

          {/* Título central - responsive */}
          <Typography
            variant={isMobile ? 'h5' : isTablet ? 'h4' : 'h2'}
            sx={{
              fontWeight: 600,
              color: 'beige',
              position: isMobile ? 'static' : 'absolute',
              left: isMobile ? 'auto' : '50%',
              transform: isMobile ? 'none' : 'translateX(-50%)',
              fontSize: {
                xs: '1.5rem',
                sm: '1.8rem',
                md: '2.2rem',
                lg: '2.5rem',
                xl: '3rem',
              },
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
              <IconButton
                color="inherit"
                sx={{
                  ml: 1,
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              >
                <SettingsIcon />
              </IconButton>
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
            width: 250,
            bgcolor: 'rgb(21, 77, 113)',
            color: 'white',
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
                  // Aquí puedes agregar navegación
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
