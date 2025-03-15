const db = require('../database');

// eslint-disable-next-line consistent-return
const checkUserExistence = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await db.users.getById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  checkUserExistence,
};
