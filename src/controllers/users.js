const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { sendEmail } = require('../utils/emailService');
const { extractToken } = require('../utils/extractToken');

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
      return res.status(201)
        .json({ message: 'User created' });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500)
      .json({ message: 'Internal server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const rows = await db.users.getAll();

    if (!rows.length) {
      return res.status(404)
        .json({ message: 'Not found' });
    }

    return res.status(200)
      .json({ users: rows });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500)
      .json({ message: 'Internal server error' });
  }
};

// eslint-disable-next-line consistent-return
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.users.getByEmail(email);

    if (!user) {
      return res.status(404)
        .json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400)
        .json({ message: 'Incorrect password' });
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

    return res.status(200)
      .json({
        message: 'Authorization successful',
        token,
      });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500)
      .json({ message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
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

    return res.status(200)
      .json({ message: 'Profile updated' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500)
      .json({ message: 'Internal server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.params;

    const user = await db.users.getById(userId);

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(400)
        .json({ message: 'Current password is incorrect' });
    }

    await db.users.updatePassword({
      userId,
      password: await bcrypt.hash(newPassword, 10),
    });

    return res.status(200)
      .json({ message: 'Password updated' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500)
      .json({ message: 'Internal server error' });
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

    return res.status(200)
      .json({ message: 'Avatar updated' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500)
      .json({ message: 'Internal server error' });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await db.users.getByEmail(email);

    const token = jwt.sign(
      {
        userId: user.user_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m',
      },
    );

    const passwordResetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const plainTextMessage = `Follow the link below to reset your password:
    ${passwordResetLink}
    If you didn’t request a password reset, ignore this email.`;

    const htmlMessage = `
    <p>Follow the link below to reset your password:</p>
    <p><a href="${passwordResetLink}">${passwordResetLink}</a></p>
    <p>If you didn’t request a password reset, ignore this email.</p>`;

    await sendEmail(
      email,
      'Password reset',
      plainTextMessage,
      htmlMessage,
    );

    return res.status(200)
      .json({
        message: 'The password reset letter has been sent to your inbox',
      });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500)
      .json({ message: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const token = extractToken(req);

    if (!token) {
      return res.status(401)
        .json({ message: 'No permission' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decodedToken;

    const user = await db.users.getById(userId);

    if (!user) {
      return res.status(403)
        .json({ message: 'Invalid or expired token' });
    }

    await db.users.updatePassword({
      userId,
      password: await bcrypt.hash(password, 10),
    });

    return res.status(200)
      .json({ message: 'Password has been successfully reset' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500)
      .json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  updateProfile,
  updatePassword,
  updateAvatar,
  requestPasswordReset,
  resetPassword,
};
