const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { sendEmail } = require('../utils/emailService');
const { extractToken } = require('../utils/extractToken');

// eslint-disable-next-line consistent-return
const createUser = async (req, res) => {
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
};

const getAllUsers = async (req, res) => {
  const rows = await db.users.getAll();

  if (!rows.length) {
    return res.status(404)
      .json({ message: 'Not found' });
  }

  return res.status(200)
    .json({ users: rows });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await db.users.getByEmail(email);

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
};

const updateProfile = async (req, res) => {
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
};

const updatePassword = async (req, res) => {
  const { currentPassword, password } = req.body;
  const { userId } = req.params;

  const user = await db.users.getById(userId);

  const currentPasswordMatch = await bcrypt.compare(currentPassword, user.password);
  const newPasswordMatch = await bcrypt.compare(password, user.password);

  if (!currentPasswordMatch) {
    return res.status(400)
      .json({ message: 'Current password is incorrect' });
  }

  if (newPasswordMatch) {
    return res.status(400)
      .json({ message: 'New password should not match with the current one' });
  }

  await db.users.updatePassword({
    userId,
    password: await bcrypt.hash(password, 10),
  });

  return res.status(200)
    .json({ message: 'Password updated' });
};

const updateAvatar = async (req, res) => {
  const { avatar } = req.body;
  const { userId } = req.params;

  await db.users.updateAvatar({
    userId,
    avatar,
  });

  return res.status(200)
    .json({ message: 'Avatar updated' });
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const isTest = process.env.NODE_ENV === 'test';

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
  <p>Revitalize Fitness App</p>
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
      ...(isTest && { token }),
    });
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { userId } = req.user;

  await db.users.updatePassword({
    userId,
    password: await bcrypt.hash(password, 10),
  });

  return res.status(200)
    .json({ message: 'Password has been successfully reset' });
};

const logout = async (req, res) => {
  const token = extractToken(req);

  await db.users.revokeToken(token);

  return res.status(200)
    .json({ message: 'Logout successful' });
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
  logout,
};
