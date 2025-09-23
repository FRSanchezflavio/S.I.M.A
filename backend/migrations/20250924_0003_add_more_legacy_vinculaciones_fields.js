/**
 * Migración: Agregar columnas legadas adicionales para compatibilidad con controladores
 * Añade columnas frecuentemente usadas por `vinculaciones.controller.js` si no existen.
 */

exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('vinculaciones_criminales');
  if (!exists) return Promise.resolve();

  await knex.schema.alterTable('vinculaciones_criminales', table => {
    // Booleans
    if (!table.hasColumn || true) {
      // knex.js does not expose a per-column check in this context synchronously,
      // we'll perform existence checks below per column using hasColumn.
    }
  });

  // Add columns only if they don't exist
  const colsToAdd = [
    {
      name: 'alertas_automaticas',
      type: 'boolean',
      opts: { defaultTo: false },
    },
    { name: 'es_bidireccional', type: 'boolean', opts: { defaultTo: true } },
    {
      name: 'fuerza_vinculacion',
      type: 'string',
      opts: { length: 50, defaultTo: 'moderada' },
    },
    {
      name: 'impacto_investigacion',
      type: 'string',
      opts: { length: 50, defaultTo: 'moderado' },
    },
    {
      name: 'requiere_seguimiento',
      type: 'boolean',
      opts: { defaultTo: false },
    },
    {
      name: 'riesgo_operacional',
      type: 'string',
      opts: { length: 50, defaultTo: 'medio' },
    },
    {
      name: 'score_importancia',
      type: 'decimal',
      opts: { precision: 5, scale: 4, defaultTo: 0 },
    },
    {
      name: 'es_vinculacion_inversa',
      type: 'boolean',
      opts: { defaultTo: false },
    },
    {
      name: 'vinculacion_principal_id',
      type: 'integer',
      opts: { unsigned: true },
    },
    { name: 'subtipo_detalle', type: 'string', opts: { length: 100 } },
    { name: 'descripcion', type: 'text' },
    { name: 'frecuencia_contacto', type: 'string', opts: { length: 50 } },
    { name: 'fecha_primer_contacto', type: 'date' },
    { name: 'fecha_ultimo_contacto', type: 'date' },
    { name: 'fecha_confirmacion', type: 'date' },
    { name: 'metodos_comunicacion', type: 'jsonb' },
    { name: 'lugares_encuentro', type: 'jsonb' },
    { name: 'testigos_vinculacion', type: 'jsonb' },
    { name: 'evidencias_materiales', type: 'jsonb' },
    { name: 'fuente_informacion', type: 'string', opts: { length: 200 } },
    { name: 'investigador_asignado', type: 'string', opts: { length: 100 } },
    { name: 'geolocalizacion_encuentros', type: 'jsonb' },
    { name: 'analisis_temporal', type: 'jsonb' },
    { name: 'contexto_descubrimiento', type: 'text' },
    { name: 'observaciones_investigacion', type: 'text' },
  ];

  for (const col of colsToAdd) {
    const has = await knex.schema.hasColumn(
      'vinculaciones_criminales',
      col.name
    );
    if (!has) {
      await knex.schema.alterTable('vinculaciones_criminales', table => {
        let c;
        switch (col.type) {
          case 'boolean':
            c = table.boolean(col.name);
            break;
          case 'string':
            c = table.string(
              col.name,
              col.opts && col.opts.length ? col.opts.length : 255
            );
            break;
          case 'text':
            c = table.text(col.name);
            break;
          case 'date':
            c = table.date(col.name);
            break;
          case 'jsonb':
            c = table.jsonb(col.name);
            break;
          case 'decimal':
            c = table.decimal(
              col.name,
              col.opts && col.opts.precision ? col.opts.precision : 8,
              col.opts && col.opts.scale ? col.opts.scale : 2
            );
            break;
          case 'integer':
            c = table.integer(col.name).unsigned();
            break;
          default:
            c = table.specificType(col.name, col.type);
        }

        if (
          col.opts &&
          Object.prototype.hasOwnProperty.call(col.opts, 'defaultTo')
        ) {
          c.defaultTo(col.opts.defaultTo);
        }
      });
    }
  }

  // Add foreign key for vinculacion_principal_id if column added and FK not present
  // Nota: no intentamos crear la FK explícita aquí para evitar conflictos si la columna ya se creó
};

exports.down = async function (knex) {
  const exists = await knex.schema.hasTable('vinculaciones_criminales');
  if (!exists) return Promise.resolve();

  const cols = [
    'alertas_automaticas',
    'es_bidireccional',
    'fuerza_vinculacion',
    'impacto_investigacion',
    'requiere_seguimiento',
    'riesgo_operacional',
    'score_importancia',
    'es_vinculacion_inversa',
    'vinculacion_principal_id',
    'subtipo_detalle',
    'descripcion',
    'frecuencia_contacto',
    'fecha_primer_contacto',
    'fecha_ultimo_contacto',
    'fecha_confirmacion',
    'metodos_comunicacion',
    'lugares_encuentro',
    'testigos_vinculacion',
    'evidencias_materiales',
    'fuente_informacion',
    'investigador_asignado',
    'geolocalizacion_encuentros',
    'analisis_temporal',
    'contexto_descubrimiento',
    'observaciones_investigacion',
  ];

  for (const col of cols) {
    const has = await knex.schema.hasColumn('vinculaciones_criminales', col);
    if (has) {
      await knex.schema.alterTable('vinculaciones_criminales', table => {
        table.dropColumn(col);
      });
    }
  }
};
