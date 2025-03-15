const { body } = require('express-validator');
const { passwordMatch } = require('../../handlers/stringPatternsMatch');

const validateEmail = body('email')
  .normalizeEmail()
  .isEmail()
  .withMessage('Email should be in the format `username@example.com`');

const validatePassword = body('password')
  .custom(passwordMatch)
  .withMessage('Password should be 6 - 12 characters, contain uppercase and lowercase letters, special characters and digits');

module.exports = {
  validateEmail,
  validatePassword,
};
