const db = require('../database');

// eslint-disable-next-line consistent-return
const checkUserById = async (req, res, next) => {
  const { userId } = (req.params.userId) ? req.params : req.user;

  const user = await db.users.getById(userId);

  if (!user) {
    return res.status(404)
      .json({ message: 'User not found' });
  }

  next();
};

// eslint-disable-next-line consistent-return
const checkUserByEmail = async (req, res, next) => {
  const { email } = req.body;

  const user = await db.users.getByEmail(email);

  if (!user) {
    return res.status(404)
      .json({ message: 'User not found' });
  }

  next();
};

module.exports = {
  checkUserById,
  checkUserByEmail,
};
