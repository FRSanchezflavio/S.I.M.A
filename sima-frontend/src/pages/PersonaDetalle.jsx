import { useEffect, useMemo, useState } from 'react';
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
import Header from '../components/Header';
import Footer from '../components/Footer';
import AgregarDelitoEspecifico from '../components/AgregarDelitoEspecifico';
import ListaAntecedentesPersonalesMejorada from '../components/ListaAntecedentesPersonalesMejorada';
import EstadisticasDelitos from '../components/EstadisticasDelitos';
import useDelitosEspecificos from '../hooks/useDelitosEspecificos';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [tabValue, setTabValue] = useState(0); // 0: Antecedentes oficiales, 1: Antecedentes personales

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
        });
      } catch (e) {
        setError('No se pudo cargar el detalle');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Recarga de registros al cambiar paginación
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
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
      } catch (_) {
        // ignorar errores silenciosos aquí; la vista principal ya maneja errores
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, page, pageSize]);

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
  // Detecta el contexto (pestaña activa) para determinar qué acción realizar
  const handleAgregarDelitoUnificado = () => {
    if (tabValue === 0) {
      // Pestaña "Antecedentes Oficiales" - navegar a página de agregar delito
      nav('/agregar-delito', {
        state: {
          sujetoId: item.id,
          prefilledData: {
            apellido: item.apellido,
            nombre: item.nombre,
            dni: item.dni,
            fecha_nacimiento: item.fecha_nacimiento,
            edad: item.edad,
            genero: item.genero,
            nacionalidad: item.nacionalidad,
            direccion: item.direccion,
            telefono: item.telefono,
            comisaria: item.comisaria,
            comisaria_hecho: item.comisaria_hecho,
          },
        },
      });
    } else if (tabValue === 1) {
      // Pestaña "Antecedentes Personales" - abrir dialog
      setShowAntecedentePersonalDialog(true);
    }
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
      // Validar que existan datos de la persona
      if (!item) {
        showToast('No hay datos de la persona para exportar', 'error');
        return;
      }

      // Validar permisos de usuario
      if (!canEdit) {
        showToast('No tienes permisos para descargar este reporte', 'error');
        return;
      }

      setIsGeneratingPDF(true);
      showToast('Generando PDF, esto puede tomar unos momentos...', 'info');

      // Buscar el contenido a exportar
      const contentElement = document.querySelector('.card');
      if (!contentElement) {
        throw new Error('No se encontró el contenido a exportar');
      }

      // Nombre del archivo
      const filename = `SIMA_Persona_${item.apellido || 'SinApellido'}_${
        item.nombre || 'SinNombre'
      }_${item.dni || 'SinDNI'}_${new Date()
        .toLocaleString('es-AR')
        .replace(/[/:]/g, '-')
        .replace(/,/g, '')}.pdf`;

      // MÉTODO SIMPLIFICADO: Usar solo html2canvas + jsPDF (más confiable)
      try {
        // Crear contenedor temporal simplificado
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '794px'; // A4 width en px a 96 DPI
        tempDiv.style.backgroundColor = '#ffffff';
        tempDiv.style.padding = '20px';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.fontSize = '14px';
        tempDiv.style.lineHeight = '1.4';
        tempDiv.style.color = '#000000';

        // Header simple
        const header = document.createElement('div');
        header.innerHTML = `
          <div style="text-align: center; margin-bottom: 20px; padding: 15px; border-bottom: 2px solid rgb(21, 77, 113);">
            <h1 style="color: rgb(21, 77, 113); margin: 0; font-size: 20px; font-weight: bold;">
              S.I.M.A - SISTEMA DE INFORMACIÓN POLICIAL
            </h1>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
              Reporte de Persona - ${new Date().toLocaleString('es-AR')}
            </p>
          </div>
        `;

        // Clonar y limpiar contenido
        const clonedContent = contentElement.cloneNode(true);

        // Remover todos los botones y elementos problemáticos
        const elementsToRemove = clonedContent.querySelectorAll(`
          button, 
          .MuiIconButton-root, 
          .no-print,
          [role="button"]
        `);
        elementsToRemove.forEach(el => el.remove());

        // Remover stacks que contengan botones
        const stacks = clonedContent.querySelectorAll('.MuiStack-root');
        stacks.forEach(stack => {
          if (
            stack.textContent.includes('Volver') ||
            stack.textContent.includes('Editar') ||
            stack.textContent.includes('Descargar') ||
            stack.textContent.includes('Eliminar')
          ) {
            stack.remove();
          }
        });

        // Mejorar estilos del contenido clonado
        clonedContent.style.backgroundColor = '#ffffff';
        clonedContent.style.boxShadow = 'none';
        clonedContent.style.border = '1px solid #ddd';
        clonedContent.style.borderRadius = '0';

        // Footer simple
        const footer = document.createElement('div');
        footer.innerHTML = `
          <div style="margin-top: 30px; padding: 15px; border-top: 1px solid #ddd; text-align: center; font-size: 10px; color: #666;">
            <div style="display: flex; justify-content: space-between;">
              <span>CONFIDENCIAL - USO INTERNO</span>
              <span>S.I.M.A - Sistema Policial</span>
              <span>${new Date().toLocaleDateString('es-AR')}</span>
            </div>
          </div>
        `;

        // Ensamblar contenido
        tempDiv.appendChild(header);
        tempDiv.appendChild(clonedContent);
        tempDiv.appendChild(footer);

        // Agregar al DOM
        document.body.appendChild(tempDiv);

        // Capturar con html2canvas
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          width: tempDiv.scrollWidth,
          height: tempDiv.scrollHeight,
          onclone: clonedDoc => {
            // Asegurar que los estilos se apliquen en el documento clonado
            const clonedElement = clonedDoc.querySelector('div');
            if (clonedElement) {
              clonedElement.style.fontFamily = 'Arial, sans-serif';
              clonedElement.style.fontSize = '14px';
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
        const imgWidth = pdfWidth - 20; // Margen de 10mm a cada lado
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 10; // Margen superior

        // Primera página
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20; // Restar márgenes

        // Páginas adicionales si es necesario
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight - 20;
        }

        // Descargar PDF
        pdf.save(filename);

        // Limpiar
        document.body.removeChild(tempDiv);

        showToast('PDF descargado exitosamente', 'success');
      } catch (canvasError) {
        console.error('Error con html2canvas:', canvasError);
        throw new Error(
          'No se pudo generar el PDF. Verifique que el contenido sea válido.'
        );
      }
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
                onClick={() => nav(`/registros/nuevo?persona_id=${item?.id}`)}
                sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#111' } }}
              >
                Agregar registro
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
                  <CardMedia
                    component="img"
                    sx={{ width: '100%', borderRadius: 2, objectFit: 'cover' }}
                    image={
                      item.foto_principal ||
                      'https://via.placeholder.com/400x400?text=Sin+foto'
                    }
                    alt={`${item.apellido}, ${item.nombre}`}
                    onError={e => {
                      e.currentTarget.src =
                        'https://via.placeholder.com/400x400?text=Sin+foto';
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  {!editMode ? (
                    <>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {item.apellido}, {item.nombre}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 1, flexWrap: 'wrap' }}
                      >
                        <Chip label={`DNI: ${item.dni || '-'}`} />
                        <Chip label={`Comisaría: ${item.comisaria || '-'}`} />
                        {item.comisaria_hecho && (
                          <Chip
                            label={`Com. del Hecho: ${item.comisaria_hecho}`}
                          />
                        )}
                        {item.fecha_nacimiento && (
                          <Chip
                            label={`Nac.: ${new Date(
                              item.fecha_nacimiento
                            ).toLocaleDateString()}`}
                          />
                        )}
                        {item.genero && (
                          <Chip label={`Género: ${item.genero}`} />
                        )}
                      </Stack>
                    </>
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
                  <Divider sx={{ my: 2 }} />
                  {!editMode ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Dirección
                        </Typography>
                        <Typography>{item.direccion || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Teléfono / Email
                        </Typography>
                        <Typography>
                          {(item.telefono || '-') + ' / ' + (item.email || '-')}
                        </Typography>
                      </Grid>
                      {item.comisaria_hecho && (
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Comisaría del Hecho
                          </Typography>
                          <Typography>{item.comisaria_hecho}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Observaciones
                        </Typography>
                        <Typography whiteSpace="pre-wrap">
                          {item.observaciones || '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : null}
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
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Acciones
                    </Typography>
                    {canEdit && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleAgregarDelitoUnificado}
                        sx={{
                          bgcolor: '#000',
                          color: '#fff',
                          fontSize: '0.75rem',
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
                        title={
                          tabValue === 0
                            ? 'Agregar delito oficial (aparece en búsquedas)'
                            : 'Agregar antecedente personal (no aparece en búsquedas generales)'
                        }
                      >
                        + AGREGAR DELITO
                        {tabValue === 1 && ' PERSONAL'}
                      </Button>
                    )}
                  </Box>
                </Grid>
                {/* Lista de antecedentes - con pestañas */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs
                      value={tabValue}
                      onChange={(e, newValue) => setTabValue(newValue)}
                      aria-label="antecedentes tabs"
                    >
                      <Tab
                        label={`Antecedentes Oficiales (${
                          totalRegistros || registros.length
                        })`}
                        id="tab-0"
                        aria-controls="tabpanel-0"
                      />
                      <Tab
                        label={`Antecedentes Personales (${estadisticasAntecedentesPersonales.total})`}
                        id="tab-1"
                        aria-controls="tabpanel-1"
                      />
                    </Tabs>
                  </Box>

                  {/* Panel de Antecedentes Oficiales */}
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
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Antecedentes Delictuales Oficiales
                          </Typography>
                        </Box>

                        {registros.length === 0 ? (
                          <Alert severity="info">
                            No se encontraron antecedentes delictuales oficiales
                            para esta persona.
                          </Alert>
                        ) : (
                          <Grid container spacing={2}>
                            {registros.map((registro, index) => (
                              <Grid item xs={12} key={registro.id}>
                                <Paper elevation={1} sx={{ p: 2 }}>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ mb: 1 }}
                                  >
                                    <Chip
                                      label={
                                        registro.tipo_delito ||
                                        'Sin especificar'
                                      }
                                      color="primary"
                                      size="small"
                                    />
                                    <Chip
                                      label={registro.estado || 'Sin estado'}
                                      variant="outlined"
                                      size="small"
                                    />
                                    {registro.modalidad && (
                                      <Chip
                                        label={registro.modalidad}
                                        variant="outlined"
                                        size="small"
                                      />
                                    )}
                                  </Stack>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Lugar:</strong>{' '}
                                    {registro.lugar || '-'} |
                                    <strong> Comisaría:</strong>{' '}
                                    {registro.comisaria_hecho || '-'} |
                                    <strong> Juzgado:</strong>{' '}
                                    {registro.juzgado || '-'}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Fecha:</strong>{' '}
                                    {registro.fecha_carga
                                      ? new Date(
                                          registro.fecha_carga
                                        ).toLocaleDateString()
                                      : '-'}{' '}
                                    |<strong> Registrado:</strong>{' '}
                                    {registro.created_at
                                      ? new Date(
                                          registro.created_at
                                        ).toLocaleDateString()
                                      : '-'}
                                  </Typography>
                                  {registro.detalle && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                      <strong>Detalle:</strong>{' '}
                                      {registro.detalle}
                                    </Typography>
                                  )}
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        )}

                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="outlined"
                            disabled={page * pageSize >= totalRegistros}
                            onClick={() => setPage(p => p + 1)}
                          >
                            Siguiente
                          </Button>
                          <Typography variant="body2" color="text.secondary">
                            Página {page} · {totalRegistros} resultados
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </Box>

                  {/* Panel de Antecedentes Personales */}
                  <Box
                    role="tabpanel"
                    hidden={tabValue !== 1}
                    id="tabpanel-1"
                    aria-labelledby="tab-1"
                  >
                    {tabValue === 1 && (
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
