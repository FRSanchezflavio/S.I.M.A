import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Header({
  showSettings = false,
  logoSrc = '/logo.png',
  logoAlt = 'S.I.M.A. logo',
}) {
  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: '#546e7a' }}
      className="header"
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Reemplazo del placeholder por imagen */}
        <Box
          component="img"
          src={logoSrc}
          alt={logoAlt}
          sx={{
            width: 56,
            height: 56,
            objectFit: 'contain',
            bgcolor: 'white',
            borderRadius: '4px',
            p: 0.5,
          }}
        />
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          S.I.M.A.
        </Typography>
        {showSettings ? (
          <IconButton color="inherit" aria-label="config">
            <SettingsIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}
      </Toolbar>
    </AppBar>
  );
}
