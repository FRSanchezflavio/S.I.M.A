import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Header({ showSettings = false }) {
  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: 'rgba(35, 11, 157, 1)' }}
      className="header"
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{ width: 56, height: 56, bgcolor: 'white', borderRadius: '4px' }}
        />
        <Typography variant="h3" sx={{ fontWeight: 600, color: 'yellow' }}>
          🚀 HOT RELOAD FUNCIONA! 🚀
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
