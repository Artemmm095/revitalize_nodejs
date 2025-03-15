const express = require('express');
const { usersController } = require('../controllers');
const { checkAuth } = require('../middleware/checkAuth');
const { checkUserExistence } = require('../middleware/checkUserExistence');
const { validateEmail, validatePassword } = require('../middleware/validators/users');
const { handleUniquenessConstraint } = require('../middleware/handleUniquenessConstraint');

const router = express.Router();

router.post(
  '/create',
  validateEmail,
  validatePassword,
  handleUniquenessConstraint,
  usersController.createUser,
);

router.get(
  '/',
  usersController.getAllUsers,
);

router.post(
  '/login',
  validateEmail,
  validatePassword,
  usersController.loginUser,
);

router.patch(
  '/:userId/editProfile',
  checkAuth,
  checkUserExistence,
  validateEmail,
  handleUniquenessConstraint,
  usersController.editProfile,
);

router.patch(
  '/:userId/updatePassword',
  checkAuth,
  checkUserExistence,
  validatePassword,
  usersController.updatePassword,
);

router.patch(
  '/:userId/updateAvatar',
  checkAuth,
  checkUserExistence,
  usersController.updateAvatar,
);

module.exports = router;
