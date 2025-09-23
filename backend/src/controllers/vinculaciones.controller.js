const db = require('../db/knex');
const Joi = require('joi');

// Esquemas de validación para vinculaciones
const vinculacionSchema = Joi.object({
  persona_origen_id: Joi.number().integer().required(),
  persona_destino_id: Joi.number().integer().required(),
  tipo_vinculacion: Joi.string()
    .valid(
      'familiar_sangre',
      'familiar_politico',
      'amistad_personal',
      'relacion_sentimental',
      'socio_comercial',
      'empleador_empleado',
      'proveedor_cliente',
      'intermediario_financiero',
      'complice_directo',
      'complice_indirecto',
      'mentor_discipulo',
      'rival_competencia',
      'victima_victimario',
      'testigo_colaborador',
      'informante_contacto',
      'corruption_soborno',
      'coordinacion_operativa',
      'jerarquia_comando',
      'alianza_temporal',
      'conflicto_territorial',
      'comunicacion_frecuente',
      'reunion_clandestina',
      'transaccion_sospechosa',
      'otro_criminal'
    )
    .required(),
  subtipo_detalle: Joi.string().max(100).allow('', null),
  descripcion: Joi.string().max(500).allow('', null),
  nivel_confianza: Joi.number().min(0).max(1).required(),
  estado_vinculacion: Joi.string()
    .valid(
      'activa_confirmada',
      'activa_sospechosa',
      'historica_confirmada',
      'historica_sospechosa',
      'interrumpida_temporal',
      'terminada_conflicto',
      'terminada_natural',
      'bajo_investigacion',
      'desmentida_evidencia',
      'falsa_alarma'
    )
    .default('activa_sospechosa'),
  es_bidireccional: Joi.boolean().default(true),
  fuerza_vinculacion: Joi.string()
    .valid('muy_debil', 'debil', 'moderada', 'fuerte', 'muy_fuerte')
    .default('moderada'),
  frecuencia_contacto: Joi.string()
    .valid(
      'diaria',
      'semanal',
      'quincenal',
      'mensual',
      'esporadica',
      'solo_operaciones',
      'historica',
      'desconocida'
    )
    .allow(null),
  fecha_primer_contacto: Joi.date().allow(null),
  fecha_ultimo_contacto: Joi.date().allow(null),
  fecha_confirmacion: Joi.date().allow(null),
  metodos_comunicacion: Joi.array().items(Joi.string()).allow(null),
  lugares_encuentro: Joi.array().allow(null),
  testigos_vinculacion: Joi.array().allow(null),
  evidencias_materiales: Joi.array().allow(null),
  riesgo_operacional: Joi.string()
    .valid('muy_bajo', 'bajo', 'medio', 'alto', 'muy_alto', 'critico')
    .default('medio'),
  impacto_investigacion: Joi.string()
    .valid('insignificante', 'menor', 'moderado', 'mayor', 'critico')
    .default('moderado'),
  fuente_informacion: Joi.string().max(200).allow('', null),
  investigador_asignado: Joi.string().max(100).allow('', null),
  requiere_seguimiento: Joi.boolean().default(false),
  alertas_automaticas: Joi.boolean().default(false),
  geolocalizacion_encuentros: Joi.array().allow(null),
  analisis_temporal: Joi.object().allow(null),
  contexto_descubrimiento: Joi.string().allow('', null),
  observaciones_investigacion: Joi.string().allow('', null),
});

// Mapear tipos legacy a la nueva columna `categoria_vinculacion` usada por la tabla
function mapTipoToCategoria(tipo) {
  if (!tipo) return 'sospechosa_investigar';
  const m = {
    familiar_sangre: 'familiar_sanguinea',
    familiar_politico: 'familiar_politica',
    amistad_personal: 'amistad_personal',
    relacion_sentimental: 'sentimental_conyugal',
    socio_comercial: 'comercial_ilegal',
    empleador_empleado: 'laboral_legal',
    proveedor_cliente: 'comercial_legal',
    intermediario_financiero: 'delictiva_financiera',
    complice_directo: 'delictiva_operacional',
    complice_indirecto: 'delictiva_operacional',
    mentor_discipulo: 'amistad_personal',
    rival_competencia: 'rival_enemigo',
    victima_victimario: 'confirmada_evidencia',
    testigo_colaborador: 'confirmada_evidencia',
    informante_contacto: 'informante_de',
    corruption_soborno: 'corrupcion_funcionarios',
    coordinacion_operativa: 'delictiva_operacional',
    jerarquia_comando: 'delictiva_operacional',
    alianza_temporal: 'sospechosa_investigar',
    conflicto_territorial: 'territorial_barrial',
    comunicacion_frecuente: 'amistad_personal',
    reunion_clandestina: 'sospechosa_investigar',
    transaccion_sospechosa: 'delictiva_financiera',
    otro_criminal: 'sospechosa_investigar',
  };
  return m[tipo] || 'sospechosa_investigar';
}

