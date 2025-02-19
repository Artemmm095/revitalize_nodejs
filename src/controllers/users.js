const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const {
  validateEmail,
  validatePassword,
} = require('../handlers/validation');

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

    const isValidEmail = validateEmail(email);
    const isValidPassword = validatePassword(password);

    if (!isValidEmail) {
      return res
        .status(400)
        .json({ message: 'Email should be in the format `username@example.com`' });
    }
    if (!isValidPassword) {
      return res
        .status(400)
        .json({
          message: 'Password should be 6 - 12 characters, contain uppercase and lowercase letters, special characters and digits',
        });
    }

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
    if (e.code === '23505') {
      return res
        .status(400)
        .json({ message: 'User with provided email already exists' });
    }
  }
};

// eslint-disable-next-line consistent-return
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
  }
};

// eslint-disable-next-line consistent-return
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // const isValidEmail = validateEmail(email); ??? Is email validation needed in loginUser?
    const user = await db.users.getByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User is not found' });
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
  }
};

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
};
