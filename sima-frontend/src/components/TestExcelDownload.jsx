import React from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';

const TestExcelDownload = () => {
  const testDownload = () => {
    // Datos de prueba simulando estructura de PersonaDetalle
    const datosPersonales = {
      ID: '123',
      Apellido: 'García',
      Nombre: 'Juan Carlos',
      DNI: '12345678',
      'Fecha de Nacimiento': '1990-05-15',
      Edad: '33',
      Género: 'Masculino',
      Nacionalidad: 'Argentina',
      Dirección: 'Av. Siempre Viva 123',
      Teléfono: '+54 9 11 1234-5678',
      Email: 'juan.garcia@email.com',
      Comisaría: 'Comisaría 1ra',
      'Comisaría del Hecho': 'Comisaría 2da',
      Observaciones: 'Sin observaciones particulares',
    };

    const registrosData = [
      {
        ID: '1',
        'Tipo de Delito': 'Hurto',
        Descripción: 'Hurto de vehículo',
        'Fecha del Hecho': '2024-01-15',
        'Lugar del Hecho': 'Calle Falsa 123',
        Comisaría: 'Comisaría 1ra',
        'Número de Expediente': 'EXP-2024-001',
        Estado: 'En proceso',
        Observaciones: 'Caso en investigación',
      },
    ];

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();

    // Hoja de datos personales
    const datosPersonalesArray = Object.entries(datosPersonales).map(
      ([key, value]) => [key, value]
    );
    const wsPersonales = XLSX.utils.aoa_to_sheet([
      ['Campo', 'Valor'],
      ...datosPersonalesArray,
    ]);
    wsPersonales['!cols'] = [{ width: 25 }, { width: 40 }];
    XLSX.utils.book_append_sheet(workbook, wsPersonales, 'Datos Personales');

    // Hoja de registros
    const wsRegistros = XLSX.utils.json_to_sheet(registrosData);
    wsRegistros['!cols'] = [
      { width: 10 },
      { width: 20 },
      { width: 30 },
      { width: 15 },
      { width: 25 },
      { width: 20 },
      { width: 20 },
      { width: 15 },
      { width: 30 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsRegistros, 'Registros');

    // Descargar
    const fechaHora = new Date()
      .toLocaleString('es-AR')
      .replace(/[/:]/g, '-')
      .replace(/,/g, '');
    const nombreArchivo = `SIMA_Test_${fechaHora}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);
  };

  return (
    <Button
      variant="contained"
      startIcon={<DownloadIcon />}
      onClick={testDownload}
      sx={{
        bgcolor: 'rgb(21, 77, 113)',
        '&:hover': { bgcolor: 'rgb(16, 58, 85)' },
        borderRadius: '4px',
        margin: '20px',
      }}
    >
      Test Descarga Excel
    </Button>
  );
};

export default TestExcelDownload;