function mapNivelConfianza(nivel) {
  // Si ya es string válido, devolverlo
  if (typeof nivel === 'string') return nivel;
  const v = parseFloat(nivel);
  if (isNaN(v)) return 'sospechoso_indicios';

  if (v >= 0.85) return 'confirmado_evidencia';
  if (v >= 0.65) return 'confirmado_testigo';
  if (v >= 0.45) return 'probable_investigacion';
  if (v >= 0.25) return 'sospechoso_indicios';
  return 'rumor_investigar';
}

// Orden y puntajes representativos para las categorías de confianza.
const NIVEL_CONF_ORDER_DESC = [
  'confirmado_evidencia',
  'confirmado_testigo',
  'probable_investigacion',
  'sospechoso_indicios',
  'rumor_investigar',
  'descartado_falso',
];

const NIVEL_CONF_SCORE = {
  confirmado_evidencia: 1.0,
  confirmado_testigo: 0.75,
  probable_investigacion: 0.55,
  sospechoso_indicios: 0.35,
  rumor_investigar: 0.15,
  descartado_falso: 0.0,
};

function getCategoriesForMinNivel(min) {
  // Acepta número o string. Devuelve arreglo de categorías (strings) cuyo score >= min
  const n = typeof min === 'number' ? min : parseFloat(min);
  if (isNaN(n)) {
    // Si no es numérico, si es string válido devolver sólo esa categoría
    if (typeof min === 'string' && NIVEL_CONF_ORDER_DESC.includes(min))
      return [min];
    // Valor por defecto: incluir desde 'sospechoso_indicios' hacia arriba
    return NIVEL_CONF_ORDER_DESC.filter(c => NIVEL_CONF_SCORE[c] >= 0.25);
  }

  return NIVEL_CONF_ORDER_DESC.filter(c => NIVEL_CONF_SCORE[c] >= n);
}

// ==================== CONTROLADORES DE VINCULACIONES ====================

