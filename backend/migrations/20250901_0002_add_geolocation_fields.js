/**
 * Migración: Campos de geolocalización para personas y registros
 * Agregar campos para coordenadas y geometrías PostGIS (si está disponible)
 */

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  // Verificar si PostGIS está disponible
  let hasPostGIS = false;
  try {
    const result = await knex.raw(`
      SELECT EXISTS(
        SELECT 1 FROM pg_extension WHERE extname = 'postgis'
      ) as exists
    `);
    hasPostGIS = result.rows[0].exists;
  } catch (error) {
    console.log(
      '⚠️  No se puede verificar PostGIS, continuando sin geometrías espaciales'
    );
  }

  // Agregar campos de geolocalización a personas_registradas
  await knex.schema.alterTable('personas_registradas', t => {
    // Coordenadas del domicilio
    t.decimal('domicilio_latitud', 10, 8)
      .nullable()
      .comment('Latitud del domicilio (-90 a 90)');
    t.decimal('domicilio_longitud', 11, 8)
      .nullable()
      .comment('Longitud del domicilio (-180 a 180)');

    // Hacer direccion_completa en lugar de renombrar
    t.text('direccion_completa')
      .nullable()
      .comment('Dirección completa para geocodificación');

    // Campos adicionales para contexto geográfico
    t.string('barrio').nullable();
    t.string('localidad').nullable();
    t.string('codigo_postal').nullable();
    t.boolean('direccion_verificada')
      .defaultTo(false)
      .comment('Indica si la dirección fue geocodificada exitosamente');
  });

  // Solo agregar geometría PostGIS si está disponible
  if (hasPostGIS) {
    try {
      await knex.raw(`
        ALTER TABLE personas_registradas 
        ADD COLUMN domicilio_geoposicion GEOGRAPHY(POINT, 4326);
      `);
      console.log('✅ Geometría PostGIS agregada para personas');
    } catch (error) {
      console.log(
        '⚠️  Error agregando geometría PostGIS para personas:',
        error.message
      );
    }
  }

  // Agregar campos de geolocalización a registros_delictuales
  await knex.schema.alterTable('registros_delictuales', t => {
    // Coordenadas del hecho
    t.decimal('hecho_latitud', 10, 8)
      .nullable()
      .comment('Latitud donde ocurrió el hecho');
    t.decimal('hecho_longitud', 11, 8)
      .nullable()
      .comment('Longitud donde ocurrió el hecho');

    // Campos adicionales para el hecho
    t.string('hecho_direccion').nullable().comment('Dirección del hecho');
    t.string('hecho_barrio').nullable();
    t.string('hecho_localidad').nullable();
    t.boolean('hecho_verificado')
      .defaultTo(false)
      .comment('Indica si la ubicación del hecho fue geocodificada');
  });

  // Renombrar campo lugar a lugar_delito_texto
  try {
    const hasLugar = await knex.schema.hasColumn(
      'registros_delictuales',
      'lugar'
    );
    if (hasLugar) {
      await knex.schema.alterTable('registros_delictuales', t => {
        t.renameColumn('lugar', 'lugar_delito_texto');
      });
    } else {
      // Si no existe, crear el campo
      await knex.schema.alterTable('registros_delictuales', t => {
        t.string('lugar_delito_texto').nullable();
      });
    }
  } catch (error) {
    console.log('⚠️  Error con campo lugar:', error.message);
    // Crear el campo por si acaso
    try {
      await knex.schema.alterTable('registros_delictuales', t => {
        t.string('lugar_delito_texto').nullable();
      });
    } catch (e2) {
      // Ignorar si ya existe
    }
  }

  // Solo agregar geometría PostGIS si está disponible
  if (hasPostGIS) {
    try {
      await knex.raw(`
        ALTER TABLE registros_delictuales 
        ADD COLUMN hecho_geoposicion GEOGRAPHY(POINT, 4326);
      `);
      console.log('✅ Geometría PostGIS agregada para registros');
    } catch (error) {
      console.log(
        '⚠️  Error agregando geometría PostGIS para registros:',
        error.message
      );
    }
  }

  // Crear índices espaciales solo si PostGIS está disponible
  if (hasPostGIS) {
    try {
      await knex.raw(`
        CREATE INDEX IF NOT EXISTS idx_personas_domicilio_geo 
        ON personas_registradas USING GIST (domicilio_geoposicion);
      `);

      await knex.raw(`
        CREATE INDEX IF NOT EXISTS idx_registros_hecho_geo 
        ON registros_delictuales USING GIST (hecho_geoposicion);
      `);
      console.log('✅ Índices espaciales creados');
    } catch (error) {
      console.log('⚠️  Error creando índices espaciales:', error.message);
    }
  }

  // Crear índices para coordenadas numéricas (siempre)
  await knex.schema.alterTable('personas_registradas', t => {
    t.index(['domicilio_latitud', 'domicilio_longitud'], 'idx_personas_coords');
  });

  await knex.schema.alterTable('registros_delictuales', t => {
    t.index(['hecho_latitud', 'hecho_longitud'], 'idx_registros_coords');
  });

  // Migrar datos existentes de direccion a direccion_completa
  try {
    const hasOldDireccion = await knex.schema.hasColumn(
      'personas_registradas',
      'direccion'
    );
    if (hasOldDireccion) {
      await knex.raw(`
        UPDATE personas_registradas 
        SET direccion_completa = direccion 
        WHERE direccion IS NOT NULL AND direccion != '' AND direccion_completa IS NULL;
      `);
    }
  } catch (error) {
    console.log('⚠️  Error migrando datos de dirección:', error.message);
  }

  console.log('✅ Campos de geolocalización agregados correctamente');
  if (!hasPostGIS) {
    console.log(
      '⚠️  PostGIS no está disponible. Funcionalidad espacial avanzada limitada.'
    );
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  // Verificar si PostGIS está disponible
  let hasPostGIS = false;
  try {
    const result = await knex.raw(`
      SELECT EXISTS(
        SELECT 1 FROM pg_extension WHERE extname = 'postgis'
      ) as exists
    `);
    hasPostGIS = result.rows[0].exists;
  } catch (error) {
    // Ignorar error
  }

  // Eliminar índices espaciales si existen
  if (hasPostGIS) {
    try {
      await knex.raw('DROP INDEX IF EXISTS idx_personas_domicilio_geo;');
      await knex.raw('DROP INDEX IF EXISTS idx_registros_hecho_geo;');
    } catch (error) {
      console.log('⚠️  Error eliminando índices espaciales:', error.message);
    }
  }

  // Eliminar índices de coordenadas
  try {
    await knex.schema.alterTable('personas_registradas', t => {
      t.dropIndex(
        ['domicilio_latitud', 'domicilio_longitud'],
        'idx_personas_coords'
      );
    });
  } catch (error) {
    console.log(
      '⚠️  Error eliminando índice de coordenadas personas:',
      error.message
    );
  }

  try {
    await knex.schema.alterTable('registros_delictuales', t => {
      t.dropIndex(['hecho_latitud', 'hecho_longitud'], 'idx_registros_coords');
    });
  } catch (error) {
    console.log(
      '⚠️  Error eliminando índice de coordenadas registros:',
      error.message
    );
  }

  // Restaurar datos de direccion_completa a direccion si existe
  try {
    const hasOldDireccion = await knex.schema.hasColumn(
      'personas_registradas',
      'direccion'
    );
    if (hasOldDireccion) {
      await knex.raw(`
        UPDATE personas_registradas 
        SET direccion = direccion_completa 
        WHERE direccion_completa IS NOT NULL AND direccion IS NULL;
      `);
    }
  } catch (error) {
    console.log('⚠️  Error restaurando datos de dirección:', error.message);
  }

  // Eliminar campos de geolocalización de personas_registradas
  await knex.schema.alterTable('personas_registradas', t => {
    t.dropColumns([
      'domicilio_latitud',
      'domicilio_longitud',
      'direccion_completa',
      'barrio',
      'localidad',
      'codigo_postal',
      'direccion_verificada',
    ]);

    if (hasPostGIS) {
      try {
        t.dropColumn('domicilio_geoposicion');
      } catch (error) {
        // Ignorar error si la columna no existe
      }
    }
  });

  // Eliminar campos de geolocalización de registros_delictuales
  await knex.schema.alterTable('registros_delictuales', t => {
    // Restaurar nombre de columna lugar
    try {
      const hasLugarTexto = knex.schema.hasColumn(
        'registros_delictuales',
        'lugar_delito_texto'
      );
      if (hasLugarTexto) {
        t.renameColumn('lugar_delito_texto', 'lugar');
      }
    } catch (error) {
      console.log('⚠️  Error restaurando nombre columna lugar:', error.message);
    }

    t.dropColumns([
      'hecho_latitud',
      'hecho_longitud',
      'hecho_direccion',
      'hecho_barrio',
      'hecho_localidad',
      'hecho_verificado',
    ]);

    if (hasPostGIS) {
      try {
        t.dropColumn('hecho_geoposicion');
      } catch (error) {
        // Ignorar error si la columna no existe
      }
    }
  });

  console.log('✅ Rollback de campos de geolocalización completado');
};
