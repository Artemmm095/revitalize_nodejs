const { validationResult } = require('express-validator');

// eslint-disable-next-line consistent-return
const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];

    return res.status(400).json({ message: firstError.msg });
  }

  next();
};

module.exports = {
  validationErrorHandler,
};
