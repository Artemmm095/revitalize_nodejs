const db = require('../database');

// eslint-disable-next-line consistent-return
const checkUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await db.users.getById(userId);

    if (!user) {
      return res.status(404)
        .json({ message: 'User not found' });
    }

    next();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500)
      .json({ message: 'Internal server error' });
  }
};

// eslint-disable-next-line consistent-return
const checkUserByEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await db.users.getByEmail(email);

    if (!user) {
      return res.status(404)
        .json({ message: 'User not found' });
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
  checkUserById,
  checkUserByEmail,
};
