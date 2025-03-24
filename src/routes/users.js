const express = require('express');
const { usersController } = require('../controllers');
const { checkAuth } = require('../middleware/checkAuth');
const { checkUserById, checkUserByEmail } = require('../middleware/checkUserExistence');
const { validateEmail, validatePassword } = require('../middleware/validators/users');
const { handleUniquenessConstraint } = require('../middleware/handleUniquenessConstraint');

const router = express.Router();

router.post(
  '/create',
  validateEmail,
  validatePassword,
  // handleUniquenessConstraint,
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
  checkUserByEmail,
  usersController.loginUser,
);

router.patch(
  '/:userId/editProfile',
  checkAuth,
  checkUserById,
  validateEmail,
  // handleUniquenessConstraint,
  usersController.updateProfile,
);

router.patch(
  '/:userId/updatePassword',
  checkAuth,
  checkUserById,
  validatePassword,
  usersController.updatePassword,
);

router.patch(
  '/:userId/updateAvatar',
  checkAuth,
  checkUserById,
  usersController.updateAvatar,
);

router.post();

router.patch();

router.use(handleUniquenessConstraint);

module.exports = router;
