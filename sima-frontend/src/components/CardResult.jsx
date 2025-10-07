import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Checkbox,
} from '@mui/material';

export default function CardResult({
  item,
  onDetail,
  selected = false,
  onSelect = null,
}) {
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
        border: selected ? '2px solid rgb(21, 77, 113)' : '1px solid #e0e0e0',
        backgroundColor: selected ? 'rgba(21, 77, 113, 0.05)' : '#fff',
        position: 'relative',

        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(21, 77, 113, 0.15)',
          borderColor: '#1a365d',
        },
      }}
      onClick={onDetail}
    >
      {/* Checkbox en esquina superior derecha */}
      {onSelect && (
        <Checkbox
          checked={selected}
          onChange={e => onSelect(item.id, e)}
          onClick={e => e.stopPropagation()}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '4px',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
            '& .MuiSvgIcon-root': {
              fontSize: 28,
            },
            color: 'rgb(21, 77, 113)',
            '&.Mui-checked': {
              color: 'rgb(21, 77, 113)',
            },
          }}
        />
      )}

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

        {/* Botón de detalle - SIEMPRE AL FINAL */}
        <Button
          variant="contained"
          fullWidth
          size="medium"
          sx={{
            bgcolor: '#1a365d',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.85rem',
            py: 1,
            mt: 'auto',
            '&:hover': {
              bgcolor: '#2c5282',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          VER DETALLE
        </Button>
      </CardContent>
    </Card>
  );
}
