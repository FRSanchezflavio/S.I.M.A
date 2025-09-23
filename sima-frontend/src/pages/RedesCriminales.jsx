import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AccountTree,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Group as GroupIcon,
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VisualizadorRedCriminalDemo from '../components/inteligencia/VisualizadorRedCriminalDemo';
import GestionBandas from '../components/inteligencia/GestionBandas';

// TabPanel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RedesCriminales() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estados para datos
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
  const [vinculaciones, setVinculaciones] = useState([]);
  const [bandas, setBandas] = useState([]);

  // Estados para formulario de vinculación
  const [nuevaVinculacion, setNuevaVinculacion] = useState({
    persona_origen_id: '',
    persona_destino_id: '',
    tipo_vinculo: '',
    nivel_confianza: 0.8,
    estado: 'activa_confirmada',
    evidencias: '',
    descripcion: '',
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    // Usar la nueva función robusta para cargar personas
    fetchPersonasDisponibles();
    fetchVinculacionesExistentes();
    fetchBandasExistentes();
  }, []);

  const fetchPersonasRegistradas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || 'http://localhost:4000'
        }/api/personas?pageSize=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPersonasDisponibles(data.personas || data.data || []);
      } else {
        console.error('Error fetching personas:', response.status);
      }
    } catch (error) {
      console.error('Error fetching personas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función: fetch robusto y normalización de respuesta
  const fetchPersonasDisponibles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      // Intentar varias formas de endpoint por compatibilidad
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const urlsToTry = [
        `${baseUrl}/api/personas?page=1&pageSize=200`,
        `${baseUrl}/api/personas?pageSize=200`,
        `${baseUrl}/api/personas-registradas?page=1&pageSize=200`,
      ];

      let data = null;
      for (const url of urlsToTry) {
        try {
          // eslint-disable-next-line no-console
          console.log('Intentando cargar personas desde:', url);
          const res = await fetch(url, {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
          });

          if (!res.ok) {
            // eslint-disable-next-line no-console
            console.warn(
              'Respuesta no OK al cargar personas:',
              res.status,
              url
            );
            continue;
          }

          const json = await res.json();
          // Normalizar posibles shapes
          if (Array.isArray(json)) data = json;
          else if (Array.isArray(json.items)) data = json.items;
          else if (Array.isArray(json.personas)) data = json.personas;
          else if (Array.isArray(json.data)) data = json.data;
          else if (Array.isArray(json.results)) data = json.results;
          else data = null;

          if (data) {
            // eslint-disable-next-line no-console
            console.log('Personas cargadas (raw):', data.length);
            break;
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Error cargando desde', url, e.message || e);
        }
      }

      if (!data) {
        setPersonasDisponibles([]);
        // eslint-disable-next-line no-console
        console.error(
          'No se pudieron cargar personas desde ninguno de los endpoints probados.'
        );
        return;
      }

      // Normalizar estructura mínima para Autocomplete
      const normalized = data
        .map(p => ({
          id: p.id || p.persona_id || p.dni || null,
          nombre: p.nombre || p.nombres || p.nombre_completo || '',
          apellido: p.apellido || p.apellidos || '',
          dni: p.dni || p.numero_documento || '',
          ...p,
        }))
        .filter(p => p.id !== null);

      // eslint-disable-next-line no-console
      console.log('Personas normalizadas:', normalized.length);
      setPersonasDisponibles(normalized);
    } catch (err) {
      console.error('Excepción cargando personas:', err);
      setPersonasDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVinculacionesExistentes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || 'http://localhost:4000'
        }/api/inteligencia/vinculaciones`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVinculaciones(data || []);
      }
    } catch (error) {
      console.error('Error fetching vinculaciones:', error);
    }
  };

  const fetchBandasExistentes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || 'http://localhost:4000'
        }/api/inteligencia/bandas`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBandas(data || []);
      }
    } catch (error) {
      console.error('Error fetching bandas:', error);
    }
  };

  const handleCrearVinculacion = async () => {
    if (
      !nuevaVinculacion.persona_origen_id ||
      !nuevaVinculacion.persona_destino_id ||
      !nuevaVinculacion.tipo_vinculo
    ) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      // Mapear campos del frontend al backend
      const payload = {
        persona_origen_id: parseInt(nuevaVinculacion.persona_origen_id),
        persona_destino_id: parseInt(nuevaVinculacion.persona_destino_id),
        tipo_vinculacion: nuevaVinculacion.tipo_vinculo, // Mapear tipo_vinculo -> tipo_vinculacion
        estado_vinculacion: nuevaVinculacion.estado, // Mapear estado -> estado_vinculacion
        nivel_confianza: nuevaVinculacion.nivel_confianza,
        evidencias: nuevaVinculacion.evidencias,
        descripcion: nuevaVinculacion.descripcion,
      };

      console.log('Payload a enviar:', payload);

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || 'http://localhost:4000'
        }/api/inteligencia/vinculaciones`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      // Leer respuesta de forma robusta
      const contentType = response.headers.get('content-type') || '';
      let responseData;
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      console.log(
        'Crear vinculacion response status:',
        response.status,
        responseData
      );

      if (response.ok) {
        await fetchVinculacionesExistentes();
        setNuevaVinculacion({
          persona_origen_id: '',
          persona_destino_id: '',
          tipo_vinculo: '',
          nivel_confianza: 0.8,
          estado: 'activa_confirmada',
          evidencias: '',
          descripcion: '',
        });
        alert('Vinculación creada exitosamente');
      } else {
        const msg = responseData?.error || responseData || 'Error desconocido';
        // Mostrar stack en desarrollo si viene desde backend
        if (
          responseData &&
          responseData.stack &&
          process.env.NODE_ENV !== 'production'
        ) {
          alert(
            `Error creando vinculacion: ${msg}\n\nStack:\n${responseData.stack}`
          );
        } else {
          alert(`Error: ${msg}`);
        }
      }
    } catch (error) {
      console.error('Error completo:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const tiposVinculo = [
    { value: 'familiar_sangre', label: 'Familiar de Sangre' },
    { value: 'complice_directo', label: 'Cómplice Directo' },
    { value: 'jerarquia_comando', label: 'Jerarquía de Comando' },
    { value: 'territorial_barrial', label: 'Territorial/Barrial' },
    { value: 'socio_comercial', label: 'Socio Comercial' },
    { value: 'contacto_frecuente', label: 'Contacto Frecuente' },
  ];

  const estadosVinculo = [
    { value: 'activa_confirmada', label: 'Activa Confirmada' },
    { value: 'bajo_investigacion', label: 'Bajo Investigación' },
    { value: 'historica_confirmada', label: 'Histórica Confirmada' },
    { value: 'suspendida', label: 'Suspendida' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'var(--bg)',
      }}
    >
      <Header />

      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        {/* Título principal */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            component="h1"
            sx={{
              fontWeight: 'bold',
              color: 'var(--primary)',
              textAlign: 'center',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <AccountTree sx={{ fontSize: { xs: '2rem', md: '3rem' } }} />
            REDES CRIMINALES
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mb: 3,
            }}
          >
            Análisis de vínculos y organizaciones criminales
          </Typography>
        </Box>

        {/* Tabs principales */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'medium',
              },
            }}
          >
            <Tab
              icon={<LinkIcon />}
              label="Vinculaciones"
              iconPosition="start"
            />
            <Tab
              icon={<VisibilityIcon />}
              label="Visualización"
              iconPosition="start"
            />
            <Tab icon={<GroupIcon />} label="Bandas" iconPosition="start" />
            <Tab
              icon={<AnalyticsIcon />}
              label="Análisis"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Contenido de las tabs */}

        {/* TAB 0: VINCULACIONES */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Formulario para crear vinculación */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <AddIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Crear Nueva Vinculación
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Autocomplete
                        options={personasDisponibles}
                        getOptionLabel={option =>
                          `${option.nombre} ${option.apellido} - DNI: ${option.dni}`
                        }
                        value={
                          personasDisponibles.find(
                            p => p.id === nuevaVinculacion.persona_origen_id
                          ) || null
                        }
                        onChange={(e, newValue) => {
                          setNuevaVinculacion(prev => ({
                            ...prev,
                            persona_origen_id: newValue?.id || '',
                          }));
                        }}
                        renderInput={params => (
                          <TextField {...params} label="Persona Origen *" />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Autocomplete
                        options={personasDisponibles}
                        getOptionLabel={option =>
                          `${option.nombre} ${option.apellido} - DNI: ${option.dni}`
                        }
                        value={
                          personasDisponibles.find(
                            p => p.id === nuevaVinculacion.persona_destino_id
                          ) || null
                        }
                        onChange={(e, newValue) => {
                          setNuevaVinculacion(prev => ({
                            ...prev,
                            persona_destino_id: newValue?.id || '',
                          }));
                        }}
                        renderInput={params => (
                          <TextField {...params} label="Persona Destino *" />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo de Vínculo *</InputLabel>
                        <Select
                          value={nuevaVinculacion.tipo_vinculo}
                          onChange={e =>
                            setNuevaVinculacion(prev => ({
                              ...prev,
                              tipo_vinculo: e.target.value,
                            }))
                          }
                        >
                          {tiposVinculo.map(tipo => (
                            <MenuItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Estado</InputLabel>
                        <Select
                          value={nuevaVinculacion.estado}
                          onChange={e =>
                            setNuevaVinculacion(prev => ({
                              ...prev,
                              estado: e.target.value,
                            }))
                          }
                        >
                          {estadosVinculo.map(estado => (
                            <MenuItem key={estado.value} value={estado.value}>
                              {estado.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Evidencias"
                        multiline
                        rows={3}
                        value={nuevaVinculacion.evidencias}
                        onChange={e =>
                          setNuevaVinculacion(prev => ({
                            ...prev,
                            evidencias: e.target.value,
                          }))
                        }
                        placeholder="Escuchas telefónicas, seguimientos, testimonios..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleCrearVinculacion}
                        disabled={loading}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        {loading ? (
                          <CircularProgress size={24} />
                        ) : (
                          'Crear Vinculación'
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Lista de vinculaciones */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Vinculaciones Existentes ({vinculaciones.length})
                  </Typography>

                  {vinculaciones.length === 0 ? (
                    <Alert severity="info">
                      No hay vinculaciones registradas. Cree la primera
                      vinculación para comenzar el análisis.
                    </Alert>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {vinculaciones.map((vinculo, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                          <CardContent sx={{ py: 1 }}>
                            <Typography variant="body2">
                              <strong>Tipo:</strong> {vinculo.tipo_vinculo}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Estado:</strong> {vinculo.estado}
                            </Typography>
                            {vinculo.evidencias && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {vinculo.evidencias}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 1: VISUALIZACIÓN */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Árbol Genealógico Criminal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Visualización interactiva de las redes criminales basada en
              vinculaciones registradas
            </Typography>

            {personasDisponibles.length > 0 ? (
              <VisualizadorRedCriminalDemo
                personas={personasDisponibles}
                vinculaciones={vinculaciones}
                altura={600}
                personaId={1}
                onPersonaSelect={persona => {
                  console.log('Persona seleccionada:', persona);
                }}
              />
            ) : (
              <Alert severity="warning">
                No hay datos de personas disponibles para visualizar. Verifique
                que el sistema tenga personas registradas.
              </Alert>
            )}
          </Paper>
        </TabPanel>

        {/* TAB 2: BANDAS */}
        <TabPanel value={tabValue} index={2}>
          <GestionBandas
            personas={personasDisponibles}
            vinculaciones={vinculaciones}
            onBandaCreada={() => {
              // Refrescar datos cuando se cree una banda
              fetchBandasExistentes();
            }}
          />
        </TabPanel>

        {/* TAB 3: ANÁLISIS */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Métricas Generales */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Personas Registradas</Typography>
                  </Box>
                  <Typography variant="h3" color="primary" gutterBottom>
                    {personasDisponibles.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de individuos en el sistema
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LinkIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="h6">Vinculaciones</Typography>
                  </Box>
                  <Typography variant="h3" color="secondary" gutterBottom>
                    {vinculaciones.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vínculos criminales identificados
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <GroupIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6">Organizaciones</Typography>
                  </Box>
                  <Typography variant="h3" color="warning.main" gutterBottom>
                    {bandas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bandas criminales detectadas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Análisis de Vinculaciones */}
            {vinculaciones.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tipos de Vinculaciones
                    </Typography>
                    {(() => {
                      const tiposCount = vinculaciones.reduce((acc, v) => {
                        acc[v.tipo_vinculo] = (acc[v.tipo_vinculo] || 0) + 1;
                        return acc;
                      }, {});

                      const tiposLabels = {
                        familiar_sangre: 'Familiar de Sangre',
                        complice_directo: 'Cómplice Directo',
                        jerarquia_comando: 'Jerarquía de Comando',
                        territorial_barrial: 'Territorial/Barrial',
                        socio_comercial: 'Socio Comercial',
                        contacto_frecuente: 'Contacto Frecuente',
                      };

                      return Object.entries(tiposCount).map(([tipo, count]) => (
                        <Box
                          key={tipo}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2">
                            {tiposLabels[tipo] || tipo}
                          </Typography>
                          <Chip
                            label={count}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      ));
                    })()}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Estados de Vinculaciones */}
            {vinculaciones.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Estados de Investigación
                    </Typography>
                    {(() => {
                      const estadosCount = vinculaciones.reduce((acc, v) => {
                        acc[v.estado] = (acc[v.estado] || 0) + 1;
                        return acc;
                      }, {});

                      const estadosLabels = {
                        activa_confirmada: 'Activa Confirmada',
                        bajo_investigacion: 'Bajo Investigación',
                        historica_confirmada: 'Histórica Confirmada',
                        suspendida: 'Suspendida',
                      };

                      const estadosColors = {
                        activa_confirmada: 'error',
                        bajo_investigacion: 'warning',
                        historica_confirmada: 'info',
                        suspendida: 'default',
                      };

                      return Object.entries(estadosCount).map(
                        ([estado, count]) => (
                          <Box
                            key={estado}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2">
                              {estadosLabels[estado] || estado}
                            </Typography>
                            <Chip
                              label={count}
                              size="small"
                              color={estadosColors[estado] || 'default'}
                            />
                          </Box>
                        )
                      );
                    })()}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Métricas de Red */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Métricas de la Red Criminal
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {personasDisponibles.length > 0
                            ? Math.round(
                                (vinculaciones.length /
                                  personasDisponibles.length) *
                                  100
                              ) / 100
                            : 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Densidad de Red
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {vinculaciones.length > 0
                            ? Math.max(
                                ...vinculaciones.reduce((acc, v) => {
                                  acc[v.persona_origen_id] =
                                    (acc[v.persona_origen_id] || 0) + 1;
                                  acc[v.persona_destino_id] =
                                    (acc[v.persona_destino_id] || 0) + 1;
                                  return acc;
                                }, {})
                              )
                            : 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Máx. Conexiones
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          {
                            vinculaciones.filter(
                              v => v.estado === 'activa_confirmada'
                            ).length
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Vínculos Activos
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="error.main">
                          {
                            vinculaciones.filter(v =>
                              ['familiar_sangre', 'jerarquia_comando'].includes(
                                v.tipo_vinculo
                              )
                            ).length
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Vínculos Críticos
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Recomendaciones */}
            {vinculaciones.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    <AnalyticsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Recomendaciones de Análisis
                  </Typography>
                  <Typography variant="body2">
                    • Con {vinculaciones.length} vinculaciones identificadas, se
                    recomienda priorizar el análisis de personas con más de 3
                    conexiones.
                    <br />
                    • Los vínculos de tipo "jerarquia_comando" y
                    "familiar_sangre" suelen indicar estructuras organizadas.
                    <br />• Considere investigar territorios comunes entre
                    personas vinculadas para detectar zonas de operación.
                    {bandas.length === 0 && vinculaciones.length >= 3 && (
                      <>
                        <br />• Hay suficientes vinculaciones para intentar la
                        detección automática de bandas.
                      </>
                    )}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Sin datos */}
            {vinculaciones.length === 0 && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  <Typography variant="subtitle2" gutterBottom>
                    Sin datos suficientes para análisis
                  </Typography>
                  <Typography variant="body2">
                    Para generar análisis significativos, es necesario:
                    <br />• Registrar al menos 3 vinculaciones entre personas
                    <br />• Completar la información de evidencias y tipos de
                    vínculos
                    <br />• Verificar que las personas estén correctamente
                    identificadas
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Container>

      <Footer />
    </Box>
  );
}
