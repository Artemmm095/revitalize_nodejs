const express = require('express');
const { usersController } = require('../controllers');
const { checkAuth } = require('../middleware/checkAuth');
const { verifyPasswordResetToken } = require('../middleware/verifyPasswordResetToken');
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
  '/:userId/update-profile',
  checkAuth,
  checkUserById,
  validateEmail,
  // handleUniquenessConstraint,
  usersController.updateProfile,
);

router.patch(
  '/:userId/update-password',
  checkAuth,
  checkUserById,
  validatePassword,
  usersController.updatePassword,
);

router.patch(
  '/:userId/update-avatar',
  checkAuth,
  checkUserById,
  usersController.updateAvatar,
);

router.post(
  '/request-password-reset',
  validateEmail,
  checkUserByEmail,
  usersController.requestPasswordReset,
);

router.patch(
  '/reset-password',
  verifyPasswordResetToken,
  checkUserById,
  validatePassword,
  usersController.resetPassword,
);

router.use(handleUniquenessConstraint);

module.exports = router;
