const configs = require('../../knexfile');
// eslint-disable-next-line import/order
const db = require('knex')(configs[process.env.NODE_ENV || 'development']);

module.exports = {
  db,
};
