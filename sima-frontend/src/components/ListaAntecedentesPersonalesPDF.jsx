import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
} from '@mui/material';

import {
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  PhotoCamera as PhotoCameraIcon,
  CalendarToday as DateIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';

/**
 * Componente especializado para generar PDFs de antecedentes personales
 * Optimizado para html2canvas y librerías de generación PDF
 * Evita problemas de layout, superposición y elementos cortados
 */
export default function ListaAntecedentesPersonalesPDF({
  delitos,
  isPDFMode = true,
}) {
  /**
   * Obtener icono del tipo de delito sin problemas de renderizado PDF
   */
  const getTipoIcon = tipo => {
    const iconMap = {
      robo: '🔓',
      hurto: '👜',
      lesiones: '🩹',
      amenazas: '⚠️',
      estafa: '💰',
      daños: '🔨',
      violencia_domestica: '🏠',
      trafico_drogas: '💊',
    };
    return iconMap[tipo] || '📋';
  };

  /**
   * Formatear fecha con fallback seguro
   */
  const formatFecha = fecha => {
    if (!fecha) return 'Sin fecha';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Estado vacío optimizado para PDF
  if (!delitos || delitos.length === 0) {
    return (
      <div className="antecedentes-pdf-container">
        <div className="pdf-header-policial">
          <h2>📋 ANTECEDENTES PERSONALES</h2>
          <p>Historial específico de delitos registrados</p>
        </div>
        <div className="pdf-empty-state">
          <p>No hay antecedentes personales registrados</p>
          <p>
            Los antecedentes personales permiten un seguimiento detallado del
            historial específico del sujeto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="antecedentes-pdf-container">
      {/* Header policial optimizado para PDF */}
      <div className="pdf-header-policial">
        <h2>📋 ANTECEDENTES PERSONALES ({delitos.length})</h2>
        <p>Historial específico de delitos registrados</p>
      </div>

      {/* Container de cards optimizado para PDF */}
      <div className="pdf-cards-container">
        {delitos.map((delito, index) => (
          <div key={delito.id || index} className="antecedente-card-pdf">
            {/* Header del delito con estilo policial fijo */}
            <div className="pdf-card-header">
              <div className="pdf-tipo-container">
                <div className="pdf-tipo-icon">{getTipoIcon(delito.tipo)}</div>
                <div className="pdf-tipo-info">
                  <h3 className="pdf-tipo-titulo">
                    {delito.tipo.charAt(0).toUpperCase() +
                      delito.tipo.slice(1).replace('_', ' ')}
                  </h3>
                  {delito.modalidad && (
                    <p className="pdf-modalidad">
                      {delito.modalidad.charAt(0).toUpperCase() +
                        delito.modalidad.slice(1).replace('_', ' ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Chips de información - layout horizontal fijo */}
              <div className="pdf-chips-container">
                <span className="pdf-evidence-chip pdf-chip-fecha">
                  📅 {formatFecha(delito.fecha_hecho)}
                </span>
                {delito.comisaria_hecho && (
                  <span className="pdf-evidence-chip pdf-chip-comisaria">
                    📍 {delito.comisaria_hecho}
                  </span>
                )}
                {delito.fotos?.length > 0 && (
                  <span className="pdf-evidence-chip pdf-chip-evidencias">
                    📷 {delito.fotos.length} evidencia
                    {delito.fotos.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Descripción principal */}
            <div className="pdf-descripcion-container">
              <h4>Descripción del Hecho:</h4>
              <p>{delito.descripcion}</p>
            </div>

            {/* Información detallada */}
            <div className="pdf-detalles-container">
              {delito.lugar && (
                <div className="pdf-detalle-item">
                  <span className="pdf-detalle-label">📍 Lugar:</span>
                  <span className="pdf-detalle-valor">{delito.lugar}</span>
                </div>
              )}

              {delito.fecha_carga && (
                <div className="pdf-detalle-item">
                  <span className="pdf-detalle-label">⏰ Fecha de carga:</span>
                  <span className="pdf-detalle-valor">
                    {formatFecha(delito.fecha_carga)}
                  </span>
                </div>
              )}

              {delito.observaciones && (
                <div className="pdf-detalle-item pdf-observaciones">
                  <span className="pdf-detalle-label">📝 Observaciones:</span>
                  <span className="pdf-detalle-valor">
                    {delito.observaciones}
                  </span>
                </div>
              )}
            </div>

            {/* Galería de evidencias simplificada para PDF */}
            {delito.fotos?.length > 0 && (
              <div className="pdf-evidencias-container">
                <h4>🔍 Evidencias ({delito.fotos.length}):</h4>
                <div className="pdf-fotos-grid">
                  {delito.fotos.slice(0, 6).map((foto, fotoIndex) => (
                    <div key={fotoIndex} className="pdf-foto-item">
                      <img
                        src={foto}
                        alt={`Evidencia ${fotoIndex + 1}`}
                        className="pdf-foto-img"
                        onError={e => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                  {delito.fotos.length > 6 && (
                    <div className="pdf-foto-item pdf-foto-mas">
                      +{delito.fotos.length - 6} más
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Separador entre cards */}
            {index < delitos.length - 1 && (
              <div className="pdf-card-separator"></div>
            )}
          </div>
        ))}
      </div>

      {/* Footer informativo */}
      <div className="pdf-footer-info">
        <p>
          Documento generado el {new Date().toLocaleString('es-AR')} - S.I.M.A.
          Sistema de Información Policial
        </p>
        <p>CONFIDENCIAL - Uso interno institucional</p>
      </div>

      {/* Estilos CSS embebidos optimizados para PDF */}
      <style jsx>{`
        /* =================================================================
           ESTILOS OPTIMIZADOS PARA GENERACIÓN PDF - S.I.M.A.
           Evita flexbox, grid, transforms y positioning problemático
           ================================================================= */

        .antecedentes-pdf-container {
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
          padding: 10mm;
          font-family: Arial, 'Helvetica Neue', sans-serif;
          background-color: #ffffff;
          color: #333333;
          line-height: 1.4;
          box-sizing: border-box;
        }

        /* Header policial */
        .pdf-header-policial {
          text-align: center;
          margin-bottom: 20px;
          padding: 15px;
          background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
          color: white;
          border-radius: 8px;
          page-break-inside: avoid;
        }

        .pdf-header-policial h2 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .pdf-header-policial p {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
        }

        /* Container de cards */
        .pdf-cards-container {
          width: 100%;
        }

        /* Card individual optimizada para PDF */
        .antecedente-card-pdf {
          width: 100%;
          margin-bottom: 20px;
          padding: 15px;
          border: 2px solid #e2e8f0;
          border-left: 6px solid #2c5282;
          border-radius: 8px;
          background-color: #fafafa;
          page-break-inside: avoid;
          box-sizing: border-box;
        }

        /* Header del card */
        .pdf-card-header {
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e2e8f0;
        }

        .pdf-tipo-container {
          margin-bottom: 10px;
        }

        .pdf-tipo-icon {
          display: inline-block;
          width: 35px;
          height: 35px;
          background-color: #1a365d;
          color: white;
          text-align: center;
          line-height: 35px;
          border-radius: 50%;
          font-size: 18px;
          margin-right: 10px;
          vertical-align: top;
        }

        .pdf-tipo-info {
          display: inline-block;
          vertical-align: top;
          width: calc(100% - 50px);
        }

        .pdf-tipo-titulo {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: bold;
          color: #1a365d;
          text-transform: uppercase;
        }

        .pdf-modalidad {
          margin: 0;
          font-size: 12px;
          color: #666;
          font-style: italic;
        }

        /* Chips de información - layout simple horizontal */
        .pdf-chips-container {
          margin-top: 10px;
        }

        .pdf-evidence-chip {
          display: inline-block;
          margin: 2px 8px 2px 0;
          padding: 4px 8px;
          background-color: #e2e8f0;
          border: 1px solid #cbd5e0;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          color: #1a365d;
        }

        .pdf-chip-fecha {
          background-color: #bee3f8;
          border-color: #63b3ed;
        }

        .pdf-chip-comisaria {
          background-color: #c6f6d5;
          border-color: #68d391;
        }

        .pdf-chip-evidencias {
          background-color: #fed7d7;
          border-color: #fc8181;
        }

        /* Descripción */
        .pdf-descripcion-container {
          margin-bottom: 15px;
          padding: 10px;
          background-color: #f7fafc;
          border-radius: 4px;
        }

        .pdf-descripcion-container h4 {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #1a365d;
          font-weight: bold;
        }

        .pdf-descripcion-container p {
          margin: 0;
          font-size: 12px;
          line-height: 1.5;
        }

        /* Detalles */
        .pdf-detalles-container {
          margin-bottom: 15px;
        }

        .pdf-detalle-item {
          margin-bottom: 6px;
          font-size: 11px;
        }

        .pdf-detalle-label {
          font-weight: bold;
          color: #1a365d;
          margin-right: 8px;
        }

        .pdf-detalle-valor {
          color: #4a5568;
        }

        .pdf-observaciones {
          margin-top: 10px;
          padding: 8px;
          background-color: #f0fff4;
          border-left: 3px solid #38a169;
        }

        /* Evidencias optimizadas para PDF */
        .pdf-evidencias-container {
          margin-top: 15px;
        }

        .pdf-evidencias-container h4 {
          margin: 0 0 10px 0;
          font-size: 13px;
          color: #1a365d;
          font-weight: bold;
        }

        .pdf-fotos-grid {
          width: 100%;
        }

        .pdf-foto-item {
          display: inline-block;
          width: 60px;
          height: 60px;
          margin: 0 8px 8px 0;
          border: 2px solid #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          vertical-align: top;
        }

        .pdf-foto-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pdf-foto-mas {
          background-color: #f7fafc;
          border: 2px dashed #cbd5e0;
          text-align: center;
          line-height: 56px;
          font-size: 10px;
          color: #4a5568;
          font-weight: bold;
        }

        /* Separador entre cards */
        .pdf-card-separator {
          width: 100%;
          height: 1px;
          background-color: #e2e8f0;
          margin: 15px 0;
        }

        /* Footer */
        .pdf-footer-info {
          margin-top: 30px;
          padding: 15px;
          text-align: center;
          border-top: 2px solid #e2e8f0;
          font-size: 10px;
          color: #666;
        }

        .pdf-footer-info p {
          margin: 4px 0;
        }

        /* Estado vacío */
        .pdf-empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .pdf-empty-state p {
          margin: 10px 0;
          font-size: 12px;
          line-height: 1.5;
        }

        /* Media query para impresión */
        @media print {
          .antecedentes-pdf-container {
            margin: 0;
            padding: 15mm;
            box-shadow: none;
          }

          .antecedente-card-pdf {
            page-break-inside: avoid;
            margin-bottom: 15mm;
          }

          .pdf-header-policial {
            page-break-after: avoid;
          }

          .pdf-foto-item {
            width: 50px;
            height: 50px;
          }
        }

        /* Optimizaciones específicas para html2canvas */
        @media screen {
          .antecedentes-pdf-container * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }

          .pdf-header-policial {
            background: #1a365d !important;
          }

          .pdf-evidence-chip {
            box-shadow: none;
            transform: none;
          }

          .antecedente-card-pdf {
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
