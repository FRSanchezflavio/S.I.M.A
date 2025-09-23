const express = require('express');
const router = express.Router();
const bandasController = require('../controllers/bandas.controller');
const vinculacionesController = require('../controllers/vinculaciones.controller');
const auth = require('../middlewares/auth');
const { validarPermisos } = require('../middlewares/permisos');

// ==================== RUTAS DE BANDAS CRIMINALES ====================

// Listar bandas con filtros avanzados
router.get(
  '/bandas',
  auth,
  validarPermisos(['bandas:leer']),
  bandasController.list
);

// Crear nueva banda
router.post(
  '/bandas',
  auth,
  validarPermisos(['bandas:crear']),
  bandasController.create
);

// Obtener banda específica con información completa
router.get(
  '/bandas/:id',
  auth,
  validarPermisos(['bandas:leer']),
  bandasController.get
);

// Actualizar banda
router.put(
  '/bandas/:id',
  auth,
  validarPermisos(['bandas:editar']),
  bandasController.update
);

// Eliminar banda (soft delete)
router.delete(
  '/bandas/:id',
  auth,
  validarPermisos(['bandas:eliminar']),
  bandasController.remove
);

// ==================== GESTIÓN DE MIEMBROS DE BANDA ====================

// Agregar miembro a banda
router.post(
  '/bandas/:bandaId/miembros',
  auth,
  validarPermisos(['bandas:editar']),
  bandasController.addMember
);

// Obtener miembros de una banda
router.get(
  '/bandas/:bandaId/miembros',
  auth,
  validarPermisos(['bandas:leer']),
  bandasController.getMembers
);

// Actualizar información de miembro
router.put(
  '/bandas/:bandaId/miembros/:miembroId',
  auth,
  validarPermisos(['bandas:editar']),
  bandasController.updateMember ||
    ((req, res) => res.status(501).json({ error: 'Pendiente implementación' }))
);

// Remover miembro de banda
router.delete(
  '/bandas/:bandaId/miembros/:miembroId',
  auth,
  validarPermisos(['bandas:editar']),
  bandasController.removeMember ||
    ((req, res) => res.status(501).json({ error: 'Pendiente implementación' }))
);

// ==================== ANÁLISIS Y MÉTRICAS DE BANDAS ====================

// Análisis territorial de bandas
router.get(
  '/bandas/analisis/territorial',
  auth,
  validarPermisos(['bandas:analizar']),
  bandasController.territorialAnalysis
);

// Análisis organizacional de una banda específica
router.get(
  '/bandas/:bandaId/analisis/organizacional',
  auth,
  validarPermisos(['bandas:analizar']),
  bandasController.organizationalAnalysis
);

// Métricas y estadísticas generales
router.get(
  '/bandas/estadisticas/generales',
  auth,
  validarPermisos(['bandas:leer']),
  bandasController.generalStats ||
    ((req, res) => res.status(501).json({ error: 'Pendiente implementación' }))
);

// Reporte de actividad de bandas
router.get(
  '/bandas/reportes/actividad',
  auth,
  validarPermisos(['bandas:analizar']),
  bandasController.activityReport ||
    ((req, res) => res.status(501).json({ error: 'Pendiente implementación' }))
);

// ==================== RUTAS DE VINCULACIONES CRIMINALES ====================

// Listar vinculaciones con filtros
router.get(
  '/vinculaciones',
  auth,
  validarPermisos(['vinculaciones:leer']),
  vinculacionesController.list
);

// Crear nueva vinculación
router.post(
  '/vinculaciones',
  auth,
  validarPermisos(['vinculaciones:crear']),
  vinculacionesController.create
);

// Obtener vinculación específica
router.get(
  '/vinculaciones/:id',
  auth,
  validarPermisos(['vinculaciones:leer']),
  vinculacionesController.get
);

// Actualizar vinculación
router.put(
  '/vinculaciones/:id',
  auth,
  validarPermisos(['vinculaciones:editar']),
  vinculacionesController.update
);

// Eliminar vinculación
router.delete(
  '/vinculaciones/:id',
  auth,
  validarPermisos(['vinculaciones:eliminar']),
  vinculacionesController.remove
);

// ==================== ANÁLISIS DE REDES Y PATRONES ====================

// Análisis de red para una persona específica
router.get(
  '/vinculaciones/analisis/red/:personaId',
  auth,
  validarPermisos(['vinculaciones:analizar']),
  vinculacionesController.networkAnalysis
);

// Análisis de patrones de comunicación
router.post(
  '/vinculaciones/analisis/comunicacion',
  auth,
  validarPermisos(['vinculaciones:analizar']),
  vinculacionesController.communicationPatterns
);

