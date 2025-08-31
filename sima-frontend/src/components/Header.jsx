import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  keyframes,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Header({ showSettings = false }) {
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

  return (
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
        }}
      >
        <Box
          component="img"
          src="/img/oficina2.jpeg"
          alt="Logo"
          sx={{
            width: '130px',
            height: 'auto',
            bgcolor: 'white',
            borderRadius: '800px',
          }}
        />
        <Typography
          variant="h2"
          sx={{ fontWeight: 600, color: 'beige', mr: 9 }}
        >
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
