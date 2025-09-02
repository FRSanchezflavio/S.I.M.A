const geocodingService = require('../services/geocoding');
const geoDataService = require('../services/geoData');
const logger = require('../utils/logger');
const db = require('../db/knex');

/**
 * Controlador para funcionalidades de geolocalización
 */

/**
 * Geocodificar una dirección
 * POST /api/geocode
 */
const geocodeAddress = async (req, res, next) => {
  try {
    const { direccion, localidad, codigo_postal } = req.body;

    if (!direccion || direccion.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Dirección es requerida',
      });
    }

    const context = {
      localidad: localidad || null,
      codigo_postal: codigo_postal || null,
    };

    const result = await geocodingService.geocodeAddress(direccion, context);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error en geocodificación:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error en el servicio de geocodificación',
    });
  }
};

/**
 * Geocodificación inversa (coordenadas a dirección)
 * POST /api/reverse-geocode
 */
const reverseGeocode = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    const validation = geocodingService.validateCoordinates(
      latitude,
      longitude
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Coordenadas inválidas',
        errors: validation.errors,
      });
    }

    const result = await geocodingService.reverseGeocode(latitude, longitude);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error en geocodificación inversa:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error en geocodificación inversa',
    });
  }
};

/**
 * Obtener datos geoespaciales para el mapa
 * GET /api/map-data
 */
const getMapData = async (req, res, next) => {
  try {
    const filters = {
      tipo_delito: req.query.tipo_delito,
      modalidad: req.query.modalidad,
      comisaria: req.query.comisaria,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      cerca_lat: req.query.cerca_lat ? parseFloat(req.query.cerca_lat) : null,
      cerca_lng: req.query.cerca_lng ? parseFloat(req.query.cerca_lng) : null,
      radio: req.query.radio ? parseFloat(req.query.radio) : null, // en km
      incluir_personas: req.query.incluir_personas !== 'false',
      incluir_registros: req.query.incluir_registros !== 'false',
    };

    const data = {};

    // Obtener datos de personas si se solicita
    if (filters.incluir_personas) {
      data.personas = await geoDataService.getPersonasGeoData(db, filters);
    }

    // Obtener datos de registros si se solicita
    if (filters.incluir_registros) {
      data.registros = await geoDataService.getRegistrosGeoData(db, filters);
    }

    // Convertir a GeoJSON si se solicita
    if (req.query.format === 'geojson') {
      const geoJSON = geoDataService.convertToGeoJSON(
        data.personas,
        data.registros
      );
      return res.json(geoJSON);
    }

    res.json({
      success: true,
      data,
      total_personas: data.personas ? data.personas.length : 0,
      total_registros: data.registros ? data.registros.length : 0,
    });
  } catch (error) {
    logger.error('Error obteniendo datos del mapa:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo datos geoespaciales',
    });
  }
};

/**
 * Exportar datos a formato QGIS
 * GET /api/export-qgis
 */
const exportQGIS = async (req, res, next) => {
  try {
    const format = req.query.format || 'geojson'; // 'geojson' o 'shapefile'
    const filename = req.query.filename || 'sima_export';

    const filters = {
      tipo_delito: req.query.tipo_delito,
      modalidad: req.query.modalidad,
      comisaria: req.query.comisaria,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      cerca_lat: req.query.cerca_lat ? parseFloat(req.query.cerca_lat) : null,
      cerca_lng: req.query.cerca_lng ? parseFloat(req.query.cerca_lng) : null,
      radio: req.query.radio ? parseFloat(req.query.radio) : null,
    };

    // Obtener todos los datos
    const personas = await geoDataService.getPersonasGeoData(db, filters);
    const registros = await geoDataService.getRegistrosGeoData(db, filters);

    const geoJSON = geoDataService.convertToGeoJSON(personas, registros);

    if (format === 'geojson') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}.geojson"`
      );
      return res.json(geoJSON);
    }

    if (format === 'shapefile') {
      const zipBuffer = await geoDataService.generateShapefile(
        geoJSON,
        filename
      );

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}_shapefile.zip"`
      );
      return res.send(zipBuffer);
    }

    res.status(400).json({
      success: false,
      message: 'Formato no soportado. Use: geojson, shapefile',
    });
  } catch (error) {
    logger.error('Error exportando para QGIS:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando exportación para QGIS',
    });
  }
};

/**
 * Obtener estadísticas geoespaciales
 * GET /api/geo-stats
 */
const getGeoStatistics = async (req, res, next) => {
  try {
    const stats = await geoDataService.getGeoStatistics(db);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error obteniendo estadísticas geoespaciales:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas geoespaciales',
    });
  }
};

/**
 * Validar coordenadas
 * POST /api/validate-coordinates
 */
const validateCoordinates = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    const validation = geocodingService.validateCoordinates(
      latitude,
      longitude
    );

    res.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    logger.error('Error validando coordenadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando coordenadas',
    });
  }
};

/**
 * Buscar por proximidad geográfica
 * POST /api/search-proximity
 */
const searchByProximity = async (req, res, next) => {
  try {
    const {
      latitude,
      longitude,
      radio = 1, // km
      tipo = 'ambos', // 'personas', 'registros', 'ambos'
    } = req.body;

    const validation = geocodingService.validateCoordinates(
      latitude,
      longitude
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Coordenadas inválidas',
        errors: validation.errors,
      });
    }

    const filters = {
      cerca_lat: parseFloat(latitude),
      cerca_lng: parseFloat(longitude),
      radio: parseFloat(radio),
    };

    const results = {};

    if (tipo === 'personas' || tipo === 'ambos') {
      results.personas = await geoDataService.getPersonasGeoData(db, filters);
    }

    if (tipo === 'registros' || tipo === 'ambos') {
      results.registros = await geoDataService.getRegistrosGeoData(db, filters);
    }

    // Calcular distancias exactas
    const centerLat = parseFloat(latitude);
    const centerLng = parseFloat(longitude);

    if (results.personas) {
      results.personas = results.personas
        .map(persona => ({
          ...persona,
          distancia_metros: geocodingService.calculateDistance(
            centerLat,
            centerLng,
            parseFloat(persona.domicilio_latitud),
            parseFloat(persona.domicilio_longitud)
          ),
        }))
        .sort((a, b) => (a.distancia_metros || 0) - (b.distancia_metros || 0));
    }

    if (results.registros) {
      results.registros = results.registros
        .map(registro => ({
          ...registro,
          distancia_metros: geocodingService.calculateDistance(
            centerLat,
            centerLng,
            parseFloat(registro.hecho_latitud),
            parseFloat(registro.hecho_longitud)
          ),
        }))
        .sort((a, b) => (a.distancia_metros || 0) - (b.distancia_metros || 0));
    }

    res.json({
      success: true,
      data: results,
      search_params: {
        centro: { latitude: centerLat, longitude: centerLng },
        radio_km: parseFloat(radio),
        tipo_busqueda: tipo,
      },
      total_personas: results.personas ? results.personas.length : 0,
      total_registros: results.registros ? results.registros.length : 0,
    });
  } catch (error) {
    logger.error('Error en búsqueda por proximidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error en búsqueda por proximidad geográfica',
    });
  }
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  getMapData,
  exportQGIS,
  getGeoStatistics,
  validateCoordinates,
  searchByProximity,
};
