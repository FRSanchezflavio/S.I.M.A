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
    <Card className="card" sx={{ display: 'flex', gap: 2, p: 2 }}>
      <CardMedia
        component="img"
        sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 2 }}
        image={
          item.foto_principal || 'https://via.placeholder.com/120?text=Sin+foto'
        }
        alt={item.nombre}
        onError={e => {
          e.currentTarget.src = 'https://via.placeholder.com/120?text=Sin+foto';
        }}
      />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {item.apellido}, {item.nombre}
        </Typography>
        <Typography variant="body2">DNI: {item.dni}</Typography>
        <Typography variant="body2">
          Comisaría: {item.comisaria || '-'}
        </Typography>
        <Stack direction="row" mt={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => onDetail?.(item)}
            sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
          >
            Ver detalle
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