// Detección automática de redes criminales
router.get(
  '/vinculaciones/deteccion/redes',
  auth,
  validarPermisos(['vinculaciones:analizar']),
  vinculacionesController.detectCriminalNetworks
);

// Análisis de coincidencias geográficas
router.post(
  '/vinculaciones/analisis/geografico',
  auth,
  validarPermisos(['vinculaciones:analizar']),
  vinculacionesController.geographicAnalysis ||
    ((req, res) => res.status(501).json({ error: 'Pendiente implementación' }))
);

// ==================== RUTAS DE VISUALIZACIÓN ====================

// Datos para árbol genealógico criminal
router.get(
  '/vinculaciones/visualizacion/arbol/:personaId',
  auth,
  validarPermisos(['vinculaciones:leer']),
  async (req, res, next) => {
    try {
      const { personaId } = req.params;
      const { profundidad = 3, incluir_bandas = true } = req.query;

      // Construir datos específicos para visualización en árbol
      const red = await construirRedExtendida(
        personaId,
        parseInt(profundidad),
        0.3 // nivel mínimo de confianza
      );

      // Transformar datos para formato de árbol genealógico
      const arbolGenealogico = transformarRedAArbol(red, personaId);

      // Agregar información de bandas si se solicita
      if (incluir_bandas === 'true') {
        arbolGenealogico.bandas_asociadas = await obtenerBandasPersonasRed(
          red.nodos
        );
      }

      res.json(arbolGenealogico);
    } catch (error) {
      next(error);
    }
  }
);

// Datos para mapa de calor territorial
router.get(
  '/bandas/visualizacion/mapa-calor',
  auth,
  validarPermisos(['bandas:leer']),
  async (req, res, next) => {
    try {
      const { fecha_desde, fecha_hasta, tipos_actividad } = req.query;

      const actividades = await db('actividades_territoriales as at')
        .join('bandas_criminales as bc', 'at.banda_id', 'bc.id')
        .where('at.fecha_actividad', '>=', fecha_desde || '2024-01-01')
        .where('at.fecha_actividad', '<=', fecha_hasta || new Date())
        .whereNotNull('at.latitud')
        .whereNotNull('at.longitud')
        .select(
          'at.latitud',
          'at.longitud',
          'at.tipo_actividad',
          'at.intensidad',
          'bc.nombre as banda_nombre',
          'bc.color_mapa',
          'bc.nivel_peligrosidad'
        );

      // Procesar datos para mapa de calor
      const mapaCalor = procesarDatosMapaCalor(actividades);

      res.json(mapaCalor);
    } catch (error) {
      next(error);
    }
  }
);

// ==================== RUTAS DE EXPORTACIÓN Y REPORTES ====================

// Exportar red de vinculaciones en formato GraphML
router.get(
  '/vinculaciones/exportar/graphml/:personaId',
  auth,
  validarPermisos(['vinculaciones:exportar']),
  async (req, res, next) => {
    try {
      const { personaId } = req.params;
      const { profundidad = 2 } = req.query;

      const red = await construirRedExtendida(
        personaId,
        parseInt(profundidad),
        0.3
      );
      const graphmlData = convertirRedAGraphML(red);

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="red_criminal_${personaId}.graphml"`
      );
      res.send(graphmlData);
    } catch (error) {
      next(error);
    }
  }
);

// Generar reporte ejecutivo de banda
router.get(
  '/bandas/:id/reporte/ejecutivo',
  auth,
  validarPermisos(['bandas:reportes']),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { formato = 'json' } = req.query;

      const reporte = await generarReporteEjecutivoBanda(id);

      if (formato === 'pdf') {
        // Generar PDF (requiere implementar librería PDF)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="reporte_banda_${id}.pdf"`
        );
        // return generatePDF(reporte);
        res
          .status(501)
          .json({ error: 'Exportación PDF pendiente implementación' });
      } else {
        res.json(reporte);
      }
    } catch (error) {
      next(error);
    }
  }
);

// ==================== MIDDLEWARE DE MANEJO DE ERRORES ====================

router.use((error, req, res, next) => {
  console.error('Error en rutas de inteligencia criminal:', error);
  // Always log stack for debugging
  if (error && error.stack) console.error(error.stack);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      detalles: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    });
  }

  if (error.code === '23505') {
    return res.status(409).json({
      error: 'Conflicto: El registro ya existe',
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    });
  }

  if (error.code === '23503') {
    return res.status(400).json({
      error: 'Error de referencia: Registro relacionado no encontrado',
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    });
  }

  // In development mode include stack in response to aid debugging
  const payload = {
    error: 'Error interno del servidor en sistema de inteligencia criminal',
    timestamp: new Date().toISOString(),
  };
  if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;

  res.status(error.status || 500).json(payload);
});

