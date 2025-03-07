const { db } = require('./db');

const create = (data) => db('users').insert({
  first_name: data.firstName,
  last_name: data.lastName,
  email: data.email,
  password: data.password,
  country: data.country,
}).returning('*');

const getAll = () => db('users');

const getById = (userId) => db('users')
  .where('user_id', userId).first();

const getByEmail = (email) => db('users')
  .where('email', email).first();

module.exports = {
  create,
  getAll,
  getById,
  getByEmail,
};
