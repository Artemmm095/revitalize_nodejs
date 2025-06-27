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
  
  /// const workout = await db.workouts.getWorkout()

  return res.status(201)
    .json({ message: 'Workout created' });
};

// const createWorkout = async (req, res) => {
//   const {
//     activityId,
//     title,
//     commentary,
//     duration,
//     metricValue,
//   } = req.body;
//   const { userId } = req.user;
//
//   const { rowCount } = await db.workouts.create({
//     //
//   });
// };

module.exports = {
  selectActivity,
  // createWorkout,
};
