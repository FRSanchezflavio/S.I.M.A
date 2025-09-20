const express = require('express');
const router = express.Router();
const vinculacionesController = require('../controllers/vinculaciones.controller');
const { requireAuth } = require('../security/authz');

// ==================== RUTAS DE VINCULACIONES CRIMINALES ====================

// Listar vinculaciones con filtros
router.get('/vinculaciones', requireAuth, vinculacionesController.list);

// Crear nueva vinculación
router.post('/vinculaciones', requireAuth, vinculacionesController.create);

// Obtener vinculación específica
router.get('/vinculaciones/:id', requireAuth, vinculacionesController.get);

// Actualizar vinculación
router.put('/vinculaciones/:id', requireAuth, vinculacionesController.update);

// Eliminar vinculación
router.delete(
  '/vinculaciones/:id',
  requireAuth,
  vinculacionesController.remove
);

// ==================== ANÁLISIS DE REDES Y PATRONES ====================

// Análisis de red para una persona específica
router.get(
  '/vinculaciones/analisis/red/:personaId',
  requireAuth,
  vinculacionesController.networkAnalysis
);

// Análisis de patrones de comunicación
router.post(
  '/vinculaciones/analisis/comunicacion',
  requireAuth,
  vinculacionesController.communicationPatterns
);

// Detección automática de redes criminales
router.get(
  '/vinculaciones/deteccion/redes',
  requireAuth,
  vinculacionesController.detectCriminalNetworks
);

// ==================== DASHBOARD Y ESTADÍSTICAS ====================

// Estadísticas para dashboard principal
router.get(
  '/vinculaciones/dashboard/stats',
  requireAuth,
  vinculacionesController.dashboardStats
);

// Detección avanzada de redes con análisis completo
router.get(
  '/vinculaciones/deteccion/redes/avanzado',
  requireAuth,
  vinculacionesController.detectCriminalNetworksAdvanced
);

// Tendencias y análisis temporal
router.get(
  '/vinculaciones/analisis/tendencias',
  requireAuth,
  vinculacionesController.trendAnalysis ||
    vinculacionesController.dashboardStats
);

// Alertas y notificaciones del sistema
router.get(
  '/vinculaciones/alertas/sistema',
  requireAuth,
  vinculacionesController.systemAlerts || vinculacionesController.dashboardStats
);

module.exports = router;
