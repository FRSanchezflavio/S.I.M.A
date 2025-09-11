import React, { useState } from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PDFTestComponent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const testPDFGeneration = async () => {
    try {
      setIsGenerating(true);
      setMessage('Iniciando generación de PDF...');

      // Buscar el elemento de prueba
      const element = document.getElementById('test-content');
      if (!element) {
        throw new Error('Elemento de prueba no encontrado');
      }

      setMessage('Capturando contenido con html2canvas...');

      // Capturar con html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: true,
        width: 800,
        height: 600,
      });

      setMessage('Creando PDF con jsPDF...');

      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);

      setMessage('Descargando PDF...');
      pdf.save('test-sima.pdf');

      setMessage('✅ PDF generado exitosamente!');
    } catch (error) {
      console.error('Error en test PDF:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Test de Generación PDF - S.I.M.A
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={testPDFGeneration}
          disabled={isGenerating}
          sx={{
            bgcolor: 'rgb(21, 77, 113)',
            '&:hover': { bgcolor: 'rgb(16, 58, 85)' },
          }}
        >
          {isGenerating ? 'Generando...' : 'Test PDF'}
        </Button>
      </Box>

      {message && (
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            color: message.includes('❌') ? 'error.main' : 'success.main',
          }}
        >
          {message}
        </Typography>
      )}

      <Box
        id="test-content"
        sx={{
          border: '2px solid rgb(21, 77, 113)',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#ffffff',
          minHeight: '400px',
        }}
      >
        <Typography variant="h5" sx={{ color: 'rgb(21, 77, 113)', mb: 2 }}>
          S.I.M.A - SISTEMA DE INFORMACIÓN POLICIAL
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Datos de Prueba de Persona
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography>
              <strong>Apellido:</strong> García
            </Typography>
            <Typography>
              <strong>Nombre:</strong> Juan Carlos
            </Typography>
            <Typography>
              <strong>DNI:</strong> 12.345.678
            </Typography>
            <Typography>
              <strong>Fecha Nac.:</strong> 15/05/1990
            </Typography>
          </Box>
          <Box>
            <Typography>
              <strong>Nacionalidad:</strong> Argentina
            </Typography>
            <Typography>
              <strong>Dirección:</strong> Av. Siempre Viva 123
            </Typography>
            <Typography>
              <strong>Teléfono:</strong> +54 9 11 1234-5678
            </Typography>
            <Typography>
              <strong>Comisaría:</strong> 1ra Comisaría
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Antecedentes
        </Typography>

        <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
          <Typography>
            <strong>Tipo:</strong> Hurto
          </Typography>
          <Typography>
            <strong>Fecha:</strong> 01/09/2025
          </Typography>
          <Typography>
            <strong>Lugar:</strong> Centro de la ciudad
          </Typography>
          <Typography>
            <strong>Estado:</strong> En investigación
          </Typography>
        </Box>

        <Box
          sx={{ mt: 3, textAlign: 'center', fontSize: '10px', color: '#666' }}
        >
          <Typography>CONFIDENCIAL - USO INTERNO - S.I.M.A</Typography>
          <Typography>{new Date().toLocaleString('es-AR')}</Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default PDFTestComponent;