// Listar vinculaciones con filtros avanzados
exports.list = async (req, res, next) => {
  try {
    const {
      persona_id,
      tipo_vinculacion,
      estado_vinculacion,
      nivel_confianza_min = 0.3,
      incluir_red_extendida = false,
      profundidad_red = 2,
      incluir_analisis = false,
      page = 1,
      pageSize = 50,
      ordenar_por = 'nivel_confianza',
      orden = 'desc',
    } = req.query;

    const p = Math.max(1, parseInt(page));
    const ps = Math.min(200, Math.max(1, parseInt(pageSize)));

    let query = db('vinculaciones_criminales as vc')
      .join(
        'personas_registradas as origen',
        'vc.persona_origen_id',
        'origen.id'
      )
      .join(
        'personas_registradas as destino',
        'vc.persona_destino_id',
        'destino.id'
      )
      .select(
        'vc.*',
        db.raw(`
          json_build_object(
            'id', origen.id,
            'nombre', origen.nombre,
            'apellido', origen.apellido,
            'dni', origen.dni,
            'foto_principal', origen.foto_principal
          ) as persona_origen
        `),
        db.raw(`
          json_build_object(
            'id', destino.id,
            'nombre', destino.nombre,
            'apellido', destino.apellido,
            'dni', destino.dni,
            'foto_principal', destino.foto_principal
          ) as persona_destino
        `)
      );

    // Aplicar filtros
    if (persona_id) {
      query.where(function () {
        this.where('vc.persona_origen_id', persona_id).orWhere(
          'vc.persona_destino_id',
          persona_id
        );
      });
    }

    if (tipo_vinculacion) {
      if (Array.isArray(tipo_vinculacion)) {
        query.whereIn('vc.tipo_vinculacion', tipo_vinculacion);
      } else {
        query.where('vc.tipo_vinculacion', tipo_vinculacion);
      }
    }

    if (estado_vinculacion)
      query.where('vc.estado_vinculacion', estado_vinculacion);
    if (nivel_confianza_min) {
      const cats = getCategoriesForMinNivel(nivel_confianza_min);
      query.whereIn('vc.nivel_confianza', cats);
    }

    // Obtener total para paginación
    const total = await query.clone().count('* as count').first();

    // Aplicar ordenamiento
    const ordenamientosValidos = {
      nivel_confianza: 'vc.nivel_confianza',
      fecha_ultimo_contacto: 'vc.fecha_ultimo_contacto',
      fuerza_vinculacion: 'vc.fuerza_vinculacion',
      riesgo_operacional: 'vc.riesgo_operacional',
    };

    const campoOrden =
      ordenamientosValidos[ordenar_por] || 'vc.nivel_confianza';
    query.orderBy(campoOrden, orden === 'asc' ? 'asc' : 'desc');

    const vinculaciones = await query.offset((p - 1) * ps).limit(ps);

    // Agregar red extendida si se solicita
    if (incluir_red_extendida === 'true' && persona_id) {
      const redExtendida = await construirRedExtendida(
        persona_id,
        parseInt(profundidad_red) || 2,
        parseFloat(nivel_confianza_min)
      );

      res.json({
        vinculaciones_directas: vinculaciones,
        red_extendida: redExtendida,
        analisis_red:
          incluir_analisis === 'true'
            ? await analizarEstructuraRed(persona_id, redExtendida)
            : null,
        pagination: {
          page: p,
          pageSize: ps,
          total: parseInt(total.count),
          totalPages: Math.ceil(total.count / ps),
        },
      });
    } else {
      res.json({
        vinculaciones,
        pagination: {
          page: p,
          pageSize: ps,
          total: parseInt(total.count),
          totalPages: Math.ceil(total.count / ps),
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// Crear vinculación
exports.create = async (req, res, next) => {
  try {
    // Normalizar alias: permitir que el frontend envíe `evidencias` (string o array)
    const payload = { ...req.body };
    if (
      Object.prototype.hasOwnProperty.call(req.body, 'evidencias') &&
      !Object.prototype.hasOwnProperty.call(req.body, 'evidencias_materiales')
    ) {
      const ev = req.body.evidencias;
      if (Array.isArray(ev)) payload.evidencias_materiales = ev;
      else if (typeof ev === 'string' && ev.trim() !== '')
        payload.evidencias_materiales = [ev.trim()];
      else payload.evidencias_materiales = null;
    }
    // Eliminar campo alias para evitar que Joi lo rechace
    if (Object.prototype.hasOwnProperty.call(payload, 'evidencias'))
      delete payload.evidencias;

    const { value, error } = vinculacionSchema.validate(payload);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Validaciones de negocio
    if (value.persona_origen_id === value.persona_destino_id) {
      return res.status(400).json({
        error: 'Una persona no puede estar vinculada consigo misma',
      });
    }

    // Verificar que ambas personas existen
    const [personaOrigen, personaDestino] = await Promise.all([
      db('personas_registradas').where('id', value.persona_origen_id).first(),
      db('personas_registradas').where('id', value.persona_destino_id).first(),
    ]);

    if (!personaOrigen) {
      return res.status(404).json({ error: 'Persona origen no encontrada' });
    }
    if (!personaDestino) {
      return res.status(404).json({ error: 'Persona destino no encontrada' });
    }

    // Verificar si ya existe una vinculación similar
    const vinculacionExistente = await db('vinculaciones_criminales')
      .where(function () {
        this.where('persona_origen_id', value.persona_origen_id).where(
          'persona_destino_id',
          value.persona_destino_id
        );
      })
      .orWhere(function () {
        this.where('persona_origen_id', value.persona_destino_id).where(
          'persona_destino_id',
          value.persona_origen_id
        );
      })
      .where('tipo_vinculacion', value.tipo_vinculacion)
      .whereIn('estado_vinculacion', ['activa_confirmada', 'activa_sospechosa'])
      .first();

    if (vinculacionExistente) {
      return res.status(400).json({
        error: 'Ya existe una vinculación similar entre estas personas',
      });
    }

    // Calcular métricas automáticas
    const metricas = await calcularMetricasVinculacion(value);

    const trx = await db.transaction();
    try {
      // Preparar payload para la tabla: mapear campos legacy a columnas actuales
      const insertPayload = {
        ...value,
        categoria_vinculacion: mapTipoToCategoria(value.tipo_vinculacion),
        nivel_confianza: mapNivelConfianza(value.nivel_confianza),
        score_importancia: metricas.scoreImportancia,
        created_by: req.user?.id,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Eliminar campos legados que no existen en la tabla para evitar errores de insert
      if (
        Object.prototype.hasOwnProperty.call(insertPayload, 'tipo_vinculacion')
      )
        delete insertPayload.tipo_vinculacion;

      const [vinculacion] = await trx('vinculaciones_criminales')
        .insert(insertPayload)
        .returning('*');

      // Si es bidireccional, crear la vinculación inversa
      if (value.es_bidireccional) {
        const inversePayload = {
          ...value,
          categoria_vinculacion: mapTipoToCategoria(value.tipo_vinculacion),
          nivel_confianza: mapNivelConfianza(value.nivel_confianza),
          persona_origen_id: value.persona_destino_id,
          persona_destino_id: value.persona_origen_id,
          score_importancia: metricas.scoreImportancia,
          es_vinculacion_inversa: true,
          vinculacion_principal_id: vinculacion.id,
          created_by: req.user?.id,
          created_at: new Date(),
          updated_at: new Date(),
        };

        if (
          Object.prototype.hasOwnProperty.call(
            inversePayload,
            'tipo_vinculacion'
          )
        )
          delete inversePayload.tipo_vinculacion;

        await trx('vinculaciones_criminales').insert(inversePayload);
      }

      // Actualizar métricas de centralidad de las personas involucradas
      await actualizarMetricasCentralidad(trx, [
        value.persona_origen_id,
        value.persona_destino_id,
      ]);

      await trx.commit();

      // Obtener vinculación completa
      const vinculacionCompleta = await obtenerVinculacionPorId(vinculacion.id);
      res.status(201).json(vinculacionCompleta);
    } catch (error) {
      await trx.rollback();
      // Log detallado para depuración: payload y error
      console.error('Error durante transacción al crear vinculacion:', {
        message: error.message,
        stack: error.stack,
        payload: value,
        userId: req.user?.id || null,
      });
      throw error;
    }
  } catch (error) {
    // Log adicional antes de next
    console.error('Error en vinculaciones.create (outer):', {
      message: error.message,
      stack: error.stack,
      payload: req.body,
      userId: req.user?.id || null,
    });
    next(error);
  }
};

// Obtener vinculación por ID
exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { incluir_contexto = false } = req.query;

    const vinculacion = await obtenerVinculacionPorId(id);
    if (!vinculacion) {
      return res.status(404).json({ error: 'Vinculación no encontrada' });
    }

    // Agregar contexto adicional si se solicita
    if (incluir_contexto === 'true') {
      // Obtener otras vinculaciones de las mismas personas
      vinculacion.contexto = {
        vinculaciones_persona_origen: await obtenerVinculacionesPersona(
          vinculacion.persona_origen_id
        ),
        vinculaciones_persona_destino: await obtenerVinculacionesPersona(
          vinculacion.persona_destino_id
        ),
        coincidencias_territoriales: await analizarCoincidenciasTerritoriales(
          vinculacion.persona_origen_id,
          vinculacion.persona_destino_id
        ),
        historial_conjunto: await obtenerHistorialConjunto(
          vinculacion.persona_origen_id,
          vinculacion.persona_destino_id
        ),
      };
    }

    res.json(vinculacion);
  } catch (error) {
    next(error);
  }
};

// Actualizar vinculación
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Normalizar alias de evidencias también al actualizar
    const payload = { ...req.body };
    if (
      Object.prototype.hasOwnProperty.call(req.body, 'evidencias') &&
      !Object.prototype.hasOwnProperty.call(req.body, 'evidencias_materiales')
    ) {
      const ev = req.body.evidencias;
      if (Array.isArray(ev)) payload.evidencias_materiales = ev;
      else if (typeof ev === 'string' && ev.trim() !== '')
        payload.evidencias_materiales = [ev.trim()];
      else payload.evidencias_materiales = null;
    }
    // Eliminar campo alias para evitar que Joi lo rechace
    if (Object.prototype.hasOwnProperty.call(payload, 'evidencias'))
      delete payload.evidencias;

    const { value, error } = vinculacionSchema.validate(payload);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const vinculacionExiste = await db('vinculaciones_criminales')
      .where('id', id)
      .first();

    if (!vinculacionExiste) {
      return res.status(404).json({ error: 'Vinculación no encontrada' });
    }

    // Recalcular métricas
    const metricas = await calcularMetricasVinculacion(value);

    const [vinculacionActualizada] = await db('vinculaciones_criminales')
      .where('id', id)
      .update({
        ...value,
        score_importancia: metricas.scoreImportancia,
        updated_by: req.user?.id,
        updated_at: new Date(),
      })
      .returning('*');

    const vinculacionCompleta = await obtenerVinculacionPorId(id);
    res.json(vinculacionCompleta);
  } catch (error) {
    next(error);
  }
};

// Eliminar vinculación
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vinculacion = await db('vinculaciones_criminales')
      .where('id', id)
      .first();

    if (!vinculacion) {
      return res.status(404).json({ error: 'Vinculación no encontrada' });
    }

    const trx = await db.transaction();
    try {
      // Eliminar vinculación principal
      await trx('vinculaciones_criminales').where('id', id).del();

      // Eliminar vinculación inversa si existe
      await trx('vinculaciones_criminales')
        .where('vinculacion_principal_id', id)
        .del();

      // Actualizar métricas de centralidad
      await actualizarMetricasCentralidad(trx, [
        vinculacion.persona_origen_id,
        vinculacion.persona_destino_id,
      ]);

      await trx.commit();
      res.json({ message: 'Vinculación eliminada exitosamente' });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// ==================== ANÁLISIS DE REDES ====================

// Análisis de red para una persona específica
exports.networkAnalysis = async (req, res, next) => {
  try {
    const { personaId } = req.params;
    const {
      profundidad = 3,
      nivel_confianza_min = 0.3,
      incluir_metricas = true,
      incluir_clusters = true,
    } = req.query;

    const persona = await db('personas_registradas')
      .where('id', personaId)
      .first();

    if (!persona) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    // Construir red completa
    const red = await construirRedCompleta(
      personaId,
      parseInt(profundidad),
      parseFloat(nivel_confianza_min)
    );

    const analisis = {
      persona_central: {
        id: persona.id,
        nombre: `${persona.nombre} ${persona.apellido}`,
        dni: persona.dni,
      },
      parametros: {
        profundidad: parseInt(profundidad),
        nivel_confianza_min: parseFloat(nivel_confianza_min),
      },
      red_completa: red,
      estadisticas: {
        total_nodos: red.nodos.length,
        total_conexiones: red.vinculos.length,
        densidad_red: calcularDensidadRed(red),
        nodos_por_nivel: contarNodosPorNivel(red),
      },
    };

    // Agregar métricas de centralidad si se solicita
    if (incluir_metricas === 'true') {
      analisis.metricas_centralidad = calcularMetricasCentralidad(red);
    }

    // Detectar clusters si se solicita
    if (incluir_clusters === 'true') {
      analisis.clusters = detectarClusters(red);
    }

    res.json(analisis);
  } catch (error) {
    next(error);
  }
};

// Análisis de patrones de comunicación
exports.communicationPatterns = async (req, res, next) => {
  try {
    const { personaIds } = req.body; // Array de IDs de personas
    const { periodo_dias = 90 } = req.query;

    if (!Array.isArray(personaIds) || personaIds.length < 2) {
      return res.status(400).json({
        error: 'Se requieren al menos 2 personas para analizar patrones',
      });
    }

    // Obtener vinculaciones entre las personas especificadas
    const vinculaciones = await db('vinculaciones_criminales')
      .whereIn('persona_origen_id', personaIds)
      .whereIn('persona_destino_id', personaIds)
      .where(
        'fecha_ultimo_contacto',
        '>=',
        db.raw('NOW() - INTERVAL ? DAY', [periodo_dias])
      );

    // Analizar patrones temporales
    const patronesTempo = analizarPatronesTemporales(vinculaciones);

    // Analizar frecuencias de comunicación
    const patronesFrecuencia = analizarFrecuenciasComunicacion(vinculaciones);

    // Detectar anomalías en la comunicación
    const anomalias = detectarAnomaliasComunicacion(vinculaciones);

    res.json({
      periodo_analizado: periodo_dias,
      total_vinculaciones: vinculaciones.length,
      patrones_temporales: patronesTempo,
      patrones_frecuencia: patronesFrecuencia,
      anomalias_detectadas: anomalias,
      recomendaciones: generarRecomendacionesVigilancia(
        patronesTempo,
        anomalias
      ),
    });
  } catch (error) {
    next(error);
  }
};

// Detección de redes criminales
exports.detectCriminalNetworks = async (req, res, next) => {
  try {
    const {
      umbral_conexiones = 3,
      nivel_confianza_min = 0.5,
      incluir_bandas_conocidas = true,
    } = req.query;

    // Obtener todas las vinculaciones de alta confianza
    const cats = getCategoriesForMinNivel(parseFloat(nivel_confianza_min));
    const vinculaciones = await db('vinculaciones_criminales')
      .whereIn('nivel_confianza', cats)
      .whereIn('estado_vinculacion', [
        'activa_confirmada',
        'activa_sospechosa',
      ]);

    // Construir grafo de conexiones
    const grafo = construirGrafoConexiones(vinculaciones);

    // Detectar comunidades/redes
    const redesDetectadas = detectarComunidades(
      grafo,
      parseInt(umbral_conexiones)
    );

    // Clasificar redes por tipo y peligrosidad
    const redesClasificadas = await clasificarRedesCriminales(redesDetectadas);

    // Comparar con bandas conocidas si se solicita
    let comparacionBandas = null;
    if (incluir_bandas_conocidas === 'true') {
      comparacionBandas = await compararConBandasConocidas(redesDetectadas);
    }

    res.json({
      parametros: {
        umbral_conexiones: parseInt(umbral_conexiones),
        nivel_confianza_min: parseFloat(nivel_confianza_min),
      },
      total_redes_detectadas: redesDetectadas.length,
      redes_clasificadas: redesClasificadas,
      comparacion_bandas_conocidas: comparacionBandas,
      alertas_nuevas_redes: identificarNuevasRedes(
        redesDetectadas,
        comparacionBandas
      ),
    });
  } catch (error) {
    next(error);
  }
};

// ==================== FUNCIONES AUXILIARES ====================

// Obtener vinculación por ID con información completa
async function obtenerVinculacionPorId(id) {
  return await db('vinculaciones_criminales as vc')
    .join('personas_registradas as origen', 'vc.persona_origen_id', 'origen.id')
    .join(
      'personas_registradas as destino',
      'vc.persona_destino_id',
      'destino.id'
    )
    .where('vc.id', id)
    .select(
      'vc.*',
      db.raw(`
        json_build_object(
          'id', origen.id,
          'nombre', origen.nombre,
          'apellido', origen.apellido,
          'dni', origen.dni,
          'foto_principal', origen.foto_principal
        ) as persona_origen
      `),
      db.raw(`
        json_build_object(
          'id', destino.id,
          'nombre', destino.nombre,
          'apellido', destino.apellido,
          'dni', destino.dni,
          'foto_principal', destino.foto_principal
        ) as persona_destino
      `)
    )
    .first();
}

// Calcular métricas de vinculación
async function calcularMetricasVinculacion(vinculacion) {
  let score = 0;

  // Factor por tipo de vinculación
  const factoresTipo = {
    familiar_sangre: 0.8,
    complice_directo: 0.9,
    socio_comercial: 0.7,
    jerarquia_comando: 0.85,
    coordinacion_operativa: 0.8,
    relacion_sentimental: 0.6,
    amistad_personal: 0.4,
  };

  score += (factoresTipo[vinculacion.tipo_vinculacion] || 0.3) * 0.4;

  // Factor por nivel de confianza
  score += vinculacion.nivel_confianza * 0.3;

  // Factor por fuerza de vinculación
  const factoresFuerza = {
    muy_fuerte: 0.9,
    fuerte: 0.7,
    moderada: 0.5,
    debil: 0.3,
    muy_debil: 0.1,
  };

  score += (factoresFuerza[vinculacion.fuerza_vinculacion] || 0.5) * 0.2;

  // Factor por frecuencia de contacto
  const factoresFrecuencia = {
    diaria: 0.9,
    semanal: 0.7,
    quincenal: 0.5,
    mensual: 0.3,
    esporadica: 0.1,
  };

  score += (factoresFrecuencia[vinculacion.frecuencia_contacto] || 0.2) * 0.1;

  return {
    scoreImportancia: Math.min(score, 1.0),
  };
}

// Construir red extendida
async function construirRedExtendida(
  personaId,
  profundidad,
  nivelConfianzaMin
) {
  const visitados = new Set();
  const nodos = [];
  const vinculos = [];

  await construirRedRecursiva(
    personaId,
    0,
    profundidad,
    nivelConfianzaMin,
    visitados,
    nodos,
    vinculos
  );

  return { nodos, vinculos };
}

// Función recursiva para construir red
async function construirRedRecursiva(
  personaId,
  nivelActual,
  profundidadMax,
  nivelConfianzaMin,
  visitados,
  nodos,
  vinculos
) {
  if (nivelActual >= profundidadMax || visitados.has(personaId)) {
    return;
  }

  visitados.add(personaId);

  // Agregar nodo actual
  const persona = await db('personas_registradas')
    .where('id', personaId)
    .first();

  if (persona) {
    nodos.push({
      id: persona.id,
      nombre: `${persona.nombre} ${persona.apellido}`,
      dni: persona.dni,
      nivel: nivelActual,
      tipo: 'persona',
    });
  }

  // Obtener vinculaciones de esta persona
  const catsPersona = getCategoriesForMinNivel(nivelConfianzaMin);
  const vinculacionesPersona = await db('vinculaciones_criminales')
    .where(function () {
      this.where('persona_origen_id', personaId).orWhere(
        'persona_destino_id',
        personaId
      );
    })
    .whereIn('nivel_confianza', catsPersona)
    .whereIn('estado_vinculacion', ['activa_confirmada', 'activa_sospechosa']);

  for (const vinc of vinculacionesPersona) {
    const otraPersonaId =
      vinc.persona_origen_id === personaId
        ? vinc.persona_destino_id
        : vinc.persona_origen_id;

    // Agregar vínculo
    vinculos.push({
      id: vinc.id,
      origen: personaId,
      destino: otraPersonaId,
      tipo: vinc.tipo_vinculacion,
      fuerza: vinc.fuerza_vinculacion,
      nivel_confianza: vinc.nivel_confianza,
    });

    // Recursión para la siguiente persona
    await construirRedRecursiva(
      otraPersonaId,
      nivelActual + 1,
      profundidadMax,
      nivelConfianzaMin,
      visitados,
      nodos,
      vinculos
    );
  }
}

// Otras funciones auxiliares para análisis de redes...
// [Implementar según necesidades específicas]

// Stub seguro para actualizar métricas de centralidad.
// En entornos de desarrollo o cuando la implementación completa no está disponible,
// simplemente devolvemos sin hacer nada. Mantener firma async para compatibilidad
// con llamadas que pasan una transacción (trx) o un objeto cualquiera.
async function actualizarMetricasCentralidad(trxOrNull, personaIds) {
  // Implementación concreta: centralidad por grado (número de vinculaciones activas)
  // personaIds puede ser un array de IDs, o null para recalcular todo (evitar en producción)
  const personaList = Array.isArray(personaIds)
    ? Array.from(new Set(personaIds.filter(Boolean)))
    : [];
  if (personaList.length === 0) return;

  const useTrx =
    trxOrNull &&
    typeof trxOrNull === 'object' &&
    typeof trxOrNull.commit === 'function';
  const exec = useTrx ? trxOrNull : db;

  try {
    // Para cada persona calculamos el grado contando vinculaciones activas (origen o destino)
    for (const pid of personaList) {
      const cats = [
        'confirmado_evidencia',
        'confirmado_testigo',
        'probable_investigacion',
        'sospechoso_indicios',
      ];

      const res = await exec('vinculaciones_criminales')
        .where(function () {
          this.where('persona_origen_id', pid).orWhere(
            'persona_destino_id',
            pid
          );
        })
        .whereIn('nivel_confianza', cats)
        .whereIn('estado_vinculacion', [
          'activa_confirmada',
          'activa_sospechosa',
        ])
        .count('* as count')
        .first();

      const grado = parseInt(res && res.count ? res.count : 0, 10);

      await exec('personas_registradas').where('id', pid).update({
        centralidad_grado: grado,
        centralidad_actualizada_at: new Date(),
      });
    }
  } catch (e) {
    // No bloquear la operación principal si falla la actualización de métricas
    console.warn('Error actualizando métricas de centralidad:', e && e.message);
  }
}

module.exports = exports;
