const express = require('express');
const { usersController } = require('../controllers');
const { asyncHandler } = require('../middleware/errorHandlers/asyncHandler');
const { checkAuth } = require('../middleware/checkAuth');
const { verifyPasswordResetToken } = require('../middleware/verifyPasswordResetToken');
const { checkUserIDMatch } = require('../middleware/checkUserIDMatch');
const { checkUserById, checkUserByEmail } = require('../middleware/checkUserExistence');
const {
  validateRequiredFields,
  validateEmail,
  validatePassword,
} = require('../middleware/validators/users');
const { validationErrorHandler } = require('../middleware/errorHandlers/validationErrorHandler');
const { emailUniquenessConstraintHandler } = require('../middleware/errorHandlers/fieldsErrorHandlers');

const router = express.Router();

router.post(
  '/create',
  validateRequiredFields(['firstName', 'lastName', 'email', 'password', 'country']),
  validateEmail,
  validatePassword,
  validationErrorHandler,
  asyncHandler(usersController.createUser),
);

router.get(
  '/',
  asyncHandler(usersController.getAllUsers),
);

router.post(
  '/login',
  validateRequiredFields(['email', 'password']),
  validateEmail,
  validatePassword,
  validationErrorHandler,
  checkUserByEmail,
  asyncHandler(usersController.loginUser),
);

router.patch(
  '/:userId/update-profile',
  checkAuth,
  checkUserById,
  checkUserIDMatch,
  validateRequiredFields(['firstName', 'lastName', 'email', 'country']),
  validateEmail,
  validationErrorHandler,
  asyncHandler(usersController.updateProfile),
);

router.patch(
  '/:userId/update-password',
  checkAuth,
  checkUserById,
  checkUserIDMatch,
  validateRequiredFields(['currentPassword', 'password']),
  validatePassword,
  validationErrorHandler,
  asyncHandler(usersController.updatePassword),
);

router.patch(
  '/:userId/update-avatar',
  checkAuth,
  checkUserById,
  checkUserIDMatch,
  validateRequiredFields(['avatar']),
  validationErrorHandler,
  asyncHandler(usersController.updateAvatar),
);

router.post(
  '/request-password-reset',
  validateRequiredFields(['email']),
  validateEmail,
  validationErrorHandler,
  checkUserByEmail,
  asyncHandler(usersController.requestPasswordReset),
);

router.post(
  '/reset-password',
  verifyPasswordResetToken,
  checkUserById,
  validateRequiredFields(['password']),
  validatePassword,
  validationErrorHandler,
  asyncHandler(usersController.resetPassword),
);

router.post(
  '/logout',
  checkAuth,
  asyncHandler(usersController.logout),
);

router.use(emailUniquenessConstraintHandler);

module.exports = router;
