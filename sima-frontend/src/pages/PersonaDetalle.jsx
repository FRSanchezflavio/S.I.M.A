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
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AgregarDelitoEspecifico from '../components/AgregarDelitoEspecifico';
import ListaAntecedentesPersonalesMejorada from '../components/ListaAntecedentesPersonalesMejorada';
import EstadisticasDelitos from '../components/EstadisticasDelitos';
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
  const [form, setForm] = useState({});
  const [files, setFiles] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { showToast } = useToast();

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
        setForm({
          nombre: personaRes.data.nombre || '',
          apellido: personaRes.data.apellido || '',
          dni: personaRes.data.dni || '',
          fecha_nacimiento:
            personaRes.data.fecha_nacimiento?.slice(0, 10) || '',
          genero: personaRes.data.genero || '',
          nacionalidad: personaRes.data.nacionalidad || '',
          direccion: personaRes.data.direccion || '',
          telefono: personaRes.data.telefono || '',
          observaciones: personaRes.data.observaciones || '',
          comisaria: personaRes.data.comisaria || '',
          comisaria_hecho: personaRes.data.comisaria_hecho || '',
          alias: personaRes.data.alias || '',
        });
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
    setSaving(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v || ''));
      files.forEach(f => data.append('fotos', f));
      await api.put(`/personas/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data: refreshed } = await api.get(`/personas/${id}`);
      setItem(refreshed);
      setEditMode(false);
      setFiles([]);
      showToast('Cambios guardados', 'success');
    } catch (e) {
      setError(e?.response?.data?.message || 'No se pudo guardar');
      showToast('No se pudo guardar', 'error');
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

  // Función para descargar datos de la persona en formato PDF
  const handleDownloadPDF = async () => {
    try {
      // Validaciones existentes...
      if (!item) {
        showToast('No hay datos de la persona para exportar', 'error');
        return;
      }

      if (!canEdit) {
        showToast('No tienes permisos para descargar este reporte', 'error');
        return;
      }

      setIsGeneratingPDF(true);
      showToast('Generando PDF, esto puede tomar unos momentos...', 'info');

      // CSS específico para PDF - Estilos simples y serios
      const pdfCSS = `
        <style>
          .pdf-container {
            font-family: 'Times New Roman', 'Arial', sans-serif !important;
            font-size: 9px !important;
            line-height: 1.2 !important;
            color: #000000 !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .pdf-header {
            text-align: center;
            margin-bottom: 1px;
            padding: 8px;
            border-bottom: 2px solid #000000;
            background-color: #ffffff !important;
          }
          
          .pdf-title {
            color: #000000 !important;
            margin: 0;
            font-size: 14px !important;
            font-weight: bold !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .pdf-subtitle {
            margin: 3px 0 0 0 !important;
            font-size: 8px !important;
            color: #333333 !important;
            font-style: italic;
          }
          
          .pdf-section {
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          
          .pdf-personal-data {
            display: flex;
            gap: 12px;
            margin-bottom: 15px;
            page-break-inside: avoid;
            border: 1px solid #000000;
            padding: 8px;
            background-color: #ffffff;
          }
          
          .pdf-photo-container {
            flex-shrink: 0;
            text-align: center;
          }
          
          .pdf-photo {
            width: 150px !important;
            height: 180px !important;
            object-fit: cover !important;
            border: 2px solid #000000 !important;
            background-color: #f5f5f5;
          }
          
          .pdf-photo-label {
            margin-top: 4px;
            font-size: 7px;
            color: #000000;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .pdf-info-container {
            flex-grow: 1;
          }
          
          .pdf-person-name {
            color: #000000 !important;
            margin: 0 0 8px 0 !important;
            font-size: 12px !important;
            font-weight: bold !important;
            border-bottom: 1px solid #000000;
            padding-bottom: 2px;
            text-transform: uppercase;
          }
          
          .pdf-info-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
            font-size: 8px !important;
          }
          
          .pdf-info-item {
            padding: 4px;
            background-color: #ffffff;
            border: 1px solid #cccccc;
          }
          
          .pdf-info-label {
            font-weight: bold !important;
            color: #000000 !important;
            display: block;
            margin-bottom: 1px;
            text-transform: uppercase;
            font-size: 7px !important;
          }
          
          .pdf-info-value {
            color: #000000 !important;
            font-size: 8px !important;
          }
          
          .pdf-full-width {
            grid-column: 1 / -1 !important;
          }
          
          .pdf-antecedentes {
            margin-top: 15px;
            page-break-before: auto;
          }
          
          .pdf-footer {
            margin-top: 15px;
            padding: 8px;
            border-top: 1px solid #000000;
            background-color: #ffffff;
            text-align: center;
            font-size: 7px;
            color: #000000;
            page-break-inside: avoid;
          }
          
          .pdf-confidential {
            font-weight: bold;
            color: #000000 !important;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .pdf-generation-info {
            font-size: 6px;
            color: #333333;
          }
          
          /* Optimización para antecedentes */
          .antecedentes-pdf-content {
            font-family: 'Times New Roman', 'Arial', sans-serif !important;
            font-size: 9px !important;
            line-height: 1.2 !important;
          }
          
          .antecedentes-pdf-content * {
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
          }
          
          .antecedentes-pdf-content img {
            max-width: 100% !important;
            height: auto !important;
            border: 1px solid #cccccc !important;
          }
          
          /* Asegurar diseño limpio */
          .antecedentes-pdf-content [style*="grid"] {
            display: grid !important;
            gap: 4px !important;
          }
          
          /* Media print optimizations */
          @media print {
            .pdf-container {
              font-size: 9px !important;
            }
            .pdf-photo {
              width: 120px !important;
              height: 150px !important;
            }
          }
        </style>
      `;

      // Crear contenedor temporal optimizado para PDF
      const tempDiv = document.createElement('div');
      tempDiv.className = 'pdf-container';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.minHeight = '297mm'; // A4 height
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.padding = '15mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.4';
      tempDiv.style.color = '#000000';
      tempDiv.style.boxSizing = 'border-box';

      // Inyectar CSS específico para PDF
      const styleElement = document.createElement('div');
      styleElement.innerHTML = pdfCSS;
      tempDiv.appendChild(styleElement);

      // Header del documento con clases CSS
      const header = document.createElement('div');
      header.className = 'pdf-header';
      header.innerHTML = `
        <h1 class="pdf-title">S.I.M.A - Sistema de Identificación de Mencionados y/o Aprehendidos</h1>
        <p class="pdf-subtitle">Ficha Personal Completa - Generado el ${new Date().toLocaleString(
          'es-AR'
        )}</p>
      `;

      // Sección de datos personales optimizada con CSS
      const datosPersonales = document.createElement('div');
      datosPersonales.className = 'pdf-section pdf-personal-data';
      datosPersonales.innerHTML = `
        <div class="pdf-photo-container">
          <img 
            src="${
              item.foto_principal ||
              'https://via.placeholder.com/150x200/f5f5f5/999999?text=Sin+Foto'
            }" 
            alt="Fotografía Personal" 
            class="pdf-photo"
            onerror="this.src='https://via.placeholder.com/150x200/f5f5f5/999999?text=Sin+Foto'"
          />
          <div class="pdf-photo-label">FOTOGRAFÍA OFICIAL</div>
        </div>
        <div class="pdf-info-container">
          <h2 class="pdf-person-name">${item.apellido || 'N/A'}, ${
        item.nombre || 'N/A'
      }</h2>
          <div class="pdf-info-grid">
            <div class="pdf-info-item">
              <span class="pdf-info-label">DNI:</span>
              <span class="pdf-info-value">${item.dni || 'N/A'}</span>
            </div>
            <div class="pdf-info-item">
              <span class="pdf-info-label">Fecha de Nacimiento:</span>
              <span class="pdf-info-value">${
                item.fecha_nacimiento
                  ? new Date(item.fecha_nacimiento).toLocaleDateString('es-AR')
                  : 'N/A'
              }</span>
            </div>
            <div class="pdf-info-item">
              <span class="pdf-info-label">Edad:</span>
              <span class="pdf-info-value">${item.edad || 'N/A'} años</span>
            </div>
            <div class="pdf-info-item">
              <span class="pdf-info-label">Género:</span>
              <span class="pdf-info-value">${
                item.genero
                  ? item.genero.charAt(0).toUpperCase() + item.genero.slice(1)
                  : 'N/A'
              }</span>
            </div>
            <div class="pdf-info-item">
              <span class="pdf-info-label">Nacionalidad:</span>
              <span class="pdf-info-value">${item.nacionalidad || 'N/A'}</span>
            </div>
            <div class="pdf-info-item">
              <span class="pdf-info-label">Teléfono:</span>
              <span class="pdf-info-value">${item.telefono || 'N/A'}</span>
            </div>
            <div class="pdf-info-item">
              <span class="pdf-info-label">Comisaría:</span>
              <span class="pdf-info-value">${item.comisaria || 'N/A'}</span>
            </div>
            <div class="pdf-info-item pdf-full-width">
              <span class="pdf-info-label">Domicilio:</span>
              <span class="pdf-info-value">${item.direccion || 'N/A'}</span>
            </div>
            ${
              item.alias
                ? `
              <div class="pdf-info-item pdf-full-width">
                <span class="pdf-info-label">Alias/Apodos:</span>
                <span class="pdf-info-value">${item.alias}</span>
              </div>
            `
                : ''
            }
            ${
              item.observaciones
                ? `
              <div class="pdf-info-item pdf-full-width">
                <span class="pdf-info-label">Observaciones:</span>
                <span class="pdf-info-value">${item.observaciones}</span>
              </div>
            `
                : ''
            }
          </div>
        </div>
      `;

      // Crear contenedor para antecedentes con React
      const antecedentesContainer = document.createElement('div');
      antecedentesContainer.id = 'antecedentes-pdf-container';
      antecedentesContainer.className = 'pdf-antecedentes';

      // Footer profesional
      const footer = document.createElement('div');
      footer.className = 'pdf-footer';
      footer.innerHTML = `
        <div class="pdf-confidential">CONFIDENCIAL - S.I.M.A - SISTEMA DE INFORMACIÓN POLICIAL</div>
        <div class="pdf-generation-info">
          Documento generado el ${new Date().toLocaleString('es-AR')} | 
          Usuario: ${me?.nombre || 'Sistema'} | 
          ID Persona: ${item.id} | 
          Total Antecedentes: ${antecedentesPersonales.length}
        </div>
      `;

      // Ensamblar documento con estructura mejorada
      tempDiv.appendChild(header);
      tempDiv.appendChild(datosPersonales);
      tempDiv.appendChild(antecedentesContainer);
      tempDiv.appendChild(footer);

      document.body.appendChild(tempDiv);

      // Renderizar antecedentes en modo PDF usando React
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(antecedentesContainer);

      await new Promise(resolve => {
        root.render(
          React.createElement(ListaAntecedentesPersonalesMejorada, {
            delitos: antecedentesPersonales,
            loading: false,
            isPDFMode: true, // MODO PDF ACTIVADO
            onActualizar: () => {},
            onEliminar: () => {},
          })
        );

        // Esperar a que se renderice
        setTimeout(resolve, 1000);
      });

      // Generar PDF con html2canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight,
        logging: false,
        onclone: clonedDoc => {
          // Asegurar estilos en el documento clonado
          const clonedElement = clonedDoc.querySelector(
            '#antecedentes-pdf-container'
          );
          if (clonedElement) {
            clonedElement.style.fontFamily = 'Arial, sans-serif';
            clonedElement.style.fontSize = '12px';
          }
        },
      });

      // Crear PDF con jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      // Primera página
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;

      // Páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      // Guardar PDF
      const filename = `SIMA_Persona_${item.apellido || 'SinApellido'}_${
        item.nombre || 'SinNombre'
      }_${item.dni || 'SinDNI'}_${new Date()
        .toLocaleString('es-AR')
        .replace(/[/:]/g, '-')
        .replace(/,/g, '')}.pdf`;

      pdf.save(filename);

      // Limpiar
      root.unmount();
      document.body.removeChild(tempDiv);

      showToast('PDF descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      showToast('Error al generar el archivo PDF: ' + error.message, 'error');
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={() => nav(-1)}>
            ← Volver
          </Button>
          {canEdit && !editMode && (
            <>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
              >
                Editar
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={downloadSubjectData}
                disabled={isGeneratingPDF}
                sx={{
                  bgcolor: 'rgb(21, 77, 113)',
                  '&:hover': { bgcolor: 'rgb(16, 58, 85)' },
                  borderRadius: '4px',
                }}
              >
                Descargar Excel
              </Button>
              <Button
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || saving}
                sx={{
                  bgcolor: isGeneratingPDF ? '#999' : 'rgb(21, 77, 113)',
                  '&:hover': {
                    bgcolor: isGeneratingPDF ? '#999' : 'rgb(16, 58, 85)',
                  },
                  borderRadius: '4px',
                  minWidth: '160px',
                }}
              >
                {isGeneratingPDF ? 'Generando PDF...' : 'Descargar PDF'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDelete}
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
                  setEditMode(false);
                  setFiles([]);
                  if (item) {
                    setForm({
                      nombre: item.nombre || '',
                      apellido: item.apellido || '',
                      dni: item.dni || '',
                      fecha_nacimiento:
                        item.fecha_nacimiento?.slice(0, 10) || '',
                      genero: item.genero || '',
                      nacionalidad: item.nacionalidad || '',
                      direccion: item.direccion || '',
                      telefono: item.telefono || '',
                      email: item.email || '',
                      observaciones: item.observaciones || '',
                      comisaria: item.comisaria || '',
                      comisaria_hecho: item.comisaria_hecho || '',
                      alias: item.alias || '',
                    });
                  }
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
                onClick={onSave}
                sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
              >
                Guardar
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
                      width: '280px',
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
                        width: '100%',
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
                          fontWeight: 700,
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
                                  color: '#e65100',
                                  fontWeight: 600,
                                  mb: 0.5,
                                }}
                              >
                                ALIAS / APODOS
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500, color: '#e65100' }}
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
                          value={form.nombre}
                          onChange={e =>
                            setForm({ ...form, nombre: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Apellido"
                          fullWidth
                          value={form.apellido}
                          onChange={e =>
                            setForm({ ...form, apellido: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="DNI"
                          fullWidth
                          placeholder="Ej: 12345678 o NO"
                          helperText="Ingrese un DNI válido o 'NO', 'NULO', 'EXTRANJERO', etc."
                          value={form.dni}
                          onChange={e =>
                            setForm({ ...form, dni: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          type="date"
                          label="Fecha de nacimiento"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={form.fecha_nacimiento}
                          onChange={e =>
                            setForm({
                              ...form,
                              fecha_nacimiento: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Género"
                          fullWidth
                          value={form.genero}
                          onChange={e =>
                            setForm({ ...form, genero: e.target.value })
                          }
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
                          value={form.comisaria}
                          onChange={e =>
                            setForm({ ...form, comisaria: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Comisaría del Hecho"
                          fullWidth
                          value={form.comisaria_hecho}
                          onChange={e =>
                            setForm({
                              ...form,
                              comisaria_hecho: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Nacionalidad"
                          fullWidth
                          value={form.nacionalidad}
                          onChange={e =>
                            setForm({ ...form, nacionalidad: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Alias"
                          fullWidth
                          placeholder="Ej: El Flaco, Checo, etc."
                          helperText="Ingrese cualquier alias o apodo conocido"
                          value={form.alias}
                          onChange={e =>
                            setForm({ ...form, alias: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Dirección"
                          fullWidth
                          value={form.direccion}
                          onChange={e =>
                            setForm({ ...form, direccion: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Teléfono"
                          fullWidth
                          placeholder="Ej: +54 381 1234567 o NO"
                          helperText="Puede ingresar un número válido o 'NO', 'NULO', 'N/A', etc."
                          value={form.telefono}
                          onChange={e =>
                            setForm({ ...form, telefono: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Observaciones"
                          fullWidth
                          multiline
                          rows={3}
                          value={form.observaciones}
                          onChange={e =>
                            setForm({ ...form, observaciones: e.target.value })
                          }
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

                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
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
                  </Box>

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
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Antecedentes Personales del Sujeto
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Estos antecedentes no aparecen en las búsquedas
                              generales del sistema
                            </Typography>
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