// ==================== FUNCIONES AUXILIARES ====================

// Transformar red a formato de árbol genealógico
function transformarRedAArbol(red, personaCentralId) {
  const nodosCentrales = red.nodos.filter(n => n.nivel === 0);
  const personaCentral = nodosCentrales.find(n => n.id == personaCentralId);

  if (!personaCentral) {
    throw new Error('Persona central no encontrada en la red');
  }

  // Construir jerarquía en formato árbol
  const arbol = {
    raiz: {
      id: personaCentral.id,
      nombre: personaCentral.nombre,
      nivel: 0,
      hijos: [],
    },
    estadisticas: {
      total_nodos: red.nodos.length,
      total_vinculos: red.vinculos.length,
      niveles_profundidad: Math.max(...red.nodos.map(n => n.nivel)) + 1,
    },
    metadatos: {
      generado_en: new Date().toISOString(),
      persona_central_id: personaCentralId,
    },
  };

  // Agregar nodos hijo recursivamente
  construirHijosArbol(arbol.raiz, red, new Set([personaCentralId]));

  return arbol;
}

// Construir hijos del árbol recursivamente
function construirHijosArbol(nodoActual, red, visitados) {
  const vinculosHijos = red.vinculos.filter(
    v => v.origen == nodoActual.id && !visitados.has(v.destino)
  );

  for (const vinculo of vinculosHijos) {
    const nodoHijo = red.nodos.find(n => n.id == vinculo.destino);
    if (nodoHijo && !visitados.has(nodoHijo.id)) {
      visitados.add(nodoHijo.id);

      const hijo = {
        id: nodoHijo.id,
        nombre: nodoHijo.nombre,
        nivel: nodoHijo.nivel,
        tipo_vinculacion: vinculo.tipo,
        fuerza_vinculacion: vinculo.fuerza,
        nivel_confianza: vinculo.nivel_confianza,
        hijos: [],
      };

      nodoActual.hijos.push(hijo);
      construirHijosArbol(hijo, red, visitados);
    }
  }
}

// Procesar datos para mapa de calor
function procesarDatosMapaCalor(actividades) {
  const puntos = actividades.map(act => ({
    lat: parseFloat(act.latitud),
    lng: parseFloat(act.longitud),
    intensidad: act.intensidad || 1,
    tipo: act.tipo_actividad,
    banda: act.banda_nombre,
    color: act.color_mapa,
    peligrosidad: act.nivel_peligrosidad,
  }));

  // Agrupar por proximidad geográfica
  const clusters = agruparPorProximidad(puntos, 0.01); // ~1km

  return {
    puntos_individuales: puntos,
    clusters_territoriales: clusters,
    estadisticas: {
      total_actividades: actividades.length,
      bandas_involucradas: [...new Set(actividades.map(a => a.banda_nombre))]
        .length,
      tipos_actividad: [...new Set(actividades.map(a => a.tipo_actividad))],
    },
  };
}

// Agrupar puntos por proximidad geográfica
function agruparPorProximidad(puntos, tolerancia) {
  const clusters = [];
  const visitados = new Set();

  for (const punto of puntos) {
    if (visitados.has(punto)) continue;

    const cluster = {
      centro: { lat: punto.lat, lng: punto.lng },
      puntos: [punto],
      intensidad_total: punto.intensidad,
    };

    visitados.add(punto);

    // Buscar puntos cercanos
    for (const otroPunto of puntos) {
      if (visitados.has(otroPunto)) continue;

      const distancia = calcularDistancia(punto, otroPunto);
      if (distancia <= tolerancia) {
        cluster.puntos.push(otroPunto);
        cluster.intensidad_total += otroPunto.intensidad;
        visitados.add(otroPunto);
      }
    }

    // Recalcular centro del cluster
    if (cluster.puntos.length > 1) {
      cluster.centro = calcularCentroide(cluster.puntos);
    }

    clusters.push(cluster);
  }

  return clusters;
}

// Calcular distancia entre dos puntos (Haversine simplificado)
function calcularDistancia(punto1, punto2) {
  const dlat = punto2.lat - punto1.lat;
  const dlng = punto2.lng - punto1.lng;
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

// Calcular centroide de un grupo de puntos
function calcularCentroide(puntos) {
  const sumLat = puntos.reduce((sum, p) => sum + p.lat, 0);
  const sumLng = puntos.reduce((sum, p) => sum + p.lng, 0);
  return {
    lat: sumLat / puntos.length,
    lng: sumLng / puntos.length,
  };
}

// Importar dependencias necesarias
const db = require('../db/knex');
const {
  construirRedExtendida,
} = require('../controllers/vinculaciones.controller');

module.exports = router;
