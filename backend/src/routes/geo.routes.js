const express = require('express');
const geoController = require('../controllers/geo.controller');
const { requireAuth } = require('../security/authz');

const router = express.Router();

/**
 * Rutas para funcionalidades de geolocalización
 * Requieren autenticación para todas las operaciones
 */

// Geocodificación de direcciones
router.post('/geocode', requireAuth, geoController.geocodeAddress);

// Geocodificación inversa (coordenadas a dirección)
router.post('/reverse-geocode', requireAuth, geoController.reverseGeocode);

// Validar coordenadas
router.post(
  '/validate-coordinates',
  requireAuth,
  geoController.validateCoordinates
);

// Búsqueda por proximidad geográfica
router.post('/search-proximity', requireAuth, geoController.searchByProximity);

// Obtener datos para visualización en mapa
router.get('/map-data', requireAuth, geoController.getMapData);

// Estadísticas geoespaciales
router.get('/geo-stats', requireAuth, geoController.getGeoStatistics);

// Exportación para QGIS y otros SIG
router.get('/export-qgis', requireAuth, geoController.exportQGIS);

module.exports = router;
