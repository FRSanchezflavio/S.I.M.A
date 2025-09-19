/**
 * Migración: Sistema Avanzado de Bandas y Vinculaciones Criminales
 * Incluye análisis temporal, geolocalización avanzada, y métricas de inteligencia
 */
exports.up = function (knex) {
  return (
    knex.schema
      // Tabla principal de bandas criminales
      .createTable('bandas_criminales', function (table) {
        table.increments('id').primary();
        table.string('nombre', 150).notNullable();
        table.string('alias', 100).nullable();
        table.text('descripcion').nullable();

        // Clasificación y tipología
        table
          .enu('tipo_criminal', [
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
            'otros',
          ])
          .defaultTo('delictiva_general');

        table
          .enu('nivel_peligrosidad', ['bajo', 'medio', 'alto', 'extremo'])
          .defaultTo('medio');

        table
          .enu('estado_operacional', [
            'activa',
            'en_investigacion',
            'desarticulada_parcial',
            'desarticulada_total',
            'inactiva_temporal',
            'reorganizandose',
            'desconocido',
          ])
          .defaultTo('activa');

        // Jerarquía y liderazgo
        table
          .integer('lider_principal_id')
          .unsigned()
          .nullable()
          .references('id')
          .inTable('personas_registradas')
          .onDelete('SET NULL');
        table.jsonb('jerarquia_completa').nullable(); // Estructura jerárquica completa

        // Información territorial y geográfica
        table.string('territorio_principal', 200).nullable();
        table.jsonb('poligonos_territorio').nullable(); // Múltiples polígonos
        table.jsonb('puntos_interes').nullable(); // Puntos de reunión, operación, etc.
        table.float('latitud_centro').nullable();
        table.float('longitud_centro').nullable();
        table.integer('radio_influencia_km').nullable();

        // Información operacional
        table.integer('miembros_confirmados').defaultTo(0);
        table.integer('miembros_estimados').nullable();
        table.jsonb('modus_operandi').nullable(); // Detallado en JSON
        table.jsonb('patrones_temporales').nullable(); // Horarios, días preferidos
        table.jsonb('armas_utilizadas').nullable();
        table.jsonb('vehiculos_utilizados').nullable();

        // Fechas importantes
        table.date('fecha_formacion').nullable();
        table.date('fecha_primera_deteccion').nullable();
        table.date('fecha_ultima_actividad').nullable();
        table.date('fecha_desarticulacion').nullable();

        // Análisis de inteligencia
        table.float('indice_peligrosidad').nullable(); // Calculado automáticamente
        table.integer('delitos_confirmados').defaultTo(0);
        table.decimal('daño_economico_estimado', 15, 2).nullable();
        table.jsonb('conexiones_otras_bandas').nullable();

        // Visualización y marcadores
        table.string('color_mapa', 7).defaultTo('#ff0000');
        table.string('simbolo_mapa', 50).defaultTo('circle');
        table.integer('tamaño_marcador').defaultTo(10);

        // Metadatos de investigación
        table.string('fuente_informacion').nullable();
        table.string('investigador_asignado').nullable();
        table
          .enu('nivel_confidencialidad', [
            'publico',
            'restringido',
            'confidencial',
            'secreto',
          ])
          .defaultTo('restringido');

        // Auditoría completa
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
        table.integer('created_by').unsigned().nullable();
        table.integer('updated_by').unsigned().nullable();

        // Índices para optimización
        table.index(['estado_operacional']);
        table.index(['tipo_criminal']);
        table.index(['nivel_peligrosidad']);
        table.index(['territorio_principal']);
        table.index(['fecha_ultima_actividad']);
        table.index(['lider_principal_id']);
      })

      // Tabla de miembros de bandas con roles detallados
      .createTable('miembros_banda', function (table) {
        table.increments('id').primary();
        table
          .integer('banda_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('bandas_criminales')
          .onDelete('CASCADE');
        table
          .integer('persona_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('personas_registradas')
          .onDelete('CASCADE');

        // Rol y jerarquía
        table
          .enu('rol_principal', [
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
            'sospechoso_vinculacion',
          ])
          .defaultTo('operativo');

        table
          .enu('nivel_jerarquico', [
            'comando_superior',
            'comando_medio',
            'operativo_confianza',
            'operativo_regular',
            'recluta_nuevo',
            'externo_ocasional',
          ])
          .defaultTo('operativo_regular');

        // Estado del miembro
        table
          .enu('estado_miembro', [
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
            'infiltrado_sospechoso',
          ])
          .defaultTo('activo_sospechoso');

        // Información temporal
        table.date('fecha_ingreso_estimada').nullable();
        table.date('fecha_ingreso_confirmada').nullable();
        table.date('fecha_salida').nullable();
        table.text('motivo_salida').nullable();

        // Información operacional
        table.jsonb('especialidades').nullable(); // Habilidades específicas
        table.jsonb('territorios_asignados').nullable();
        table.integer('delitos_atribuidos').defaultTo(0);
        table.float('nivel_confianza_liderazgo').nullable(); // 0-1
        table.boolean('es_fundador').defaultTo(false);
        table.boolean('tiene_familiares_banda').defaultTo(false);

        // Riesgo y peligrosidad
        table
          .enu('nivel_violencia', [
            'no_violento',
            'amenazas',
            'violencia_menor',
            'violencia_grave',
            'extremadamente_violento',
          ])
          .defaultTo('no_violento');

        table.text('observaciones_investigacion').nullable();
        table.text('metodos_comunicacion').nullable();

        // Auditoría
        table.timestamps(true, true);
        table.integer('created_by').unsigned().nullable();
        table.integer('updated_by').unsigned().nullable();

        // Constraints e índices
        table.unique(['banda_id', 'persona_id'], 'unique_banda_persona');
        table.index(['banda_id']);
        table.index(['persona_id']);
        table.index(['rol_principal']);
        table.index(['estado_miembro']);
        table.index(['nivel_jerarquico']);
      })

      // Tabla de vinculaciones avanzadas
      .createTable('vinculaciones_criminales', function (table) {
        table.increments('id').primary();
        table
          .integer('persona_origen_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('personas_registradas')
          .onDelete('CASCADE');
        table
          .integer('persona_destino_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('personas_registradas')
          .onDelete('CASCADE');

        // Tipo de vinculación detallado
        table
          .enu('categoria_vinculacion', [
            'familiar_sanguinea',
            'familiar_politica',
            'sentimental_conyugal',
            'sentimental_ocasional',
            'amistad_personal',
            'amistad_criminal',
            'laboral_legal',
            'laboral_ilegal',
            'delictiva_operacional',
            'delictiva_financiera',
            'territorial_barrial',
            'territorial_carcelaria',
            'comercial_legal',
            'comercial_ilegal',
            'corrupcion_funcionarios',
            'infiltracion_institucional',
            'sospechosa_investigar',
            'confirmada_evidencia',
          ])
          .notNullable();

        table
          .enu('subtipo_especifico', [
            'padre',
            'madre',
            'hijo',
            'hija',
            'hermano',
            'hermana',
            'esposo',
            'esposa',
            'concubino',
            'concubina',
            'novio',
            'novia',
            'suegro',
            'suegra',
            'cuñado',
            'cuñada',
            'primo',
            'primo_lejano',
            'socio_comercial',
            'empleador',
            'empleado',
            'cliente',
            'proveedor',
            'complice_directo',
            'complice_ocasional',
            'encubridor',
            'financista',
            'lider_subordinado',
            'subordinado_lider',
            'igual_jerarquia',
            'vecino_cercano',
            'vecino_barrio',
            'conocido_casual',
            'rival_enemigo',
            'contacto_policial',
            'contacto_judicial',
            'contacto_penitenciario',
            'informante_de',
            'informante_para',
            'extorsionado_por',
            'extorsiona_a',
          ])
          .nullable();

        // Intensidad y frecuencia de la relación
        table
          .enu('intensidad_relacion', [
            'muy_estrecha',
            'estrecha',
            'moderada',
            'ocasional',
            'esporadica',
            'hostil',
            'desconocida',
          ])
          .defaultTo('desconocida');

        table
          .enu('frecuencia_contacto', [
            'diario',
            'semanal',
            'quincenal',
            'mensual',
            'ocasional',
            'una_vez',
            'sin_contacto',
            'desconocida',
          ])
          .defaultTo('desconocida');

        // Nivel de confianza y verificación
        table
          .enu('nivel_confianza', [
            'confirmado_evidencia',
            'confirmado_testigo',
            'probable_investigacion',
            'sospechoso_indicios',
            'rumor_investigar',
            'descartado_falso',
          ])
          .defaultTo('sospechoso_indicios');

        table
          .enu('estado_verificacion', [
            'verificado',
            'en_verificacion',
            'pendiente_verificar',
            'imposible_verificar',
            'descartado',
          ])
          .defaultTo('pendiente_verificar');

        // Información contextual
        table.text('descripcion_relacion').nullable();
        table.jsonb('lugares_encuentro').nullable(); // Dónde se encuentran
        table.jsonb('metodos_comunicacion').nullable(); // Cómo se comunican
        table.date('fecha_inicio_relacion').nullable();
        table.date('fecha_ultima_interaccion').nullable();
        table.date('fecha_fin_relacion').nullable();

        // Fuentes de información
        table.string('fuente_primaria').nullable(); // Investigación, testimonio, etc.
        table.jsonb('fuentes_adicionales').nullable();
        table.text('observaciones_investigador').nullable();
        table.boolean('es_reciproca').defaultTo(true);

        // Impacto en investigación
        table.integer('relevancia_investigacion').nullable(); // 1-10
        table.boolean('es_clave_caso').defaultTo(false);
        table.jsonb('casos_relacionados').nullable();

        // Análisis temporal y geográfico
        table.jsonb('patron_temporal').nullable(); // Cuándo se relacionan
        table.jsonb('patron_geografico').nullable(); // Dónde se relacionan

        // Auditoría
        table.timestamps(true, true);
        table.integer('created_by').unsigned().nullable();
        table.integer('updated_by').unsigned().nullable();

        // Índices para consultas eficientes
        table.index(['persona_origen_id']);
        table.index(['persona_destino_id']);
        table.index(['categoria_vinculacion']);
        table.index(['nivel_confianza']);
        table.index(['estado_verificacion']);
        table.index(['fecha_ultima_interaccion']);
        table.index(['relevancia_investigacion']);
      })

      // Tabla de actividades territoriales
      .createTable('actividades_territoriales', function (table) {
        table.increments('id').primary();
        table
          .integer('banda_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('bandas_criminales')
          .onDelete('CASCADE');

        // Información geográfica
        table.float('latitud').notNullable();
        table.float('longitud').notNullable();
        table.string('direccion_referencial').nullable();
        table.string('zona_territorial').nullable();

        // Tipo de actividad
        table
          .enu('tipo_actividad', [
            'operacion_delictiva',
            'reunion_planificacion',
            'punto_venta_droga',
            'deposito_armas',
            'refugio_temporal',
            'casa_seguridad',
            'laboratorio_droga',
            'centro_lavado',
            'zona_reclutamiento',
            'territorio_control',
            'punto_vigilancia',
            'lugar_eliminacion',
          ])
          .notNullable();

        table.date('fecha_actividad').notNullable();
        table.time('hora_inicio').nullable();
        table.time('hora_fin').nullable();
        table.text('descripcion_actividad').nullable();

        // Participantes
        table.jsonb('miembros_involucrados').nullable();
        table.integer('numero_participantes').nullable();

        // Estado y verificación
        table
          .enu('estado_verificacion', [
            'confirmado',
            'en_investigacion',
            'sospechoso',
            'descartado',
          ])
          .defaultTo('sospechoso');

        table.string('fuente_informacion').nullable();

        // Auditoría
        table.timestamps(true, true);
        table.integer('created_by').unsigned().nullable();

        // Índices geográficos y temporales
        table.index(['banda_id']);
        table.index(['tipo_actividad']);
        table.index(['fecha_actividad']);
        table.index(['latitud', 'longitud']);
      })

      // Tabla de análisis y métricas
      .createTable('metricas_banda', function (table) {
        table.increments('id').primary();
        table
          .integer('banda_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('bandas_criminales')
          .onDelete('CASCADE');

        // Período de análisis
        table.date('fecha_inicio_periodo').notNullable();
        table.date('fecha_fin_periodo').notNullable();

        // Métricas operacionales
        table.integer('delitos_cometidos').defaultTo(0);
        table.integer('miembros_detenidos').defaultTo(0);
        table.integer('miembros_nuevos').defaultTo(0);
        table.decimal('daño_economico', 15, 2).defaultTo(0);

        // Métricas territoriales
        table.float('territorio_expandido_km2').nullable();
        table.integer('zonas_nuevas_control').defaultTo(0);
        table.integer('conflictos_territoriales').defaultTo(0);

        // Índices calculados
        table.float('indice_actividad').nullable(); // 0-1
        table.float('indice_expansion').nullable(); // 0-1
        table.float('indice_violencia').nullable(); // 0-1
        table.float('indice_consolidacion').nullable(); // 0-1

        // Auditoría
        table.timestamps(true, true);
        table.integer('calculated_by').unsigned().nullable();

        // Índices
        table.index(['banda_id']);
        table.index(['fecha_inicio_periodo', 'fecha_fin_periodo']);
      })
  );
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('metricas_banda')
    .dropTableIfExists('actividades_territoriales')
    .dropTableIfExists('vinculaciones_criminales')
    .dropTableIfExists('miembros_banda')
    .dropTableIfExists('bandas_criminales');
};
