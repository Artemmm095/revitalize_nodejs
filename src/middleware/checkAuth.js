const jwt = require('jsonwebtoken');
const { extractToken } = require('../utils/extractToken');

// eslint-disable-next-line consistent-return
const checkAuth = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401)
      .json({ message: 'Unauthorized user' });
  }

  // eslint-disable-next-line consistent-return
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403)
          .json({ message: 'Expired authorization token' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(403)
          .json({ message: 'Invalid authorization token' });
      }
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500)
        .json({ message: 'Internal server error' });
    }

    req.user = user;
    next();
  });
};

module.exports = {
  checkAuth,
};
