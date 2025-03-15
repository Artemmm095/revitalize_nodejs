const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

// eslint-disable-next-line consistent-return
const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      country,
      avatar = null,
    } = req.body;

    const { rowCount } = await db.users.create({
      firstName,
      lastName,
      email,
      password: await bcrypt.hash(password, 10),
      country,
      avatar,
    });

    if (rowCount > 0) {
      return res.status(201).send({ message: 'User created' });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const rows = await db.users.getAll();

    if (!rows.length) {
      return res.status(404).json({ message: 'Not found' });
    }

    return res.status(200).json({ users: rows });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// eslint-disable-next-line consistent-return
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.users.getByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      },
    );

    return res.status(200).json({
      message: 'Authorization successful',
      token,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const editProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      country,
    } = req.body;
    const { userId } = req.params;

    const user = await db.users.getById(userId);

    await db.users.updateProfile({
      userId,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      country: country || user.country,
    });

    return res.status(200).json({ message: 'Profile edited' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.params;

    const user = await db.users.getById(userId);

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    await db.users.updatePassword({
      userId,
      password: await bcrypt.hash(newPassword, 10),
    });

    return res.status(200).json({ message: 'Password updated' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const { userId } = req.params;

    await db.users.updateAvatar({
      userId,
      avatar,
    });

    return res.status(200).json({ message: 'Avatar updated' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// const passwordRecovery = async (req, res) => {
//   try {
//     //
//   } catch (e) {
//     // eslint-disable-next-line no-console
//     console.error(e);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  editProfile,
  updatePassword,
  updateAvatar,
};
