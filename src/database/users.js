const { db } = require('./db');

const create = (data) => db.raw(
  `INSERT INTO users 
         (first_name, last_name, email, password, country)
       VALUES
         (:firstName, :lastName, :email, :password, :country)`,
  {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    country: data.country,
  },
);

const getAll = () => db.select('*').from('users');

const getById = (userId) => db.select('*').from('users')
  .where('user_id', userId).first();

const getByEmail = (email) => db.select('*').from('users')
  .where('email', email).first();

module.exports = {
  create,
  getAll,
  getById,
  getByEmail,
};
