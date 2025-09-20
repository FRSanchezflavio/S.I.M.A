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
    if (nivel_confianza_min)
      query.where('vc.nivel_confianza', '>=', parseFloat(nivel_confianza_min));

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
    const { value, error } = vinculacionSchema.validate(req.body);
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
      const [vinculacion] = await trx('vinculaciones_criminales')
        .insert({
          ...value,
          score_importancia: metricas.scoreImportancia,
          created_by: req.user?.id,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      // Si es bidireccional, crear la vinculación inversa
      if (value.es_bidireccional) {
        await trx('vinculaciones_criminales').insert({
          ...value,
          persona_origen_id: value.persona_destino_id,
          persona_destino_id: value.persona_origen_id,
          score_importancia: metricas.scoreImportancia,
          es_vinculacion_inversa: true,
          vinculacion_principal_id: vinculacion.id,
          created_by: req.user?.id,
          created_at: new Date(),
          updated_at: new Date(),
        });
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
      throw error;
    }
  } catch (error) {
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
    const { value, error } = vinculacionSchema.validate(req.body);
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
    const vinculaciones = await db('vinculaciones_criminales')
      .where('nivel_confianza', '>=', parseFloat(nivel_confianza_min))
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
  const vinculacionesPersona = await db('vinculaciones_criminales')
    .where(function () {
      this.where('persona_origen_id', personaId).orWhere(
        'persona_destino_id',
        personaId
      );
    })
    .where('nivel_confianza', '>=', nivelConfianzaMin)
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

// Funciones específicas para análisis de inteligencia criminal

// Endpoint para obtener datos optimizados para visualización D3.js
exports.getNetworkVisualization = async (req, res, next) => {
  try {
    const { personaId } = req.params;
    const { profundidad = 3, incluirMetricas = true } = req.query;

    // Obtener la red de la persona con la profundidad especificada
    const networkData = await exports.networkAnalysis(
      { params: { personaId }, query: { profundidad } },
      { json: data => data },
      () => {}
    );

    // Formatear datos para D3.js
    const nodes = networkData.nodos.map(persona => ({
      id: persona.id,
      name: `${persona.nombre} ${persona.apellido}`,
      dni: persona.dni,
      foto: persona.foto_principal,
      tipo: 'persona',
      centralidad: incluirMetricas
        ? calcularCentralidad(persona.id, networkData.vinculos)
        : 0,
      cluster: null, // Se calculará en el frontend
    }));

    const links = networkData.vinculos.map(vinculo => ({
      source: vinculo.persona_origen_id,
      target: vinculo.persona_destino_id,
      tipo: vinculo.tipo_vinculacion,
      peso: vinculo.nivel_confianza,
      descripcion: vinculo.descripcion,
      fecha: vinculo.fecha_deteccion,
      evidencias: vinculo.evidencias_respaldo || [],
    }));

    res.json({
      nodes,
      links,
      metricas: incluirMetricas
        ? {
            totalNodos: nodes.length,
            totalVinculos: links.length,
            densidad: calcularDensidadRed(nodes.length, links.length),
            componentesConectados: calcularComponentesConectados(nodes, links),
          }
        : null,
    });
  } catch (error) {
    console.error('Error en getNetworkVisualization:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message,
    });
  }
};

// Crear vinculación avanzada con auditoría completa
exports.createAdvanced = async (req, res, next) => {
  try {
    const { error, value } = vinculacionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Datos de vinculación inválidos',
        details: error.details.map(d => d.message),
      });
    }

    // Validaciones específicas de negocio
    if (value.persona_origen_id === value.persona_destino_id) {
      return res.status(400).json({
        error: 'No se permite crear auto-vinculaciones',
      });
    }

    // Verificar que ambas personas existan
    const [personaOrigen, personaDestino] = await Promise.all([
      db('personas').where('id', value.persona_origen_id).first(),
      db('personas').where('id', value.persona_destino_id).first(),
    ]);

    if (!personaOrigen || !personaDestino) {
      return res.status(404).json({
        error: 'Una o ambas personas no existen en el sistema',
      });
    }

    // Verificar permisos del usuario
    const usuario = req.user;
    if (!usuario || !['admin', 'analista'].includes(usuario.rol)) {
      return res.status(403).json({
        error: 'No tiene permisos para crear vinculaciones',
      });
    }

    // Verificar si ya existe una vinculación similar
    const vinculacionExistente = await db('vinculaciones_criminales')
      .where(function () {
        this.where({
          persona_origen_id: value.persona_origen_id,
          persona_destino_id: value.persona_destino_id,
        }).orWhere({
          persona_origen_id: value.persona_destino_id,
          persona_destino_id: value.persona_origen_id,
        });
      })
      .where('estado_vinculacion', 'activa_confirmada')
      .first();

    if (vinculacionExistente) {
      return res.status(409).json({
        error: 'Ya existe una vinculación activa entre estas personas',
        vinculacionExistente: vinculacionExistente.id,
      });
    }

    // Crear la vinculación con auditoría
    const trx = await db.transaction();

    try {
      const [vinculacionId] = await trx('vinculaciones_criminales')
        .insert({
          ...value,
          usuario_created: usuario.id,
          fecha_deteccion: value.fecha_deteccion || new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('id');

      // Crear vínculo bidireccional automáticamente
      const tipoVinculoInverso = obtenerTipoVinculoInverso(
        value.tipo_vinculacion
      );
      if (tipoVinculoInverso) {
        await trx('vinculaciones_criminales').insert({
          ...value,
          persona_origen_id: value.persona_destino_id,
          persona_destino_id: value.persona_origen_id,
          tipo_vinculacion: tipoVinculoInverso,
          vinculacion_principal_id: vinculacionId,
          usuario_created: usuario.id,
          fecha_deteccion: value.fecha_deteccion || new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      // Registrar auditoría
      await trx('auditoria_inteligencia').insert({
        usuario_id: usuario.id,
        accion: 'CREAR_VINCULACION',
        entidad_tipo: 'vinculacion',
        entidad_id: vinculacionId,
        datos_nuevos: JSON.stringify(value),
        ip_origen: req.ip,
        user_agent: req.headers['user-agent'],
        justificacion: value.justificacion || 'Vinculación creada por análisis',
        timestamp: new Date(),
      });

      await trx.commit();

      res.status(201).json({
        message: 'Vinculación creada exitosamente',
        vinculacionId,
        bidireccional: !!tipoVinculoInverso,
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error en createAdvanced:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message,
    });
  }
};

// Obtener métricas de centralidad para una persona
exports.getMetricasCentralidad = async (req, res, next) => {
  try {
    const { personaId } = req.params;

    // Obtener toda la red de la persona
    const networkData = await exports.networkAnalysis(
      { params: { personaId }, query: { profundidad: 5 } },
      { json: data => data },
      () => {}
    );

    const metricas = {
      centralidadGrado: calcularCentralidadGrado(
        personaId,
        networkData.vinculos
      ),
      centralidadBetweenness: calcularCentralidadBetweenness(
        personaId,
        networkData
      ),
      centralidadCloseness: calcularCentralidadCloseness(
        personaId,
        networkData
      ),
      centralidadEigenvector: calcularCentralidadEigenvector(
        personaId,
        networkData
      ),
      coeficienteClusterizacion: calcularCoeficienteClusterizacion(
        personaId,
        networkData
      ),
    };

    res.json({
      personaId: parseInt(personaId),
      metricas,
      interpretacion: interpretarMetricas(metricas),
    });
  } catch (error) {
    console.error('Error en getMetricasCentralidad:', error);
    res.status(500).json({
      error: 'Error al calcular métricas de centralidad',
      details: error.message,
    });
  }
};

// Detectar bandas automáticamente usando algoritmo de Louvain
exports.detectarBandasAutomatico = async (req, res, next) => {
  try {
    const { umbralModularidad = 0.3, tamamoMinimo = 3 } = req.query;

    // Obtener todas las vinculaciones activas
    const vinculaciones = await db('vinculaciones_criminales as vc')
      .select(
        'vc.*',
        'po.id as origen_id',
        'po.nombre as origen_nombre',
        'po.apellido as origen_apellido',
        'pd.id as destino_id',
        'pd.nombre as destino_nombre',
        'pd.apellido as destino_apellido'
      )
      .join('personas as po', 'vc.persona_origen_id', 'po.id')
      .join('personas as pd', 'vc.persona_destino_id', 'pd.id')
      .whereIn('vc.estado_vinculacion', [
        'activa_confirmada',
        'activa_sospechosa',
      ])
      .where('vc.nivel_confianza', '>=', 0.5);

    // Aplicar algoritmo de Louvain para detección de comunidades
    const comunidades = aplicarAlgoritmoLouvain(
      vinculaciones,
      umbralModularidad
    );

    // Filtrar comunidades por tamaño mínimo
    const bandasDetectadas = comunidades
      .filter(comunidad => comunidad.miembros.length >= tamamoMinimo)
      .map((comunidad, index) => ({
        id: `banda_auto_${Date.now()}_${index}`,
        nombre: `Banda Detectada ${index + 1}`,
        miembros: comunidad.miembros,
        lider: identificarLider(comunidad.miembros, vinculaciones),
        cohesion: comunidad.modularidad,
        tiposPredominantes: analizarTiposVinculacionPredominantes(
          comunidad,
          vinculaciones
        ),
        zonaInfluencia: calcularZonaInfluencia(comunidad.miembros),
      }));

    res.json({
      bandasDetectadas,
      estadisticas: {
        totalComunidades: comunidades.length,
        bandasValidas: bandasDetectadas.length,
        modularidadGlobal: calcularModularidadGlobal(comunidades),
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error en detectarBandasAutomatico:', error);
    res.status(500).json({
      error: 'Error en detección automática de bandas',
      details: error.message,
    });
  }
};

// Funciones auxiliares para cálculos de redes

function calcularCentralidad(personaId, vinculos) {
  const vinculosPersona = vinculos.filter(
    v => v.persona_origen_id === personaId || v.persona_destino_id === personaId
  );
  return vinculosPersona.length;
}

function calcularDensidadRed(numNodos, numVinculos) {
  if (numNodos <= 1) return 0;
  const maxVinculos = (numNodos * (numNodos - 1)) / 2;
  return numVinculos / maxVinculos;
}

function calcularComponentesConectados(nodos, vinculos) {
  const visitados = new Set();
  let componentes = 0;

  nodos.forEach(nodo => {
    if (!visitados.has(nodo.id)) {
      dfsComponente(nodo.id, vinculos, visitados);
      componentes++;
    }
  });

  return componentes;
}

function dfsComponente(nodoId, vinculos, visitados) {
  visitados.add(nodoId);

  vinculos.forEach(vinculo => {
    let vecino = null;
    if (vinculo.source === nodoId && !visitados.has(vinculo.target)) {
      vecino = vinculo.target;
    } else if (vinculo.target === nodoId && !visitados.has(vinculo.source)) {
      vecino = vinculo.source;
    }

    if (vecino) {
      dfsComponente(vecino, vinculos, visitados);
    }
  });
}

function calcularCentralidadGrado(personaId, vinculos) {
  return vinculos.filter(
    v => v.persona_origen_id === personaId || v.persona_destino_id === personaId
  ).length;
}

function calcularCentralidadBetweenness(personaId, networkData) {
  // Implementación simplificada del algoritmo de Brandes
  // En producción, usar librería especializada
  return Math.random() * 100; // Placeholder
}

function calcularCentralidadCloseness(personaId, networkData) {
  // Implementación simplificada
  return Math.random() * 100; // Placeholder
}

function calcularCentralidadEigenvector(personaId, networkData) {
  // Implementación simplificada
  return Math.random() * 100; // Placeholder
}

function calcularCoeficienteClusterizacion(personaId, networkData) {
  // Implementación simplificada
  return Math.random(); // Placeholder
}

function interpretarMetricas(metricas) {
  const interpretaciones = [];

  if (metricas.centralidadGrado > 10) {
    interpretaciones.push('Alta conectividad - Persona muy influyente');
  }

  if (metricas.centralidadBetweenness > 50) {
    interpretaciones.push('Intermediario clave - Conecta diferentes grupos');
  }

  if (metricas.coeficienteClusterizacion > 0.7) {
    interpretaciones.push('Opera en grupos muy cohesionados');
  }

  return interpretaciones;
}

function obtenerTipoVinculoInverso(tipo) {
  const mappingInverso = {
    jerarquia_comando: 'subordinado_jerarquia',
    subordinado_jerarquia: 'jerarquia_comando',
    mentor_discipulo: 'discipulo_mentor',
    discipulo_mentor: 'mentor_discipulo',
    empleador_empleado: 'empleado_empleador',
    empleado_empleador: 'empleador_empleado',
  };

  return mappingInverso[tipo] || tipo; // Si no tiene inverso específico, usa el mismo tipo
}

function aplicarAlgoritmoLouvain(vinculos, umbralModularidad) {
  // Implementación simplificada del algoritmo de Louvain
  // En producción, usar librería especializada como jLouvain

  const personas = new Set();
  vinculos.forEach(v => {
    personas.add(v.persona_origen_id);
    personas.add(v.persona_destino_id);
  });

  // Crear comunidades iniciales (cada persona en su propia comunidad)
  const comunidades = Array.from(personas).map(personaId => ({
    id: personaId,
    miembros: [personaId],
    modularidad: 0,
  }));

  // Simulación simplificada - en producción implementar algoritmo completo
  return comunidades.slice(0, Math.min(5, comunidades.length));
}

function identificarLider(miembros, vinculos) {
  // Identificar líder basado en centralidad de grado
  const centralidades = miembros.map(miembro => ({
    id: miembro,
    centralidad: calcularCentralidadGrado(miembro, vinculos),
  }));

  return centralidades.sort((a, b) => b.centralidad - a.centralidad)[0]?.id;
}

function analizarTiposVinculacionPredominantes(comunidad, vinculos) {
  const tiposCount = {};

  vinculos.forEach(vinculo => {
    if (
      comunidad.miembros.includes(vinculo.persona_origen_id) &&
      comunidad.miembros.includes(vinculo.persona_destino_id)
    ) {
      tiposCount[vinculo.tipo_vinculacion] =
        (tiposCount[vinculo.tipo_vinculacion] || 0) + 1;
    }
  });

  return Object.entries(tiposCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tipo, count]) => ({ tipo, frecuencia: count }));
}

function calcularZonaInfluencia(miembros) {
  // Placeholder - en producción calcular basado en actividades geográficas
  return {
    centro: { lat: -26.8083, lng: -65.2176 }, // Tucumán
    radio: Math.random() * 10 + 5, // Radio en km
  };
}

function calcularModularidadGlobal(comunidades) {
  // Cálculo simplificado de modularidad
  return (
    comunidades.reduce((acc, com) => acc + com.modularidad, 0) /
    comunidades.length
  );
}

module.exports = exports;
