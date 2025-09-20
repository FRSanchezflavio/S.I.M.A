import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Box,
  Alert,
  Chip,
  Grid,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import { debounce } from '@mui/material/utils';
import api from '../../services/api';
import { useToast } from '../ToastProvider';

// Configuración de tipos de vínculos policiales
const TIPOS_VINCULO = {
  // Vínculos familiares
  familiar_sangre: 'Familiar Consanguíneo',
  familiar_politico: 'Familiar Político',
  relacion_sentimental: 'Relación Sentimental',

  // Vínculos sociales
  amistad_personal: 'Amistad Personal',
  comunicacion_frecuente: 'Comunicación Frecuente',

  // Vínculos comerciales/financieros
  socio_comercial: 'Socio Comercial',
  empleador_empleado: 'Empleador-Empleado',
  proveedor_cliente: 'Proveedor-Cliente',
  intermediario_financiero: 'Intermediario Financiero',
  transaccion_sospechosa: 'Transacción Sospechosa',

  // Vínculos territoriales/operacionales
  mismo_territorio: 'Mismo Territorio Operativo',
  red_distribucion: 'Red de Distribución',
  uso_misma_ruta: 'Uso de Misma Ruta',

  // Vínculos tecnológicos/comunicacionales
  comunicacion_digital: 'Comunicación Digital',
  mismo_dispositivo: 'Uso del Mismo Dispositivo',
  red_social_conjunta: 'Red Social Conjunta',

  // Vínculos judiciales/antecedentes
  misma_causa_judicial: 'Misma Causa Judicial',
  antecedentes_comunes: 'Antecedentes Comunes',
  misma_detencion: 'Misma Detención',

  // Vínculos operativos/delictivos
  participacion_conjunta: 'Participación Conjunta en Delito',
  organizacion_criminal: 'Organización Criminal',
  lavado_activos: 'Lavado de Activos',
  financiamiento_ilegal: 'Financiamiento Ilegal',

  // Vínculos de inteligencia
  informante_referencia: 'Informante-Referencia',
  vigilancia_conjunta: 'Vigilancia Conjunta',
  operativo_conjunto: 'Operativo Conjunto',
};

const NIVELES_CONFIANZA = {
  0.1: 'Muy Baja (10%)',
  0.3: 'Baja (30%)',
  0.5: 'Media (50%)',
  0.7: 'Alta (70%)',
  0.9: 'Muy Alta (90%)',
  1.0: 'Confirmada (100%)',
};

const ESTADOS_VINCULACION = {
  activa_confirmada: 'Activa Confirmada',
  activa_sospechosa: 'Activa Sospechosa',
  historica_confirmada: 'Histórica Confirmada',
  historica_sospechosa: 'Histórica Sospechosa',
  bajo_investigacion: 'Bajo Investigación',
  interrumpida_temporal: 'Interrumpida Temporal',
  terminada_conflicto: 'Terminada por Conflicto',
  terminada_natural: 'Terminada Natural',
};

