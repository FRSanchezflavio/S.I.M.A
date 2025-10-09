import { useState, useEffect } from 'react';
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
  Modal,
  Backdrop,
  Fade,
} from '@mui/material';
import {
  LocationOn,
  ArrowBackIos,
  ArrowForwardIos,
  Close,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FormInput from '../components/FormInput';
import MapModal from '../components/MapModal';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export default function CargarAprehendido() {
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
    alias: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    edad: '',
    genero: '',
    nacionalidad: '',
    direccion: '',
    provincia: 'tucuman',
    telefono: '',
    observaciones: '',
    descripcion_fisica: '',
    comisaria: '',
    comisaria_hecho: '',
    categoria: 'aprehendido',
    UnidadesRegionales: '',
    fecha_carga: new Date().toISOString().split('T')[0],
    latitud: '',
    longitud: '',
    direccion_hecho: '',
    latitud_hecho: '',
    longitud_hecho: '',
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);
  const [comisariasDisponibles, setComisariasDisponibles] = useState([]);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedLocationHecho, setSelectedLocationHecho] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mapModalOpenHecho, setMapModalOpenHecho] = useState(false);
  const nav = useNavigate();
  const { showToast } = useToast();

  const canSave =
    form.nombre?.trim() &&
    form.apellido?.trim() &&
    form.dni?.trim() &&
    files.length > 0;

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

  const handleOpenMap = () => {
    setMapModalOpen(true);
  };

  const handleLocationSelectHecho = location => {
    if (location) {
      setSelectedLocationHecho(location);
      setForm(prev => ({
        ...prev,
        latitud_hecho: location.lat.toString(),
        longitud_hecho: location.lng.toString(),
      }));
      showToast('Ubicación del hecho seleccionada correctamente', 'success');
    } else {
      setSelectedLocationHecho(null);
      setForm(prev => ({
        ...prev,
        latitud_hecho: '',
        longitud_hecho: '',
      }));
      showToast('Ubicación del hecho eliminada', 'info');
    }
  };

  const handleOpenMapHecho = () => {
    setMapModalOpenHecho(true);
  };

  const handleImageClick = index => {
    setCurrentImageIndex(index);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev < files.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = event => {
      if (!imageModalOpen) return;

      switch (event.key) {
        case 'Escape':
          handleCloseImageModal();
          break;
        case 'ArrowLeft':
          handlePrevImage();
          break;
        case 'ArrowRight':
          handleNextImage();
          break;
        default:
          break;
      }
    };

    if (imageModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [imageModalOpen]);

  useEffect(() => {
    return () => {
      if (files.length > 0) {
        files.forEach(file => {
          try {
            URL.revokeObjectURL(URL.createObjectURL(file));
          } catch (error) {
            // ignore
          }
        });
      }
    };
  }, [imageModalOpen, files]);

  const handleRegionalChange = regional => {
    setForm(prev => ({
      ...prev,
      UnidadesRegionales: regional,
      comisaria: '',
    }));

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
    setLoading(true);

    let formData = null;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
      showToast('Sesión expirada', 'error');
      setLoading(false);
      setTimeout(() => nav('/login'), 2000);
      return;
    }

    try {
      if (!form.nombre?.trim()) {
        setError('El nombre es obligatorio');
        showToast('Complete el nombre', 'warning');
        setLoading(false);
        return;
      }

      if (!form.apellido?.trim()) {
        setError('El apellido es obligatorio');
        showToast('Complete el apellido', 'warning');
        setLoading(false);
        return;
      }

      if (!form.dni?.trim()) {
        setError('El DNI es obligatorio');
        showToast('Complete el DNI', 'warning');
        setLoading(false);
        return;
      }

      if (files.length === 0) {
        setError('Debe seleccionar al menos una fotografía');
        showToast('Seleccione al menos una foto', 'warning');
        setLoading(false);
        return;
      }

      const data = new FormData();
      formData = { ...form };

      Object.keys(formData).forEach(key => {
        if (
          formData[key] === '' ||
          formData[key] === null ||
          formData[key] === undefined
        ) {
          delete formData[key];
        }
      });

      if (formData.UnidadesRegionales) {
        formData.unidades_regionales = formData.UnidadesRegionales;
        delete formData.UnidadesRegionales;
      }

      if (formData.latitud && formData.latitud !== '') {
        const lat = parseFloat(formData.latitud);
        if (!isNaN(lat)) {
          formData.latitud = lat;
        } else {
          delete formData.latitud;
        }
      }
      if (formData.longitud && formData.longitud !== '') {
        const lng = parseFloat(formData.longitud);
        if (!isNaN(lng)) {
          formData.longitud = lng;
        } else {
          delete formData.longitud;
        }
      }

      if (formData.latitud_hecho && formData.latitud_hecho !== '') {
        const lat = parseFloat(formData.latitud_hecho);
        if (!isNaN(lat)) {
          formData.latitud_hecho = lat;
        } else {
          delete formData.latitud_hecho;
        }
      }
      if (formData.longitud_hecho && formData.longitud_hecho !== '') {
        const lng = parseFloat(formData.longitud_hecho);
        if (!isNaN(lng)) {
          formData.longitud_hecho = lng;
        } else {
          delete formData.longitud_hecho;
        }
      }

      Object.entries(formData).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) {
          data.append(k, v);
        }
      });
      files.forEach(f => data.append('fotos', f));

      const response = await api.post('/personas', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      if (
        response.data &&
        response.data.id &&
        (form.tipo_delito || form.modalidad)
      ) {
        try {
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
            estado: 'en_proceso',
            juzgado: '',
            fecha_hecho:
              form.fecha_carga || new Date().toISOString().split('T')[0],
            fecha_carga: new Date().toISOString(),
            observaciones: form.observaciones || '',
            fotos: [],
            sujetoId: response.data.id.toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const storageKey = `delitos_especificos_${response.data.id}`;
          const existingDelitos = JSON.parse(
            localStorage.getItem(storageKey) || '[]'
          );
          const nuevosDelitos = [...existingDelitos, antecedentePersonal];
          localStorage.setItem(storageKey, JSON.stringify(nuevosDelitos));
        } catch (err) {
          console.error('Error creando antecedente personal automático:', err);
        }
      }

      setOk('Aprehendido guardado correctamente');
      showToast('Aprehendido guardado', 'success');

      if (form.tipo_delito || form.modalidad) {
        showToast('Antecedente personal creado automáticamente', 'info');
      }

      setForm(prev => ({
        ...prev,
        tipo_delito: '',
        modalidad: '',
        nombre: '',
        alias: '',
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        edad: '',
        genero: '',
        nacionalidad: '',
        direccion: '',
        provincia: 'tucuman',
        telefono: '',
        observaciones: '',
        descripcion_fisica: '',
        comisaria: '',
        comisaria_hecho: '',
        categoria: 'aprehendido',
        UnidadesRegionales: '',
        fecha_carga: new Date().toISOString().split('T')[0],
        latitud: '',
        longitud: '',
        direccion_hecho: '',
        latitud_hecho: '',
        longitud_hecho: '',
      }));
      setFiles([]);
      setSelectedLocation(null);
      setSelectedLocationHecho(null);
      if (imageModalOpen) {
        handleCloseImageModal();
      }

      if (response.data && response.data.id) {
        setTimeout(() => {
          setLoading(false);
          nav(`/personas/${response.data.id}`);
        }, 1500);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Error completo:', err);
      console.error('📋 Datos que se intentaron enviar:', formData);

      let errorMessage = 'Error al registrar a la persona aprehendida';

      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;

        switch (status) {
          case 400:
            if (errorData?.details && Array.isArray(errorData.details)) {
              const validationErrors = errorData.details
                .map(detail => detail.message || detail)
                .join('; ');
              errorMessage = `Error de validación: ${validationErrors}`;
            } else if (errorData?.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage = 'Datos inválidos. Verifique los campos.';
            }
            break;
          case 401:
            errorMessage =
              'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setTimeout(() => nav('/login'), 3000);
            break;
          case 409:
            errorMessage =
              errorData?.message || 'Ya existe una persona con ese DNI';
            break;
          case 413:
            errorMessage =
              'Las imágenes son demasiado grandes. Máximo 5MB por archivo.';
            break;
          case 500:
          case 503:
            errorMessage =
              errorData?.message || 'Error del servidor. Intente nuevamente.';
            break;
          default:
            errorMessage =
              errorData?.message ||
              err.message ||
              'Error desconocido al guardar';
        }
      } else if (err.request) {
        errorMessage =
          'No se pudo conectar con el servidor. Verifique su conexión.';
      } else {
        errorMessage = err.message || 'Error al configurar la petición';
      }

      setError(errorMessage);
      showToast(errorMessage, 'error');
      setLoading(false);
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
    if (imageModalOpen && currentImageIndex === idx) {
      handleCloseImageModal();
    } else if (imageModalOpen && currentImageIndex > idx) {
      setCurrentImageIndex(prev => prev - 1);
    }

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
              Cargar aprehendido
            </Typography>
            <Alert severity="info" sx={{ mb: 2, color: '#000' }}>
              Complete todos los campos obligatorios y seleccione al menos una
              fotografía para registrar a la persona aprehendida.
            </Alert>

            {loading && (
              <Alert severity="info" sx={{ mb: 2, color: '#000' }}>
                ⏳ Guardando información... Por favor espere.
              </Alert>
            )}
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
                  <MenuItem value="tentativa">Tentativa</MenuItem>
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

                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Dirección del hecho"
                    value={form.direccion_hecho}
                    onChange={e =>
                      setForm({ ...form, direccion_hecho: e.target.value })
                    }
                    InputLabelProps={{ style: { color: '#000' } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleOpenMapHecho}
                            edge="end"
                            title="Seleccionar ubicación del hecho en el mapa"
                            sx={{
                              color: selectedLocationHecho
                                ? '#666666'
                                : '#757575',
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
                      selectedLocationHecho
                        ? `Ubicación del hecho: ${selectedLocationHecho.lat.toFixed(
                            6
                          )}, ${selectedLocationHecho.lng.toFixed(6)}`
                        : 'Ingrese la dirección del hecho y utilice el ícono para georeferenciar con precisión'
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
                  label="Comisaría del hecho"
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
                <FormInput
                  label="Alias"
                  value={form.alias}
                  onChange={v => setForm({ ...form, alias: v })}
                  placeholder="Apodo o sobrenombre (opcional)"
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="DNI"
                  value={form.dni}
                  onChange={v => setForm({ ...form, dni: v })}
                  placeholder="Ej: 12345678 o NO"
                  helperText="Ingrese un DNI válido o 'NO', 'NULO', 'EXTRANJERO', etc."
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

                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Dirección de residencia"
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
                            title="Seleccionar ubicación de residencia en el mapa"
                            sx={{
                              color: selectedLocation ? '#666666' : '#757575',
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
                        ? `Ubicación de residencia: ${selectedLocation.lat.toFixed(
                            6
                          )}, ${selectedLocation.lng.toFixed(6)}`
                        : 'Ingrese la dirección de residencia y utilice el ícono para georeferenciarla con precisión'
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
                  placeholder="Ej: +54 381 1234567 o NO"
                  helperText="Puede ingresar un número válido o 'NO', 'NULO', 'N/A', etc."
                  InputLabelProps={{ style: { color: '#000' } }}
                />
                <FormInput
                  label="Comisaría jurisdiccional"
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
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  sx={{
                    '&:hover': {
                      zIndex: 10,
                      position: 'relative',
                      top: -2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                    },
                    height: '50%',
                    width: '570px',
                    ml: '-20px',
                    p: 1,
                    border: `2px dashed ${dragActive ? '#15616f' : '#bdbdbd'}`,
                    borderRadius: 3,
                    textAlign: 'center',
                    color: '#000',
                    position: 'relative',
                    bgcolor: dragActive ? 'rgba(21,97,111,0.08)' : '#fafafa',
                    transition: 'all 0.3s ease',
                    minHeight: files.length === 0 ? 400 : '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent:
                      files.length === 0 ? 'center' : 'flex-start',
                    alignItems: 'center',
                    cursor: files.length === 0 ? 'pointer' : 'default',
                    boxShadow: dragActive
                      ? '0 4px 20px rgba(21,97,111,0.15)'
                      : '0 2px 8px rgba(0,0,0,0.05)',
                    '&:hover':
                      files.length === 0
                        ? {
                            borderColor: '#15616f',
                            bgcolor: 'rgba(21,97,111,0.03)',
                            boxShadow: '0 4px 16px rgba(21,97,111,0.1)',
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
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          bgcolor: 'rgba(21,97,111,0.1)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                          border: '3px dashed rgba(21,97,111,0.3)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: 78,
                            color: '#15616f',
                            fontWeight: 'bold',
                            opacity: 0.7,
                          }}
                        >
                          📷
                        </Box>
                      </Box>

                      <Typography
                        variant="h5"
                        sx={{
                          mb: 1,
                          color: '#15616f',
                          fontWeight: 600,
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                        }}
                      >
                        {dragActive
                          ? '¡Suelte las imágenes aquí!'
                          : 'Cargar fotografías'}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          mb: 3,
                          color: '#666',
                          fontSize: '1rem',
                          maxWidth: 280,
                          lineHeight: 1.5,
                        }}
                      >
                        Arrastre y suelte imágenes aquí o haga clic para
                        seleccionar
                      </Typography>

                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: 'var(--secondary)',
                          '&:hover': {
                            bgcolor: 'var(--accent)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(21,97,111,0.3)',
                          },
                          color: '#fff',
                          py: 1.5,
                          px: 4,
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          transition: 'all 0.3s ease',
                          textTransform: 'none',
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          document.getElementById('file-input').click();
                        }}
                      >
                        Seleccionar imágenes
                      </Button>

                      <Typography
                        variant="caption"
                        sx={{
                          mt: 2,
                          color: '#999',
                          fontSize: '0.8rem',
                        }}
                      >
                        Formatos admitidos: JPG, PNG, GIF
                      </Typography>

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
                      <Box
                        sx={{
                          width: '100%',
                          height: 'auto',
                          maxWidth: '570px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 3,
                          pb: 2,
                          borderBottom: '2px solid #e0e0e0',
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{
                              color: '#15616f',
                              fontWeight: 900,
                              fontSize: '1.3rem',
                            }}
                          >
                            📁 {files.length} imagen
                            {files.length !== 1 ? 'es' : ''} seleccionada
                            {files.length !== 1 ? 's' : ''}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#666',
                              fontSize: '1rem',
                            }}
                          >
                            Haga clic en una imagen para ampliarla
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              document.getElementById('file-input-add').click()
                            }
                            sx={{
                              borderColor: 'var(--secondary)',
                              color: 'var(--secondary)',
                              '&:hover': {
                                bgcolor: 'var(--accent)',
                                borderColor: 'var(--accent)',
                                color: '#fff',
                                transform: 'translateY(-1px)',
                              },
                              borderRadius: 2,
                              px: 2,
                              py: 0.5,
                              fontSize: '1rem',
                              fontWeight: 900,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            + Agregar más
                          </Button>

                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => {
                              setFiles([]);
                              setSelectedLocation(null);
                              setSelectedLocationHecho(null);
                              if (imageModalOpen) {
                                handleCloseImageModal();
                              }
                            }}
                            sx={{
                              borderRadius: 2,
                              px: 2,
                              py: 0.5,
                              fontSize: '0.9rem',
                              fontWeight: 900,
                              '&:hover': {
                                transform: 'translateY(-5px)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            🗑️ Limpiar todo
                          </Button>
                        </Box>
                      </Box>

                      <input
                        id="file-input-add"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onFile}
                        style={{ display: 'none' }}
                      />

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: 'repeat(2, 1fr)',
                            sm: 'repeat(3, 1fr)',
                            md: 'repeat(2, 1fr)',
                            lg: 'repeat(3, 1fr)',
                          },
                          gap: 0.5,
                          width: '100%',
                          height: 'auto',
                          maxHeight: 900,
                          overflowY: 'auto',
                          overflowX: 'hidden',
                          pr: 1,
                          '&::-webkit-scrollbar': {
                            width: '8px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                            borderRadius: '10px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: '#c1c1c1',
                            borderRadius: '10px',
                            '&:hover': {
                              background: '#a8a8a8',
                            },
                          },
                        }}
                      >
                        {files.map((f, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              aspectRatio: '1',
                              position: 'relative',
                              border: '2px solid #e0e0e0',
                              borderRadius: 3,
                              overflow: 'hidden',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              bgcolor: '#fff',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                borderColor: '#15616f',
                                zIndex: 1,
                              },
                            }}
                            onClick={() => handleImageClick(idx)}
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
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background:
                                  'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                p: 1,
                                '&:hover': {
                                  opacity: 1,
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  alignSelf: 'flex-start',
                                  bgcolor: 'rgba(21,97,111,0.9)',
                                  color: '#fff',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}
                              >
                                #{idx + 1}
                              </Box>

                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-end',
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#fff',
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                  }}
                                >
                                  {f.name}
                                </Typography>

                                <IconButton
                                  size="small"
                                  onClick={e => {
                                    e.stopPropagation();
                                    removeFile(idx);
                                  }}
                                  sx={{
                                    bgcolor: 'rgba(244,67,54,0.9)',
                                    color: '#fff',
                                    width: 24,
                                    height: 24,
                                    '&:hover': {
                                      bgcolor: '#d32f2f',
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>

                      <Box
                        sx={{
                          mt: 2,
                          pt: 2,
                          borderTop: '1px solid #e0e0e0',
                          width: '100%',
                          textAlign: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#666',
                            fontSize: '0.8rem',
                            fontStyle: 'italic',
                          }}
                        >
                          💡 Tip: Use Ctrl+Click para seleccionar múltiples
                          archivos
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>

                <Box sx={{ mt: 3, width: '570px', ml: '-20px' }}>
                  <FormInput
                    label="Descripción física"
                    value={form.descripcion_fisica}
                    onChange={v => setForm({ ...form, descripcion_fisica: v })}
                    multiline
                    rows={4}
                    placeholder="Ingrese características físicas relevantes (altura, contextura, cabello, ojos, marcas distintivas, etc.)"
                    inputProps={{ maxLength: 500 }}
                    helperText={`${form.descripcion_fisica.length}/500 caracteres`}
                    InputLabelProps={{ style: { color: '#000' } }}
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
              </Grid>
            </Grid>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 4,
                pt: 3,
                borderTop: '2px solid #e0e0e0',
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => nav('/dashboard')}
                sx={{
                  color: 'var(--secondary)',
                  borderColor: 'var(--secondary)',
                  '&:hover': {
                    borderColor: 'var(--accent)',
                    bgcolor: 'var(--accent)',
                    color: '#fff',
                  },
                  py: 1.5,
                  px: 3,
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  textTransform: 'none',
                }}
              >
                ← Volver al inicio
              </Button>

              <Button
                variant="contained"
                onClick={onSubmit}
                disabled={!canSave || loading}
                sx={{
                  bgcolor: canSave && !loading ? 'var(--secondary)' : '#ccc',
                  color: '#fff',
                  '&:hover': {
                    bgcolor: canSave && !loading ? 'var(--accent)' : '#ccc',
                    transform:
                      canSave && !loading ? 'translateY(-2px)' : 'none',
                    boxShadow:
                      canSave && !loading
                        ? '0 6px 20px rgba(21,97,111,0.3)'
                        : 'none',
                  },
                  '&:disabled': {
                    bgcolor: '#ccc',
                    color: '#999',
                  },
                  py: 1.5,
                  px: 4,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  minWidth: '280px',
                }}
              >
                {loading ? (
                  <>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        border: '2px solid #f3f3f3',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: 1,
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      }}
                    />
                    Guardando...
                  </>
                ) : (
                  '💾 Guardar aprehendido'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <MapModal
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialPosition={selectedLocation}
      />

      <MapModal
        open={mapModalOpenHecho}
        onClose={() => setMapModalOpenHecho(false)}
        onLocationSelect={handleLocationSelectHecho}
        initialPosition={selectedLocationHecho}
      />

      <Modal
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { bgcolor: 'rgba(0, 0, 0, 0.8)' },
          },
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
        }}
      >
        <Fade in={imageModalOpen}>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '90vw',
              height: '90vh',
              outline: 'none',
            }}
            onClick={e => e.stopPropagation()}
          >
            {files.length > 0 && (
              <>
                <IconButton
                  onClick={handleCloseImageModal}
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    color: '#000',
                    zIndex: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 1)',
                    },
                  }}
                  aria-label="Cerrar modal"
                >
                  <Close />
                </IconButton>

                {files.length > 1 && (
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: 'absolute',
                      left: 20,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      color: '#000',
                      zIndex: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)',
                      },
                    }}
                    aria-label="Imagen anterior"
                  >
                    <ArrowBackIos />
                  </IconButton>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  <img
                    src={URL.createObjectURL(files[currentImageIndex])}
                    alt={files[currentImageIndex]?.name || 'Imagen'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: 8,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                </Box>

                {files.length > 1 && (
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: 'absolute',
                      right: 20,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      color: '#000',
                      zIndex: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)',
                      },
                    }}
                    aria-label="Imagen siguiente"
                  >
                    <ArrowForwardIos />
                  </IconButton>
                )}

                {files.length > 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      color: '#fff',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {currentImageIndex + 1} de {files.length}
                  </Box>
                )}

                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontSize: 12,
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {files[currentImageIndex]?.name}
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>

      <Footer />
    </>
  );
}
