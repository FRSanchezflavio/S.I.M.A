import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Stack,
  Alert,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CardResult from '../components/CardResult';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useSIMAGridMetrics } from '../utils/gridMetrics';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import InfoIcon from '@mui/icons-material/Info';
import TableViewIcon from '@mui/icons-material/TableView';
import { useToast } from '../components/ToastProvider';
import * as XLSX from 'xlsx';

export default function Buscar() {
  const [modo, setModo] = useState('nombre');
  const [campoBusqueda, setCampoBusqueda] = useState('');
  const [texto, setTexto] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const nav = useNavigate();
  const { showToast } = useToast();

  // Estados para selección y exportación Excel
  const [selectedItems, setSelectedItems] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  // Integrar métricas específicas de S.I.M.A.
  const gridMetrics = useSIMAGridMetrics();

  // Efecto para actualizar indicador de scroll y métricas
  useEffect(() => {
    const gridElement = document.querySelector('[data-grid="search-results"]');
    if (!gridElement) return;

    const updateScrollIndicator = () => {
      try {
        const hasScroll = gridElement.scrollHeight > gridElement.clientHeight;
        gridElement.setAttribute('data-has-scroll', hasScroll.toString());

        // Actualizar métricas cuando cambie el scroll
        if (items.length > 0) {
          setTimeout(() => {
            try {
              const result = gridMetrics.analizarGrid();
              if (result) {
                console.log('Grid actualizado:', result);
              }
            } catch (error) {
              console.warn('Error al analizar grid:', error);
            }
          }, 100);
        }
      } catch (error) {
        console.warn('Error en updateScrollIndicator:', error);
      }
    };

    // Verificar al montar y cuando cambie el contenido
    updateScrollIndicator();

    // Observer para cambios en el tamaño
    const resizeObserver = new ResizeObserver(() => {
      try {
        updateScrollIndicator();
      } catch (error) {
        console.warn('Error en resizeObserver:', error);
      }
    });

    resizeObserver.observe(gridElement);

    // Listener para cambios de ventana
    const handleResize = () => {
      try {
        updateScrollIndicator();
      } catch (error) {
        console.warn('Error en handleResize:', error);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      try {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
      } catch (error) {
        console.warn('Error en cleanup:', error);
      }
    };
  }, [items, gridMetrics]);

  const opcionesCampos = [
    { value: 'tipo_delito', label: 'Tipo de delito' },
    { value: 'modalidad', label: 'Modalidad' },
    { value: 'nombre', label: 'Nombre' },
    { value: 'apellido', label: 'Apellido' },
    { value: 'dni', label: 'DNI' },
    { value: 'edad', label: 'Edad' },
    { value: 'genero', label: 'Género' },
    { value: 'nacionalidad', label: 'Nacionalidad' },
    { value: 'direccion', label: 'Dirección' },
    { value: 'telefono', label: 'Teléfono' },
    { value: 'comisaria', label: 'Comisaría Jurisdic. del M/A' },
    { value: 'comisaria_hecho', label: 'Comisaría donde sucedió el hecho' },
    { value: 'unidades_regionales', label: 'Unidades Regionales' },
    { value: 'fecha_carga', label: 'Fecha de carga' },
    { value: 'observaciones', label: 'Observaciones' },
  ];

  const fetchAll = async () => {
    try {
      const { data } = await api.get('/personas');
      setItems(data.items || []);
    } catch (e) {
      setError('Error al obtener datos');
    }
  };

  const onBuscar = async () => {
    setError('');

    try {
      // Iniciar tracking de métricas S.I.M.A.
      gridMetrics.iniciarBusqueda();

      let params = {};

      if (modo === 'campo_especifico' && campoBusqueda) {
        params[campoBusqueda] = texto;
      } else if (modo === 'dni') {
        params = { dni: texto };
      } else if (modo === 'comisaria') {
        params = { comisaria: texto };
      } else {
        params = { q: texto };
      }

      const { data } = await api.get('/personas', { params });
      setItems(data.items || []);

      // Finalizar tracking después de renderizado
      setTimeout(() => {
        try {
          gridMetrics.finalizarBusqueda();
        } catch (error) {
          console.warn('Error al finalizar métricas:', error);
        }
      }, 100);
    } catch (e) {
      setError('Error en la búsqueda');
      showToast('Error en la búsqueda', 'error');

      // También trackear errores
      try {
        gridMetrics.finalizarBusqueda();
      } catch (metricsError) {
        console.warn('Error al finalizar métricas en catch:', metricsError);
      }
    }
  };

  const onExport = async type => {
    try {
      let params = {};

      if (modo === 'campo_especifico' && campoBusqueda) {
        params[campoBusqueda] = texto;
      } else if (modo === 'dni') {
        params = { dni: texto };
      } else if (modo === 'comisaria') {
        params = { comisaria: texto };
      } else {
        params = { q: texto };
      }

      const res = await api.get('/personas', {
        params: { ...params, format: type },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type:
          type === 'csv'
            ? 'text/csv;charset=utf-8;'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personas.${type}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError('No se pudo exportar');
      showToast('No se pudo exportar', 'error');
    }
  };

  /**
   * Formatea una fecha ISO a formato DD/MM/YYYY o DD/MM/YYYY HH:mm
   * @param {string|Date} fecha - Fecha en formato ISO o objeto Date
   * @param {boolean} incluirHora - Si incluir hora (HH:mm)
   * @returns {string} Fecha formateada o "-" si es null
   */
  const formatearFecha = (fecha, incluirHora = false) => {
    if (!fecha) return '-';

    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return '-';

      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const anio = date.getFullYear();

      if (incluirHora) {
        const hora = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${anio} ${hora}:${min}`;
      }

      return `${dia}/${mes}/${anio}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '-';
    }
  };

  /**
   * Maneja la selección/deselección de todos los items
   */
  const handleSelectAll = event => {
    if (event.target.checked) {
      // Seleccionar todos los IDs de los items actuales
      const allIds = items.map(item => item.id);
      setSelectedItems(allIds);
      setSelectAllChecked(true);
    } else {
      // Deseleccionar todos
      setSelectedItems([]);
      setSelectAllChecked(false);
    }
  };

  /**
   * Maneja la selección/deselección de un item individual
   */
  const handleSelectItem = (id, event) => {
    // Prevenir navegación al detalle cuando se hace click en checkbox
    if (event) {
      event.stopPropagation();
    }

    setSelectedItems(prev => {
      const isSelected = prev.includes(id);
      const newSelection = isSelected
        ? prev.filter(itemId => itemId !== id) // Deseleccionar
        : [...prev, id]; // Seleccionar

      // Actualizar estado del checkbox "Seleccionar todo"
      setSelectAllChecked(newSelection.length === items.length);

      return newSelection;
    });
  };

  /**
   * Verifica si un item está seleccionado
   */
  const isItemSelected = id => {
    return selectedItems.includes(id);
  };

  /**
   * Exporta las personas seleccionadas a un archivo Excel
   * Genera dos hojas: Datos Personales y Ubicaciones (si hay coordenadas)
   */
  const handleExportSelected = async () => {
    try {
      // Validación 1: Verificar que hay items seleccionados
      if (selectedItems.length === 0) {
        showToast(
          '⚠️ Seleccione al menos una persona para exportar',
          'warning'
        );
        return;
      }

      // Validación 2: Verificar que items existe
      if (!items || items.length === 0) {
        showToast('❌ No hay resultados de búsqueda para exportar', 'error');
        return;
      }

      // Confirmación para grandes volúmenes
      if (selectedItems.length > 1000) {
        const confirmar = window.confirm(
          `⚠️ Va a exportar ${selectedItems.length} registros. Esto puede tardar varios segundos.\n\n¿Desea continuar?`
        );
        if (!confirmar) return;
      }

      // Iniciar proceso de exportación
      setIsExporting(true);
      showToast(
        `Generando archivo Excel con ${selectedItems.length} persona(s)...`,
        'info'
      );

      // Filtrar personas seleccionadas
      const personasSeleccionadas = items.filter(item =>
        selectedItems.includes(item.id)
      );

      // Crear libro de trabajo
      const workbook = XLSX.utils.book_new();

      // ============================================
      // HOJA 1: DATOS PERSONALES
      // ============================================
      const datosPersonales = personasSeleccionadas.map(p => ({
        ID: p.id,
        Apellido: p.apellido || '-',
        Nombre: p.nombre || '-',
        DNI: p.dni || 'Sin DNI',
        'Fecha Nacimiento': formatearFecha(p.fecha_nacimiento, false),
        Edad: p.edad || '-',
        Género: p.genero || '-',
        Nacionalidad: p.nacionalidad || '-',
        Dirección: p.direccion || '-',
        Teléfono: p.telefono || 'Sin teléfono',
        Email: p.email || 'Sin email',
        Comisaría: p.comisaria || '-',
        'Comisaría del Hecho': p.comisaria_hecho || '-',
        'Unidades Regionales': p.unidades_regionales || '-',
        'Tipo de Delito': p.tipo_delito || '-',
        Modalidad: p.modalidad || '-',
        'Fecha de Carga': formatearFecha(p.fecha_carga, true),
        Observaciones: p.observaciones || '-',
        'Descripción Física': p.descripcion_fisica || '-',
      }));

      const wsDatosPersonales = XLSX.utils.json_to_sheet(datosPersonales);

      // Ajustar ancho de columnas automáticamente
      const colWidths = Object.keys(datosPersonales[0] || {}).map(key => ({
        wch:
          Math.max(
            key.length,
            ...datosPersonales.map(row => String(row[key] || '').length)
          ) + 2, // +2 para padding
      }));
      wsDatosPersonales['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(
        workbook,
        wsDatosPersonales,
        'Datos Personales'
      );

      // ============================================
      // HOJA 2: UBICACIONES (solo si hay coordenadas)
      // ============================================
      const personasConUbicacion = personasSeleccionadas.filter(
        p => (p.latitud && p.longitud) || (p.latitud_hecho && p.longitud_hecho)
      );

      if (personasConUbicacion.length > 0) {
        const datosUbicaciones = personasConUbicacion.map(p => ({
          'ID Persona': p.id,
          Apellido: p.apellido || '-',
          Nombre: p.nombre || '-',
          'Domicilio - Latitud': p.latitud ? Number(p.latitud).toFixed(6) : '-',
          'Domicilio - Longitud': p.longitud
            ? Number(p.longitud).toFixed(6)
            : '-',
          'Domicilio - Dirección': p.direccion || '-',
          'Hecho - Latitud': p.latitud_hecho
            ? Number(p.latitud_hecho).toFixed(6)
            : '-',
          'Hecho - Longitud': p.longitud_hecho
            ? Number(p.longitud_hecho).toFixed(6)
            : '-',
          'Hecho - Dirección': p.direccion_hecho || '-',
        }));

        const wsUbicaciones = XLSX.utils.json_to_sheet(datosUbicaciones);

        // Ajustar ancho de columnas
        const colWidthsUbic = Object.keys(datosUbicaciones[0] || {}).map(
          key => ({
            wch:
              Math.max(
                key.length,
                ...datosUbicaciones.map(row => String(row[key] || '').length)
              ) + 2,
          })
        );
        wsUbicaciones['!cols'] = colWidthsUbic;

        XLSX.utils.book_append_sheet(workbook, wsUbicaciones, 'Ubicaciones');
      }

      // ============================================
      // GENERAR NOMBRE DE ARCHIVO
      // ============================================
      const criterio = (texto || 'Todos')
        .replace(/[/\\:*?"<>|]/g, '') // Sanitizar caracteres especiales
        .substring(0, 30); // Limitar longitud

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace('T', '_')
        .replace(/:/g, '-');

      const filename = `SIMA_Busqueda_${criterio}_${selectedItems.length}personas_${timestamp}.xlsx`;

      // ============================================
      // DESCARGAR ARCHIVO
      // ============================================
      XLSX.writeFile(workbook, filename);

      // Feedback de éxito
      showToast(
        `✅ Archivo Excel generado: ${selectedItems.length} persona${
          selectedItems.length !== 1 ? 's' : ''
        } exportada${selectedItems.length !== 1 ? 's' : ''}`,
        'success'
      );

      // Limpiar selección
      setSelectedItems([]);
      setSelectAllChecked(false);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      showToast(
        '❌ Error al generar el archivo Excel. Intente nuevamente.',
        'error'
      );
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <Box
      sx={{
        minHeight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'var(--bg)',
      }}
    >
      <Header showSettings />
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Card className="card">
          <CardContent>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, mt: 1 }}>
              Buscar Mencionado/Aprehendido
            </Typography>

            {/* Información sobre los delitos específicos */}
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Búsqueda en registros oficiales
                </Typography>
                <Typography variant="body2">
                  Esta búsqueda solo muestra los{' '}
                  <strong>antecedentes delictuales oficiales</strong>{' '}
                  registrados en el sistema. Los delitos específicos de cada
                  sujeto no aparecen en estos resultados y solo son visibles en
                  el perfil individual.
                </Typography>
              </Box>
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={0} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="xl"
                  placeholder="Ingrese su búsqueda"
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ justifyContent: 'flex-end' }}
                >
                  <Button
                    variant="contained"
                    onClick={onBuscar}
                    sx={{
                      height: '56px',
                      width: '160px',
                      fontSize: '1.125rem',
                      fontFamily: 'serif',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      bgcolor: '#000',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      '&:hover': {
                        bgcolor: 'rgb(21, 77, 113)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    BUSCAR
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={fetchAll}
                    sx={{
                      height: '56px',
                      width: '160px',
                      fontSize: '1rem',
                      fontFamily: 'serif',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                        bgcolor: 'rgb(21, 77, 113)',
                        color: 'white',
                      },
                    }}
                  >
                    MOSTRAR TODAS
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => nav('/dashboard')}
                    sx={{
                      height: '56px',
                      width: '180px',
                      fontSize: '14px',
                      fontFamily: 'serif',
                      fontWeight: 800,
                      letterSpacing: '1px',
                      fontWeight: 800,
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      bgcolor: '#1a365d',
                      color: '#ffffff',
                      border: '2px solid #2d5986',
                      boxShadow:
                        '0 3px 10px rgba(26, 54, 93, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                      background:
                        'linear-gradient(135deg, #1a365d 0%, #2d5986 100%)',
                      '&:hover': {
                        bgcolor: '#ffffff',
                        background: '#ffffff',
                        color: '#000000',
                        boxShadow:
                          '0 5px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                        border: '2px solid #1a365d',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                        boxShadow: '0 2px 8px rgba(26, 54, 93, 0.5)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background:
                          'linear-gradient(90deg, #4a90b8, #ffffff, #4a90b8)',
                        borderRadius: '6px 6px 0 0',
                      },
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    VOLVER AL INICIO
                  </Button>
                </Stack>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={4}
              alignItems="center"
              sx={{ mt: -1, mb: 1 }}
            >
              <Grid item xs={12}>
                <RadioGroup
                  row
                  value={modo}
                  onChange={e => setModo(e.target.value)}
                >
                  <FormControlLabel
                    value="nombre"
                    control={<Radio />}
                    label="Nombre/Apellido"
                  />
                  <FormControlLabel
                    value="dni"
                    control={<Radio />}
                    label="DNI"
                  />
                  <FormControlLabel
                    value="comisaria"
                    control={<Radio />}
                    label="Comisaría"
                  />
                  <FormControlLabel
                    value="campo_especifico"
                    control={<Radio />}
                    label="Campo específico"
                  />
                </RadioGroup>
                {modo === 'campo_especifico' && (
                  <FormControl fullWidth sx={{ mt: 0.5 }}>
                    <InputLabel>Seleccionar campo</InputLabel>
                    <Select
                      value={campoBusqueda}
                      onChange={e => setCampoBusqueda(e.target.value)}
                      label="Seleccionar campo"
                    >
                      {opcionesCampos.map(opcion => (
                        <MenuItem key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
            </Grid>
            {/* Checkbox "Seleccionar todo" y botón de exportación */}
            {items.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'stretch', md: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectAllChecked}
                        indeterminate={
                          selectedItems.length > 0 &&
                          selectedItems.length < items.length
                        }
                        onChange={handleSelectAll}
                        sx={{
                          color: 'rgb(21, 77, 113)',
                          '&.Mui-checked': { color: 'rgb(21, 77, 113)' },
                          '&.MuiCheckbox-indeterminate': {
                            color: 'rgb(21, 77, 113)',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Seleccionar todos ({items.length} resultado
                        {items.length !== 1 ? 's' : ''})
                      </Typography>
                    }
                  />

                  {selectedItems.length > 0 && (
                    <Chip
                      label={`${selectedItems.length} seleccionado${
                        selectedItems.length !== 1 ? 's' : ''
                      }`}
                      sx={{
                        backgroundColor: 'rgb(21, 77, 113)',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>

                <Button
                  variant="outlined"
                  onClick={handleExportSelected}
                  disabled={isExporting || selectedItems.length === 0}
                  startIcon={
                    isExporting ? (
                      <CircularProgress size={20} />
                    ) : (
                      <TableViewIcon />
                    )
                  }
                  sx={{
                    color: 'rgb(21, 77, 113)',
                    borderColor: 'rgb(21, 77, 113)',
                    whiteSpace: 'nowrap',
                    minWidth: { xs: 'auto', md: '280px' },
                    '&:hover': {
                      backgroundColor: 'rgba(21, 77, 113, 0.08)',
                      borderColor: 'rgb(21, 77, 113)',
                    },
                    '&:disabled': {
                      borderColor: '#ccc',
                      color: '#ccc',
                    },
                  }}
                >
                  {isExporting
                    ? 'Generando...'
                    : `Descargar Selección Excel (${selectedItems.length})`}
                </Button>
              </Box>
            )}

            <Box
              data-grid="search-results"
              data-testid="search-results-grid"
              sx={{
                mt: 2,
                display: 'grid',
                minHeight: '600px',
                height: 'auto',
                maxHeight: { xs: '80vh', sm: '85vh', md: '90vh' },
                overflowY: 'auto',
                overflowX: 'hidden',
                p: 2,
                backgroundColor: '#f8f9fa',
                borderRadius: 2,
                border: '2px solid #e9ecef',
                position: 'relative',

                // Grid con alturas fijas para alineación
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                  xl: 'repeat(5, 1fr)',
                },
                gap: 2,
                alignContent: 'start',

                // IMPORTANTE: Asegurar que todas las cards tengan la misma altura
                '& > *': {
                  minHeight: '350px',
                  maxHeight: '400px',
                },

                // Scrollbar personalizado
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(21, 77, 113, 0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(21, 77, 113, 0.5)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(21, 77, 113, 0.7)',
                  },
                },
              }}
            >
              {/* Estado vacío mejorado */}
              {items.length === 0 && (
                <Box
                  sx={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    textAlign: 'center',
                    p: 4,
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(21, 77, 113, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <Typography sx={{ fontSize: '3rem' }}>🔍</Typography>
                  </Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No hay resultados para mostrar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Realice una búsqueda para ver los resultados aquí
                  </Typography>
                </Box>
              )}

              {/* Cards de resultados con selección */}
              {items.map(it => (
                <CardResult
                  key={it.id}
                  item={it}
                  onDetail={() => nav(`/personas/${it.id}`)}
                  selected={isItemSelected(it.id)}
                  onSelect={handleSelectItem}
                />
              ))}
            </Box>

            {/* Información de resultados */}
            {items.length > 0 && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: 'rgba(21, 77, 113, 0.05)',
                  borderRadius: 1,
                  border: '1px solid rgba(21, 77, 113, 0.1)',
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  📊 Mostrando <strong>{items.length}</strong> resultado
                  {items.length !== 1 ? 's' : ''} encontrado
                  {items.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      <Box sx={{ mt: 'auto' }}>
        <Footer />
      </Box>
    </Box>
  );
}
