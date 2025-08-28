import { Typography } from '@mui/material';

export default function Footer() {
  return (
    <div
      className="footer"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgb(51, 161, 224)',
        padding: '10px 20px',
        textAlign: 'center',
        zIndex: 1000,
      }}
    >
      <Typography variant="h6" sx={{ color: 'beige' }}>
        · SISTEMA DE IDENTIFICACIÓN DE MENCIONADOS Y APREHENDIDOS ·
      </Typography>
      <Typography variant="body1" sx={{ color: 'beige' }}>
        DEPARTAMENTO INTELIGENCIA CRIMINAL - D-2
      </Typography>
      <Typography variant="body3" sx={{ color: 'beige' }}>
        COPYRIGHT 2025 - SANZTECH - Todos los derechos reservados.
      </Typography>
      <Typography variant="body2" sx={{ color: 'beige' }}></Typography>
    </div>
  );
}
