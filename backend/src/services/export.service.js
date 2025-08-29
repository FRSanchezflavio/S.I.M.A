const Excel = require('exceljs');

/**
 * Export utility service for generating CSV and XLSX files
 * Provides unified interface for data export functionality
 */
class ExportService {
  /**
   * Exports data as CSV format
   * @param {Object} res - Express response object
   * @param {Array} data - Data to export
   * @param {Array} columns - Column definitions
   * @param {string} filename - Output filename
   */
  static exportCSV(res, data, columns, filename = 'export.csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Add BOM for Excel compatibility
    res.write('\uFEFF');
    
    // Write headers
    const headers = columns.map(col => col.header || col.key);
    res.write(headers.join(';') + '\n');
    
    // Write data rows
    for (const row of data) {
      const line = columns
        .map(col => {
          const value = row[col.key] || '';
          // Clean the value for CSV format
          return String(value)
            .replace(/[\r\n]+/g, ' ')
            .replace(/;/g, ',');
        })
        .join(';');
      res.write(line + '\n');
    }
    
    res.end();
  }

  /**
   * Exports data as XLSX format
   * @param {Object} res - Express response object
   * @param {Array} data - Data to export
   * @param {Array} columns - Column definitions
   * @param {string} filename - Output filename
   * @param {string} worksheetName - Worksheet name
   */
  static async exportXLSX(res, data, columns, filename = 'export.xlsx', worksheetName = 'Data') {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(worksheetName);
    
    // Set up columns
    worksheet.columns = columns;
    
    // Add data
    worksheet.addRows(data);
    
    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      if (column.width < 10) {
        column.width = 10;
      }
    });
    
    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Gets column definitions for registros export
   * @returns {Array} - Column definitions
   */
  static getRegistrosColumns() {
    return [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Persona ID', key: 'persona_id', width: 12 },
      { header: 'Tipo de delito', key: 'tipo_delito', width: 25 },
      { header: 'Lugar', key: 'lugar', width: 20 },
      { header: 'Estado', key: 'estado', width: 18 },
      { header: 'Juzgado', key: 'juzgado', width: 20 },
      { header: 'Detalle', key: 'detalle', width: 40 },
      { header: 'Creado', key: 'created_at', width: 20 },
    ];
  }

  /**
   * Gets column definitions for personas export
   * @returns {Array} - Column definitions
   */
  static getPersonasColumns() {
    return [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'DNI', key: 'dni', width: 12 },
      { header: 'Fecha Nacimiento', key: 'fecha_nacimiento', width: 18 },
      { header: 'Nacionalidad', key: 'nacionalidad', width: 15 },
      { header: 'Dirección', key: 'direccion', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Comisaría', key: 'comisaria', width: 20 },
      { header: 'Observaciones', key: 'observaciones', width: 30 },
    ];
  }

  /**
   * Determines if request is for export based on format parameter
   * @param {string} format - Format parameter from query
   * @returns {boolean} - True if export request
   */
  static isExportRequest(format) {
    return format === 'csv' || format === 'xlsx';
  }

  /**
   * Handles export request by format type
   * @param {Object} res - Express response object
   * @param {string} format - Export format (csv/xlsx)
   * @param {Array} data - Data to export
   * @param {Array} columns - Column definitions
   * @param {string} baseFilename - Base filename without extension
   * @param {string} worksheetName - Worksheet name for XLSX
   */
  static async handleExport(res, format, data, columns, baseFilename, worksheetName = 'Data') {
    if (format === 'csv') {
      this.exportCSV(res, data, columns, `${baseFilename}.csv`);
    } else if (format === 'xlsx') {
      await this.exportXLSX(res, data, columns, `${baseFilename}.xlsx`, worksheetName);
    }
  }
}

module.exports = ExportService;