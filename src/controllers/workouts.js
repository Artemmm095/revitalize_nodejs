const db = require('../database');

const selectActivity = async (req, res) => {
  const { activityId } = req.body;
  const { userId } = req.user;

  await db.workouts.insertActivityType({
    userId,
    activityId,
  });

  return res.status(200);
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
