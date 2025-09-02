const archiver = require('archiver');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Servicio para manejo de datos geoespaciales y exportación a formatos GIS
 */

/**
 * Obtiene datos de personas con información geoespacial
 * @param {Object} knex - Instancia de Knex
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} - Array de personas con coordenadas
 */
const getPersonasGeoData = async (knex, filters = {}) => {
  try {
    let query = knex('personas_registradas')
      .select([
        'id',
        'nombre',
        'apellido',
        'dni',
        'edad',
        'genero',
        'direccion_completa',
        'domicilio_latitud',
        'domicilio_longitud',
        'barrio',
        'localidad',
        'comisaria',
        'tipo_delito',
        'modalidad',
        'fecha_carga',
        'direccion_verificada',
      ])
      .whereNotNull('domicilio_latitud')
      .whereNotNull('domicilio_longitud');

    // Aplicar filtros
    if (filters.tipo_delito) {
      query = query.where('tipo_delito', filters.tipo_delito);
    }

    if (filters.modalidad) {
      query = query.where('modalidad', filters.modalidad);
    }

    if (filters.comisaria) {
      query = query.where('comisaria', 'ilike', `%${filters.comisaria}%`);
    }

    if (filters.fecha_desde) {
      query = query.where('fecha_carga', '>=', filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      query = query.where('fecha_carga', '<=', filters.fecha_hasta);
    }

    // Filtro de búsqueda por proximidad geográfica
    if (filters.cerca_lat && filters.cerca_lng && filters.radio) {
      const radioMetros = filters.radio * 1000; // Convertir km a metros
      query = query.whereRaw(
        `
        ST_DWithin(
          domicilio_geoposicion,
          ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
          ?
        )
      `,
        [filters.cerca_lng, filters.cerca_lat, radioMetros]
      );
    }

    const personas = await query.orderBy('fecha_carga', 'desc');

    logger.info(
      `Obtenidas ${personas.length} personas con datos geoespaciales`
    );
    return personas;
  } catch (error) {
    logger.error('Error obteniendo datos geoespaciales de personas:', error);
    throw error;
  }
};

/**
 * Obtiene datos de registros delictuales con información geoespacial
 * @param {Object} knex - Instancia de Knex
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} - Array de registros con coordenadas
 */
const getRegistrosGeoData = async (knex, filters = {}) => {
  try {
    let query = knex('registros_delictuales as r')
      .join('personas_registradas as p', 'r.persona_id', 'p.id')
      .select([
        'r.id',
        'r.tipo_delito',
        'r.lugar_delito_texto',
        'r.hecho_latitud',
        'r.hecho_longitud',
        'r.hecho_direccion',
        'r.hecho_barrio',
        'r.hecho_localidad',
        'r.estado',
        'r.created_at',
        'p.nombre',
        'p.apellido',
        'p.dni',
        'p.edad',
        'p.genero',
      ])
      .whereNotNull('r.hecho_latitud')
      .whereNotNull('r.hecho_longitud');

    // Aplicar filtros similares a personas
    if (filters.tipo_delito) {
      query = query.where('r.tipo_delito', filters.tipo_delito);
    }

    if (filters.fecha_desde) {
      query = query.where('r.created_at', '>=', filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      query = query.where('r.created_at', '<=', filters.fecha_hasta);
    }

    // Filtro de proximidad para hechos
    if (filters.cerca_lat && filters.cerca_lng && filters.radio) {
      const radioMetros = filters.radio * 1000;
      query = query.whereRaw(
        `
        ST_DWithin(
          r.hecho_geoposicion,
          ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
          ?
        )
      `,
        [filters.cerca_lng, filters.cerca_lat, radioMetros]
      );
    }

    const registros = await query.orderBy('r.created_at', 'desc');

    logger.info(
      `Obtenidos ${registros.length} registros con datos geoespaciales`
    );
    return registros;
  } catch (error) {
    logger.error('Error obteniendo datos geoespaciales de registros:', error);
    throw error;
  }
};

/**
 * Convierte datos a formato GeoJSON
 * @param {Array} personas - Array de personas
 * @param {Array} registros - Array de registros
 * @returns {Object} - FeatureCollection GeoJSON
 */
const convertToGeoJSON = (personas = [], registros = []) => {
  const features = [];

  // Agregar personas como features
  personas.forEach(persona => {
    if (persona.domicilio_latitud && persona.domicilio_longitud) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(persona.domicilio_longitud),
            parseFloat(persona.domicilio_latitud),
          ],
        },
        properties: {
          tipo: 'domicilio',
          id: persona.id,
          nombre: `${persona.nombre} ${persona.apellido}`,
          dni: persona.dni,
          edad: persona.edad,
          genero: persona.genero,
          direccion: persona.direccion_completa,
          barrio: persona.barrio,
          localidad: persona.localidad,
          comisaria: persona.comisaria,
          tipo_delito: persona.tipo_delito,
          modalidad: persona.modalidad,
          fecha_carga: persona.fecha_carga,
          verificado: persona.direccion_verificada,
        },
      });
    }
  });

  // Agregar registros como features
  registros.forEach(registro => {
    if (registro.hecho_latitud && registro.hecho_longitud) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(registro.hecho_longitud),
            parseFloat(registro.hecho_latitud),
          ],
        },
        properties: {
          tipo: 'hecho_delictivo',
          id: registro.id,
          tipo_delito: registro.tipo_delito,
          lugar_texto: registro.lugar_delito_texto,
          direccion: registro.hecho_direccion,
          barrio: registro.hecho_barrio,
          localidad: registro.hecho_localidad,
          estado: registro.estado,
          fecha: registro.created_at,
          persona_nombre: `${registro.nombre} ${registro.apellido}`,
          persona_dni: registro.dni,
          persona_edad: registro.edad,
          persona_genero: registro.genero,
        },
      });
    }
  });

  return {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326',
      },
    },
    features,
  };
};

