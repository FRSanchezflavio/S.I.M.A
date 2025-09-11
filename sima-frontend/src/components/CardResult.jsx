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
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #333 0%, #555 100%)',
        },
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          transform: 'translateY(-2px)',
          border: '1px solid #888',
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
          borderRadius: 1,
          border: '2px solid #666',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
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
            color: '#2c2c2c',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: '2px solid #ccc',
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
            backgroundColor: '#f5f5f5',
            padding: '4px 8px',
            borderRadius: '2px',
            display: 'inline-block',
            mb: 0.5,
            fontSize: '1rem',
            border: '1px solid #ddd',
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
          Jurisdicción: {item.comisaria || '-'}
        </Typography>
        {item.direccion && (
          <Typography
            variant="body1"
            sx={{
              color: '#212421ff',
              fontWeight: 800,
              mb: 0.5,
              fontSize: '1rem',
            }}
          >
            Domicilio: {item.direccion}
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
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              fontSize: '0.95rem',
              padding: '6px 16px 8px 16px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              '&:hover': {
                bgcolor: '#154d71',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            VER DETALLE
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
