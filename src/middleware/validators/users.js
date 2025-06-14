const { body } = require('express-validator');
const { passwordMatch } = require('../../utils/stringPatternsMatch');

const validateEmail = body('email')
  .optional({ checkFalsy: true })
  .normalizeEmail()
  .isEmail()
  .withMessage('Email should be in the format `username@example.com`');

const validatePassword = body('password')
  .custom(passwordMatch)
  .withMessage('Password should be 6 - 12 characters, contain uppercase and lowercase letters, special characters and digits');

const validateRequiredFields = (fields) => fields.map(
  (field) => body(field)
    .optional()
    .notEmpty()
    .withMessage('One or more required fields are empty'),
);

module.exports = {
  validateEmail,
  validatePassword,
  validateRequiredFields,
};
