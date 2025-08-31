import { Typography, keyframes } from '@mui/material';
import { useState } from 'react';

export default function Footer() {
  const [isHidden, setIsHidden] = useState(false);

  const slideUp = keyframes`
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `;

  return (
    <div
      className="footer"
      onMouseEnter={() => setIsHidden(true)}
      onMouseLeave={() => setIsHidden(false)}
      style={{
        position: 'relative',
        height: '115px',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgb(51, 161, 224)',
        padding: '10px 20px',
        textAlign: 'center',
        zIndex: 1000,
        animation: `${slideUp} 0.8s ease-out`,
        transform: isHidden ? 'translateY(70%)' : 'translateY(0)',
        transition: 'transform 0.3s ease-in-out',
        cursor: 'pointer',
      }}
    >
      <Typography variant="h6" sx={{ color: 'beige', mb: 1 }}>
        · SISTEMA DE IDENTIFICACIÓN DE MENCIONADOS Y APREHENDIDOS ·
      </Typography>
      <Typography variant="body1" sx={{ color: 'beige', mb: 1 }}>
        DEPARTAMENTO INTELIGENCIA CRIMINAL - D-2
      </Typography>
      <Typography variant="body3" sx={{ color: 'beige' }}>
        COPYRIGHT 2025 - SANZTECH - Todos los derechos reservados.
      </Typography>
      <Typography variant="body2" sx={{ color: 'beige' }}></Typography>
      <img
        src="/img/escDepto.png"
        alt="Logo"
        style={{
          height: '115px',
          width: '150px',
          maxWidth: '100px',
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  );
}
