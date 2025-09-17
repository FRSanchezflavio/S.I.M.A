/**
 * Configuración de Grid para S.I.M.A.
 * Incluye backup del código original y feature flags
 */

// Backup del código original para rollback inmediato
export const ORIGINAL_GRID_CONFIG = {
  height: '700px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 2fr))',
  gap: 2,
};

// Feature flag para activar/desactivar nuevo layout
export const USE_NEW_GRID_LAYOUT = process.env.REACT_APP_NEW_GRID !== 'false';

// Configuración mejorada para operaciones policiales
export const IMPROVED_GRID_CONFIG = {
  mt: 2,
  display: 'grid',
  // Altura automática responsive para operaciones policiales
  minHeight: '400px', // Altura mínima para UX consistente
  height: 'auto', // Altura automática basada en contenido
  maxHeight: {
    // Máxima altura responsive por dispositivo
    xs: 'calc(100vh - 300px)', // Móvil: más espacio vertical para patrullaje
    sm: 'calc(100vh - 350px)', // Tablet: balance óptimo
    md: 'calc(100vh - 400px)', // Desktop: altura controlada para comisarías
    lg: 'calc(100vh - 400px)', // Desktop grande: consistencia
    xl: 'calc(100vh - 450px)', // Pantallas muy grandes
  },
  overflowY: 'auto', // Scroll vertical cuando necesario
  overflowX: 'hidden', // Prevenir scroll horizontal
  gridTemplateColumns: {
    // Grid responsive mejorado
    xs: '1fr', // Móvil: 1 columna para patrullaje
    sm: 'repeat(auto-fill, minmax(300px, 1fr))', // Tablet: flexible
    md: 'repeat(auto-fill, minmax(350px, 1fr))', // Desktop: original optimizado
    lg: 'repeat(auto-fill, minmax(350px, 1fr))', // Consistencia
  },
  gap: 2,
  pr: 1, // Espacio para scrollbar
  // Transición suave para cambios de altura
  transition: 'all 0.3s ease-in-out',
  // Estilos de scrollbar personalizados para S.I.M.A.
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
  // Indicador visual cuando hay scroll disponible
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background:
      'linear-gradient(90deg, transparent, rgba(21, 77, 113, 0.3), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  },
  '&[data-has-scroll="true"]::after': {
    opacity: 1,
  },
};

// KPIs Críticos para S.I.M.A.
export const GRID_PERFORMANCE_TARGETS = {
  TIEMPO_IDENTIFICACION: 30000, // 30 segundos
  RESULTADOS_VISIBLES_MIN: 12, // 12+ resultados sin scroll en 1366x768
  CLICKS_ADICIONALES: 0, // 0 clicks adicionales para contenido
  LIGHTHOUSE_SCORE_MIN: 90, // Performance score mínimo
};

export default {
  ORIGINAL_GRID_CONFIG,
  USE_NEW_GRID_LAYOUT,
  IMPROVED_GRID_CONFIG,
  GRID_PERFORMANCE_TARGETS,
};
