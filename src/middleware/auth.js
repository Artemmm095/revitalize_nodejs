const jwt = require('jsonwebtoken');
const { extractToken } = require('../handlers/extractToken');

// eslint-disable-next-line consistent-return
const auth = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    // eslint-disable-next-line consistent-return
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }

      req.user = user;
      next();
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  auth,
};
