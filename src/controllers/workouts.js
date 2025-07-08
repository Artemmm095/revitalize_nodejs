const db = require('../database');

const createWorkout = async (req, res) => {
  const {
    activityId,
    title,
    commentary,
    duration,
    metricValue,
  } = req.body;
  const { userId } = req.user;

  await db.workouts.insertActivityType({
    userId,
    activityId,
  });

  const workout = await db.workouts.getWorkout();
  const workoutId = workout.workout_id;

  await db.workouts.insertConstantWorkoutData({
    workoutId,
    title,
    commentary,
    duration,
  });

  await db.workouts.insertSpecificMetrics({
    //
  });

  return res.status(201)
    .json({ message: 'Workout created' });
};

module.exports = {
  selectActivity,
  // createWorkout,
};
