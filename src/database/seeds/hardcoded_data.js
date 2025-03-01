/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.seed = async (knex) => {
  await knex('activities_metrics').del();
  await knex('metrics').del();
  await knex('activities').del();

  await knex('activities').insert([
    { activity_id: 1, name: 'Running' },
    { activity_id: 2, name: 'Walking' },
    { activity_id: 3, name: 'Cycling' },
  ]);
  await knex('metrics').insert([
    { metric_id: 1, name: 'distance', units: 'km' },
    { metric_id: 2, name: 'avg speed', units: 'km/h' },
  ]);
  await knex('activities_metrics').insert([
    { activity_id: 1, metric_id: 1 },
    { activity_id: 1, metric_id: 2 },
    { activity_id: 2, metric_id: 1 },
    { activity_id: 2, metric_id: 2 },
    { activity_id: 3, metric_id: 1 },
    { activity_id: 3, metric_id: 2 },
  ]);
};
