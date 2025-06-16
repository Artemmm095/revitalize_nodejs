const { db } = require('./db');

const create = (data) => db('users').insert({
  first_name: data.firstName,
  last_name: data.lastName,
  email: data.email,
  password: data.password,
  country: data.country,
});

const getAll = () => db('users');

const getById = (userId) => db('users')
  .where({ user_id: userId }).first();

const getByEmail = (email) => db('users')
  .where({ email }).first();

const updateProfile = (data) => db('users')
  .where({ user_id: data.userId })
  .update({
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    country: data.country,
    updated_at: db.fn.now(),
  });

const updatePassword = (data) => db('users')
  .where({ user_id: data.userId })
  .update({
    password: data.password,
  });

const updateAvatar = (data) => db('users')
  .where({ user_id: data.userId })
  .update({
    avatar: data.avatar,
  });

const revokeToken = (data) => db('revoked_tokens').insert({
  token: data,
});

module.exports = {
  create,
  getAll,
  getById,
  getByEmail,
  updateProfile,
  updatePassword,
  updateAvatar,
  revokeToken,
};
