const db = require('../database');

const createWorkout = async (req, res) => {
  const {
    activityId,
    title,
    commentary,
    duration,
  } = req.body;
  const { userId } = req.user;

  const { rowCount } = await db.workouts.create({
    //
  });
};

module.exports = {
  createWorkout,
};