const FormularioVinculacionAvanzado = ({
  open,
  onClose,
  onGuardado,
  personaInicial = null,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [personasOrigen, setPersonasOrigen] = useState([]);
  const [personasDestino, setPersonasDestino] = useState([]);
  const [loadingOrigen, setLoadingOrigen] = useState(false);
  const [loadingDestino, setLoadingDestino] = useState(false);
  const [inputOrigenValue, setInputOrigenValue] = useState('');
  const [inputDestinoValue, setInputDestinoValue] = useState('');
  const { showToast } = useToast();

  // Estados del formulario
  const [formData, setFormData] = useState({
    persona_origen_id: personaInicial?.id || null,
    persona_destino_id: null,
    tipo_vinculacion: '',
    subtipo_detalle: '',
    descripcion: '',
    nivel_confianza: 0.7,
    estado_vinculacion: 'activa_sospechosa',
    fecha_deteccion: new Date(),
    evidencias_respaldo: [],
    justificacion: '',
  });

  const [errors, setErrors] = useState({});

  const steps = [
    'Seleccionar Personas',
    'Tipo de Vínculo',
    'Evidencias y Confirmación',
  ];

  // Configurar persona inicial si se proporciona
  useEffect(() => {
    if (personaInicial && open) {
      setFormData(prev => ({
        ...prev,
        persona_origen_id: personaInicial.id,
      }));
      // Agregar la persona inicial a la lista de personasOrigen
      setPersonasOrigen([personaInicial]);
    }
  }, [personaInicial, open]);

  // Función de búsqueda con debounce para personas origen
  const debouncedSearchOrigen = useMemo(
    () =>
      debounce(async searchText => {
        if (!searchText || searchText.length < 2) {
          setPersonasOrigen(personaInicial ? [personaInicial] : []);
          return;
        }

        setLoadingOrigen(true);
        try {
          console.log('🔍 Buscando personas origen:', searchText);
          const response = await api.get('/personas', {
            params: {
              q: searchText,
              pageSize: 10,
            },
          });

          console.log('📡 Respuesta del servidor (origen):', response.data);
          const resultados = response.data.items || [];
          console.log('👥 Personas encontradas (origen):', resultados.length);

          // Si hay persona inicial, incluirla en los resultados si no está ya
          if (personaInicial) {
            const yaIncluida = resultados.find(p => p.id === personaInicial.id);
            if (!yaIncluida) {
              setPersonasOrigen([personaInicial, ...resultados]);
            } else {
              setPersonasOrigen(resultados);
            }
          } else {
            setPersonasOrigen(resultados);
          }
        } catch (error) {
          console.error('Error buscando personas origen:', error);
          setPersonasOrigen(personaInicial ? [personaInicial] : []);
        } finally {
          setLoadingOrigen(false);
        }
      }, 300),
    [personaInicial]
  );

  // Función de búsqueda con debounce para personas destino
  const debouncedSearchDestino = useMemo(
    () =>
      debounce(async searchText => {
        if (!searchText || searchText.length < 2) {
          setPersonasDestino([]);
          return;
        }

        setLoadingDestino(true);
        try {
          console.log('🔍 Buscando personas destino:', searchText);
          const response = await api.get('/personas', {
            params: {
              q: searchText,
              pageSize: 10,
            },
          });

          console.log('📡 Respuesta del servidor (destino):', response.data);
          // Filtrar para no mostrar la persona origen
          const resultados = (response.data.items || []).filter(
            persona => persona.id !== formData.persona_origen_id
          );
          console.log('👥 Personas encontradas (destino):', resultados.length);

          setPersonasDestino(resultados);
        } catch (error) {
          console.error('Error buscando personas destino:', error);
          setPersonasDestino([]);
        } finally {
          setLoadingDestino(false);
        }
      }, 300),
    [formData.persona_origen_id]
  );

  // Ejecutar búsqueda cuando cambie el input
  useEffect(() => {
    debouncedSearchOrigen(inputOrigenValue);
  }, [inputOrigenValue, debouncedSearchOrigen]);

  useEffect(() => {
    debouncedSearchDestino(inputDestinoValue);
  }, [inputDestinoValue, debouncedSearchDestino]);

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      debouncedSearchOrigen.clear();
      debouncedSearchDestino.clear();
    };
  }, [debouncedSearchOrigen, debouncedSearchDestino]);

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const validateStep = step => {
    const newErrors = {};

    switch (step) {
      case 0: // Selección de personas
        if (!formData.persona_origen_id) {
          newErrors.persona_origen_id = 'Debe seleccionar una persona origen';
        }
        if (!formData.persona_destino_id) {
          newErrors.persona_destino_id = 'Debe seleccionar una persona destino';
        }
        if (formData.persona_origen_id === formData.persona_destino_id) {
          newErrors.persona_destino_id =
            'No puede vincular una persona consigo misma';
        }
        break;

      case 1: // Tipo de vínculo
        if (!formData.tipo_vinculacion) {
          newErrors.tipo_vinculacion = 'Debe seleccionar un tipo de vínculo';
        }
        if (!formData.descripcion) {
          newErrors.descripcion = 'Debe proporcionar una descripción';
        }
        break;

      case 2: // Evidencias
        if (!formData.justificacion) {
          newErrors.justificacion = 'Debe proporcionar una justificación';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        evidencias_respaldo: formData.evidencias_respaldo.filter(e => e.trim()),
      };

      await api.post('/api/inteligencia/vinculaciones/advanced', dataToSend);

      showToast('Vinculación creada exitosamente', 'success');
      onGuardado?.();
      handleClose();
    } catch (error) {
      console.error('Error guardando vinculación:', error);
      showToast('Error al guardar la vinculación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      persona_origen_id: personaInicial?.id || null,
      persona_destino_id: null,
      tipo_vinculacion: '',
      subtipo_detalle: '',
      descripcion: '',
      nivel_confianza: 0.7,
      estado_vinculacion: 'activa_sospechosa',
      fecha_deteccion: new Date(),
      evidencias_respaldo: [],
      justificacion: '',
    });
    setErrors({});
    onClose();
  };

  // Función helper para encontrar persona por ID en ambas listas
  const getPersonaById = id => {
    if (!id) return null;

    // Buscar en personasOrigen primero
    let persona = personasOrigen.find(p => p.id === id);
    if (persona) return persona;

    // Luego buscar en personasDestino
    persona = personasDestino.find(p => p.id === id);
    if (persona) return persona;

    // Si es personaInicial, retornarla
    if (personaInicial && personaInicial.id === id) return personaInicial;

    return null;
  };

  const renderStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: '#1565c0', mb: 3 }}
            >
              🔍 Seleccionar Personas para Vinculación
            </Typography>

            <Grid container spacing={3}>
              {/* Persona Origen */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Persona Origen *
                </Typography>
                {personaInicial ? (
                  <Box
                    sx={{
                      p: 2,
                      border: '2px solid #e3f2fd',
                      borderRadius: 2,
                      bgcolor: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Avatar
                      src={personaInicial.foto_principal}
                      sx={{ width: 50, height: 50 }}
                    >
                      {personaInicial.nombre?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {personaInicial.apellido}, {personaInicial.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        DNI: {personaInicial.dni}
                      </Typography>
                      <Chip
                        label={personaInicial.comisaria || 'Sin comisaría'}
                        size="small"
                        color="primary"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Autocomplete
                    options={personasOrigen}
                    loading={loadingOrigen}
                    value={getPersonaById(formData.persona_origen_id)}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        persona_origen_id: newValue?.id || null,
                      }));
                    }}
                    inputValue={inputOrigenValue}
                    onInputChange={(event, newInputValue) => {
                      setInputOrigenValue(newInputValue);
                    }}
                    getOptionLabel={option =>
                      `${option.apellido}, ${option.nombre} (DNI: ${option.dni})`
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id === value?.id
                    }
                    filterOptions={x => x}
                    renderInput={params => (
                      <TextField
                        {...params}
                        placeholder="Escriba para buscar personas..."
                        variant="outlined"
                        fullWidth
                        error={!!errors.persona_origen_id}
                        helperText={
                          errors.persona_origen_id ||
                          'Mínimo 2 caracteres para buscar'
                        }
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <Box sx={{ mr: 1, color: 'text.secondary' }}>
                              🔍
                            </Box>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, persona) => (
                      <Box
                        component="li"
                        {...props}
                        sx={{
                          display: 'flex !important',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          minHeight: '80px',
                          '&:hover': {
                            bgcolor: 'rgba(21, 77, 113, 0.08)',
                          },
                        }}
                      >
                        <Avatar
                          src={persona.foto_principal}
                          sx={{ width: 40, height: 40 }}
                        >
                          {persona.nombre?.[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight="500">
                            {persona.apellido}, {persona.nombre}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            DNI: {persona.dni} •{' '}
                            {persona.comisaria || 'Sin comisaría'}
                          </Typography>
                          {persona.tipo_delito && (
                            <Chip
                              label={persona.tipo_delito}
                              size="small"
                              variant="outlined"
                              sx={{ mt: 0.5, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                    noOptionsText={
                      inputOrigenValue.length < 2
                        ? 'Escriba al menos 2 caracteres'
                        : loadingOrigen
                        ? 'Buscando...'
                        : 'No se encontraron personas'
                    }
                    loadingText="Buscando personas..."
                    sx={{
                      '& .MuiAutocomplete-listbox': {
                        maxHeight: '300px',
                      },
                    }}
                  />
                )}
              </Grid>

              {/* Persona Destino */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Buscar Persona Destino *
                </Typography>
                <Autocomplete
                  options={personasDestino}
                  loading={loadingDestino}
                  value={getPersonaById(formData.persona_destino_id)}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      persona_destino_id: newValue?.id || null,
                    }));
                  }}
                  inputValue={inputDestinoValue}
                  onInputChange={(event, newInputValue) => {
                    setInputDestinoValue(newInputValue);
                  }}
                  getOptionLabel={option =>
                    `${option.apellido}, ${option.nombre} (DNI: ${option.dni})`
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value?.id
                  }
                  filterOptions={x => x}
                  renderInput={params => (
                    <TextField
                      {...params}
                      placeholder="Escriba para buscar personas..."
                      variant="outlined"
                      fullWidth
                      error={!!errors.persona_destino_id}
                      helperText={
                        errors.persona_destino_id ||
                        'Mínimo 2 caracteres para buscar'
                      }
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <Box sx={{ mr: 1, color: 'text.secondary' }}>🔍</Box>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, persona) => (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        display: 'flex !important',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        minHeight: '80px',
                        '&:hover': {
                          bgcolor: 'rgba(21, 77, 113, 0.08)',
                        },
                      }}
                    >
                      <Avatar
                        src={persona.foto_principal}
                        sx={{ width: 40, height: 40 }}
                      >
                        {persona.nombre?.[0]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight="500">
                          {persona.apellido}, {persona.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          DNI: {persona.dni} •{' '}
                          {persona.comisaria || 'Sin comisaría'}
                        </Typography>
                        {persona.tipo_delito && (
                          <Chip
                            label={persona.tipo_delito}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                  noOptionsText={
                    inputDestinoValue.length < 2
                      ? 'Escriba al menos 2 caracteres'
                      : loadingDestino
                      ? 'Buscando...'
                      : 'No se encontraron personas'
                  }
                  loadingText="Buscando personas..."
                  sx={{
                    '& .MuiAutocomplete-listbox': {
                      maxHeight: '300px',
                    },
                  }}
                />
              </Grid>

              {/* Preview de la vinculación */}
              {formData.persona_origen_id && formData.persona_destino_id && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      mt: 2,
                      p: 3,
                      border: '2px dashed #4caf50',
                      borderRadius: 2,
                      bgcolor: 'rgba(76, 175, 80, 0.05)',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 2,
                        color: '#4caf50',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      ✅ Preview de Vinculación:
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar
                          src={
                            getPersonaById(formData.persona_origen_id)
                              ?.foto_principal
                          }
                          sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}
                        >
                          {
                            getPersonaById(formData.persona_origen_id)
                              ?.nombre?.[0]
                          }
                        </Avatar>
                        <Typography variant="body2" fontWeight="bold">
                          {getPersonaById(formData.persona_origen_id)?.apellido}
                          , {getPersonaById(formData.persona_origen_id)?.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          DNI: {getPersonaById(formData.persona_origen_id)?.dni}
                        </Typography>
                      </Box>

                      <Box sx={{ mx: 3, textAlign: 'center' }}>
                        <Typography
                          variant="h3"
                          color="primary"
                          sx={{ lineHeight: 1 }}
                        >
                          ⟷
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          VINCULACIÓN
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar
                          src={
                            getPersonaById(formData.persona_destino_id)
                              ?.foto_principal
                          }
                          sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}
                        >
                          {
                            getPersonaById(formData.persona_destino_id)
                              ?.nombre?.[0]
                          }
                        </Avatar>
                        <Typography variant="body2" fontWeight="bold">
                          {
                            getPersonaById(formData.persona_destino_id)
                              ?.apellido
                          }
                          ,{' '}
                          {getPersonaById(formData.persona_destino_id)?.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          DNI:{' '}
                          {getPersonaById(formData.persona_destino_id)?.dni}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: '#1565c0', mb: 3 }}
            >
              🔗 Definir Tipo de Vínculo
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={!!errors.tipo_vinculacion}
                >
                  <InputLabel>Tipo de Vínculo</InputLabel>
                  <Select
                    value={formData.tipo_vinculacion}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        tipo_vinculacion: e.target.value,
                      }))
                    }
                    label="Tipo de Vínculo"
                  >
                    {Object.entries(TIPOS_VINCULO).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.tipo_vinculacion && (
                    <Typography variant="caption" color="error">
                      {errors.tipo_vinculacion}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado de la Vinculación</InputLabel>
                  <Select
                    value={formData.estado_vinculacion}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        estado_vinculacion: e.target.value,
                      }))
                    }
                    label="Estado de la Vinculación"
                  >
                    {Object.entries(ESTADOS_VINCULACION).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Descripción del Vínculo"
                  value={formData.descripcion}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      descripcion: e.target.value,
                    }))
                  }
                  error={!!errors.descripcion}
                  helperText={errors.descripcion}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>
                  Nivel de Confianza:{' '}
                  {NIVELES_CONFIANZA[formData.nivel_confianza]}
                </Typography>
                <Slider
                  value={formData.nivel_confianza}
                  onChange={(e, value) =>
                    setFormData(prev => ({
                      ...prev,
                      nivel_confianza: value,
                    }))
                  }
                  step={0.1}
                  marks={Object.keys(NIVELES_CONFIANZA).map(key => ({
                    value: parseFloat(key),
                    label: `${(parseFloat(key) * 100).toFixed(0)}%`,
                  }))}
                  min={0.1}
                  max={1.0}
                  valueLabelDisplay="auto"
                  valueLabelFormat={value => `${(value * 100).toFixed(0)}%`}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: '#1565c0', mb: 3 }}
            >
              📋 Evidencias y Confirmación
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Detección"
                  value={
                    formData.fecha_deteccion
                      ? new Date(formData.fecha_deteccion)
                          .toISOString()
                          .split('T')[0]
                      : new Date().toISOString().split('T')[0]
                  }
                  onChange={e => {
                    const newDate = e.target.value
                      ? new Date(e.target.value)
                      : new Date();
                    setFormData(prev => ({
                      ...prev,
                      fecha_deteccion: newDate,
                    }));
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!errors.fecha_deteccion}
                  helperText={
                    errors.fecha_deteccion ||
                    'Fecha en que se detectó la vinculación'
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Justificación de la Vinculación"
                  value={formData.justificacion}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      justificacion: e.target.value,
                    }))
                  }
                  error={!!errors.justificacion}
                  helperText={errors.justificacion}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Evidencias de Respaldo (opcional)
                </Typography>
                {formData.evidencias_respaldo.map((evidencia, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      value={evidencia}
                      onChange={e => {
                        const newEvidencias = [...formData.evidencias_respaldo];
                        newEvidencias[index] = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          evidencias_respaldo: newEvidencias,
                        }));
                      }}
                      placeholder={`Evidencia ${index + 1}`}
                    />
                    <Button
                      onClick={() => {
                        const newEvidencias =
                          formData.evidencias_respaldo.filter(
                            (_, i) => i !== index
                          );
                        setFormData(prev => ({
                          ...prev,
                          evidencias_respaldo: newEvidencias,
                        }));
                      }}
                      color="error"
                    >
                      Eliminar
                    </Button>
                  </Box>
                ))}
                <Button
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      evidencias_respaldo: [...prev.evidencias_respaldo, ''],
                    }))
                  }
                  variant="outlined"
                >
                  Agregar Evidencia
                </Button>
              </Grid>

              {/* Resumen de la vinculación */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Resumen de la Vinculación
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">
                          Persona Origen:
                        </Typography>
                        <Typography>
                          {getPersonaById(formData.persona_origen_id)?.apellido}
                          , {getPersonaById(formData.persona_origen_id)?.nombre}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">
                          Persona Destino:
                        </Typography>
                        <Typography>
                          {
                            getPersonaById(formData.persona_destino_id)
                              ?.apellido
                          }
                          ,{' '}
                          {getPersonaById(formData.persona_destino_id)?.nombre}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">
                          Tipo de Vínculo:
                        </Typography>
                        <Typography>
                          {TIPOS_VINCULO[formData.tipo_vinculacion]}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">
                          Nivel de Confianza:
                        </Typography>
                        <Typography>
                          {NIVELES_CONFIANZA[formData.nivel_confianza]}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            🔗 Crear Nueva Vinculación Criminal
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 3 }}>{renderStepContent(activeStep)}</Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button onClick={handleBack} disabled={activeStep === 0}>
            Anterior
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Crear Vinculación'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Siguiente
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default FormularioVinculacionAvanzado;
