import React from 'react';
import { Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import usePDFGenerator from '../hooks/usePDFGenerator';

/**
 * Componente reutilizable para botón de descarga PDF
 * Aplicación: S.I.M.A - Sistema Policial
 */
const PDFDownloadButton = ({
  selector = '.card',
  filename,
  title = 'Reporte de Persona',
  disabled = false,
  variant = 'contained',
  size = 'medium',
  includeHeader = true,
  includeFooter = true,
  includeWatermark = true,
  sx = {},
  children,
  ...props
}) => {
  const { generatePDF, isGenerating } = usePDFGenerator();

  const handleDownload = async () => {
    try {
      await generatePDF(selector, {
        filename,
        title,
        includeHeader,
        includeFooter,
        includeWatermark,
      });
    } catch (error) {
      console.error('Error en PDFDownloadButton:', error);
    }
  };

  const defaultSx = {
    bgcolor: isGenerating ? '#999' : 'rgb(21, 77, 113)',
    '&:hover': { bgcolor: isGenerating ? '#999' : 'rgb(16, 58, 85)' },
    borderRadius: '4px',
    minWidth: '160px',
    ...sx,
  };

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<PictureAsPdfIcon />}
      onClick={handleDownload}
      disabled={disabled || isGenerating}
      sx={defaultSx}
      {...props}
    >
      {children || (isGenerating ? 'Generando PDF...' : 'Descargar PDF')}
    </Button>
  );
};

export default PDFDownloadButton;
