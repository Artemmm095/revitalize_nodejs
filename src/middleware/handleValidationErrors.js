const { validationResult } = require('express-validator');

// eslint-disable-next-line consistent-return
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

module.exports = {
  handleValidationErrors,
};
