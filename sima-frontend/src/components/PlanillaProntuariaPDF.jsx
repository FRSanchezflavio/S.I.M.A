import React from 'react';
import { Box, Typography, Grid, Paper, Chip } from '@mui/material';
import './PlanillaProntuariaPDF.css';

/**
 * Componente para generar la Planilla de Análisis Delictual
 * Formato oficial del Departamento de Inteligencia Criminal
 */
export default function PlanillaProntuariaPDF({
  persona,
  antecedentes = [],
  registros = [],
}) {
  // Calcular edad desde fecha de nacimiento
  const calcularEdad = fechaNac => {
    if (!fechaNac) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const formatearFecha = fecha => {
    if (!fecha) return 'NO REGISTRADA';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Combinar todos los delitos (antecedentes personales + registros oficiales)
  const todosLosDelitos = [
    ...antecedentes.map(a => ({
      ...a,
      tipo: a.delito || a.tipo || 'NO ESPECIFICADO',
      origen: 'Antecedente Personal',
      esOficial: false,
    })),
    ...registros.map(r => ({
      ...r,
      tipo: r.tipo_delito || r.delito || 'NO ESPECIFICADO',
      origen: 'Registro Oficial',
      esOficial: true,
      fecha_hecho: r.created_at,
    })),
  ];

  return (
    <Box
      className="planilla-prontuaria"
      sx={{ p: 3, bgcolor: 'white', minHeight: '297mm' }}
    >
      {/* ENCABEZADO INSTITUCIONAL */}
      <Box
        className="encabezado-institucional"
        sx={{
          textAlign: 'center',
          mb: 3,
          borderBottom: '4px solid #1a365d',
          pb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            mb: 1,
          }}
        >
          {/* Logo institucional */}
          <Box
            component="img"
            src="/img/oficina2.jpeg"
            alt="Escudo Policial"
            sx={{
              width: 220,
              height: 220,
              borderRadius: '50%',
              border: '3px solid #1a365d',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }}
            onError={e => {
              e.target.style.display = 'none';
            }}
          />

          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: '#1a365d',
                letterSpacing: '3px',
                mb: 0.5,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              Dpto. Inteligencia Criminal
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#2c5282',
                textDecoration: 'underline',
                letterSpacing: '2px',
              }}
            >
              Análisis Delictual
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: '#666',
            fontStyle: 'italic',
            mt: 1,
          }}
        >
          Sistema de Identificación de Mencionados y/o Aprehendidos
        </Typography>
      </Box>

      {/* SECCIÓN: ANTECEDENTES PERSONALES (OCUPA PÁGINA COMPLETA) */}
      <Paper
        className="full-page"
        elevation={0}
        sx={{
          mb: 3,
          border: '3px solid #1a365d',
          borderRadius: 2,
          overflow: 'hidden',
          minHeight: '210mm', // Reservar la mayor parte de la hoja A4
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        <Box
          sx={{
            bgcolor: '#4169E1',
            color: 'white',
            p: 1.5,
            textAlign: 'center',
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2)',
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, letterSpacing: '2px' }}
          >
            ANTECEDENTES PERSONALES
          </Typography>
        </Box>

        <Box sx={{ p: 3, bgcolor: '#fafbfc', flex: 1 }}>
          <Grid container spacing={3}>
            {/* Foto del sujeto */}
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  width: 190,
                  height: 480,
                  border: '3px solid #1a365d',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#e8eaf0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  position: 'relative',
                  // asegurar que en pantallas pequeñas no quede centrado encima del contenido
                  pl: 0,
                }}
              >
                {persona.foto_principal ? (
                  <Box
                    component="img"
                    src={persona.foto_principal}
                    alt="Foto del sujeto"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML =
                        '<div style="text-align:center;color:#999;padding:20px;">SIN<br/>FOTOGRAFÍA</div>';
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'left', color: '#999', pl: 1, pt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      SIN
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      FOTOGRAFÍA
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(26, 54, 93, 0.9)',
                    color: 'white',
                    py: 0.5,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    📸 FOTOGRAFÍA
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Datos personales */}
            <Grid item xs={12} md={9}>
              <Box sx={{ pl: { xs: 0, md: 2 } }}>
                {/* Apellido y Nombre */}
                <Box
                  sx={{
                    mb: 2,
                    bgcolor: 'white',
                    p: 2,
                    borderRadius: 1,
                    boxShadow: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: '#1a365d',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    APELLIDO Y NOMBRE
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      color: '#000',
                      letterSpacing: '1px',
                    }}
                  >
                    {(persona.apellido || 'SIN APELLIDO').toUpperCase()},{' '}
                    {(persona.nombre || 'SIN NOMBRE').toUpperCase()}
                  </Typography>
                </Box>

                {/* Grid de datos */}
                <Grid container spacing={1.5}>
                  {/* Alias */}
                  <Grid item xs={12}>
                    <Box className="campo-dato-planilla">
                      <Typography className="campo-label-planilla">
                        ALIAS / APODO
                      </Typography>
                      <Typography className="campo-valor-planilla">
                        {persona.alias || 'Sin alias registrados'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* DNI */}
                  <Grid item xs={12} sm={6}>
                    <Box className="campo-dato-planilla">
                      <Typography className="campo-label-planilla">
                        D.N.I.
                      </Typography>
                      <Typography className="campo-valor-planilla">
                        {persona.dni || 'NO REGISTRADO'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Fecha de Nacimiento */}
                  <Grid item xs={12} sm={6}>
                    <Box className="campo-dato-planilla">
                      <Typography className="campo-label-planilla">
                        FECHA NAC.
                      </Typography>
                      <Typography className="campo-valor-planilla">
                        {persona.fecha_nacimiento
                          ? formatearFecha(persona.fecha_nacimiento)
                          : 'NO REGISTRADO'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Edad */}
                  <Grid item xs={12} sm={4}>
                    <Box className="campo-dato-planilla">
                      <Typography className="campo-label-planilla">
                        EDAD
                      </Typography>
                      <Typography className="campo-valor-planilla">
                        {calcularEdad(persona.fecha_nacimiento)} años
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Género */}
                  <Grid item xs={12} sm={4}>
                    <Box className="campo-dato-planilla">
                      <Typography className="campo-label-planilla">
                        GÉNERO
                      </Typography>
                      <Typography className="campo-valor-planilla">
                        {persona.genero === 'M'
                          ? 'Masculino'
                          : persona.genero === 'F'
                          ? 'Femenino'
                          : persona.genero || 'No especificado'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Nacionalidad */}
                  <Grid item xs={12} sm={4}>
                    <Box className="campo-dato-planilla">
                      <Typography className="campo-label-planilla">
                        NACIONALIDAD
                      </Typography>
                      <Typography className="campo-valor-planilla">
                        {persona.nacionalidad || 'ARG'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Domicilio */}
                  <Grid item xs={12}>
                    <Box className="campo-dato-planilla">
                      <Typography className="campo-label-planilla">
                        DOMICILIO
                      </Typography>
                      <Typography className="campo-valor-planilla">
                        {persona.direccion || 'NO REGISTRADO'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Provincia */}
                  <Grid item xs={12} sm={6}>
                    <Box className="campo-dato-planilla">
                      <Typography className="campo-label-planilla">
                        PROVINCIA
                      </Typography>
                      <Typography className="campo-valor-planilla">
                        {persona.provincia || 'Tucumán'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Comisaría */}
                  <Grid item xs={12} sm={6}>
                    <Box className="campo-dato-planilla">
                      <Typography className="campo-label-planilla">
                        COMISARÍA
                      </Typography>
                      <Typography className="campo-valor-planilla">
                        {persona.comisaria || 'No asignada'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Descripción Física */}
                  {persona.descripcion_fisica && (
                    <Grid item xs={12}>
                      <Box className="campo-dato-planilla">
                        <Typography className="campo-label-planilla">
                          DESCRIPCIÓN FÍSICA
                        </Typography>
                        <Typography className="campo-valor-planilla">
                          {persona.descripcion_fisica}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* SECCIÓN: ANTECEDENTES DELICTUALES */}
      <Paper
        elevation={0}
        sx={{
          border: '3px solid #1a365d',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            bgcolor: '#4169E1',
            color: 'white',
            p: 1.5,
            textAlign: 'center',
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2)',
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, letterSpacing: '2px' }}
          >
            ANTECEDENTES DELICTUALES
          </Typography>
        </Box>

        <Box sx={{ p: 3, bgcolor: '#fafbfc' }}>
          {todosLosDelitos.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                bgcolor: '#f0f4f8',
                borderRadius: 2,
                border: '2px dashed #cbd5e0',
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: '#4a5568', mb: 1 }}
              >
                ✓ SIN ANTECEDENTES REGISTRADOS
              </Typography>
              <Typography variant="body1" color="text.secondary">
                No hay delitos registrados en el sistema para este sujeto
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Contador de registros */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: '#fff3cd',
                  border: '2px solid #ffc107',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#856404' }}
                >
                  ⚠️ TOTAL DE ANTECEDENTES REGISTRADOS
                </Typography>
                <Chip
                  label={todosLosDelitos.length}
                  sx={{
                    bgcolor: '#d32f2f',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    height: 40,
                    px: 2,
                  }}
                />
              </Box>

              {/* Lista de delitos */}
              {todosLosDelitos.map((delito, index) => (
                <Paper
                  key={delito.id || index}
                  elevation={3}
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    border: `2px solid ${
                      delito.esOficial ? '#d32f2f' : '#1a365d'
                    }`,
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                >
                  {/* Encabezado del delito */}
                  <Box
                    sx={{
                      bgcolor: delito.esOficial ? '#ffebee' : '#e3f2fd',
                      p: 1.5,
                      borderBottom: `2px solid ${
                        delito.esOficial ? '#d32f2f' : '#1a365d'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={`#${index + 1}`}
                        sx={{
                          bgcolor: delito.esOficial ? '#d32f2f' : '#1a365d',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '1rem',
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: delito.esOficial ? '#d32f2f' : '#1a365d',
                        }}
                      >
                        {delito.tipo}
                      </Typography>
                    </Box>
                    <Chip
                      label={delito.origen}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: delito.esOficial ? '#d32f2f' : '#1a365d',
                        color: delito.esOficial ? '#d32f2f' : '#1a365d',
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  {/* Contenido del delito */}
                  <Box sx={{ p: 2, bgcolor: 'white' }}>
                    <Grid container spacing={2}>
                      {/* Comisaría */}
                      <Grid item xs={12} sm={6}>
                        <Box className="campo-delito">
                          <Typography className="campo-delito-label">
                            📍 Comisaría:
                          </Typography>
                          <Typography className="campo-delito-valor">
                            {delito.comisaria_hecho ||
                              delito.lugar ||
                              persona.comisaria ||
                              'No especificada'}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Fecha */}
                      <Grid item xs={12} sm={6}>
                        <Box className="campo-delito">
                          <Typography className="campo-delito-label">
                            📅 Fecha:
                          </Typography>
                          <Typography className="campo-delito-valor">
                            {formatearFecha(delito.fecha_hecho || delito.fecha)}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Rol (si existe) */}
                      {delito.rol && (
                        <Grid item xs={12} sm={6}>
                          <Box className="campo-delito">
                            <Typography className="campo-delito-label">
                              👤 Rol:
                            </Typography>
                            <Typography className="campo-delito-valor">
                              {delito.rol}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {/* Estado (para registros oficiales) */}
                      {delito.estado && (
                        <Grid item xs={12} sm={6}>
                          <Box className="campo-delito">
                            <Typography className="campo-delito-label">
                              📊 Estado:
                            </Typography>
                            <Chip
                              label={delito.estado}
                              size="small"
                              color={
                                delito.estado?.toLowerCase().includes('activo')
                                  ? 'error'
                                  : delito.estado
                                      ?.toLowerCase()
                                      .includes('cerrado')
                                  ? 'success'
                                  : 'default'
                              }
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Grid>
                      )}

                      {/* Juzgado */}
                      {delito.juzgado && (
                        <Grid item xs={12}>
                          <Box className="campo-delito">
                            <Typography className="campo-delito-label">
                              ⚖️ Juzgado:
                            </Typography>
                            <Typography className="campo-delito-valor">
                              {delito.juzgado}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {/* Descripción/Detalle */}
                      {(delito.descripcion || delito.detalle) && (
                        <Grid item xs={12}>
                          <Box className="campo-delito">
                            <Typography className="campo-delito-label">
                              📝 Detalle:
                            </Typography>
                            <Typography className="campo-delito-valor">
                              {delito.descripcion || delito.detalle}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      {/* PIE DE PÁGINA */}
      <Box
        sx={{
          mt: 4,
          pt: 2,
          borderTop: '3px double #1a365d',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: '#1a365d', mb: 0.5 }}
        >
          Sistema de Identificación de Mencionados y/o Aprehendidos (S.I.M.A)
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Documento generado el:{' '}
          {new Date().toLocaleString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: '#d32f2f', fontWeight: 600, display: 'block', mt: 1 }}
        >
          ⚠️ DOCUMENTO CONFIDENCIAL - USO POLICIAL EXCLUSIVO
        </Typography>
      </Box>
    </Box>
  );
}
