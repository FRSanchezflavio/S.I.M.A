const db = require('../db/knex');
const Joi = require('joi');

// Esquemas de validación avanzados
const bandaSchema = Joi.object({
  nombre: Joi.string().min(3).max(150).required(),
  alias: Joi.string().max(100).allow('', null),
  descripcion: Joi.string().allow('', null),
  tipo_criminal: Joi.string()
    .valid(
      'delictiva_general',
      'narcotraficante',
      'robo_automotor',
      'asaltos_violentos',
      'secuestros_extorsivos',
      'estafas_tecnologicas',
      'trata_personas',
      'lavado_dinero',
      'contrabando',
      'cibercrimen',
      'otros'
    )
    .required(),
  nivel_peligrosidad: Joi.string()
    .valid('bajo', 'medio', 'alto', 'extremo')
    .required(),
  estado_operacional: Joi.string()
    .valid(
      'activa',
      'en_investigacion',
      'desarticulada_parcial',
      'desarticulada_total',
      'inactiva_temporal',
      'reorganizandose',
      'desconocido'
    )
    .required(),
  lider_principal_id: Joi.number().integer().allow(null),
  territorio_principal: Joi.string().max(200).allow('', null),
  poligonos_territorio: Joi.array().allow(null),
  puntos_interes: Joi.array().allow(null),
  latitud_centro: Joi.number().min(-90).max(90).allow(null),
  longitud_centro: Joi.number().min(-180).max(180).allow(null),
  radio_influencia_km: Joi.number().integer().min(1).allow(null),
  miembros_estimados: Joi.number().integer().min(1).allow(null),
  modus_operandi: Joi.object().allow(null),
  patrones_temporales: Joi.object().allow(null),
  armas_utilizadas: Joi.array().allow(null),
  vehiculos_utilizados: Joi.array().allow(null),
  fecha_formacion: Joi.date().allow(null),
  fecha_primera_deteccion: Joi.date().allow(null),
  fecha_ultima_actividad: Joi.date().allow(null),
  fecha_desarticulacion: Joi.date().allow(null),
  daño_economico_estimado: Joi.number().min(0).allow(null),
  conexiones_otras_bandas: Joi.array().allow(null),
  color_mapa: Joi.string()
    .pattern(/^#[0-9A-F]{6}$/i)
    .default('#ff0000'),
  simbolo_mapa: Joi.string().max(50).default('circle'),
  tamaño_marcador: Joi.number().integer().min(5).max(50).default(10),
  fuente_informacion: Joi.string().max(200).allow('', null),
  investigador_asignado: Joi.string().max(100).allow('', null),
  nivel_confidencialidad: Joi.string()
    .valid('publico', 'restringido', 'confidencial', 'secreto')
    .default('restringido'),
});

const miembroSchema = Joi.object({
  persona_id: Joi.number().integer().required(),
  rol_principal: Joi.string()
    .valid(
      'lider_maximo',
      'sublider',
      'lugarteniente',
      'operativo_senior',
      'operativo',
      'reclutador',
      'informante_interno',
      'especialista_armas',
      'especialista_vehiculos',
      'contador_lavado',
      'contacto_corrupcion',
      'sicario',
      'halcon_vigilancia',
      'complice_ocasional',
      'colaborador_externo',
      'sospechoso_vinculacion'
    )
    .required(),
  nivel_jerarquico: Joi.string()
    .valid(
      'comando_superior',
      'comando_medio',
      'operativo_confianza',
      'operativo_regular',
      'recluta_nuevo',
      'externo_ocasional'
    )
    .required(),
  estado_miembro: Joi.string()
    .valid(
      'activo_confirmado',
      'activo_sospechoso',
      'inactivo_temporal',
      'desertor_confirmado',
      'detenido_proceso',
      'detenido_condenado',
      'fallecido_operacion',
      'fallecido_natural',
      'desaparecido',
      'expulsado_banda',
      'infiltrado_sospechoso'
    )
    .default('activo_sospechoso'),
  fecha_ingreso_estimada: Joi.date().allow(null),
  fecha_ingreso_confirmada: Joi.date().allow(null),
  fecha_salida: Joi.date().allow(null),
  motivo_salida: Joi.string().allow('', null),
  especialidades: Joi.array().allow(null),
  territorios_asignados: Joi.array().allow(null),
  delitos_atribuidos: Joi.number().integer().min(0).default(0),
  nivel_confianza_liderazgo: Joi.number().min(0).max(1).allow(null),
  es_fundador: Joi.boolean().default(false),
  tiene_familiares_banda: Joi.boolean().default(false),
  nivel_violencia: Joi.string()
    .valid(
      'no_violento',
      'amenazas',
      'violencia_menor',
      'violencia_grave',
      'extremadamente_violento'
    )
    .default('no_violento'),
  observaciones_investigacion: Joi.string().allow('', null),
  metodos_comunicacion: Joi.string().allow('', null),
});

// ==================== CONTROLADORES DE BANDAS ====================

// Listar bandas con filtros avanzados y análisis
exports.list = async (req, res, next) => {
  try {
    const {
      tipo_criminal,
      estado_operacional,
      nivel_peligrosidad,
      territorio,
      lider_id,
      fecha_desde,
      fecha_hasta,
      incluir_metricas = false,
      incluir_actividad_reciente = false,
      page = 1,
      pageSize = 20,
      ordenar_por = 'fecha_ultima_actividad',
      orden = 'desc',
    } = req.query;

    const p = Math.max(1, parseInt(page));
    const ps = Math.min(100, Math.max(1, parseInt(pageSize)));

    let query = db('bandas_criminales as bc')
      .whereNull('bc.deleted_at')
      .select(
        'bc.*',
        db.raw('COUNT(DISTINCT mb.id) as total_miembros_confirmados'),
        db.raw(
          'COUNT(DISTINCT CASE WHEN mb.estado_miembro IN (?) THEN mb.id END) as miembros_activos',
          [['activo_confirmado', 'activo_sospechoso']]
        ),
        db.raw(`
          json_build_object(
            'id', lider.id,
            'nombre', lider.nombre,
            'apellido', lider.apellido,
            'dni', lider.dni,
            'foto_principal', lider.foto_principal
          ) as lider_info
        `),
        db.raw('MAX(at.fecha_actividad) as ultima_actividad_territorial'),
        db.raw('COUNT(DISTINCT at.id) as actividades_registradas')
      )
      .leftJoin('miembros_banda as mb', 'bc.id', 'mb.banda_id')
      .leftJoin(
        'personas_registradas as lider',
        'bc.lider_principal_id',
        'lider.id'
      )
      .leftJoin('actividades_territoriales as at', 'bc.id', 'at.banda_id')
      .groupBy(
        'bc.id',
        'lider.id',
        'lider.nombre',
        'lider.apellido',
        'lider.dni',
        'lider.foto_principal'
      );

    // Aplicar filtros
    if (tipo_criminal) query.where('bc.tipo_criminal', tipo_criminal);
    if (estado_operacional)
      query.where('bc.estado_operacional', estado_operacional);
    if (nivel_peligrosidad)
      query.where('bc.nivel_peligrosidad', nivel_peligrosidad);
    if (territorio)
      query.where('bc.territorio_principal', 'ilike', `%${territorio}%`);
    if (lider_id) query.where('bc.lider_principal_id', lider_id);
    if (fecha_desde)
      query.where('bc.fecha_ultima_actividad', '>=', fecha_desde);
    if (fecha_hasta)
      query.where('bc.fecha_ultima_actividad', '<=', fecha_hasta);

    // Obtener total para paginación
    const total = await query
      .clone()
      .clearSelect()
      .clearGroup()
      .count('DISTINCT bc.id as count')
      .first();

    // Aplicar ordenamiento y paginación
    const ordenamientosValidos = {
      fecha_ultima_actividad: 'bc.fecha_ultima_actividad',
      nombre: 'bc.nombre',
      nivel_peligrosidad: 'bc.nivel_peligrosidad',
      miembros_activos: 'miembros_activos',
      actividades_registradas: 'actividades_registradas',
    };

    const campoOrden =
      ordenamientosValidos[ordenar_por] || 'bc.fecha_ultima_actividad';
    query.orderBy(campoOrden, orden === 'asc' ? 'asc' : 'desc');

    const items = await query.offset((p - 1) * ps).limit(ps);

    // Agregar métricas si se solicita
    if (incluir_metricas === 'true') {
      const bandasIds = items.map(b => b.id);
      if (bandasIds.length > 0) {
        const metricas = await db('metricas_banda')
          .whereIn('banda_id', bandasIds)
          .where(
            'fecha_fin_periodo',
            '>=',
            db.raw("NOW() - INTERVAL '30 days'")
          )
          .select(
            'banda_id',
            'indice_actividad',
            'indice_expansion',
            'indice_violencia'
          );

        const metricasMap = {};
        metricas.forEach(m => {
          metricasMap[m.banda_id] = m;
        });

        items.forEach(banda => {
          banda.metricas_recientes = metricasMap[banda.id] || null;
        });
      }
    }

    // Agregar actividad reciente si se solicita
    if (incluir_actividad_reciente === 'true') {
      const bandasIds = items.map(b => b.id);
      if (bandasIds.length > 0) {
        const actividades = await db('actividades_territoriales')
          .whereIn('banda_id', bandasIds)
          .where('fecha_actividad', '>=', db.raw("NOW() - INTERVAL '7 days'"))
          .orderBy('fecha_actividad', 'desc')
          .select(
            'banda_id',
            'tipo_actividad',
            'fecha_actividad',
            'latitud',
            'longitud'
          );

        const actividadesMap = {};
        actividades.forEach(a => {
          if (!actividadesMap[a.banda_id]) actividadesMap[a.banda_id] = [];
          actividadesMap[a.banda_id].push(a);
        });

        items.forEach(banda => {
          banda.actividades_recientes = actividadesMap[banda.id] || [];
        });
      }
    }

    res.json({
      items,
      pagination: {
        page: p,
        pageSize: ps,
        total: parseInt(total.count),
        totalPages: Math.ceil(total.count / ps),
      },
      filtros_aplicados: {
        tipo_criminal,
        estado_operacional,
        nivel_peligrosidad,
        territorio,
        fecha_desde,
        fecha_hasta,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Crear banda con validaciones avanzadas
exports.create = async (req, res, next) => {
  try {
    const { value, error } = bandaSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Validaciones adicionales
    if (value.lider_principal_id) {
      const liderExiste = await db('personas_registradas')
        .where('id', value.lider_principal_id)
        .first();
      if (!liderExiste) {
        return res
          .status(400)
          .json({ error: 'El líder especificado no existe' });
      }

      // Verificar si ya es líder de otra banda activa
      const yaEsLider = await db('bandas_criminales')
        .where('lider_principal_id', value.lider_principal_id)
        .where('estado_operacional', 'in', ['activa', 'en_investigacion'])
        .whereNull('deleted_at')
        .first();

      if (yaEsLider) {
        return res.status(400).json({
          error: 'Esta persona ya es líder de otra banda activa',
        });
      }
    }

    // Calcular índice de peligrosidad inicial
    const indicePeligrosidad = calcularIndicePeligrosidad(value);

    const trx = await db.transaction();
    try {
      const [banda] = await trx('bandas_criminales')
        .insert({
          ...value,
          indice_peligrosidad: indicePeligrosidad,
          miembros_confirmados: 0,
          delitos_confirmados: 0,
          created_by: req.user?.id,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      // Si hay líder, agregarlo automáticamente como miembro
      if (value.lider_principal_id) {
        await trx('miembros_banda').insert({
          banda_id: banda.id,
          persona_id: value.lider_principal_id,
          rol_principal: 'lider_maximo',
          nivel_jerarquico: 'comando_superior',
          estado_miembro: 'activo_confirmado',
          es_fundador: true,
          fecha_ingreso_confirmada: new Date(),
          created_by: req.user?.id,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Actualizar contador de miembros
        await trx('bandas_criminales')
          .where('id', banda.id)
          .update({ miembros_confirmados: 1 });
      }

      await trx.commit();

      // Obtener banda completa con información del líder
      const bandaCompleta = await obtenerBandaPorId(banda.id);
      res.status(201).json(bandaCompleta);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Obtener banda por ID con información completa
exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { incluir_timeline = false, incluir_analisis = false } = req.query;

    const banda = await obtenerBandaPorId(id);
    if (!banda) {
      return res.status(404).json({ error: 'Banda no encontrada' });
    }

    // Obtener miembros con información detallada
    banda.miembros = await obtenerMiembrosBanda(id);

    // Obtener actividades territoriales recientes
    banda.actividades_territoriales = await db('actividades_territoriales')
      .where('banda_id', id)
      .orderBy('fecha_actividad', 'desc')
      .limit(50);

    // Obtener métricas recientes
    banda.metricas = await db('metricas_banda')
      .where('banda_id', id)
      .orderBy('fecha_fin_periodo', 'desc')
      .limit(6);

    // Timeline de eventos importantes si se solicita
    if (incluir_timeline === 'true') {
      banda.timeline = await generarTimelineBanda(id);
    }

    // Análisis de red si se solicita
    if (incluir_analisis === 'true') {
      banda.analisis_red = await analizarRedBanda(id);
    }

    res.json(banda);
  } catch (error) {
    next(error);
  }
};

// Actualizar banda
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, error } = bandaSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const bandaExiste = await db('bandas_criminales')
      .where('id', id)
      .whereNull('deleted_at')
      .first();

    if (!bandaExiste) {
      return res.status(404).json({ error: 'Banda no encontrada' });
    }

    // Recalcular índice de peligrosidad
    const indicePeligrosidad = calcularIndicePeligrosidad(value);

    const [bandaActualizada] = await db('bandas_criminales')
      .where('id', id)
      .update({
        ...value,
        indice_peligrosidad: indicePeligrosidad,
        updated_by: req.user?.id,
        updated_at: new Date(),
      })
      .returning('*');

    const bandaCompleta = await obtenerBandaPorId(id);
    res.json(bandaCompleta);
  } catch (error) {
    next(error);
  }
};

// Eliminar banda (soft delete)
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banda = await db('bandas_criminales')
      .where('id', id)
      .whereNull('deleted_at')
      .first();

    if (!banda) {
      return res.status(404).json({ error: 'Banda no encontrada' });
    }

    await db('bandas_criminales').where('id', id).update({
      deleted_at: new Date(),
      updated_by: req.user?.id,
      updated_at: new Date(),
    });

    res.json({ message: 'Banda eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

// ==================== GESTIÓN DE MIEMBROS ====================

// Agregar miembro a banda
exports.addMember = async (req, res, next) => {
  try {
    const { bandaId } = req.params;
    const { value, error } = miembroSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Verificar que la banda existe
    const banda = await db('bandas_criminales')
      .where('id', bandaId)
      .whereNull('deleted_at')
      .first();
    if (!banda) {
      return res.status(404).json({ error: 'Banda no encontrada' });
    }

    // Verificar que la persona existe
    const persona = await db('personas_registradas')
      .where('id', value.persona_id)
      .first();
    if (!persona) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    // Verificar si ya es miembro de esta banda
    const yaEsMiembro = await db('miembros_banda')
      .where('banda_id', bandaId)
      .where('persona_id', value.persona_id)
      .first();

    if (yaEsMiembro) {
      return res.status(400).json({
        error: 'La persona ya es miembro de esta banda',
      });
    }

    const trx = await db.transaction();
    try {
      const [miembro] = await trx('miembros_banda')
        .insert({
          banda_id: bandaId,
          ...value,
          created_by: req.user?.id,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      // Actualizar contador de miembros confirmados si aplica
      if (['activo_confirmado'].includes(value.estado_miembro)) {
        await trx('bandas_criminales')
          .where('id', bandaId)
          .increment('miembros_confirmados', 1);
      }

      // Verificar y actualizar familiares en la banda
      await verificarFamiliaresEnBanda(trx, bandaId, value.persona_id);

      await trx.commit();

      // Obtener miembro completo con información de la persona
      const miembroCompleto = await obtenerMiembroPorId(miembro.id);
      res.status(201).json(miembroCompleto);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'La persona ya es miembro de esta banda',
      });
    }
    next(error);
  }
};

// Obtener miembros de una banda
exports.getMembers = async (req, res, next) => {
  try {
    const { bandaId } = req.params;
    const { estado, rol, incluir_historial = false } = req.query;

    let query = db('miembros_banda as mb')
      .join('personas_registradas as pr', 'mb.persona_id', 'pr.id')
      .where('mb.banda_id', bandaId)
      .select(
        'mb.*',
        'pr.nombre',
        'pr.apellido',
        'pr.dni',
        'pr.foto_principal',
        'pr.direccion',
        'pr.telefono',
        'pr.fecha_nacimiento'
      );

    if (estado) query.where('mb.estado_miembro', estado);
    if (rol) query.where('mb.rol_principal', rol);

    const miembros = await query.orderBy('mb.nivel_jerarquico', 'asc');

    // Agregar historial si se solicita
    if (incluir_historial === 'true') {
      for (const miembro of miembros) {
        miembro.historial_delitos = await db('registros_delictuales')
          .where('persona_id', miembro.persona_id)
          .orderBy('created_at', 'desc')
          .limit(10);
      }
    }

    // Agregar análisis de vinculaciones familiares
    for (const miembro of miembros) {
      miembro.familiares_en_banda = await obtenerFamiliaresEnBanda(
        bandaId,
        miembro.persona_id
      );
    }

    res.json({
      banda_id: bandaId,
      total_miembros: miembros.length,
      miembros_por_estado: await contarMiembrosPorEstado(bandaId),
      miembros_por_rol: await contarMiembrosPorRol(bandaId),
      miembros,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ANÁLISIS Y MÉTRICAS ====================

// Análisis territorial de bandas
exports.territorialAnalysis = async (req, res, next) => {
  try {
    const { incluir_conflictos = true, incluir_expansion = true } = req.query;

    // Obtener todas las bandas activas con información territorial
    const bandas = await db('bandas_criminales')
      .where('estado_operacional', 'in', ['activa', 'en_investigacion'])
      .whereNull('deleted_at')
      .whereNotNull('latitud_centro')
      .whereNotNull('longitud_centro')
      .select('*');

    const analisisResult = {
      total_bandas_territorio: bandas.length,
      coverage_map: [],
      conflictos_territoriales: [],
      expansion_analysis: [],
    };

    // Generar mapa de cobertura
    for (const banda of bandas) {
      const territorio = {
        banda_id: banda.id,
        nombre: banda.nombre,
        centro: [banda.latitud_centro, banda.longitud_centro],
        radio_km: banda.radio_influencia_km || 5,
        color: banda.color_mapa,
        nivel_control: await calcularNivelControl(banda.id),
        actividades_recientes: await contarActividadesRecientes(banda.id, 30),
      };

      if (banda.poligonos_territorio) {
        territorio.poligonos = banda.poligonos_territorio;
      }

      analisisResult.coverage_map.push(territorio);
    }

    // Análisis de conflictos territoriales
    if (incluir_conflictos === 'true') {
      analisisResult.conflictos_territoriales =
        await analizarConflictoTerritoriales(bandas);
    }

    // Análisis de expansión territorial
    if (incluir_expansion === 'true') {
      analisisResult.expansion_analysis = await analizarExpansionTerritorial(
        bandas
      );
    }

    res.json(analisisResult);
  } catch (error) {
    next(error);
  }
};

// Análisis de jerarquías y estructura organizacional
exports.organizationalAnalysis = async (req, res, next) => {
  try {
    const { bandaId } = req.params;

    const banda = await db('bandas_criminales')
      .where('id', bandaId)
      .whereNull('deleted_at')
      .first();

    if (!banda) {
      return res.status(404).json({ error: 'Banda no encontrada' });
    }

    // Obtener estructura jerárquica
    const estructura = await construirEstructuraJerarquica(bandaId);

    // Análisis de centralidad y poder
    const analisisCentralidad = await analizarCentralidadMiembros(bandaId);

    // Detectar vulnerabilidades organizacionales
    const vulnerabilidades = await detectarVulnerabilidades(bandaId);

    // Análisis de comunicación y coordinación
    const patrones_comunicacion = await analizarPatronesComunicacion(bandaId);

    res.json({
      banda_id: bandaId,
      nombre_banda: banda.nombre,
      estructura_jerarquica: estructura,
      analisis_centralidad: analisisCentralidad,
      vulnerabilidades_detectadas: vulnerabilidades,
      patrones_comunicacion,
      recomendaciones_investigacion: generarRecomendacionesInvestigacion(
        estructura,
        analisisCentralidad,
        vulnerabilidades
      ),
    });
  } catch (error) {
    next(error);
  }
};

// ==================== FUNCIONES AUXILIARES ====================

// Calcular índice de peligrosidad
function calcularIndicePeligrosidad(banda) {
  let indice = 0;

  // Factor por tipo criminal
  const factoresTipo = {
    narcotraficante: 0.4,
    secuestros_extorsivos: 0.35,
    asaltos_violentos: 0.3,
    trata_personas: 0.35,
    robo_automotor: 0.2,
    estafas_tecnologicas: 0.15,
    lavado_dinero: 0.25,
    delictiva_general: 0.2,
  };

  indice += factoresTipo[banda.tipo_criminal] || 0.2;

  // Factor por nivel de peligrosidad declarado
  const factoresPeligrosidad = {
    extremo: 0.3,
    alto: 0.2,
    medio: 0.1,
    bajo: 0.05,
  };

  indice += factoresPeligrosidad[banda.nivel_peligrosidad] || 0.1;

  // Factor por territorio (mayor territorio = mayor influencia)
  if (banda.radio_influencia_km) {
    indice += Math.min(banda.radio_influencia_km / 50, 0.2);
  }

  // Factor por daño económico
  if (banda.daño_economico_estimado) {
    indice += Math.min(banda.daño_economico_estimado / 1000000, 0.1);
  }

  return Math.min(indice, 1.0); // Máximo 1.0
}

// Obtener banda por ID con información completa
async function obtenerBandaPorId(id) {
  return await db('bandas_criminales as bc')
    .leftJoin(
      'personas_registradas as lider',
      'bc.lider_principal_id',
      'lider.id'
    )
    .where('bc.id', id)
    .whereNull('bc.deleted_at')
    .select(
      'bc.*',
      db.raw(`
        json_build_object(
          'id', lider.id,
          'nombre', lider.nombre,
          'apellido', lider.apellido,
          'dni', lider.dni,
          'foto_principal', lider.foto_principal
        ) as lider_info
      `)
    )
    .first();
}

// Obtener miembros de banda con información completa
async function obtenerMiembrosBanda(bandaId) {
  return await db('miembros_banda as mb')
    .join('personas_registradas as pr', 'mb.persona_id', 'pr.id')
    .where('mb.banda_id', bandaId)
    .select(
      'mb.*',
      'pr.nombre',
      'pr.apellido',
      'pr.dni',
      'pr.foto_principal',
      'pr.direccion'
    )
    .orderBy([
      { column: 'mb.nivel_jerarquico', order: 'asc' },
      { column: 'mb.fecha_ingreso_confirmada', order: 'asc' },
    ]);
}

// Generar timeline de eventos de banda
async function generarTimelineBanda(bandaId) {
  const eventos = [];

  // Agregar eventos de creación, cambios de estado, etc.
  // Implementación específica según necesidades

  return eventos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

// Otras funciones auxiliares...
// [Implementar según necesidades específicas]

module.exports = exports;
