import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Stack,
  Button,
  List,
  ListItem,
  Chip,
  Divider,
  Box,
  Alert,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactDOM from 'react-dom/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AgregarDelitoEspecifico from '../components/AgregarDelitoEspecifico';
import ListaAntecedentesPersonalesMejorada from '../components/ListaAntecedentesPersonalesMejorada';
import EstadisticasDelitos from '../components/EstadisticasDelitos';
import MapaInteractivo from '../components/MapaInteractivo';
import PlanillaProntuariaPDF from '../components/PlanillaProntuariaPDF';
import useDelitosEspecificos from '../hooks/useDelitosEspecificos';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';
import * as XLSX from 'xlsx';

export default function PersonaDetalle() {
  const { id } = useParams();
  const nav = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    genero: '',
    nacionalidad: '',
    direccion: '',
    telefono: '',
    observaciones: '',
    comisaria: '',
    comisaria_hecho: '',
    alias: '',
    descripcion_fisica: '',
  });
  const [files, setFiles] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { showToast } = useToast();

  // Función helper para manejar cambios en inputs de forma segura
  const handleInputChange = field => event => {
    const value = event.target.value || '';
    setForm(prevForm => ({
      ...prevForm,
      [field]: String(value),
    }));
  };

  // Estado para paginación de registros
  const [registros, setRegistros] = useState([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Estados para antecedentes personales
  const [showAntecedentePersonalDialog, setShowAntecedentePersonalDialog] =
    useState(false);
  const [tabValue, setTabValue] = useState(0); // CORREGIDO: Solo Antecedentes personales (tab 0)

  // Hook para gestión de antecedentes personales
  const {
    delitos: antecedentesPersonales,
    loading: loadingAntecedentesPersonales,
    error: errorAntecedentesPersonales,
    agregarDelito,
    actualizarDelito,
    eliminarDelito,
    getEstadisticas,
  } = useDelitosEspecificos(id);

  // Debug: Verificar datos en localStorage
  useEffect(() => {
    if (id) {
      const storageKey = `delitos_especificos_${id}`;
      const stored = localStorage.getItem(storageKey);
      console.log(`Debug - Datos en localStorage para persona ${id}:`, stored);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log(`Debug - Antecedentes encontrados:`, parsed);
        } catch (err) {
          console.error('Error parseando datos de localStorage:', err);
        }
      }
    }
  }, [id, antecedentesPersonales]);

  function decodeJwt(token) {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch (_) {
      try {
        // Fallback sin escape (navegadores modernos)
        return JSON.parse(atob(token.split('.')[1]));
      } catch (_) {
        return null;
      }
    }
  }

  const me = useMemo(() => {
    const t = localStorage.getItem('accessToken');
    return t ? decodeJwt(t) : null;
  }, []);
  const canEdit = me?.rol === 'admin';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Verificar token antes de hacer llamadas
        const token = localStorage.getItem('accessToken');
        if (!token) {
          nav('/login');
          return;
        }

        const [personaRes, registrosRes] = await Promise.all([
          api.get(`/personas/${id}`),
          api.get('/registros', { params: { persona_id: id, page, pageSize } }),
        ]);
        if (!mounted) return;
        setItem(personaRes.data);
        // /registros puede devolver { items, total } o un array
        if (Array.isArray(registrosRes.data)) {
          setRegistros(registrosRes.data);
          setTotalRegistros(registrosRes.data.length);
        } else {
          setRegistros(registrosRes.data?.items || []);
          setTotalRegistros(
            Number(
              registrosRes.data?.total ??
                (registrosRes.data?.items ? registrosRes.data.items.length : 0)
            )
          );
        }
        // Inicializar formulario con valores seguros
        const formData = {
          nombre: String(personaRes.data.nombre || ''),
          apellido: String(personaRes.data.apellido || ''),
          dni: String(personaRes.data.dni || ''),
          fecha_nacimiento:
            personaRes.data.fecha_nacimiento?.slice(0, 10) || '',
          genero: String(personaRes.data.genero || ''),
          nacionalidad: String(personaRes.data.nacionalidad || ''),
          direccion: String(personaRes.data.direccion || ''),
          telefono: String(personaRes.data.telefono || ''),
          observaciones: String(personaRes.data.observaciones || ''),
          comisaria: String(personaRes.data.comisaria || ''),
          comisaria_hecho: String(personaRes.data.comisaria_hecho || ''),
          alias: String(personaRes.data.alias || ''),
          descripcion_fisica: String(personaRes.data.descripcion_fisica || ''),
        };
        setForm(formData);
      } catch (e) {
        if (!mounted) return;
        if (e.response?.status === 401) {
          // Token expirado, redirigir al login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          showToast(
            'Sesión expirada. Por favor, inicia sesión nuevamente.',
            'error'
          );
          nav('/login');
          return;
        }
        setError('No se pudo cargar el detalle');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, nav, showToast]);

  // Recarga de registros al cambiar paginación
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          nav('/login');
          return;
        }

        const res = await api.get('/registros', {
          params: { persona_id: id, page, pageSize },
        });
        if (!mounted) return;
        if (Array.isArray(res.data)) {
          setRegistros(res.data);
          setTotalRegistros(res.data.length);
        } else {
          setRegistros(res.data?.items || []);
          setTotalRegistros(
            Number(
              res.data?.total ?? (res.data?.items ? res.data.items.length : 0)
            )
          );
        }
      } catch (e) {
        if (!mounted) return;
        if (e.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          showToast(
            'Sesión expirada. Por favor, inicia sesión nuevamente.',
            'error'
          );
          nav('/login');
          return;
        }
        // ignorar errores silenciosos aquí; la vista principal ya maneja errores
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, page, pageSize, nav, showToast]);

  const fotos = useMemo(() => {
    if (!item) return [];
    try {
      const arr = item.fotos_adicionales
        ? JSON.parse(item.fotos_adicionales)
        : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }, [item]);

  const onSave = async () => {
    // Validaciones básicas
    if (!form.apellido?.trim()) {
      setError('El apellido es requerido');
      showToast('El apellido es requerido', 'error');
      return;
    }

    if (!form.dni?.trim()) {
      setError('El DNI es requerido');
      showToast('El DNI es requerido', 'error');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const data = new FormData();

      // Asegurar que todos los valores sean strings
      Object.entries(form).forEach(([k, v]) => {
        data.append(k, String(v || ''));
      });

      files.forEach(f => data.append('fotos', f));

      await api.put(`/personas/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { data: refreshed } = await api.get(`/personas/${id}`);
      setItem(refreshed);
      setEditMode(false);
      setFiles([]);
      showToast('Cambios guardados exitosamente', 'success');
    } catch (e) {
      const errorMsg =
        e?.response?.data?.message || 'No se pudo guardar los cambios';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      console.error('Error guardando:', e);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await api.delete(`/personas/${id}`);
      showToast('Registro eliminado', 'success');
      nav('/buscar');
    } catch (e) {
      setError('No se pudo eliminar');
      showToast('No se pudo eliminar', 'error');
    }
  };

  // Handlers para antecedentes personales
  const handleAgregarAntecedentePersonal = async delitoData => {
    try {
      await agregarDelito(delitoData);
    } catch (error) {
      throw error; // Re-throw para que el componente hijo lo maneje
    }
  };

  // Función unificada para manejar el botón AGREGAR DELITO
  // Como solo tenemos antecedentes personales, siempre abrir el dialog
  const handleAgregarDelitoUnificado = () => {
    setShowAntecedentePersonalDialog(true);
  };

  const handleActualizarAntecedentePersonal = async (
    delitoId,
    datosActualizados
  ) => {
    try {
      await actualizarDelito(delitoId, datosActualizados);
    } catch (error) {
      throw error;
    }
  };

  const handleEliminarAntecedentePersonal = async delitoId => {
    try {
      await eliminarDelito(delitoId);
    } catch (error) {
      throw error;
    }
  };

  // Obtener estadísticas de antecedentes personales
  const estadisticasAntecedentesPersonales = useMemo(() => {
    return getEstadisticas();
  }, [getEstadisticas]);

  // Preparar datos para el mapa
  const personasParaMapa = useMemo(() => {
    if (!item || !item.latitud || !item.longitud) return [];

    return [
      {
        id: item.id,
        nombre: item.nombre,
        apellido: item.apellido,
        dni: item.dni,
        latitud: parseFloat(item.latitud),
        longitud: parseFloat(item.longitud),
        direccion: item.direccion,
        tipo_delito: antecedentesPersonales[0]?.tipo || 'general',
        estado: antecedentesPersonales[0]?.estado || 'activo',
        foto_principal: item.foto_principal,
      },
    ];
  }, [item, antecedentesPersonales]);

  // Función para descargar datos de la persona en formato Excel
  const downloadSubjectData = async () => {
    try {
      // Validar que existan datos de la persona
      if (!item) {
        showToast('No hay datos de la persona para exportar', 'error');
        return;
      }

      // Crear libro de trabajo Excel
      const workbook = XLSX.utils.book_new();

      // 1. Hoja "Datos Personales"
      const datosPersonales = {
        ID: item.id || '',
        Apellido: item.apellido || '',
        Nombre: item.nombre || '',
        DNI: item.dni || '',
        'Fecha de Nacimiento': item.fecha_nacimiento
          ? new Date(item.fecha_nacimiento).toLocaleDateString('es-AR')
          : '',
        Edad: item.edad || '',
        Género: item.genero || '',
        Nacionalidad: item.nacionalidad || '',
        Dirección: item.direccion || '',
        Teléfono: item.telefono || '',
        Email: item.email || '',
        Comisaría: item.comisaria || '',
        'Comisaría del Hecho': item.comisaria_hecho || '',
        Observaciones: item.observaciones || '',
        'Fecha de Creación': item.created_at
          ? new Date(item.created_at).toLocaleString('es-AR')
          : '',
        'Última Actualización': item.updated_at
          ? new Date(item.updated_at).toLocaleString('es-AR')
          : '',
      };

      // Convertir objeto a array de arrays para Excel
      const datosPersonalesArray = Object.entries(datosPersonales).map(
        ([key, value]) => [key, value]
      );
      const wsPersonales = XLSX.utils.aoa_to_sheet([
        ['Campo', 'Valor'],
        ...datosPersonalesArray,
      ]);

      // Ajustar ancho de columnas
      wsPersonales['!cols'] = [
        { width: 25 }, // Campo
        { width: 40 }, // Valor
      ];

      XLSX.utils.book_append_sheet(workbook, wsPersonales, 'Datos Personales');

      // 2. Hoja "Registros Oficiales" (si existen)
      if (registros && registros.length > 0) {
        const registrosData = registros.map(registro => ({
          ID: registro.id || '',
          'Tipo de Delito': registro.tipo_delito || '',
          Descripción: registro.descripcion || '',
          'Fecha del Hecho': registro.fecha_hecho
            ? new Date(registro.fecha_hecho).toLocaleDateString('es-AR')
            : '',
          'Lugar del Hecho': registro.lugar_hecho || '',
          Comisaría: registro.comisaria || '',
          'Número de Expediente': registro.numero_expediente || '',
          Estado: registro.estado || '',
          Observaciones: registro.observaciones || '',
          'Fecha de Registro': registro.created_at
            ? new Date(registro.created_at).toLocaleString('es-AR')
            : '',
        }));

        const wsRegistros = XLSX.utils.json_to_sheet(registrosData);

        // Ajustar ancho de columnas
        wsRegistros['!cols'] = [
          { width: 10 }, // ID
          { width: 20 }, // Tipo de Delito
          { width: 30 }, // Descripción
          { width: 15 }, // Fecha del Hecho
          { width: 25 }, // Lugar del Hecho
          { width: 20 }, // Comisaría
          { width: 20 }, // Número de Expediente
          { width: 15 }, // Estado
          { width: 30 }, // Observaciones
          { width: 20 }, // Fecha de Registro
        ];

        XLSX.utils.book_append_sheet(
          workbook,
          wsRegistros,
          'Registros Oficiales'
        );
      }

      // 3. Hoja "Antecedentes Personales" (si existen)
      if (delitosEspecificos && delitosEspecificos.length > 0) {
        const antecedentesData = delitosEspecificos.map(delito => ({
          ID: delito.id || '',
          'Tipo de Delito': delito.tipo_delito || '',
          Descripción: delito.descripcion || '',
          'Fecha del Hecho': delito.fecha_hecho
            ? new Date(delito.fecha_hecho).toLocaleDateString('es-AR')
            : '',
          'Lugar del Hecho': delito.lugar_hecho || '',
          Víctima: delito.victima || '',
          Testigos: delito.testigos || '',
          Evidencias: delito.evidencias || '',
          Estado: delito.estado || '',
          Observaciones: delito.observaciones || '',
          'Fecha de Registro': delito.created_at
            ? new Date(delito.created_at).toLocaleString('es-AR')
            : '',
        }));

        const wsAntecedentes = XLSX.utils.json_to_sheet(antecedentesData);

        // Ajustar ancho de columnas
        wsAntecedentes['!cols'] = [
          { width: 10 }, // ID
          { width: 20 }, // Tipo de Delito
          { width: 30 }, // Descripción
          { width: 15 }, // Fecha del Hecho
          { width: 25 }, // Lugar del Hecho
          { width: 20 }, // Víctima
          { width: 20 }, // Testigos
          { width: 20 }, // Evidencias
          { width: 15 }, // Estado
          { width: 30 }, // Observaciones
          { width: 20 }, // Fecha de Registro
        ];

        XLSX.utils.book_append_sheet(
          workbook,
          wsAntecedentes,
          'Antecedentes Personales'
        );
      }

      // 4. Hoja "Estadísticas" (si existen antecedentes personales)
      if (
        estadisticasAntecedentesPersonales &&
        Object.keys(estadisticasAntecedentesPersonales).length > 0
      ) {
        const estadisticasData = [
          ['Métrica', 'Valor'],
          [
            'Total de Antecedentes',
            estadisticasAntecedentesPersonales.total || 0,
          ],
          [
            'Delitos más Frecuente',
            estadisticasAntecedentesPersonales.delitoMasFrecuente || 'N/A',
          ],
          [
            'Lugares más Frecuentes',
            Array.isArray(estadisticasAntecedentesPersonales.lugaresFrecuentes)
              ? estadisticasAntecedentesPersonales.lugaresFrecuentes.join(', ')
              : 'N/A',
          ],
          [
            'Tendencia Temporal',
            estadisticasAntecedentesPersonales.tendencia || 'N/A',
          ],
        ];

        const wsEstadisticas = XLSX.utils.aoa_to_sheet(estadisticasData);

        // Ajustar ancho de columnas
        wsEstadisticas['!cols'] = [
          { width: 25 }, // Métrica
          { width: 40 }, // Valor
        ];

        XLSX.utils.book_append_sheet(workbook, wsEstadisticas, 'Estadísticas');
      }

      // Generar nombre del archivo
      const fechaHora = new Date()
        .toLocaleString('es-AR')
        .replace(/[/:]/g, '-')
        .replace(/,/g, '');
      const apellidoNombre = `${item.apellido || 'SinApellido'}_${
        item.nombre || 'SinNombre'
      }`.replace(/\s+/g, '_');
      const nombreArchivo = `SIMA_Persona_${apellidoNombre}_${
        item.dni || 'SinDNI'
      }_${fechaHora}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(workbook, nombreArchivo);

      showToast('Archivo Excel descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error al generar archivo Excel:', error);
      showToast('Error al generar el archivo Excel', 'error');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // ============================================
      // 1. VALIDACIONES INICIALES
      // ============================================
      if (!item) {
        showToast('No hay datos de la persona para exportar', 'error');
        return;
      }

      if (!canEdit) {
        showToast('No tienes permisos para descargar este reporte', 'error');
        return;
      }

      // Verificar que jsPDF esté disponible
      if (typeof jsPDF === 'undefined') {
        console.error('jsPDF no está disponible');
        showToast(
          'Error: Librería PDF no disponible. Recargue la página.',
          'error'
        );
        setIsGeneratingPDF(false);
        return;
      }

      setIsGeneratingPDF(true);
      showToast('Generando PDF profesional...', 'info');

      // ============================================
      // 2. HELPER: CONVERTIR IMAGEN A BASE64
      // ============================================
      const loadImageAsBase64 = url => {
        return new Promise(resolve => {
          if (!url || url.includes('placeholder')) {
            resolve(null);
            return;
          }

          const img = new Image();
          img.crossOrigin = 'Anonymous';

          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');

              // Fondo blanco para evitar transparencias
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);

              const dataURL = canvas.toDataURL('image/jpeg', 0.8);
              resolve(dataURL);
            } catch (error) {
              console.warn('Error convirtiendo imagen:', error);
              resolve(null);
            }
          };

          img.onerror = () => {
            console.warn('Error cargando imagen:', url);
            resolve(null);
          };

          // Construir URL completa si es relativa
          const fullUrl = url.startsWith('http')
            ? url
            : `${window.location.origin}${url}`;

          img.src = fullUrl;
        });
      };

      // ============================================
      // 3. CREAR DOCUMENTO PDF
      // ============================================
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Configuración de página A4: 210mm x 297mm
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Colores institucionales
      const colorAzulOscuro = [26, 54, 93]; // #1a365d
      const colorAzulClaro = [44, 82, 130]; // #2c5282
      const colorRojo = [211, 47, 47]; // #d32f2f
      const colorGris = [100, 100, 100];
      const colorNegro = [0, 0, 0];

      // ============================================
      // 4. FUNCIONES AUXILIARES PARA PDF
      // ============================================
      const addHeader = () => {
        // Fondo azul del header
        pdf.setFillColor(...colorAzulOscuro);
        pdf.rect(0, 0, pageWidth, 35, 'F');

        // Título principal
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('S.I.M.A', pageWidth / 2, 12, { align: 'center' });

        // Subtítulo
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          'Sistema de Identificación de Mencionados y/o Aprehendidos',
          pageWidth / 2,
          19,
          { align: 'center' }
        );
        pdf.text('FICHA PERSONAL COMPLETA', pageWidth / 2, 25, {
          align: 'center',
        });

        // Fecha de generación
        pdf.setFontSize(8);
        pdf.text(
          `Generado: ${new Date().toLocaleString('es-AR')}`,
          pageWidth / 2,
          31,
          { align: 'center' }
        );
      };

      const addFooter = pageNum => {
        const footerY = pageHeight - 10;

        // Línea superior del footer
        pdf.setDrawColor(...colorAzulOscuro);
        pdf.setLineWidth(0.5);
        pdf.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

        // Texto confidencial
        pdf.setTextColor(...colorRojo);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(
          'DOCUMENTO CONFIDENCIAL - USO POLICIAL',
          pageWidth / 2,
          footerY,
          { align: 'center' }
        );

        // Número de página
        pdf.setTextColor(...colorGris);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Página ${pageNum}`, pageWidth - margin, footerY, {
          align: 'right',
        });
      };

      const addWatermark = () => {
        pdf.setTextColor(26, 54, 93);
        pdf.setFontSize(60);
        pdf.setFont('helvetica', 'bold');
        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity: 0.03 }));
        pdf.text('POLICIA', pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: 45,
        });
        pdf.restoreGraphicsState();
      };

      // ============================================
      // 5. AGREGAR HEADER, FOOTER Y WATERMARK
      // ============================================
      addHeader();
      addFooter(1);
      addWatermark();
      yPos = 40;

      // ============================================
      // 6. SECCIÓN DATOS PERSONALES CON FOTO
      // ============================================
      showToast('Procesando datos personales...', 'info');

      // Marco de sección
      pdf.setDrawColor(...colorAzulOscuro);
      pdf.setLineWidth(0.8);
      pdf.rect(margin, yPos, contentWidth, 70, 'S');

      // Cargar foto si existe
      let fotoBase64 = null;
      if (item.foto_principal) {
        try {
          showToast('Cargando fotografía...', 'info');
          fotoBase64 = await loadImageAsBase64(item.foto_principal);
        } catch (error) {
          console.warn('No se pudo cargar la foto:', error);
        }
      }

      // Dibujar foto o placeholder
      const fotoX = margin + 5;
      const fotoY = yPos + 5;
      const fotoWidth = 35;
      const fotoHeight = 45;

      if (fotoBase64) {
        pdf.addImage(fotoBase64, 'JPEG', fotoX, fotoY, fotoWidth, fotoHeight);
      } else {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(fotoX, fotoY, fotoWidth, fotoHeight, 'F');
        pdf.setTextColor(...colorGris);
        pdf.setFontSize(8);
        pdf.text('SIN', fotoX + fotoWidth / 2, fotoY + fotoHeight / 2 - 2, {
          align: 'center',
        });
        pdf.text('FOTO', fotoX + fotoWidth / 2, fotoY + fotoHeight / 2 + 2, {
          align: 'center',
        });
      }

      // Borde de la foto
      pdf.setDrawColor(...colorAzulOscuro);
      pdf.setLineWidth(0.5);
      pdf.rect(fotoX, fotoY, fotoWidth, fotoHeight, 'S');

      // Etiqueta de foto
      pdf.setFontSize(7);
      pdf.setTextColor(...colorNegro);
      pdf.text('📸 FOTOGRAFÍA', fotoX + fotoWidth / 2, fotoY + fotoHeight + 4, {
        align: 'center',
      });

      // Datos personales a la derecha de la foto
      const datosX = fotoX + fotoWidth + 8;
      let datosY = yPos + 8;

      // Nombre completo (destacado)
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...colorAzulOscuro);
      const nombreCompleto = `${(
        item.apellido || 'SIN APELLIDO'
      ).toUpperCase()}, ${(item.nombre || 'SIN NOMBRE').toUpperCase()}`;
      pdf.text(nombreCompleto, datosX, datosY);
      datosY += 8;

      // Datos personales en grid
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      const datosPersonales = [
        { label: 'DNI:', value: item.dni || 'NO REGISTRADO' },
        {
          label: 'Fecha Nac.:',
          value: item.fecha_nacimiento
            ? new Date(item.fecha_nacimiento).toLocaleDateString('es-AR')
            : 'NO REGISTRADO',
        },
        {
          label: 'Edad:',
          value: item.fecha_nacimiento
            ? `${Math.floor(
                (new Date() - new Date(item.fecha_nacimiento)) / 31557600000
              )} años`
            : 'N/A',
        },
        { label: 'Género:', value: item.genero || 'NO ESPECIFICADO' },
        { label: 'Nacionalidad:', value: item.nacionalidad || 'NO REGISTRADO' },
        { label: 'Provincia:', value: item.provincia || 'NO REGISTRADO' },
        { label: 'Domicilio:', value: item.domicilio || 'NO REGISTRADO' },
      ];

      datosPersonales.forEach(dato => {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...colorNegro);
        pdf.text(dato.label, datosX, datosY);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...colorGris);
        const textoValor = pdf.splitTextToSize(
          dato.value,
          contentWidth - (datosX - margin) - 5
        );
        pdf.text(textoValor, datosX + 25, datosY);

        datosY += 6;
      });

      yPos += 75;

      // ============================================
      // 7. SECCIÓN ANTECEDENTES PERSONALES
      // ============================================
      let pageNum = 2; // Declarar pageNum aquí para usarlo en múltiples secciones

      if (antecedentesPersonales && antecedentesPersonales.length > 0) {
        showToast(
          `Procesando ${antecedentesPersonales.length} antecedentes...`,
          'info'
        );

        // Verificar si necesitamos nueva página
        if (yPos > pageHeight - 80) {
          pdf.addPage();
          addHeader();
          addFooter(pageNum);
          addWatermark();
          yPos = 40;
        }

        // Título de sección
        pdf.setFillColor(...colorAzulOscuro);
        pdf.rect(margin, yPos, contentWidth, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ANTECEDENTES PERSONALES', margin + 3, yPos + 7);
        yPos += 12;

        // Estadísticas
        pdf.setFontSize(9);
        pdf.setTextColor(...colorNegro);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Total de registros: ${antecedentesPersonales.length}`,
          margin,
          yPos
        );
        yPos += 7;

        // Procesar cada antecedente
        antecedentesPersonales.forEach((antecedente, index) => {
          // Verificar espacio (cada antecedente necesita ~40mm)
          if (yPos > pageHeight - 50) {
            pdf.addPage();
            pageNum++;
            addHeader();
            addFooter(pageNum);
            addWatermark();
            yPos = 40;
          }

          // Marco del antecedente
          const antecedenteHeight = 35;
          pdf.setDrawColor(...colorAzulClaro);
          pdf.setLineWidth(0.5);
          pdf.rect(margin, yPos, contentWidth, antecedenteHeight, 'S');

          // Número y fecha
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colorAzulOscuro);
          pdf.text(`#${index + 1}`, margin + 2, yPos + 5);

          if (antecedente.fecha) {
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...colorGris);
            pdf.text(
              new Date(antecedente.fecha).toLocaleDateString('es-AR'),
              pageWidth - margin - 2,
              yPos + 5,
              { align: 'right' }
            );
          }

          // Delito
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colorNegro);
          pdf.text('Delito:', margin + 2, yPos + 12);
          pdf.setFont('helvetica', 'normal');
          const delitoTexto = pdf.splitTextToSize(
            antecedente.delito || 'NO ESPECIFICADO',
            contentWidth - 25
          );
          pdf.text(delitoTexto, margin + 18, yPos + 12);

          // Rol
          let currentY = yPos + 18;
          if (antecedente.rol) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Rol:', margin + 2, currentY);
            pdf.setFont('helvetica', 'normal');
            pdf.text(antecedente.rol, margin + 18, currentY);
            currentY += 6;
          }

          // Comisaría
          if (antecedente.comisaria_hecho) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Comisaría:', margin + 2, currentY);
            pdf.setFont('helvetica', 'normal');
            const comisariaTexto = pdf.splitTextToSize(
              antecedente.comisaria_hecho,
              contentWidth - 25
            );
            pdf.text(comisariaTexto, margin + 30, currentY);
          }

          yPos += antecedenteHeight + 3;
        });
      } else {
        // Sin antecedentes
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, yPos, contentWidth, 20, 'F');
        pdf.setDrawColor(...colorGris);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, yPos, contentWidth, 20, 'S');

        pdf.setTextColor(...colorGris);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
          'Sin antecedentes personales registrados',
          pageWidth / 2,
          yPos + 12,
          { align: 'center' }
        );
        yPos += 25;
      }

      // ============================================
      // 8. SECCIÓN REGISTROS DELICTUALES
      // ============================================
      if (registros && registros.length > 0) {
        showToast(
          `Procesando ${registros.length} registros delictuales...`,
          'info'
        );

        // Verificar si necesitamos nueva página
        if (yPos > pageHeight - 80) {
          pdf.addPage();
          pageNum++;
          addHeader();
          addFooter(pageNum);
          addWatermark();
          yPos = 40;
        }

        // Título de sección
        pdf.setFillColor(...colorRojo);
        pdf.rect(margin, yPos, contentWidth, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('REGISTROS DELICTUALES', margin + 3, yPos + 7);
        yPos += 12;

        // Estadísticas
        pdf.setFontSize(9);
        pdf.setTextColor(...colorNegro);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Total de registros: ${registros.length}`, margin, yPos);
        yPos += 7;

        // Procesar cada registro
        registros.forEach((registro, index) => {
          // Verificar espacio (cada registro necesita ~45mm)
          if (yPos > pageHeight - 55) {
            pdf.addPage();
            pageNum++;
            addHeader();
            addFooter(pageNum);
            addWatermark();
            yPos = 40;
          }

          // Marco del registro
          const registroHeight = 42;
          pdf.setDrawColor(...colorRojo);
          pdf.setLineWidth(0.5);
          pdf.rect(margin, yPos, contentWidth, registroHeight, 'S');

          // Número y fecha
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colorRojo);
          pdf.text(`#${index + 1}`, margin + 2, yPos + 5);

          if (registro.created_at) {
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...colorGris);
            pdf.text(
              new Date(registro.created_at).toLocaleDateString('es-AR'),
              pageWidth - margin - 2,
              yPos + 5,
              { align: 'right' }
            );
          }

          // Delito (campo principal)
          let currentY = yPos + 12;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colorNegro);
          pdf.text('Delito:', margin + 2, currentY);
          pdf.setFont('helvetica', 'normal');
          const delitoTexto = pdf.splitTextToSize(
            registro.tipo_delito || registro.delito || 'NO ESPECIFICADO',
            contentWidth - 25
          );
          pdf.text(delitoTexto, margin + 18, currentY);
          currentY += 6 * delitoTexto.length;

          // Comisaría
          if (registro.lugar || item.comisaria) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Comisaría:', margin + 2, currentY);
            pdf.setFont('helvetica', 'normal');
            const comisariaTexto = pdf.splitTextToSize(
              registro.lugar || item.comisaria || 'No especificada',
              contentWidth - 30
            );
            pdf.text(comisariaTexto, margin + 30, currentY);
            currentY += 6;
          }

          // Estado
          if (registro.estado) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Estado:', margin + 2, currentY);
            pdf.setFont('helvetica', 'normal');
            pdf.text(registro.estado, margin + 20, currentY);
            currentY += 6;
          }

          // Juzgado
          if (registro.juzgado) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Juzgado:', margin + 2, currentY);
            pdf.setFont('helvetica', 'normal');
            const juzgadoTexto = pdf.splitTextToSize(
              registro.juzgado,
              contentWidth - 25
            );
            pdf.text(juzgadoTexto, margin + 22, currentY);
            currentY += 6;
          }

          yPos += registroHeight + 3;
        });
      } else {
        // Sin registros delictuales
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          pageNum++;
          addHeader();
          addFooter(pageNum);
          addWatermark();
          yPos = 40;
        }

        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, yPos, contentWidth, 20, 'F');
        pdf.setDrawColor(...colorGris);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, yPos, contentWidth, 20, 'S');

        pdf.setTextColor(...colorGris);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Sin registros delictuales', pageWidth / 2, yPos + 12, {
          align: 'center',
        });
        yPos += 25;
      }

      // ============================================
      // 9. GUARDAR PDF
      // ============================================
      showToast('Guardando PDF...', 'info');

      const fechaHora = new Date()
        .toISOString()
        .slice(0, 16)
        .replace(/[-:T]/g, '_');
      const nombreArchivo = `SIMA_Persona_${item.apellido}_${item.nombre}_${
        item.dni || 'NO'
      }_${fechaHora}.pdf`;
      pdf.save(nombreArchivo);

      showToast('PDF generado exitosamente', 'success');
    } catch (error) {
      console.error('Error generando PDF:', error);
      showToast(`Error al generar PDF: ${error.message}`, 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Función para generar Planilla Oficial con formato institucional
  const handleDescargarPlanillaOficial = async () => {
    try {
      if (!item) {
        showToast(
          'No hay datos de la persona para generar la planilla',
          'error'
        );
        return;
      }

      setIsGeneratingPDF(true);
      showToast('Generando Planilla Oficial de Análisis Delictual...', 'info');

      // Crear contenedor temporal para renderizar la planilla
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // Ancho A4
      tempDiv.style.background = 'white';
      document.body.appendChild(tempDiv);

      // Renderizar componente de planilla usando React 18 API
      const root = ReactDOM.createRoot(tempDiv);

      await new Promise(resolve => {
        root.render(
          React.createElement(PlanillaProntuariaPDF, {
            persona: item,
            antecedentes: antecedentesPersonales || [],
            registros: registros || [],
          })
        );
        // Esperar a que se renderice completamente
        setTimeout(resolve, 2000);
      });

      showToast('Capturando planilla...', 'info');

      // Generar imagen con html2canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight,
        logging: false,
        imageTimeout: 0,
        onclone: clonedDoc => {
          const clonedDiv = clonedDoc.querySelector('div');
          if (clonedDiv) {
            clonedDiv.style.display = 'block';
            clonedDiv.style.position = 'relative';
          }
        },
      });

      showToast('Generando PDF...', 'info');

      // Crear PDF con jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        hotfixes: ['px_scaling'],
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / (imgWidth / 2); // Escala por el factor scale=2
      const scaledHeight = (imgHeight / 2) * (pdfWidth / (imgWidth / 2));

      // Agregar imagen al PDF con múltiples páginas si es necesario
      let heightLeft = scaledHeight;
      let position = 0;
      let pageCount = 1;

      // Primera página
      pdf.addImage(
        imgData,
        'PNG',
        0,
        position,
        pdfWidth,
        scaledHeight,
        undefined,
        'FAST'
      );
      heightLeft -= pdfHeight;

      // Páginas adicionales si es necesario
      while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pageCount++;
        pdf.addImage(
          imgData,
          'PNG',
          0,
          position,
          pdfWidth,
          scaledHeight,
          undefined,
          'FAST'
        );
        heightLeft -= pdfHeight;
      }

      // Limpiar DOM
      root.unmount();
      document.body.removeChild(tempDiv);

      // Descargar PDF
      const fechaHora = new Date()
        .toISOString()
        .slice(0, 16)
        .replace(/[-:T]/g, '_');
      const fileName = `Planilla_Analisis_Delictual_${item.apellido}_${item.nombre}_${fechaHora}.pdf`;
      pdf.save(fileName);

      showToast(
        `✅ Planilla generada exitosamente (${pageCount} página${
          pageCount > 1 ? 's' : ''
        })`,
        'success'
      );
    } catch (error) {
      console.error('Error generando planilla oficial:', error);
      showToast(`Error al generar planilla: ${error.message}`, 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Función alternativa simple para imprimir (backup)
  const handlePrintAsPDF = () => {
    try {
      // Ocultar botones antes de imprimir
      const actionButtons = document.querySelectorAll(
        'button, .MuiIconButton-root'
      );
      const originalDisplay = [];

      actionButtons.forEach((btn, index) => {
        originalDisplay[index] = btn.style.display;
        btn.style.display = 'none';
      });

      // Configurar página para impresión
      const originalTitle = document.title;
      document.title = `SIMA_Persona_${item.apellido}_${item.nombre}_${item.dni}`;

      // Imprimir
      window.print();

      // Restaurar elementos
      setTimeout(() => {
        actionButtons.forEach((btn, index) => {
          btn.style.display = originalDisplay[index];
        });
        document.title = originalTitle;
      }, 1000);
    } catch (error) {
      console.error('Error en impresión:', error);
      showToast('Error al abrir la ventana de impresión', 'error');
    }
  };

  return (
    <>
      <Header showSettings />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => nav(-1)}
            sx={{
              borderColor: 'rgb(21, 77, 113)',
              color: 'rgb(21, 77, 113)',
              fontSize: 20,
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              borderWidth: 2,
              boxShadow: '0 2px 8px rgba(21, 77, 113, 0.1)',
              '&:hover': {
                borderColor: 'rgb(16, 58, 85)',
                bgcolor: 'rgba(21, 77, 113, 0.04)',
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(21, 77, 113, 0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            ← Volver
          </Button>
          {canEdit && !editMode && (
            <>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  '&:hover': {
                    bgcolor: '#1a1a1a',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Editar
              </Button>
              {/* <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={downloadSubjectData}
                disabled={isGeneratingPDF}
                sx={{
                  bgcolor: 'rgb(21, 77, 113)',
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(21, 77, 113, 0.3)',
                  '&:hover': {
                    bgcolor: 'rgb(16, 58, 85)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(21, 77, 113, 0.4)',
                  },
                  '&:disabled': {
                    bgcolor: '#ccc',
                    color: '#666',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Descargar Excel
              </Button> */}
              {/* <Button
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || saving}
                sx={{
                  bgcolor: isGeneratingPDF ? '#999' : 'rgb(21, 77, 113)',
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  minWidth: '180px',
                  boxShadow: isGeneratingPDF
                    ? 'none'
                    : '0 4px 12px rgba(21, 77, 113, 0.3)',
                  '&:hover': {
                    bgcolor: isGeneratingPDF ? '#999' : 'rgb(16, 58, 85)',
                    transform: isGeneratingPDF ? 'none' : 'translateY(-2px)',
                    boxShadow: isGeneratingPDF
                      ? 'none'
                      : '0 6px 16px rgba(21, 77, 113, 0.4)',
                  },
                  '&:disabled': {
                    bgcolor: '#ccc',
                    color: '#666',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isGeneratingPDF ? 'Generando...' : 'PDF Completo'}
              </Button> */}
              <Button
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleDescargarPlanillaOficial}
                disabled={isGeneratingPDF || saving}
                sx={{
<<<<<<< HEAD
                  bgcolor: isGeneratingPDF ? '#999' : 'rgb(51, 161, 224)',
=======
                  bgcolor: isGeneratingPDF ? '#999' : '#rgb(51, 161, 224)',
>>>>>>> 5f259d5f575c1284fd420c40314d269c649c7843
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  minWidth: '200px',
                  boxShadow: isGeneratingPDF
                    ? 'none'
                    : '0 4px 16px rgba(211, 47, 47, 0.4)',
                  border: '2px solid',
<<<<<<< HEAD
                  borderColor: isGeneratingPDF ? '#999' : 'rgb(21, 77, 113)',
                  '&:hover': {
                    bgcolor: isGeneratingPDF ? '#999' : 'rgb(21, 77, 113)',
=======
                  borderColor: isGeneratingPDF ? '#999' : 'rgb(51, 161, 224)',
                  '&:hover': {
                    bgcolor: isGeneratingPDF ? '#999' : 'rgb(51, 161, 224)',
>>>>>>> 5f259d5f575c1284fd420c40314d269c649c7843
                    transform: isGeneratingPDF ? 'none' : 'translateY(-2px)',
                    boxShadow: isGeneratingPDF
                      ? 'none'
                      : '0 6px 20px rgba(211, 47, 47, 0.5)',
                  },
                  '&:disabled': {
                    bgcolor: '#ccc',
                    color: '#666',
                    borderColor: '#999',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isGeneratingPDF ? 'Generando...' : '📋 Planilla Oficial'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDelete}
                sx={{
                  color: '#fff',
                  bgcolor: '#d32f2f',
                  borderWidth: 2,
                  fontSize: 19,
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)',
                  '&:hover': {
<<<<<<< HEAD
                    borderWidth: 2,
                    bgcolor: '#b71c1c',
=======
                    // Nuevo: fondo rojo sólido y texto/ícono en blanco
                    bgcolor: 'rgb(211, 47, 47)',
                    color: '#fff',
                    borderColor: 'rgb(211, 47, 47)',
>>>>>>> 5f259d5f575c1284fd420c40314d269c649c7843
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                    '& .MuiSvgIcon-root': {
                      color: '#fff',
                    },
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Eliminar
              </Button>
            </>
          )}
          {canEdit && editMode && (
            <>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={() => {
                  // Verificar si hay cambios no guardados
                  const hasChanges =
                    (item &&
                      Object.keys(form).some(key => {
                        const currentValue = String(form[key] || '');
                        const originalValue =
                          key === 'fecha_nacimiento'
                            ? item[key]?.slice(0, 10) || ''
                            : String(item[key] || '');
                        return currentValue !== originalValue;
                      })) ||
                    files.length > 0;

                  if (hasChanges) {
                    const confirma = window.confirm(
                      '¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.'
                    );
                    if (!confirma) return;
                  }

                  // Restaurar datos originales
                  setEditMode(false);
                  setError('');
                  setFiles([]);
                  if (item) {
                    const formData = {
                      nombre: String(item.nombre || ''),
                      apellido: String(item.apellido || ''),
                      dni: String(item.dni || ''),
                      fecha_nacimiento:
                        item.fecha_nacimiento?.slice(0, 10) || '',
                      genero: String(item.genero || ''),
                      nacionalidad: String(item.nacionalidad || ''),
                      direccion: String(item.direccion || ''),
                      telefono: String(item.telefono || ''),
                      observaciones: String(item.observaciones || ''),
                      comisaria: String(item.comisaria || ''),
                      comisaria_hecho: String(item.comisaria_hecho || ''),
                      alias: String(item.alias || ''),
                      descripcion_fisica: String(item.descripcion_fisica || ''),
                    };
                    setForm(formData);
                  }
                }}
                sx={{
                  borderWidth: 2,
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
                onClick={onSave}
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  '&:hover': {
                    bgcolor: '#1a1a1a',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
                  },
                  '&:disabled': {
                    bgcolor: '#ccc',
                    color: '#666',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </>
          )}
        </Stack>
        <Card className="card">
          <CardContent>
            {loading && <Typography>Cargando…</Typography>}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {item && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      position: 'relative',
                      height: '600px',
                      width: '380px',
                      mt: '25px',
                      aspectRatio: '1/1',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '3px solid rgb(21, 77, 113)',
                      boxShadow: '0 8px 24px rgba(21, 77, 113, 0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 32px rgba(21, 77, 113, 0.25)',
                        border: '3px solid rgb(16, 58, 85)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        width: 'auto',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        },
                      }}
                      image={
                        item.foto_principal ||
                        'https://via.placeholder.com/400x400/f5f5f5/999999?text=Sin+Foto'
                      }
                      alt={`${item.apellido}, ${item.nombre}`}
                      onError={e => {
                        e.currentTarget.src =
                          'https://via.placeholder.com/400x400/f5f5f5/999999?text=Sin+Foto';
                      }}
                    />

                    {/* Overlay con información básica */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          'linear-gradient(transparent, rgba(21, 77, 113, 0.85))',
                        color: 'white',
                        p: 2,
                        transform: 'translateY(100%)',
                        transition: 'transform 0.3s ease',
                        '.MuiBox-root:hover &': {
                          transform: 'translateY(0)',
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {item.dni ? `DNI: ${item.dni}` : 'Sin DNI registrado'}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {item.fecha_nacimiento
                          ? `Nac: ${new Date(
                              item.fecha_nacimiento
                            ).toLocaleDateString('es-AR')}`
                          : 'Fecha de nacimiento no registrada'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={8}>
                  {!editMode ? (
                    <Box sx={{ p: 2 }}>
                      {/* Nombre principal */}
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          color: 'rgb(21, 77, 113)',
                          mb: 3,
                          borderBottom: '2px solid rgb(21, 77, 113)',
                          pb: 1,
                        }}
                      >
                        {item.apellido}, {item.nombre}
                      </Typography>

                      {/* Datos organizados verticalmente */}
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1,
                              bgcolor: '#f8f9fa',
                              border: '1px solid #e9ecef',
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: 'rgb(21, 77, 113)',
                                fontWeight: 600,
                                mb: 0.5,
                              }}
                            >
                              DNI
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 800 }}
                            >
                              {item.dni || 'No registrado'}
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1,
                              bgcolor: '#f8f9fa',
                              border: '1px solid #e9ecef',
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: 'rgb(21, 77, 113)',
                                fontWeight: 600,
                                mb: 0.5,
                              }}
                            >
                              FECHA DE NACIMIENTO
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 800 }}
                            >
                              {item.fecha_nacimiento
                                ? new Date(
                                    item.fecha_nacimiento
                                  ).toLocaleDateString('es-AR')
                                : 'No registrada'}
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1,
                              bgcolor: '#f8f9fa',
                              border: '1px solid #e9ecef',
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: 'rgb(21, 77, 113)',
                                fontWeight: 600,
                                mb: 0.5,
                              }}
                            >
                              GÉNERO
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 800 }}
                            >
                              {item.genero
                                ? item.genero.charAt(0).toUpperCase() +
                                  item.genero.slice(1)
                                : 'No especificado'}
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1,
                              bgcolor: '#f8f9fa',
                              border: '1px solid #e9ecef',
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: 'rgb(21, 77, 113)',
                                fontWeight: 600,
                                mb: 0.5,
                              }}
                            >
                              NACIONALIDAD
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 800 }}
                            >
                              {item.nacionalidad || 'No registrada'}
                            </Typography>
                          </Paper>
                        </Grid>

                        {item.alias && (
                          <Grid item xs={12}>
                            <Paper
                              elevation={1}
                              sx={{
                                p: 1,
                                bgcolor: '#fff3e0',
                                border: '1px solid #ffcc80',
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  color: 'rgb(21, 77, 113)',
                                  fontWeight: 600,
                                  mb: 0.5,
                                }}
                              >
                                ALIAS / APODOS
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  color: 'rgb(21, 77, 113)',
                                }}
                              >
                                {item.alias}
                              </Typography>
                            </Paper>
                          </Grid>
                        )}

                        <Grid item xs={12}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1,
                              bgcolor: '#f8f9fa',
                              border: '1px solid #e9ecef',
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: 'rgb(21, 77, 113)',
                                fontWeight: 600,
                                mb: 0.5,
                              }}
                            >
                              COMISARÍA JURISDICCIONAL DE PERTENENCIA
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 800 }}
                            >
                              {item.comisaria || 'No asignada'}
                            </Typography>
                          </Paper>
                        </Grid>

                        {/* {item.comisaria_hecho && (
                          <Grid item xs={12}>
                            <Paper
                              elevation={1}
                              sx={{
                                p: 1,
                                bgcolor: '#fff3cd',
                                border: '1px solid #ffeaa7',
                              }}
                            > */}
                        {/* <Typography
                                variant="subtitle2"
                                sx={{
                                  color: '#856404',
                                  fontWeight: 600,
                                  mb: 0.5,
                                }}
                              >
                                Comisaría del Hecho
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500, color: '#856404' }}
                              >
                                {item.comisaria_hecho}
                              </Typography> */}
                        {/* </Paper>
                          </Grid>
                        )} */}

                        <Grid item xs={12}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1,
                              bgcolor: '#f8f9fa',
                              border: '1px solid #e9ecef',
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: 'rgb(21, 77, 113)',
                                fontWeight: 600,
                                mb: 0.5,
                              }}
                            >
                              DOMICILIO
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 800 }}
                            >
                              {item.direccion || 'No registrada'}
                            </Typography>
                          </Paper>
                        </Grid>

                        {/* <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1,
                              bgcolor: '#f8f9fa',
                              border: '1px solid #e9ecef',
                            }}
                          > */}
                        {/* <Typography
                              variant="subtitle2"
                              sx={{
                                color: 'rgb(21, 77, 113)',
                                fontWeight: 600,
                                mb: 0.5,
                              }}
                            >
                              Teléfono
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              {item.telefono || 'No registrado'}
                            </Typography> */}
                        {/* </Paper>
                        </Grid> */}

                        {/* <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1,
                              bgcolor: '#f8f9fa',
                              border: '1px solid #e9ecef',
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: 'rgb(21, 77, 113)',
                                fontWeight: 600,
                                mb: 0.5,
                              }}
                            >
                              Email
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              {item.email || 'No registrado'}
                            </Typography>
                          </Paper>
                        </Grid> */}

                        {item.observaciones && (
                          <Grid item xs={12}>
                            <Paper
                              elevation={1}
                              sx={{
                                p: 1,
                                bgcolor: '#e8f4fd',
                                border: '1px solid #bee5eb',
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  color: '#0c5460',
                                  fontWeight: 600,
                                  mb: 0.5,
                                }}
                              >
                                Observaciones
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  color: '#0c5460',
                                  whiteSpace: 'pre-wrap',
                                }}
                              >
                                {item.observaciones}
                              </Typography>
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Nombre"
                          fullWidth
                          value={form.nombre || ''}
                          onChange={handleInputChange('nombre')}
                          disabled={saving}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Apellido *"
                          fullWidth
                          value={form.apellido || ''}
                          onChange={handleInputChange('apellido')}
                          disabled={saving}
                          required
                          error={!form.apellido?.trim()}
                          helperText={
                            !form.apellido?.trim()
                              ? 'El apellido es requerido'
                              : ''
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="DNI *"
                          fullWidth
                          placeholder="Ej: 12345678 o NO"
                          helperText="Ingrese un DNI válido o 'NO', 'NULO', 'EXTRANJERO', etc."
                          value={form.dni || ''}
                          onChange={handleInputChange('dni')}
                          disabled={saving}
                          required
                          error={!form.dni?.trim()}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          type="date"
                          label="Fecha de nacimiento"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={form.fecha_nacimiento || ''}
                          onChange={handleInputChange('fecha_nacimiento')}
                          disabled={saving}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Género"
                          fullWidth
                          value={form.genero || ''}
                          onChange={handleInputChange('genero')}
                          disabled={saving}
                        >
                          <MenuItem value="">Seleccionar género</MenuItem>
                          <MenuItem value="masculino">Masculino</MenuItem>
                          <MenuItem value="femenino">Femenino</MenuItem>
                          <MenuItem value="otro">Otro</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Comisaría"
                          fullWidth
                          value={form.comisaria || ''}
                          onChange={handleInputChange('comisaria')}
                          disabled={saving}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Comisaría del Hecho"
                          fullWidth
                          value={form.comisaria_hecho || ''}
                          onChange={handleInputChange('comisaria_hecho')}
                          disabled={saving}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Nacionalidad"
                          fullWidth
                          value={form.nacionalidad || ''}
                          onChange={handleInputChange('nacionalidad')}
                          disabled={saving}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Alias"
                          fullWidth
                          placeholder="Ej: El Flaco, Checo, etc."
                          helperText="Ingrese cualquier alias o apodo conocido"
                          value={form.alias || ''}
                          onChange={handleInputChange('alias')}
                          disabled={saving}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Dirección"
                          fullWidth
                          value={form.direccion || ''}
                          onChange={handleInputChange('direccion')}
                          disabled={saving}
                          multiline
                          rows={2}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Teléfono"
                          fullWidth
                          placeholder="Ej: +54 381 1234567 o NO"
                          helperText="Puede ingresar un número válido o 'NO', 'NULO', 'N/A', etc."
                          value={form.telefono || ''}
                          onChange={handleInputChange('telefono')}
                          disabled={saving}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Observaciones"
                          fullWidth
                          multiline
                          rows={3}
                          value={form.observaciones || ''}
                          onChange={handleInputChange('observaciones')}
                          disabled={saving}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            p: 2,
                            border: '2px dashed #90a4ae',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Adjuntar nuevas fotos (opcional)
                          </Typography>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={e =>
                              setFiles(Array.from(e.target.files || []))
                            }
                          />
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mt: 1, flexWrap: 'wrap' }}
                          >
                            {files.map((f, idx) => (
                              <img
                                key={idx}
                                src={URL.createObjectURL(f)}
                                alt="preview"
                                style={{
                                  width: 96,
                                  height: 96,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
                {!!fotos.length && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Fotos adicionales
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: 2,
                      }}
                    >
                      {fotos.map((src, idx) => (
                        <CardMedia
                          key={idx}
                          component="img"
                          sx={{
                            width: '100%',
                            height: 140,
                            objectFit: 'cover',
                            borderRadius: 2,
                          }}
                          image={
                            src ||
                            'https://via.placeholder.com/300x200?text=Sin+foto'
                          }
                          alt={`foto-${idx + 1}`}
                          onError={e => {
                            e.currentTarget.src =
                              'https://via.placeholder.com/300x200?text=Sin+foto';
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Sección del mapa */}
                {item?.latitud && item?.longitud && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3, // Aumentado el margen inferior para más separación
                            p: 2, // Padding agregado para mejor espaciado
                            bgcolor: 'rgba(21, 77, 113, 0.05)', // Fondo sutil para destacar la sección
                            borderRadius: 2, // Bordes redondeados
                            border: '1px solid rgba(21, 77, 113, 0.2)', // Borde sutil
                          }}
                        >
                          <Typography
                            variant="h5" // Cambiado a h5 para hacerlo más grande
                            sx={{
                              fontWeight: 700, // Más negrita
                              display: 'flex',
                              alignItems: 'center',
                              color: 'rgb(21, 77, 113)', // Color consistente
                            }}
                          >
                            <LocationOnIcon
                              sx={{
                                mr: 1.5,
                                color: 'rgb(21, 77, 113)',
                                fontSize: '1.8rem',
                              }} // Ícono más grande
                            />
                            Ubicación Geográfica
                          </Typography>
                          <Button
                            variant="contained" // Cambiado a contained para más prominencia
                            onClick={() => setShowMap(!showMap)}
                            startIcon={<MapIcon />}
                            sx={{
                              bgcolor: 'rgb(21, 77, 113)',
                              color: '#fff',
                              fontWeight: 600,
                              px: 3, // Padding horizontal aumentado
                              py: 1, // Padding vertical aumentado
                              borderRadius: 2,
                              boxShadow: '0 4px 12px rgba(21, 77, 113, 0.3)', // Sombra para profundidad
                              '&:hover': {
                                bgcolor: 'rgb(16, 58, 85)',
                                boxShadow: '0 6px 16px rgba(21, 77, 113, 0.4)', // Sombra más intensa en hover
                                transform: 'translateY(-2px)', // Efecto de elevación
                              },
                              transition: 'all 0.3s ease', // Transición suave
                            }}
                          >
                            {showMap ? 'Ocultar Mapa' : 'Ver en Mapa'}
                          </Button>
                        </Box>

                        {showMap && (
                          <Box
                            sx={{
                              height: '600px', // Altura aumentada de 400px a 600px
                              borderRadius: 3, // Bordes más redondeados
                              overflow: 'hidden',
                              border: '2px solid rgb(21, 77, 113)', // Borde más grueso y colorido
                              boxShadow: '0 8px 24px rgba(21, 77, 113, 0.2)', // Sombra para profundidad
                              transition: 'all 0.3s ease', // Transición suave al aparecer
                            }}
                          >
                            <MapaInteractivo
                              personas={personasParaMapa}
                              height="600px" // Altura actualizada para coincidir
                              initialCenter={[
                                parseFloat(item.latitud),
                                parseFloat(item.longitud),
                              ]}
                              initialZoom={15}
                              showControls={false}
                            />
                          </Box>
                        )}

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          <LocationOnIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              verticalAlign: 'middle',
                            }}
                          />
                          Coordenadas: {item.latitud}, {item.longitud}
                          {item.direccion && (
                            <>
                              <br />
                              Dirección: {item.direccion}
                            </>
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Acciones */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    {/* <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Acciones
                    </Typography> */}
                    {canEdit && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleAgregarDelitoUnificado}
                        sx={{
                          bgcolor: '#000',
                          color: '#fff',
                          fontSize: '25px',
                          fontWeight: 'bold',
                          mt: -5,
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          '&:hover': {
                            bgcolor: 'rgb(21, 77, 113)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                        title="Agregar antecedente personal (no aparece en búsquedas generales)"
                      >
                        + AGREGAR ANTECEDENTE PERSONAL
                      </Button>
                    )}
                  </Box>
                </Grid>
                {/* Lista de antecedentes - con pestañas */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />

                  {/* <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
                    <Tabs
                      value={tabValue}
                      onChange={(e, newValue) => setTabValue(newValue)}
                      aria-label="antecedentes tabs"
                    >
                      <Tab
                        label={`Antecedentes Personales (${estadisticasAntecedentesPersonales.total})`}
                        id="tab-0"
                        aria-controls="tabpanel-0"
                      />
                    </Tabs>
                  </Box> */}

                  {/* Panel de Antecedentes Personales */}
                  <Box
                    role="tabpanel"
                    hidden={tabValue !== 0}
                    id="tabpanel-0"
                    aria-labelledby="tab-0"
                  >
                    {tabValue === 0 && (
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600 }}
                            ></Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            ></Typography>
                          </Box>
                          {canEdit && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() =>
                                setShowAntecedentePersonalDialog(true)
                              }
                              sx={{
                                display: 'none', // UNIFICACIÓN: Botón oculto - funcionalidad movida al botón principal unificado
                                bgcolor: '#000',
                                '&:hover': { bgcolor: '#333' },
                              }}
                            >
                              Agregar Antecedente Personal{' '}
                              {/* Funcionalidad preservada en handleAgregarDelitoUnificado */}
                            </Button>
                          )}
                        </Box>
                        {/* Estadísticas rápidas */}
                        {estadisticasAntecedentesPersonales.total > 0 && (
                          <EstadisticasDelitos
                            estadisticas={estadisticasAntecedentesPersonales}
                            loading={loadingAntecedentesPersonales}
                          />
                        )}
                        {errorAntecedentesPersonales && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            {errorAntecedentesPersonales}
                          </Alert>
                        )}
                        <ListaAntecedentesPersonalesMejorada
                          delitos={antecedentesPersonales}
                          onActualizar={handleActualizarAntecedentePersonal}
                          onEliminar={handleEliminarAntecedentePersonal}
                          loading={loadingAntecedentesPersonales}
                          showTableView={antecedentesPersonales.length > 5}
                          isPDFMode={isGeneratingPDF}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Sección de Registros Delictuales */}
                {registros && registros.length > 0 && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ mt: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: '#d32f2f',
                        }}
                      >
                        📋 Registros Delictuales ({registros.length})
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Historial de delitos registrados oficialmente en el
                        sistema
                      </Typography>

                      {registros.map((registro, idx) => (
                        <Accordion
                          key={registro.id || idx}
                          sx={{
                            mb: 1,
                            border: '1px solid #e0e0e0',
                            '&:before': { display: 'none' },
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                              bgcolor: '#fff3f3',
                              '&:hover': { bgcolor: '#ffe8e8' },
                            }}
                          >
                            <Box
                              sx={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <Chip
                                label={`#${idx + 1}`}
                                size="small"
                                color="error"
                                sx={{ fontWeight: 600 }}
                              />
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600, flex: 1 }}
                              >
                                {registro.tipo_delito ||
                                  registro.delito ||
                                  'DELITO NO ESPECIFICADO'}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {registro.created_at
                                  ? new Date(
                                      registro.created_at
                                    ).toLocaleDateString('es-AR')
                                  : 'Fecha no registrada'}
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              {registro.lugar && (
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Comisaría:</strong>
                                  </Typography>
                                  <Typography variant="body1">
                                    {registro.lugar}
                                  </Typography>
                                </Grid>
                              )}
                              {registro.estado && (
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Estado:</strong>
                                  </Typography>
                                  <Chip
                                    label={registro.estado}
                                    size="small"
                                    color={
                                      registro.estado
                                        ?.toLowerCase()
                                        .includes('activo')
                                        ? 'error'
                                        : registro.estado
                                            ?.toLowerCase()
                                            .includes('cerrado')
                                        ? 'success'
                                        : 'default'
                                    }
                                  />
                                </Grid>
                              )}
                              {registro.juzgado && (
                                <Grid item xs={12}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Juzgado:</strong>
                                  </Typography>
                                  <Typography variant="body1">
                                    {registro.juzgado}
                                  </Typography>
                                </Grid>
                              )}
                              {registro.detalle && (
                                <Grid item xs={12}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Detalle:</strong>
                                  </Typography>
                                  <Typography variant="body1">
                                    {registro.detalle}
                                  </Typography>
                                </Grid>
                              )}
                              <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Fecha de registro:{' '}
                                  {registro.created_at
                                    ? new Date(
                                        registro.created_at
                                      ).toLocaleString('es-AR')
                                    : 'No disponible'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Creado:{' '}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : '-'}
                    {` · por #${item.created_by ?? '-'}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actualizado:{' '}
                    {item.updated_at
                      ? new Date(item.updated_at).toLocaleString()
                      : '-'}
                    {` · por #${item.updated_by ?? '-'}`}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Dialog para agregar antecedente personal */}
      <AgregarDelitoEspecifico
        open={showAntecedentePersonalDialog}
        onClose={() => setShowAntecedentePersonalDialog(false)}
        onAgregar={handleAgregarAntecedentePersonal}
        sujetoInfo={
          item
            ? {
                apellido: item.apellido,
                nombre: item.nombre,
                dni: item.dni,
              }
            : null
        }
        loading={loadingAntecedentesPersonales}
      />

      <Footer />
    </>
  );
}