/**
 * Genera archivo Shapefile (como ZIP con todos los componentes)
 * @param {Object} geoJSON - Datos en formato GeoJSON
 * @param {string} filename - Nombre base del archivo
 * @returns {Promise<Buffer>} - Buffer del archivo ZIP
 */
const generateShapefile = async (geoJSON, filename = 'sima_data') => {
  try {
    // Para generar Shapefile real necesitaríamos librerías como 'shpjs' o 'gdal'
    // Por simplicidad, generamos un ZIP con GeoJSON y metadatos
    const zip = archiver('zip', { zlib: { level: 9 } });
    const buffers = [];

    zip.on('data', chunk => buffers.push(chunk));

    // Agregar GeoJSON principal
    zip.append(JSON.stringify(geoJSON, null, 2), {
      name: `${filename}.geojson`,
    });

    // Agregar metadatos
    const metadata = {
      title:
        'Datos SIMA - Sistema de Identificación de Mencionados/Aprehendidos',
      description: 'Datos geoespaciales exportados del sistema SIMA',
      projection: 'EPSG:4326 (WGS84)',
      export_date: new Date().toISOString(),
      total_features: geoJSON.features.length,
      feature_types: {
        domicilios: geoJSON.features.filter(
          f => f.properties.tipo === 'domicilio'
        ).length,
        hechos: geoJSON.features.filter(
          f => f.properties.tipo === 'hecho_delictivo'
        ).length,
      },
    };

    zip.append(JSON.stringify(metadata, null, 2), {
      name: 'metadata.json',
    });

    // Agregar archivo README
    const readme = `# Datos SIMA - Exportación Geoespacial

## Descripción
Datos geoespaciales exportados del Sistema de Identificación de Mencionados y/o Aprehendidos (SIMA).

## Archivos incluidos
- ${filename}.geojson: Datos principales en formato GeoJSON
- metadata.json: Metadatos de la exportación
- README.txt: Este archivo

## Uso en QGIS
1. Abrir QGIS
2. Agregar capa vectorial
3. Seleccionar ${filename}.geojson
4. Configurar simbología según el campo 'tipo'

## Sistema de coordenadas
EPSG:4326 (WGS84)

## Fecha de exportación
${new Date().toLocaleString('es-AR')}
`;

    zip.append(readme, { name: 'README.txt' });

    zip.finalize();

    return new Promise((resolve, reject) => {
      zip.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      zip.on('error', reject);
    });
  } catch (error) {
    logger.error('Error generando Shapefile:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas geoespaciales
 * @param {Object} knex - Instancia de Knex
 * @returns {Promise<Object>} - Estadísticas
 */
const getGeoStatistics = async knex => {
  try {
    const stats = {};

    // Estadísticas de personas con geolocalización
    const personasStats = await knex('personas_registradas')
      .select(
        knex.raw('COUNT(*) as total'),
        knex.raw('COUNT(domicilio_latitud) as geocodificadas'),
        knex.raw(
          'COUNT(CASE WHEN direccion_verificada = true THEN 1 END) as verificadas'
        )
      )
      .first();

    stats.personas = {
      total: parseInt(personasStats.total),
      geocodificadas: parseInt(personasStats.geocodificadas),
      verificadas: parseInt(personasStats.verificadas),
      porcentaje_geocodificado:
        personasStats.total > 0
          ? (
              (personasStats.geocodificadas / personasStats.total) *
              100
            ).toFixed(1)
          : 0,
    };

    // Estadísticas de registros con geolocalización
    const registrosStats = await knex('registros_delictuales')
      .select(
        knex.raw('COUNT(*) as total'),
        knex.raw('COUNT(hecho_latitud) as geocodificados'),
        knex.raw(
          'COUNT(CASE WHEN hecho_verificado = true THEN 1 END) as verificados'
        )
      )
      .first();

    stats.registros = {
      total: parseInt(registrosStats.total),
      geocodificados: parseInt(registrosStats.geocodificados),
      verificados: parseInt(registrosStats.verificados),
      porcentaje_geocodificado:
        registrosStats.total > 0
          ? (
              (registrosStats.geocodificados / registrosStats.total) *
              100
            ).toFixed(1)
          : 0,
    };

    // Top localidades
    const topLocalidades = await knex('personas_registradas')
      .select('localidad')
      .count('* as cantidad')
      .whereNotNull('localidad')
      .groupBy('localidad')
      .orderBy('cantidad', 'desc')
      .limit(10);

    stats.top_localidades = topLocalidades;

    // Top tipos de delito con geolocalización
    const topDelitos = await knex('registros_delictuales')
      .select('tipo_delito')
      .count('* as cantidad')
      .whereNotNull('hecho_latitud')
      .groupBy('tipo_delito')
      .orderBy('cantidad', 'desc')
      .limit(10);

    stats.top_delitos = topDelitos;

    logger.info('Estadísticas geoespaciales calculadas');
    return stats;
  } catch (error) {
    logger.error('Error calculando estadísticas geoespaciales:', error);
    throw error;
  }
};

module.exports = {
  getPersonasGeoData,
  getRegistrosGeoData,
  convertToGeoJSON,
  generateShapefile,
  getGeoStatistics,
};
