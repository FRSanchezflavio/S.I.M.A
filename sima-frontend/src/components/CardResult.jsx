import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Grid,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

export default function CardResult({ item, onDetail, onVinculacion }) {
  return (
    <Card
      className="card"
      data-testid="card-result"
      elevation={2}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '350px',
        maxHeight: '400px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        position: 'relative',

        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(21, 77, 113, 0.15)',
          borderColor: '#1a365d',
        },
      }}
      onClick={onDetail}
    >
      {/* Imagen de la persona - CONTENEDOR FIJO */}
      <Box
        sx={{
          width: '100%',
          height: 180,
          backgroundColor: '#f5f5f5',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          image={
            item.foto_principal ||
            'https://via.placeholder.com/300x180/f5f5f5/999999?text=Sin+Foto'
          }
          alt={`${item.nombre} ${item.apellido}`}
          onError={e => {
            e.currentTarget.src =
              'https://via.placeholder.com/300x180/f5f5f5/999999?text=Sin+Foto';
          }}
        />
      </Box>

      {/* Contenido de la tarjeta - FLEXIBLE */}
      <CardContent
        sx={{
          p: 2,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 0,
        }}
      >
        {/* Información principal - FIJA */}
        <Box sx={{ mb: 1 }}>
          {/* Nombre completo */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1a365d',
              fontSize: '1rem',
              mb: 1,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minHeight: '1.2em',
            }}
          >
            {item.apellido ? `${item.apellido}, ${item.nombre}` : item.nombre}
          </Typography>

          {/* Información en grid fijo */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 0.5,
              mb: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.85rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                minHeight: '1.2em',
              }}
            >
              <Box component="span" sx={{ fontWeight: 700, minWidth: '35px' }}>
                DNI:
              </Box>
              <Box component="span" sx={{ ml: 1 }}>
                {item.dni || 'No especificado'}
              </Box>
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.85rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                minHeight: '1.2em',
              }}
            >
              <Box component="span" sx={{ fontWeight: 700, minWidth: '80px' }}>
                Jurisdicción:
              </Box>
              <Box component="span" sx={{ ml: 1 }}>
                {item.comisaria || '-'}
              </Box>
            </Typography>

            {item.direccion && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.8rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minHeight: '1.2em',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box
                  component="span"
                  sx={{ fontWeight: 700, minWidth: '65px' }}
                >
                  Domicilio:
                </Box>
                <Box
                  component="span"
                  sx={{ ml: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {item.direccion}
                </Box>
              </Typography>
            )}
          </Box>
        </Box>

        {/* Botones de acción */}
        <Grid container spacing={1} sx={{ mt: 'auto' }}>
          <Grid item xs={7}>
            <Button
              variant="contained"
              fullWidth
              size="small"
              sx={{
                bgcolor: '#1a365d',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                py: 0.8,
                '&:hover': {
                  bgcolor: '#2c5282',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
              onClick={e => {
                e.stopPropagation();
                onDetail();
              }}
            >
              VER DETALLE
            </Button>
          </Grid>
          <Grid item xs={5}>
            <Button
              variant="outlined"
              fullWidth
              size="small"
              startIcon={<AccountTreeIcon />}
              sx={{
                color: '#d32f2f',
                borderColor: '#d32f2f',
                fontWeight: 600,
                fontSize: '0.7rem',
                py: 0.8,
                '&:hover': {
                  bgcolor: '#d32f2f',
                  color: 'white',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
              onClick={e => {
                e.stopPropagation();
                if (onVinculacion) onVinculacion(item);
              }}
            >
              VINCULAR
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
