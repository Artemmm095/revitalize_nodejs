const { db } = require('./db');

const insertActivityType = (data) => db('workouts').insert({
  user_id: data.userId,
  activity_id: data.activityId,
});

const insertConstantWorkoutData = (data) => db('workouts')
  .where({ workout_id: data.workoutId })
  .insert({
    title: data.title,
    commentary: data.commentary,
    duration: data.duration,
  });

const insertSpecificMetrics = (data) => db('workouts_metrics')
  .insert({
    workout_id: data.workoutId,
    metric_id: data.metricId,
    metric_value: data.metricValue,
  });

const getlastWorkout = () => db('workouts')
  .orderBy('created_at', 'desc').first();

// // const update = (data) => db('workouts').update({});
// const update = (data) => db.raw(
//   `UPDATE workouts
//      SET title = :title,
//        commentary = :commentary,
//        duration = :duration,
//        updated_at = NOW()
//      WHERE workout_id = :workoutId`
// {
//   title: data.title,
//     commentary: data.commentary,
//   duration: data.duration,
//   workoutId: data.workoutId,
// },
// );
//
// // const updateMetric =
//
// const getAllByLatest = (userId) => db('workouts')
//   .where({ 'user_id': userId })
//   .orderBy('created_at', desc);
// const getAllByOldest = (userId) => db('workouts')
//   .where({ 'user_id': userId })
//   .orderBy('created_at');

module.exports = {
  insertActivityType,
  insertConstantWorkoutData,
  insertSpecificMetrics,
  getLastWorkout,
  // getWorkout,
  // update,
  // getAllByLatest,
  // getAllByOldest,
};
