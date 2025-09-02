const NodeGeocoder = require('node-geocoder');
const logger = require('../utils/logger');

// Configuración para múltiples proveedores de geocodificación
const geocoderOptions = {
  provider: 'openstreetmap', // Gratuito y sin límites estrictos
  httpAdapter: 'https',
  apiKey: process.env.GEOCODING_API_KEY || null,
  formatter: null,
  language: 'es',
  country: 'Argentina',
};

// Backup con Google Maps si está configurado
const googleOptions = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
  formatter: null,
  language: 'es',
  region: '.ar',
};

const geocoder = NodeGeocoder(geocoderOptions);
const googleGeocoder = process.env.GOOGLE_MAPS_API_KEY
  ? NodeGeocoder(googleOptions)
  : null;

/**
 * Geocodifica una dirección a coordenadas
 * @param {string} address - Dirección a geocodificar
 * @param {Object} context - Contexto adicional (ciudad, provincia)
 * @returns {Promise<Object>} - Resultado con coordenadas y datos adicionales
 */
const geocodeAddress = async (address, context = {}) => {
  if (!address || address.trim() === '') {
    throw new Error('Dirección requerida para geocodificación');
  }

  // Construir dirección completa con contexto
  let fullAddress = address.trim();

  // Agregar contexto geográfico para mejorar precisión
  if (context.localidad) {
    fullAddress += `, ${context.localidad}`;
  } else {
    fullAddress += ', Tucumán'; // Por defecto para la provincia
  }

  if (!fullAddress.includes('Argentina')) {
    fullAddress += ', Argentina';
  }

  try {
    logger.info(`Geocodificando dirección: ${fullAddress}`);

    // Intentar con OpenStreetMap primero
    let results = await geocoder.geocode(fullAddress);

    // Si no hay resultados y tenemos Google configurado, intentar con Google
    if ((!results || results.length === 0) && googleGeocoder) {
      logger.info('Intentando geocodificación con Google Maps...');
      results = await googleGeocoder.geocode(fullAddress);
    }

    if (!results || results.length === 0) {
      throw new Error(
        'No se pudieron obtener coordenadas para la dirección proporcionada'
      );
    }

    const result = results[0];

    // Validar que las coordenadas estén en Argentina (aproximadamente)
    const lat = parseFloat(result.latitude);
    const lng = parseFloat(result.longitude);

    if (lat < -55 || lat > -21 || lng < -73 || lng > -53) {
      logger.warn(`Coordenadas fuera de Argentina: ${lat}, ${lng}`);
    }

    const geocodingResult = {
      success: true,
      latitude: lat,
      longitude: lng,
      formatted_address: result.formattedAddress || fullAddress,
      street_name: result.streetName || null,
      street_number: result.streetNumber || null,
      city: result.city || context.localidad || null,
      state: result.state || 'Tucumán',
      zipcode: result.zipcode || context.codigo_postal || null,
      country: result.country || 'Argentina',
      neighborhood: result.extra?.neighborhood || null,
      confidence: result.extra?.confidence || null,
      provider: result.provider || geocoderOptions.provider,
    };

    logger.info(`Geocodificación exitosa: ${lat}, ${lng}`);
    return geocodingResult;
  } catch (error) {
    logger.error('Error en geocodificación:', error);
    throw new Error(`Error de geocodificación: ${error.message}`);
  }
};

/**
 * Geocodificación inversa: de coordenadas a dirección
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {Promise<Object>} - Dirección formateada
 */
const reverseGeocode = async (latitude, longitude) => {
  try {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Coordenadas inválidas');
    }

    logger.info(`Geocodificación inversa: ${lat}, ${lng}`);

    let results = await geocoder.reverse({ lat, lon: lng });

    // Intentar con Google si no hay resultados
    if ((!results || results.length === 0) && googleGeocoder) {
      results = await googleGeocoder.reverse({ lat, lon: lng });
    }

    if (!results || results.length === 0) {
      throw new Error('No se pudo obtener dirección para las coordenadas');
    }

    const result = results[0];

    return {
      success: true,
      formatted_address: result.formattedAddress,
      street_name: result.streetName,
      street_number: result.streetNumber,
      city: result.city,
      state: result.state,
      zipcode: result.zipcode,
      country: result.country,
      neighborhood: result.extra?.neighborhood,
    };
  } catch (error) {
    logger.error('Error en geocodificación inversa:', error);
    throw new Error(`Error de geocodificación inversa: ${error.message}`);
  }
};

/**
 * Valida que las coordenadas estén dentro de rangos válidos
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {Object} - Resultado de validación
 */
const validateCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  const errors = [];

  if (isNaN(lat) || lat < -90 || lat > 90) {
    errors.push('Latitud debe estar entre -90 y 90');
  }

  if (isNaN(lng) || lng < -180 || lng > 180) {
    errors.push('Longitud debe estar entre -180 y 180');
  }

  // Validar que esté aproximadamente en Argentina
  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
    if (lat < -55 || lat > -21 || lng < -73 || lng > -53) {
      errors.push('Las coordenadas parecen estar fuera de Argentina');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    coordinates: errors.length === 0 ? { latitude: lat, longitude: lng } : null,
  };
};

/**
 * Calcula la distancia entre dos puntos geográficos
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lng1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lng2 - Longitud del segundo punto
 * @returns {number} - Distancia en metros
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const geolib = require('geolib');

  try {
    const distance = geolib.getDistance(
      { latitude: lat1, longitude: lng1 },
      { latitude: lat2, longitude: lng2 }
    );
    return distance; // Retorna en metros
  } catch (error) {
    logger.error('Error calculando distancia:', error);
    return null;
  }
};

/**
 * Actualiza la geometría PostGIS basada en coordenadas
 * @param {Object} knex - Instancia de Knex
 * @param {string} table - Tabla a actualizar
 * @param {string} geomColumn - Columna de geometría
 * @param {string} latColumn - Columna de latitud
 * @param {string} lngColumn - Columna de longitud
 * @param {number} id - ID del registro
 */
const updatePostGISGeometry = async (
  knex,
  table,
  geomColumn,
  latColumn,
  lngColumn,
  id
) => {
  try {
    await knex.raw(
      `
      UPDATE ${table} 
      SET ${geomColumn} = ST_SetSRID(ST_MakePoint(${lngColumn}, ${latColumn}), 4326)
      WHERE id = ? AND ${latColumn} IS NOT NULL AND ${lngColumn} IS NOT NULL
    `,
      [id]
    );

    logger.info(`Geometría PostGIS actualizada para ${table} ID: ${id}`);
  } catch (error) {
    logger.error(`Error actualizando geometría PostGIS en ${table}:`, error);
    throw error;
  }
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  validateCoordinates,
  calculateDistance,
  updatePostGISGeometry,
};
