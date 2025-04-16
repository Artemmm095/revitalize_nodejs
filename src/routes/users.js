const express = require('express');
const { usersController } = require('../controllers');
const { asyncHandler } = require('../middleware/errorHandlers/asyncHandler');
const { checkAuth } = require('../middleware/checkAuth');
const { verifyPasswordResetToken } = require('../middleware/verifyPasswordResetToken');
const { checkUserById, checkUserByEmail } = require('../middleware/checkUserExistence');
const { validateEmail, validatePassword } = require('../middleware/validators/users');
const {
  emptyFieldsHandler,
  uniquenessConstraintHandler,
} = require('../middleware/errorHandlers/fieldsErrorHandlers');

const router = express.Router();

router.post(
  '/create',
  validateEmail,
  validatePassword,
  asyncHandler(usersController.createUser),
);

router.get(
  '/',
  asyncHandler(usersController.getAllUsers),
);

router.post(
  '/login',
  validateEmail,
  validatePassword,
  checkUserByEmail,
  asyncHandler(usersController.loginUser),
);

router.patch(
  '/:userId/update-profile',
  checkAuth,
  checkUserById,
  validateEmail,
  asyncHandler(usersController.updateProfile),
);

router.patch(
  '/:userId/update-password',
  checkAuth,
  checkUserById,
  validatePassword,
  asyncHandler(usersController.updatePassword),
);

router.patch(
  '/:userId/update-avatar',
  checkAuth,
  checkUserById,
  asyncHandler(usersController.updateAvatar),
);

router.post(
  '/request-password-reset',
  validateEmail,
  checkUserByEmail,
  asyncHandler(usersController.requestPasswordReset),
);

router.patch(
  '/reset-password',
  verifyPasswordResetToken,
  checkUserById,
  validatePassword,
  asyncHandler(usersController.resetPassword),
);

router.use(emptyFieldsHandler);
router.use(uniquenessConstraintHandler);

module.exports = router;
