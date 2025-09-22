import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Autocomplete,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

const GestionBandas = ({
  personas = [],
  vinculaciones = [],
  onBandaCreada,
}) => {
  const [bandas, setBandas] = useState([]);
  const [dialogoNuevaBanda, setDialogoNuevaBanda] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nuevaBanda, setNuevaBanda] = useState({
    nombre: '',
    alias: '',
    tipo_criminal: '',
    nivel_peligrosidad: 'medio',
    estado_operacional: 'activa',
    lider_principal_id: '',
    territorio_principal: '',
    miembros: [],
  });

  const tiposCriminales = [
    { value: 'robo_automotor', label: 'Robo de Automotores' },
    { value: 'narcotrafico', label: 'Narcotráfico' },
    { value: 'extorsion', label: 'Extorsión' },
    { value: 'secuestro', label: 'Secuestro' },
    { value: 'homicidio', label: 'Homicidio' },
    { value: 'robo_armado', label: 'Robo Armado' },
    { value: 'lavado_dinero', label: 'Lavado de Dinero' },
    { value: 'trata_personas', label: 'Trata de Personas' },
  ];

  const nivelesPeligrosidad = [
    { value: 'bajo', label: 'Bajo', color: 'success' },
    { value: 'medio', label: 'Medio', color: 'warning' },
    { value: 'alto', label: 'Alto', color: 'error' },
    { value: 'extremo', label: 'Extremo', color: 'error' },
  ];

  const estadosOperacionales = [
    { value: 'activa', label: 'Activa', color: 'error' },
    { value: 'en_investigacion', label: 'En Investigación', color: 'warning' },
    {
      value: 'desarticulada_parcial',
      label: 'Desarticulada Parcial',
      color: 'info',
    },
    { value: 'desarticulada', label: 'Desarticulada', color: 'success' },
  ];

  useEffect(() => {
    fetchBandas();
  }, []);

  const fetchBandas = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const detectarBandasAutomaticamente = () => {
    if (vinculaciones.length < 3) {
      alert(
        'Se necesitan al menos 3 vinculaciones para detectar bandas automáticamente'
      );
      return;
    }

    // Algoritmo simple de detección de comunidades
    const grupos = {};
    const procesadas = new Set();

    vinculaciones.forEach(vinculo => {
      const origen = vinculo.persona_origen_id;
      const destino = vinculo.persona_destino_id;

      if (!grupos[origen]) grupos[origen] = new Set([origen]);
      if (!grupos[destino]) grupos[destino] = new Set([destino]);

      // Unir grupos
      const grupoOrigen = grupos[origen];
      const grupoDestino = grupos[destino];

      if (grupoOrigen !== grupoDestino) {
        // Fusionar grupos
        grupoDestino.forEach(persona => {
          grupoOrigen.add(persona);
          grupos[persona] = grupoOrigen;
        });
      }

      grupoOrigen.add(origen);
      grupoOrigen.add(destino);
      grupos[origen] = grupoOrigen;
      grupos[destino] = grupoOrigen;
    });

    // Identificar grupos únicos
    const gruposUnicos = [];
    Object.values(grupos).forEach(grupo => {
      const grupoArray = Array.from(grupo);
      if (
        grupoArray.length >= 3 &&
        !gruposUnicos.some(
          g =>
            g.length === grupoArray.length &&
            g.every(p => grupoArray.includes(p))
        )
      ) {
        gruposUnicos.push(grupoArray);
      }
    });

    // Crear bandas detectadas
    gruposUnicos.forEach((grupo, index) => {
      const personasGrupo = grupo
        .map(id => personas.find(p => p.dni == id || p.id == id))
        .filter(Boolean);

      if (personasGrupo.length >= 3) {
        const bandaDetectada = {
          nombre: `Banda Detectada ${index + 1}`,
          alias: `Grupo-${index + 1}`,
          tipo_criminal: 'sin_clasificar',
          nivel_peligrosidad: 'medio',
          estado_operacional: 'en_investigacion',
          lider_principal_id: personasGrupo[0]?.dni || '',
          territorio_principal: 'Por determinar',
          miembros: personasGrupo.map(p => ({
            persona_id: p.dni || p.id,
            nombre: `${p.nombre} ${p.apellido}`,
            rol_principal:
              p.dni === personasGrupo[0]?.dni ? 'lider_sospechoso' : 'miembro',
            nivel_jerarquico: 'por_determinar',
            estado_miembro: 'sospechoso',
          })),
          detectada_automaticamente: true,
        };

        setNuevaBanda(bandaDetectada);
        setDialogoNuevaBanda(true);
      }
    });

    if (gruposUnicos.length === 0) {
      alert(
        'No se detectaron bandas con los criterios actuales (mínimo 3 miembros)'
      );
    }
  };

  const crearBanda = async () => {
    if (!nuevaBanda.nombre || !nuevaBanda.lider_principal_id) {
      alert('Complete los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || 'http://localhost:4000'
        }/api/inteligencia/bandas`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nuevaBanda),
        }
      );

      if (response.ok) {
        await fetchBandas();
        setDialogoNuevaBanda(false);
        setNuevaBanda({
          nombre: '',
          alias: '',
          tipo_criminal: '',
          nivel_peligrosidad: 'medio',
          estado_operacional: 'activa',
          lider_principal_id: '',
          territorio_principal: '',
          miembros: [],
        });
        alert('Banda creada exitosamente');
        if (onBandaCreada) onBandaCreada();
      } else {
        alert('Error al crear banda');
      }
    } catch (error) {
      console.error('Error creating banda:', error);
      alert('Error al crear banda');
    } finally {
      setLoading(false);
    }
  };

  const agregarMiembro = persona => {
    if (!nuevaBanda.miembros.find(m => m.persona_id === persona.dni)) {
      setNuevaBanda(prev => ({
        ...prev,
        miembros: [
          ...prev.miembros,
          {
            persona_id: persona.dni,
            nombre: `${persona.nombre} ${persona.apellido}`,
            rol_principal: 'miembro',
            nivel_jerarquico: 'operativo',
            estado_miembro: 'activo_confirmado',
          },
        ],
      }));
    }
  };

  const removerMiembro = personaId => {
    setNuevaBanda(prev => ({
      ...prev,
      miembros: prev.miembros.filter(m => m.persona_id !== personaId),
    }));
  };

  return (
    <Box>
      {/* Controles principales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogoNuevaBanda(true)}
            fullWidth
          >
            Crear Banda Manual
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            onClick={detectarBandasAutomaticamente}
            fullWidth
            disabled={vinculaciones.length < 3}
          >
            Detectar Automáticamente
          </Button>
        </Grid>
      </Grid>

      {/* Información de estado */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Estado actual:</strong> {bandas.length} banda(s)
          registrada(s),
          {vinculaciones.length} vinculación(es) disponible(s) para análisis.
          {vinculaciones.length < 3 &&
            ' Se necesitan al menos 3 vinculaciones para detección automática.'}
        </Typography>
      </Alert>

      {/* Lista de bandas */}
      <Grid container spacing={3}>
        {bandas.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <GroupIcon
                  sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay bandas registradas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cree bandas manualmente o utilice la detección automática
                  basada en vinculaciones.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          bandas.map((banda, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">{banda.nombre}</Typography>
                    <Chip
                      label={
                        estadosOperacionales.find(
                          e => e.value === banda.estado_operacional
                        )?.label
                      }
                      color={
                        estadosOperacionales.find(
                          e => e.value === banda.estado_operacional
                        )?.color
                      }
                      size="small"
                    />
                  </Box>

                  {banda.alias && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Alias: {banda.alias}
                    </Typography>
                  )}

                  <Typography variant="body2" gutterBottom>
                    <strong>Tipo:</strong>{' '}
                    {tiposCriminales.find(t => t.value === banda.tipo_criminal)
                      ?.label || banda.tipo_criminal}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={`Peligrosidad: ${
                        nivelesPeligrosidad.find(
                          n => n.value === banda.nivel_peligrosidad
                        )?.label
                      }`}
                      color={
                        nivelesPeligrosidad.find(
                          n => n.value === banda.nivel_peligrosidad
                        )?.color
                      }
                      size="small"
                    />
                    <Chip
                      label={`${banda.miembros?.length || 0} miembros`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  {banda.territorio_principal && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Territorio:</strong> {banda.territorio_principal}
                    </Typography>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Button size="small" startIcon={<VisibilityIcon />}>
                      Ver Detalles
                    </Button>
                    <Button size="small" startIcon={<EditIcon />}>
                      Editar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Dialog para crear nueva banda */}
      <Dialog
        open={dialogoNuevaBanda}
        onClose={() => setDialogoNuevaBanda(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {nuevaBanda.detectada_automaticamente
            ? 'Banda Detectada Automáticamente'
            : 'Crear Nueva Banda'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre de la Banda *"
                value={nuevaBanda.nombre}
                onChange={e =>
                  setNuevaBanda(prev => ({ ...prev, nombre: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Alias"
                value={nuevaBanda.alias}
                onChange={e =>
                  setNuevaBanda(prev => ({ ...prev, alias: e.target.value }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo Criminal</InputLabel>
                <Select
                  value={nuevaBanda.tipo_criminal}
                  onChange={e =>
                    setNuevaBanda(prev => ({
                      ...prev,
                      tipo_criminal: e.target.value,
                    }))
                  }
                >
                  {tiposCriminales.map(tipo => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Nivel de Peligrosidad</InputLabel>
                <Select
                  value={nuevaBanda.nivel_peligrosidad}
                  onChange={e =>
                    setNuevaBanda(prev => ({
                      ...prev,
                      nivel_peligrosidad: e.target.value,
                    }))
                  }
                >
                  {nivelesPeligrosidad.map(nivel => (
                    <MenuItem key={nivel.value} value={nivel.value}>
                      {nivel.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Estado Operacional</InputLabel>
                <Select
                  value={nuevaBanda.estado_operacional}
                  onChange={e =>
                    setNuevaBanda(prev => ({
                      ...prev,
                      estado_operacional: e.target.value,
                    }))
                  }
                >
                  {estadosOperacionales.map(estado => (
                    <MenuItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={personas}
                getOptionLabel={option =>
                  `${option.nombre} ${option.apellido} - DNI: ${option.dni}`
                }
                value={
                  personas.find(p => p.dni === nuevaBanda.lider_principal_id) ||
                  null
                }
                onChange={(e, newValue) => {
                  setNuevaBanda(prev => ({
                    ...prev,
                    lider_principal_id: newValue?.dni || '',
                  }));
                }}
                renderInput={params => (
                  <TextField {...params} label="Líder Principal *" />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Territorio Principal"
                value={nuevaBanda.territorio_principal}
                onChange={e =>
                  setNuevaBanda(prev => ({
                    ...prev,
                    territorio_principal: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Miembros de la Banda ({nuevaBanda.miembros.length})
              </Typography>

              <Autocomplete
                options={personas.filter(
                  p => !nuevaBanda.miembros.find(m => m.persona_id === p.dni)
                )}
                getOptionLabel={option =>
                  `${option.nombre} ${option.apellido} - DNI: ${option.dni}`
                }
                onChange={(e, newValue) => {
                  if (newValue) agregarMiembro(newValue);
                }}
                renderInput={params => (
                  <TextField {...params} label="Agregar Miembro" />
                )}
                key={nuevaBanda.miembros.length} // Force re-render
              />

              <List dense sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
                {nuevaBanda.miembros.map((miembro, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={miembro.nombre}
                      secondary={`${miembro.rol_principal} - ${miembro.nivel_jerarquico}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => removerMiembro(miembro.persona_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoNuevaBanda(false)}>Cancelar</Button>
          <Button onClick={crearBanda} variant="contained" disabled={loading}>
            {nuevaBanda.detectada_automaticamente
              ? 'Confirmar Banda'
              : 'Crear Banda'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionBandas;
