import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Stack,
} from '@mui/material';

export default function CardResult({ item, onDetail }) {
  return (
    <Card
      className="card"
      sx={{
        display: 'flex',
        height: '330px',
        gap: 1,
        p: 0,
        backgroundColor: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        boxShadow:
          '0 2px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(25, 118, 210, 0.12)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
        },
        '&:hover': {
          boxShadow:
            '0 30px 24px rgba(0, 0, 0, 0.12), 0 0 0 4px rgba(25, 118, 210, 0.2)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: 170,
          height: 180,
          margin: '20px auto',
          ml: 2,
          objectFit: 'cover',
          borderRadius: 2,
          border: '1px solid #1976d2',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
        image={
          item.foto_principal || 'https://via.placeholder.com/150?text=Sin+foto'
        }
        alt={item.nombre}
        onError={e => {
          e.currentTarget.src = 'https://via.placeholder.com/150?text=Sin+foto';
        }}
      />
      <CardContent sx={{ flex: 1, backgroundColor: 'transparent' }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            color: '#0d355cff',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: '2px solid #e3f2fd',
            pb: 1,
            mb: 1,
            fontSize: '1.5rem',
          }}
        >
          {item.apellido}, {item.nombre}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: '#333',
            backgroundColor: '#e3f2fd',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            mb: 0.5,
            fontSize: '1rem',
          }}
        >
          DNI: {item.dni}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#555',
            fontWeight: 800,
            mb: 0.5,
            fontSize: '1rem',
          }}
        >
          Comisaría: {item.comisaria || '-'}
        </Typography>
        {item.comisaria_hecho && (
          <Typography
            variant="body1"
            sx={{
              color: '#d32f2f',
              fontWeight: 800,
              backgroundColor: '#ffebee',
              padding: '2px 6px',
              borderRadius: '3px',
              display: 'inline-block',
              mb: 0.5,
              fontSize: '1rem',
            }}
          >
            Com. del Hecho: {item.comisaria_hecho}
          </Typography>
        )}
        {item.genero && (
          <Typography
            variant="body1"
            sx={{
              color: '#388e3c',
              fontWeight: 800,
              mb: 0.5,
              fontSize: '1rem',
            }}
          >
            Género: {item.genero}
          </Typography>
        )}
        <Stack direction="row" mt={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => onDetail?.(item)}
            sx={{
              height: '55px',
              bgcolor: 'rgb(21, 77, 113)',
              color: 'white',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.9px',
              borderRadius: '6px',
              boxShadow: '0 3px 6px rgba(25, 118, 210, 0.3)',
              fontSize: '0.95rem',
              padding: '6px 16px 8px 16px',
              '&:hover': {
                bgcolor: '#1976d2',
                boxShadow: '0 4px 8px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            🔍Ver detalle
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
