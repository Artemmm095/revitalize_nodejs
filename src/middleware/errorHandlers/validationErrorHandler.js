const { validationResult } = require('express-validator');

// eslint-disable-next-line consistent-return
const validationErrorHandler = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500)
      .json({ message: 'Internal server error' });
  }
};

module.exports = {
  validationErrorHandler,
};
