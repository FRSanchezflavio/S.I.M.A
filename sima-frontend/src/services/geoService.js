import api from './api';

/**
 * Servicio de geolocalización para el frontend con caché y mejores errores
 */

// Caché simple para geocodificación
const geocodeCache = new Map();
const reverseGeocodeCache = new Map();

/**
 * Geocodifica una dirección a coordenadas
 * @param {string} direccion - Dirección a geocodificar
 * @param {Object} context - Contexto adicional (localidad, código postal)
 * @returns {Promise<Object>} - Resultado con coordenadas
 */
export const geocodeAddress = async (direccion, context = {}) => {
  const cacheKey = `${direccion}_${JSON.stringify(context)}`;

  // Verificar caché
  if (geocodeCache.has(cacheKey)) {
    console.log('Usando caché para geocodificación:', direccion);
    return geocodeCache.get(cacheKey);
  }

  try {
    console.log('Geocodificando dirección:', direccion, context);
    const response = await api.post(
      '/geo/geocode',
      {
        direccion,
        ...context,
      },
      {
        headers: {
          'x-toast-suppress': '1', // Suprimir toast automático para manejar errores localmente
        },
      }
    );

    // Guardar en caché
    geocodeCache.set(cacheKey, response.data);

    return response.data;
  } catch (error) {
    console.error('Error en geocodificación:', error);

    // Diferentes mensajes según el tipo de error
    if (error.response?.status === 404) {
      throw new Error('Dirección no encontrada');
    } else if (error.response?.status === 429) {
      throw new Error('Demasiadas consultas. Intente en un momento.');
    } else if (error.response?.status >= 500) {
      throw new Error('Error del servidor de geocodificación');
    } else {
      throw new Error(
        error.response?.data?.message || 'Error en geocodificación'
      );
    }
  }
};

/**
 * Geocodificación inversa (coordenadas a dirección) - MEJORADA
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {Promise<Object>} - Dirección formateada
 */
export const reverseGeocode = async (latitude, longitude) => {
  const cacheKey = `${latitude.toFixed(6)}_${longitude.toFixed(6)}`;

  // Verificar caché
  if (reverseGeocodeCache.has(cacheKey)) {
    console.log(
      'Usando caché para geocodificación inversa:',
      latitude,
      longitude
    );
    return reverseGeocodeCache.get(cacheKey);
  }

  try {
    console.log('Geocodificación inversa:', latitude, longitude);
    const response = await api.post(
      '/geo/reverse-geocode',
      {
        latitude,
        longitude,
      },
      {
        headers: {
          'x-toast-suppress': '1',
        },
      }
    );

    // Guardar en caché
    reverseGeocodeCache.set(cacheKey, response.data);

    return response.data;
  } catch (error) {
    console.error('Error en geocodificación inversa:', error);

    if (error.response?.status === 404) {
      throw new Error('Ubicación no encontrada');
    } else if (error.response?.status >= 500) {
      throw new Error('Error del servidor de geocodificación');
    } else {
      throw new Error(
        error.response?.data?.message || 'Error en geocodificación inversa'
      );
    }
  }
};

/**
 * Valida coordenadas
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {Promise<Object>} - Resultado de validación
 */
export const validateCoordinates = async (latitude, longitude) => {
  try {
    const response = await api.post('/geo/validate-coordinates', {
      latitude,
      longitude,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error validando coordenadas'
    );
  }
};

/**
 * Obtiene datos geoespaciales para el mapa
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} - Datos geoespaciales
 */
export const getMapData = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    const response = await api.get(`/geo/map-data?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error obteniendo datos del mapa'
    );
  }
};

/**
 * Exporta datos a formato QGIS
 * @param {string} format - Formato de exportación ('geojson' o 'shapefile')
 * @param {Object} filters - Filtros de exportación
 * @param {string} filename - Nombre del archivo
 * @returns {Promise<Blob>} - Archivo para descarga
 */
export const exportQGIS = async (
  format = 'geojson',
  filters = {},
  filename = 'sima_export'
) => {
  try {
    const params = new URLSearchParams();
    params.append('format', format);
    params.append('filename', filename);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    const response = await api.get(`/geo/export-qgis?${params.toString()}`, {
      responseType: 'blob',
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error exportando datos para QGIS'
    );
  }
};

/**
 * Obtiene estadísticas geoespaciales
 * @returns {Promise<Object>} - Estadísticas
 */
export const getGeoStatistics = async () => {
  try {
    const response = await api.get('/geo/geo-stats');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Error obteniendo estadísticas geoespaciales'
    );
  }
};

/**
 * Búsqueda por proximidad geográfica
 * @param {number} latitude - Latitud del centro
 * @param {number} longitude - Longitud del centro
 * @param {number} radio - Radio de búsqueda en km
 * @param {string} tipo - Tipo de búsqueda ('personas', 'registros', 'ambos')
 * @returns {Promise<Object>} - Resultados de la búsqueda
 */
export const searchByProximity = async (
  latitude,
  longitude,
  radio = 1,
  tipo = 'ambos'
) => {
  try {
    const response = await api.post('/geo/search-proximity', {
      latitude,
      longitude,
      radio,
      tipo,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error en búsqueda por proximidad'
    );
  }
};

/**
 * Obtiene la ubicación actual del navegador
 * @returns {Promise<Object>} - Coordenadas actuales
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada por el navegador'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutos de cache
    };

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      error => {
        let message = 'Error obteniendo ubicación';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Acceso a ubicación denegado por el usuario';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            message = 'Tiempo agotado obteniendo ubicación';
            break;
        }

        reject(new Error(message));
      },
      options
    );
  });
};

/**
 * Calcula la distancia entre dos puntos en metros
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lng1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lng2 - Longitud punto 2
 * @returns {number} - Distancia en metros
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Formatea una distancia para mostrar
 * @param {number} distanceMeters - Distancia en metros
 * @returns {string} - Distancia formateada
 */
export const formatDistance = distanceMeters => {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }
  return `${(distanceMeters / 1000).toFixed(1)} km`;
};

export default {
  geocodeAddress,
  reverseGeocode,
  validateCoordinates,
  getMapData,
  exportQGIS,
  getGeoStatistics,
  searchByProximity,
  getCurrentLocation,
  calculateDistance,
  formatDistance,
};
