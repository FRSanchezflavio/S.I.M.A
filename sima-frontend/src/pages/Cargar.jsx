import { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Box,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FormInput from '../components/FormInput';
import MapModal from '../components/MapModal';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export default function Cargar() {
  // Estructura jerárquica de regionales y comisarías
  const regionalesData = {
    URC: [
      'Comisaria 1a',
      'Comisaria 2a',
      'Comisaria 3a',
      'Comisaria 4a',
      'Comisaria 5a',
      'Comisaria 6a',
      'Comisaria 7a',
      'Comisaria 8a',
      'Comisaria 9a',
      'Comisaria 10a',
      'Comisaria 11a',
      'Comisaria 12a',
      'Comisaria 13a',
      'Comisaria 14a',
      'Comisaria 15a',
    ],
    URN: [
      'Cria. de Trancas',
      'Cria. Chuscha',
      'Cria. Choromoro',
      'Cria. Vipos',
      'Sub Cria. de Tapia',
      'Cria. San Pedro de Colalao',
      'Cria. Yerba Buena',
      'Cria. Marti Coll',
      'Cria. San José',
      'Cria. El Corte',
      'Cria. San Javier',
      'Cria. Villa Carmela',
      'Cria. Raco',
      'Cria. Los Nogales',
      'Cria. El Cadillal',
      'Cria. Las Talitas',
      'Cria. V. Mariano Moreno',
      'Cria. El Colmenar',
      'Cria. Los Pocitos',
      'Cria. Lomas de Tafi',
      'Cria. Villa Obrera',
      'Cria. Tafi Viejo',
    ],
    URS: [
      'Cria. de Concepción',
      'Sub. Cria. Alto Verde',
      'Cria. Arcadia',
      'Cria. Alpachiri',
      'Cria. Medinas',
      'Cria. La Trinidad',
      'Cria. Aguilares',
      'Sub. Cria. El Polear',
      'Cria. Sta. Ana',
      'Cria. Los Sarmientos',
      'Cria. Sta. Cruz',
      'Cria. Monteagudo',
      'Cria. Villa Chicligasta',
      'Cria. Graneros',
      'Cria. Atahona',
      'Cria. Simoca',
      'Cria. Manuela Pedraza',
      'Cria. Taco Ralo',
      'Cria. Villa Belgrano',
      'Cria. Lamadrid',
      'Cria. J. B. Alberdi',
      'Cria. Escaba',
      'Cria. La Invernada',
      'Cria. Los Juarez',
      'Cria. Juan Posse',
      'Cria. Rio Chico',
      'Cria. Pampa Mayo',
    ],
    URO: [
      'Cria. Tafi del Valle',
      'Cria. El Mollar',
      'Cria. Amaicha del Valle',
      'Cria. Colalao del Valle',
      'Cria. Lules',
      'Cria. La Reducción',
      'Cria. El Manantial',
      'Cria. San Pablo',
      'Cria. V. Nougues',
      'Cria. Los Aguirre',
      'Cria. Famailla',
      'Cria. Tte. Berdina',
      'Cria. Monteros',
      'Cria. Santa Lucía',
      'Cria. Acheral',
      'Cria. Río Seco',
      'Cria. Villa Quinteros',
      'Cria. León Rouges',
      'Cria. Capitán Cáceres',
      'Cria. Los Sosa y Soldado Maldonado',
      'Cria. Amberes',
      'Cria. Sargento Moya',
    ],
    URE: [
      'Cria. Burruyacu',
      'Cria. El Cajon',
      'Cria. Villa B. Araoz',
      'Cria. El Puestito',
      'Cria. Chilcas',
      'Cria. 7 de Abril',
      'Cria. El Chañar',
      'Cria. La Ramada',
      'Cria. Garmendia',
      'Cria. El Timbo',
      'Cria. El Naranjo',
      'Cria. Piedrabuena',
      'Cria. Villa P. Monti',
      'Cria. Banda del Rio Sali',
      'Cria. Lastenia',
      'Cria. Guemes',
      'Cria. Alderetes',
      'Cria. Pozo del Alto',
      'Cria. Ranchillos',
      'Cria. Los Ralos',
      'Cria. Delfin Gallo',
      'Cria. Colombres',
      'Cria. La Florida',
      'Cria. San Andres',
      'Cria. El Bracho',
      'Cria. Las Cejas',
      'Cria. Los Bulacios',
      'Cria. Bella Vista',
      'Cria. Romera Pozo',
      'Cria. Santa Rosa de Leales',
      'Cria. Quilmes',
      'Cria. Ingenio Leales',
      'Cria. Los Sueldos',
      'Cria. Estacion Araoz',
      'Cria. Villa de Leales',
      'Cria. Rio Colorado',
      'Cria. Esquina',
      'Cria. Mancopa',
      'Cria. Agua Dulce',
      'Cria. Los Gomez',
      'Cria. Los Puestos',
      'Cria. Los Herrera',
      'Cria. El Mojon',
      'Cria. Campo El Quimil',
    ],
  };

  const [form, setForm] = useState({
    tipo_delito: '',
    modalidad: '',
    nombre: '',
    alias: '', // Campo Alias agregado
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    edad: '',
    genero: '',
    nacionalidad: '',
    direccion: '',
    provincia: 'tucuman', // Provincia preseleccionada por defecto
    telefono: '',
    observaciones: '',
    comisaria: '',
    comisaria_hecho: '',
    categoria: '',
    UnidadesRegionales: '',
    fecha_carga: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    // Campos para georeferenciación
    latitud: '',
    longitud: '',
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [comisariasDisponibles, setComisariasDisponibles] = useState([]);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const nav = useNavigate();
  const { showToast } = useToast();

  const canSave = form.nombre && form.apellido && form.dni && files.length > 0;

  // Función para manejar la selección de ubicación en el mapa
  const handleLocationSelect = location => {
    if (location) {
      setSelectedLocation(location);
      setForm(prev => ({
        ...prev,
        latitud: location.lat.toString(),
        longitud: location.lng.toString(),
      }));
      showToast('Ubicación seleccionada correctamente', 'success');
    } else {
      setSelectedLocation(null);
      setForm(prev => ({
        ...prev,
        latitud: '',
        longitud: '',
      }));
      showToast('Ubicación eliminada', 'info');
    }
  };

  // Función para abrir el modal del mapa
  const handleOpenMap = () => {
    setMapModalOpen(true);
  };

  // Función para manejar el cambio de regional
  const handleRegionalChange = regional => {
    setForm(prev => ({
      ...prev,
      UnidadesRegionales: regional,
      comisaria: '', // Reset comisaría cuando cambia la regional
    }));

    // Actualizar comisarías disponibles según la regional seleccionada
    if (regional && regionalesData[regional]) {
      setComisariasDisponibles(regionalesData[regional]);
    } else {
      setComisariasDisponibles([]);
    }
  };

  const onFile = e => {
    setFiles(Array.from(e.target.files || []));
  };

  const onSubmit = async () => {
    setError('');
    setOk('');

    // Verificar token antes de enviar
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
      showToast('Sesión expirada', 'error');
      nav('/login');
      return;
    }

    try {
      const data = new FormData();
      const formData = { ...form };
      // Mapear UnidadesRegionales a unidades_regionales para el backend
      if (formData.UnidadesRegionales) {
        formData.unidades_regionales = formData.UnidadesRegionales;
        delete formData.UnidadesRegionales;
      }

      // Convertir coordenadas a números si están presentes
      if (formData.latitud && formData.latitud !== '') {
        formData.latitud = parseFloat(formData.latitud);
      }
      if (formData.longitud && formData.longitud !== '') {
        formData.longitud = parseFloat(formData.longitud);
      }

      Object.entries(formData).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) {
          data.append(k, v);
        }
      });
      files.forEach(f => data.append('fotos', f));

      // Enviar datos a la base de datos
      const response = await api.post('/personas', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Si se guardó correctamente y hay datos de delito, crear antecedente personal
      if (
        response.data &&
        response.data.id &&
        (form.tipo_delito || form.modalidad)
      ) {
        try {
          // Crear antecedente personal en localStorage
          const antecedentePersonal = {
            id: `delito_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            tipo: form.tipo_delito || 'otros',
            modalidad: form.modalidad || '',
            descripcion: `Delito registrado desde formulario de carga: ${
              form.tipo_delito
            }${form.modalidad ? ` - ${form.modalidad}` : ''}`,
            lugar: form.direccion || '',
            comisaria_hecho: form.comisaria_hecho || form.comisaria || '',
            estado: 'activo',
            juzgado: '',
            fecha_hecho:
              form.fecha_carga || new Date().toISOString().split('T')[0],
            fecha_carga: new Date().toISOString(),
            observaciones: form.observaciones || '',
            fotos: [], // Las fotos ya se guardaron en el registro principal
            sujetoId: response.data.id.toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Guardar en localStorage usando la misma estructura del hook
          const storageKey = `delitos_especificos_${response.data.id}`;
          const existingDelitos = JSON.parse(
            localStorage.getItem(storageKey) || '[]'
          );
          const nuevosDelitos = [...existingDelitos, antecedentePersonal];
          localStorage.setItem(storageKey, JSON.stringify(nuevosDelitos));

          console.log(
            'Antecedente personal creado automáticamente:',
            antecedentePersonal
          );
        } catch (err) {
          console.error('Error creando antecedente personal automático:', err);
          // No fallar el proceso principal si hay error en antecedentes
        }
      }

      setOk('Guardado correctamente');
      showToast('Persona guardada', 'success');

      // Mostrar mensaje adicional si se creó antecedente personal
      if (form.tipo_delito || form.modalidad) {
        showToast('Antecedente personal creado automáticamente', 'info');
      }

      setForm({
        tipo_delito: '',
        modalidad: '',
        nombre: '',
        alias: '', // Limpiar campo Alias al resetear
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        edad: '',
        genero: '',
        nacionalidad: '',
        direccion: '',
        provincia: 'tucuman', // Mantener Tucumán preseleccionada al resetear
        telefono: '',
        observaciones: '',
        comisaria: '',
        comisaria_hecho: '',
        categoria: '',
        UnidadesRegionales: '',
        fecha_carga: new Date().toISOString().split('T')[0],
        // Limpiar campos de georeferenciación
        latitud: '',
        longitud: '',
      });
      setFiles([]);
      setSelectedLocation(null);

      // Navegar al detalle de la persona recién creada para ver los antecedentes
      if (response.data && response.data.id) {
        setTimeout(() => {
          nav(`/personas/${response.data.id}`);
        }, 1500); // Dar tiempo para que se vean los toasts
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al guardar');
      showToast('Error al guardar', 'error');
    }
  };

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer?.files || []);
    if (dropped.length) setFiles(prev => [...prev, ...dropped]);
  };

  const removeFile = idx => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <>
      <Header showSettings />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card className="card">
          <CardContent>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, mb: 4, color: '#000' }}
            >
              Cargar mencionado/aprehendido
            </Typography>
            <Alert severity="info" sx={{ mb: 2, color: '#000' }}>
              Complete todos los campos y seleccione al menos una fotografía
              para guardar los datos.
            </Alert>
            {error && (
              <Alert severity="error" sx={{ mb: 2, color: '#000' }}>
                {error}
              </Alert>
            )}
            {ok && (
              <Alert severity="success" sx={{ mb: 2, color: '#000' }}>
                {ok}
              </Alert>
            )}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <FormInput
                  label="Tipo de delito"
                  value={form.tipo_delito}
                  onChange={v => setForm({ ...form, tipo_delito: v })}
                  select
                  InputLabelProps={{ style: { color: '#000' } }}
                >
                  <MenuItem value="">Seleccionar tipo</MenuItem>
                  <MenuItem value="robo">Robo</MenuItem>
                  <MenuItem value="hurto">Hurto</MenuItem>
                  <MenuItem value="Portación de Arma de Fuego">
                    Portación de Arma de Fuego
                  </MenuItem>
                  <MenuItem value="estafa">Estafa</MenuItem>
                </FormInput>
                <FormInput
                  label="Modalidad"
                  value={form.modalidad}
                  onChange={v => setForm({ ...form, modalidad: v })}
                  select
                  InputLabelProps={{ style: { color: '#000' } }}
                >
                  <MenuItem value="">Seleccionar modalidad</MenuItem>
                  <MenuItem value="arriete">Arriete</MenuItem>
                  <MenuItem value="arrebato">Arrebato</MenuItem>
                  <MenuItem value="asaltante">Asaltante</MenuItem>
                  <MenuItem value="asaltante_En_Banda">
                    Asaltante en Banda
                  </MenuItem>
                  <MenuItem value="boquetero">Boquetero</MenuItem>
                  <MenuItem value="clavero_De_Autos">Clavero de Autos</MenuItem>
                  <MenuItem value="clonacion_de_tarjeta">
                    Clonación de tarjeta
                  </MenuItem>
                  <MenuItem value="piraña">Piraña</MenuItem>
                  <MenuItem value="robo_motovehiculo">
                    Robo de motovehículo
                  </MenuItem>
                  <MenuItem value="robo_automotor">Robo de automotor</MenuItem>
                  <MenuItem value="rompe_vidrios">Rompe vidrios</MenuItem>
                  <MenuItem value="entradera">Entradera</MenuItem>
                  <MenuItem value="salidera">Salidera</MenuItem>
                  <MenuItem value="oportunista">Oportunista</MenuItem>
                  <MenuItem value="escruche">Escruche</MenuItem>
                  <MenuItem value="punga">Punga</MenuItem>
                  <MenuItem value="mechera">Mechera</MenuItem>
                  <MenuItem value="hurto motovehiculo">
                    Hurto motovehículo
                  </MenuItem>
                  <MenuItem value="hurto automotor">Hurto automotor</MenuItem>
                  <MenuItem value="escalamiento">Escalamiento</MenuItem>
                  <MenuItem value="inhibidor de alarmas">
                    Inhibidor de alarmas
                  </MenuItem>
                  <MenuItem value="viuda_negra">Viuda negra</MenuItem>
                  <MenuItem value="Artículo_189_bis">Artículo 189 bis</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </FormInput>
                <FormInput
                  label="Unidades Regionales"
                  value={form.UnidadesRegionales}
                  onChange={handleRegionalChange}
                  select
                  InputLabelProps={{ style: { color: '#000' } }}
                >
                  <MenuItem value="">Seleccionar regional</MenuItem>
                  {Object.keys(regionalesData).map(regional => (
                    <MenuItem key={regional} value={regional}>
                      {regional}
                    </MenuItem>
                  ))}
                </FormInput>

                <FormInput
                  label="Comisaría del Hecho"
                  value={form.comisaria_hecho}
                  onChange={v => setForm({ ...form, comisaria_hecho: v })}
                  select
                  disabled={!form.UnidadesRegionales}
                  InputLabelProps={{
                    style: {
                      color: form.UnidadesRegionales ? '#000' : '#999',
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-disabled': {
                        backgroundColor: '#f5f5f5',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e0e0e0',
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    {form.UnidadesRegionales
                      ? 'Seleccionar comisaría'
                      : 'Primero seleccione una regional'}
                  </MenuItem>
                  {comisariasDisponibles.map(comisaria => (
                    <MenuItem key={comisaria} value={comisaria}>
                      {comisaria}
                    </MenuItem>
                  ))}
                </FormInput>

                <FormInput
                  label="Apellido"
                  value={form.apellido}
                  onChange={v => setForm({ ...form, apellido: v })}
                  required
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="Nombre"
                  value={form.nombre}
                  onChange={v => setForm({ ...form, nombre: v })}
                  required
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                {/* Campo Alias - Posicionado estratégicamente después del Nombre */}
                <FormInput
                  label="Alias"
                  value={form.alias}
                  onChange={v => setForm({ ...form, alias: v })}
                  placeholder="Apodo o sobrenombre (opcional)"
                  InputLabelProps={{ style: { color: '#000' } }}
                  // helperText="Ingrese cualquier alias o apodo conocido"
                />
                <FormInput
                  label="DNI"
                  value={form.dni}
                  onChange={v => setForm({ ...form, dni: v })}
                  required
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="Fecha de nacimiento"
                  type="date"
                  InputLabelProps={{ shrink: true, style: { color: '#000' } }}
                  value={form.fecha_nacimiento}
                  onChange={v => setForm({ ...form, fecha_nacimiento: v })}
                />
                <FormInput
                  label="Edad"
                  value={form.edad}
                  onChange={v => setForm({ ...form, edad: v })}
                  type="number"
                  inputProps={{ min: 0, max: 120 }}
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="Género"
                  value={form.genero}
                  onChange={v => setForm({ ...form, genero: v })}
                  select
                  InputLabelProps={{ style: { color: '#000' } }}
                >
                  <MenuItem value="">Seleccionar género</MenuItem>
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="femenino">Femenino</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </FormInput>
                <FormInput
                  label="Nacionalidad"
                  value={form.nacionalidad}
                  onChange={v => setForm({ ...form, nacionalidad: v })}
                  InputLabelProps={{ style: { color: '#000' } }}
                />

                {/* Campo de Dirección con icono de georeferenciación */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    value={form.direccion}
                    onChange={e =>
                      setForm({ ...form, direccion: e.target.value })
                    }
                    InputLabelProps={{ style: { color: '#000' } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleOpenMap}
                            edge="end"
                            title="Seleccionar ubicación en el mapa"
                            sx={{
                              color: selectedLocation ? '#4caf50' : '#757575',
                              '&:hover': {
                                color: '#2196f3',
                                backgroundColor: 'rgba(33, 150, 243, 0.04)',
                              },
                            }}
                          >
                            <LocationOn />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    helperText={
                      selectedLocation
                        ? `Ubicación: ${selectedLocation.lat.toFixed(
                            6
                          )}, ${selectedLocation.lng.toFixed(6)}`
                        : 'Ingrese la dirección y use el ícono para georeferenciación precisa'
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                        },
                      },
                    }}
                  />
                </Box>

                <FormInput
                  label="Provincia"
                  value={form.provincia}
                  onChange={v => setForm({ ...form, provincia: v })}
                  select
                  InputLabelProps={{ style: { color: '#000' } }}
                  // helperText="Provincia de residencia o del hecho"
                >
                  <MenuItem value="">Seleccionar provincia</MenuItem>
                  <MenuItem value="buenos_aires">Buenos Aires</MenuItem>
                  <MenuItem value="catamarca">Catamarca</MenuItem>
                  <MenuItem value="chaco">Chaco</MenuItem>
                  <MenuItem value="chubut">Chubut</MenuItem>
                  <MenuItem value="ciudad_autonoma_buenos_aires">
                    Ciudad Autónoma de Buenos Aires
                  </MenuItem>
                  <MenuItem value="cordoba">Córdoba</MenuItem>
                  <MenuItem value="corrientes">Corrientes</MenuItem>
                  <MenuItem value="entre_rios">Entre Ríos</MenuItem>
                  <MenuItem value="formosa">Formosa</MenuItem>
                  <MenuItem value="jujuy">Jujuy</MenuItem>
                  <MenuItem value="la_pampa">La Pampa</MenuItem>
                  <MenuItem value="la_rioja">La Rioja</MenuItem>
                  <MenuItem value="mendoza">Mendoza</MenuItem>
                  <MenuItem value="misiones">Misiones</MenuItem>
                  <MenuItem value="neuquen">Neuquén</MenuItem>
                  <MenuItem value="rio_negro">Río Negro</MenuItem>
                  <MenuItem value="salta">Salta</MenuItem>
                  <MenuItem value="san_juan">San Juan</MenuItem>
                  <MenuItem value="san_luis">San Luis</MenuItem>
                  <MenuItem value="santa_cruz">Santa Cruz</MenuItem>
                  <MenuItem value="santa_fe">Santa Fe</MenuItem>
                  <MenuItem value="santiago_del_estero">
                    Santiago del Estero
                  </MenuItem>
                  <MenuItem value="tierra_del_fuego">Tierra del Fuego</MenuItem>
                  <MenuItem value="tucuman">Tucumán</MenuItem>
                </FormInput>
                <FormInput
                  label="Teléfono"
                  value={form.telefono}
                  onChange={v => setForm({ ...form, telefono: v })}
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="Comisaría Jurisdic. del M/A"
                  value={form.comisaria}
                  onChange={v => setForm({ ...form, comisaria: v })}
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="Fecha de carga"
                  type="date"
                  InputLabelProps={{ shrink: true, style: { color: '#000' } }}
                  value={form.fecha_carga}
                  onChange={v => setForm({ ...form, fecha_carga: v })}
                />
                <FormInput
                  label="Observaciones"
                  value={form.observaciones}
                  onChange={v => setForm({ ...form, observaciones: v })}
                  multiline
                  rows={5}
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => nav('/dashboard')}
                    sx={{
                      bgcolor: '#f1f1f1ff',
                      color: '#000',
                      '&:hover': {
                        bgcolor: 'rgb(21, 77, 113)',
                        color: '#fff',
                        transition: 'all 0.3s ease',
                      },
                    }}
                  >
                    ← VOLVER AL INICIO
                  </Button>
                  <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={!canSave}
                    sx={{
                      bgcolor: '#000',
                      color: '#fff',
                      '&:hover': { bgcolor: 'rgb(21, 77, 113)' },
                    }}
                  >
                    GUARDAR
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  sx={{
                    p: 3,
                    border: `2px dashed ${dragActive ? '#15616f' : '#90a4ae'}`,
                    borderRadius: 2,
                    textAlign: 'center',
                    color: '#000',
                    position: 'relative',
                    bgcolor: dragActive
                      ? 'rgba(21,77,113,0.06)'
                      : 'transparent',
                    transition: 'all 0.15s ease',
                    minHeight: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: files.length === 0 ? 'pointer' : 'default',
                    '&:hover':
                      files.length === 0
                        ? {
                            borderColor: '#15616f',
                            bgcolor: 'rgba(21,77,113,0.03)',
                          }
                        : {},
                  }}
                  onClick={() =>
                    files.length === 0 &&
                    document.getElementById('file-input').click()
                  }
                >
                  {files.length === 0 ? (
                    <>
                      {/* Imagen de ejemplo */}
                      <Box
                        sx={{
                          width: 180,
                          height: 180,
                          bgcolor: 'rgb(255, 249, 175)',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          border: '6px solid #ddd',
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: 80,
                            color: '#999',
                          }}
                        >
                          📷
                        </Box>
                      </Box>

                      <Typography variant="h4" sx={{ mb: 1, color: '#000' }}>
                        {dragActive
                          ? 'Suelte las imágenes aquí'
                          : 'Cargar fotografías'}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                        Arrastre y suelte imágenes aquí o use el botón
                      </Typography>

                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: 'rgb(13, 17, 100)',
                          '&:hover': { bgcolor: 'rgb(21, 77, 113)' },
                          color: '#fff',
                          mb: 1,
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          document.getElementById('file-input').click();
                        }}
                      >
                        📁 SELECCIONAR IMÁGENES
                      </Button>

                      <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onFile}
                        style={{ display: 'none' }}
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="h5" sx={{ mb: 2, color: '#000' }}>
                        Imágenes seleccionadas: {files.length}
                      </Typography>

                      <Button
                        variant="outlined"
                        onClick={() =>
                          document.getElementById('file-input-add').click()
                        }
                        sx={{
                          mb: 2,
                          borderColor: '#15616f',
                          color: '#15616f',
                          '&:hover': {
                            bgcolor: '#15616f',
                            color: '#fff',
                          },
                        }}
                      >
                        + AGREGAR MÁS IMÁGENES
                      </Button>

                      <input
                        id="file-input-add"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onFile}
                        style={{ display: 'none' }}
                      />
                    </>
                  )}

                  {files.length > 0 && (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: 2,
                        mt: 2,
                        width: '100%',
                        maxHeight: 300,
                        overflowY: 'auto',
                      }}
                    >
                      {files.map((f, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            width: 300,
                            height: 300,
                            position: 'relative',
                            ml: 12,
                            border: '1px solid rgb(51, 161, 224)',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: 2,
                            bgcolor: '#f7f7f7',
                          }}
                        >
                          <img
                            src={URL.createObjectURL(f)}
                            alt={f.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              fontSize: 12,
                              py: 1,
                              px: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                                marginRight: 8,
                              }}
                            >
                              {f.name}
                            </span>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={e => {
                                e.stopPropagation();
                                removeFile(idx);
                              }}
                              sx={{
                                minWidth: 28,
                                height: 28,
                                bgcolor: 'rgba(255,0,0,0.8)',
                                color: '#fff',
                                fontSize: 16,
                                fontWeight: 'bold',
                                '&:hover': {
                                  bgcolor: 'rgba(255,0,0,1)',
                                },
                              }}
                            >
                              ×
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

      {/* Modal del mapa para georeferenciación */}
      <MapModal
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialPosition={selectedLocation}
      />

      <Footer />
    </>
  );
}
