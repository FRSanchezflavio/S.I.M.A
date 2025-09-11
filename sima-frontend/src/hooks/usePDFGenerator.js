import { useState } from 'react';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '../components/ToastProvider';

/**
 * Hook reutilizable para generación de PDFs en S.I.M.A
 * Implementa estrategias de fallback y configuración específica policial
 */
export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  /**
   * Configuración base para PDFs de S.I.M.A
   */
  const getBaseConfig = filename => ({
    margin: [20, 15, 20, 15], // top, right, bottom, left
    filename:
      filename ||
      `SIMA_Reporte_${new Date()
        .toLocaleString('es-AR')
        .replace(/[/:]/g, '-')
        .replace(/,/g, '')}.pdf`,
    image: { type: 'jpeg', quality: 0.92 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      removeContainer: true,
      ignoreElements: element => {
        if (element.classList) {
          return (
            element.classList.contains('no-print') ||
            element.tagName === 'HEADER' ||
            element.tagName === 'FOOTER' ||
            element.querySelector('button') ||
            (element.classList.contains('MuiStack-root') &&
              element.querySelector('button'))
          );
        }
        return false;
      },
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      putOnlyUsedFonts: true,
      floatPrecision: 16,
    },
  });

  /**
   * Crear header estándar de S.I.M.A
   */
  const createSIMAHeader = (title = 'REPORTE') => {
    const headerDiv = document.createElement('div');
    headerDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; padding: 15px; border-bottom: 2px solid rgb(21, 77, 113); background-color: #f8f9fa;">
        <h1 style="color: rgb(21, 77, 113); margin: 0; font-size: 18px; font-weight: bold;">
          S.I.M.A - SISTEMA DE INFORMACIÓN POLICIAL
        </h1>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
          ${title} - Generado el ${new Date().toLocaleString('es-AR')}
        </p>
      </div>
    `;
    return headerDiv;
  };

  /**
   * Crear footer estándar de S.I.M.A
   */
  const createSIMAFooter = () => {
    const footerDiv = document.createElement('div');
    footerDiv.innerHTML = `
      <div style="text-align: center; margin-top: 20px; padding: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #666;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>CONFIDENCIAL - USO INTERNO</span>
          <span>S.I.M.A - Sistema Policial</span>
          <span>${new Date().toLocaleDateString('es-AR')}</span>
        </div>
      </div>
    `;
    return footerDiv;
  };

  /**
   * Crear watermark policial
   */
  const createWatermark = () => {
    const watermarkDiv = document.createElement('div');
    watermarkDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 72px;
        color: rgba(21, 77, 113, 0.05);
        font-weight: bold;
        z-index: -1;
        pointer-events: none;
      ">
        POLICIA
      </div>
    `;
    return watermarkDiv;
  };

  /**
   * Generar PDF con fallback automático
   */
  const generatePDF = async (selector, options = {}) => {
    try {
      setIsGenerating(true);
      showToast('Generando PDF, esto puede tomar unos momentos...', 'info');

      // Validar selector
      const contentElement = document.querySelector(selector);
      if (!contentElement) {
        throw new Error('No se encontró el contenido a exportar');
      }

      // Configuración personalizada
      const config = { ...getBaseConfig(options.filename), ...options.config };

      // Crear contenedor temporal
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.fontFamily = 'Arial, sans-serif';

      // Clonar contenido
      const clonedContent = contentElement.cloneNode(true);

      // Limpiar elementos no deseados
      const elementsToRemove = clonedContent.querySelectorAll(
        'button, .MuiIconButton-root, .no-print'
      );
      elementsToRemove.forEach(el => el.remove());

      // Ensamblar contenido con header, footer y watermark
      if (options.includeHeader !== false) {
        tempContainer.appendChild(createSIMAHeader(options.title));
      }

      tempContainer.appendChild(clonedContent);

      if (options.includeFooter !== false) {
        tempContainer.appendChild(createSIMAFooter());
      }

      if (options.includeWatermark !== false) {
        tempContainer.appendChild(createWatermark());
      }

      document.body.appendChild(tempContainer);

      try {
        // Método principal: html2pdf
        await html2pdf().from(tempContainer).set(config).save();

        showToast('PDF descargado exitosamente', 'success');
      } catch (html2pdfError) {
        console.warn('html2pdf falló, usando fallback:', html2pdfError);

        // Método fallback: html2canvas + jsPDF
        const canvas = await html2canvas(tempContainer, config.html2canvas);
        const imgData = canvas.toDataURL('image/jpeg', 0.92);

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Primera página
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Páginas adicionales
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(config.filename);
        showToast('PDF descargado exitosamente (modo fallback)', 'success');
      }

      // Limpiar
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      showToast('Error al generar el archivo PDF: ' + error.message, 'error');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePDF,
    isGenerating,
    createSIMAHeader,
    createSIMAFooter,
    createWatermark,
  };
};

export default usePDFGenerator;
