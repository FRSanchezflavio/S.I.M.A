/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable('usuarios', t => {
    t.integer('token_version').notNullable().defaultTo(0);
  });

  await knex.schema.alterTable('personas_registradas', t => {
    t.timestamp('deleted_at').nullable().index();
  });
  await knex.schema.alterTable('registros_delictuales', t => {
    t.timestamp('deleted_at').nullable().index();
  });

  await knex.schema.createTable('audit_logs', t => {
    t.increments('id').primary();
    t.integer('user_id').unsigned().references('id').inTable('usuarios');
    t.string('action').notNullable();
    t.string('entity').notNullable();
    t.integer('entity_id').unsigned().nullable();
    t.jsonb('payload').defaultTo(knex.raw("'{}'::jsonb"));
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index(['entity', 'entity_id']);
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.alterTable('registros_delictuales', t =>
    t.dropColumn('deleted_at')
  );
  await knex.schema.alterTable('personas_registradas', t =>
    t.dropColumn('deleted_at')
  );
  await knex.schema.alterTable('usuarios', t => t.dropColumn('token_version'));
};
