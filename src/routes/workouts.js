const express = require('express');
const { workoutsController } = require('../controllers');
const { asyncHandler } = require('../middleware/errorHandlers/asyncHandler');
const { checkAuth } = require('../middleware/checkAuth');
const { checkUserById } = require('../middleware/checkUserExistence');
const { validateRequiredFields } = require('../middleware/validators/users');

const router = express.Router();

router.post(
  'select-activity',
  checkAuth,
);

// router.post(
//   '/create',
//   checkAuth,
//   checkUserById,
//   validateRequiredFields(['activity_id', 'duration']),
//   asyncHandler(workoutsController.createWorkout),
// );

module.exports = router;
