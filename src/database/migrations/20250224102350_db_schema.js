/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = (knex) => knex.schema
  .createTable('users', (table) => {
    table.increments('user_id');
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('country').notNullable();
    table.text('avatar');
    table.timestamps(true, true);
  })
  .createTable('activities', (table) => {
    table.increments('activity_id');
    table.string('name').notNullable().unique();
  })
  .createTable('metrics', (table) => {
    table.increments('metric_id');
    table.string('name').notNullable().unique();
    table.string('units').notNullable();
  })
  .createTable('activities_metrics', (table) => {
    table.integer('activity_id').unsigned().notNullable()
      .references('activity_id')
      .inTable('activities')
      .onDelete('CASCADE');
    table.integer('metric_id').unsigned().notNullable()
      .references('metric_id')
      .inTable('metrics')
      .onDelete('CASCADE');
    table.primary(['activity_id', 'metric_id']);
  })
  .createTable('workouts', (table) => {
    table.increments('workout_id');
    table.integer('user_id').unsigned().notNullable()
      .references('user_id')
      .inTable('users')
      .onDelete('CASCADE');
    table.integer('activity_id').unsigned().notNullable()
      .references('activity_id')
      .inTable('activities')
      .onDelete('CASCADE');
    table.string('title');
    table.text('commentary');
    table.time('duration', 0).notNullable();
    table.timestamps(true, true);
  })
  .createTable('workouts_metrics', (table) => {
    table.integer('workout_id').unsigned().notNullable()
      .references('workout_id')
      .inTable('workouts')
      .onDelete('CASCADE');
    table.integer('metric_id').unsigned().notNullable()
      .references('metric_id')
      .inTable('metrics')
      .onDelete('CASCADE');
    table.decimal('metric_value', 10, 2).notNullable();
    table.primary(['workout_id', 'metric_id']);
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = (knex) => knex.schema
  .dropTable('workouts_metrics')
  .dropTable('workouts')
  .dropTable('activities_metrics')
  .dropTable('activities')
  .dropTable('metrics')
  .dropTable('users');
