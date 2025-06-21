const express = require('express');
const usersRouter = require('./users');
const workoutsRouter = require('./workouts');

const router = express.Router();

router.use('/users', usersRouter);
router.use('/workouts', workoutsRouter);

module.exports = router;
